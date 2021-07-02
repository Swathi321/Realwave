const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const spiritNotificationLog = new Schema({
    storeId: { type: Schema.Types.ObjectId, ref: 'store' },
    type: { type: Schema.Types.String },  // Site/Camera
    sentOn: { type: Date },
    status: { type: Boolean },
    remarkContent: { type: String },
    alertTimeInd : { type: String },
    alertTime : { type: String },
    alertTimeLimit : { type: String },
}, { timestamps: true });

spiritNotificationLog.index({ StoreId: 1 });

module.exports = mongoose.model('spiritNotificationLog', spiritNotificationLog, 'spiritNotificationLog');

