const { min } = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    isGlobal: { type: Boolean },
    industryId: [{ type: Schema.Types.ObjectId, ref: 'industry' }], // Foreign Key
    clientId: [{ type: Schema.Types.ObjectId, ref: 'client' }], // Foreign Key
    reportStatus: {
      type: Number,
      default: 0,
    }, //for soft delete
  },
  { timestamps: true }
);
reportSchema.pre('save', function (next) {
  if (!this.isGlobal) {
    if (this.industryId.length == 0 && this.clientId.length == 0) {
      next(new Error('Please select industry or client'));
    }
  }

  next();
});

reportSchema.pre(/^find/, function (next) {
  this.find({ reportStatus: { $ne: 1 } });

  next();
});
const Reports = mongoose.model('reports', reportSchema, 'reports');
module.exports = Reports;
