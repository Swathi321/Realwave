const excel = require('node-excel-export');
const common = require('./common');
const restHandler = require('./restHandler')();
const user = require('../modals/user');
const AlarmEndpointInsert = require('../modals/alarmEndpointInsert');

const Store = require('../modals/store');
const StoreNotification = require('../modals/storeNotification');
const moment = require('moment');
restHandler.setModelId('AlarmEndpointInsert');
const dashboard = require("./dashboard")

const util = require('../util/util');
const Camera = require('../modals/camera');

String.prototype.toObjectId = function () {
  var ObjectId = require('mongoose').Types.ObjectId;
  return ObjectId(this.toString());
};

async function alarmReport(req, res) {
  try {
    switch (req.body.action) {
      case 'save':
        restHandler.insertResource(req, res);
        break;
      case 'get':
        // restHandler.getResources(req, res);
        common.getListData(
          req,
          res,
          restHandler,
          dashboard,
          util,
          'storeId',
          true
        );
        break;

      default:
        let params = Object.assign({}, req.body, req.query);



        dashboard.getStores(req, res).then(function (storeFilter) {
          var defaultFilter = [{
            storeId: { $in: storeFilter.stores.map(function (strVale) { return strVale._id.toString() }) }
          }];


          switch (req.body.action) {
            case "export":
              getExportRecord(AlarmEndpointInsert, req, res, defaultFilter);
              break;
            default:
              getResources(AlarmEndpointInsert, req, res, defaultFilter, true);
              break;
          }
        });
        // switch (req.body.action) {
        //   case 'export':
        //     await getExportRecord(AlarmEndpointInsert, req, res, defaultFilter);
        //     break;

        //   default:
        //     getResources(AlarmEndpointInsert, req, res, defaultFilter, true);
        //     break;
        // }
        break;
    }
  } catch (error) {
    console.log(error, 'error');
    res.send({
      error: true,
      errmsg: error.message,
    });
  }
}

//Export Functionality

async function getExportRecord(resourceModel, req, res, defaultFilter) {
  var data = Object.assign({}, req.body, req.query);
  var populateField = data.populate || null;
  var defaultSort = 'DateTime';
  var sortDir = 'DESC';
  var query = {};
  var find = functionApplyFilters(data.filters, req.params.id);
  find = util.updateFindParams(defaultFilter, find);
  if (data.sort) {
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
  // query = common.applySortingAndFilteringInQuery(
  //   res,
  //   data,
  //   query,
  //   'DateTime',
  //   'DESC',
  //   false
  // );
  let modelData = []


  modelData = await resourceModel
    .find(modelFind, {}, query)
    .collation({ locale: 'en' })
    .populate('storeId');

  let alarmResult = JSON.parse(JSON.stringify(modelData));
  alarmResult.map(el => {
    el.DateTime = el.alarmStatus == 'activated' ? el.alarmTriggerTime : el.alarmDeactivatedTime;
    return el;
  });
  console.log(alarmResult, 'modelDatamodelData');

  setExportData(req, res, alarmResult);

  
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
      if (filter.operator == "gt" || filter.operator == "lt" || filter.operator == 'eq') {
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
      if (filter.property.indexOf(".") <= 0 || modelName == 'AlarmEndpointInsert') {
        addFilter(filter, find, isSearch ? "$or" : "$and");
      }

    });
  }
  return find;
}
function setExportData(req, res, modelData) {
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
      if (typeof val[col.key] == 'object' && !(val[col.key] instanceof Date)) {

        let newValue = '';
        newValue +=
          val && val[col.key]
            ? val[col.key]['name']
              ? val[col.key]['name']
              : val[col.key]['IsVideoAvailable']
                ? val[col.key]['IsVideoAvailable']
                : ''
            : '';
        set[col.key] = newValue;
      } else {
        if (col.type == 'date') {
          // console.log(utcTime,'$$$$$$$$$$');
          // set[col.key] = moment(val[col.key], 'MM/DD/YYYY HH:mm:ss')
          //   .utcOffset(utcTime)
          //   .format('MM/DD/YYYY HH:mm:ss');
          set[col.key] = moment.utc(val[col.key]).utcOffset(utcTime).format('MM/DD/YYYY HH:mm:ss');
            console.log(set[col.key],'set[col.key]set[col.key]');
            // set[col.key]=val[col.key]
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
  var find = functionApplyFilters(data.filters, req.params.id, data.filterText ? true : isSearch, resourceModel.modelName, !!resourceModel.schema.paths['storeId'] && data.selectedValue);
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
  resourceModel.find(modelFind, {}, query, function (err, modelData) {
    // Mongo command to fetch all data from collection.
    if (err) {
      response = { error: true, message: "Error fetching data" };
    } else {
      let alarmResult = JSON.parse(JSON.stringify(modelData));
      alarmResult.map(el => {
        el.DateTime = el.alarmStatus == 'activated' ? el.alarmTriggerTime : el.alarmDeactivatedTime;
        return el;
      })
      var totalPages = Math.ceil(totalCount / query.limit);
      response = {
        error: false,
        message: "",
        pages: totalPages,
        total: totalCount,
        data: alarmResult,
        combos: []
      };
      res.status(200).json(response);
    }
  }).populate(populateField);
}

function functionApplyFilters1(filters, isSearch, modelName, selectedValue) {
  var find = { $and: [], $or: [] };
  if (!filters) {
    return find;
  }
  filters = JSON.parse(filters);
  var me = this;
  if (
    selectedValue &&
    selectedValue.length &&
    JSON.parse(selectedValue)[0] != 'All'
  ) {
    find.$and.push({
      storeId: { $in: JSON.parse(selectedValue).map((strVale) => strVale) },
    });
  }
  if (Array.isArray(filters)) {
    filters.forEach(async function (filter) {
      if (filter.property.indexOf('.') <= 0 || modelName == 'siteLogs') {
        await addFilter(filter, find, isSearch ? '$or' : '$and');
      }
    });
  }
  return find;
}
module.exports = {
  alarmReport,
};
