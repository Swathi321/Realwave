const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const industrySchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    industryStatus: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
industrySchema.pre(/^find/, function (next) {
  this.find({ industryStatus: { $ne: 1 } });

  next();
});
const Industry = mongoose.model('industry', industrySchema, 'industry');
module.exports = Industry;
