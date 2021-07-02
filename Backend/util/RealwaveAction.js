
const { Notification, NotificationParams } = require('./Notification');
const RealwaveVideoClip = require('../modals/VideoClips');
const BookMarkModal = require('../modals/bookMark');
const BookmarkTypeModel = require('../modals/bookmarkType');
const util = require('../util/util');
const moment = require('moment');
String.prototype.toObjectId = function () {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return ObjectId(this.toString());
};
class RealwaveAction {

    static sendEventEmail = async (record, userData, template, eventType, model, triggerEvent, triggerName, url,tags) => {
        let np = new NotificationParams();
        np.template = template;
        np.tags = tags ? tags: {
            Weight: triggerEvent,
            Trigger: record.Weight,
            ScaleId: triggerName,
            DateTime: moment(record.DateTime).format(util.dateFormat.dateTimeFormatAmPm)
        };
        np.associationId = record._id;
        np.eventType = eventType;
        np.to = userData.join(",");
        Notification.sendEmail(np);
        if (model) {
            await model.update({ _id: record._id }, { $set: { isProcessed: true } });
        }

    }

    static sendEventText = async (record, userData, textBody, eventType, model) => {
        let np = new NotificationParams();

        np.to = userData.join(",");
        np.body = textBody;
        np.associationId = record._id;
        np.eventType = eventType;
        await Notification.sendText(np);
        await model.update({ _id: record._id }, { $set: { isProcessed: true } });
    }

    static sendEventEmailAndText = async (record, userData, eventType, model) => {
        let npEmail = new NotificationParams();
        let npText = new NotificationParams();
        npText.to = userData.phone;
        npEmail.to = userData.email;
        npEmail.associationId = record._id;
        npEmail.eventType = eventType;
        Notification.sendEmail(npEmail);
        Notification.sendText(npText);
        if (model) {
            await model.update({ _id: record._id }, { $set: { isProcessed: true } });
        }

    }

    static createEventClip = async (record, recordType, model) => {
        let preTime = 10;
        let postTime = 10;
        if (record.CamId && record.CamId.siteSmartDevices && record.CamId.siteSmartDevices.length > 0) {
            preTime = record.CamId.siteSmartDevices[0].devicePreRecordingDuration;
            postTime = record.CamId.siteSmartDevices[0].devicePostRecordingDuration;
        }
        let rvc = new RealwaveVideoClip({
            CamId: record.CamId._id,
            StoreId: record.StoreId._id,
            CreatedByUserId: record.CreatedByUserId,
            IsVideoAvailable: false,
            Thumbnail: false,
            Status: 0,
            Type: recordType,//for scale
            Description: "",
            StartTime: moment(record.DateTimeString ? record.DateTimeString : DateTime).format(util.dateFormat.dateTimeFormatAmPm),
            EndTime: moment(record.DateTimeString ? record.DateTimeString : DateTime).format(util.dateFormat.dateTimeFormatAmPm),
            PreTime: preTime && preTime > 0 ? preTime : 10,
            PostTime: postTime && postTime > 0 ? postTime : 10
        });
        let savedRecord = await rvc.save();
        if (model) {
            await model.update({ _id: record._id }, { $set: { VideoClipId: savedRecord.id, isProcessed: true } });
        }
        return savedRecord.id;
    }
    static createEventBookMark = async (record, recordBookMark, model) => {
        let bookMarkType = JSON.parse(JSON.stringify(await BookmarkTypeModel.findOne({ _id: recordBookMark.bookMarkTypeId.toObjectId() }))) || {};
        const dateValue = moment(record.DateTime).format("YYYY-MM-DD hh:mm:ss A");
        let bookMarkName = record && record.bookMarkName? record.bookMarkName: `Scale: ${record.Weight} Lbs at ${dateValue}`;
        let bmRecord = new BookMarkModal({
            camId: record.CamId._id,
            storeId: record.StoreId._id,
            createdByUserId: record.CreatedByUserId,
            bookmarkName: bookMarkName,
            bookmarkDescription: recordBookMark.bookmarkDescription || bookMarkName,
            tags: "",
            bookmarkType: { value: bookMarkType._id, label: bookMarkType.bookmarkType },
            start: dateValue,
            endDate: dateValue,
            bookmarkColor: bookMarkType.bookmarkColor || recordBookMark.color
        });
        let savedRecord = await bmRecord.save();
        if (model) {
            await model.update({ _id: record._id }, { $set: { BookMarkId: savedRecord.id, isProcessed: true } });
        }
        return savedRecord.id;
    }
}

module.exports = RealwaveAction;