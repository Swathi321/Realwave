const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Comment Schema
const alarmCommentSchema = new Schema({
    comment: {
        type: String,
        required: true
    },
    alarmId: {
        type: Schema.Types.ObjectId,
        ref: 'alert',
        required: false,
    },
    rating: {
        type: Number,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: false,
    },
}, { timestamps: true });


const AlarmComments = mongoose.model('alarmComment', alarmCommentSchema, 'alarmComment');
module.exports = AlarmComments;