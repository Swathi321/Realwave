const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const siteSchema = new Schema({
	name: { type: String },
	address: { type: String },
	city: { type: String },
	state: { type: String },
	country: { type: String },
	zipCode: { type: String },
	tags: { type: String },
	status: { type: String },
	storeId: { type: Schema.Types.ObjectId, ref: 'store', required: true },
	isDeleted: { type: Number },
	createdByUserId: { type: Number }
}, { timestamps: true });

const Site = mongoose.model('site', siteSchema, 'site');
module.exports = Site;