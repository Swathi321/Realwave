const restHandler = require('./restHandler')();
restHandler.setModelId('receipt');
var Receipt = require("./../modals/receipt");
var Comment = require("./../modals/comment");
var EventLike = require("./../modals/EventLike");
var User = require("./../modals/user");
var util = require("../util/util");
var moment = require("moment");
const excel = require("node-excel-export");
const { Notification, NotificationParams, Template } = require('./../util/Notification');
const ActivityLogModal = require('./../modals/ActivityLog');
var mongoose = require("mongoose");
const StoreModal = require("./../modals/store");
const EventModel = require("./../modals/Event");
const CameraModel = require("./../modals/camera");
const VideoClipModel = require("./../modals/VideoClip");
const RealwaveVideoClip = require('./../modals/VideoClips');
const eventDetailModel = require("./../modals/EventDetail");
const _ = require('lodash');
var fs = require('fs');
const dashboard = require("./dashboard")
const logger = require('./../util/logger');
const common = require('./common');
const CameraLogModal = require('./../modals/cameraLogs');
const PeopleCountModal = require('./../modals/peopleCount');
const { PEOPLE_COUNT_ACTION } = require('./../util/enum');
const config = require('./../config');
const azure = require('azure-storage');
var blobService = azure.createBlobService(config.azure.account, config.azure.key);
const path = require('path');
const webSocket = require("../plugin/Socket");
const ClientModel=require('../modals/client');

String.prototype.toObjectId = function () {
  var ObjectId = (require('mongoose').Types.ObjectId);
  return ObjectId(this.toString());
};

const receiptAction = (req, res) => {
  common.getData(req, res, restHandler);
};

