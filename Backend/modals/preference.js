const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const preferenceSchema = new Schema({
	userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
	isDeleted: { type: Number },
	createdByUserId: { type: Number },
	configuration: [],
	stretchList: [],
	camLayoutCal: { type: Object }
}, { timestamps: true });

const Preference = mongoose.model('preference', preferenceSchema, 'preference');
module.exports = Preference;