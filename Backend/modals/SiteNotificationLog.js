const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const siteNotificationLog = new Schema({
    storeId: { type: Schema.Types.ObjectId, ref: 'store' },
    camId: { type: Schema.Types.ObjectId, ref: 'camera' },
    type: { type: Schema.Types.String },  // Site/Camera
    sentOn: { type: Date },
    connectDateTime: { type: Date },
    disConnectDateTime: { type: Date },
    disConnectStringDate: { type: String },
    connectStringDate: { type: String },
    status: { type: Boolean },
    remarkContent: { type: String },
    isCam: { type: Boolean },
    emailSentForConnect : {type: Boolean},
    retryCount : {type: Number}
}, { timestamps: true });

siteNotificationLog.index({ StoreId: 1 });

module.exports = mongoose.model('siteNotificationLog', siteNotificationLog, 'siteNotificationLog');

