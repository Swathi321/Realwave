var Event = require('./../modals/Event');
var util = require('../util/util');
const restHandler = require("./restHandler")();
var mongoose = require("mongoose");
const common = require('./common');

module.exports = {
  getSuspiciousTransactions: (req, res, next) => {
    // Export excel file

    util.getUserDetail(req.session.user._id).then(function (userData) {
      var storeFilter = {};
      storeFilter = { '_id': { $in: userData.storeId }, 'status': { $ne: 'Inactive' } };
      if (userData.clientId) {
        storeFilter.clientId = { '$eq': userData.clientId }
      }
      var storeModel = mongoose.model("store");
      var queryStore = storeModel.find(storeFilter);
      queryStore.lean().exec(function (err, storeData) {
        if (!err) {
          if (req.body.action == 'export') {
            req.filter = {
              $or: [{ Status: "Void" }, { Total: { $lt: 1 } }],
              EventType: 'POS'
            };
            if (userData.clientId) {
              req.filter.storeId = { $in: storeData.map(function (strVale) { return strVale._id }) };
            }
            restHandler.setModelId('event');
            restHandler.getExportRecord(req, res);
            return false;
          }

          var data = Object.assign({}, req.body, req.query);
          var query = {};
          var find = restHandler.functionApplyFilters(data.filters);
          find.$and.push({
            $or: [{ Status: "Void" }, { Total: { $lt: 1 } }],
            EventType: 'POS'
          });
          if (userData.clientId) {
            find.$and.push({ storeId: { $in: storeData.map(function (strVale) { return strVale._id }) } });
          }
          query = common.applySortingAndFilteringInQuery(res, data, query, "_id", "DESC", false);      
          var modelFind = { $and: find.$and };
          if (modelFind.$and.length == 0) {
            modelFind = {};
          }
          var response = {};
          Event.countDocuments(modelFind, function (err, totalCount) {
            if (err) {
              response = { error: true, message: "Error fetching data" };
            }
            Event.find(modelFind, {}, query, function (error, receipts) {
              let response = { success: true, message: '', data: null };
              if (error) {
                response.message = error;
              } else {
                let data = JSON.parse(JSON.stringify(receipts));
                response.data = data;
                response.recordCount = data.length;
                response.total = totalCount
              }
              res.status(200).json(response);
            });
          });

        }
      });

    })
  },
};