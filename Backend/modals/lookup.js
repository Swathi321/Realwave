const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lookupSchema = new Schema({
	lookupTypeId: { type: Number },
	displayValue: { type: String },
	status: { type: String }
}, { timestamps: true });

const Lookup = mongoose.model('lookup', lookupSchema, 'lookup');
module.exports = Lookup;