const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;


const verficationSchema = new Schema({

    code: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: false,
    }
}, { timestamps: true });

module.exports = verficationSchema;