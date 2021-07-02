//Model/schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

String.prototype.toObjectId = function () {
    var ObjectId = require('mongoose').Types.ObjectId;
    return ObjectId(this.toString());
};

const kicReportSchema = new Schema(
    {
        storeId: { type: Schema.Types.ObjectId, ref: 'store', required: true },
        clientId: { type: Schema.Types.ObjectId, ref: 'client' },
        publisherId: { type: String },
        eventId: { type: String },
        data: {
            type: { type: String },
            attributes: {
                status: { type: String },
                timeZone: { type: String },
                occurredAt: { type: Date },
                statusInfo: { type: String },
                method: { type: String },
                card: { type: String },
                smartCardSerialNumber: { type: String },
                pin: { type: String },
                publisherType: { type: String },
                associatedResourceId: { type: String },
                macAddress: { type: String },
                cellphoneNumber: { type: String },

            }
        },
        VideoClipId: { type: Schema.Types.ObjectId, ref: 'realwaveVideoClip' },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    },
);
kicReportSchema.virtual('client', {
    ref: 'client',
    localField: 'clientId',
    foreignField: '_id'
});
kicReportSchema.virtual('store', {
    ref: 'store',
    localField: 'storeId',
    foreignField: '_id'
});
kicReportSchema.virtual('associatedResourceId', {
    ref: 'kicUser',
    localField: 'data.attributes.associatedResourceId',
    foreignField: 'kicAssociateId'
});
kicReportSchema.virtual('siteSmartDevice', {
    ref: 'siteSmartDevices',
    localField: 'publisherId',
    foreignField: 'kicDeviceID'
});
kicReportSchema.virtual('videoClip', {
    ref: 'realwaveVideoClip',
    localField: 'VideoClipId',
    foreignField: '_id'
});
const KICReport = mongoose.model('kicReports', kicReportSchema, 'kicReports');



function insertDefaultKICReport() {
    KICReport.find({}).exec(function (err, collection) {
        if (collection.length === 0) {
            KICReport.create({
                storeId: '5fc6398bb474ce4640c21b23'.toObjectId(),
                clientId: '6045d42f9bef611db092dcb6'.toObjectId(),
                publisherId: 'efcc3f74-84ff-42f0-8045-78c442f39982',
                eventId: '1078e42e-8c20-4a65-8b54-31fd36c9b05b',
                data: {
                    type: "Locked",
                    attributes: {
                        status: "success",
                        timeZone: "America/Denver",
                        occurredAt: new Date(),
                        statusInfo: "statusInfo",
                        method: "card",
                        card: "1234556789",
                        smartCardSerialNumber: "123456789",
                        pin: "456-781",
                        publisherType: "Lock",
                        associatedResourceId: 'af605310-ef8a-4b74-979f-529ea1eae6c8',
                        macAddress: "sera4",
                        cellphoneNumber: "989892982",

                    }
                },
                VideoClipId: '601bdc2e6870076d28d9c75c'.toObjectId(),

            });

        }
    });
}

module.exports = KICReport;
