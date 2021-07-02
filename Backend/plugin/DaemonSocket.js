const logger = require('../util/logger');
const appConfig = require("../config/config");
const common = require('../controllers/common');
const http = require('http');
const ReverseSSH = require('./../util/ReverseSSH');
const storeModel = require('./../modals/store');
const util = require('./../util/util');
const moment = require('moment');
const Camera = require('../modals/camera');

let clients = {};

class DaemonSocket {
    static get Client() { return clients; }
    static get ClientAction() {
        return {
            start: 0,
            stop: 1,
            restart: 2,
            upgrade: 3
        };
    }

    static init = () => {
        let demonServer = http.createServer();
        demonServer.listen(process.env.daemonPort, () => {
            console.log('Daemon Server Started');
            logger.info("Daemon Server Started");
        });

        this.io = require("socket.io")(demonServer, {
            pingInterval: 15000,
            pingTimeout: 3000
        });

        this.io.on('connection', async (socket) => {
            let query = Object.assign({}, socket.client.request._query);
            let serialKey = query.serialKey;
            let daemonVersion = query.daemonVersion || null;

            if (daemonVersion) {
                await storeModel.findOneAndUpdate({ serialNumber: serialKey }, { $set: { daemonVersion: daemonVersion } });
            }

            logger.info(`Daemon Client Connection: ${serialKey}`);

            let encryptedValue = await common.sha256(serialKey + process.env.secretKey);
            let isValidRequest = query.token.toLowerCase() == encryptedValue.toLowerCase();
            if (!isValidRequest) {
                logger.debug("Daemon Client Auth Failed: " + serialKey);
                return socket.disconnect();
            }

            clients[query.serialKey] = socket;
            logger.debug("Daemon Clients : " + Object.keys(this.Client));

            socket.on('disconnect', this.onDisconnect.bind(this, serialKey));
            socket.on('error', this.onError.bind(serialKey));
            socket.on('message', this.onMessage.bind(serialKey));
            socket.on('ssh-add', this.onSshAdd.bind(serialKey));
            socket.on('check-ssh-connection', this.checkSSHConnection.bind(serialKey));
            socket.on('get-ssh-key', this.onGetSSHKey.bind(this, serialKey));
        });
    }

    static checkSSHConnection = async (key) => {
        let serialKey = key.serialKey;
        let storeInfo = await storeModel.findOne({ serialNumber: serialKey });
        if (storeInfo) {

            //Reverse SSH for SSH Connection
            let isExpired = util.isNull(storeInfo.sshConnStartTime) && util.isNull(storeInfo.sshConnEndTime) && util.isNull(storeInfo.sshPort);
            if (!isExpired) {
                let sshConnStartTime = moment(storeInfo.sshConnStartTime);
                let sshConnEndTime = moment(storeInfo.sshConnEndTime);
                isExpired = !moment().isBetween(sshConnStartTime, sshConnEndTime);
            }

            if (!isExpired) {
                ReverseSSH.portMapToLocal(storeInfo.sshPort);
                this.send(serialKey, { port: storeInfo.sshPort, action: 'StartSSH', sshLocalServerPort: storeInfo.sshLocalServerPort });
            }

            //Reverse SSH for VNC Connection
            let isVNCExpired = util.isNull(storeInfo.vncConnStartTime) && util.isNull(storeInfo.vncConnEndTime) && util.isNull(storeInfo.vncPort);
            if (!isVNCExpired) {
                let vncConnStartTime = moment(storeInfo.vncConnStartTime);
                let vncConnEndTime = moment(storeInfo.vncConnEndTime);
                isVNCExpired = !moment().isBetween(vncConnStartTime, vncConnEndTime);
            }

            if (!isVNCExpired) {
                ReverseSSH.portMapToLocal(storeInfo.vncPort);
                this.send(serialKey, { port: storeInfo.vncPort, action: 'StartVNC', vncLocalServerPort: storeInfo.vncLocalServerPort });
            }
        }
    }

    static onGetSSHKey = async (serialKey) => {
        try {
            if (ReverseSSH.privateKey) {
                this.send(serialKey, {
                    action: "UpdateSSHKey",
                    privateKey: ReverseSSH.privateKey
                });
            }
        } catch (ex) {
            logger.error("DemonSocket Client Disconnect", ex)
        }
    }

    static onDisconnect = async (serialKey) => {
        try {
            if (clients.hasOwnProperty(serialKey)) {
                let clt = clients[serialKey];
                let storeInfo = await storeModel.findOne({ serialNumber: serialKey });
                if (storeInfo && !util.isNull(storeInfo.sshPort)) {
                    this.send(serialKey, { action: "StopSSH" });
                    ReverseSSH.stopConnection(storeInfo.sshPort, serialKey, storeInfo.hasDedicatedPort);
                }

                if (storeInfo && !util.isNull(storeInfo.vncPort)) {
                    this.send(serialKey, { action: "StopVNC" });
                    ReverseSSH.stopConnection(storeInfo.vncPort, serialKey, storeInfo.hasDedicatedVNCPort, "VNC");
                }

                if (storeInfo) {
                    let cameraInfo = await Camera.find({ storeId: storeInfo._id });
                    for (let i = 0; i < cameraInfo.length; i++) {
                        const camera = cameraInfo[i];
                        // this.send(serialKey, { action: "StartCameraSSH" });
                        ReverseSSH.stopCameraConnection(camera.sshCameraPort, camera._id);
                    }

                }

                clt.disconnect();
                delete clients[serialKey];
            }
        } catch (ex) {
            logger.error("DemonSocket Client Disconnect", ex)
        }
    }

    static onError(evt) {
        try {
            if (clients.hasOwnProperty(this)) {
                let clt = clients[this];
                clt.disconnect();
                delete clients[this];
            }
        } catch (ex) {
            logger.error("DemonSocket Client onError", ex)
        }
    }

    static onSshAdd = async (params) => {
        // let publicKey = params.publicKey;
        // let record = await storeModel.findOne({ serialNumber: params.serialKey });
        // if (!record.isKeyAdded) {
        //     let isAdded = await ReverseSSH.addPublicKey(publicKey);
        //     if (isAdded) {
        //         await storeModel.updateOne({ serialNumber: params.serialKey }, { $set: { isKeyAdded: true } });
        //     }
        // }
        //ReverseSSH.addPublicKey(publicKey);
    }

    static onMessage = (params) => {
        logger.info("DemonSocket - OnMessage", params);
        switch (params.action) {
            case this.ClientAction.start:
                //TODO://Pending to implement
                break;

            case this.ClientAction.stop:
                //TODO://Pending to implement
                break;

            case this.ClientAction.upgrade:
                //TODO://Pending to implement
                break;

            default:
                break;
        }
    }

    static sendAction(serialKey, action) {
        let response = { success: false, message: 'Hub is not connected' }
        logger.debug("Daemon Clients : " + Object.keys(this.Client));
        if (clients.hasOwnProperty(serialKey)) {
            this.Client[serialKey].emit('action', action);
            response.success = true;
            response.message = "Your request Processed";
        }
        return response;
    }

    static isHubAvailable = (serialKey) => {
        return clients.hasOwnProperty(serialKey);
    }

    static send(serialKey, data) {
        let response = { success: false, message: 'Hub is not connected' }
        logger.debug("Daemon Clients : " + Object.keys(this.Client));
        if (clients.hasOwnProperty(serialKey)) {
            this.Client[serialKey].emit('message', data);
            response.success = true;
            response.message = "Your request Processed";
        }
        return response;
    }
}
module.exports = DaemonSocket;