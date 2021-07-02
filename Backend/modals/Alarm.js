const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const alarmSchema = new Schema({
    storeId: { type: Schema.Types.ObjectId, ref: 'store' },
    cameraId: { type: Schema.Types.ObjectId, ref: 'camera' },
    type: { type: String },
    location: { type: String },
    eventTime: { type: Date },
    status: { type: String },
    closedOn: { type: Date },
    details: { type: String },
    auditStatus: { type: String },
    comment: {
        type: String
    },
    rating: {
        type: Number
    }
}, { timestamps: true });

const Alarm = mongoose.model('alarm', alarmSchema, 'alarm');
module.exports = Alarm;