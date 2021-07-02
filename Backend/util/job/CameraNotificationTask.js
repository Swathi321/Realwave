const logger = require('../logger');
const { Notification, NotificationParams, Template } = require('./../Notification');
const SiteNotificationLogModel = require('../../modals/SiteNotificationLog');
const camera = require('../../modals/camera');
const store = require('../../modals/store');
const util = require('../../util/util');
const moment = require("moment-timezone");
const enums = require('../../util/enum');
String.prototype.toObjectId = function () {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return ObjectId(this.toString());
};

class CameraNotificationTask {
    constructor() {
        this.InProcess = false;
    }

    get InProcess() { return this._inProcess };
    set InProcess(val) { return this._inProcess = val };
    get IsDev() { return (process.env.NODE_ENV || 'development') == 'development' };

    async Execute() {
        var logsEnabled = false;
        if (logsEnabled) {
            logger.info(`Camera Notification Execute: ${new Date()}`);
        }
        try {
            if (!this.InProcess) {
                if (logsEnabled) {
                    logger.info(`Camera Notification Task Started: ${new Date()}`);
                }
                this.InProcess = true;
                let cameraNotificationRecords = await SiteNotificationLogModel.find({ type: "CAMERA", isCam: true }) || [];//storeId: "5c823c8d55b49f11d8e729a3" 

                cameraNotificationRecords.forEach(async function (cameraNotificationRecord, index) {
                    var storeId = cameraNotificationRecord.storeId;
                    if (storeId) {
                        if (logsEnabled) {
                            logger.info(`Camera Notification Checking StoreId: ${storeId}`);
                        }
                        // find site from store for send mail site wise.
                        let storeInfo = await store.find({ status: "Active", _id: storeId, siteOnMonitor: true });
                        if (logsEnabled) {
                            logger.info(`Camera Notification Found  storeInfo: ${storeInfo.length}`);
                        }
                        if (storeInfo && storeInfo.length > 0) {
                            var storeRecord = storeInfo[0];
                            if (logsEnabled) {
                                logger.info(`Camera Notification Found Active StoreId: ${storeId}`);
                            }
                            let notificationFrequency = Number(storeRecord.notificationFrequency);
                            if (cameraNotificationRecord.status == false) {
                                if (notificationFrequency > 0 && storeRecord.isConnected) {
                                    // Checking and sending Camera Down Notification
                                    await this.CheckCameraConnectivity(storeId, storeRecord.name, storeRecord.email, notificationFrequency, storeRecord.timezoneValue, cameraNotificationRecord, storeRecord.isConnected);
                                }
                            }
                            else {
                                if (cameraNotificationRecord.status == true && storeRecord.isConnected) {

                                    let cameraDetail = await camera.find({ _id: cameraNotificationRecord.camId, status: "Active" }).populate('storeId');
                                    if (!cameraNotificationRecord.emailSentForConnect) {
                                        // Checking and sending Camera Up Notification
                                        await this.CheckCameraConnectivity(storeId, storeRecord.name, storeRecord.email, notificationFrequency, storeRecord.timezoneValue, cameraNotificationRecord, storeRecord.isConnected, true);
                                    }
                                    else {
                                        // Checking and sending Camera Stream High Low Notification
                                        if (cameraDetail.length > 0) {
                                            await this.CheckCameraStreamConnectivity(storeId, storeRecord.name, storeRecord.email, notificationFrequency, storeRecord.timezoneValue, cameraNotificationRecord, cameraDetail[0]);
                                        }
                                    }
                                }
                            }

                        } else {
                            if (logsEnabled) {
                                logger.info(`Store ${storeId}  ... Monitor: Off, Status: Not Active, hence not sending notification`);
                            }
                        }
                    }
                    logger.info("In Process")
                }, this)
                if (logsEnabled) {
                    logger.info(`StoreNotification Task Completed: ${new Date()}`);
                }
            }
            this.InProcess = false;
        } catch (ex) {
            this.InProcess = false;
            logger.debug(`StoreNotification Exception: ${ex}`);
        }
    }

