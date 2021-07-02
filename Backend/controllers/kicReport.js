const excel = require('node-excel-export');
const moment = require('moment');

const common = require('./common');
const util = require('../util/util');

const Store = require('../modals/store');
const SiteSmartDevices = require('../modals/siteSmartDevices');
const Camera = require('../modals/camera');
const KICUser = require('../modals/kicUser');
// const KICReport = require('../modals/kicReport');
const KICReport = require('../modals/reportData');


const restHandler = require('./restHandler')();
restHandler.setModelId('ReportData');

String.prototype.toObjectId = function () {
    var ObjectId = require('mongoose').Types.ObjectId;
    return ObjectId(this.toString());
}

async function kicReport(req, res) {
    try {
        let params = Object.assign({}, req.body, req.query);
        let storeId = params.storeName;
        let fromDate = params.fromDate;
        let toDate = params.toDate;
        let timezoneOffset = parseInt(params.timezoneOffset);

        let defaultFilter = [];

        if (storeId) {
            const storeResult = await Store.findById(storeId);
            if (storeResult) {
                defaultFilter.push({ storeId: storeResult._id });

            } else {
                defaultFilter.push({ storeId: storeId });

            }
        }
        //If only recieve from Date
        if (fromDate && params.fromTime && toDate == '') {
            fromDate = new Date(fromDate);
            if (params.fromTime) {
                let fromTime = params.fromTime.split(':');
                fromDate.setHours(fromDate.getHours() + parseInt(fromTime[0]));
                fromDate.setMinutes(fromDate.getMinutes() + parseInt(fromTime[1]));
            }

            fromDate = moment.utc(fromDate).utcOffset(timezoneOffset, true);
            defaultFilter.push({
                'data.attributes.occurredAt': {
                    $gte: fromDate,
                },
            });
        }

        //If only recieve to date
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
                'data.attributes.occurredAt': {
                    $lte: toDate,
                },
            });
        }

        //If recieve both fromdate and todate
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
                'data.attributes.occurredAt': {
                    $gte: fromDate,
                    $lte: toDate,
                },
            });
        }

        switch (req.body.action) {
            case 'export':
                await getExportRecord(KICReport, req, res, defaultFilter);

                break;

            default:
                getResources(KICReport, req, res, defaultFilter, true);

                break;
        }

    } catch (error) {
        logger.error(error, 'error');
        return res.send({ error: true, errmsg: error.message })
    }
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
        data.selectedValue
    );

    find = util.updateFindParams(defaultFilter, find);
    query = common.applySortingAndFilteringInQuery(
        res,
        data,
        query,
        'data.attributes.occurredAt',
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
    
    let totalCount = await resourceModel.countDocuments(modelFind);
    let kicReportData = [];
    
    kicReportData = await resourceModel
        .find(modelFind, {}, query)
        .collation({ locale: 'en' })
        .populate([
            { path: 'client', options: { select: { name: 1 } } },
            { path: 'storeId' },
            { path: 'associatedResourceId', options: { select: { kicAssociateId: 1, kicAssociatedName: 1, associatedId: 1 } } },
            {
                path: 'siteSmartDevice', options: {
                    select: {
                        name: 1,
                        notes: 1,
                        kicDeviceID: 1,
                        kicDeviceType: 1,
                        kicVendorName: 1,
                        kicDeviceName: 1,
                        kicSerialNumber: 1,
                        kicStatus: 1,
                        kicLocationID: 1,
                        isDeviceConnected: 1,
                        deviceLocation: 1,
                        siteSmartDeviceStatus: 1
                    }
                }
            },
            {
                path: 'videoClip',
            }

        ]
        );
    totalCount = await resourceModel.countDocuments(modelFind);
    var totalPages = Math.ceil(totalCount / query.limit);
    let kicResult = JSON.parse(JSON.stringify(kicReportData));
    await Promise.all(
        kicResult.map(async (el) => {
            let smartDeviceId = el.siteSmartDevice.length ? el.siteSmartDevice[0]._id : null;
            const cameraData = await Camera.findOne({ storeId: el.storeId, 'siteSmartDevices.deviceId': smartDeviceId });
            // el.DateTime = el.data.attributes.occurredAt;
            el.data.attributes.associatedResourceId = el.associatedResourceId[0] ? el.associatedResourceId[0] : el.data.attributes.associatedResourceId;
            el.eventData = el.data.type;
            el.pinUsed = el.data.type == 'Access Denied'||el.data.type == 'access_denied_event' ? el.data.attributes.pin : '';

            el.publisherId = el.siteSmartDevice[0] ? el.siteSmartDevice[0] : el.publisherId;
            if (cameraData) {
                el.Camera = {
                    _id: cameraData._id,
                    name: cameraData.name
                };
            }
            el.videoClipdata = el.videoClip[0] ? el.videoClip[0] : el.VideoClipId;
            el.StoreId = el.storeId
            // el.storeData = el.store[0] ? el.store[0] : el.storeId;
            el.clientData = el.client[0] ? el.client[0] : el.cliendId
            delete el.siteSmartDevice
            delete el.storeId
            delete el.client
            delete el.associatedResourceId
            delete el.videoClip
            let result = await SiteSmartDevices.find({
                $and: [{ storeId: el.StoreId._id }, el.source === "sera4" ? {sera4DeviceID:el.publisherId.kicDeviceID} : {kicDeviceID:el.publisherId.kicDeviceID},{siteSmartDeviceStatus:0}]
              }).populate({
                path: el.source === "sera4" ? 'seraEvent.bookMarkTypeId' : 'kicEvent.bookMarkTypeId', // el.source === "sera4" ? 'seraEvent.bookMarkTypeId' : 
                select: { bookmarkColor: 1 }
              });
              result.forEach(async (ele) => {
                  console.log('resultEle',ele);
                  if(el.source === "sera4"){
                     await ele.seraEvent.forEach(async (d, i) => {
                      console.log('color-->',d)
                     if(el.data.type==d.eventType){
                      el.color = d.bookMarkTypeId ? d.bookMarkTypeId.bookmarkColor : '';

                       }
                     });
                  }else{
                     await ele.kicEvent.forEach(async (d, i) => {
                      console.log('color1-->',d)
                      if(el.data.type==d.eventType){
                     el.color = d.bookMarkTypeId ? d.bookMarkTypeId.bookmarkColor : '';

                      }
                   });
                 }
              });

        })
    );
    

    response = {
        error: false,
        message: '',
        pages: totalPages,
        total: totalCount,
        data: kicResult,
        combos: [],
    };
    res.send(response);
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
    if (
        selectedValue &&

        JSON.parse(selectedValue)[0] != 'All'
    ) {
        find.$and.push({
            storeId: { $in: JSON.parse(selectedValue).map((strVale) => strVale) },
        });
    }
    if (Array.isArray(filters)) {
        // filters.forEach(async function (filter) {
        //     if (filter.property.indexOf('.') <= 0 || modelName == 'kicReports') {
        //         await addFilter(filter, find, isSearch ? '$or' : '$and');
        //     }
        // });
        for (let i = 0; i < filters.length; i++) {
            if (
                filters[i].property.indexOf('.') <= 0 || modelName == 'kicReports'
            ) {

                await addFilter(filters[i], find, isSearch ? '$or' : '$and');
            }
        }
    }
    return find;
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
        case 'kicuserid':
            let query3 = {};
            query3.kicAssociatedName = { $regex: String(filterValue), $options: '$i' };
            let kicUserIds = await getKicUserIds(query3);
            if (kicUserIds && kicUserIds.length > 0) {
                find[field].push({
                    'data.attributes.associatedResourceId': {
                        $in: kicUserIds,
                    },
                });
            } else {
                find[field].push({
                    'data.attributes.associatedResourceId': {
                        $in: ['5f97ea221b3e603798e85581'],
                    },
                });
            }
            break;
            case 'lockid':
            let query = {};
            if (filter.storeId) {
                query.storeId = filter.storeId.toObjectId();
            }
            query.kicDeviceName = { $regex: String(filterValue), $options: '$i' };

            let lockIds = await getLockIDs(query);
            if (lockIds && lockIds.length > 0) {
                find[field].push({
                    publisherId: {
                        $in: lockIds,
                    },
                });
            } else {
                find[field].push({
                    publisherId: {
                        $in: ['5f97ea221b3e603798e85581'],
                    },
                });
            }

            break;
        case 'camid':
            let query1 = { kicDeviceID: { $exists: true, $ne: "" }, siteSmartDeviceStatus: 0 };
            if (filter.storeId) {
                query1.storeId = filter.storeId.toObjectId();
            }

            // query1.name = { $regex: String(filterValue), $options: '$i' };

            let camIds = await getCameraIds(query1, filter);
            if (camIds) {
                find[field].push({
                    publisherId: {

                        $in: camIds.kicDeviceId,
                    },
                    storeId: {
                        $in: camIds.storeIds
                    }
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
async function updateGridFilters(filters, find) {
    let allFilters = JSON.parse(filters);
    if (Array.isArray(allFilters)) {
        for (let i = 0; i < allFilters.length; i++) {
            if (
                allFilters) {
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
async function getLockIDs(query) {
    let scaleData = await SiteSmartDevices.find(query, { kicDeviceName: 1, kicDeviceID: 1 });
    let lockIds = [];
    if (scaleData && scaleData.length > 0) {
        lockIds = scaleData.map((el) => el.kicDeviceID);
    }
    return lockIds;
}
async function getCameraIds(query1, filter) {
    let siteSmartDeviceData = await SiteSmartDevices.find(query1);
    let kicDeviceId = [], storeIds = [];
    let result = await Promise.all(siteSmartDeviceData.map(async el => {
        let query4 = { storeId: el.storeId, 'siteSmartDevices.deviceId': el._id, name: { '$regex': filter.value, '$options': '$i' } }
        let cameraData = await Camera.findOne(query4).populate('siteSmartDevices.deviceId');
        let cameraResult = JSON.parse(JSON.stringify(cameraData));
        if (cameraResult) {
            cameraResult.siteSmartDevices.filter(ele => {
                if (ele.deviceId._id.toString() == el._id.toString()) {
                    kicDeviceId.push(ele.deviceId.kicDeviceID);
                    storeIds.push(cameraData.storeId)
                }
            })
        }




    }))
    return { kicDeviceId, storeIds }

}
async function getKicUserIds(query3) {
    let kicUserdata = await KICUser.find(query3);
    let assosiatedUserIds = [];
    if (kicUserdata && kicUserdata.length > 0) {
        assosiatedUserIds = kicUserdata.map(el => el.kicAssociateId)
    }
    return assosiatedUserIds;
}

async function getExportRecord(resourceModel, req, res, defaultFilter) {
    var data = Object.assign({}, req.body, req.query);
    var defaultSort = 'data.attributes.occurredAt';
    var sortDir = 'DESC';
    var query = {};
    // var find = functionApplyFilters(data.filters, req.params.id);
    // find = util.updateFindParams(defaultFilter, find);
    var find = await functionApplyFilters(
        data.filters,
        req.params.id,
        true,
        resourceModel.modelName,
        data.selectedValue
    );

    find = util.updateFindParams(defaultFilter, find);
     find = data.filters ? await updateGridFilters(data.filters, find) : find;
    if (data.sort) {
        defaultSort = data.sort;
        sortDir = data.sortDir;
    }

    query.sort = {
        [defaultSort]: sortDir == 'DESC' ? -1 : 1,
    };
    var modelFind = { $and: find.$and, $or: find.$or };
    if (modelFind.$and.length == 0) {
        modelFind = {};
    }
    if (modelFind.$or.length == 0) {
        delete modelFind['$or'];
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
        .find(modelFind, {}, query).populate([
            { path: 'client', options: { select: { name: 1 } } },
            { path: 'storeId' },
            { path: 'associatedResourceId', options: { select: { kicAssociateId: 1, kicAssociatedName: 1, associatedId: 1 } } },
            {
                path: 'siteSmartDevice', options: {
                    select: {
                        name: 1,
                        notes: 1,
                        kicDeviceID: 1,
                        kicDeviceType: 1,
                        kicVendorName: 1,
                        kicDeviceName: 1,
                        kicSerialNumber: 1,
                        kicStatus: 1,
                        kicLocationID: 1,
                        isDeviceConnected: 1,
                        deviceLocation: 1,
                        siteSmartDeviceStatus: 1
                    }
                }
            },
            {
                path: 'videoClip',
            }
        ]
        );
    let kicResult = JSON.parse(JSON.stringify(modelData));
    await Promise.all(
        kicResult.map(async (el) => {
            let smartDeviceId = el.siteSmartDevice.length ? el.siteSmartDevice[0]._id : null;
            const cameraData = await Camera.findOne({ storeId: el.storeId, 'siteSmartDevices.deviceId': smartDeviceId });
            el.DateTime = el.data.attributes.occurredAt;
            el.type = el.data.type;
            if (el.associatedResourceId && el.associatedResourceId.length) {
                el.associatedResourceId[0].name = el.associatedResourceId && el.associatedResourceId.length ? el.associatedResourceId[0].kicAssociatedName : '';

            }
            el.AssociatedResourceId = el.associatedResourceId[0] ? el.associatedResourceId[0] : el.data.attributes.associatedResourceId;
            el.eventData = el.data.type;
            el.pin = el.data.type == 'Access Denied' ||el.data.type == 'access_denied_event' ? el.data.attributes.pin : '';
            // if (el.siteSmartDevice && el.siteSmartDevice.length) {
            //     el.siteSmartDevice[0].name = el.associatedResourceId && el.associatedResourceId.length ? el.siteSmartDevice[0].kicDeviceName : ''

            // }
            el.publisherId = el.siteSmartDevice[0] ? el.siteSmartDevice[0] : el.publisherId;
            if (cameraData) {

            el.CamId = {
                _id: cameraData._id,
                name: cameraData.name
            };
            }
            // el.IsVideoAvailable = el.videoClip[0] ? el.videoClip[0] : el.VideoClipId;
            el.StoreId = el.storeId
            // el.storeData = el.store[0] ? el.store[0] : el.storeId;
            el.clientData = el.client[0] ? el.client[0] : el.cliendId
            delete el.siteSmartDevice
            delete el.storeId
            delete el.client
            delete el.associatedResourceId
            delete el.videoClip

        })
    );
    setExportData(req, res, kicResult, modelData);


}
function setExportData(req, res, modelData, KicData) {
    var data = Object.assign({}, req.body, req.query);
    var utcTime = Number(data.timezoneOffset) || '';
    var columns = JSON.parse(data.columns);
    // data.columns = JSON.parse(data.columns)
    columns.map(el => {
        if (el.key == 'data.attributes.occurredAt') el.key = 'DateTime'
        if (el.key == 'data.attributes.associatedResourceId') el.key = 'AssociatedResourceId'
        if (el.key == 'data.type') el.key = 'type'
        if (el.key == 'pinUsed') el.key = 'pin'
        if (el.key == 'Camera.name') el.key = 'CamId'

    });

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
                if (col.key == 'publisherId') {
                    newValue +=
                        val && val[col.key] && val[col.key]['kicDeviceName']
                            ?
                            val[col.key]['kicDeviceName']
                            : val[col.key]['name'] ? val[col.key]['name'] : val[col.key]['kicDeviceID']
                } else {
                    newValue +=
                        val && val[col.key]
                        ?
                        val[col.key]['name'] ? val[col.key]['name'] : val[col.key]['IsVideoAvailable']
                            ? val[col.key]['IsVideoAvailable'] : ''
                        : '';
                }

                set[col.key] = newValue;
            } else {
                if (col.type == 'date') {
                    set[col.key] = moment(KicData[index].data.attributes.occurredAt, 'MM/DD/YYYY HH:mm:ss')
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
async function functionApplyFilters1(filters, isSearch, modelName, selectedValue) {
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
    // if (Array.isArray(filters)) {
    //     filters.forEach(async function (filter) {
    //         if (filter.property.indexOf('.') <= 0 || modelName == 'kicReports') {
    //             await addFilter(filter, find, isSearch ? '$or' : '$and');
    //         }
    //     });
    // }
    for (let i = 0; i < filters.length; i++) {
        if (
            filters[i].property.indexOf('.') <= 0 || modelName == 'kicReports' || filters[i].gridFilter
        ) {
            await addFilter(filters[i], find, isSearch ? '$or' : '$and');
        }
    }
    return find;
}
module.exports = {
    kicReport
}