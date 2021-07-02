const restHandler = require('./restHandler')();
restHandler.setModelId('site', ['name'], 'Site name already exists');
var mongoose = require('mongoose');
const site = require('../modals/site');
const User = require('../modals/user');
const Client = require('../modals/client');
const common = require('./common');
const util = require('../util/util');

String.prototype.toObjectId = function () {
  var ObjectId = require('mongoose').Types.ObjectId;
  return ObjectId(this.toString());
};

/**
 * function to handle GET request to receive all the locations
 * @param {object} req
 * @param {object} res
 */
function getSites(req, res) {
  switch (req.body.action) {
    case 'export':
      restHandler.getExportRecord(req, res);
      break;
    default:
      restHandler.getResources(req, res);
      break;
  }
}

async function getStoreSites(req, res) {
  var cameraModel = mongoose.model('camera');
  var filter = {};
  var storeFilter = {};
  if ((req.session && req.session.user) || req.cookies.rwave) {
    var userId = null;
    if (req.session && req.session.user) {
      userId = req.session.user._id;
    } else if (req.cookies.rwave) {
      var decodedData = decodeToken(req.cookies.rwave);
      userId = decodedData[0];
    }

    if (userId) {
      User.findById(userId)
        .populate('roleId')
        .then(async function (user) {
          if (user) {
            storeFilter = {
              _id: { $in: user.storeId },
              status: { $ne: 'Inactive' },
            };

            // if (user.clientId) {
            //   storeFilter.clientId = { $eq: user.clientId };
            // }


            // if (user.roleId.isAdminRole) {
            //   storeFilter = {};
            // }
            var storeModel = mongoose.model('store');
            var queryStore = storeModel.find(storeFilter);
            queryStore.lean().exec(function (err, storeData) {
              if (!err) {
                filter = {
                  storeId: {
                    $in: storeData.map(function (strVale) {
                      return strVale._id;
                    }),
                  },
                  status: { $ne: 'Inactive' },
                };
                var query = cameraModel.find(filter).populate('storeId');
                query.lean().exec(function (err, data) {
                  if (!err) {
                    util.updateCamerasPublishUrls(data);
                    res.json({
                      stores: sortStoresByName(storeData),
                      data: data,
                      success: true,
                    });
                  } else {
                    res.json({
                      stores: [],
                      data: [],
                      success: false,
                    });
                  }
                });
              } else {
                res.json({
                  stores: [],
                  data: [],
                  success: false,
                });
              }
            });
          } else {
            res.json({
              stores: [],
              data: [],
              success: false,
            });
          }
        })
        .catch(function () {
          res.json({
            stores: [],
            data: [],
            success: false,
          });
        });
    } else {
      res.json({
        stores: [],
        data: [],
        success: false,
      });
    }
  } else {
    res.json({
      stores: [],
      data: [],
      success: false,
    });
  }
}

function getSite(req, res) {
  common.getData(req, res, restHandler);
}

function sortStoresByName(storesData) {
  return storesData.sort(function (a, b) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  });
}

module.exports = { getSites, getSite, getStoreSites };
