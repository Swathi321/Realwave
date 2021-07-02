const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const widgetSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    size: { type: String },
    report: { type: Schema.Types.ObjectId, ref: 'reports' }, //Foreign Key

    isGlobal: { type: Boolean },
    industryId: [{ type: Schema.Types.ObjectId, ref: 'industry' }],
    clientId: [{ type: Schema.Types.ObjectId, ref: 'client' }],
    widgetStatus: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

widgetSchema.pre(/^find/, function (next) {
  this.find({ widgetStatus: { $ne: 1 } });

  next();
});

const Widgets = mongoose.model('widgets', widgetSchema, 'widgets');
module.exports = Widgets;
