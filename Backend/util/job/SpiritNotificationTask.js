const logger = require('../logger');
const { STORE_NOTIFICATION_TYPE, EVENT_TYPE } = require('../enum');
const { Notification, NotificationParams, Template } = require('./../Notification');
const SpiritNotificationLogModel = require('../../modals/SpiritNotificationLog');
const store = require('../../modals/store');
const util = require('../../util/util');
const moment = require("moment-timezone");
const { ConsoleTransportOptions } = require('winston/lib/winston/transports');
const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
String.prototype.toObjectId = function () {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return ObjectId(this.toString());
};
const IS_FOR_CAM = true;
const IS_FOR_SITE = false;

/**
 * @description - StoreNotificationTask - Task for send down/up notification to user.
 */

const handleEmailTo = (isEntireDay, timeSlot) => {
    let currentDate = moment();
    var emails = [];
    let dayTime = currentDate.format('YYYY-MM-DD LT');
    for (i = 0; i < timeSlot.length; i++) {
        const currentTimeSlot = timeSlot[i];
        var startTime = `${currentDate.format(`YYYY-MM-DD`)} ${currentTimeSlot.StartTime.replace(".", ":")}`;
        var endTime = `${currentDate.format(`YYYY-MM-DD`)} ${currentTimeSlot.EndTime.replace(".", ":")}`;
        if (isEntireDay || moment(dayTime).isBetween(startTime, endTime)) {
            for (var j = 0; j < currentTimeSlot.emailNotificationTo.length; j++) {
                var emailToValidate = currentTimeSlot.emailNotificationTo[j];
                if (emailRegexp.test(emailToValidate) && !emails.includes(emailToValidate)) {
                    emails.push(currentTimeSlot.emailNotificationTo[j])
                }
            }
        }
    }
    return emails;
}
function SpiritNotificationTask(type) {
    // constructor(type) {
    //     this._inProcess = false;
    //     this._a = true;
    //     this.type = type
    // }

    /**
    * Task Properties
    */
    const _this = {
        _inProcess: false,
        get InProcess() { return _this._inProcess },
        set InProcess(val) { return _this._inProcess = val },
        get IsDev() { return (process.env.NODE_ENV || 'development') == 'development' },

        get Type() { return type },

        /**
         * Task Execution root method
         */
        async Execute() {
            console.log("Execute called")
            var logsEnabled = false;
            if (logsEnabled) {
                logger.info(`SpiritNotification Execute: ${new Date()}`);
            }
            try {
                if (!_this.InProcess) {
                    if (logsEnabled) {
                        logger.info(`SpiritNotification Task Started: ${new Date()}`);
                    }
                    _this.InProcess = true;

                    //Ping Stores (which are connected to see if those are disconnected by comparing last time)
                    let siteNotificationRecords = await SpiritNotificationLogModel.find({ type: _this.Type, status: null }) || [];//storeId: "5e32613b241a472a6c0c99b9" 
                    console.log("siteNotificationRecords", siteNotificationRecords);

                    siteNotificationRecords.forEach(async function (siteNotificationRecord) {
                        var storeId = siteNotificationRecord.storeId;
                        const notificationId = siteNotificationRecord._id;
                        if (logsEnabled) {
                            logger.info(`SpiritNotification Checking StoreId: ${storeId}`);
                        }
                        // find site from store for send mail site wise.
                        let storeInfo = await store.find({ status: "Active", _id: storeId }).populate("storeNotificationId");
                        // let storeNotificationData = await getScaleRule(storeInfo);
                        if (logsEnabled) {
                            logger.info(`SpiritNotification Found  storeInfo: ${storeInfo.length}`);
                        }
                        if (storeInfo && storeInfo.length > 0) {
                            var storeRecord = storeInfo[0];
                            if (logsEnabled) {
                                logger.info(`SpiritNotification Found Active StoreId: ${storeId}`);
                            }
                            let notificationFrequency = Number(storeRecord.notificationFrequency);
                            if (notificationFrequency > 0) {
                                let storeRecord = storeInfo[0];
                                let storeRecordEmail = [];
                                let storeNotificationEnabled = storeInfo[0]._doc.storeNotificationEnabled;
                                let days = storeInfo[0]._doc.storeNotificationId.day;
                                let getdate = moment();
                                let dayName = getdate.format('dddd');
                                if (logsEnabled) {
                                    logger.info(`SpiritNotification Found Active StoreId: ${storeId}`);
                                }
                                let notificationFrequency = Number(storeRecord.notificationFrequency);
                                if (storeNotificationEnabled) {
                                    let currentDay = days.filter(day =>day._doc.doW == dayName );
                                    if (storeNotificationEnabled && currentDay && currentDay.length > 0) {
                                        let getEmails = handleEmailTo(currentDay[0].entireDay, currentDay[0].timeSlot);
                                        storeRecordEmail = storeRecordEmail.concat(getEmails);
                                    }
                                    // storeRecordEmail.join(",");
                                    await _this.CheckStoreConnectivity(notificationId, storeId, storeRecord.name, storeRecordEmail.join(","), notificationFrequency, storeRecord.timezoneValue, siteNotificationRecord, storeRecord.isConnected);
                                }
                            }
                            else {
                                //Frequency must be greater than zero to send notification
                                if (!storeRecord.isConnected) {
                                    //   await SpiritNotificationLogModel.update({ _id: notificationId, storeId: storeId, type: _this.Type }, { $set: { "status": false, remarkContent: `Update SpiritNotificationLogModel because Site is Diconnected but Email Frequency not Set` } });

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
                        logger.info(`SpiritNotification Task Completed: ${new Date()}`);
                    }
                }
                _this.InProcess = false;
            } catch (ex) {
                _this.InProcess = false;
                logger.error(`SpiritNotification Exception: ${ex}`);
            }
        },

        async getScaleRule(record) {
            const scaleNotificationResult = await StoreNotificationModel.find({
                storeId: record.StoreId._id.toObjectId(),
            }).populate([
                {
                    path: 'store.emailNotificationUsers',
                    select: {
                        _id: 1,
                        email: 1,
                        firstName: 1,
                    },
                },
                {
                    path: 'scale.smsNotificationUsers',
                    select: {
                        _id: 1,
                        mobile: 1,
                        firstName: 1,
                    },
                },
                {
                    path: 'scale',
                    select: {
                        createClip: true,
                    }
                },
                {
                    path: 'scale',
                    select: {
                        bookMark: true
                    }
                }
            ])
            return scaleNotificationResult;
        },

        async CheckStoreConnectivity(notificationId, storeId, storeName, to, notificationDuration, timezoneValue, lastRecordFromNotification, isConnected) {
            const alertTimeInd = lastRecordFromNotification.alertTimeInd;
            const alertTime = lastRecordFromNotification.alertTime;
            const alertTimeLimit = lastRecordFromNotification.alertTimeLimit;
            const notificationSentOn = lastRecordFromNotification.sentOn;
            const notificationSentStatus = lastRecordFromNotification.status;

            if (!notificationSentStatus) {
                await SpiritNotificationLogModel.update({ _id: notificationId, storeId: storeId, type: _this.Type }, { $set: { sentOn: moment().toDate(), status: false, remarkContent: "CheckStoreConnectivity function before Send Email" } });
                //Update Last Disconnect only when it was connected, for subsequent requests, do not change disconnect time
                //await this.DisconnectEvent(to, lastDisconnectedDateTime, storeName, lastConnectDateTime, timezoneValue, storeId);
                await _this.SpiritDisconnectEvent(to, storeName, alertTimeInd, alertTime, alertTimeLimit, notificationSentOn, notificationId, storeId);
            }
            else {
                await SpiritNotificationLogModel.update({ _id: notificationId, storeId: storeId, type: _this.Type }, { $set: { status: false, remarkContent: `Email not sent for store due to last sent on : ${notificationSentOn}` } });
            }
        },

        /**
         * @description - Method for send email using Node plugin nodemailer
         * @param {Object} options - Email content with info.
         */
        async SendEmail(options, notificationId, storeId) {
            logger.info(`Spirit Notification sending to: ${options.to} and store ${storeId}`);
            let np = new NotificationParams();
            np.to = options.to;
            np.template = options.template;
            np.tags = options.tags;
            np.associationId = storeId;
            np.eventType = EVENT_TYPE.STORE
            Notification.sendEmail(np);
            response.success = true;
            await SpiritNotificationLogModel.update({ _id: notificationId, storeId: storeId, type: _this.Type }, { $set: { sentOn: moment().toDate(), "status": true, remarkContent: `Store Email Notification Sent on: ${options.to}` } });

            logger.info(`Store Email Notification Sent: ${options.to}`);
            await util.AddDeviceConnectivityLog(null, storeId, true, false, STORE_NOTIFICATION_TYPE[_this.Type], true, `Store Email Notification Sent on: ${options.to}`);
        },
        async SpiritDisconnectEvent(to, storeName, alertTimeInd, alertTime, alertTimeLimit, notificationSentOn, notificationId, storeId) {
            try {
                let template = Template.Email.SpiritReport,

                    tags = {
                        ALERT_TIME_IND: alertTimeInd ? _this.getIndicator(alertTimeInd) : "Red",
                        SITENAME: storeName,
                        SPIRITKWAIT: _this.Type,
                        ALERT_TIME_LIMIT: alertTimeLimit ? alertTimeLimit : "03:00",
                        ALERT_TIME: alertTime ? alertTime : "03:45",
                        NOTIFICATION_SENT_ON: moment().format('MM/DD/YYYY hh:mm:ss A')
                    },
                    otn = { to: to, template, tags };
                await _this.SendEmail(otn, notificationId, storeId);
            }
            catch (ex) {
                logger.error(`Store Notification DisconnectEvent Exception: ${ex}`);
            }
        },

        getIndicator(alertTimeInd) {
            if (alertTimeInd == "2") {
                return "Red";
            } else if (alertTimeInd == "1") {
                return "Yellow";
            } else if (alertTimeInd == "0") {
                return "Green";
            } else {
                return null;
            }
        }
    }

    return _this;
}

module.exports = SpiritNotificationTask;