module.exports = {
  getLastTransation: getLastTransation,
  getNonProcessedEvents: getNonProcessedEvents,
  rejectEvent: rejectEvent,
  POSDataInsert: POSDataInsert,
  RemoteLockDataInsert: RemoteLockDataInsert,
  checkVideoAvailable: checkVideoAvailable,
  GetLastInsertedAlarmEventId: GetLastInsertedAlarmEventId,
  getReceipt: (req, res, next) => {
    let params = Object.assign({}, req.body, req.query),
      response = { success: true, message: "", data: null };
    EventModel.findOne({ InvoiceId: params.InvoiceId }, function (err, eventData) {
      if (err) {
        response.success = false;
        response.message = err.message;
        res.status(200).json(response);
        return;
      }
      eventDetailModel.find({ InvoiceId: params.InvoiceId }, function (erred, eventDetailData) {
        if (erred) {
          response.message = erred.message;
          response.success = false;
        } else {
          response.data = { event: eventData, eventDetail: eventDetailData };
        }
        res.status(200).json(response);
      })
    });
  },
  getReceiptClip: (req, res, next) => {
    let params = Object.assign({}, req.body, req.query),
      response = { success: true, message: "", data: null };
    RealwaveVideoClip.update({ _id: params.Id }, { $set: { ViewedOn: params.ViewedOn || null } }, function (updateError, data) {
      if (updateError) {
        response.message = updateError.message;
        response.success = false;
        res.json(response);
        return;
      }
      if (!data) {
        response.message = 'Clip not found.';
        res.json(response);
        return;
      }
      RealwaveVideoClip.findOne({ _id: params.Id }, function (err, eventData) {
        if (err) {
          response.success = false;
          response.message = err.message;
          res.status(200).json(response);
          return;
        }
        response.data = { event: eventData };
        res.status(200).json(response);
      });
    });
  },
  getSales: (req, res, next) => {
    dashboard.getStores(req, res).then(function (storeFilter) {
      var category = req.body.Category ? JSON.parse(req.body.Category) : null;
      var defaultFilter = [{
        Category: { $in: category ? category : ['Sales'], $nin: req.body.NoCategory ? JSON.parse(req.body.NoCategory) : [] },
        StoreId: { $in: storeFilter.stores.map(function (strVale) { return strVale._id }) }
      }];

      if (category && category.indexOf("SuspiciousTransactions") != -1) {
        defaultFilter = [{
          $or: [{ Category: { "$in": ["Void"] } },
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
          }],
          StoreId: { $in: storeFilter.stores.map(function (strVale) { return strVale._id }) }
        }]
      }
      switch (req.body.action) {
        case "export":
          getExportRecord(EventModel, req, res, defaultFilter);
          break;
        default:
          getResources(EventModel, req, res, defaultFilter);
          break;
      }
    });
  },

  updateReceipt: (req, res, next) => {
    let params = Object.assign({}, req.body, req.query);
    let paramsData = JSON.parse(params.data);
    let modalType = params.isVideoClipModel ? RealwaveVideoClip : EventModel;
    modalType.update({ _id: paramsData.id }, { $set: { AuditStatus: paramsData.auditStatus } }, function (err, data) {
      let resp = {};
      if (err) {
        resp["success"] = false;
        resp["error"] = error;
        res.status(200).json(resp);
        return;
      }
      resp["success"] = true;
      resp["message"] = "Receipt have been successfully updated.";
      res.status(200).json(resp);
    }
    );
  },

  getEventFeed: (req, res, next) => {
    var params = Object.assign({}, req.body, req.query);
    var query = {};
    var startDate = {}, endDate = {}, tag = {};
    dashboard.getStores(req, res).then(function (storeFilter) {
      let match = {
        StoreId: { $in: storeFilter.stores.map(function (strVale) { return strVale._id }) }
      };
      var filter = (req.body.filter != "undefined" && req.body.filter != undefined) && JSON.parse(req.body.filter)
      if (filter && filter.value && filter.value.filter && filter.value.filter.IsVideoAvailable) {
        var val = filter.value.filter.IsVideoAvailable.filterTerm;
        params.isFromEventFeed = val === "1" || val === "true" ? "true" : "false"
      }
      if (params.isFromEventFeed == "true") {
        match.$and = [{
          $or: [{
            IsVideoAvailable: true
          }, {
            IsImageAvailable: true
          }]
        }]
      }
      var category = req.body.Category && req.body.Category.length > 2 ? JSON.parse(req.body.Category) : null;
      if ((req.body.Category && req.body.Category.length > 2) || (req.body.NoCategory && req.body.NoCategory.length > 2)) {
        match = Object.assign({}, match, { Category: { $in: req.body.Category ? category : ['Sales'], $nin: req.body.NoCategory ? JSON.parse(req.body.NoCategory) : [] } });

        if (category && category.indexOf("SuspiciousTransactions") != -1) {
          match = {
            $and: [{
              $or: [{ Category: { "$in": ["Void"] } },
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
              }],
              StoreId: { $in: storeFilter.stores.map(function (strVale) { return strVale._id }) }
            }]
          }

          if (params.isFromEventFeed == "true") {
            match.$and.push({ IsVideoAvailable: true })
          }
        }
      }

      if (filter.gridFilter) {
        var gridFilter = functionApplyFilters(JSON.stringify(filter.gridFilter))
        if (!match.$and && gridFilter["$and"].length > 0) {
          match.$and = [];
        }
        if (!match.$or && gridFilter["$or"].length > 0) {
          match.$or = [];
        }

        if (gridFilter["$and"].length > 0) {
          match.$and = match.$and.concat(gridFilter.$and)
        }

        if (gridFilter["$or"].length > 0) {
          match.$or = match.$or.concat(gridFilter.$or)
        }
      }
      query.sort = {
        ['EventTime']: -1
      };

      if (params.sort && params.sort != "undefined") {
        query.sort = {
          [params.sort]: params.sortDir == "DESC" ? -1 : 1
        };
      }
      if (params.isMobile == 'true') {
        match.$and = [];
        isRejected = { $eq: false };
        if (params.startDate && params.startDate.length > 0) {
          let formatStartDate = moment.utc(params.startDate, util.dateFormat.dateFormat).utcOffset(-params.timezoneOffset, true);
          startDate = { $gte: formatStartDate.startOf("day").toISOString() };
          if (!match.$and) {
            match.$and = [];
          }
          match.$and.push({
            EventTime: startDate
          })
        }
        if (params.endDate && params.endDate.length > 0) {
          let formatEndDate = moment.utc(params.endDate, util.dateFormat.dateFormat).utcOffset(-params.timezoneOffset, true);
          endDate = { $lte: formatEndDate.endOf("day").toISOString() };
          if (!match.$and) {
            match.$and = [];
          }
          match.$and.push({
            EventTime: endDate
          })
        }
        if (params.tag && params.tag != "undefined") {
          tag = { RejectedReason: `/${params.tag}/` };
          if (!match.$and) {
            match.$and = [];
          }
          match.$and.push(tag);
        }
        match.$and.push({ IsRejected: false });
      }

      if (match.$and && match.$and.length == 0) {
        delete match.$and;
      }

      let response = { success: true, message: "", data: null };
      query.skip = Number(params.pageSize) * (Number(params.page));
      query.limit = Number(params.pageSize);
      let filteredEventId = [];
      if (params.query && params.query.length > 0) {
        var updated = util.isValidQuery(params.query, null, true);
        var defaultFilter = {
          $or: updated
        };
        eventDetailModel.countDocuments(defaultFilter, function (err, totalCount) {
          if (err) {
            response = { error: true, message: "Error fetching data" };
          }
          //getResources(EventModel, req, res, defaultFilter, true);
          eventDetailModel.find(defaultFilter, {}, {}, function (err, modelData) {
            let eventDetailData = modelData;
            eventDetailData.forEach(element => {
              filteredEventId.push(element.InvoiceId);
            });

            match = {
              EventId: { $in: filteredEventId.map(function (strVale) { return strVale }) }
            };

            EventModel.countDocuments(match, function (err, totalCount) {
              if (err) {
                response = { error: true, message: "Error fetching data" };
              }
              EventModel.find(match, {}, query, function (err, modelData) {
                // Mongo command to fetch all data from collection.
                if (err) {
                  response = { error: true, message: "Error fetching data" };
                  res.json(response);
                } else {

                  let _ids = [];
                  modelData.forEach(item => {
                    if (item._id !== 0) {
                      _ids.push(item._id);
                    }
                  });
                  EventLike.find({ eventId: { $in: _ids }, }, function (err, eventLikeData) {
                    var newData = []
                    modelData.forEach(item => {
                      var itemData = item.toJSON();
                      let eventLikeDataItem = eventLikeData.filter((e) => e.eventId.toString() === itemData._id.toString() && e.status == 1);
                      let eventUnLikeDataItem = eventLikeData.filter((e) => e.eventId.toString() === itemData._id.toString() && e.status == 2);
                      let userStatusItem = eventLikeData.filter((e) => e.eventId.toString() === itemData._id.toString() && e.userId.toString() == req.session.user._id);
                      itemData.Likes = eventLikeDataItem.length;
                      itemData.UnLikes = eventUnLikeDataItem.length;
                      itemData.UserStatus = userStatusItem && userStatusItem.length > 0 ? userStatusItem[0].status : 0;
                      newData.push(itemData);
                    });
                    response.data = newData;
                    response.recordCount = totalCount;
                    res.json(response);
                  });

                }
              }).collation({ locale: "en" })
                .populate('StoreId CamId');
            }).populate('StoreId CamId');
          })
        })
      }
      else {
        EventModel.countDocuments(match, function (err, totalCount) {
          if (err) {
            response = { error: true, message: "Error fetching data" };
          }
          EventModel.find(match, {}, query, function (err, modelData) {
            // Mongo command to fetch all data from collection.
            if (err) {
              response = { error: true, message: "Error fetching data" };
              res.json(response);
            } else {

              let _ids = [];
              modelData.forEach(item => {
                if (item._id !== 0) {
                  _ids.push(item._id);
                }
              });
              EventLike.find({ eventId: { $in: _ids }, }, function (err, eventLikeData) {
                var newData = []
                modelData.forEach(item => {
                  var itemData = item.toJSON();
                  let eventLikeDataItem = eventLikeData.filter((e) => e.eventId.toString() === itemData._id.toString() && e.status == 1);
                  let eventUnLikeDataItem = eventLikeData.filter((e) => e.eventId.toString() === itemData._id.toString() && e.status == 2);
                  let userStatusItem = eventLikeData.filter((e) => e.eventId.toString() === itemData._id.toString() && e.userId.toString() == req.session.user._id);
                  itemData.Likes = eventLikeDataItem.length;
                  itemData.UnLikes = eventUnLikeDataItem.length;
                  itemData.UserStatus = userStatusItem && userStatusItem.length > 0 ? userStatusItem[0].status : 0;
                  newData.push(itemData);
                });
                response.data = newData;
                response.recordCount = totalCount;
                res.json(response);
              });

            }
          }).collation({ locale: "en" })
            .populate('StoreId CamId');
        }).populate('StoreId CamId');
      }

    })
  },

  getFaceEvents: (req, res, next) => {
    dashboard.getStores(req, res).then(function (storeFilter) {
      var defaultFilter = [
        {
          Category: { $in: ['Face'] },
          StoreId: { $in: storeFilter.stores.map(function (strVale) { return strVale._id }) }
        }

      ];

      switch (req.body.action) {
        case "export":
          getExportRecord(EventModel, req, res, defaultFilter);
          break;
        default:
          getResources(EventModel, req, res, defaultFilter);
          break;
      }
    })
  },

  getEventFeedTimeline: (req, res, next) => {
    var params = Object.assign({}, req.body, req.query);
    var startDate = JSON.parse(params.startDate);
    var endData = JSON.parse(params.endData);
    params = params.filter ? JSON.parse(params.filter) : null;
    var match = {}, query = {};
    if (params) {
      params.forEach((d, i) => {
        match[d.property] = d.value.toObjectId()
      })
      match = Object.assign({}, match, {
        EventTime: {
          $lt: moment(endData).utc(),
          $gte: moment(startDate).utc()
        }
      });
    }

    query.sort = {
      ['EventTime']: -1
    };

    var response = { success: true, message: "", data: null };
    EventModel.find(match, {}, query, function (err, modelData) {
      if (err) {
        response.message = err;
        response.success = false;
      } else {
        response.data = modelData;
        response.recordCount = modelData.length;
      }
      res.status(200).json(response);
    })
  },

  getEventDataById: (req, res, next) => {
    var params = Object.assign({}, req.body, req.query);
    EventModel.find({ _id: params.Id.toObjectId() })
      .sort({ _id: -1 })
      .then(result => {
        res.status(200).json({
          success: true,
          data: result,
          recordCount: result.length
        });
      })
      .catch(err => {
        res.status(404).json({
          success: false,
          message: err.message
        });
      });
  },

  getCommentList: (req, res, next) => {
    var params = Object.assign({}, req.body, req.query);
    let filter = { InvoiceId: Number(params.InvoiceId) };

    if (params.EventId) {
      filter = { EventId: params.EventId.toObjectId() }
    }

    Comment.find(filter)
      .sort({ _id: -1 })
      .populate("userId", User)
      .then(result => {
        res.status(200).json({
          success: true,
          data: result,
          recordCount: result.length
        });
      })
      .catch(err => {
        res.status(404).json({
          success: false,
          message: err.message
        });
      });
  },

  getUserCommentList: (req, res, next) => {
    var params = Object.assign({}, req.body, req.query);
    Comment.find({ userId: params.UserId.toObjectId() })
      .sort({ _id: -1 })
      .populate("userId", User)
      .then(result => {
        res.status(200).json({
          success: true,
          data: result,
          recordCount: result.length
        });
      })
      .catch(err => {
        res.status(404).json({
          success: false,
          message: err.message
        });
      });
  },

  getLastReceipt: async (req, res, next) => {
    var params = Object.assign({}, req.body, req.query);
    let receiptData = {};
    res["success"] = true;
    try {
      receiptData.eventData = await EventModel.findOne({ CamId: params.CameraId.toObjectId(), StoreId: params.StoreId.toObjectId() }).sort({ EventTime: -1 });
      if (receiptData && receiptData.eventData) {
        receiptData.eventDetailData = await eventDetailModel.find({ InvoiceId: receiptData.eventData.InvoiceId });
      }
      res.status(200).json(receiptData);
      return;
    } catch (ex) {
      res["success"] = true;
      return res.status(200).json(receiptData);
    }
  },

  getClientStore: async (req, res, next) => {
    var params = Object.assign({}, req.body, req.query);
    let clientData = {}, defaultFilter = {};
    res["success"] = true;
    try {
      let allSites = await User.find({ _id: params.UserId });
      if (allSites) {
        if (allSites && allSites.length > 0) {
          defaultFilter.$and = [{ _id: { $in: allSites[0].storeId.map((strVale) => strVale) } }];
          clientData.data = await StoreModal.find(defaultFilter).populate("clientId");
          res.status(200).json(clientData);
          return;
        }
      }
    } catch (ex) {
      res["success"] = true;
      return res.status(200).json(clientData);
    }
  },


  addComment: (req, res, next) => {
    var params = Object.assign({}, req.body, req.query);
    var resp = {};
    const newComment = new Comment({
      comment: params.comment,
      rating: params.rating,
      InvoiceId: params.InvoiceId || 0,
      userId: params.userId,
      EventId: params.EventId
    });

    newComment.save().then((data, error) => {
      if (error) {
        resp["success"] = false;
        resp["error"] = error;
        res.status(200).json(resp);
        return;
      }

      let filter = { InvoiceId: params.InvoiceId };

      if (params.EventId) {
        filter = { _id: params.EventId.toObjectId() };
      }
      // Update rating and comment to event.
      EventModel.findOneAndUpdate(
        filter,
        {
          $set: {
            Comment: params.comment,
            Rating: params.rating
          }
        },
        { new: false },
        (err, doc) => {
          if (err) {
            logger.info("Receipt: Unable to update Rating, Comment on Event for InvoiceId: " + params.InvoiceId + ", error: " + err.message);
          }
        }
      );

      resp["success"] = true;
      resp["message"] = "Thanks for rating/comment.";
      res.status(200).json(resp);
    });
  },
  universalSearch1: (req, res, next) => {
    var data = Object.assign({}, req.body, req.query);
    var columns = [];
    if (data.columns) {
      columns = JSON.parse(data.columns);
    }
    var utcTime = '';
    if (data.utcTime) {
      utcTime = Number(data.utcTime) + (data.utcTime.search('-') != -1 ? 60 : 0) || '';
    }
    let newFind = []
    var updated = util.isValidQuery(data.query, null, true);
    let defaultFilter = {
      $or: updated
    };
    var modelFind
    if (data.gridFilter == 'true') {
      var find = functionApplyFilters(
        data.filters,
        req.params.id,
        // data.filterText ? true : isSearch,
        true,
        "eventDetailModel",
        data.selectedValue
      );
      find = util.updateFindParams(newFind, find);
      find = data.filters ? updateGridFilters(data.filters, find) : find;
      modelFind = { $and: find.$and, $or: find.$or };
      if (modelFind.$or.length === 0) {
        delete modelFind['$or'];
      }
      if (modelFind.$and.length === 0) {
        delete modelFind['$and'];
      }
    }


    // defaultFilter = modelFind;

    if (data.selectedValue && data.selectedValue.length > 2 && JSON.parse(data.selectedValue)[0] != 'All') {
      defaultFilter.$and = [{ StoreId: { $in: JSON.parse(data.selectedValue).map((strVale) => strVale) } }];
    }


    var query = {};
    query = common.applySortingAndFilteringInQuery(res, data, query, "EventTime", "DESC", false);

    eventDetailModel.countDocuments(defaultFilter, function (err, totalCount) {
      console.log(err);
      if (err) {
        response = { error: true, message: "Error fetching data" };
      }
      //getResources(EventModel, req, res, defaultFilter, true);
      eventDetailModel.find(defaultFilter, {}, {}, function (err, modelData) {
        let response = { error: false, message: "", records: [], combos: [], total: 0 };
        // Mongo command to fetch all data from collection.
        console.log(err);
        if (err) {
          response = { error: true, message: "Error fetching data" };
        } else {
          var records = modelData;
          records && records.map((element) => { element.Total = (element.SubTotal + element.Tax).toFixed(2) });
          if (req.body.action == "export") {
            const styles = {
              headerDark: {
                fill: {
                  fgColor: {
                    rgb: "1F497D"
                  }
                },
                font: {
                  color: {
                    rgb: "FFFFFFFF"
                  },
                  sz: 14,
                  bold: true
                }
              }
            };

            // create header
            var specification = {};
            columns.map((col, index) => {
              if (col.export == undefined || col.export) {
                specification[col.key] = {
                  displayName: col.name,
                  headerStyle: styles.headerDark,
                  width: col.width ? col.width : 320
                };

                if (col.type == "date") {
                  specification[col.key].cellStyle = {
                    "numFmt": "mm/dd/yyyy HH:mm:ss"
                  }
                }

                if (col.currency == true) {
                  specification[col.key].cellStyle = {
                    "numFmt": "$0.00"
                  }
                }
              }
            });
            let dataset = [];
            let data = JSON.parse(JSON.stringify(records));
            data.map((val, index) => {
              let set = {};
              columns.map((col, i) => {
                if (typeof val[col.key] == "object" && !(val[col.key] instanceof Date)) {
                  let newValue = "";
                  let arrayLength = (val[col.key] && val[col.key].length) || 0;
                  val[col.key] && val[col.key].length > 0 &&
                    val[col.key].map((val, index) => {
                      newValue += val["name"] || val;
                      if (index + 1 < arrayLength) { newValue += ","; }
                    });
                  set[col.key] = newValue;
                } else if (col.nested) {
                  var nestedCols = col.nested.split('.');
                  var setValue = val;
                  for (let j = 0; j < nestedCols.length; j++) {
                    const element = nestedCols[j];
                    if (Array.isArray(setValue)) {
                      var tempValue = [];
                      setValue.forEach(setElement => {
                        tempValue.push(setElement[element])
                      });
                      setValue = tempValue
                    } else {
                      setValue = setValue[element]
                    }
                  }
                  set[col.key] = col.type == "number" ? setValue ? Number(setValue) : setValue : setValue;
                }
                else {
                  if (col.type == "date") {
                    set[col.key] = moment.utc(val[col.key]).utcOffset(utcTime)._d;
                    return;
                  }
                  set[col.key] = col.type == "number" ? val[col.key] ? Number(val[col.key]) : val[col.key] : val[col.key];
                }
              });
              dataset.push(set);
            });
            const report = excel.buildExport([
              {
                name: "Report",
                specification: specification,
                data: dataset
              }
            ]);
            res.attachment("report.xlsx");
            res.send(report);
          } else {
            let eventDetailData = modelData;
            let filteredEventId = [];
            eventDetailData.forEach(element => {
              filteredEventId.push(element.InvoiceId);
            });
            let match = {
              EventId: { $in: filteredEventId.map(function (strVale) { return strVale }) }
            };
            console.log(modelFind, 'modelFindmodelFind');

            modelFind && modelFind.$or ? match.$or = modelFind.$or : null
            // modelFind && modelFind.$and ? match.$and = modelFind.$and : null
            console.log(match, 'match@@@@@@');

            // match.$and = []
            // match.$and = modelFind && modelFind.$and ? modelFind.$and : []
            EventModel.countDocuments(match, function (err, totalCount) {
              console.log(err, '%^&*');
              if (err) {
                response = { error: true, message: "Error fetching data" };
              }
              EventModel.find(match, {}, query, function (err, modelData) {
                // Mongo command to fetch all data from collection.
                if (err) {
                  response = { error: true, message: "Error fetching data" };
                  res.json(response);
                } else {

                  let _ids = [];
                  modelData.forEach(item => {
                    if (item._id !== 0) {
                      _ids.push(item._id);
                    }
                  });
                  EventLike.find({ eventId: { $in: _ids }, }, function (err, eventLikeData) {
                    var newData = []
                    modelData.forEach(item => {
                      var itemData = item.toJSON();
                      let eventLikeDataItem = eventLikeData.filter((e) => e.eventId.toString() === itemData._id.toString() && e.status == 1);
                      let eventUnLikeDataItem = eventLikeData.filter((e) => e.eventId.toString() === itemData._id.toString() && e.status == 2);
                      let userStatusItem = eventLikeData.filter((e) => e.eventId.toString() === itemData._id.toString() && e.userId.toString() == req.session.user._id);
                      itemData.Likes = eventLikeDataItem.length;
                      itemData.UnLikes = eventUnLikeDataItem.length;
                      itemData.UserStatus = userStatusItem && userStatusItem.length > 0 ? userStatusItem[0].status : 0;
                      newData.push(itemData);
                    });
                    response.data = newData;
                    response.recordCount = totalCount;
                    res.status(200).json(response);
                  });
                }
              }).collation({ locale: "en" })
                .populate('StoreId CamId');
            }).populate('StoreId CamId');
            // response = { error: false, message: "", records: records, combos: [], total: totalCount || 0 };
            // res.status(200).json(response);
          }
        }
      })
    })
  },

  universalSearch: async (req, res, next) => {
    try {
      var data = Object.assign({}, req.body, req.query);
      var columns = [];
      if (data.columns) {
        columns = JSON.parse(data.columns);
      }
      var utcTime = '';
      if (data.utcTime) {
        utcTime = Number(data.utcTime) + (data.utcTime.search('-') != -1 ? 60 : 0) || '';
      }

      let newFind = []
      var updated = util.isValidQuery(data.query, null, true);
      let defaultFilter = {
        $or: updated
      };

      var modelFind;
      if (data.sort == 'Total') {
        data.sort = 'Tax'
      }
      if (data.gridFilter == 'true') {
        var find = await functionApplyFilters1(
          data.filters,
          req.params.id,
          true,
          "eventDetailModel",
          data.selectedValue
        );
        find = await util.updateFindParams(newFind, find);
        find = data.filters ? await updateGridFilters1(data.filters, find) : find;

        modelFind = { $and: find.$and, $or: find.$or };
        if (modelFind && modelFind.$or && modelFind.$or.length === 0) {
          delete modelFind['$or'];
        }
        if (modelFind && modelFind.$and && modelFind.$and.length === 0) {
          delete modelFind['$and'];
        }
      }
      // defaultFilter = modelFind;

      if (data.selectedValue && data.selectedValue.length > 2 && JSON.parse(data.selectedValue)[0] != 'All') {
        defaultFilter.$and = [{ StoreId: { $in: JSON.parse(data.selectedValue).map((strVale) => strVale) } }];
      }


      var query = {};
      query = common.applySortingAndFilteringInQuery(res, data, query, "EventTime", "DESC", false);

      let result = await eventDetailModel.countDocuments(defaultFilter)
      // console.log(err);

      // if (err) {
      //   response = { error: true, message: "Error fetching data" };
      // }

      //getResources(EventModel, req, res, defaultFilter, true);

      let modelData = await eventDetailModel.find(defaultFilter, {}, {});
      let response = { error: false, message: "", records: [], combos: [], total: 0 };

      // Mongo command to fetch all data from collection.
      // console.log(err);

      // if (err) {
      //   response = { error: true, message: "Error fetching data" };
      // } else {
      var records = modelData;
      records && records.map((element) => { element.Total = (element.SubTotal + element.Tax).toFixed(2) });


      // let eventDetailData = modelData;
      // let filteredEventId = [];

      // eventDetailData.forEach(element => {
      //   filteredEventId.push(element.InvoiceId);
      // });

      // let match = {
      //   EventId: { $in: filteredEventId.map(function (strVale) { return strVale }) }
      // };
      // modelFind && modelFind.$or ? match.$or = modelFind.$or : null
      // modelFind && modelFind.$and ? match.$and = modelFind.$and : null


      // let totalCount = await EventModel.countDocuments(match)


      // let eventModelData = await EventModel.find(match, {}, query).collation({ locale: "en", numericOrdering: true }).populate('StoreId CamId')


      // let _ids = [];

      // eventModelData.forEach(item => {
      //   if (item._id !== 0) {
      //     _ids.push(item._id);
      //   }

      // });

      // let eventLikeData1 = await EventLike.find({ eventId: { $in: _ids }, });
      // let eventLikeData = JSON.parse(JSON.stringify(eventLikeData1))

      // var newData = []
      // eventModelData.forEach(item => {
      //   var itemData = item.toJSON()
      //   let eventLikeDataItem = eventLikeData.filter((e) => e.eventId.toString() === itemData._id.toString() && e.status == 1);
      //   let eventUnLikeDataItem = eventLikeData.filter((e) => e.eventId.toString() === itemData._id.toString() && e.status == 2);
      //   let userStatusItem = eventLikeData.filter((e) => e.eventId.toString() === itemData._id.toString() && e.userId.toString() == req.session.user._id);
      //   itemData.Likes = eventLikeDataItem.length;
      //   itemData.UnLikes = eventUnLikeDataItem.length;
      //   itemData.UserStatus = userStatusItem && userStatusItem.length > 0 ? userStatusItem[0].status : 0;
      //   newData.push(itemData);
      // });
      if (req.body.action == "export") {
        // let data = newData
        // data && data.map((element) => { element.Total = (element.SubTotal + element.Tax).toFixed(2) });
        // console.log(data.length);


        // var data1 = Object.assign({}, req.body, req.query);



        //   modelFind && modelFind.$or ? defaultFilter.$or = modelFind.$or : null
        //   modelFind && modelFind.$and ? defaultFilter.$and = modelFind.$and : null
        //   if (data1.sort) {
        //     defaultSort = data1.sort;
        //     sortDir = data1.sortDir;
        //   }

        //   query.sort = {
        //     [defaultSort]: sortDir == 'DESC' ? -1 : 1,
        //   };

        //   if (req.filter) {
        //     modelFind = req.filter;

        //   }
        //   console.log(modelFind,'@@@@@@@@@@@@@@@@@',query);
        // let modelData = await eventDetailModel.find(defaultFilter, {}, query);
        // console.log(modelData,'########');

        //   var records = modelData;
        //   records && records.map((element) => { element.Total = (element.SubTotal + element.Tax).toFixed(2) });
        const styles = {
          headerDark: {
            fill: {
              fgColor: {
                rgb: "1F497D"
              }
            },
            font: {
              color: {
                rgb: "FFFFFFFF"
              },
              sz: 14,
              bold: true
            }
          }
        };

        // create header
        var specification = {};
        columns.map((col, index) => {
          if (col.export == undefined || col.export) {
            specification[col.key] = {
              displayName: col.name,
              headerStyle: styles.headerDark,
              width: col.width ? col.width : 320
            };

            if (col.type == "date") {
              specification[col.key].cellStyle = {
                "numFmt": "mm/dd/yyyy HH:mm:ss"
              }
            }

            if (col.currency == true) {
              specification[col.key].cellStyle = {
                "numFmt": "$0.00"
              }
            }
          }
        });
        let dataset = [];
        let data = JSON.parse(JSON.stringify(records));

        data.map((val, index) => {
          let set = {};
          // columns.map((col, i) => {
          //   if (typeof val[col.key] == "object" && !(val[col.key] instanceof Date)) {

          //     console.log("test1");
          //     let newValue = "";
          //     newValue +=
          //           val && val[col.key]
          //           ?
          //           val[col.key]['name'] ? val[col.key]['name'] : val[col.key]['IsVideoAvailable']
          //               ? val[col.key]['IsVideoAvailable'] : ''
          //           : '';
          //     // let arrayLength = (val[col.key] && val[col.key].length) || 0;
          //     // val[col.key] && val[col.key].length > 0 &&
          //     //   val[col.key].map((val, index) => {
          //     //     newValue += val["name"] || val;
          //     //     if (index + 1 < arrayLength) { newValue += ","; }
          //     //   });
          //     // set[col.key] = newValue;
          //   } else if (col.nested) {
          //     console.log('**************');
          //     var nestedCols = col.nested.split('.');
          //     var setValue = val;
          //     for (let j = 0; j < nestedCols.length; j++) {
          //       const element = nestedCols[j];
          //       if (Array.isArray(setValue)) {
          //         var tempValue = [];
          //         setValue.forEach(setElement => {
          //           tempValue.push(setElement[element])
          //         });
          //         setValue = tempValue
          //       } else {
          //         setValue = setValue[element]
          //       }
          //     }
          //     set[col.key] = col.type == "number"||col.type == "numeric" ? setValue ? Number(setValue) : setValue : setValue;
          //   }
          //   else {
          //     if (col.type == "date") {
          //       set[col.key] = moment.utc(val[col.key]).utcOffset(utcTime)._d;
          //       return;
          //     }
          //     set[col.key] = col.type == "number" ||col.type == "numeric"? val[col.key] ? Number(val[col.key]) : val[col.key] : val[col.key];
          //   }
          // });

          //   columns.map((col, i) => {
          //     if (typeof val[col.key] == 'object' && !(val[col.key] instanceof Date)) {

          //       let newValue = '';
          //       newValue +=
          //         val && val[col.key]
          //           ? val[col.key]['name']
          //             ? val[col.key]['name']
          //             : val[col.key]['IsVideoAvailable']
          //               ? val[col.key]['IsVideoAvailable']
          //               : ''
          //           : '';
          //       set[col.key] = newValue;
          //     } else {
          //       if (col.type == 'date') {
          //         set[col.key] = moment(val[col.key], 'MM/DD/YYYY HH:mm:ss')
          //           .utcOffset(utcTime)
          //           ._d
          //         return;
          //       }
          //       set[col.key] =
          //         col.type == 'number' || col.type == 'numeric'
          //           ? val[col.key]
          //             ? Number(val[col.key])
          //             : val[col.key]
          //           : val[col.key];
          //     }
          //   });
          //   dataset.push(set);
          // });

          columns.map((col, i) => {
            if (typeof val[col.key] == "object" && !(val[col.key] instanceof Date)) {
              console.log("test1");
              let newValue = "";
              let arrayLength = (val[col.key] && val[col.key].length) || 0;
              val[col.key] && val[col.key].length > 0 &&
                val[col.key].map((val, index) => {
                  newValue += val["name"] || val;
                  if (index + 1 < arrayLength) { newValue += ","; }
                });
              set[col.key] = newValue;
            } else if (col.nested) {
              var nestedCols = col.nested.split('.');
              var setValue = val;
              for (let j = 0; j < nestedCols.length; j++) {
                const element = nestedCols[j];
                if (Array.isArray(setValue)) {
                  var tempValue = [];
                  setValue.forEach(setElement => {
                    tempValue.push(setElement[element])
                  });
                  setValue = tempValue
                } else {
                  setValue = setValue[element]
                }
              }
              set[col.key] = col.type == "number" || col.type == "numeric" ? setValue ? Number(setValue) : setValue : setValue;
            }
            else {
              if (col.type == "date") {
                set[col.key] = moment.utc(val[col.key]).utcOffset(utcTime)._d;
                return;
              }
              set[col.key] = col.type == "number" || col.type == "numeric" ? val[col.key] ? Number(val[col.key]) : val[col.key] : val[col.key];
            }
          });
          dataset.push(set);
        });
        const report = excel.buildExport([
          {
            name: "Report",
            specification: specification,
            data: dataset
          }
        ]);
        res.attachment("report.xlsx");
        res.send(report);
      } else {
        let eventDetailData = modelData;
        let filteredEventId = [];

        eventDetailData.forEach(element => {
          filteredEventId.push(element.InvoiceId);
        });

        let match = {
          EventId: { $in: filteredEventId.map(function (strVale) { return strVale }) }
        };
        modelFind && modelFind.$or ? match.$or = modelFind.$or : null
        modelFind && modelFind.$and ? match.$and = modelFind.$and : null


        let totalCount = await EventModel.countDocuments(match)


        let eventModelData = await EventModel.find(match, {}, query).collation({ locale: "en", numericOrdering: true }).populate('StoreId CamId')


        let _ids = [];

        eventModelData.forEach(item => {
          if (item._id !== 0) {
            _ids.push(item._id);
          }

        });

        let eventLikeData1 = await EventLike.find({ eventId: { $in: _ids }, });
        let eventLikeData = JSON.parse(JSON.stringify(eventLikeData1))

        var newData = []
        eventModelData.forEach(item => {
          var itemData = item.toJSON()
          let eventLikeDataItem = eventLikeData.filter((e) => e.eventId.toString() === itemData._id.toString() && e.status == 1);
          let eventUnLikeDataItem = eventLikeData.filter((e) => e.eventId.toString() === itemData._id.toString() && e.status == 2);
          let userStatusItem = eventLikeData.filter((e) => e.eventId.toString() === itemData._id.toString() && e.userId.toString() == req.session.user._id);
          itemData.Likes = eventLikeDataItem.length;
          itemData.UnLikes = eventUnLikeDataItem.length;
          itemData.UserStatus = userStatusItem && userStatusItem.length > 0 ? userStatusItem[0].status : 0;
          newData.push(itemData);
        });
        response.data = newData;
        response.recordCount = totalCount;
        res.status(200).json(response);
      }

      // });
      // }
      // }).collation({ locale: "en", numericOrdering: true })
      //   .populate('StoreId CamId');
      // }).populate('StoreId CamId');
      // response = { error: false, message: "", records: records, combos: [], total: totalCount || 0 };
      // res.status(200).json(response);
      // }
      // })
      // })

    } catch (error) {
      logger.error(error);
      res.json(error);
    }

  },

  gridUniversalSearch: (req, res, next) => {
    var data = Object.assign({}, req.body, req.query);
    var columns = [];
    if (data.columns) {
      columns = JSON.parse(data.columns);
    }
    var utcTime = '';
    if (data.utcTime) {
      utcTime = Number(data.utcTime) + (data.utcTime.search('-') != -1 ? 60 : 0) || '';
    }
    var updated = util.isGridValidQuery(data.Query);
    var defaultFilter = {
      $or: updated
    };
    var query = {};
    query = common.applySortingAndFilteringInQuery(res, data, query, "_id", "DESC", true);

    //getResources(EventModel, req, res, defaultFilter, true);
    eventDetailModel.aggregate([
      { $lookup: { from: 'event', localField: 'InvoiceId', foreignField: 'InvoiceId', as: '_events' } },
      { $lookup: { from: 'store', localField: 'StoreId', foreignField: '_id', as: '_stores' } },
      { $lookup: { from: 'camera', localField: '_events.CamId', foreignField: '_id', as: '_camera' } },
      { "$unwind": "$_events" },
      { "$unwind": "$_stores" },
      { "$unwind": "$_camera" },
      {
        $project: {
          InvoiceId: "$InvoiceId", AuditStatus: "$_events.AuditStatus", EventId: "$_events.EventId", EventTime: "$_events.EventTime", EventType: "$_events.EventType", Total: "$_events.Total", Register: "$_events.Register", SubTotal: "$_events.SubTotal"
          , Tax: "$_events.Tax", Discount: "$_events.Discount", OperatorName: "$_events.OperatorName", Status: "$_events.Status", AuditStatus: "$_events.AuditStatus"
          , IsVideoAvailable: "$_events.IsVideoAvailable", Camera: "$_camera.name", Store: "$_stores.name", Category: "$_events.Category", ItemId: "$ItemId", Name: "$Name", Size: "$Size", Category: "$Category"
          , Price: "$Price", RegPrice: "$RegPrice", Qty: "$Qty", "ItemTotal": "$Total", Cost: "$Cost", "ItemDiscount": "$Discount"
        }
      },
      {
        $match: defaultFilter
      },
      {
        $sort: query.sort
      },
      {
        $facet: {
          records: [
            { $skip: query.skip },
            { $limit: query.limit }
          ],
          pageInfo: [
            { $group: { _id: null, count: { $sum: 1 } } }
          ]
        }
      }
    ],
      function (err, modelData) {
        let response = { error: false, message: "", records: [], combos: [], total: 0 };
        // Mongo command to fetch all data from collection.
        if (err) {
          response = { error: true, message: "Error fetching data" };
        } else {
          var records = modelData[0].records;
          if (req.body.action == "export") {
            const styles = {
              headerDark: {
                fill: {
                  fgColor: {
                    rgb: "1F497D"
                  }
                },
                font: {
                  color: {
                    rgb: "FFFFFFFF"
                  },
                  sz: 14,
                  bold: true
                }
              }
            };

            // create header
            var specification = {};
            columns.map((col, index) => {
              if (col.export == undefined || col.export) {
                specification[col.key] = {
                  displayName: col.name,
                  headerStyle: styles.headerDark,
                  width: col.width ? col.width : 320
                };

                if (col.type == "date") {
                  specification[col.key].cellStyle = {
                    "numFmt": "mm/dd/yyyy HH:mm:ss"
                  }
                }

                if (col.currency == true) {
                  specification[col.key].cellStyle = {
                    "numFmt": "$0.00"
                  }
                }
              }
            });
            let dataset = [];
            let data = JSON.parse(JSON.stringify(records));
            data.map((val, index) => {
              let set = {};
              columns.map((col, i) => {
                if (typeof val[col.key] == "object" && !(val[col.key] instanceof Date)) {
                  let newValue = "";
                  let arrayLength = (val[col.key] && val[col.key].length) || 0;
                  val[col.key] && val[col.key].length > 0 &&
                    val[col.key].map((val, index) => {
                      newValue += val["name"] || val;
                      if (index + 1 < arrayLength) { newValue += ","; }
                    });
                  set[col.key] = newValue;
                } else if (col.nested) {
                  var nestedCols = col.nested.split('.');
                  var setValue = val;
                  for (let j = 0; j < nestedCols.length; j++) {
                    const element = nestedCols[j];
                    if (Array.isArray(setValue)) {
                      var tempValue = [];
                      setValue.forEach(setElement => {
                        tempValue.push(setElement[element])
                      });
                      setValue = tempValue
                    } else {
                      setValue = setValue[element]
                    }
                  }
                  set[col.key] = col.type == "number" ? setValue ? Number(setValue) : setValue : setValue;
                }
                else {
                  if (col.type == "date") {
                    set[col.key] = moment.utc(val[col.key]).utcOffset(utcTime)._d;
                    return;
                  }
                  set[col.key] = col.type == "number" ? val[col.key] ? Number(val[col.key]) : val[col.key] : val[col.key];
                }
              });
              dataset.push(set);
            });
            const report = excel.buildExport([
              {
                name: "Report",
                specification: specification,
                data: dataset
              }
            ]);
            res.attachment("report.xlsx");
            res.send(report);
          } else {
            response = { error: false, message: "", records: records, combos: [], total: modelData[0].pageInfo[0] ? modelData[0].pageInfo[0].count : 0 };
            res.status(200).json(response);
          }
        }

      })
  },

  importData: (req, res, next) => {
    const fs = require("fs");
    try {
      fs.readFile(process.cwd() + "/rawdb//JsonData.json", (err, data) => {
        if (err) throw err;
        let student = JSON.parse(data);
        student.map(function (item, index) {
          item.EventTime = item.EventTime ? new Date(item.EventTime) : null;
          item.BusinessDate = item.BusinessDate
            ? new Date(item.BusinessDate)
            : null;
          item.Status = null;
          item.AuditStatus = "Reviewed";
          const newReceipt = new Receipt(item);
          newReceipt.save();
        });
        res.status(200).json({ success: true, message: "Data imported." });
      });
    } catch (ex) {
      res.status(200).json({ success: false, error: ex.message });
    }
  },

  updateData: (req, res, next) => {
    var bulk = Receipt.collection.initializeUnorderedBulkOp();
    Receipt.find({})
      .lean()
      .exec(function (err, results) {
        if (!err) {
          if (results) {
            results.map(function (rec, index) {
              rec.EventTime = rec.EventTime ? new Date(rec.EventTime) : null;
              rec.BusinessDate = rec.BusinessDate
                ? new Date(rec.BusinessDate)
                : null;
              bulk
                .find({ _id: rec._id })
                .upsert()
                .updateOne({ $set: rec });
            });

            bulk.execute().then(function (data) {
              console.log(data);
              res.json({ message: "Record updated successfully.", data: data });
            });
          }
        }
      });
  },

  updateCategoryData: (req, res, next) => {
    var bulk = EventModel.collection.initializeUnorderedBulkOp();
    EventModel.find({
      Category: {
        $exists: false
      }
    }).limit(1000)
      .lean()
      .exec(function (err, results) {
        if (!err) {
          if (results && results.length > 0) {
            results.map(function (rec, index) {
              let category = util.getCategory(rec);
              rec.Category = category;
              bulk
                .find({ _id: rec._id })
                .upsert()
                .updateOne({ $set: rec });
            });

            bulk.execute().then(function (data) {
              console.log(data);
              res.json({ message: "Record updated successfully.", data: data });
            });
          } else {
            res.json({ message: "No record Updated", });
          }
        }
      });
  },
  sendVideoToUser: async (req, res, next) => {
    let data = { ...req.body, ...req.query }, eventDetail = JSON.parse(data.selectedReceipt),
      { Status, Total, OperatorName, Register, EventId, StoreId, VideoClipId } = eventDetail;

    const modelName = eventDetail.EventId ? EventModel : VideoClipModel;
    const getParams = eventDetail.EventId ? { EventId: eventDetail.EventId } : { VideoClipId: eventDetail.VideoClipId };
    await modelName.findOne(getParams, function (err, eventData) {
      StoreId = eventData.StoreId;
      CamId = eventData.CamId;
    }).populate('StoreId CamId');

    const eventStatus = Status != 'Face',
      amount = eventStatus ? Total : '',
      operator = eventStatus ? OperatorName : '',
      terminal = eventStatus ? Register : '',
      template = eventStatus ? (eventDetail.VideoClipId ? Template.Email.VideoLinkSend : Template.Email.EventLinkSend) : Template.Email.FaceVideoLinkSend;
    let np = new NotificationParams();
    np.to = data.email;
    np.template = template;
    np.tags = {
      FirstName: 'User',
      Link: data.path,
      Email: data.email,
      Site: StoreId.name || 'NA',
      EventId: EventId || VideoClipId,
      EventType: Status,
      EventTime: data.eventDate,
      Camera: CamId.name || 'NA',
      Amount: '$' + amount,
      Operator: operator,
      Terminal: terminal
    };
    // Notification.sendInstantEmail(np);
    Notification.sendEmail(np);
    return res.json({ success: true, message: 'video link share success' });
  },
  searchFilterList: (req, res, next) => {
    var updated = util.isValidQuery(req.body.filterText);
    var defaultFilter = {
      $or: updated
    };
    searchResources(EventModel, req, res, defaultFilter, true);
  },
  gridSearchFilterList: (req, res, next) => {
    var updated = util.isGridValidQuery(req.body.filterText);
    var defaultFilter = {
      $or: updated
    };
    searchResources(EventModel, req, res, defaultFilter, true);
  },
  receiptAction: receiptAction,
  event: receiptAction,
 async getActivityLogs(req, res) {
    var defaultFilter = [];
    //based on logged in user 
    let userResult1 = await User.findById(req.session.user._id).populate([
     
      { path: 'roleId' },
      {
        path: 'clientId',
        select: { _id: 1, name: 1, theme: 1, logo: 1, clientType: 1 },
      },
    ]);
        if(userResult1.clientId&&!userResult1.roleId.isAdminRole){
          let clientResult;
          let userIds
          if(userResult1.clientId&&(userResult1.clientType== 'installer'||userResult1.roleId.isInstallerRole)){
            clientResult =await ClientModel.find({$or: [
              { _id: userResult1.clientId },
              { installerId: userResult1.clientId },
            ]},{name:1,clientType:1});
            let clientIds=clientResult.map(el=>el._id);
            let userResult = await User.find({clientId:{$in:clientIds}},{clientId:1,firstName:1});
            userIds=userResult.map(el=>el._id);
          }else{
            userIds=userResult1._id;
          }
         

      //     let clientIds=clientResult.map(el=>el._id);

      //  let userResult = await User.find({clientId:{$in:clientIds}},{clientId:1,firstName:1});

      //  let userIds=userResult.map(el=>el._id);
        defaultFilter.push({$or: [{ userId: {$in:userIds} }]})
        }
    switch (req.body.action) {
      case 'export':
        getExportRecord(ActivityLogModal, req, res, defaultFilter);
        break;
      default:
        getResources(ActivityLogModal, req, res, defaultFilter, true);
        break;
    }
  },

  getCameraLogs(req, res) {
    var defaultFilter = [];
    switch (req.body.action) {
      case 'export':
        getExportRecord(CameraLogModal, req, res, defaultFilter);
        break;
      default:
        getResources(CameraLogModal, req, res, defaultFilter, true);
        break;
    }
  },

  getPeopleCountLogs(req, res) {
    var defaultFilter = [];
    switch (req.body.action) {
      case 'export':
        getExportRecord(PeopleCountModal, req, res, defaultFilter);
        break;
      default:
        getResources(PeopleCountModal, req, res, defaultFilter, true);
        break;
    }
  },

  getPeopleCount(req, res) {
    let params = Object.assign({}, req.body, req.query),
      dateFilter = { start: null, end: null },
      response = { success: true, data: [], message: null };
    return res.json(response);
    const getCount = (stores, currentDate, timezoneOffset) => {
      let query = {}, filter = {}, oneWeekInCount = 0, averageWeekCount = 0, todayInCount = 0, todayOutCount = 0, changeCount = 0, yesterdayInCount = 0;
      let storeData = JSON.parse(stores) || stores;
      let todayDate = moment.utc(currentDate).format(util.dateFormat.peopleCountDateFormat);
      let yesterdayDate = moment.utc(currentDate).subtract(1, 'days').format(util.dateFormat.peopleCountDateFormat);
      let prevDate = moment.utc(currentDate).subtract(6, 'days').format(util.dateFormat.peopleCountDateFormat);

      // to do - camera Brand changes issue in string
      CameraModel.find({ storeId: { $in: storeData }, cameraBrand: 'Hanwha' }, (err, data) => {
        if (err) {
          response = { error: true, message: "Error fetching data" };
          res.json(response);
          return;
        }
        filter.CameraId = { $in: data.map((e) => e._id.toString()) };
        filter.StoreId = { $in: data.map((e) => e.storeId.toString()) };
        filter.PeopleCountDate = { $gte: moment(prevDate).startOf('day'), $lt: moment(todayDate).endOf('day') }

        PeopleCountModal.find(filter, {}, query, function (err, PeopleCountData) {
          let modelData = [];
          // Mongo command to fetch all data from collection.
          if (err) {
            response = { error: true, message: "Error fetching data" };
            res.json(response);
            return;
          } else {
            PeopleCountData.forEach(item => {
              let itemClone = Object.assign({}, JSON.parse(JSON.stringify(item)));
              itemClone.PeopleCountDatetime = item.PeopleCountDate;
              itemClone.PeopleCountDate = moment(item.PeopleCountDate).format(util.dateFormat.peopleCountDataUsed).toString();
              itemClone.time = moment(item.PeopleCountDate).format(util.dateFormat.peopleCountHours).toString();
              modelData.push(itemClone);
            });

            modelData.forEach(function (count) {
              oneWeekInCount += Number(count.InCount);
            });

            let todayData = modelData.filter((e) => e.PeopleCountDate === moment(todayDate).format(util.dateFormat.peopleCountDataUsed).toString());
            let yesterdayData = modelData.filter((e) => e.PeopleCountDate === moment(yesterdayDate).format(util.dateFormat.peopleCountDataUsed).toString());

            todayData.forEach(item => {
              todayInCount += item.InCount;
              todayOutCount += item.OutCount;
            });

            yesterdayData.forEach(item => {
              yesterdayInCount += item.InCount;
            });

            changeCount = Math.abs(todayInCount - yesterdayInCount);

            averageWeekCount = (oneWeekInCount / 7);
            averageWeekCount = Number(averageWeekCount.toFixed());

            response = {
              error: false,
              message: "",
              total: modelData.length,
              records: modelData,
              oneWeekInCount: oneWeekInCount,
              changeCount: changeCount,
              todayInCount: todayInCount,
              todayOutCount: todayOutCount,
              averageWeekCount: averageWeekCount
            };
            res.status(200).json(response);
          }
        }).collation({ locale: "en" });
      });
    }
    const getRow = (data, time) => {
      const getTimeData = (time, data, index) => {
        let item = data[index];
        let count = { inCount: 0, outCount: 0 };
        item = item.find(e => e.time == time);
        if (item) {
          count.inCount = item.InCount;
          count.outCount = item.OutCount;
        }
        return count;
      }

      getDateKey = (data, time) => {
        let obj = {};
        for (let index = 0, len = data.length; index < len; index++) {
          const item = data[index];
          obj = Object.assign(obj, { [moment(data[index][0].PeopleCountDatetime).format('dddd')]: getTimeData(time, data, index) });
        }
        return obj;
      }
      return Object.assign({ time: time }, getDateKey(data, time));
    }

    let getData = (action, peopleCountData) => {
      let data = [], row = [];
      switch (action) {
        case PEOPLE_COUNT_ACTION.HOURLY:
          data = peopleCountData;
          break;

        case PEOPLE_COUNT_ACTION.GRID:
          data = util.groupBy(peopleCountData, "PeopleCountDate");
          for (let index = 0; index < 24; index++) {
            row.push(getRow(data, `${index < 10 ? `0${index}` : index}:00`));
          }
          data = row;
          break;

        case PEOPLE_COUNT_ACTION.DAILY:
          data = util.groupBy(peopleCountData, "PeopleCountDate");
          break;

        case PEOPLE_COUNT_ACTION.WEEKLY:
          let weeklyData = peopleCountData.reduce(function (acc, date) {
            let week = moment(date.PeopleCountDatetime).startOf('week').format('MM/DD') + '-' + moment(date.PeopleCountDatetime).endOf('week').format('MM/DD');
            // check if the week number exists
            if (typeof acc[week] === 'undefined') {
              acc[week] = [];
            }
            acc[week].push(date);
            return acc;
          }, {});

          let finalData = {};
          Object.keys(weeklyData).forEach(week => {
            finalData[week] = { inCount: 0, outCount: 0 };
            weeklyData[week].forEach(day => {
              finalData[week].inCount += day.InCount;
              finalData[week].outCount += day.OutCount;
            });
          });
          data = finalData;
          break;

        default:
          data = [];
          break;
      }
      return data;
    }

    let currentDate = null;
    if (params.currentDate && params.timezoneOffset) {
      currentDate = moment.utc(params.currentDate).format(util.dateFormat.peopleCountDataUsed);
    } else {
      if (params.action != "load") {
        response.message = 'Please enter valid date';
        res.json(response);
        return;
      }
    }

    switch (params.action) {
      case PEOPLE_COUNT_ACTION.LOAD:
        getCount(params.stores, params.currentDate, params.timezoneOffset);
        break;

      case PEOPLE_COUNT_ACTION.HOURLY:
        dateFilter.start = moment(currentDate).startOf('day').toDate();
        dateFilter.end = moment(currentDate).endOf('day').toDate();
        break;

      case PEOPLE_COUNT_ACTION.GRID:
      case PEOPLE_COUNT_ACTION.DAILY:
        dateFilter.start = moment(currentDate).subtract(6, 'days').toDate();;
        dateFilter.end = moment(currentDate).endOf('day').toDate();
        break;

      case PEOPLE_COUNT_ACTION.WEEKLY:
        //TODO: Need To Discussion
        let monthDays = moment(currentDate).daysInMonth();
        dateFilter.start = moment(currentDate).subtract(monthDays, 'days').toDate();
        dateFilter.end = moment(currentDate).endOf('day').toDate();
        break;

      default:
        response.message = 'Invalid Action';
        res.json(response);
        return;
    }

    if (params.action !== PEOPLE_COUNT_ACTION.LOAD) {
      PeopleCountModal.find({
        PeopleCountDate: {
          $gt: dateFilter.start,
          $lte: dateFilter.end
        }
      }, (err, data) => {
        if (err) {
          response.message = err.message;
          logger.error('Receipt:' + err);
          res.json(response);
          return;
        }

        let fetchedData = [];

        data.forEach(item => {
          let itemClone = Object.assign({}, JSON.parse(JSON.stringify(item)));
          itemClone.PeopleCountDatetime = item.PeopleCountDate;
          itemClone.PeopleCountDate = moment(item.PeopleCountDate).format('MM/DD/YYYY').toString();
          itemClone.time = moment(item.PeopleCountDate).format('HH:00').toString();
          fetchedData.push(itemClone);
        });

        response.success = true;
        response.data = getData(params.action, fetchedData);
        res.json(response);
      });
    }
  },

  overlayGraphData: (req, res, next) => {
    let baseUrl = util.IsDev ? '/Backend/' : '/';
    let graphJsonFolder = process.cwd() + baseUrl + 'overlaydDmmyData';
    var data = Object.assign({}, req.body, req.query);
    let jsonFile = data.jsonFile ? 'graph' + data.jsonFile + '.json' : 'graph1.json'
    let records = [];
    if (fs.existsSync(graphJsonFolder)) {
      var filePath = graphJsonFolder + '/' + jsonFile;
      fs.readFile(filePath, 'utf-8', function (responseError, responseBuffer) {
        if (responseError) {// add log and return after error
          logger.error(responseError);
        };

        responseBuffer = responseBuffer.toString();// Make String       
        let parseData = JSON.parse(responseBuffer);
        if (parseData && parseData.dataLine) {
          records = parseData.dataLine;
        }
        response = {
          error: false,
          message: "Graph data load successfully",
          records: records
        };
        res.status(200).json(response);
      })
    } else {
      res.json({
        error: true,
        message: "File not exists"
      });
    }
  },
  getCameraData: (req, res, next) => {
    var params = { ...req.body, ...req.query }
    var query = {};
    dashboard.getStores(req, res).then(function (storeFilter) {
      var match = { CamId: { $in: params.camId } };
      if (!params.camId) {
        match = { StoreId: { $in: storeFilter.stores.map(function (strVale) { return strVale._id }) } };
      }
      if (params.isFromEventFeed == "true") {
        match.$and = [{
          $or: [{
            IsVideoAvailable: true
          }, {
            IsImageAvailable: true
          }]
        }]
        match.$and.push({ IsVideoAvailable: true })
      }
      query.sort = {
        ['EventTime']: -1
      };
      let response = { success: true, message: "", data: null };
      query.skip = Number(params.pageSize) * (Number(params.page));
      query.limit = Number(params.pageSize);
      EventModel.countDocuments(match, function (err, totalCount) {
        if (err) {
          response = { error: true, message: "Error fetching data" };
        }
        EventModel.find(match, {}, query, function (err, modelData) {
          // Mongo command to fetch all data from collection.
          if (err) {
            response = { error: true, message: "Error fetching data" };
            res.json(response);
          } else {

            let _ids = [];
            modelData.forEach(item => {
              if (item._id !== 0) {
                _ids.push(item._id);
              }
            });
            EventLike.find({ eventId: { $in: _ids }, }, function (err, eventLikeData) {
              var newData = []
              modelData.forEach(item => {
                var itemData = item.toJSON();
                let eventLikeDataItem = eventLikeData.filter((e) => e.eventId.toString() === itemData._id.toString() && e.status == 1);
                let eventUnLikeDataItem = eventLikeData.filter((e) => e.eventId.toString() === itemData._id.toString() && e.status == 2);
                let userStatusItem = eventLikeData.filter((e) => e.eventId.toString() === itemData._id.toString() && e.userId.toString() == req.session.user._id);
                itemData.Likes = eventLikeDataItem.length;
                itemData.UnLikes = eventUnLikeDataItem.length;
                itemData.UserStatus = userStatusItem && userStatusItem.length > 0 ? userStatusItem[0].status : 0;
                newData.push(itemData);
              });
              response.data = newData;
              response.recordCount = totalCount;
              res.json(response);
            });
          }
        }).collation({ locale: "en" })
          .populate('StoreId CamId');
      }).populate('StoreId CamId');
    })
  },

  getCameraClipData: async (req, res, next) => {
    var params = { ...req.body, ...req.query }
    var query = {};

    let response = { success: true, message: "", data: null };
    query.skip = Number(params.pageSize) * (Number(params.page));
    query.limit = Number(25);
    let filtersObject = {
      CreatedByUserId: req.session.user._id
    };
    try {
      let clipData = await RealwaveVideoClip.find(filtersObject).populate('StoreId CamId').sort({ _id: -1 });
      response.data = clipData;
      response.recordCount = clipData.length;
      res.json(response);
    }
    catch (err) {
      console.log("error" + err);
      response = { error: true, message: "Error fetching data" };
      res.json(response);
    }
  },
  updateEventDetailData: (req, res, next) => {
    let promises = [];
    let bulk = eventDetailModel.collection.initializeUnorderedBulkOp();
    eventDetailModel.find({
      PrimaryId: {
        $exists: false
      }
    }).limit(5000)
      .lean()
      .exec(function (err, results) {
        if (!err) {
          let resultLen = results && results.length;
          if (resultLen > 0) {
            for (let index = 0; index < resultLen; index++) {
              promises.push(new Promise((resolve, reject) => {
                let rec = results[index];
                let recEventId = rec.EventId;
                if (recEventId) {
                  EventModel.find({ 'EventId': recEventId }, (err, modelData) => {
                    if (err) {
                      reject(null)
                    } else {
                      if (modelData && modelData.length > 0) {
                        let {
                          EventTime,
                          EventType,
                          Register,
                          SubTotal,
                          Tax,
                          Payment,
                          OperatorName,
                          Status,
                          AuditStatus,
                          CamId,
                          StoreId,
                          IsVideoAvailable,
                          id,
                          Total,
                          Discount,
                          Category } = modelData[0];

                        if (EventTime) {
                          rec.EventTime = EventTime;
                        }

                        if (StoreId) {
                          rec.StoreName = StoreId.name || '';
                        }

                        if (CamId) {
                          rec.CamName = CamId.name || '';
                        }

                        rec.IsVideoAvailable = !!IsVideoAvailable;
                        rec.PrimaryId = id;
                        rec = {
                          ...rec, EventType, Register, SubTotal, Tax, Payment, OperatorName, Status, AuditStatus, IsVideoAvailable, InvoiceTotal: Total, InvoiceDiscount: Discount, Category
                        }
                        bulk.find({ _id: rec._id }).upsert().updateOne({ $set: rec });
                      }
                      resolve(modelData)
                    }
                  }).populate("StoreId CamId");
                } else {
                  reject(null)
                }
              }))
            }

            Promise.all(promises).then(() => {
              if (bulk.length > 0) {
                bulk.execute().then(function (bulkResult) {
                  res.json({ message: "Record updated successfully.", data: bulkResult });
                });
              } else {
                res.json({ message: "Record already update.", data: [] });
              }
            })
          } else {
            res.json({ message: "No record Updated", });
          }
        }
      });
  }
};

