const storeModel = require('./../../modals/store');
const cameraModel = require('./../../modals/camera');
const logger = require('../logger');
const ReverseSSH = require('./../ReverseSSH');
const DaemonSocket = require('./../../plugin/DaemonSocket');
const moment = require('moment');
const util = require('./../util');

class SSHConnection {
    constructor() {
        this._inProcess = false;
    }

    get InProcess() { return this._inProcess };
    set InProcess(val) { return this._inProcess = val };
    get IsDev() { return (process.env.NODE_ENV || 'development') == 'development' };

    Execute = async () => {
        if (this.InProcess) {
            logger.info(`SSHConnection Task already Started: ${new Date()}`);
            return
        }
        try {
            this.InProcess = true;
            logger.info(`SSHConnection Task Started: ${new Date()}`);

            let data = await storeModel.find({ sshPort: { $ne: null } });
            for (let index = 0; index < data.length; index++) {
                const item = data[index];
                let current = moment();
                if (util.isNull(item.sshConnStartTime) || util.isNull(item.sshConnEndTime)) {
                    continue;
                }
                let sshConnStartTime = moment(item.sshConnStartTime);
                let sshConnEndTime = moment(item.sshConnEndTime);
                logger.debug(`SSHConnectionTask StartDate: ${sshConnStartTime.toDate()} EndDate: ${sshConnEndTime.toDate()} Current: ${current.toDate()}`);
                if (!current.isBetween(sshConnStartTime, sshConnEndTime)) {
                    logger.debug(`SSHConnectionTask Stop Connection SerialNumber: ${item.serialNumber}`);
                    DaemonSocket.send(item.serialNumber, { action: "StopSSH" });
                    if (!util.isNull(item.sshPort)) {
                        ReverseSSH.stopConnection(item.sshPort, item.serialNumber, item.hasDedicatedPort);
                    }
                }
            }

            data = await storeModel.find({ vncPort: { $ne: null } });
            for (let index = 0; index < data.length; index++) {
                const item = data[index];
                let current = moment();
                if (util.isNull(item.vncConnStartTime) || util.isNull(item.vncConnEndTime)) {
                    continue;
                }
                let vncConnStartTime = moment(item.vncConnStartTime);
                let vncConnEndTime = moment(item.vncConnEndTime);
                logger.debug(`VNC Connection Task StartDate: ${vncConnStartTime.toDate()} EndDate: ${vncConnEndTime.toDate()} Current: ${current.toDate()}`);
                if (!current.isBetween(vncConnStartTime, vncConnEndTime)) {
                    logger.debug(`VNC Connection Task Stop Connection SerialNumber: ${item.serialNumber}`);
                    DaemonSocket.send(item.serialNumber, { action: "StopSSH" });
                    if (!util.isNull(item.vncPort)) {
                        ReverseSSH.stopConnection(item.vncPort, item.serialNumber, item.hasDedicatedPort, "VNC");
                    }
                }
            }

            data = await cameraModel.find({ sshCameraPort: { $ne: null } });
            for (let index = 0; index < data.length; index++) {
                const item = data[index];
                let current = moment();
                if (util.isNull(item.sshConnStartTime) || util.isNull(item.sshConnEndTime)) {
                    continue;
                }
                let sshConnStartTime = moment(item.sshConnStartTime);
                let sshConnEndTime = moment(item.sshConnEndTime);
                logger.debug(`SSH Camera ConnectionTask StartDate: ${sshConnStartTime.toDate()} EndDate: ${sshConnEndTime.toDate()} Current: ${current.toDate()}`);
                if (!current.isBetween(sshConnStartTime, sshConnEndTime)) {
                    logger.debug(`SSH Camera ConnectionTask Stop Connection CameraId: ${item._id}`);
                    DaemonSocket.send(item._id, { action: "StopCameraSSH" });
                    if (!util.isNull(item.sshCameraPort)) {
                        ReverseSSH.stopCameraConnection(item.sshCameraPort, item._id);
                    }
                }
            }

            this.InProcess = false;
        } catch (ex) {
            this.InProcess = false;
            logger.debug(`VNC Connection Exception: ${ex}`);
        }
    }
}
module.exports = SSHConnection;