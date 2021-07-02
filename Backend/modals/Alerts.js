const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const alertSchema = new Schema({
    storeId: { type: Schema.Types.ObjectId, ref: 'store' },
    cameraId: { type: Schema.Types.ObjectId, ref: 'camera' },
    type: { type: String },
    eventTime: { type: Date },
    status: { type: String },
    closedOn: { type: Date },
    details: { type: String },
    comment: {
        type: String
    },
    rating: {
        type: Number
    },
}, { timestamps: true });

const Alert = mongoose.model('alert', alertSchema, 'alert');
module.exports = Alert;