/**
* @desc Get Last Transation for show on live video while fullscreen mode.
* @param {Object} req - client request object.
* @param {Object} res - server response object.
* @param {Object} next - server next object.
*/
function getLastTransation(req, res, next) {
  const { storeId, camId } = Object.assign({}, req.body, req.query, req.params);
  EventModel.findOne({ CamId: util.mongooseObjectId(camId) }, (err, eventData) => {
    let response = { success: false, data: null, message: '' };
    if (err) {
      response.message = err.message;
      res.json(response);
      return;
    }
    if (eventData) {
      eventDetailModel.find({ InvoiceId: eventData.InvoiceId }, (err, eventDetailData) => {
        response.success = true;
        response.data = { invoice: eventData, invoiceDetail: eventDetailData };
        res.json(response);
      });
    } else {
      response.success = true;
      response.data = { invoice: eventData, invoiceDetail: null };
      res.json(response);
    }
  }).sort({ EventTime: -1 });
}

async function updateGridFilters1(filters, find) {
  let allFilters = JSON.parse(filters);
  if (Array.isArray(allFilters)) {
    for (let i = 0; i < allFilters.length; i++) {
      if (
        allFilters[i].property.indexOf('.') <= 0 &&
        allFilters[i].gridFilter
      ) {
        allFilters[i].value = allFilters[i].gridFilterValue;
        await addFilter(allFilters[i], find, '$and');
      }
    }
    // allFilters.forEach(async (filter) => {
    //   if (filter.property.indexOf('.') <= 0 && filter.gridFilter) {
    //     filter.value = filter.gridFilterValue;
    //     await addFilter(filter, find, '$and');
    //   }
    // });
  }
  return find;
}
function updateGridFilters(filters, find) {
  let allFilters = JSON.parse(filters);
  if (Array.isArray(allFilters)) {
    allFilters.forEach((filter) => {
      if (filter.property.indexOf(".") <= 0 && filter.gridFilter) {
        filter.value = filter.gridFilterValue;
        addFilter(filter, find, "$and");
      }
    });
  }
  return find;
}


