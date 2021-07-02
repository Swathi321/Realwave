const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cameraTagSchema = new Schema({
	name: { type: String },
	clientId: { type: Schema.Types.ObjectId, ref: 'client', /*required: true*/ },
	isGlobal: { type: Boolean },
}, { timestamps: true });

const tag = mongoose.model('cameraTags', cameraTagSchema, 'cameraTags');
module.exports = tag;