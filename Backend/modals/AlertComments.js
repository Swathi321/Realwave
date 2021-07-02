const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Comment Schema
const alertCommentSchema = new Schema({
    comment: {
        type: String,
        required: true
    },
    alertId : {
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


const AlertComment = mongoose.model('alertComment', alertCommentSchema, 'alertComment');
module.exports = AlertComment;