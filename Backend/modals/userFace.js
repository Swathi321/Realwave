const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userFaceSchema = new Schema({
    Name: { type: String },
    StoreId: { type: Schema.Types.ObjectId, ref: 'store' },
    Files: { type: String }
}, { timestamps: true });

const userFaceModal = mongoose.model('userFace', userFaceSchema, 'userFace');
module.exports = userFaceModal;