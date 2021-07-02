//Model/schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

String.prototype.toObjectId = function () {
  var ObjectId = require('mongoose').Types.ObjectId;
  return ObjectId(this.toString());
};

const scaleSchema = new Schema(
  {
    CamId: { type: Schema.Types.ObjectId, ref: 'camera', required: true },
    Uid: { type: String },
    StoreId: { type: Schema.Types.ObjectId, ref: 'store', required: true },
    ScaleId: {
      type: Schema.Types.ObjectId,
      ref: 'smartDevice',
      required: true,
    },
    DateTime: { type: Date },
    Weight: { type: Number },
    VideoClipId: {
      type: Schema.Types.ObjectId,
      ref: 'videoClip',
      required: true,
    },
  },
  { timestamps: true }
);

const Scale = mongoose.model('scale', scaleSchema, 'scale');
function insertDefaultScale() {
  Scale.find({}).exec(function (err, collection) {
    if (collection.length === 0) {
      Scale.create({
        CamId: '600e6d856e06e63954e55f4c'.toObjectId(),
        Uid: '6009d9cf2c81683bb4e779b011',
        StoreId: '600173b20591dc179c468657'.toObjectId(),
        ScaleId: '5fdcdc6e2a80941ae5b70e97'.toObjectId(),
        DateTime: new Date(),
        Weight: 2.5,
        VideoClipId: '5e7beaabf833090378693364'.toObjectId(),
      });
      Scale.create({
        CamId: '600e6d856e06e63954e55f4c'.toObjectId(),
        Uid: '6009d9cf2c81683bb4e779b011',
        StoreId: '600173b20591dc179c468657'.toObjectId(),
        ScaleId: '5ff800b4b491186efeb63656'.toObjectId(),
        DateTime: new Date(),
        Weight: 2.5,
        VideoClipId: '5e7beaabf833090378693364'.toObjectId(),
      });
    }
  });
}

// module.exports = { Scale, insertDefaultScale };
module.exports = Scale;
