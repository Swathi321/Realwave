const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lookupTypeSchema = new Schema({
	lookupType: { type: Number },
	description: { type: String },
	status: { type: String }
}, { timestamps: true });

const LookupType = mongoose.model('lookupType', lookupTypeSchema, 'lookupType');
module.exports = LookupType;