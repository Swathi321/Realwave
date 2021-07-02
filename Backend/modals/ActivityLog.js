const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activityLogSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'user' },
    userName: { type: String },
    screen: { type: String },
    route: { type: String },
    otherOptions: { type: String }
}, { timestamps: true });

const ActivityLogModal = mongoose.model('activityLog', activityLogSchema, 'activityLog');
module.exports = ActivityLogModal;