const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('./util');
const logger = require('./logger');
const storeModel = require('./../modals/store');
const Camera = require('../modals/camera');

class ReverseSSH {
    static ports = {};

    static get isWindow() { return process.platform === "win32"; }
    static get authorizedKeys() { return this.isWindow ? `C:\\ProgramData\\ssh\\administrators_authorized_keys` : "~/.ssh/authorized_keys"; }
    static get sshFilePath() {
        let filePath = path.resolve("SSHTEMP");
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath);
        }
        return filePath;
    }

    static deleteKnownHost = () => {
        logger.debug(`Server Known Host: ${process.env.server_known_host}`);
        if (fs.existsSync(process.env.server_known_host)) {
            fs.unlinkSync(process.env.server_known_host);
        }
    }

    static ruleName = (port, name) => {
        return `AAA-${name ? name : 'SSH'}-REALWAVE-${port}`;
    }

    static restartSSHServer = () => {
        logger.info("Restarting SSH Server");
        if (this.isWindow) {
            execSync("net stop sshd");
            execSync("net stop sshd");
        } else {
            execSync("service sshd restart");
        }
        logger.info("SSH Server Restarted");
    }

    static onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    //Add a rule in firewall for open specific port
    //Refernce: https://www.joe0.com/2018/10/05/controlling-inbound-or-outbound-windows-firewall-rules-from-command-line/
    static openPort = (port, ip, name) => {
        let ruleName = this.ruleName(port, name);
        let toUpdate = false;

        // getting existing firewall rules and get all added RemoteIP and concat with new IP
        let rulesIPAddress = this.getRuleIpAddress(ruleName);
        if (rulesIPAddress.length > 0) {
            ip = ip.concat(rulesIPAddress);
            ip = ip.filter(this.onlyUnique);
            toUpdate = true;
        }

        logger.info(`SSH Server Firewall rule added IP: ${ip.join(",")} Port: ${port}`);
        let addEditRuleCommand = `netsh advfirewall firewall add rule name=${ruleName} dir=in action=allow protocol=TCP remoteip=${ip.join(",")} localport=${port}`;
        if (toUpdate) {
            addEditRuleCommand = `netsh advfirewall firewall set rule name=${ruleName} new remoteip=${ip.join(",")}`;
        }
        try {
            execSync(addEditRuleCommand);
            this.portMapToLocal(port);
            return true;
        } catch (ex) {
            logger.error(ex);
            return false;
        }
    }

    static portMapToLocal(port) {
        logger.info(`portMapToLocal ${port}`);
        try {
            if (this.ports.hasOwnProperty(port)) {
                logger.info(`PortMapToLocal KILLING PORT: ${port} PID: ${this.ports[port]}`);
                process.kill(this.ports[port]);
            }

            let proc = exec(`ssh -g -L ${port}:localhost:${port} localhost -i ${this.privateKeyPath} -y -o "StrictHostKeyChecking no"`, {
                windowsHide: true
            }).on('exit', () => {
                delete this.ports[port];
            });
            this.ports[port] = Number(proc.pid);
            logger.info(`Port Map To Local Done: ${port}`);
        } catch (ex) {
            logger.error(ex);
        }
    }

    static stopConnection = async (port, fieldValue, hasDedicatedPort, name, modelInfo) => {
        try {
            if (util.isNull(port) || util.isNull(fieldValue)) {
                logger.info(`SSH Server Firewall rule dalready deleted`);
                return;
            }
            let ruleName = this.ruleName(port, name);
            logger.info(`SSH Server Firewall rule deleting ${ruleName}`);
            let opt = {};

            if (name) {
                opt = { vncPort: null, vncConnEndTime: null, vncConnStartTime: null };
                //Send Request to Daemon for stop VNC connection
                if (hasDedicatedPort) {
                    delete opt.vncPort;
                }
            } else {
                opt = { sshPort: null, sshConnEndTime: null, sshConnStartTime: null };
                //Send Request to Daemon for stop SSH connection
                if (hasDedicatedPort) {
                    delete opt.sshPort;
                }
            }

            if (modelInfo) {
                await modelInfo.updateOne({ _id: fieldValue }, { $set: opt });
            }
            else {
                await storeModel.updateOne({ serialNumber: fieldValue }, { $set: opt });
            }
            execSync(`netsh advfirewall firewall delete rule name="${ruleName}"`);
        } catch (ex) {
            logger.error(ex);
        }
    }

    static stopCameraConnection = async (port, cameraId) => {
        try {
            if (util.isNull(port) || util.isNull(cameraId)) {
                logger.info(`Camera SSH Server Firewall rule dalready deleted`);
                return;
            }
            let name = "camera" + cameraId.toString();
            let ruleName = this.ruleName(port, name);
            logger.info(`Camera SSH Server Firewall rule deleting ${ruleName}`);
            let opt = {};
            opt = { sshCameraPort: null, sshConnEndTime: null, sshConnStartTime: null };
            await Camera.updateOne({ _id: cameraId }, { $set: opt });
            execSync(`netsh advfirewall firewall delete rule name="${ruleName}"`);
        } catch (ex) {
            logger.error(ex);
        }
    }

    //Add RSA Public key in Server SSH Authorized_keys file for authentication
    static addPublicKey = async (keyPath) => {
        let isSuccess = false;
        try {
            execSync(`scp ${keyPath} ${this.authorizedKeys}`);
            isSuccess = true;
        } catch (ex) {
            logger.error(ex);
            isSuccess = false;
        }
        return isSuccess;
    }

    static get keyLocation() { return path.resolve('ssh-keys') };
    static get publicKeyPath() { return path.join(this.keyLocation, "key.pub") };
    static get privateKeyPath() { return path.join(this.keyLocation, "key") };
    static get privateKey() { return fs.existsSync(this.privateKeyPath) ? fs.readFileSync(this.privateKeyPath).toString() : null; }

    static createRSAKey = () => {
        let response = { success: false, message: "New SSH key not able to generate" };

        let publicKey = null;
        let privateKey = null;
        try {
            if (fs.existsSync(this.keyLocation)) {
                fs.rmdirSync(this.keyLocation, { recursive: true });
            }
            fs.mkdirSync(this.keyLocation);
            execSync(`ssh-keygen -m pem -t rsa -b 2048 -C "" -N "" -f "${this.keyLocation}\\key"`);
            if (fs.existsSync(this.publicKeyPath)) {
                publicKey = fs.readFileSync(this.publicKeyPath).toString()
            } else {
                return response;
            }
            if (fs.existsSync(this.privateKeyPath)) {
                privateKey = fs.readFileSync(this.privateKeyPath).toString()
            } else {
                return response;
            }
            //Add Public key in open ssh server authorization
            response.success = this.addPublicKey(this.publicKeyPath);
            response.message = "New SSH keys Successfully generated";
            // response.privateKey = privateKey;
            // response.publicKey = publicKey;
            return response;
        } catch (ex) {
            logger.error(ex);
            return response;
        }
    }

    static getSSHPort = async (storeId) => {
        let port = process.env.sshPortLimit_start;
        let record = await storeModel.find({ sshPort: { $ne: null } }).sort({ sshPort: -1 });

        //Verify the port 
        const start = Number(process.env.sshPortLimit_start);
        const end = Number(process.env.sshPortLimit_end);
        let runningports = await util.portList();
        for (let p = start; p < end; p++) {

            let item = record.find(e => e.sshPort == p);
            //if site has dadicated port
            if (item && item.sshPort && item.hasDedicatedPort && item.id == storeId) {
                port = item.sshPort;
                break;
            }

            if (item) {
                continue;
            } else {
                if (runningports.indexOf(p) > -1) {
                    continue;
                } else {
                    port = p;
                    break;
                }
            }
        }
        return port;
    }


    static getCameraSSHPort = async (storeId) => {
        let port = process.env.sshPortLimit_start;
        let record = await Camera.find({ sshCameraPort: { $ne: null } }).sort({ sshCameraPort: -1 });

        //Verify the port 
        const start = Number(process.env.sshCameraPortLimit_start);
        const end = Number(process.env.sshCameraPortLimit_end);
        let runningports = await util.portList();
        for (let p = start; p < end; p++) {

            let item = record.find(e => e.sshCameraPort == p);
            //if site has dadicated port
            if (item && item.sshCameraPort && item.hasDedicatedPort && item.id == storeId) {
                port = item.sshCameraPort;
                break;
            }

            if (item) {
                continue;
            } else {
                if (runningports.indexOf(p) > -1) {
                    continue;
                } else {
                    port = p;
                    break;
                }
            }
        }
        return port;
    }


    static getVNCPort = async (storeId) => {
        let port = process.env.vncPortLimit_start;
        let record = await storeModel.find({ vncPort: { $ne: null } }).sort({ vncPort: -1 });

        //Verify the port 
        const start = Number(process.env.vncPortLimit_start);
        const end = Number(process.env.vncPortLimit_end);

        let runningports = await util.portList();
        for (let p = start; p < end; p++) {

            let item = record.find(e => e.vncPort == p);
            //if site has dadicated port
            if (item && item.vncPort && item.hasDedicatedVNCPort && item.id == storeId) {
                port = item.vncPort;
                break;
            }

            if (item) {
                continue;
            } else {
                if (runningports.indexOf(p) > -1) {
                    continue;
                } else {
                    port = p;
                    break;
                }
            }
        }
        return port;
    }

    static getRuleIpAddress = (ruleName) => {
        let addEditRuleCommand = `netsh advfirewall firewall show rule name=${ruleName}`;
        let remoteIPAddress = "";
        try {
            let data = null;
            try {
                data = execSync(addEditRuleCommand);
                data = data.toString();
            } catch {
                data = null;
            }
            if (data && data.length > 0 && data.includes(ruleName)) {
                let allDetails = data.split("\n");
                let remoteIP = this.search("RemoteIP:", allDetails);
                if (remoteIP) {
                    remoteIPAddress = remoteIP.replace(/\/32/gi, "");
                }
            }
        } catch (ex) {
            logger.error(ex);
        }
        return remoteIPAddress.length > 0 ? remoteIPAddress.split(",") : []
    }

    static search = (nameKey, myArray) => {
        let remoteIPs = null;
        for (var i = 0; i < myArray.length; i++) {
            if (myArray[i].indexOf(nameKey) > -1) {
                let value = myArray[i].split(":");
                if (value.length > 1) {
                    remoteIPs = value[1].trim();
                }
            }
        }
        return remoteIPs;
    }
}
module.exports = ReverseSSH;