var moment = require('moment');
const util = require('../util/util');
const excel = require('node-excel-export');
var common = require('../controllers/common');
// const storeNotification = require('../modals/storeNotification');
const Client = require('../modals/client');
const User = require('../modals/user');
const storeNotification = require('../modals/storeNotification');

module.exports = function () {
  var handler = {
    _ModelId: undefined,
    _UniqueKeyFields: undefined,
    _Msg: undefined,

    setModelId: function (id, uniqueRecordField, uniqueErrMsg) {
      this._ModelId = id;
      this._UniqueKeyFields = uniqueRecordField;
      this._Msg = uniqueErrMsg;
    },

    isValid: function (res) {
      if (!this._ModelId) {
        res.send({
          success: false,
          errmsg: 'Collection name is not specified.',
        });
        return false;
      }
      return true;
    },

    uniqueFilter: function (obj) {
      var toReturn = {};
      this._UniqueKeyFields.map(function (field) {
        toReturn[field] = obj[field];
      });
      return toReturn;
    },

    saveRecord: function (req, res, resourceModelObj, cb) {
      resourceModelObj.save((err, data) => {
        if (err) {
          if(req.body.model=='client'&&err&&err.name === 'MongoError' && err.code === 11000){
           return res.json({
              errmsg: 'Client name already exists.',  
              success: false,
            });

          }
          res.send({ success: false, errmsg: err });
          if (cb) cb(err);
          return;
        }
        res.json({ message: 'Record saved successfully', success: true, data });
        if (cb) cb(null, data, req);
      });
    },

    saveBatchRecord: function (req, res, model, cb) {
      var data = req.body;
      model.insertMany(data, function (err, data) {
        if (err) {
          res.send({ success: false, errmsg: err });
          if (cb) cb(err);
          return;
        }
        res.json({ success: true, data });
        if (cb) cb(null, data, req);
      });
    },

    updateRecord: function (req, res, data, cb) {
      var jsonData = JSON.parse(req.body.data);
      Object.assign(data, jsonData).save((err, data) => {
        if (err) {
          if(req.body.model=='client'&&err&&err.name === 'MongoError' && err.code === 11000){
           return res.json({
              errmsg: 'Client name already exists.',  
              success: false,
            });

          }
          res.send(err);
          if (cb) cb(err);
          return;
        }
        res.json({
          message: 'Record updated successfully.',
          data,
          success: true,
        });
        if (cb) cb(null, data, req);
      });
    },

    addFilter: function (filter, find, field) {
      let filterValue = Number(filter.value)
        ? Number(filter.value)
        : filter.value;
      switch (filter.type) {
        case 'string':
          find[field].push({
            [filter.property]: filter.operator
              ? { $regex: String(filterValue), $options: '$i' }
              : filterValue,
          });
          break;
        case 'object':
          find[field].push({ [filter.property]: filterValue.toObjectId() });
          break;
        case 'numeric':
          find[field].push({ [filter.property]: filterValue });
          break;
        case 'date':
          if (filterValue) {
            let calculatedTime = moment
              .utc(filterValue, util.dateFormat.dateFormat)
              .utcOffset(+filter.timezoneOffset, true);
            if (filter.operator == 'gte' || filter.operator == 'lte') {
              find[field].push({
                [filter.property]: {
                  [filter.operator]: calculatedTime.toISOString(),
                },
              });
            } else {
              find[field].push({
                [filter.property]: {
                  $gte: calculatedTime.startOf('day').toISOString(),
                  $lte: calculatedTime.endOf('day').toISOString(),
                },
              });
            }
          }
          break;
        case 'boolean':
          find[field].push({ [filter.property]: filterValue });
          break;
      }
    },

    functionApplyFilters: function (
      filters,
      isSearch,
      modelName,
      selectedValue
    ) {
      var find = { $and: [], $or: [] };
      if (!filters) {
        return find;
      }
      filters = JSON.parse(filters);
      var me = this;
      if (
        selectedValue &&
        selectedValue.length > 2 &&
        JSON.parse(selectedValue)[0] != 'All'
      ) {
        find.$and.push({
          storeId: { $in: JSON.parse(selectedValue).map((strVale) => strVale) },
        });
      }
      if (Array.isArray(filters)) {
        filters.forEach(function (filter) {
          if (filter.property.indexOf('.') <= 0 || modelName == 'siteLogs') {
            me.addFilter(filter, find, isSearch ? '$or' : '$and');
          }
        });
      }
      return find;
    },

    updateGridFilters: function (filters, find, modelName) {
      let allFilters = JSON.parse(filters);
      var me = this;
      if (Array.isArray(allFilters)) {
        allFilters.forEach(function (filter) {
          if (
            (modelName == 'siteLogs' || filter.property.indexOf('.') <= 0) &&
            filter.gridFilter
          ) {
            filter.value = filter.gridFilterValue;
            me.addFilter(filter, find, '$and');
          }
        });
      }
      return find;
    },

    /**
     * function to get all resources
     */
    getResources: async function (
      req,
      res,
      cb,
      isSearch = false,
      defaultFilter
    ) {
      var data = Object.assign({}, req.body, req.query);
      const resourceModel = await util.getModel(this._ModelId);
      var populateField = data.populate || '';
      var query = {};
      var find = this.functionApplyFilters(
        data.filters,
        data.filterText ? true : isSearch,
        null,
        !!resourceModel.schema.paths['storeId'] && data.selectedValue
      );
      find = util.updateFindParams(defaultFilter, find);
      query = common.applySortingAndFilteringInQuery(
        res,
        data,
        query,
        '_id',
        'DESC',
        false
      );
      find = data.filters ? this.updateGridFilters(data.filters, find) : find;
      modelFind = { $and: [] };
      if (find.$and.length > 0) {
        find.$and.forEach(function (singleFilter) {
          modelFind.$and.push(singleFilter);
        });
      }
      if (find.$or.length > 0) {
        modelFind.$and.push({ $or: find.$or });
      }
      if (find.$and.length <= 0 && find.$or.length <= 0) {
        modelFind = {};
      }
      //Query the DB and if no error then send all the objects
      if (!this.isValid(res)) return;

      resourceModel.countDocuments(modelFind, function (err, totalCount) {
        if (err) {
          response = { error: true, message: 'Error fetching data' };
        }
        resourceModel
          .find(modelFind, {}, query, function (err, modelData) {
            // Mongo command to fetch all data from collection.
            if (err) {
              response = { error: true, message: 'Error fetching data' };
              if (cb) {
                cb(response, res);
              } else {
                res.json(response);
              }
            } else {
              var totalPages = Math.ceil(totalCount / query.limit);
              if (data.combos) {
                let combosSplit = data.combos ? data.combos.split(',') : '';
                combos(combosSplit).then(function (comboData) {
                  response = {
                    error: false,
                    message: modelData,
                    pages: totalPages,
                    total: totalCount,
                    records: data.length,
                    combos: comboData,
                  };
                  if (cb) {
                    cb(response, res);
                  } else {
                    res.json(response);
                  }
                });
              } else {
                response = {
                  error: false,
                  data: modelData,
                  pages: totalPages,
                  total: totalCount,
                  records: data.length,
                  combos: [],
                  success: true,
                };
                if (cb) {
                  cb(response, res);
                } else {
                  res.json(response);
                }
              }
            }
          })
          .populate(populateField);
      });
    },

    insertResource: function (req, res, cb, batch) {
      var me = this;
      if (!me.isValid(res)) return;

      //Create new model from request
      util
        .getModel(me._ModelId)
        .then((resourceModel) => {
          var jsonData = JSON.parse(req.body.data);
          let resourceModelObj = new resourceModel(jsonData);
          //Saving model
          if (!!me._UniqueKeyFields) {
            resourceModel.find(
              me.uniqueFilter(resourceModelObj),
              function (err, rows) {
                if (rows && rows.length > 0) {
                  res.json({
                    success: false,
                    errmsg: me._Msg || 'Duplicate Record',
                  });
                } else {
                  me.saveRecord(req, res, resourceModelObj, cb);
                }
              }
            );
          } else {
            if (!batch) {
              me.saveRecord(req, res, resourceModelObj, cb);
            } else {
              me.saveBatchRecord(req, res, resourceModel, cb);
            }
          }
        })
        .catch((reason) => {
          res.send({ success: false, errmsg: reason.message });
          if (cb) cb(err);
        });
    },

    updateResource: function (req, res, cb) {
      var me = this;
      if (!me.isValid(res)) return;
      util.getModel(me._ModelId).then((resourceModel) => {
        resourceModel.findById({ _id: req.params.id }, (err, data) => {
          if (err) {
            res.send(err);
            if (cb) cb(err);
            return;
          }
          if (!!me._UniqueKeyFields) {
            // var jsonData = JSON.parse(req.body.data);
            // let resourceModelObj = new resourceModel(data);
            var search = me.uniqueFilter(data);
            search._id = { $ne: req.params.id };
            resourceModel.find(search, function (err, rows) {
              if (rows && rows.length > 0) {
                res.json({
                  success: false,
                  errmsg: me._Msg || 'Duplicate Record',
                });
              } else {
                if (me._ModelId == 'store') {
                  const storeData = JSON.parse(req.body.data);
                  // if (storeData.storeNotificationEnabled) {
                  if (storeData.storeNotificationId !== null) {
                    storeNotification.findById(
                      { _id: storeData.storeNotificationId },
                      (err, result) => {
                        if (err) {
                          return res.send({
                            error: true,
                            errmsg: err.message,
                          });
                        } else {
                          result.storeNotificationSettings =
                            storeData.notification.storeNotificationSettings;
                          result.storeId = req.params.id;
                          result.day = storeData.notification.day;
                          result.save((err, finalResult) => {
                            if (finalResult) {
                              me.updateRecord(req, res, data, cb);
                            }
                          });
                        }
                      }
                    );
                  } else {
                    const storeNotificationData = storeData.notification;
                    storeNotificationData.storeId = req.params.id;
                    storeNotification.create(
                      storeNotificationData,
                      (err, notificationRseult) => {
                        if (err) {
                          return res.send({
                            error: true,
                            errmsg: err.message,
                          });
                        } else {
                          let jsonData = req.body.data;
                          jsonData = JSON.parse(jsonData);
                          jsonData.storeNotificationId =
                            notificationRseult._id;
                          req.body.data = JSON.stringify(jsonData);
                          me.updateRecord(req, res, data, cb);
                        }
                      }
                    );
                  }
                  // } else {
                  //   me.updateRecord(req, res, data, cb);
                  // }
                } else {
                  me.updateRecord(req, res, data, cb);
                }
              }
            });
          } else {
            me.updateRecord(req, res, data, cb);
          }
        });
      });
    },
    deleteResource: function (req, res, cb) {
      if (!this.isValid(res)) return;
      util.getModel(this._ModelId).then((resourceModel) => {
        var resourceModelObj = resourceModel;
        resourceModelObj.findById(req.params.id, (err, data) => {
          if (err) {
            res.send(err);
            return;
          }
          //If no errors, send it back to the client
          let resourceModelObjNew = new resourceModelObj(data);
          resourceModelObjNew.remove();
          if (err) {
            res.json({ success: false, message: err });
            return;
          }
          if (cb) { cb(req.params.id); }
          res.json({ success: true, message: 'Record deleted successfully.' });
        });
      });
    },

    getResource: function (req, res, onLoad) {
      let params = { ...req.body, ...req.params, ...req.query };
      if (!this.isValid(res)) return;
      util.getModel(this._ModelId).then((resourceModel) => {
        if (req.params.id != 0) {
          resourceModel
            .find({ _id: params.id }, (err, data) => {
              if (err) {
                res.send(err);
                return;
              }
              //If no errors, send it back to the client
              if (onLoad) {
                onLoad(data.length > 0 ? data[0] : {}, res);
              } else {
                res.json(data.length > 0 ? data[0] : {});
              }
            })
            .populate(params.populate || '');
        } else {
          res.json({});
        }
      });
    },

    setExportData(req, res, modelData, cb) {
      var data = Object.assign({}, req.body, req.query);
      var utcTime = Number(data.utcTime) || '';
      var columns = JSON.parse(data.columns);
      const styles = {
        headerDark: {
          fill: {
            fgColor: { rgb: '1F497D' },
          },
          font: {
            color: { rgb: 'FFFFFFFF' },
            sz: 14,
            bold: true,
          },
        },
        cellNormal: {
          fill: {
            fgColor: { rgb: 'FFFFFFFF' },
          },
        },
      };

      // create header
      var specification = {};
      columns.map((col, index) => {
        if (col.export == undefined || col.export) {
          specification[col.key] = {
            displayName: col.name,
            headerStyle: styles.headerDark,
            width: col.width ? col.width : 320,
          };
        }
      });

      let dataset = [];
      modelData.map((val, index) => {
        let set = {};
        columns.map((col, i) => {
          if (
            typeof val[col.key] == 'object' &&
            !(val[col.key] instanceof Date)
          ) {
            let newValue = '';
            if(col.name=='Id'&&col.key=='_id'&&col.cameraId){
                  newValue += val[col.key];
                }
            if(val[col.key] && (val[col.key]._doc || val[col.key]['name']) ) {
                newValue += val[col.key]['name'];
            }
            else {
              let arrayLength =  (val[col.key] && val[col.key].length) || 0;
              val[col.key] &&
                val[col.key].length > 0 &&
                val[col.key].map((val, index) => {
                  newValue += val['name'];
                  if (index + 1 < arrayLength) {
                    newValue += ',';
                  }
                });
            }
            set[col.key] = newValue;
          } else {
            if (col.type == 'date') {
              set[col.key] = moment(val[col.key], 'MM/DD/YYYY')
                .utcOffset(utcTime)
                .format('MM/DD/YYYY HH:mm');
              return;
            }
            set[col.key] =
              col.type == 'number'
                ? val[col.key]
                  ? Number(val[col.key])
                  : val[col.key]
                : val[col.key];
          }
        });
        dataset.push(set);
      });

      const report = excel.buildExport([
        {
          name: 'Report',
          specification: specification,
          data: dataset,
        },
      ]);
      res.attachment('report.xlsx');
      res.send(report);
    },

    getExportRecord: function (req, res, data, cb, defaultFilter) {
      var data = Object.assign({}, req.body, req.query);
      var populateField = data.populate || null;
      var defaultSort = '_id';
      var sortDir = 'DESC';
      var query = {};
      var find = this.functionApplyFilters(data.filters, req.params.id);
      find = util.updateFindParams(defaultFilter, find);
      var me = this;     
      if (data.sort && data.sort != 'undefined') {
        defaultSort = data.sort;
        sortDir = data.sortDir;
      }

      query.sort = {
        [defaultSort]: sortDir == 'DESC' ? -1 : 1,
      };
     
      var modelFind = { $and: find.$and };
      if (modelFind.$and.length == 0) {
        modelFind = {};
      }

      if (req.filter) {
        modelFind = req.filter;
      }

      util.getModel(this._ModelId).then((resourceModel) => {
        resourceModel
          .find(modelFind, {}, query, function (err, modelData) {
            if (err) {
              response = { error: true, message: 'Error fetching data' };
              if (cb) {
                cb(response, res);
              } else {
                res.json(response);
              }
            } else {
              me.setExportData(req, res, modelData, cb);
            }
          })
          .populate(populateField);
      });
    },
  };
  return handler;
};
