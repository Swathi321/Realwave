const user = require('../modals/user');
var mongoose = require('mongoose');

const bcrypt = require('bcryptjs');
const signToken = require('../authentication/generateToken');
const util = require('./../util/util');
const User = require('../modals/user');
const Aggregated = require('../modals/aggregated');
const { Notification, NotificationParams, Template } = require('./../util/Notification');
const jwt = require('jsonwebtoken');
const { Client } = require('twilio/lib/twiml/VoiceResponse');
const request = require('request').defaults({ encoding: null });
const ClientModel = require('../modals/client');
module.exports = {
  getSpiritDashboardData: async (req, res, next) => {
    try {
      //const alldata = await Aggregated.find({});
      const alldata = await Aggregated.aggregate([
        {
          $match: {
            DATA_FOR: {
              $exists: true,
              $ne: null,
            },
          },
        },
        { $sort: { time_stamp: -1 } },
        { $limit: 200 },
        { $group: { _id: '$DATA_FOR', docs: { $push: '$$ROOT' } } },
        {
          $project: {
            top_one: {
              $slice: ['$docs', 1],
            },
          },
        },
      ]).allowDiskUse(true);
      return res.status(200).json({ alldata });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getSpiritDashboardData: async (req, res, next) => {
    try {
      //const alldata = await Aggregated.find({});
      const alldata = await Aggregated.aggregate([
        {
          "$match": {
            "DATA_FOR": {
              "$exists": true,
              "$ne": null
            }
          }
        },
        { $sort: { "time_stamp": -1 } },
        { $limit: 200 },
        { $group: { _id: "$DATA_FOR", docs: { $push: "$$ROOT" } } },
        {
          '$project': {
            'top_one': {
              '$slice': ['$docs', 1]
            }
          }
        }
      ]).allowDiskUse(true);
      return res.status(200).json({ alldata });
    }
    catch (err) {
      res.status(500).json(err);
    }
  },

  getSpiritDashboardDataByStore: async (req, res, next) => {
    try {
      //const alldata = await Aggregated.find({});
      const alldata = await Aggregated.aggregate([
        {
          "$match": {
            "DATA_FOR": {
              "$exists": true,
              "$ne": null
            },
            "site_id": {
              "$exists": true,
              "$eq": req.body.storeId
            }
          }
        },
        { $sort: { "time_stamp": -1 } },
        { $limit: 2000 },
        { $group: { _id: "$DATA_FOR", docs: { $push: "$$ROOT" } } },
        {
          '$project': {
            'top_one': {
              '$slice': ['$docs', 1]
            }
          }
        }
      ]).allowDiskUse(true);
      return res.status(200).json({ alldata });
    }
    catch (err) {
      res.status(500).json(err);
    }
  },

  login: (req, res, next) => {
    let data = req.user;
    if (!data.success) {
      res.status(200).json(data);
      return;
    }
    data = data.data;
    if (data.status !== 'Active') {
      res.status(200).json({
        success: false,
        error:
          'User is not yet active! Please contact Realwave account administrator or help support team for help.',
      });
      return;
    } else {
      req.session.user = data;
    }
    let cloneUserData = JSON.parse(JSON.stringify(data));
    delete cloneUserData['password'];
    const token = signToken(cloneUserData);
    let options = {
      maxAge: 1000 * 60 * 22, // would expire after 20 Minutes
      signed: true, // Indicates if the cookie should be signed
      overwrite: true
    };
    if (req.body.isComingFromMobile == 'true' || req.body.isComingFromMobile == true) {
      options.maxAge = 365 * 24 * 60 * 60 * 1000; // for a year
    }
    req.sessionCookies.set('rwave', token, options);
    req.login(data, function (err) {
      if (err) return next(err);
      res.status(200).json({
        success: true,
        token: 'bearer ' + token,
        user: data,
      });
    });
  },

  register: (req, res, next) => {

    let newUser = new user({

      firstName: req.body.firstName,
      lastName: req.body.lastName,
      gender: req.body.gender,
      email: req.body.email,
      password: req.body.password,
      displayPicture: req.body.displayPicture,
      status: req.body.status,
      userRole: req.body.userRole,
      storeId: "5bdc6e959d399733cce254c3"
    });

    newUser.save().then(inserted => {
      const token = signToken(inserted);
      res.status(200).json({ message: 'created.', success: true, token: 'bearer' + token });
    })
  },

  logout: (req, res, next) => {
    req.session = null;
    res.clearCookie('rwave');
    res.clearCookie('realwave');
    return res.status(200).json({ success: true, message: 'Logout success' });
  },

  getUserDetail(req, res) {
    var isLogged = false;
    var id = null;
    if (req.session && req.session.user) {
      isLogged = true;
      id = req.session.user._id;
    } else {
      if (req.cookies.rwave) {
        var data = decodeToken(req.cookies.rwave);
        if (data[0]) {
          isLogged = true;
          id = data[0];
        }
      }
    }

    if (isLogged) {
      User.findOne({ _id: id, status: 'Active' }, (err, user) => {
        //if not handle it
        if (!user) {
          res.json({
            success: false,
            data: null,
            error:
              "That e-mail address or username doesn't have an associated user account. Are you sure you've registered?",
          });
        } else {
          delete user['password'];

          //image checking
          if (user && user.clientId && user.clientId.clientType == 'thirdparty') {
            if (user.clientId.logo && (user.clientId.logo != " " || user.clientId.logo != null)) {
              return res.json({
                success: true,
                data: user,
              });
            } else {
              ClientModel.findOne({ _id: user.clientId.installerId }, { clientType: 1, name: 1, logo: 1 }, (err, client) => {
                if (client && (client.logo != null || client.logo != '')) {
                  user = JSON.parse(JSON.stringify(user));
                  user.clientId.logo = client.logo
                  return res.json({
                    success: true,
                    data: user,
                  });
                } else {
                  return res.json({
                    success: true,
                    data: user,
                  });
                }
              })
            }
          } else {
            return res.json({
              success: true,
              data: user,
            });
          }

        }
      })
        .populate([
          {
            path: 'roleId',
            populate: [
              'permissions.widgetId',
              'permissions.pageId',
              'permissions.reportId',
              'permissions.functionId',
            ],
            //   populate: {
            //     path: 'permissions',
            //     select: { _id: 1, name: 1 },
            //   },
            //   select: { _id: 1, name: 1 },
            //
          },
          { path: 'storeId', select: { _id: 1, name: 1 } },
          {
            path: 'clientId',
            // select: { _id: 1, name: 1, theme: 1, logo: 1 },
          },
        ])
        .select({
          _id: 1,
          email: 1,
          firstName: 1,
          lastName: 1,
          userProfile: 1,
          theme: 1,
        });
    } else {
      res.json({
        success: false,
        message: 'No user found',
      });
    }
  },

  setNewPassword: (req, res, next) => {
    var data = Object.assign({}, req.body, req.query);
    var response = {};
    //find user with email
    user.findOne({ email: data.email }, (err, user) => {
      //if not handle it
      if (!user) {
        response.message = 'Account does not exists';
        response.success = false;
        res.status(200).json(response);
        return;
      }
      //check password if correct
      user
        .isValidPassword(data.oldPassword, data.newPassword)
        .then((isMatch) => {
          if (!isMatch) {
            response.message = 'Invalid Old Password.';
            response.success = false;
            res.status(200).json(response);
            return;
          }
          if (data.oldPassword === data.newPassword) {
            response.message =
              'New Password should not be same as old password';
            response.success = false;
            res.status(200).json(response);
            return;
          }
          //generate salt
          bcrypt.genSalt(10).then((saltResult) => {
            //gen password hash (salt+hash)
            bcrypt.hash(data.newPassword, saltResult).then((hashResult) => {
              user.password = hashResult;
              user.save((err, data) => {
                if (err) {
                  response.message = err;
                  response.success = false;
                  res.status(200).json(response);
                } else {
                  response.message = 'Your Password has been changed.';
                  response.success = true;
                  res.status(200).json(response);
                }
              });
            });
          });
        });
    });
  },

  forgotPassword: (req, res, next) => {
    var data = Object.assign({}, req.body, req.query);
    var response = {};
    //find user with email
    user.findOne({ email: data.email }, (err, userData) => {
      //if not handle it
      if (!userData) {
        response.message =
          "That e-mail address or username doesn't have an associated user account. Are you sure you've registered?";
        response.success = false;
        res.status(200).json(response);
        return;
      }

      require('crypto').randomBytes(48, function (err, buffer) {
        var secretKey = buffer.toString('hex');
        user.findOneAndUpdate(
          { _id: userData._id },
          {
            $set: {
              secretKey: secretKey,
              secretKeyGeneratedAt: new Date(),
              secretKeyUsed: false,
            },
          },
          { new: true },
          function (err, doc) {
            var response = {
              success: false,
              message: '',
            };
            if (err) {
              response.success = false;
              response.message = err;
              res.status(200).json(response);
              return;
            } else {
              let np = new NotificationParams();
              np.to = data.email;
              np.template = Template.Email.ResetPassword;
              np.tags = {
                FirstName: 'User',
                LastName: '',
                Email: data.email,
                ForgotPasswordURL:
                  util.getBaseUrl(req) + '/#/forgotPassword/' + secretKey,
              };
              //  Notification.sendInstantEmail(np);
              Notification.sendEmail(np);
              return res.json({
                success: true,
                message: 'Password reset link has been sent to your email.',
              });
            }
          }).catch((err) => {
            return res.json({
              success: false,
              message:
                err.message || 'Unable to send Password reset link',
            });
          });
      });
    });
  },

  checkValidForgotLink: (req, res, next) => {
    var data = Object.assign({}, req.body, req.query);
    //find user with email
    user.findOne(
      { secretKey: data.secretKey, secretKeyUsed: false },
      (err, userData) => {
        var response = {};
        if (err) {
          response.message = err;
          response.success = false;
          res.status(200).json(response);
          return;
        }

        response.message = userData
          ? 'Valid link'
          : 'Link has been expired. please try again';
        response.success = userData ? true : false;
        res.status(200).json(response);
      }
    );
  },

  resetPassword: (req, res, next) => {
    var data = Object.assign({}, req.body, req.query);
    var response = {};
    //find user with email
    user.findOne(
      { secretKey: data.secretKey, secretKeyUsed: false },
      (err, userData) => {
        //if not handle it
        if (!userData) {
          response.message = 'Link has been expired. please try again.';
          response.success = false;
          res.status(200).json(response);
          return;
        }

        //generate salt
        bcrypt.genSalt(10).then((saltResult) => {
          //gen password hash (salt+hash)
          bcrypt.hash(data.password, saltResult).then((hashResult) => {
            user.findOneAndUpdate(
              { secretKey: data.secretKey },
              { $set: { secretKeyUsed: true, password: hashResult } },
              { new: true },
              function (err, doc) {
                var response = {
                  success: false,
                  message: '',
                };

                if (err) {
                  response.success = false;
                  response.message = err;
                  res.status(200).json(response);
                  return;
                } else {
                  response.success = true;
                  response.message =
                    'Your password has been successfully changed.';
                  res.status(200).json(response);
                }
              }
            );
          });
        });
      }
    );
  },
  googlelogin: (req, res, next) => {
    let data = Object.assign({}, req.body, req.query);
    if (data.tokenId) {
      // get the decoded payload and header
      let decoded = jwt.decode(data.tokenId, { complete: true });
      let { email, given_name, family_name, picture } = decoded.payload;
      let userData = {
        email,
        first_name: given_name,
        last_name: family_name,
        picture: picture,
      };
      try {
        socialLoginCreateUser(req, res, next, userData);
      } catch (error) {
        res.status(200).json({
          success: false,
          error: error,
        });
      }
    } else {
      res.status(200).json({
        success: false,
        error: 'Google auth not valid',
      });
      return;
    }
  },
  facebooklogin: (req, res, next) => {
    let data = Object.assign({}, req.body, req.query);
    if (data.tokenId) {
      let url = `https://graph.facebook.com/me?fields=id,name,email,first_name,last_name,gender,picture&access_token=${data.tokenId}`;
      request.post(
        {
          url: url,
          json: true,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
        function (err, httpResponse, reponse) {
          if (err) {
            res.status(200).json({
              success: false,
              error:
                'User is not yet active! Please contact Realwave account administrator or help support team for help.',
            });
            return;
          }
          let { email, first_name, last_name, picture } = reponse;
          let userData = { email, first_name, last_name, picture: picture.url };
          try {
            socialLoginCreateUser(req, res, next, userData);
          } catch (error) {
            res.status(200).json({
              success: false,
              error: error,
            });
          }
        }
      );
    } else {
      res.status(200).json({
        success: false,
        error: 'Facebook auth not valid',
      });
    }
  },
}

function socialLoginCreateUser(
  req,
  res,
  next,
  { email, first_name, last_name, picture }
) {
  //find user with email
  User.findOne({ email }, (err, userData) => {
    if (!userData) {
      let newUser = new user({
        firstName: first_name,
        lastName: last_name,
        gender: 'Male',
        email: email,
        password: 'admin',
        displayPicture: picture,
        status: 'Active',
        roleId: '5c581923de665b2bc00615a6',
        userRole: 'admin',
        storeId: null,
      });
      newUser.save().then((inserted) => {
        User.findOne({ email: inserted.email }, (err, useSaveData) => {
          if (!useSaveData) {
            res.status(200).json({
              success: false,
              error: 'Some thing was wrong.',
            });
            return;
          }

          if (useSaveData.status !== 'Active') {
            res.status(200).json({
              success: false,
              error:
                'User is not yet active! Please contact Realwave account administrator or help support team for help.',
            });
            return;
          } else {
            req.session.user = useSaveData;
          }

          const token = signToken(useSaveData);
          delete useSaveData['password'];
          req.login(useSaveData, function (err) {
            if (err) return next(err);
            res.status(200).json({
              success: true,
              token: 'bearer ' + token,
              user: useSaveData,
            });
          });
        }).populate([
          {
            path: 'roleId',
            // populate: { path: 'permissions', select: { _id: 1, name: 1 } },
            populate: [
              'permissions.widgetId',
              'permissions.pageId',
              'permissions.reportId',
              'permissions.functionId',
            ],
            select: { _id: 1, name: 1 },
          },
          { path: 'storeId', select: { _id: 1, name: 1 } },
          { path: 'clientId', select: { _id: 1, name: 1, theme: 1, logo: 1, clientType: 1 } },
        ]);
      });
      return;
    }

    if (userData.status !== 'Active') {
      res.status(200).json({
        success: false,
        error:
          'User is not yet active! Please contact Realwave account administrator or help support team for help.',
      });
      return;
    } else {
      req.session.user = userData;
    }

    const token = signToken(userData);
    delete userData['password'];
    res.status(200).json({
      success: true,
      token: 'bearer ' + token,
      user: userData,
    });
  }).populate([
    {
      path: 'roleId',
      populate: { path: 'permissions', select: { _id: 1, name: 1 } },
      select: { _id: 1, name: 1 },
    },
    { path: 'storeId', select: { _id: 1, name: 1 } },
    { path: 'clientId', select: { _id: 1, name: 1, theme: 1, logo: 1, clientType: 1 } },
  ]);
}
