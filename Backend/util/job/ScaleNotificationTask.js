
const RealwaveVideoClip = require('../../modals/VideoClips');
const BookMarkModal = require('../../modals/bookMark');
const { Notification, NotificationParams, Template } = require('./../Notification');
const logger = require('../logger');
const moment = require('moment');
const ScaleModel = require("../../modals/scale");
const StoreNotificationModel = require("../../modals/storeNotification");
const RealwaveAction = require("../RealwaveAction");
const { VIDEO_CLIP_TYPE } = require('../../util/enum');
const util = require("../util");
const enums = require('../../util/enum');
class ScaleNotificationTask {
    inProcess = false;


    static Execute = async () => {
        if (this.inProcess) {
            logger.info(`ScaleRule Task already Started: ${new Date()}`);
            return
        }
        this.inProcess = true;
        try {
            let records = await ScaleModel.find({ isProcessed: false }).populate("CamId").populate("StoreId").populate("ScaleId");
            records = JSON.parse(JSON.stringify(records));
            for (let i = 0; i < records.length; i++) {
                try {
                    await this.processRecord(records[i]);
                } catch (ex) {
                    logger.error("Process Record Error", ex.stack);
                    if (ex.message.indexOf("pool is draining") > -1) {
                        break;
                    }
                }
            }
        } catch (ex) {
            logger.debug(`ScaleRule Exception: ${ex}`);
        } finally {
            this.inProcess = false;
        }
    }

    //Process Scale record based on Rule configuration
    static processRecord = async (record) => {
        let scaleNotificationResult = JSON.parse(JSON.stringify(await this.getScaleRule(record)));
        if (scaleNotificationResult.length > 0) {
            for (let scaleN = 0; scaleN < scaleNotificationResult.length; scaleN++) {
                if (scaleNotificationResult[scaleN].scale) {
                    const scaleR = scaleNotificationResult[scaleN].scale;
                    await this.performAction(scaleR, record);
                }
            }
        }
    }
    static performAction = async (scaleR, record) => {
        for (let i = 0; i < scaleR.length; i++) {
            const recordScale = scaleR[i];
            if ((record.Weight >= recordScale.fromWeight && record.Weight <= recordScale.toWeight) || (!recordScale.toWeight && recordScale.fromWeight && record.Weight >= recordScale.fromWeight)) {//Calculate the action based on scale rules
                if (((recordScale.smsNotificationTo && recordScale.smsNotificationTo.length > 0) || (recordScale.smsNotificationUsers && recordScale.smsNotificationUsers.length > 0))) {//if smsNotificationUsers set then send SMS for all saved User
                    let userDataForText = [];
                    for (let addedNumbers = 0; addedNumbers < recordScale.smsNotificationTo.length; addedNumbers++) {
                        const phoneNumbers = recordScale.smsNotificationTo[addedNumbers];
                        if (!userDataForText.includes(phoneNumbers)) {
                            userDataForText.push(phoneNumbers);
                        }

                    }
                    for (let addedUsers = 0; addedUsers < recordScale.smsNotificationUsers.length; addedUsers++) {
                        const userNumbers = recordScale.smsNotificationUsers[addedUsers];
                        if (userNumbers.mobile) {
                            if (!userDataForText.includes(userNumbers.mobile)) {
                                userDataForText.push(userNumbers.mobile);
                            }

                        }
                    }
                    let body = `Baggage over ${record.Weight} pounds : ${recordScale.fromWeight} @ ${record.ScaleId.name} : ${moment(record.DateTime).format(util.dateFormat.dateTimeFormatAmPm)}`
                    await RealwaveAction.sendEventText(record, userDataForText, body, enums.EVENT_TYPE.SCALE, ScaleModel);
                }
                if (((recordScale.emailNotificationTo && recordScale.emailNotificationTo.length > 0) || (recordScale.emailNotificationUsers && recordScale.emailNotificationUsers.length > 0))) {//if emailNotificationUsers set then send Email for all saved User
                    let userData = [];
                    for (let addedEmails = 0; addedEmails < recordScale.emailNotificationTo.length; addedEmails++) {
                        const emails = recordScale.emailNotificationTo[addedEmails];
                        if (!userData.includes(emails)) {
                            userData.push(emails);
                        }
                    }
                    for (let addedUsers = 0; addedUsers < recordScale.emailNotificationUsers.length; addedUsers++) {
                        const userEmails = recordScale.emailNotificationUsers[addedUsers];
                        if (userEmails.email) {
                            if (!userData.includes(userEmails.email)) {
                                userData.push(userEmails.email);
                            }
                        }

                    }
                    await RealwaveAction.sendEventEmail(record, userData, Template.Email.ScaleEmail, enums.EVENT_TYPE.SCALE, ScaleModel, recordScale.fromWeight, record.ScaleId.name);
                }
                if (recordScale.createClip) {// if createClip Check then Create Clip
                    await RealwaveAction.createEventClip(record, VIDEO_CLIP_TYPE.SCALE, ScaleModel);
                }
                if (recordScale.bookMark) {// if bookMark Check then Create bookMark
                    await RealwaveAction.createEventBookMark(record, recordScale, ScaleModel);
                }
            }
        }
    }
    static getScaleRule = async (record) => {
        const scaleNotificationResult = await StoreNotificationModel.find({
            storeId: record.StoreId._id.toObjectId(),
        }).populate([
            {
                path: 'scale.emailNotificationUsers',
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
    }

    // TO DO
    static sendEmailAndText = async (record, userData) => {
        RealwaveAction.sendEventEmailAndText(record, userData, enums.EVENT_TYPE.SCALE, ScaleModel);
    }
}
module.exports = ScaleNotificationTask;