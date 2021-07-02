var Receipt = require("./../modals/receipt");
var Event = require("./../modals/Event");
var EventDetail = require("./../modals/EventDetail");
const restHandler = require("./restHandler")();
const util = require('../util/util');
module.exports = {
  getSalesData: (req, res, next) => {
    Event.find({}).then((receipts, error) => {
      let response = { success: true, message: "", data: null };
      if (error) {
        response.message = error;
      } else {
        response.data = receipts;
        response.recordCount = receipts.length;
      }
      res.status(200).json(response);
    });
  },

  getTopSellingItems: (req, res, next) => {
    var data = Object.assign({}, req.body, req.query);
    var matchStore = {};
    let sortField = [data.sort] || "count";
    var find = restHandler.functionApplyFilters(data.filters, data.filterText ? true : false);
    var modelFind = { $and: find.$and, $or: find.$or };
    modelFind.$and.push(
      { ItemId: { $ne: null } }
    );

    if (modelFind.$and.length === 0) {
      delete modelFind["$and"];
    }

    if (modelFind.$or.length === 0) {
      delete modelFind["$or"];
    }
    util.getUserDetail(req.session.user._id).then(function (userData) {
      if (userData && userData.clientId) {
        var ObjectId = (require('mongoose').Types.ObjectId);
        matchStore = {
          'Store.clientId': ObjectId(userData.clientId)
        }
      }
      EventDetail.aggregate([
        {
          $match: modelFind
        },
        {
          $lookup: { from: 'store', localField: 'StoreId', foreignField: '_id', as: 'Store' },
        },
        { "$unwind": { path: "$Store", preserveNullAndEmptyArrays: true } },
        {
          $match: matchStore,
        },
        {
          $group: {
            _id: '$ItemId',  //$region is the column name in collection
            count: { $sum: 1 },
            Category: { $first: "$Category" },
            Name: { $first: "$Name" },
            Total: { $first: "$Total" }
          }
        },
        {
          $facet: {
            records: [
              { $sort: { [sortField]: data.sortDir == "ASC" ? 1 : -1 } },
              { $skip: (Number(data.page) - 1) * Number(data.pageSize) },
              { $limit: Number(data.pageSize) }
            ],
            pageInfo: [
              { $group: { _id: null, count: { $sum: 1 } } },
            ],
          },
        },
      ]).then((receipts, error) => {
        let response = { success: true, message: "", data: null };
        let receiptsData = receipts && receipts.length > 0 ? receipts[0] : null;
        if (error) {
          response.message = error;
        } else {
          if (receiptsData && receiptsData.pageInfo[0]) {
            response.data = receiptsData.records;
            response.recordCount = receiptsData.pageInfo[0].count;
          }
        }
        if (req.body.action == 'export') {
          restHandler.setExportData(req, res, receiptsData ? receiptsData.records : []);
        } else {
          res.status(200).json(response);
        }
      });
    })

  }
};
