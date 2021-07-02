const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userPreferenceSchema = new Schema({
    name: { type: String },
    description: { type: String },
    checkDefault: { type: String },
    preferenceId: { type: String },
    userId: { type: String },
    prefName: { type: String },
    type: { type: String },
    isDeleted: { type: String },
    info: { type: String },
}, { timestamps: true });

const userPreferenceModal = mongoose.model('userPreference', userPreferenceSchema, 'userPreference');
module.exports = userPreferenceModal;