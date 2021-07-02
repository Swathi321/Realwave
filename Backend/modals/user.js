const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

// Defining ENUMs for the gender field which will use for validation.
var genders = 'Male Female'.split(' ');

//create a schema
const usersSchema = new Schema(
  {
  firstName: {
    type: String,
      required: true,
  },
  lastName: {
    type: String,
      required: true,
  },
    // gender: {
    //   type: String,
    //   //enum: genders
    // },
  email: {
    type: String,
    lowercase: true,
    required: [true, "can't be blank"],
    match: [/\S+@\S+\.\S+/, 'is invalid'],
      unique: true,
  },
  password: {
      type: String,
  },
  displayPicture: {
    type: String,
      required: false,
  },
  status: {
    type: String,
      required: true,
  },

    isEmailNotificationEnabled: {
      type: Boolean,
    },

  roleId: {
    type: Schema.Types.ObjectId,
    ref: 'role',
      // required: true, Foreign Key
  },
    widgetsAllowed: [{ type: Schema.Types.ObjectId, ref: 'widgets' }], // Foreign Key
    reportsAllowed: [{ type: Schema.Types.ObjectId, ref: 'reports' }], // Foreign Key

    // userRole: {
    //   type: String,
    // },
    storeId: [
      {
    type: Schema.Types.ObjectId,
    ref: 'store',
    required: true,
      }, // Foreign Key
    ],
  clientId: {
    type: Schema.Types.ObjectId,
      ref: 'client',
    }, // Foreign Key

  secretKey: {
    type: String,
  },
  secretKeyUsed: {
      type: Boolean,
  },
  secretKeyGeneratedAt: {
      type: Date,
  },
  userProfile: { type: String },
    
  theme: {
    type: String,
      default: 'Dark',
  },
  mobile: { type: String },
    isSMSEnable: { type: Boolean },
  },
  { timestamps: true }
);

//following functions executes before user saving to DB
usersSchema.pre('save', function (next) {
  try {
    if (!this.isNew) {
      next();
      return;
    }
    //generate salt
    bcrypt.genSalt(10).then((saltResult) => {
      //gen password hash (salt+hash)
      bcrypt.hash(this.password, saltResult).then((hashResult) => {
        //reassign password
        this.password = hashResult;
        next();
      });
    });
  } catch (error) {
    next(error);
  }
});

//following function get match password with source password by decrypting with bcrypt.
usersSchema.methods.isValidPassword = function (newPassword) {
  return new Promise((resolve, reject) => {
    try {
      bcrypt.compare(newPassword, this.password).then((result) => {
        resolve(result);
      });
    } catch (error) {
      reject(new Error(error));
    }
  });
};

//create a model (mongo will create collection with 'User' add s)
const Users = mongoose.model('user', usersSchema, 'user');

//Export the model
module.exports = Users;
