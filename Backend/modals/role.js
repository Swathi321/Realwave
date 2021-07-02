const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    permissions: [
      {
        _id: false,
        pageId: { type: Schema.Types.ObjectId, ref: 'permission' }, //permission collection, Foreign Key
        widgetId: { type: Schema.Types.ObjectId, ref: 'widgets' }, //widget collection. , Foreign Key
        reportId: { type: Schema.Types.ObjectId, ref: 'reports' }, //report collection, Foreign Key
        functionId: { type: Schema.Types.ObjectId, ref: 'permission' }, //permission collection, Foreign Key
        isViewAllowed: { type: Boolean },
        isEditAllowed: { type: Boolean },
      },
    ],
    isAdminRole: { type: Boolean },
    isClientAdminRole: { type: Boolean },
    isInstallerRole: { type: Boolean },
    isSystemRole: { type: Boolean, default: false },
    clientId: { type: Schema.Types.ObjectId, ref: 'client' }, // Foreign Key
    createdByUserId: { type: Number },
    roleStatus: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
roleSchema.pre(/^find/, function (next) {
  this.find({ roleStatus: { $ne: 1 } });

  next();
});
const Role = mongoose.model('role', roleSchema, 'role');
module.exports = Role;
