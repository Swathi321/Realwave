const logger = require('../logger');
const { STORE_NOTIFICATION_TYPE } = require('../enum');
const { Notification, NotificationParams, Template } = require('./../Notification');
const SiteNotificationLogModel = require('../../modals/SiteNotificationLog');
const store = require('../../modals/store');
const util = require('../../util/util');
const moment = require("moment-timezone");
const Sync = require('twilio/lib/rest/Sync');
const enums = require('../../util/enum');
String.prototype.toObjectId = function () {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return ObjectId(this.toString());
};
const IS_FOR_CAM = true;
const IS_FOR_SITE = false;

/**
 * @description - StoreNotificationTask - Task for send down/up notification to user.
 */
class StoreNotificationTask {
    constructor() {
        this._inProcess = false;
    }

    /**
    * Task Properties
    */
    get InProcess() { return this._inProcess };
    set InProcess(val) { return this._inProcess = val };
    get IsDev() { return (process.env.NODE_ENV || 'development') == 'development' };

    /**
     * Task Execution root method
     */
    async Execute() {
        var logsEnabled = true;
        if (logsEnabled) {
            logger.info(`StoreNotification Execute: ${new Date()}`);
        }
        try {
            if (!this.InProcess) {
                if (logsEnabled) {
                    logger.info(`StoreNotification Task Started: ${new Date()}`);
                }
                this.InProcess = true;

                //Ping Stores (which are connected to see if those are disconnected by comparing last time)
                let siteNotificationRecords = await SiteNotificationLogModel.find({ type: "STORE" }) || [];//storeId: "5c823c8d55b49f11d8e729a3" 
                siteNotificationRecords.forEach(async function (siteNotificationRecord) {
                    var storeId = siteNotificationRecord.storeId;
                    if (logsEnabled) {
                        logger.info(`StoreNotification Checking StoreId: ${storeId}`);
                    }
                    // find site from store for send mail site wise.
                    let storeInfo = await store.find({ status: "Active", _id: storeId, siteOnMonitor: true });
                    if (logsEnabled) {
                        logger.info(`StoreNotification Found  storeInfo: ${storeInfo.length}`);
                    }
                    if (storeInfo && storeInfo.length > 0) {
                        var storeRecord = storeInfo[0];
                        if (logsEnabled) {
                            logger.info(`StoreNotification Found Active StoreId: ${storeId}`);
                        }
                        let notificationFrequency = Number(storeRecord.notificationFrequency);
                        if (notificationFrequency > 0) {
                            await this.CheckStoreConnectivity(storeId, storeRecord.name, storeRecord.email, notificationFrequency, storeRecord.timezoneValue, siteNotificationRecord, storeRecord.isConnected);
                        }
                        else {
                            //Frequency must be greater than zero to send notification
                            if (!storeRecord.isConnected) {
                                await SiteNotificationLogModel.update({ storeId: storeId, type: 'STORE' }, { $set: { "status": false, remarkContent: `Update SiteNotificationLogModel because Site is Diconnected but Email Frequency not Set` } });
                            }
                            if (logsEnabled) {
                                logger.info(`Store ${storeId} ... Frequency is Zero or Store IsConnected: ${storeRecord.isConnected}, hence not sending notification`);
                            }
                        }
                    } else {
                        if (logsEnabled) {
                            logger.info(`Store ${storeId}  ... Monitor: Off, Status: Not Active, hence not sending notification`);
                        }
                    }
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

    async CheckStoreConnectivity(storeId, storeName, to, notificationDuration, timezoneValue, lastRecordFromNotification, isConnected) {
        let lastConnectDateTime, lastDisconnectedDateTime, lastSentOn, lastStatus, sendDisconnectEmail = false;
        lastConnectDateTime = lastRecordFromNotification.connectDateTime;
        lastDisconnectedDateTime = lastRecordFromNotification.disConnectDateTime;
        lastStatus = lastRecordFromNotification.status;
        lastSentOn = lastRecordFromNotification.sentOn || 0;
        let isSiteEmailSentForUp = lastRecordFromNotification.emailSentForConnect;
        let sendSMS = lastStatus != isConnected;
        let totalRetries = lastRecordFromNotification.retryCount || 0;

        let diffMinutes = moment.duration(moment().diff(moment(lastSentOn))).asMinutes();
        sendDisconnectEmail = diffMinutes >= notificationDuration;
        if (sendDisconnectEmail && lastDisconnectedDateTime > lastConnectDateTime && !isConnected && totalRetries >= 3) {
            logger.info(`Store Email Notification db updated for Sent ON`);
            await SiteNotificationLogModel.update({ storeId: storeId, type: 'STORE' }, { $set: { remarkContent: "Email Sent for Store connectivity lost", retryCount: 0 } });
            //Update Last Disconnect only when it was connected, for subsequent requests, do not change disconnect time
            logger.info(`Store Email Notification Disconnect Event executed`);
            await this.DisconnectEvent(to, lastDisconnectedDateTime, storeName, lastConnectDateTime, timezoneValue, storeId);
            if (sendSMS) {
                await util.SendSMS('', lastDisconnectedDateTime, storeName, lastConnectDateTime, timezoneValue, storeId, isConnected, null);
            }
        }
        else {
            await SiteNotificationLogModel.update({ storeId: storeId, type: 'STORE' }, { $set: { remarkContent: `Email nOt sent for store due to last sent on : ${lastSentOn}`, retryCount: totalRetries + 1 } });
        }
        if (isConnected && sendDisconnectEmail && !isSiteEmailSentForUp) {
            await SiteNotificationLogModel.update({ storeId: storeId, type: 'STORE' }, { $set: { remarkContent: "Email Sent for connectivity", emailSentForConnect: true } });
            await this.ConnectEvent(to, lastDisconnectedDateTime, storeName, lastConnectDateTime, timezoneValue, storeId);
        }
    }

    /**
     * @description - Method for send email using Node plugin nodemailer
     * @param {Object} options - Email content with info.
     */
    async SendEmail(options, storeId) {
        let response = { success: false, message: '' };
        logger.info(`Store Email Notification sending to: ${options.to} and store ${storeId}`);
        let np = new NotificationParams();
        np.to = options.to;
        np.template = options.template;
        np.tags = options.tags;
        np.associationId = storeId;
        np.eventType = enums.EVENT_TYPE.STORE
        Notification.sendEmail(np);

        await SiteNotificationLogModel.update({ storeId: storeId, type: 'STORE' }, { $set: { sentOn: moment().toDate(), "status": false, remarkContent: `Store Email Notification Sent on: ${options.to}` } });
        logger.info(`Store Email Notification Sent: ${options.to}`);
        await util.AddDeviceConnectivityLog(null, storeId, true, false, STORE_NOTIFICATION_TYPE.STORE, true, `Store Email Notification Sent on: ${options.to}`);
    }

    async DisconnectEvent(to, disConnectDateTime, storeName, connectDateTime, timezoneValue, storeId) {
        try {
            let template = Template.Email.StoreReport,
                tags = {
                    DISCONNECT_DATE: timezoneValue ? moment(disConnectDateTime).tz(timezoneValue).format('MM/DD/YYYY hh:mm:ss A') : moment(disConnectDateTime).format('MM/DD/YYYY hh:mm:ss A'),
                    SITENAME: storeName,
                    CONNECT_DATE: connectDateTime ? timezoneValue ? moment(connectDateTime).tz(timezoneValue).format('MM/DD/YYYY hh:mm:ss A') : moment(connectDateTime).format('MM/DD/YYYY hh:mm:ss A') : ''
                },
                otn = { to: to, template, tags };
            logger.info(`Store Notification Sending Mail for StoreId: ${storeId}`);
            return await this.SendEmail(otn, storeId);
        }
        catch (ex) {
            logger.info(`Store Notification DisconnectEvent Exception: ${ex}`);
        }
    }

    async ConnectEvent(to, disConnectDateTime, storeName, connectDateTime, timezoneValue, storeId) {
        try {
            let template = Template.Email.StoreOnlineReport,
                tags = {
                    DISCONNECT_DATE: timezoneValue ? moment(disConnectDateTime).tz(timezoneValue).format('MM/DD/YYYY hh:mm:ss A') : moment(disConnectDateTime).format('MM/DD/YYYY hh:mm:ss A'),
                    SITENAME: storeName,
                    CONNECT_DATE: timezoneValue ? moment(connectDateTime).tz(timezoneValue).format('MM/DD/YYYY hh:mm:ss A') : moment(connectDateTime).format('MM/DD/YYYY hh:mm:ss A')
                },
                otn = { to: to, template, tags };
            return await this.SendEmail(otn, storeId);
        } catch (ex) {
            logger.info(`Store Notification DisconnectEvent Exception: ${ex}`);
        }
    }
}

module.exports = StoreNotificationTask;