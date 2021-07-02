const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storeNotificationSchema = new mongoose.Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'store' }, //
    storeNotificationSettings: [{ type: Boolean, default: false }],
    day: [
      {
        _id: false,
        doW: { type: String },
        entireDay: { type: Boolean, default: false },
        timeSlot: [
          {
            _id: false,
            StartTime: { type: String },
            EndTime: { type: String },
            emailNotificationUsers: [
              { type: Schema.Types.ObjectId, ref: 'user' },
            ], //Foreign key User Schema email id
            smsNotificationUsers: [
              { type: Schema.Types.ObjectId, ref: 'user' },
            ], //Foreign key User Schema mobile
            emailNotificationTo: [{ type: String }],
            smsNotificationTo: [{ type: String }],
          },
        ],
      },
    ],

    //scale fileds
    scale: [
      {
        _id: false,
        bookMarkTypeId: { type: Schema.Types.ObjectId, ref: 'bookmarkType' },
        fromWeight: { type: String },
        toWeight: { type: String },
        createClip: { type: Boolean, default: true },
        bookMark: { type: Boolean, default: false },
        emailNotificationUsers: [{ type: Schema.Types.ObjectId, ref: 'user' }], //Foreign key User Schema email id
        smsNotificationUsers: [{ type: Schema.Types.ObjectId, ref: 'user' }], //Foreign key User Schema mobile
        emailNotificationTo: [{ type: String }],
        smsNotificationTo: [{ type: String }],
        bookmarkDescription: { type: String }
      },
    ],

    alarm: [
      {
        _id: false,
        bookMarkTypeId: { type: Schema.Types.ObjectId, ref: 'bookmarkType' },
        clipPreAlarm: { type: String },
        clipPostAlarm: { type: String },
        createClip: { type: Boolean, default: true },
        bookMark: { type: Boolean, default: false },
        emailNotificationUsers: [{ type: Schema.Types.ObjectId, ref: 'user' }],
        smsNotificationUsers: [{ type: Schema.Types.ObjectId, ref: 'user' }],
        emailNotificationTo: [{ type: String }],
        smsNotificationTo: [{ type: String }]
      }

    ]
  },
  { timestamps: true }
);

storeNotificationSchema.index({storeId: -1})

const StoreNotifications = mongoose.model(
  'storeNotifications',
  storeNotificationSchema,
  'storeNotifications'
);
module.exports = StoreNotifications;
