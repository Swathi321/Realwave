const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roiTagMasterSchema = new Schema({
	tagName: { type: String },
	clientId: { type: Schema.Types.ObjectId, ref: 'client'},
}, { timestamps: true });

const roiTagMaster = mongoose.model('roiTagMaster', roiTagMasterSchema, 'roiTagMaster');
module.exports = roiTagMaster;