    async CheckCameraConnectivity(storeId, storeName, to, notificationDuration, timezoneValue, lastRecordFromNotification, isConnected, forUpNotification) {
        let lastConnectDateTime, lastDisconnectedDateTime, lastSentOn, lastStatus, sendDisconnectEmail = false;
        lastConnectDateTime = lastRecordFromNotification.connectDateTime;
        lastDisconnectedDateTime = lastRecordFromNotification.disConnectDateTime;
        lastStatus = lastRecordFromNotification.status;
        lastSentOn = lastRecordFromNotification.sentOn || 0;
        let sendSMS = lastStatus != isConnected;
        let localDateTime = moment().toDate();

        let diffMinutes = moment.duration(moment().diff(moment(lastSentOn))).asMinutes();
        sendDisconnectEmail = diffMinutes >= notificationDuration;
        if (forUpNotification && sendDisconnectEmail) {
            // If Up notification is not send and camera is connected then sending notification of Up - only once
            let cameraDetail = await camera.find({ _id: lastRecordFromNotification.camId, status: "Active" }).populate('storeId');
            if (cameraDetail.length > 0) {
                cameraDetail = cameraDetail[0];
                let camInfo = util.getIpAndPort(cameraDetail.cameraRTSPUrl);
                await this.ConnectEvent(to, cameraDetail, lastDisconnectedDateTime, camInfo, storeName, lastConnectDateTime, cameraDetail.storeId.timezoneValue, cameraDetail.storeId.id, false, "", true, true);
            }

        } else {
            // Sending Down notification once under frequency 
            if (sendDisconnectEmail) {
                let cameraDetail = await camera.find({ _id: lastRecordFromNotification.camId, status: "Active" }).populate('storeId');
                if (cameraDetail.length > 0) {
                    cameraDetail = cameraDetail[0];
                    logger.info('Camera Disconnect - after last date sent on  condition, sending disconnect email: ' + localDateTime);
                    //Fetching last record for sending in email
                    let camInfo = util.getIpAndPort(cameraDetail.cameraRTSPUrl);
                    await SiteNotificationLogModel.update({ camId: cameraDetail.id, storeId: storeId, type: "CAMERA", isCam: true }, { $set: { "sentOn": moment().toDate(), "status": false } })
                    await util.DisconnectEvent(to, cameraDetail.name, lastDisconnectedDateTime, camInfo, storeName, lastConnectDateTime, cameraDetail.storeId.timezoneValue, cameraDetail.storeId.id); //to, camname, disconnectdatetime
                    logger.info(`Camera Disconnect Mail Sent - Next Time Entry: CamId: ${cameraDetail.camId} timeDiff: ${diffMinutes} notificationFrequency: ${notificationFrequency}`);
                }
                if (sendSMS) {
                    // Checking and sending Camera Notification through SMS to user
                    await util.SendSMS('', lastDisconnectedDateTime, storeName, lastConnectDateTime, timezoneValue, storeId, isConnected, null);
                }
            }
        }

    }

