const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationQueue = new Schema({
    //Email Required fields
    to: { type: String },
    from: { type: String },
    subject: { type: String },
    body: { type: String },

    //Optional fields
    cc: { type: String },
    bcc: { type: String },

    //Management fields
    type: { type: Number, default: 0 }, //Email/Text
    isHtml: { type: Boolean, default: true },
    sentOn: { type: Date },
    isSent: { type: Boolean, default: false },
    retryCount: { type: Number, default: 0 },
    associationId: { type: Schema.Types.ObjectId },
    eventType: { type: Number, default: 0 }
}, { timestamps: true });

const PeopleCountModal = mongoose.model('notificationQueue', notificationQueue, 'notificationQueue');
module.exports = PeopleCountModal;