async function getResources(resourceModel, req, res, defaultFilter, isSearch) {
  var data = Object.assign({}, req.body, req.query);
  var populateField = data.populate || "";
  var query = {};
  var find = functionApplyFilters(data.filters, req.params.id, data.filterText ? true : isSearch, resourceModel.modelName, !!resourceModel.schema.paths['StoreId'] && data.selectedValue);
  find = util.updateFindParams(defaultFilter, find);
  query = common.applySortingAndFilteringInQuery(res, data, query, "_id", "DESC", false);
  find = data.filters ? updateGridFilters(data.filters, find) : find;
  var modelFind = { $and: find.$and, $or: find.$or };
  if (modelFind.$and.length === 0) {
    delete modelFind["$and"];
  }
  if (modelFind.$or.length === 0) {
    delete modelFind["$or"];
  }

  let totalCount = await resourceModel.countDocuments(modelFind);
  if (totalCount) {
    resourceModel.find(modelFind, {}, query, function (err, modelData) {

      // Mongo command to fetch all data from collection.
      if (err) {
        response = { error: true, message: "Error fetching data" };
      } else {
        var totalPages = Math.ceil(totalCount / query.limit);
        response = {
          error: false,
          message: "",
          pages: totalPages,
          total: totalCount,
          records: modelData,
          combos: []
        };
        res.status(200).json(response);
      }
    }).populate(populateField);

  }else{
    res.status(200).json({error: false, message: ""});
  }

}

