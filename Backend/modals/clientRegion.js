const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientRegionsSchema = new mongoose.Schema(
  {
    name: { type: String },
    parentRegionId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: 'clientRegions',
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'client',
    }, // Foreign Key,
    isDeleted: { type: Number, default: 0 },
  },
  { timestamps: true }
);

clientRegionsSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: 1 } });

  next();
});

// function autoPopulateSubs(next) {
//   // this.populate('parentRegionId');
//   this.populate([
//     {
//       path: 'parentRegionId',
//       options: {
//         retainNullValues: true,
//       },
//     },
//   ]);
//   next();
// }

// clientRegionsSchema.pre(/^find/, autoPopulateSubs);
const ClientRegion = mongoose.model(
  'clientRegions',
  clientRegionsSchema,
  'clientRegions'
);
module.exports = ClientRegion;
