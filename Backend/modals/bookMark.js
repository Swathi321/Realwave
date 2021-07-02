const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bookMarkSchema = new Schema({
    storeId: { type: String },
    bookmarkId: { type: String },
    camId: { type: String },
    start: { type: String },
    endDate: { type: String },
    bookmarkName: { type: String },
    bookmarkDescription: { type: String },
    tags: { type: String },
    bookmarkType: { type: Object },
    bookmarkColor: { type: String },
}, { timestamps: true });

const bookMarkModal = mongoose.model('bookMark', bookMarkSchema, 'bookMark');
module.exports = bookMarkModal;