function functionGetSearchResult(req, res) {
  return new Promise((resolve, reject) => {
    let data = Object.assign({}, req.body, req.query);
    let detailFilter = util.isValidQuery(data.filterText);
    let defaultFilterDetail = {
      $or: detailFilter
    };
    if (data.selectedValue && data.selectedValue.length > 2 && JSON.parse(data.selectedValue)[0] != 'All') {
      defaultFilterDetail.$and = [{ StoreId: { $in: JSON.parse(data.selectedValue).map((strVale) => strVale) } }];
    }
    var detailQuery = { sort: { createdOn: -1 }, skip: 0, limit: 5 }

    eventDetailModel
      .find(defaultFilterDetail, {}, detailQuery, (err, modelData) => {
        if (err) {
          resolve({ success: false, message: "Error fetching data" })
        } else {
          resolve({ success: true, records: modelData })
        }
      }).populate("StoreId");
  })
}

function searchResources(resourceModel, req, res, defaultFilter) {
  var data = Object.assign({}, req.body, req.query);
  var filterText = data.filterText;
  functionGetSearchResult(req, res).then(function (data) {
    var dataList = [];
    const element = data;
    if (element.success) {
      var records = element.records;
      records = JSON.parse(JSON.stringify(records));
      records.map((value, index) => {
        delete (value._id);
        Object.keys(value).forEach(function (key) {
          if (records[index][key] instanceof Date) {
            delete (key);
            return;
          }
          if (Number(value[key]) != 0 && value[key] != null && value[key] != undefined) {
            if (!(key == "StoreId" || key == "CamId")) {
              if (value[key].toString().toLowerCase().includes(filterText.toLowerCase()) && !Array.isArray(value[key])) {
                dataList.push(value[key]);
              }
            }
          }
        });
      })
    }
    var response = { error: false, message: "", records: removeDups(dataList), combos: [] };
    res.status(200).json(response);
  });
}
function removeDups(data) {
  let unique = {};
  data.forEach(function (i) {
    if (!unique[i]) {
      unique[i] = true;
    }
  });
  return Object.keys(unique);
}