    async CheckCameraStreamConnectivity(storeId, storeName, to, notificationDuration, timezoneValue, lastRecordFromNotification, cameraDetail) {
        let streamNotifications = await SiteNotificationLogModel.find({
            camId: lastRecordFromNotification.camId, type: {
                $in: ["CAMERA_HighQuality", "CAMERA_LowBandwidth"]
            }, storeId: storeId, isCam: true
        });

        // Sending Stream Up Notification
        let forUpNotificationData = streamNotifications.filter(function (data) { return data.status == true && data.emailSentForConnect == false });
        if (forUpNotificationData.length > 0) {
            let camStreamLowUpNotification = forUpNotificationData.filter(function (data) { return data.type == "CAMERA_HighQuality" });
            let camStreamHighUpNotification = forUpNotificationData.filter(function (data) { return data.type == "CAMERA_LowBandwidth" });
            let lastConnectDateTime, lastDisconnectedDateTime;
            let forBothStreams = camStreamLowUpNotification.length > 0 && camStreamHighUpNotification.length > 0;
            let streamData = null;

            //If Both Streams available then sending 1 mail for both else sending for the available one
            if (forBothStreams) {
                streamData = camStreamHighUpNotification[0]
            }
            else {
                streamData = camStreamHighUpNotification.length > 0 ? camStreamHighUpNotification[0] : camStreamLowUpNotification[0];
            }

            lastConnectDateTime = streamData.connectDateTime;
            lastDisconnectedDateTime = streamData.disConnectDateTime;
            let camInfo = util.getIpAndPort(cameraDetail.cameraRTSPUrl);
            //Sending Stream Up notification
            await this.ConnectEvent(to, cameraDetail, lastDisconnectedDateTime, camInfo, storeName, lastConnectDateTime, cameraDetail.storeId.timezoneValue, cameraDetail.storeId.id, forBothStreams, streamData.type, false, true);
        }
        let camStreamHighNotification = streamNotifications.filter(function (data) { return data.type == "CAMERA_HighQuality" && data.status == false });
        let camStreamLowNotification = streamNotifications.filter(function (data) { return data.type == "CAMERA_LowBandwidth" && data.status == false });

        // Sending Stream Down Notification
        if (camStreamHighNotification.length > 0 && camStreamLowNotification.length > 0) {
            await this.sendDisconnectStreamHighLowNotification(storeId, storeName, to, notificationDuration, timezoneValue, camStreamHighNotification[0], true, cameraDetail);
        }
        else if (camStreamHighNotification.length > 0 || camStreamLowNotification.length > 0) {
            let lastRecordFromNotification = camStreamHighNotification.length > 0 ? camStreamHighNotification : camStreamLowNotification;
            await this.sendDisconnectStreamHighLowNotification(storeId, storeName, to, notificationDuration, timezoneValue, lastRecordFromNotification[0], false, cameraDetail);
        }

    }

    async sendDisconnectStreamHighLowNotification(storeId, storeName, to, notificationDuration, timezoneValue, lastRecordFromNotification, isForBothStreams, cameraDetail) {
        let lastConnectDateTime, lastDisconnectedDateTime, lastSentOn, sendDisconnectEmail = false;
        lastConnectDateTime = lastRecordFromNotification.connectDateTime;
        lastDisconnectedDateTime = lastRecordFromNotification.disConnectDateTime;
        lastSentOn = lastRecordFromNotification.sentOn || 0;
        let localDateTime = moment().toDate();
        let diffMinutes = moment.duration(moment().diff(moment(lastSentOn))).asMinutes();
        sendDisconnectEmail = diffMinutes >= notificationDuration;
        if (sendDisconnectEmail) {
            if (cameraDetail) {
                logger.info('Sending Camera Stream Notification on' + localDateTime + "for Stream Type : " + lastRecordFromNotification.type);
                let camInfo = util.getIpAndPort(cameraDetail.cameraRTSPUrl);
                await this.DisconnectEvent(to, cameraDetail, lastDisconnectedDateTime, camInfo, storeName, lastConnectDateTime, cameraDetail.storeId.timezoneValue, cameraDetail.storeId.id, isForBothStreams, lastRecordFromNotification.type); //to, camname, disconnectdatetime
            }
        }
    }

    async DisconnectEvent(to, camDetailData, disConnectDateTime, camInfo, siteName, connectDateTime, timezoneValue, storeId, isForBothStreams, streamTypeName) {
        //Checking if for both streams need to send mail then keeping it as one mail instead of 2
        let streamType = isForBothStreams ? "Both High and Low Resolution" : streamTypeName == "CAMERA_LowBandwidth" ? "Low Resolution" : "High Resolution";
        try {
            let template = Template.Email.DisconnectStreamReport,
                tags = {
                    CAMERA: camDetailData.name,
                    DISCONNECT_DATE: timezoneValue ? moment(disConnectDateTime).tz(timezoneValue).format('MM/DD/YYYY hh:mm:ss A') : moment(disConnectDateTime).format('MM/DD/YYYY hh:mm:ss A'),
                    SITENAME: siteName,
                    CONNECT_DATE: connectDateTime ? timezoneValue ? moment(connectDateTime).tz(timezoneValue).format('MM/DD/YYYY hh:mm:ss A') : moment(connectDateTime).format('MM/DD/YYYY hh:mm:ss A') : '',
                    IP: camInfo.ip,
                    PORT: camInfo.port,
                    STREAMTYPE: streamType
                },
                otn = { to: to, template, tags };
            return await this.SendEmail(otn, camDetailData.id, storeId, isForBothStreams, streamTypeName);
        }
        catch (ex) {
            logger.error(`CameraNotification DisconnectEvent Exception: ${ex}`);
        }
    }

