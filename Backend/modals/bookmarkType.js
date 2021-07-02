const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bookmarkTypeSchema = new Schema({
  bookmarkType: {
    type: String,
    required: true
  },
  bookmarkColor:{
    type: String
  },
  clientId: { type: Schema.Types.ObjectId, ref: 'client' },
}, {
  timestamps: true,
});

const BookmarkType = mongoose.model('bookmarkType', bookmarkTypeSchema,'bookmarkType');

module.exports = BookmarkType;