async function addFilter(filter, find, field) {
  let filterValue = Number(filter.value)
    ? Number(filter.value)
    : filter.value;
  switch (filter.type) {
    case "boolean":
      find[field].push({ [filter.property]: filterValue == 1 || filterValue == "true" || filterValue == true ? true : false });
      break;
    case "string":
      find[field].push({
        [filter.property]: filter.operator ? { $regex: String(filterValue), $options: '$i' } : filterValue
      });
      break;
    case "object":
      find[field].push({ [filter.property]: filterValue.toObjectId() });
      break;
    case "numeric":
      if (filter.operator == "gt" || filter.operator == "lt") {
        find[field].push({
          [filter.property]: {
            ["$" + filter.operator]: filterValue
          }
        });
      }
      else {
        find[field].push({ [filter.property]: filterValue });
      }
      break;
    case "total":
      if (filter.operator == "gt" || filter.operator == "lt" || filter.operator == 'eq') {
        let eventDetailIds = await getEventDetailIds(filter.query, filter.value, filter.operator);
        if (eventDetailIds && eventDetailIds.length) {
          find[field].push({
            InvoiceId: {
              $in: eventDetailIds
            }
          });
        }

      }
      break;
    case 'storegrid':
      let query1 = {};
      if (filter.storeId) {
        query1.storeId = filter.storeId.toObjectId();
      }
      query1.name = { $regex: String(filterValue), $options: '$i' };
      let storeIds = await getStoreIds(query1);
      if (storeIds && storeIds.length > 0) {
        find[field].push({
          StoreId: {
            $in: storeIds,
          },
        });
      } else {
        find[field].push({
          StoreId: {
            $in: ['5f97ea221b3e603798e85581'],
          },
        });
      }
      break;
    case "date":
      if (filterValue) {
        let calculatedTime = moment.utc(filterValue, util.dateFormat.dateFormat).utcOffset(-filter.timezoneOffset, true);
        if (filter.operator == "gte" || filter.operator == "lte") {
          find[field].push({
            [filter.property]: { [filter.operator]: calculatedTime.toISOString() }
          });
        } else {
          find[field].push({
            [filter.property]: {
              $gte: calculatedTime.startOf("day").toISOString(),
              $lte: calculatedTime.endOf("day").toISOString()
            }
          });
        }
      }
      break;
  }
}


async function getStoreIds(query1) {
  let storeData = await StoreModal.find(query1, { name: 1 });
  let storeIds = [];
  if (storeData && storeData.length > 0) {
    storeIds = storeData.map((el) => el._id.toString());
  }
  return storeIds;
}
async function getEventDetailIds(filterValue, value, operator) {

  let query = {
    '$or': [
      { AuditStatus: { $regex: String(filterValue), $options: '$i' } },
      { EventType: { $regex: String(filterValue), $options: '$i' } },
      { OperatorName: { $regex: String(filterValue), $options: '$i' } },
      { Status: { $regex: String(filterValue), $options: '$i' } },
      { Store: { $regex: String(filterValue), $options: '$i' } },
      { Camera: { $regex: String(filterValue), $options: '$i' } },
      { Category: { $regex: String(filterValue), $options: '$i' } },
      { Name: { $regex: String(filterValue), $options: '$i' } },
      { Size: { $regex: String(filterValue), $options: '$i' } },
      { StoreName: { $regex: String(filterValue), $options: '$i' } },
      { CamName: { $regex: String(filterValue), $options: '$i' } },


    ]
  }
  let eventDetails = await eventDetailModel.find(query, { SubTotal: 1, Tax: 1, InvoiceId: 1, EventId: 1 });
  let eventData = JSON.parse(JSON.stringify(eventDetails));
  let eventIds = []
  eventData.map(element => {
    let Total = (element.SubTotal + element.Tax).toFixed(2)
    // console.log('@@',value.toFixed(2));
    // if (Total == value) {
    //   eventIds.push(element.InvoiceId)
    // }
    if (operator == 'eq') {
      if (parseFloat(Total) == parseFloat(value)) {

        eventIds.push(element.InvoiceId)
      }
    }
    if (operator == 'gt') {

      if (parseFloat(Total) > parseFloat(value)) {
        eventIds.push(element.InvoiceId)
      }
    }
    if (operator == 'lt') {

      if (parseFloat(Total) < parseFloat(value)) {

        eventIds.push(element.InvoiceId)
      }
    }

  });
  // console.log(eventIds, 'eventIdseventIdseventIds');
  return eventIds
}
async function functionApplyFilters1(filters, id, isSearch, modelName, selectedValue) {
  var find = {
    $and: [],
    $or: []
  };
  if (!filters) {
    return find;
  }
  filters = JSON.parse(filters);
  var me = this;
  if (selectedValue && selectedValue.length > 2 && JSON.parse(selectedValue)[0] != 'All') {
    find.$and.push({ StoreId: { $in: JSON.parse(selectedValue).map((strVale) => strVale) } });
  }
  // if (Array.isArray(filters)) {
  //   filters.forEach(function (filter) {
  //     if (filter.property.indexOf(".") <= 0 || modelName == 'event') {
  //       addFilter(filter, find, isSearch ? "$or" : "$and");
  //     }

  //   });
  // }
  for (let i = 0; i < filters.length; i++) {
    if (
      filters[i].property.indexOf('.') <= 0 || modelName == 'eventDetail' || modelName == 'event'
    ) {
      await addFilter(filters[i], find, isSearch ? '$or' : '$and');
    }
  }
  return find;
}
function functionApplyFilters(filters, id, isSearch, modelName, selectedValue) {
  var find = {
    $and: [],
    $or: []
  };
  if (!filters) {
    return find;
  }
  filters = JSON.parse(filters);
  var me = this;
  if (selectedValue && selectedValue.length > 2 && JSON.parse(selectedValue)[0] != 'All') {
    console.log('test');
    find.$and.push({ StoreId: { $in: JSON.parse(selectedValue).map((strVale) => strVale) } });
  }
  if (Array.isArray(filters)) {
    filters.forEach(function (filter) {
      if (filter.property.indexOf(".") <= 0 || modelName == 'event') {
        addFilter(filter, find, isSearch ? "$or" : "$and");
      }

    });
  }
  return find;
}

function getExportRecord(resourceModel, req, res, defaultFilter) {
  var data = Object.assign({}, req.body, req.query);
  var populateField = data.populate || null;
  var columns = JSON.parse(data.columns);
  var utcTime = Number(data.utcTime) + (data.utcTime.search('-') != -1 ? 60 : 0) || '';
  var defaultSort = "_id";
  var sortDir = "DESC";
  var query = {};
  var find = functionApplyFilters(data.filters, req.params.id);
  find = util.updateFindParams(defaultFilter, find);

  if (data.sort) {
    defaultSort = data.sort;
    sortDir = data.sortDir;
  }
  query.sort = {
    [defaultSort]: sortDir == "DESC" ? -1 : 1
  };

  var modelFind = { $and: find.$and };
  if (modelFind.$and.length == 0) {
    modelFind = {};
  }
  //Query the DB and if no error then send all the objects
  //if (isValid(res)) return;

  resourceModel
    .find(modelFind, {}, query, function (err, modelData) {
      // Mongo command to fetch all data from collection.
      if (err) {
        response = { error: true, message: "Error fetching data" };
      } else {
        const styles = {
          headerDark: {
            fill: {
              fgColor: {
                rgb: "1F497D"
              }
            },
            font: {
              color: {
                rgb: "FFFFFFFF"
              },
              sz: 14,
              bold: true
            }
          }
        };

        // create header
        var specification = {};
        columns.map((col, index) => {
          if (col.export == undefined || col.export) {
            specification[col.key] = {
              displayName: col.name,
              headerStyle: styles.headerDark,
              width: col.width ? col.width : 320
            };

            if (col.type == "date") {
              specification[col.key].cellStyle = {
                "numFmt": "mm/dd/yyyy HH:mm:ss"
              }
            }

            if (col.currency == true) {
              specification[col.key].cellStyle = {
                "numFmt": "$0.00"
              }
            }
          }
        });
        let dataset = [];
        let data = JSON.parse(JSON.stringify(modelData)),
          tId = [];
        data.forEach(item => {
          if (item.InvoiceId !== 0) {
            tId.push(item.InvoiceId);
          }
        });
        let finalData = [];
        Comment.find({ InvoiceId: { $in: tId }, }, function (err, commentData) {
          data.forEach(item => {
            let commentDataItem = commentData.filter((e) => e.InvoiceId === item.InvoiceId);
            item.Investigator = commentDataItem && commentDataItem.length > 0 ? commentDataItem[0].comment : null
            finalData.push(item);
          });
          finalData.map((val, index) => {
            let set = {};
            columns.map((col, i) => {
              if (typeof val[col.key] == "object" && !(val[col.key] instanceof Date)) {
                let newValue = "";
                if (val[col.key] && (val[col.key]._doc || val[col.key]['name'])) {
                  newValue += val[col.key] ? val[col.key]['name'] : val[col.key]['email']
                }
                else {
                  let arrayLength = (val[col.key] && val[col.key].length) || 0;
                  val[col.key] && val[col.key].length > 0 &&
                    val[col.key].map((val, index) => {
                      newValue += val["name"] || val;
                      if (index + 1 < arrayLength) { newValue += ","; }
                    });
                }

                set[col.key] = newValue;
              } else if (col.nested) {
                var nestedCols = col.nested.split('.');
                var setValue = val;
                for (let j = 0; j < nestedCols.length; j++) {
                  const element = nestedCols[j];
                  if (Array.isArray(setValue)) {
                    var tempValue = [];
                    setValue.forEach(setElement => {
                      tempValue.push(setElement[element]);
                    });
                    setValue = tempValue;
                  } else {
                    setValue = setValue ? setValue[element] : "";
                  }
                }
                set[col.key] = col.type == "number" ? setValue ? Number(setValue) : setValue : setValue;
              }
              else {
                if (col.type == "date") {
                  set[col.key] = moment.utc(val[col.key]).utcOffset(utcTime)._d;
                  return;
                }
                set[col.key] = col.type == "number" ? val[col.key] ? Number(val[col.key]) : val[col.key] : val[col.key];
              }
            });
            dataset.push(set);
          });
          const report = excel.buildExport([
            {
              name: "Report",
              specification: specification,
              data: dataset
            }
          ]);
          res.attachment("report.xlsx");
          res.send(report);
        }).sort({ createdAt: -1 })
      }
    })
    .populate(populateField);
}

