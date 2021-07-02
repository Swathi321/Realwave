const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventLikeSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    status: { type: Number, default: 0 },
    eventId: { type: Schema.Types.ObjectId, ref: 'event', required: true }
}, { timestamps: true });

module.exports = mongoose.model('eventLike', eventLikeSchema, 'eventLike');