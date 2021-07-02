const excel = require('node-excel-export');
const common = require('./common');

const restHandler = require('./restHandler')();
restHandler.setModelId('role');
const user = require('../modals/user');
const Scale = require('../modals/scale');
const Store = require('../modals/store');
const StoreNotification = require('../modals/storeNotification');
const moment = require('moment');
restHandler.setModelId('scale');
const util = require('../util/util');
const SiteSmartDevices = require('../modals/siteSmartDevices');
const Camera = require('../modals/camera');
const NotificationQueue = require('../modals/NotificationQueue');
let { response } = require('express');
const { json } = require('body-parser');
String.prototype.toObjectId = function () {
  var ObjectId = require('mongoose').Types.ObjectId;
  return ObjectId(this.toString());
};
async function scale(req, res) {
  try {
    switch (req.body.action) {
      case 'save':
        restHandler.insertResource(req, res);
        break;
      case 'get':
        restHandler.getResources(req, res);
        break;

      default:
        let params = Object.assign({}, req.body, req.query);

        let storeId = params.storeName;
        let pageSize = params.pageSize ? parseInt(params.pageSize) : 20;
        let page = params.page ? parseInt(params.page) : 1;
        let fromDate = params.fromDate;
        let toDate = params.toDate;
        let timezoneOffset = parseInt(params.timezoneOffset);
        let fromWeight = parseFloat(params.fromWeight);
        let toWeight = parseFloat(params.toWeight);

        let defaultFilter = [];

        if (storeId) {
          const storeResult = await Store.findById(storeId);
          if (storeResult) {
            defaultFilter.push({ StoreId: storeResult._id });

          } else {
            defaultFilter.push({ StoreId: storeId });

          }
        }

        //weight filter
        if ((fromWeight || fromWeight == 0) && (toWeight || toWeight == 0)) {
          defaultFilter.push({
            Weight: {
              $gte: fromWeight,
              $lte: toWeight,
            },
          });
        }
        if ((fromWeight && isNaN(toWeight)) || fromWeight == 0) {
          defaultFilter.push({
            Weight: {
              $gte: fromWeight,
            },
          });
        }
        if ((toWeight && isNaN(fromWeight)) || toWeight == 0) {
          defaultFilter.push({
            Weight: {
              $lte: toWeight,
            },
          });
        }
        if (fromDate && params.fromTime && toDate == '') {
          fromDate = new Date(fromDate);
          if (params.fromTime) {
            let fromTime = params.fromTime.split(':');
            fromDate.setHours(fromDate.getHours() + parseInt(fromTime[0]));
            fromDate.setMinutes(fromDate.getMinutes() + parseInt(fromTime[1]));
          }
          // let calculatedTime = moment
          //   .utc(filterValue, util.dateFormat.dateFormat)
          //   .utcOffset(-filter.timezoneOffset, true);
          // fromDate = moment.utc(fromDate).utcOffset(-timezoneOffset, true);
          fromDate = moment.utc(fromDate).utcOffset(timezoneOffset, true);
          defaultFilter.push({
            DateTime: {
              $gte: fromDate,
            },
          });
        }
        if (toDate && params.toTime && fromDate == '') {
          toDate = new Date(toDate);
          if (params.toTime) {
            let toTime = params.toTime.split(':');
            toDate.setHours(toDate.getHours() + parseInt(toTime[0]));
            toDate.setMinutes(toDate.getMinutes() + parseInt(toTime[1]));
          }
          toDate.setSeconds(toDate.getSeconds() + 59);
          toDate.setMilliseconds(999);
          toDate = moment.utc(toDate).utcOffset(timezoneOffset, true);

          defaultFilter.push({
            DateTime: {
              $lte: toDate,
            },
          });
        }

        //DateTime Filter
        if (fromDate && toDate) {
          fromDate = new Date(fromDate);
          //fromDate.setHours(0, 0, 0, 0);
          toDate = new Date(toDate);
          if (!params.fromTime && !params.toTime) {
            toDate.setHours(toDate.getHours() + 23);
            toDate.setMinutes(toDate.getMinutes() + 59);
          }

          toDate.setSeconds(toDate.getSeconds() + 59);
          toDate.setMilliseconds(999);
          if (params.fromTime && params.toTime) {
            let fromTime = params.fromTime.split(':');
            let toTime = params.toTime.split(':');
            fromDate.setHours(fromDate.getHours() + parseInt(fromTime[0]));
            fromDate.setMinutes(fromDate.getMinutes() + parseInt(fromTime[1]));

            toDate.setHours(toDate.getHours() + parseInt(toTime[0]));
            toDate.setMinutes(toDate.getMinutes() + parseInt(toTime[1]));
          }
          fromDate = moment.utc(fromDate).utcOffset(timezoneOffset, true);
          toDate = moment.utc(toDate).utcOffset(timezoneOffset, true);

          defaultFilter.push({
            DateTime: {
              $gte: fromDate,
              $lte: toDate,
            },
          });
        }

        switch (req.body.action) {
          case 'export':
            await getExportRecord(Scale, req, res, defaultFilter);
            break;
          case 'notificationQueue':
            let { id } = req.body;
            console.log('notificationQueue');
            let notificationQueueData = await NotificationQueue.find({
              associationId: id.toObjectId(),
            });
            res.send({
              error: false,
              data: notificationQueueData || [],
            });
            break;
          default:
            getResources(Scale, req, res, defaultFilter, true);
            break;
        }
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
  var find = functionApplyFilters1(data.filters, req.params.id);
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

  if (data.sort == 'IsVideoAvailable'||data.videoFilter=='true') {
    data.page = Number(data.page);
    data.pageSize = Number(data.pageSize);
    let videoSort = data.sortDir == 'DESC' ? -1 : 1

    if (modelFind && modelFind['$and']) {
      modelFind['$and'] = modelFind['$and'].map(el => {
        if (el.DateTime && (typeof el.DateTime['$gte'] != "string" || typeof el.DateTime['$lte'] != "string")) {
          el.DateTime['$gte'] = new Date(el.DateTime['$gte'].toDate());
          el.DateTime['$lte'] = new Date(el.DateTime['$lte'].toDate())


        }
        if (el.DateTime && (typeof el.DateTime['$gte'] == "string" || typeof el.DateTime['$lte'] == "string")) {
          el.DateTime['$gte'] = new Date(el.DateTime['$gte'])
          el.DateTime['$lte'] = new Date(el.DateTime['$lte'])


        }

        return el
      });
    }
    if (modelFind && modelFind['$or']) {
      modelFind['$or'] = modelFind['$or'].map(el => {
        if (el.DateTime) {
          console.log(typeof el.DateTime['$gte']);
          el.DateTime['$gte'] = new Date(el.DateTime['$gte']);
          el.DateTime['$lte'] = new Date(el.DateTime['$lte']);
        }
        return el
      })
    }
    if(data.sort == 'IsVideoAvailable'){
    modelData = await Scale.aggregate([
      {
        $match: modelFind
      },
      { $lookup: { from: "realwaveVideoClip", localField: "VideoClipId", foreignField: "_id", as: "VideoClipId" } },
      { $unwind: { path: '$VideoClipId', preserveNullAndEmptyArrays: true } },

      { $sort: { 'VideoClipId.IsVideoAvailable': videoSort } },


    ]).allowDiskUse(true);
  }
  if(data.videoFilter=="true"){
    let sortValue=data&&data.sortDir&&data.sortDir=='ASC'?1:-1;
    let sortKey;
    if(data&&data.sort&&data.sort=='IsVideoAvailable'){
      sortKey='VideoClipId.IsVideoAvailable'
    }else{
      sortKey=data.sort
    }
    let sortObj={};
   sortObj[sortKey]=sortValue;
    let filterQuery={};
    if(data.withVideo=="true"){
      filterQuery={'VideoClipId.IsVideoAvailable':true}
    }
    if(data.withOutVideo=="true"){
      filterQuery={$or:[{'VideoClipId.IsVideoAvailable':{$exists:false}},{'VideoClipId.IsVideoAvailable':false}]}
    }
    modelData = await Scale.aggregate([
      {
        $match: modelFind
      },
      { $lookup: { from: "realwaveVideoClip", localField: "VideoClipId", foreignField: "_id", as: "VideoClipId" } },
     
      { $unwind: { path: '$VideoClipId', preserveNullAndEmptyArrays: true } },
      
      {
        // $match: {$or:[{'VideoClipId.IsVideoAvailable':{$exists:false}},{'VideoClipId.IsVideoAvailable':false}]}
        $match: filterQuery
      },
      { $sort: sortObj },

     

    ]).allowDiskUse(true);
  }
    modelData = JSON.parse(JSON.stringify(modelData));

    for (let i = 0; i < modelData.length; i++) {
      const scaleResult = await Scale.findOne({ _id: modelData[i]._id }).populate('CamId StoreId ScaleId');
      modelData[i].DateTime = scaleResult.DateTime;
      modelData[i].ScaleId = scaleResult && scaleResult.ScaleId ? scaleResult.ScaleId : el.ScaleId;
      modelData[i].StoreId = scaleResult && scaleResult.StoreId ? scaleResult.StoreId : modelData[i].StoreId;
      modelData[i].CamId = scaleResult && scaleResult.CamId ? scaleResult.CamId : modelData[i].CamId;
    }


    setExportData(req, res, modelData);

  } else {
    modelData = await resourceModel
      .find(modelFind, {}, query)
      .collation({ locale: 'en' })
      .populate('StoreId ScaleId CamId VideoClipId');
    modelData.map(async (el) => {
      if (el.ScaleId == null) {
        const scaleId = await Scale.findById(el._id, { ScaleId: 1 });
        el.ScaleId = scaleId.ScaleId;
      }
      if (el.StoreId == null) {
        const storeId = await Scale.findById(el._id, { StoreId: 1 });
        el.StoreId = storeId.StoreId;
      }
      if (el.CamId == null) {
        const camId = await Scale.findById(el._id, { CamId: 1 });
        el.CamId = camId.CamId;
      }


    })

    
    setExportData(req, res, modelData);

    // totalCount = await resourceModel.countDocuments(modelFind);
    // totalPages = Math.ceil(totalCount / query.limit);
    // scaleData = JSON.parse(JSON.stringify(scaleData));
  }

  // if (data.sort == 'IsVideoAvailable') {
  //   data.page = Number(data.page);
  //   data.pageSize = Number(data.pageSize)
  //   modelData = await Scale.aggregate([
  //     {
  //       $match: modelFind
  //     },
  //     { $lookup: { from: "realwaveVideoClip", localField: "VideoClipId", foreignField: "_id", as: "VideoClipId" } },
  //     { $lookup: { from: "store", localField: "StoreId", foreignField: "_id", as: "StoreId" } },
  //     { $lookup: { from: "camera", localField: "CamId", foreignField: "_id", as: "CamId" } },

  //     { $unwind: '$VideoClipId' },
  //     { $unwind: '$StoreId' },
  //     { $unwind: '$CamId' },

  //     { $sort: { 'VideoClipId.IsVideoAvailable': data.sortDir == 'DESC' ? -1 : 1 } },

  //   ]);
  //   setExportData(req, res, modelData);

  // } else {
  //   modelData = await resourceModel
  //     .find(modelFind, {}, query).populate('StoreId ScaleId CamId VideoClipId');
  //   setExportData(req, res, modelData);

  // }
  // resourceModel
  //   .find(modelFind, {}, query, function (err, modelData) {
  //     if (err) {
  //       response = { error: true, message: 'Error fetching data' };

  //       res.json(response);
  //     } else {
  //       setExportData(req, res, modelData);
  //     }
  //   })
  //   .populate('StoreId ScaleId CamId VideoClipId');
}
async function getScaleIDs(query) {
  console.log(query, 'query');
  let scaleData = await SiteSmartDevices.find(query, { name: 1 });
  let scaleIds = [];
  if (scaleData && scaleData.length > 0) {
    scaleIds = scaleData.map((el) => el._id);
  }
  return scaleIds;
}
async function getCameraIds(query1) {
  let cameraData = await Camera.find(query1, { name: 1 });
  let cameraIds = [];
  if (cameraData && cameraData.length > 0) {
    cameraIds = cameraData.map((el) => el._id.toString());
  }
  return cameraIds;
}
async function addFilter(filter, find, field) {
  let filterValue = Number(filter.value) ? Number(filter.value) : filter.value;
  switch (filter.type) {
    case 'boolean':
      find[field].push({
        [filter.property]:
          filterValue == 1 || filterValue == 'true' || filterValue == true
            ? true
            : false,
      });
      break;
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
    case 'scaleid':
      let query = {};
      if (filter.storeId) {
        query.storeId = filter.storeId.toObjectId();
      }
      query.name = { $regex: String(filterValue), $options: '$i' };
      // let scaleData = await SiteSmartDevices.find(query, { name: 1 });
      // let scaleData=[{_id:'5ff5b5ad9e335a413420fa8a'}]
      // scaleData=JSON.parse(JSON.stringify(scaleData))
      // console.log(scaleData,'scaleData#############');
      let scaleIds = await getScaleIDs(query);
      if (scaleIds && scaleIds.length > 0) {
        find[field].push({
          ScaleId: {
            $in: scaleIds,
          },
        });
      } else {
        console.log('Not FOUNDDDDDD');
        find[field].push({
          ScaleId: {
            $in: ['5f97ea221b3e603798e85581'],
          },
        });
      }

      break;
    case 'camid':
      let query1 = {};
      if (filter.storeId) {
        query1.storeId = filter.storeId.toObjectId();
      }
      query1.name = { $regex: String(filterValue), $options: '$i' };
      let camIds = await getCameraIds(query1);
      if (camIds && camIds.length > 0) {
        find[field].push({
          CamId: {
            $in: camIds,
          },
        });
      } else {
        find[field].push({
          CamId: {
            $in: ['5f97ea221b3e603798e85581'],
          },
        });
      }
      break;
    case 'numeric':
      if (
        filter.operator == 'gt' ||
        filter.operator == 'lt' ||
        filter.operator == 'lte' ||
        filter.operator == 'gte' ||
        filter.operator == 'eq'
      ) {
        find[field].push({
          [filter.property]: {
            ['$' + filter.operator]: filterValue,
          },
        });
      } else {
        find[field].push({ [filter.property]: filterValue });
      }
      break;
    case 'date':
      if (filterValue) {
        let calculatedTime = moment
          .utc(filterValue, util.dateFormat.dateFormat)
          .utcOffset(filter.timezoneOffset, true);
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
  }
}
async function functionApplyFilters(
  filters,
  id,
  isSearch,
  modelName,
  selectedValue
) {
  var find = { $and: [], $or: [] };
  if (!filters) {
    return find;
  }
  filters = JSON.parse(filters);

  // console.log(JSON.parse(selectedValue),'JSON.parse(selectedValue)');
  if (
    selectedValue &&
    selectedValue.length &&
    JSON.parse(selectedValue)[0] != 'All'
  ) {
    find.$and.push({
      StoreId: { $in: JSON.parse(selectedValue).map((strVale) => strVale) },
    });
  }
  if (Array.isArray(filters)) {
    filters.forEach(async function (filter) {
      if (filter.property.indexOf('.') <= 0 || modelName == 'scale') {
        await addFilter(filter, find, isSearch ? '$or' : '$and');
      }
    });
  }
  return find;
}
function setExportData(req, res, modelData) {
  var data = Object.assign({}, req.body, req.query);
  var utcTime = Number(data.timezoneOffset) || '';
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
          set[col.key] = moment(val[col.key], 'MM/DD/YYYY HH:mm:ss')
            .utcOffset(utcTime)
            .format('MM/DD/YYYY HH:mm:ss');
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

// async function updateGridFilters(filters, find) {
//   let allFilters = JSON.parse(filters);
//   if (Array.isArray(allFilters)) {
//     allFilters.forEach(async (filter) => {
//       if (filter.property.indexOf('.') <= 0 && filter.gridFilter) {
//         filter.value = filter.gridFilterValue;
//         await addFilter(filter, find, '$and');
//       }
//     });
//   }
//   return find;
// }
async function updateGridFilters(filters, find) {
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
async function getResources(resourceModel, req, res, defaultFilter, isSearch) {
  var data = Object.assign({}, req.body, req.query);
  var populateField = data.populate || '';

  var query = {};
  var find = await functionApplyFilters(
    data.filters,
    req.params.id,
    data.filterText ? true : isSearch,
    resourceModel.modelName,
    !!resourceModel.schema.paths['StoreId'] && data.selectedValue
  );
  find = util.updateFindParams(defaultFilter, find);
  query = common.applySortingAndFilteringInQuery(
    res,
    data,
    query,
    'DateTime',
    'DESC',
    false
  );
  find = data.filters ? await updateGridFilters(data.filters, find) : find;
  var modelFind = { $and: find.$and, $or: find.$or };

  if (modelFind.$and.length === 0) {
    delete modelFind['$and'];
  }
  if (modelFind.$or.length === 0) {
    delete modelFind['$or'];
  }

  // let totalCount = await resourceModel.countDocuments(modelFind);
  let totalCount = 0;
  let scaleData = []
  let totalPages;
  if (data.sort == 'IsVideoAvailable'||data.videoFilter=='true') {
    data.page = Number(data.page);
    data.pageSize = Number(data.pageSize);
    let videoSort = data.sortDir == 'DESC' ? -1 : 1

    if (modelFind && modelFind['$and']) {
      modelFind['$and'] = modelFind['$and'].map(el => {
        if (el.DateTime && (typeof el.DateTime['$gte'] != "string" || typeof el.DateTime['$lte'] != "string")) {
          el.DateTime['$gte'] = new Date(el.DateTime['$gte'].toDate());
          el.DateTime['$lte'] = new Date(el.DateTime['$lte'].toDate())


        }
        if (el.DateTime && (typeof el.DateTime['$gte'] == "string" || typeof el.DateTime['$lte'] == "string")) {
          el.DateTime['$gte'] = new Date(el.DateTime['$gte'])
          el.DateTime['$lte'] = new Date(el.DateTime['$lte'])


        }

        return el
      });
    }
    if (modelFind && modelFind['$or']) {
      modelFind['$or'] = modelFind['$or'].map(el => {
        if (el.DateTime) {
          console.log(typeof el.DateTime['$gte']);
          el.DateTime['$gte'] = new Date(el.DateTime['$gte']);
          el.DateTime['$lte'] = new Date(el.DateTime['$lte']);
        }
        return el
      })
    }
  
    if(data.sort == 'IsVideoAvailable'){
      scaleData = await Scale.aggregate([
      {
        $match: modelFind
      },
      { $lookup: { from: "realwaveVideoClip", localField: "VideoClipId", foreignField: "_id", as: "VideoClipId" } },
     
      { $unwind: { path: '$VideoClipId', preserveNullAndEmptyArrays: true } },
      
      { $sort: { 'VideoClipId.IsVideoAvailable': videoSort } },

      {
        $facet: {
          data: [
            { $skip: query.skip },
            { $limit: query.limit }
          ],
          pageInfo: [
            { $group: { _id: null, count: { $sum: 1 } } }
          ]
        }
      }

    ]).allowDiskUse(true);

  }
  if(data.videoFilter=="true"){
    let sortValue=data&&data.sortDir&&data.sortDir=='ASC'?1:-1;
    let sortKey;
    if(data&&data.sort&&data.sort=='IsVideoAvailable'){
      sortKey='VideoClipId.IsVideoAvailable'
    }else{
      sortKey=data.sort
    }
    let sortObj={}
   sortObj[sortKey]=sortValue;
    let filterQuery={};
    if(data.withVideo=="true"){
      filterQuery={'VideoClipId.IsVideoAvailable':true}
    }
    if(data.withOutVideo=="true"){
      filterQuery={$or:[{'VideoClipId.IsVideoAvailable':{$exists:false}},{'VideoClipId.IsVideoAvailable':false}]}
    }
    scaleData = await Scale.aggregate([
      {
        $match: modelFind
      },
      { $lookup: { from: "realwaveVideoClip", localField: "VideoClipId", foreignField: "_id", as: "VideoClipId" } },
     
      { $unwind: { path: '$VideoClipId', preserveNullAndEmptyArrays: true } },
      
      {
        // $match: {$or:[{'VideoClipId.IsVideoAvailable':{$exists:false}},{'VideoClipId.IsVideoAvailable':false}]}
        $match: filterQuery
      },
      { $sort: sortObj },

      {
        $facet: {
          data: [
            { $skip: query.skip },
            { $limit: query.limit }
          ],
          pageInfo: [
            { $group: { _id: null, count: { $sum: 1 } } }
          ]
        }
      }

    ]).allowDiskUse(true);
  }
    // scaleData = JSON.parse(JSON.stringify(scaleData));
    totalCount = scaleData[0].pageInfo[0] ? scaleData[0].pageInfo[0].count : 0;
    totalPages = Math.ceil(totalCount / query.limit);
    scaleData = scaleData[0].data;
    for (let i = 0; i < scaleData.length; i++) {
      const scaleResult = await Scale.findOne({ _id: scaleData[i]._id }).populate('CamId StoreId ScaleId');
      scaleData[i].ScaleId = scaleResult && scaleResult.ScaleId ? scaleResult.ScaleId :  scaleData[i].ScaleId;
      scaleData[i].StoreId = scaleResult && scaleResult.StoreId ? scaleResult.StoreId : scaleData[i].StoreId;
      scaleData[i].CamId = scaleResult && scaleResult.CamId ? scaleResult.CamId : scaleData[i].CamId;
    }
    scaleData = JSON.parse(JSON.stringify(scaleData));

  }else {
    
    scaleData = await resourceModel
      .find(modelFind, {}, query)
      .collation({ locale: 'en' })
      .populate(populateField);
    totalCount = await resourceModel.countDocuments(modelFind);
    totalPages = Math.ceil(totalCount / query.limit);
    scaleData = JSON.parse(JSON.stringify(scaleData));
  }
  let scaleResult
  if (scaleData.length) {
    scaleResult = scaleData;
    await Promise.all(
      scaleResult.map(async (el) => {
        if (el.ScaleId == null) {
          const scaleId = await Scale.findById(el._id, { ScaleId: 1 });
          el.ScaleId = scaleId.ScaleId;
        }
        if (el.StoreId == null) {
          const storeId = await Scale.findById(el._id, { StoreId: 1 });
          el.StoreId = storeId.StoreId;
        }
        if (el.CamId == null) {
          const camId = await Scale.findById(el._id, { CamId: 1 });
          el.CamId = camId.CamId;
        }
        if (el.VideoClipId == null) {
          const videoClipId = await Scale.findById(el._id, {
            VideoClipId: 1,
          });
          el.VideoClipId = videoClipId.VideoClipId;
        }
        if (el.NotifcationData == null) {
          const notificationData = await NotificationQueue.find({ associationId: el._id });
          el.NotifcationData = notificationData;
        }
        // el.DateTime = moment.utc(el.DateTime).format('MM-DD-YYYY h:mm A');

        let result = await StoreNotification.find({
          $and: [{ storeId: el.StoreId._id }]
        }).populate({
          path: 'scale.bookMarkTypeId',
          select: { bookmarkColor: 1 }
        });
        result.forEach(async (ele) => {
          await ele.scale.forEach(async (d, i) => {
            if (i == 3) {
              d.toWeight = '99999';
            }
            if (
              Math.round(el.Weight * 10) / 10 <= d.toWeight &&
              Math.round(el.Weight * 10) / 10 >= d.fromWeight
            ) {
              el.StoreId.color = d.bookMarkTypeId ? d.bookMarkTypeId.bookmarkColor : '';
              return el;
            }
          });
        });
      })
    );
  }
  // response = { error: false, message: "", records: scaleResult, combos: [], total: modelData[0].pageInfo[0] ? modelData[0].pageInfo[0].count : 0 };
  // return res.send(response);

  // res.send({
  //   error: false,
  //   data: scaleResult,
  //   pages: totalPages,
  //   total: totalCount,
  // });
  response = {
    error: false,
    message: '',
    pages: totalPages,
    total: totalCount,
    data: scaleResult,
    combos: [],
  };
  res.send(response);
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
  scale,
};