/**
* @desc Fetch Un Processed Events
* @param {Object} req - client request object.
* @param {Object} res - server response object.
*/
function getNonProcessedEvents(req, res) {
  let params = Object.assign({}, req.body, req.query),
    requestDateTime = moment.utc(params.CurrentDateTime, util.dateFormat.dateTimeFormatAmPm),
    serialNumber = params.SerialKey,
    camUrl = params.CamUrl,
    isForOverlay = params.IsForOverlay,
    maxDateTime = requestDateTime.subtract({ hours: 1 }),
    response = { success: false, message: '', data: [] };

  if (isForOverlay == "True") {
    let filtersObject = {
      IsRejected: false,
      IsOverlayCreated: false,
      IsVideoAvailable: true,
      EventType: util.eventType.Face
    };

    // Get Ecent details by storeId and camera URL.
    EventModel.find(filtersObject, {}, function (err, result) {
      if (err) {
        response.message = err.message;
        res.json(response);
        return;
      }
      if (!result) {
        response.message = 'Event not found.';
        res.json(response);
        return;
      }
      let events = [];

      // Loop through result events to create required event object list.
      result.forEach(item => {
        if (item.EventTime) {
          // Create event object and add to events list.
          events.push({
            eventId: item._id,
            eventType: item.EventType,
            eventTime: item.EventTime,
          });
        }
      });

      // create final response.
      response.success = true;
      response.data = events;
      res.json(response);
    });
  }
  else {
    if (!serialNumber || !camUrl) {
      response.message = 'Invalid ' + (!serialNumber ? 'Serial Number.' : 'Cam Url.');
      logger.info('Receipt: ' + response.message + "\nRequest Url: " + req.originalUrl + "\nRequest Params: " + JSON.stringify(params) + "\nRequest Headers: " + JSON.stringify(req.headers));
      res.json(response);
      return;
    }
    // Get store from searial number.
    StoreModal.findOne({ serialNumber: serialNumber }, function (err, storeResult) {
      if (err) {
        response.message = err.message;
        res.json(response);
        return;
      }
      if (!storeResult) {
        response.message = 'Store not found.';
        res.json(response);
        return;
      }
      let storeId = storeResult._id;

      // Get Camera details by Store Id and Camera URL.
      CameraModel.findOne({ cameraRTSPUrl: camUrl.trim(), storeId: storeId }, function (err, camera) {
        if (err) {
          response.message = err.message;
          res.json(response);
          return;
        }
        if (!camera) {
          response.message = "Camera Not found.";
          res.json(response);
          return;
        }
        let filtersObject = {
          IsRejected: false,
          StoreId: storeId,
          CamId: camera._id,
          EventTime: { $lt: maxDateTime },
          IsVideoAvailable: false
        };

        // Get Ecent details by storeId and camera URL.
        EventModel.find(filtersObject, {}, function (err, result) {
          if (err) {
            response.message = err.message;
            res.json(response);
            return;
          }
          if (!result) {
            response.message = 'Event not found.';
            res.json(response);
            return;
          }
          let events = [];

          // Loop through result events to create required event object list.
          result.forEach(item => {
            if (item.EventTime) {
              let eventTime = moment.utc(item.EventTime),
                recordPreTime = moment.utc(eventTime).subtract({ seconds: camera.recordPreTime }),
                recordPostTime = moment.utc(item.EventType === "Alarm" ? item.EventEndTime : eventTime).add({ seconds: camera.recordPostTime }),
                startTime = recordPreTime.format(util.dateFormat.dateTimeFormatAmPm),
                endTime = recordPostTime.format(util.dateFormat.dateTimeFormatAmPm);

              // Create event object and add to events list.
              events.push({
                eventId: item._id,
                eventType: item.EventType,
                eventTime: item.EventTime,
                startTime: startTime,
                endTime: endTime,
                camId: camera._id
              });
            }
          });

          // create final response.
          response.success = true;
          response.data = events;
          res.json(response);
        });
      });
    });
  }
}

/**
* @desc Update Un Processed Events with reject status to avoid to process.
* @param {Object} req - client request object.
* @param {Object} res - server response object.
*/
async function rejectEvent(req, res) {
  let params = Object.assign({}, req.body, req.query),
    { EventId, Message, Success, FromClipCreation, storeId, token, validity, IsPOSEvent } = params;

  let response = { success: true, message: '' };
  let encryptedValue = await common.sha256(storeId + process.env.secretKey);
  let isValidRequest = token.toLowerCase() == encryptedValue.toLowerCase();
  let checkValidityOfRequest = await common.decrypt(validity);
  if (!isValidRequest || !checkValidityOfRequest) {
    logger.info("Invalid Request due to API time validity expires : " + checkValidityOfRequest + ", is token Invalid : " + isValidRequest);
    response.message = "Invalid request";
    return res.json(response);
  }
  let modelName = util.isNull(FromClipCreation) || IsPOSEvent ? EventModel : VideoClipModel;
  // Update event with video availability.
  modelName.update({ _id: EventId.toObjectId() }, { $set: { IsRejected: Success == "False" ? false : true, RejectedReason: Message || '' } }, function (updateError, data) {
    if (updateError) {
      response.message = updateError.message;
      response.success = false;
      res.json(response);
      return;
    }
    if (!data) {
      response.message = 'Event not found.';
      res.json(response);
      return;
    }
    response.success = true;
    response.message = "Event rejected.";
    res.json(response);
  });
}
async function checkVideoAvailable(req, res) {
  // let items = restHandler.checkVideoAvailableRes(req, res);
  let eventData = [];
  let response = { success: true, message: "", data: null };
  let params = Object.assign({}, req.body, req.query);
  let count = Number(params.count) || 1000;
  let query = { limit: Number(params.limit) || count, skip: Number(params.start) || 0 };
  let methodName = util.isNull(params.isEvent) || params.isEvent.toLowerCase() == 'true' ? EventModel : VideoClipModel;
  let totalRecord = Number(params.totalRecord);
  let loopCount = Math.ceil(totalRecord / count);
  for (let limit = 0; limit <= loopCount; limit++) {
    query.skip = count * limit;
    let result = await methodName.find({ IsVideoAvailable: true }, {}, query);
    if (result.length > 0) {
      eventData = eventData.concat(result);
    }
  }
  if (eventData.length > 0) {
    eventData.forEach(function (event) {
      checkVidoe(event, methodName)
    });
  }
  response.message = "check Video Available done";
  res.json(response);
}
function checkVidoe(event, methodName) {
  return new Promise(resolve => {
    let storeId = event.StoreId.toString(),
      videoName = event._id + ".mp4",
      eventDate = moment.utc(event.EventTime).format(util.dateFormat.dateFolderName),
      azureVideoFileName = path.join(storeId, eventDate, util.videoPath, videoName); // Create path: storeId/date/Videos/eventId.mp4.
    // Create container if does not exists.
    console.log(azureVideoFileName);
    blobService.doesBlobExist(config.azure.container, azureVideoFileName, function (error, result) {
      if (!error) {
        if (!result.exists) {
          methodName.updateOne({ _id: event._id }, { $set: { IsVideoAvailable: false } }, function (err, updateData) {
            if (err) {
              resolve('Error for Update EventModel Table ' + err.message);
            } else {
              resolve('Blob Not exists...');
            }
          });
        }
        resolve('Blob exists...');
      }
      resolve('Error in Blob doesBlobExist...');
    })
  })
}
/**
* @desc Fetch Un Processed Events.
* @param {Array} columns - data columns.
* @param {Array} data - Invoice records array.
* @param {Boolean} isVoid - Value for chcek data for void invoice or not.
*/
function getPayment(columns, data, isVoid) {
  let count = 0,
    records = [];
  cKey = Object.keys(columns);
  cKey.forEach(clName => {
    if (clName.indexOf("InvoicePaid") > -1) {
      count++;
      let invoicePaid = "InvoicePaid" + count,
        methodPay = "MethodPay" + count,
        record = {
          InvPaid: isVoid ? data[invoicePaid] : _.get(_.find(data, invoicePaid), invoicePaid),
          PayMethod: isVoid ? data[methodPay] : _.get(_.find(data, methodPay), methodPay)
        }
      records.push(record);
    }
  });
  return records;
}

/**
* @desc get CamId based Cash Register number mapping
* @param {Object} camData - Store camera data
* @param {Number} register - Register number from onsite.
* @returns {ObjectId} - return cam object id or null
*/
function getCashRegisterCamId(camData, register) {
  let toReturn = null, len = camData.length;
  if (len > 0) {
    for (let index = 0; index < len; index++) {
      const cam = camData[index];
      if (cam.register) {
        let reg = cam.register.split(',');
        if (reg.indexOf(register) > -1) {
          toReturn = cam._id;
          break;
        }
      }
    }
  }
  return toReturn;
}


/**
* @desc get CamId based Cash Register number mapping
* @param {Object} camData - Store camera data
* @param {Number} register - Register number from onsite.
* @returns {ObjectId} - return cam object id or null
*/
function getCashRegisterCamName(camData, register) {
  let toReturn = null, len = camData.length;
  if (len > 0) {
    for (let index = 0; index < len; index++) {
      const cam = camData[index];
      let camRegister = cam.register;
      if (camRegister) {
        let reg = camRegister.split(',');
        if (reg.indexOf(register) > -1) {
          toReturn = cam.name;
          break;
        }
      }
    }
  }
  return toReturn;
}

/**
* @desc get CamId based Cash Register number mapping
* @param {Object} camData - Store camera data
* @param {Number} register - Register number from onsite.
* @returns {ObjectId} - return cam object id or null
*/
function getCashRegisterStoreName(camData, register) {
  let toReturn = null, len = camData.length;
  if (len > 0) {
    for (let index = 0; index < len; index++) {
      const cam = camData[index];
      let camRegister = cam.register;
      if (camRegister) {
        let reg = camRegister.split(',');
        if (reg.indexOf(register) > -1) {
          toReturn = cam.storeId.name || '';
          break;
        }
      }
    }
  }
  return toReturn;
}

