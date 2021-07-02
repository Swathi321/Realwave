const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Comment Schema
const commentSchema = new Schema({
  comment: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  InvoiceId: {
    type: Number,
    required: true
  },
  EventId: {
    type: Schema.Types.ObjectId,
    ref: 'event',
    required: false
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: false,
  },
}, { timestamps: true });

//create a model (mongo will create collection with 'Comment' add)
const Comment = mongoose.model('comment', commentSchema, 'comment');

//Export the model
module.exports = Comment;