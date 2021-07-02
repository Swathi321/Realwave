const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tagSchema = new Schema({
	name: { type: String },
	client: { type: String },
	clientId: { type: Schema.Types.ObjectId, ref: 'client', /*required: true*/ },
	isGlobal: { type: Boolean },
}, { timestamps: true });

const tag = mongoose.model('tag', tagSchema, 'tag');
module.exports = tag;