/**
* @desc Fetch Un Processed Events
* @param {Object} req - client request object.
* @param {Object} res - server response object.
*/
function POSDataInsert(req, res) {
  var bulk = EventModel.collection.initializeUnorderedBulkOp();
  var bulk2 = eventDetailModel.collection.initializeUnorderedBulkOp();
  var bulkVoid = EventModel.collection.initializeUnorderedBulkOp();
  var bulkVoidDetails = eventDetailModel.collection.initializeUnorderedBulkOp();
  let params = Object.assign({}, req.body, req.query),
    response = { success: true, message: 'All Data successfully uploaded.' };
  let promises = [];
  let lastRecord = {
    invoice: {},
    invoiceDetail: []
  };

  CameraModel.find({ storeId: params.storeId.toObjectId() }, function (err, camData) {
    if (params.voidRecords && params.voidRecords.length > 0) {
      params.voidRecords.forEach(voidItem => {
        let invoiceId = moment.utc(voidItem.InvoiceEventTime).format(util.dateFormat.eventId);
        //Category Add
        let category = util.getCategory({
          EventType: 'POS',
          Total: 0,
          Status: 'Void'
        });
        bulkVoid
          .find({ EventId: Number(voidItem.Id), Status: 'Void' })
          .upsert()
          .updateOne({
            $set: {
              EventId: Number(voidItem.Id),
              EventTime: new Date(moment.utc(voidItem.InvoiceEventTime).format("YYYY-MM-DD HH:mm:ss")),
              EventEndTime: new Date(moment.utc(voidItem.InvoiceEndTime).format("YYYY-MM-DD HH:mm:ss")),
              EventType: 'POS',
              InvoiceId: Number(invoiceId),
              Register: Number(voidItem.InvoiceRegister),
              New: Boolean(voidItem.InvoiceNew),
              SubTotal: 0,
              Tax: 0,
              Total: 0,
              Discount: 0,
              Payment: getPayment(params.invoiceColumns, voidItem, true),
              OperatorName: voidItem.InvoiceOperatorName || '',
              Status: 'Void',
              Category: category,
              AuditStatus: null,
              IsVideoAvailable: false,
              CamId: getCashRegisterCamId(camData, voidItem.InvoiceRegister.toString()),// '5c639cab59aed16c806fb73d'.toObjectId(),
              StoreId: params.storeId.toObjectId(), //Need to confirm from Durlabh sir. - Save/Suspicious Transaction/No Sales
              IsRejected: false
            }
          });

        bulkVoidDetails.find({ EventId: Number(voidItem.Id) })
          .upsert()
          .updateOne({
            $set: {
              EventId: Number(voidItem.Id),
              InvoiceId: Number(invoiceId),
              ItemId: Number(voidItem.ItemId),
              Upc: Number(voidItem.ItemUPC),
              Name: voidItem.ItemName,
              Size: voidItem.ItemSize,
              Category: voidItem.ItemCategory,
              Price: Number(voidItem.ItemPrice),
              RegPrice: Number(voidItem.ItemRegPrice),
              Qty: Number(voidItem.ItemQty),
              Total: Number(voidItem.ItemTotal),
              Cost: Number(voidItem.ItemCost),
              Discount: Number(voidItem.ItemDiscount),
              LineId: Number(voidItem.ItemLineId),
              StoreId: params.storeId.toObjectId(),
              CamId: getCashRegisterCamId(camData, voidItem.InvoiceRegister.toString()),
              EventTime: new Date(moment.utc(voidItem.InvoiceEventTime).format("YYYY-MM-DD HH:mm:ss")),
              EventType: 'POS',
              Register: Number(voidItem.InvoiceRegister),
              SubTotal: Number(voidItem.InvoiceSubTotal),
              Tax: Number(voidItem.InvoiceTax),
              Payment: getPayment(params.invoiceColumns, voidItem, true),
              OperatorName: voidItem.InvoiceOperatorName || '',
              Status: 'Void',
              AuditStatus: null,
              StoreName: getCashRegisterStoreName(camData, voidItem.InvoiceRegister.toString()),
              CamName: getCashRegisterCamName(camData, voidItem.InvoiceRegister.toString()),
              IsVideoAvailable: false,
              InvoiceTotal: 0,
              InvoiceDiscount: 0,
              Category: category
            }
          });
        //  invoiceVoidRecords.push(voidItem)
      });
    }

    if (params.records && params.records.length > 0) {
      invoiceRecords = _.chain(params.records).groupBy("InvoiceId").map(function (i, v) {
        let invoiceDetail = i.map(function (invoiceDetail, index) {
          let invD = {
            EventId: Number(v),
            InvoiceId: Number(v),
            ItemId: Number(invoiceDetail.ItemId),
            Upc: Number(invoiceDetail.ItemUPC),
            Name: invoiceDetail.ItemName,
            Size: invoiceDetail.ItemSize,
            Category: invoiceDetail.ItemCategory,
            Price: Number(invoiceDetail.ItemPrice),
            RegPrice: Number(invoiceDetail.ItemRegPrice),
            Qty: Number(invoiceDetail.ItemQty),
            Total: Number(invoiceDetail.ItemTotal),
            Cost: Number(invoiceDetail.ItemCost),
            Discount: Number(invoiceDetail.ItemDiscount),
            LineId: Number(invoiceDetail.ItemLineId),
            StoreId: params.storeId.toObjectId(),
            CamId: getCashRegisterCamId(camData, invoiceDetail.InvoiceRegister.toString()),
            EventTime: new Date(moment.utc(invoiceDetail.InvoiceEventTime).format("YYYY-MM-DD HH:mm:ss")),
            EventType: 'POS',
            Register: String(invoiceDetail.InvoiceRegister),
            SubTotal: Number(invoiceDetail.InvoiceSubTotal),
            Tax: Number(invoiceDetail.InvoiceTax),
            Payment: params.invoiceColumns ? getPayment(params.invoiceColumns, i) : {},
            OperatorName: invoiceDetail.InvoiceOperatorName || '',
            Status: Number(invoiceDetail.InvoiceTotal) < 1 ? 'NoSales' : 'Sale',
            AuditStatus: null,
            StoreName: getCashRegisterStoreName(camData, invoiceDetail.InvoiceRegister.toString()),
            CamName: getCashRegisterCamName(camData, invoiceDetail.InvoiceRegister.toString()),
            IsVideoAvailable: false,
            InvoiceTotal: Number(invoiceDetail.ItemTotal),
            InvoiceDiscount: Number(invoiceDetail.ItemDiscount),
            Category: invoiceDetail.ItemCategory
          }

          lastRecord.invoiceDetail.push(invD);

          bulk2.find({ InvoiceId: Number(v), LineId: Number(invoiceDetail.ItemLineId) })
            .upsert()
            .updateOne({
              $set: invD
            });
        });
        //Category Add
        let category = util.getCategory({
          EventType: 'POS',
          Total: Number(_.get(_.find(i, 'InvoiceTotal'), 'InvoiceTotal')),
          Status: 'Sale'
        });
        var invoiceOperatorName = _.get(_.find(i, 'InvoiceOperatorName'), 'InvoiceOperatorName')
        console.log('Invoice ' + Number(v) + "Operator " + invoiceOperatorName)

        let registerNumber = _.get(_.find(i, 'InvoiceRegister'), 'InvoiceRegister');
        let camIdFromRegister = getCashRegisterCamId(camData, registerNumber ? registerNumber.toString() : registerNumber);

        let inv = {
          EventId: Number(_.get(_.find(i, 'InvoiceId'), 'InvoiceId')),
          EventTime: new Date(moment.utc((_.get(_.find(i, 'InvoiceEventTime'), 'InvoiceEventTime'))).format("YYYY-MM-DD HH:mm:ss")),
          EventEndTime: new Date(moment.utc((_.get(_.find(i, 'InvoiceEndTime'), 'InvoiceEndTime'))).format("YYYY-MM-DD HH:mm:ss")),
          EventType: 'POS',
          InvoiceId: Number(v),
          Register: String(_.get(_.find(i, 'InvoiceRegister'), 'InvoiceRegister')),
          New: Boolean(_.get(_.find(i, 'InvoiceNew'), 'InvoiceNew')),
          SubTotal: Number(_.get(_.find(i, 'InvoiceSubTotal'), 'InvoiceSubTotal')),
          Tax: Number(_.get(_.find(i, 'InvoiceTax'), 'InvoiceTax')),
          Total: Number(_.get(_.find(i, 'InvoiceTotal'), 'InvoiceTotal')),
          Discount: Number(_.get(_.find(i, 'InvoiceDiscount'), 'InvoiceDiscount')),
          Payment: params.invoiceColumns ? getPayment(params.invoiceColumns, i) : {},
          OperatorName: invoiceOperatorName || '',
          Status: Number(_.get(_.find(i, 'InvoiceTotal'), 'InvoiceTotal')) < 1 ? 'NoSales' : 'Sale',
          Category: category,
          AuditStatus: null,
          IsVideoAvailable: false,
          CamId: camIdFromRegister,
          StoreId: params.storeId.toObjectId(), //Need to confirm from Durlabh sir. - Save/Suspicious Transaction/No Sales
          IsRejected: false
        }


        bulk
          .find({ InvoiceId: Number(v) })
          .upsert()
          .updateOne({
            $set: inv
          });

        lastRecord.invoice = inv;
        if (camIdFromRegister && lastRecord.invoice) {
          webSocket.POSBroadCast(camIdFromRegister.toString(), lastRecord);
        }


        lastRecord.invoiceDetail = lastRecord.invoiceDetail.filter((e) => e.InvoiceId == inv.InvoiceId);
        util.lastInvoiceRecord[params.storeId] = {};
        if (camIdFromRegister) {
          util.lastInvoiceRecord[params.storeId][camIdFromRegister.toString()] = lastRecord;
        }
      }).value();
    }

    if (bulkVoid.length > 0) {
      promises.push(
        new Promise(function (resolve, reject) {
          //documentsArray is the list of sampleCollection objects
          bulkVoid.execute().then(function (data) {
            resolve(data)
          });
        }))
    }

    if (bulkVoidDetails.length > 0) {
      promises.push(
        new Promise(function (resolve, reject) {
          //documentsArray is the list of sampleCollection objects
          bulkVoidDetails.execute().then(function (data) {
            resolve(data)
          });
        }))
    }

    if (bulk.length > 0) {
      promises.push(
        new Promise(function (resolve, reject) {
          //documentsArray is the list of sampleCollection objects
          bulk.execute().then(function (data) {
            resolve(data)
          });
        }))
    }

    if (bulk2.length > 0) {
      promises.push(
        new Promise(function (resolve, reject) {
          //documentsArray is the list of sampleCollection objects
          bulk2.execute().then(function (data) {
            resolve(data)
          });
        }))
    }

    Promise.all(promises).then(function (data) {
      let option = {}, lastVoidItemId = null;
      if (params.voidRecords && params.voidRecords.length > 0) {
        let lastRecord = params.voidRecords[params.voidRecords.length - 1],
          lastVoidItemId = Number(lastRecord.Id);
        option.lastVoidItemId = lastVoidItemId;
      }
      if (params.lastInvoiceId) {
        option.lastInvoiceId = Number(params.lastInvoiceId)
      }
      StoreModal.update({ _id: util.mongooseObjectId(params.storeId) }, { $set: option }, function (err, updateData) {
        if (err) {
          response.success = false;
          response.message = err.message;
          res.json(response);
          return;
        } else {
          res.json(response);
        }
      });
    });
  }).populate("storeId");
};
/**
* @desc Fetch Un RemoteLockDataInsert Events
* @param {Object} req - client request object.
* @param {Object} res - server response object.
*/
function RemoteLockDataInsert(req, res) {
  var bulkVoid = VideoClipModel.collection.initializeUnorderedBulkOp();
  let params = Object.assign({}, req.body, req.query), response = { success: true, message: 'All Data successfully uploaded.' };
  let promises = [];
  let lastRecord = {
    invoice: {},
    invoiceDetail: []
  };
  CameraModel.find({ smartDevices: { $in: params.DeviceName } }, function (err, camData) {
    camData = camData[0];
    if (camData != null) {
      let eventId = moment.utc().format(util.dateFormat.eventId);
      //Category Add
      let preTime = 15;
      let postTime = 15;

      if (camData._id) {
        preTime = camData.recordPreTime && camData.recordPreTime > 0 ? camData.recordPreTime : preTime;
        postTime = camData.recordPostTime && camData.recordPostTime > 0 ? camData.recordPostTime : postTime;
      }

      let currentEventTime = moment.utc();
      let currentEndTime = moment.utc()

      let maxEndTime = moment(currentEventTime._d).add(2, "minutes");

      if (currentEndTime >= maxEndTime) { //10:11 >= 10:12
        currentEndTime = maxEndTime;
      }

      let currentTimeStart = moment(currentEventTime._d);
      let currentTimeEnd = moment(currentEndTime._d);
      camData.EventTime = currentTimeStart.subtract(preTime, "seconds");
      camData.EventEndTime = currentTimeEnd.add(postTime, "seconds");
      if (params.TimeZoneOffset) {
        camData.TimezoneOffset = -params.TimeZoneOffset;
      }

      let recordPreTime = util.GetStoreLocalTimeByStore(camData.EventTime, camData.TimezoneOffset),
        recordPostTime = util.GetStoreLocalTimeByStore(camData.EventEndTime, camData.TimezoneOffset),
        startTime = recordPreTime.format(util.dateFormat.dateTimeFormatAmPm),
        endTime = recordPostTime.format(util.dateFormat.dateTimeFormatAmPm);

      bulkVoid
        .find({ EventId: eventId, Status: 'Clip' })
        .upsert()
        .updateOne({
          $set: {
            EventId: eventId,
            EventTime: startTime,
            EventEndTime: endTime,
            EventType: 'CustomVideoClip',
            InvoiceId: Number(eventId),
            SubTotal: 0,
            Tax: 0,
            Total: 0,
            Discount: 0,
            Status: 'Clip',
            Category: null,
            AuditStatus: null,
            IsVideoAvailable: false,
            CamId: camData._id,
            StoreId: camData.storeId._id,
            IsRejected: false
          }
        });
      if (bulkVoid.length > 0) {
        promises.push(
          new Promise(function (resolve, reject) {
            //documentsArray is the list of sampleCollection objects
            bulkVoid.execute().then(function (data) {
              CameraModel.update({ _id: camData._id }, { $set: { alarmEventId: params.AlarmEvent || null } },
                function (updateError, dataCamera) {
                  if (updateError) {
                    resolve(data)
                  }
                }
              );
            });
          }))
      }
    }
  }).populate("storeId");
};
/**
 * function to get Last Inserted Alarm EventId
 * @param {object} req 
 * @param {object} res 
 */
function GetLastInsertedAlarmEventId(req, res) {
  var cameraModel = mongoose.model("camera");
  var params = Object.assign({}, req.body, req.query);
  var filter = { smartDevices: { $in: params.devicename } };
  var query = cameraModel.findOne(filter).populate('storeId', 'alarmEventId');
  query.lean().exec(function (err, data) {
    if (!err) {
      res.json({ message: 'camera lists.', success: true, data });
    } else {
      res.json({ message: 'camera not found', success: false, data: [] });
    }
  });
}