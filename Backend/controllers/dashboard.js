
var Event = require('./../modals/Event');
var EventDetail = require('./../modals/EventDetail');
var Store = require('./../modals/store');
var User = require('./../modals/user');
const util = require('../util/util');
const moment = require('moment');
var mongoose = require("mongoose");
module.exports = {

  getUserAndCameraCount: (req, res, storeFilter) => {
    return new Promise((resolve, reject) => {
      let filter = {}
      if (storeFilter && storeFilter.clientId) {
        filter = { clientId: storeFilter.clientId }
      }
      User.countDocuments(filter).then(function (user) {
        if (user) {
          var model = mongoose.model("camera");
          filter = { 'storeId': { $in: storeFilter.stores.map(function (strVale) { return strVale._id }) }, 'status': { $ne: 'Inactive' } };
          var query = model.countDocuments(filter).select('_id name').populate('storeId', 'name');
          query.lean().exec(function (err, cameraData) {
            if (!err) {
              resolve({
                user: user,
                camera: cameraData
              });
            } else {
              resolve({
                user: user,
                camera: 0
              })
            }
          });
        } else {
          resolve({
            user: 0,
            camera: 0
          })
        }
      })
    })
  },

  getTopSelling: (req, res) => {
    var dashboard = require('./dashboard');
    var matchStore = {};
    dashboard.getStores(req, res).then(function (storeFilter) {
      matchStore['StoreId'] = { $in: storeFilter.stores.map(function (strVale) { return strVale._id }) }
      EventDetail.aggregate([
        {
          $match: matchStore,
        },
        {
          $group: {
            _id: '$ItemId',  //$region is the column name in collection
            count: { $sum: 1 },
            ItemType: { $first: "$Category" },
            Description: { $first: "$Name" },
            UnitPrice: { $first: "$Total" }
          }
        },
        { $sort: { count: -1 } }
      ]).limit(4).then((receipts, error) => {
        if (error) {
          res.status(200).json({
            success: true, data: []
          })
        }
        res.status(200).json({
          success: true, data: receipts
        })
      }).catch(err => {
        res.status(200).json({
          success: true, data: []
        })
      });
    });
  },


  suspiciousTransactions: (req, res) => {
    var dashboard = require('./dashboard');
    dashboard.suspiciousDashboard(req, res).then(function (suspiciousData) {
      res.status(200).json(suspiciousData)
    })
  },

  chartSales: (req, res, next) => {
    var ObjectId = (require('mongoose').Types.ObjectId);
    var _id = {};
    var timezoneOffset = req.body.timezoneOffset;
    if (req.body.type == "hourly") {
      _id = {
        dayval: { $dayOfMonth: "$EventTime" },
        "h": {
          "$hour": "$EventTime"
        },
      }
    }
    if (req.body.type == "daily") {
      _id = {
        "$dayOfMonth": "$EventTime"
      }
    }
    if (req.body.type == "weekly") {
      _id = {
        "$week": "$EventTime"
      }
    }
    let filter = {
      EventTime: {
        $gte: moment.utc(req.body.startDate)._d,
        $lte: moment.utc(req.body.endDate)._d
      }
    }
    var dashboard = require('./dashboard');
    dashboard.getStores(req, res).then(function (storeFilter) {
      filter['StoreId'] = { $in: storeFilter.stores.map(function (strVale) { return strVale._id }) }
      Event.aggregate([
        {
          $match: filter
        },
        {
          $group: {
            "_id": _id,
            sum: { $sum: "$Total" }
          }
        },
      ]).then((data, error) => {
        if (error) {
          res.status(200).json({
            success: false
          })
        } else {
          var labels = [];
          var labelsData = [];
          if (req.body.type == "hourly") {
            var startDate = moment.utc(req.body.startDate);
            var endDate = moment.utc(req.body.endDate);
            var diff = endDate.diff(moment(startDate), 'hours');
            for (var i = 0; i < diff; i++) {
              var newDate = startDate.add(1, 'hours');
              labels.push(newDate.utcOffset(+timezoneOffset, true).toISOString());
              let dataIndex = data.findIndex(e => e._id.dayval == newDate.format('DD') && e._id.h == newDate.format('HH'));
              if (dataIndex > -1) {
                labelsData.push(data[dataIndex].sum)
              } else {
                labelsData.push(0)
              }
            }
          }
          if (req.body.type == "daily") {
            var startDate = moment.utc(req.body.startDate);
            var endDate = moment.utc(req.body.endDate);
            var diff = endDate.diff(moment(startDate), 'days');
            startDate.subtract(1, 'days');
            for (var i = 0; i <= diff; i++) {
              var newDate = startDate.add(1, 'd');
              labels.push(newDate.toISOString());
              let dataIndex = data.findIndex(e => e._id == newDate.format('DD'));
              if (dataIndex > -1) {
                labelsData.push(data[dataIndex].sum)
              } else {
                labelsData.push(0)
              }
            }
          }
          if (req.body.type == "weekly") {
            var startWeek = moment.utc(req.body.startDate).isoWeek();
            var endWeek = moment.utc(req.body.endDate).isoWeek();
            for (let index = startWeek; index <= endWeek; index++) {
              labels.push(moment().day("Monday").week(index).toISOString());
              let dataIndex = data.findIndex(e => e._id == index);
              if (dataIndex > -1) {
                labelsData.push(data[dataIndex].sum)
              } else {
                labelsData.push(0)
              }
            }
          }
          res.status(200).json({
            success: true, data: {
              label: labels,
              data: labelsData
            }
          });
        }
      })
    })
  },


  getStores: (req, res, next) => {
    return new Promise((resolve, reject) => {
      util.getUserDetail(req.session.user._id).then(function (data) {
        let filter = {
          clientId: null,
          stores: [],
          role: data ? (data.roleId ? data.roleId.name : null) : null,
          //role: data ? data.roleId.name : null,
          userRoleStatus: data ? (data.roleId ? data.roleId : null) : null,
          isTags: false,
        };
        if (data && data.clientId) {
          filter = {
            clientId: data.clientId,
            role: filter.role,
            // userRoleData: filter.userRoleStatus,
            userRoleStatus: filter.userRoleStatus,

          };
        }
        var storeFilter = {
          _id: { $in: data.storeId },
          status: { $ne: 'Inactive' },
        };
        if (data.clientId) {
          storeFilter.clientId = { $eq: data.clientId };
        }
        if (req.body.fromTags && req.body.selectedValue.length > 2) {
          storeFilter.tags = { $in: JSON.parse(req.body.selectedValue) };
          filter.isTags = true;
        }
        if (
          req.body.fromSites &&
          req.body.selectedValue.length > 2 &&
          JSON.parse(req.body.selectedValue)[0] != 'All'
        ) {
          (storeFilter._id = {
            $in: JSON.parse(req.body.selectedValue).map(function (strVale) {
              return strVale;
            }),
          }),
            (storeFilter.status = { $ne: 'Inactive' });
          filter.isTags = true;
        }
        var storeModel = mongoose.model('store');
        var queryStore = storeModel.find(storeFilter);
        queryStore.lean().exec(function (err, storeData) {
          if (!err) {
            filter.stores = storeData.map(function (strVale) {
              return strVale._id;
            });
            resolve(filter);
          } else {
            resolve(filter);
          }
        });
      });
    })
  },

  getAverageSales: (req, res, storeFilter, lastWeek) => {
    return new Promise((resolve, reject) => {
      let filter = {
        $and: [{ Status: { $nin: ["Void", "Face"] } }],
        EventType: 'POS'
      };
      if (lastWeek) {
        var startDate = moment.utc(req.body.startDate, 'MM/DD/YYYY HH:mm:ss').add(-7, 'days')._d;
        var endDate = moment.utc(req.body.endDate, 'MM/DD/YYYY HH:mm:ss').add(-1, 'days')._d;
        filter.EventTime = { $gte: startDate, $lte: endDate }
      }

      let tempFilter = { 'StoreId': { $in: storeFilter.stores.map(function (strVale) { return strVale._id }) } };
      filter = Object.assign({}, filter, tempFilter);

      Event.aggregate([
        {
          $match: filter
        }, {
          $group: {
            "_id": null,
            avg: { $avg: "$Total" }
          }
        }
      ]).then((data, error) => {
        resolve((!error && data && data.length > 0) ? data[0].avg : 0);
      })
    })
  },

  getLastWeekSales: (req, res, storeFilter, lastWeek) => {
    return new Promise((resolve, reject) => {
      let filter = {
        $and: [{ Status: { $nin: ["Void", "Face"] } }],
        EventType: 'POS'
      };
      var startDate = moment.utc(req.body.startDate, 'MM/DD/YYYY HH:mm:ss').add(-7, 'days')._d;
      var endDate = moment.utc(req.body.endDate, 'MM/DD/YYYY HH:mm:ss').add(-1, 'days')._d;

      filter.EventTime = { $gte: startDate, $lte: endDate }

      let tempFilter = { 'StoreId': { $in: storeFilter.stores.map(function (strVale) { return strVale._id }) } };
      filter = Object.assign({}, filter, tempFilter);
      Event.aggregate([
        {
          $match: filter
        }, {
          $group: {
            "_id": null,
            count: { $sum: 1 }
          }
        }
      ]).then((data, error) => {
        resolve((!error && data && data.length > 0) ? data[0].count : 0);
      })
    })
  },

  getTodaysSale: (req, res, storeFilter) => {
    return new Promise((resolve, reject) => {
      let filter = {
        $and: [{ Status: { $nin: ["Void", "Face"] } }],
        EventType: 'POS'
      };
      var startDate = moment.utc(req.body.startDate, 'MM/DD/YYYY HH:mm:ss')._d;
      var endDate = moment.utc(req.body.endDate, 'MM/DD/YYYY HH:mm:ss')._d;
      filter.EventTime = { $gte: startDate, $lte: endDate }
      let tempFilter = { 'StoreId': { $in: storeFilter.stores.map(function (strVale) { return strVale._id }) } };
      filter = Object.assign({}, filter, tempFilter);

      Event.aggregate([
        {
          $match: filter
        }, {
          $group: {
            "_id": null,
            count: { $sum: 1 }
          }
        }
      ]).then((data, error) => {
        resolve((!error && data && data.length > 0) ? data[0].count : 0);
      })
    })
  },

  getYesterdaySale: (req, res, storeFilter) => {
    return new Promise((resolve, reject) => {
      let filter = {
        $and: [{ Status: { $nin: ["Void", "Face"] } }],
        EventType: 'POS'
      };
      var startDate = moment.utc(req.body.startDate, 'MM/DD/YYYY HH:mm:ss').add(-1, 'day')._d;
      var endDate = moment.utc(req.body.endDate, 'MM/DD/YYYY HH:mm:ss').add(-1, 'day')._d;
      filter.EventTime = { $gte: startDate, $lte: endDate }
      let tempFilter = { 'StoreId': { $in: storeFilter.stores.map(function (strVale) { return strVale._id }) } };
      filter = Object.assign({}, filter, tempFilter);

      Event.aggregate([
        {
          $match: filter
        }, {
          $group: {
            "_id": null,
            count: { $sum: 1 }
          }
        }
      ]).then((data, error) => {
        resolve((!error && data && data.length > 0) ? data[0].count : 0);
      })
    })
  },

  suspiciousDashboard: (req, res) => {
    return new Promise((resolve, reject) => {
      var dashboard = require('./dashboard');
      dashboard.getStores(req, res).then(function (storeFilter) {
        let filter = {
          $or: [
            { Category: { $in: ["Void"] } },
            {
              "$and": [
                {
                  "EventType": "POS"
                },
                {
                  Status: { $nin: ["Void", "Face"] }
                },
                {
                  "Total": {
                    "$lt": 2
                  }
                }
              ]
            }
          ]
        };
        let tempFilter = { 'StoreId': { $in: storeFilter.stores.map(function (strVale) { return strVale._id }) } };
        filter = Object.assign({}, filter, tempFilter);
        Event.countDocuments(filter).then((recordCount, error) => {
          if (error) {

            resolve({
              success: true, data: [], count: 0
            })
          }
          if (recordCount == 0) {
            resolve({
              success: true, data: [], count: 0
            })
            return;
          }
          var suspeciousOpenFilter = Object.assign({}, filter, {
            Category: "Void", $or: [{
              AuditStatus: null
            }, {
              AuditStatus: "Not Reviewed"
            }]
          });
          Event.countDocuments(suspeciousOpenFilter).then((openCount, error) => {
            Event.find(filter, {}, {
              limit: 4,
              skip: 0,
              sort: { EventTime: -1 }
            }, function (err, modelData) {
              if (error) {
                resolve({
                  success: true, data: [], count: 0
                })
              } else {
                resolve({
                  success: false, data: modelData, count: recordCount, openCount: openCount
                })
              }
            })
          }).catch(err => {
            resolve({
              success: true, data: [], count: 0
            })
          });
        })
      })
    })
  },

  getDashboardData: (req, res, next) => {
    var dashboard = require('./dashboard');
    dashboard.getStores(req, res).then(function (storeFilter) {
      dashboard.getUserAndCameraCount(req, res, storeFilter).then(function (totalUser) {
        dashboard.getAverageSales(req, res, storeFilter).then(function (averageSales) {
          dashboard.getAverageSales(req, res, storeFilter, true).then(function (averageSalesLastWeek) {
            dashboard.getLastWeekSales(req, res, storeFilter, true).then(function (totalSumLastWeek) {
              dashboard.getTodaysSale(req, res, storeFilter).then(function (todaySale) {
                dashboard.getYesterdaySale(req, res, storeFilter).then(function (yesterdaySale) {
                  dashboard.suspiciousDashboard(req, res).then(function (suspiciousData) {
                    let recentPromotions = [
                      { name: 'Samppa Nori', views: 254, clicks: 146, itemInCart: 5, purchase: 58 },
                      { name: 'Samppa Nori', views: 254, clicks: 146, itemInCart: 8, purchase: 81 },
                      { name: 'Samppa Nori', views: 254, clicks: 146, itemInCart: 1, purchase: 70 },
                      { name: 'Samppa Nori', views: 254, clicks: 146, itemInCart: 2, purchase: 78 },
                      { name: 'Samppa Nori', views: 254, clicks: 146, itemInCart: 9, purchase: 45 }
                    ];

                    res.status(200).json({
                      success: true,
                      data: {
                        storeSalesData: {
                          store: {
                            cameraCount: totalUser.camera,
                            AverageSalesLastWeek: averageSalesLastWeek,
                            userCount: totalUser.user,
                            AverageSales: averageSales,
                            percentageCount: '2.29 (2.05%)',
                            TotalSumLastWeek: totalSumLastWeek,
                            TodaySale: todaySale,
                            DiffSale: yesterdaySale - todaySale,
                            YesterdaySale: yesterdaySale,
                            suspiciousData: suspiciousData
                          },
                          performance: {
                            conversion: { label: ['Grocery', 'Medicine', 'Hardware', 'Stationary', 'Foods'], data: [500, 2800, 180, 450, 85], topvalue: 573, target: '+22%', title: 'Conversion' },
                            sales: { label: ['Grocery', 'Medicine', 'Hardware', 'Stationary', 'Foods'], data: [1025, 665, 128, 340, 510], topvalue: 1283, target: '+69%', title: 'Sales' },
                            profit: { label: ['Grocery', 'Medicine', 'Hardware', 'Stationary', 'Foods'], data: [0.25, 0.32, 0.19, 0.15, 0.38], topvalue: 1.23 + 'M', target: '+91%', title: 'Profit' },
                            upsells: { label: ['Grocery', 'Medicine', 'Hardware', 'Stationary', 'Foods'], data: [0.21, 0.35, 0.18, 0.15, 0.24], topvalue: 829, target: '+28%', title: 'Upsells' }
                          }
                        },
                        recentPromotions: recentPromotions,
                      }
                    });
                  });
                });
              });
            });
          });
        }, function (err) {
        });
      });
    }, function (err) {
    })
  }
}