    async SendEmail(options, camId, storeId, isForBothStreams, streamTypeName, forCam, forUpNotification) {
        let np = new NotificationParams();
        np.to = options.to;
        np.template = options.template;
        np.tags = options.tags;
        np.associationId = camId;
        np.eventType = forCam ? enums.EVENT_TYPE.CAMERA : streamTypeName == "CAMERA_LowBandwidth" ? enums.EVENT_TYPE.LOW_STREAM : enums.EVENT_TYPE.HIGH_STREAM;
        Notification.sendEmail(np);
        await this.UpdateNotificationData(options, camId, storeId, isForBothStreams, streamTypeName, false, response, forCam, forUpNotification);
        logger.info(`Camera Stream Email Notification Sent: ${options.to}`);
    }

    async UpdateNotificationData(options, camId, storeId, isForBothStreams, streamTypeName, isError, errorMessage, forCam, forUpNotification) {
        if (forCam) {
            let toUpdate = { $set: { remarkContent: isError ? `Camera Email not Sent on  ${options.to} Error: ${errorMessage.message}` : errorMessage.response } };
            if (!isError) {
                toUpdate.sentOn = moment().toDate();
            }
            if (forUpNotification) {
                toUpdate.emailSentForConnect = true;
            }
            await SiteNotificationLogModel.updateMany({ camId: camId, type: "CAMERA", storeId: storeId, isCam: true }, toUpdate);
        }
        else {
            let toUpdate = {
                $set: { remarkContent: isError ? `Camera Stream Email not sent Error ${errorMessage.message}` : `Camera Stream Email Sent on  ${options.to}` }
            }
            if (!isError) {
                toUpdate.sentOn = moment().toDate();
            }
            if (isForBothStreams) {
                if (forUpNotification) {
                    toUpdate.emailSentForConnect = true;
                }
                await SiteNotificationLogModel.updateMany({
                    camId: camId, type: {
                        $in: ["CAMERA_HighQuality", "CAMERA_LowBandwidth"]
                    }, storeId: storeId, isCam: true
                }, toUpdate);
            }
            else {
                if (forUpNotification) {
                    toUpdate.emailSentForConnect = true;
                }
                await SiteNotificationLogModel.updateMany({ camId: camId, type: streamTypeName, storeId: storeId, isCam: true }, toUpdate);
            }
        }
    }

    async ConnectEvent(to, camDetailData, disConnectDateTime, camInfo, siteName, connectDateTime, timezoneValue, storeId, isForBothStreams, streamTypeName, forCam, forUpNotification) {
        let streamType = isForBothStreams ? "Both High and Low Resolution" : streamTypeName == "CAMERA_LowBandwidth" ? "Low Resolution" : "High Resolution";
        try {
            let template = forCam ? Template.Email.ConnectCamReport : Template.Email.ConnectStreamReport,
                tags = {
                    CAMERA: camDetailData.name,
                    DISCONNECT_DATE: timezoneValue ? moment(disConnectDateTime).tz(timezoneValue).format('MM/DD/YYYY hh:mm:ss A') : moment(disConnectDateTime).format('MM/DD/YYYY hh:mm:ss A'),
                    SITENAME: siteName,
                    CONNECT_DATE: connectDateTime ? timezoneValue ? moment(connectDateTime).tz(timezoneValue).format('MM/DD/YYYY hh:mm:ss A') : moment(connectDateTime).format('MM/DD/YYYY hh:mm:ss A') : '',
                    IP: camInfo.ip,
                    PORT: camInfo.port,
                };
            if (!forCam) {
                tags.STREAMTYPE = streamType;
            }
            let otn = { to: to, template, tags };

            return await this.SendEmail(otn, camDetailData.id, storeId, isForBothStreams, streamTypeName, forCam, forUpNotification);
        }
        catch (ex) {
            logger.error(`CameraNotification DisconnectEvent Exception: ${ex}`);
        }
    }

}

module.exports = CameraNotificationTask;