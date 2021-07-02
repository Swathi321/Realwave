const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const siteLogsSchema = new Schema({
    fileName: { type: String },
    extension: { type: String },
    fileSize: { type: mongoose.Schema.Types.Mixed },
    storeId: { type: Schema.Types.ObjectId, ref: 'siteLogs', required: true },
    isDeleted: { type: Number },
    createdByUserId: { type: Number }
}, { timestamps: true });

siteLogsSchema.index({ StoreId: 1 });

const SiteLogs = mongoose.model('siteLogs', siteLogsSchema, 'siteLogs');
module.exports = SiteLogs;