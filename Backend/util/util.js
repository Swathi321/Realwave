const queryConfig = require('./../config/config');
const mongoose = require('mongoose');
const camera = require('./../modals/camera');
const store = require('./../modals/store');
const http = require('http');
const https = require('https');
const fs = require('fs');
const moment = require('moment-timezone');
const User = require("./../modals/user");
const alert = require('./../modals/Alerts');
const alarm = require('./../modals/Alarm');
const child = require('child_process');
const emailNotifier = require('./../config/EmailNotifier');
const logger = require('./../util/logger');
const { STORE_NOTIFICATION_TYPE } = require('./../util/enum');
const twilio = require('../plugin/Twilio');
const SiteNotificationLog = require("./../modals/SiteNotificationLog");
const DeviceConnectivityLogModel = require('./../modals/DeviceConnectivityLog');
const sha256 = require('sha256');
const md5 = require('md5');
const AntMediaAdapter = require('./AntMediaAdapter');
const config = require('./../config');
const azure = require('azure-storage');
const blobService = azure.createBlobService(config.azure.account, config.azure.key);

var boxRestartOn = {};

module.exports = {
  boxRestartOn: boxRestartOn,
  hasRecentlyRestarted: (storeId, isActionApply = false) => {
    let toReturn = false;

    if (boxRestartOn.hasOwnProperty(storeId)) {
      let lastStartDate = boxRestartOn[storeId];
      let lastValidDate = moment(boxRestartOn[storeId]).add(3, "minutes");
      toReturn = moment().isBetween(lastStartDate, lastValidDate);
      if (!toReturn && !isActionApply) {
        boxRestartOn[storeId] = moment();
      }
    } else {
      if (!isActionApply) {
        boxRestartOn[storeId] = moment();
      }
    }
    return toReturn;
  },
  dateFormat: {
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'hh:mm:ss A',
    dateTimeFormat: 'MM/DD/YYYY hh:mm',
    dateTimeFormatAmPm: 'MM/DD/YYYY hh:mm:ss A',
    dateTimeFormatSecond: 'MM/DD/YYYY hh:mm:ss',
    faceDateformat: 'MMMM Do YYYY, h:mm:ss A',
    eventId: 'YYMMDDhhmmss',
    videoClipId: 'YYMMDDhhmmss',
    dateFolderName: 'MM-DD-YYYY',
    zipFileDateTimeFormat: 'YYYY-MM-DD-HH-mm-ss',
    POSDataDateFormat: 'YYYY-MM-DD HH:mm:ss',
    cameraLogDateFormat: 'YYYY-MM-DDTHH:mm:ss',
    cameraLogMongoDateFormat: 'YYYY-MM-DD HH:mm:ss.000',
    peopleCountDateFormat: 'MM/DD/YYYY 00:00:00',
    peopleCountDataUsed: 'MM/DD/YYYY',
    peopleCountHours: 'HH:00',
  },
  Role: {
    Admin: 'Admin',
    ClientAdmin: 'Client - Admin',
    Installer: 'Installer',
    User: 'User',
  },
  AdminRoleId: '5c540eefb224473e50f12236',
  ReceiptTotalDays: 30,
  IsDev: (process.env.NODE_ENV || 'development') == 'development',
  dict: {},
  dictVideo: {},
  lastInvoiceRecord: {},
  tunnelEntry: [],
  tunnelServerEntry: [],
  isNull: (val) => {
    return (
      val === undefined ||
      val === null ||
      val === 'undefined' ||
      val === 'null' ||
      val === ''
    );
  },
  reverseString: (str) => {
    // Check input
    if (!str || str.length < 2 || typeof str !== 'string') {
      return 'Not valid';
    }

    // Take empty array revArray
    const revArray = [];
    const length = str.length - 1;

    // Looping from the end
    for (let i = length; i >= 0; i--) {
      revArray.push(str[i]);
    }

    // Joining the array elements
    return revArray.join('');
  },
  getDirectory: (path) => {
    let currentDir = process.cwd();
    return currentDir + '/' + (path || '') + '/';
  },
  isValidQuery(value, isEvent, isGrid) {
    let queryFilter = [
      { columnName: 'InvoiceId', type: 'int' },
      { columnName: 'ItemId', type: 'int' },
      { columnName: 'Upc', type: 'string' },
      { columnName: 'Name', type: 'string' },
      { columnName: 'Size', type: 'date' },
      { columnName: 'Category', type: 'string' },
      { columnName: 'Price', type: 'int' },
      { columnName: 'RegPrice', type: 'int' },
      { columnName: 'Qty', type: 'int' },
      { columnName: 'Total', type: 'int' },
      { columnName: 'Cost', type: 'int' },
      { columnName: 'Discount', type: 'int' },
      { columnName: 'LineId', type: 'int' },
      { columnName: 'StoreId.name', type: 'string' },
      { columnName: 'AuditStatus', type: 'string' },
      { columnName: 'EventTime', type: 'date' },
      { columnName: 'EventType', type: 'string' },
      { columnName: 'Register', type: 'int' },
      { columnName: 'SubTotal', type: 'int' },
      { columnName: 'Tax', type: 'int' },
      { columnName: 'OperatorName', type: 'string' },
      { columnName: 'Status', type: 'string' },
      { columnName: 'StoreName', type: 'string' },
      { columnName: 'CamName', type: 'string' },
      { columnName: 'InvoiceTotal', type: 'int' },
      { columnName: 'InvoiceDiscount', type: 'int' },
    ];

    if (isEvent) {
      queryFilter = [
        { columnName: 'InvoiceId', type: 'int' },
        { columnName: 'EventTime', type: 'date' },
        { columnName: 'EventType', type: 'string' },
        { columnName: 'Register', type: 'int' },
        { columnName: 'SubTotal', type: 'int' },
        { columnName: 'Tax', type: 'int' },
        { columnName: 'Total', type: 'int' },
        { columnName: 'Discount', type: 'int' },
        { columnName: 'OperatorName', type: 'string' },
        { columnName: 'Status', type: 'string' },
        { columnName: 'AuditStatus', type: 'string' },
        { columnName: 'CamId.name', type: 'string' },
        { columnName: 'StoreId.name', type: 'string' },
      ];
    }

    if (isGrid) {
      queryFilter = [
        { columnName: 'InvoiceId', type: 'int' },
        { columnName: 'AuditStatus', type: 'string' },
        { columnName: 'EventTime', type: 'date' },
        { columnName: 'EventType', type: 'string' },
        { columnName: 'Total', type: 'int' },
        { columnName: 'Register', type: 'int' },
        { columnName: 'SubTotal', type: 'int' },
        { columnName: 'Tax', type: 'int' },
        { columnName: 'Discount', type: 'int' },
        { columnName: 'OperatorName', type: 'string' },
        { columnName: 'Status', type: 'string' },
        { columnName: 'Store', type: 'string' },
        { columnName: 'Camera', type: 'string' },
        { columnName: 'Category', type: 'string' },
        { columnName: 'ItemId', type: 'int' },
        { columnName: 'Name', type: 'string' },
        { columnName: 'Size', type: 'string' },
        { columnName: 'Price', type: 'int' },
        { columnName: 'RegPrice', type: 'int' },
        { columnName: 'Qty', type: 'int' },
        { columnName: 'ItemTotal', type: 'int' },
        { columnName: 'Cost', type: 'int' },
        { columnName: 'ItemDiscount', type: 'int' },
        { columnName: 'StoreName', type: 'string' },
        { columnName: 'CamName', type: 'string' },
        { columnName: 'InvoiceTotal', type: 'int' },
        { columnName: 'InvoiceDiscount', type: 'int' },
      ];
    }
    let type = 'int';
    let column = '';
    let updatedFilters = [];
    let val = '';

    for (var i = 0; i < queryFilter.length; i++) {
      type = queryFilter[i].type;
      try {
        switch (type) {
          case 'int':
            val = Number(value);
            if (!isNaN(val)) {
              column = queryFilter[i].columnName;
              updatedFilters.push({ [column]: val });
            }
            break;
          case 'string':
            var searchValue = new RegExp(value, 'i');
            column = queryFilter[i].columnName;
            updatedFilters.push({ [column]: searchValue });
            break;
          case 'date':
            var tempVal = '';
            if (Date.parse(value) instanceof Date) {
              tempVal = new Date(value);
              if (!isNaN(tempVal.getTime())) {
                column = queryFilter[i].columnName;
                updatedFilters.push({ [column]: tempVal });
              }
            }
            break;

          default:
            break;
        }
      } catch (err) {
        continue;
      }
    }
    return updatedFilters;
  },
  isNodeMediaSecured() {
    return true;
  },
  isGridValidQuery(value) {
    let queryFilter = [
      { columnName: 'InvoiceId', type: 'int' },
      { columnName: 'OperatorName', type: 'string' },
      { columnName: 'Register', type: 'numeric' },
      { columnName: 'Status', type: 'string' },
      { columnName: 'EventTime', type: 'date' },
      { columnName: 'Category', type: 'string' },
      { columnName: 'Total', type: 'int' },
    ];
    let type = 'int';
    let column = '';
    let updatedFilters = [];
    let val = '';

    for (var i = 0; i < queryFilter.length; i++) {
      type = queryFilter[i].type;
      try {
        switch (type) {
          case 'int':
            val = Number(value);
            if (!isNaN(val)) {
              column = queryFilter[i].columnName;
              updatedFilters.push({ [column]: val });
            }
            break;
          case 'string':
            var searchValue = new RegExp(value, 'i');
            column = queryFilter[i].columnName;
            updatedFilters.push({ [column]: searchValue });
            break;

          case 'date':
            var tempVal = '';
            if (Date.parse(value) instanceof Date) {
              tempVal = new Date(value);
              if (!isNaN(tempVal.getTime())) {
                column = queryFilter[i].columnName;
                updatedFilters.push({ [column]: tempVal });
              }
            }
            break;

          default:
            break;
        }
      } catch (err) {
        continue;
      }
    }
    return updatedFilters;
  },
  getBaseUrl(req) {
    return (process.env.NODE_ENV || 'development') === 'development'
      ? 'http://localhost:3000'
      : process.env.baseUrl;
  },
  camConfig: new Array(),
  videoConfig: new Array(),
  getUserDetail(id) {
    return new Promise(function (resolve, reject) {
      User.findById(id)
        .populate('roleId')
        .then(function (user) {
          if (user) {
            resolve(user);
          } else {
            resolve(null);
          }
        })
        .catch(function () {
          resolve(null);
        });
    });
  },

  getModel(key) {
    return new Promise(function (resolve, reject) {
      resolve(mongoose.model(key));
    });
  },
  getAzureStorageFileName() {
    //TODO: Implement get file name based on if transaction video not available on onsite server.
    return 'sample_30mb';
  },
  getConfiguredCamera(storeId) {
    let me = this;
    return new Promise(function (resolve, reject) {
      camera
        .find({
          storeId: me.mongooseObjectId(storeId),
          isRecordingStarted: true,
          status: 'Active',
        })
        .then((camData, err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(camData);
        });
    });
  },
  getConfiguredAllCamera(storeId) {
    let me = this;
    return new Promise(function (resolve, reject) {
      camera
        .find({ storeId: me.mongooseObjectId(storeId), status: 'Active' }).populate('siteSmartDevices').populate({
          path: 'siteSmartDevices.deviceId',
          select: ["name", "scaleIP", "scalePort", "connectionType", "scaleUserName", "scalePassword"],
        })
        .then((camData, err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(camData);
        });
    });
  },
  /**
   * @description - Function for update machine (OnSite Server) status
   * @param {Object} data - Store id and info.
   * @param {Boolean} status - Machine status.
   * @param {String} error - error message while Disconnect/Error
   */
  async updateMachineStatus(data, status, error) {
    let updateValues = JSON.parse(JSON.stringify(data));
    updateValues.isConnected = false;
    updateValues.lastDisconnectedOn = moment().toDate();
    delete updateValues.storeId;

    logger.info('Store DisConnected');
    let lastRecordFromNotification = await SiteNotificationLog.find({
      storeId: data.storeId.toObjectId(),
      type: 'STORE',
    });
    if (lastRecordFromNotification && lastRecordFromNotification.length > 0) {
      let lastStatus = lastRecordFromNotification[0].status;
      if (lastStatus) {
        await store.updateOne(
          { _id: data.storeId, isConnected: true },
          updateValues,
          async function (err, affected, resp) {
            if (affected.n > 0) {
              await camera.updateMany(
                { storeId: data.storeId },
                { $set: { isConnected: 'false' } }
              );
              logger.info(
                'Store Updating Last DisConnected Status: ' +
                data.storeId +
                ' remarkContent : updateMachineStatus function  for Disconnect'
              );
              let lastStatus = lastRecordFromNotification[0].status;
              let localDateTime = moment().toDate();
              let localDateTimeString = moment().format(
                'MM/DD/YYYY HH:mm:ss A'
              );
              let objDataForUpdate = {
                disConnectDateTime: localDateTime,
                disConnectStringDate: localDateTimeString,
                remarkContent: 'updateMachineStatus function  for Disconnect',
              };
              await SiteNotificationLog.update(
                { storeId: data.storeId, type: 'STORE' },
                { $set: objDataForUpdate }
              );
            }
          }
        );
      } else if (!status) {
        await store.updateOne(
          { _id: data.storeId },
          { $set: { isConnected: false, lastDisconnectedOn: moment().toDate() } }
        );
      }
    }
  },
  /**
   * @description - Function for update machine (OnSite Server) status
   * @param {Object} data - Store id and info.
   * @param {Boolean} status - Machine status.
   * @param {String} error - error message while Disconnect/Error
   */
  async updateMachineStatusConnected(data, status) {
    this.UpdateStorePing(data, true, 'updateMachineStatusConnected');
  },
  createAlert(data, create) {
    alert.findOne(
      { storeId: data.storeId, type: data.type, closedOn: null },
      {},
      {},
      function (err, modelData) {
        if (err) {
          logger.error(err);
        } else {
          if (modelData && !create) {
            alert.findById(
              { _id: modelData._id.toString() },
              (err, alertData) => {
                if (!err) {
                  var jsonData = data;
                  Object.assign(alertData, jsonData).save((err, data) => {
                    if (err) {
                      logger.error(err);
                    }
                  });
                }
              }
            );
          } else {
            if (data.status == 'Open') {
              let resourceModelObj = new alert(data);
              resourceModelObj.save((err, data) => {
                if (err) {
                  logger.error(err);
                }
              });
            }
          }
        }
      }
    );
  },
  downloadFile: function (requestUrl, targetFilePath) {
    return new Promise((resolve, reject) => {
      var pathDir = 'Temp';
      // Create Temp Dir ..
      if (!fs.existsSync(pathDir)) {
        fs.mkdirSync(pathDir, 0744);
      }

      let isHttp = requestUrl.indexOf('http://') > -1 ? true : false;

      var protocol = isHttp ? http : https;

      const file = fs.createWriteStream(targetFilePath, { flags: 'wx' });
      // Create http request to download file.

      logger.info(
        'Util: DownloadFile: ' + requestUrl + ' .. isHttp: ' + isHttp
      );

      const request = protocol.get(requestUrl, (response) => {
        if (response.statusCode === 200) {
          // Write file stream to local file.
          response.pipe(file);
        } else {
          file.close();
          try {
            // Delete file from local.
            fs.unlinkSync(targetFilePath);
          } catch (ex) {
            logger.error(ex);
            logger.error(ex);
            logger.error('Util: Delete File from Local: ' + requestUrl);
          }
          let msg = `Server responded with ${response.statusCode}: ${response.statusMessage}`;
          logger.error('Util: DownloadFile Status: ' + msg);
          reject({ success: false, message: msg, res: response });
        }
      });

      // Handle request error.
      request.on('error', (err) => {
        file.close();
        try {
          // Delete file from local.
          fs.unlinkSync(targetFilePath);
        } catch (ex) {
          logger.error(ex);
          logger.error('Util: DeleteFile: ' + requestUrl);
          logger.error(ex);
        }
        logger.error(err);
        logger.error('Util: Streaming Request Error-1');
        reject({ success: false, message: err.message, err: err });
      });

      // Handle file stream writing complete.
      file.on('finish', () => {
        logger.error('Util: Streaming Completed');
        resolve({ success: true, message: 'Success' });
      });

      // Handle file stream writing error.
      file.on('error', (err) => {
        file.close();
        let response = { success: false, message: '', err: err };

        if (err.code === 'EEXIST') {
          response.msg = 'File already exists';
        } else {
          response.msg = err.message;
          // Delete file from local.
          try {
            // Delete file from local.
            fs.unlinkSync(targetFilePath);
          } catch (ex) {
            logger.error(ex);
            logger.error('Util: Streaming Write Error: ' + requestUrl);
            logger.error(ex);
          }
        }
        logger.error(err);
        logger.error('Util: Streaming Write Error-1');
        reject(response);
      });
    });
  },
  mongooseObjectId(id) {
    var ObjectId = require('mongoose').Types.ObjectId;
    return ObjectId(id);
  },
  /**
   * @decs function to handle find camera id based on store and cam url
   * @param {object} storeId - have store id
   * @param {object} camUrl - have camera url
   * @param {object} cb - call back function
   */
  getCamIdFormStore(storeId, camUrl, cb) {
    let me = this;
    camera.find(
      { cameraRTSPUrl: camUrl.trim(), storeId: me.mongooseObjectId(storeId) },
      function (err, camRecords) {
        if (camRecords.length > 0) {
          cb(camRecords[0]._id);
          return;
        } else {
          cb(null);
        }
      }
    );
  },
  getCategory: function (record) {
    //Category Add
    let category = [];
    var salesTag = Object.keys(queryConfig.SalesCategory);
    for (let index = 0; index < salesTag.length; index++) {
      const element = salesTag[index];
      var isValid = queryConfig.SalesCategory[element].isValid(record);
      if (isValid) {
        if (category.indexOf(element) == -1) {
          category.push(element);
        }
      }
    }
    return category;
  },
  thumbnailsPath: 'thumbnails',
  videoPath: 'videos',
  zipPath: 'zip',
  thumbnailsProcessedPath: 'thumbnailsProcessed',
  thumbnailExtension: '.jpg',
  eventVideoExtension: '.mp4',
  eventZipExtension: '.zip',
  getClone(data) {
    if (typeof data == 'object') {
      let strData = JSON.stringify(data),
        objData = JSON.parse(strData);
      return objData;
    }
    return data;
  },
  createAlarm(data, create) {
    alarm.findOne(
      { storeId: data.storeId, type: data.type, closedOn: null },
      {},
      {},
      function (err, modelData) {
        if (err) {
          logger.error(err);
        } else {
          if (modelData && !create) {
            alarm.findById(
              { _id: modelData._id.toString() },
              (err, alarmData) => {
                if (!err) {
                  var jsonData = data;
                  Object.assign(alarmData, jsonData).save((err, data) => {
                    if (err) {
                    }
                  });
                }
              }
            );
          } else {
            if (data.status == 'Open') {
              let resourceModelObj = new alarm(data);
              resourceModelObj.save((err, data) => {
                if (err) {
                  logger.error(err);
                }
              });
            }
          }
        }
      }
    );
  },
  updateFindParams(defaultFilter, find) {
    if (defaultFilter && defaultFilter.length > 0) {
      defaultFilter.forEach((item) => {
        var propertyName = Object.keys(item);
        for (let i = 0; i < propertyName.length; i++) {
          var value = item[propertyName[i]];
          if (
            propertyName[i] == '$or' &&
            find.$or &&
            find.$or.length > 0 &&
            value.length > 0
          ) {
            var newProperties = Object.keys(value[0]);
            for (let j = 0; j < newProperties.length; j++) {
              var propValue = value[0][newProperties[j]];
              find['$or'].push({ [newProperties[j]]: propValue });
            }
          } else {
            find['$and'].push({ [propertyName[i]]: value });
          }
        }
      });
    }
    return find;
  },
  eventType: { Face: 'Face' },
  getNewPort: function () {
    let port = 15001;
    return new Promise(function (resolve, reject) {
      store
        .findOne({ tunnelPort: { $gt: port } }, function (err, record) {
          port = record ? Number(record.tunnelPort) + 1 : port; // - Default starting port.
          resolve(port);
        })
        .sort({ tunnelPort: -1 })
        .limit(1);
    });
  },
  getCameras(storeIds, filterText) {
    return new Promise((resolve, reject) => {
      let cameraFilter = {};
      var cameraModel = mongoose.model('camera');
      cameraFilter.name = { $regex: filterText, $options: '$i' };
      cameraFilter.storeId = storeIds;
      var queryCamera = cameraModel.find(cameraFilter);

      queryCamera.lean().exec(function (err, cameraData) {
        if (!err) {
          resolve(
            cameraData.map(function (strVale) {
              return strVale._id;
            })
          );
        } else {
          resolve([]);
        }
      });
    });
  },

  getStoreIds(storeIds, filterText) {
    return new Promise((resolve, reject) => {
      let storeFilter = {};
      var storeModel = mongoose.model('store');
      storeFilter.name = { $regex: filterText, $options: '$i' };
      storeFilter._id = storeIds;
      var queryStore = storeModel.find(storeFilter);
      queryStore.lean().exec(function (err, storeData) {
        if (!err) {
          resolve(
            storeData.map(function (strVale) {
              return strVale._id;
            })
          );
        } else {
          resolve([]);
        }
      });
    });
  },
  getAllStoreIds(req, res, defaultFilter) {
    return new Promise((resolveAllStores, reject) => {
      let filters = JSON.parse(req.body.filters);
      if (
        req.body.populate &&
        req.body.populate.length > 0 &&
        (req.body.filterText || filters.length > 0)
      ) {
        let populateFields = req.body.populate.split(' ');
        let allStoreIds = { $or: [], $and: [] };
        for (var i = 0; i < populateFields.length; i++) {
          switch (populateFields[i]) {
            case 'storeId':
              let checkSearchIsFromNestedStoreNameField = JSON.parse(
                req.body.filters
              ).filter(function (data) {
                return data.property == 'storeId.name';
              });
              if (req.body.filterText) {
                var storeFilterTextPromise = this.getStoreIds(
                  defaultFilter && defaultFilter.length > 0
                    ? defaultFilter[0].storeId
                    : null,
                  req.body.filterText
                ).then(function (newStoreIds) {
                  if (newStoreIds && newStoreIds.length > 0) {
                    allStoreIds.$or.push({ storeIds: newStoreIds });
                  }
                });
              }
              if (
                checkSearchIsFromNestedStoreNameField.length > 0 &&
                checkSearchIsFromNestedStoreNameField[0].value &&
                checkSearchIsFromNestedStoreNameField[0].gridFilter &&
                checkSearchIsFromNestedStoreNameField[0].gridFilterValue
              ) {
                var storeGridFilterPromise = this.getStoreIds(
                  defaultFilter && defaultFilter.length > 0
                    ? defaultFilter[0].storeId
                    : null,
                  checkSearchIsFromNestedStoreNameField[0] &&
                    checkSearchIsFromNestedStoreNameField[0].gridFilterValue
                    ? checkSearchIsFromNestedStoreNameField[0].gridFilterValue
                    : null
                ).then(function (newStoreIds) {
                  if (newStoreIds && newStoreIds.length > 0) {
                    allStoreIds.$and.push({ storeIds: newStoreIds });
                  } else {
                    allStoreIds.$and.push({ storeIds: [] });
                  }
                });
              }

              break;
            case 'cameraId':
              let checkSearchIsFromNestedCameraNameField = JSON.parse(
                req.body.filters
              ).filter(function (data) {
                return data.property == 'cameraId.name';
              });
              if (req.body.filterText) {
                var filterTextPrmoise = this.getCameras(
                  defaultFilter && defaultFilter.length > 0
                    ? defaultFilter[0].storeId
                    : null,
                  req.body.filterText
                ).then(function (getCamerasFromText) {
                  if (getCamerasFromText && getCamerasFromText.length > 0) {
                    allStoreIds.$or.push({ cameraIds: getCamerasFromText });
                  }
                });
              }
              if (
                checkSearchIsFromNestedCameraNameField.length > 0 &&
                checkSearchIsFromNestedCameraNameField[0].value &&
                checkSearchIsFromNestedCameraNameField[0].gridFilter &&
                checkSearchIsFromNestedCameraNameField[0].gridFilterValue
              ) {
                var GirdFilterTextPromise = this.getCameras(
                  defaultFilter && defaultFilter.length > 0
                    ? defaultFilter[0].storeId
                    : null,
                  checkSearchIsFromNestedCameraNameField[0] &&
                    checkSearchIsFromNestedCameraNameField[0].gridFilterValue
                    ? checkSearchIsFromNestedCameraNameField[0].gridFilterValue
                    : null
                ).then(function (getCamerasFromText) {
                  if (getCamerasFromText && getCamerasFromText.length > 0) {
                    allStoreIds.$and.push({ cameraIds: getCamerasFromText });
                  } else {
                    allStoreIds.$and.push({ cameraIds: [] });
                  }
                });
              }
              break;
          }
        }
        Promise.all([
          storeFilterTextPromise,
          storeGridFilterPromise,
          filterTextPrmoise,
          GirdFilterTextPromise,
        ]).then(function (data) {
          resolveAllStores(allStoreIds);
        });
      } else {
        resolveAllStores(null);
      }
    });
  },

  getDefaultFilters(storeCamData, defaultFilter) {
    if (storeCamData) {
      if (storeCamData.$or.length > 0) {
        defaultFilter[1] = { $or: [] };
        if (storeCamData.$or[0].cameraIds) {
          defaultFilter[1].$or.push({
            cameraId: { $in: storeCamData.$or[0].cameraIds },
          });
        }
        if (storeCamData.$or[0].storeIds) {
          defaultFilter[1].$or.push({
            storeId: { $in: storeCamData.$or[0].storeIds },
          });
        }
      }
      if (storeCamData.$and.length > 0) {
        storeCamData.$and.forEach((element) => {
          if (element.cameraIds) {
            defaultFilter[defaultFilter.length] = {
              cameraId: { $in: element.cameraIds },
            };
          }
          if (element.storeIds) {
            defaultFilter[defaultFilter.length] = {
              storeId: { $in: element.storeIds },
            };
          }
        });
      }
    }
    return defaultFilter;
  },
  updateCamStatus: (isConnected, camId) => {
    camera.updateOne(
      { _id: camId },
      { isConnected: isConnected },
      (err, affected, resp) => {

      }
    );
  },

  getCameraDetail(req, res) {
    return new Promise((resolve, reject) => {
      let camFilter = {};
      var camModel = mongoose.model('camera');
      camFilter._id = req.query.camId
        ? req.query.camId.toObjectId()
        : req.body.camId
          ? req.body.camId.toObjectId()
          : null;
      var cameraQuery = camModel.find(camFilter);
      cameraQuery.lean().exec(function (err, camData) {
        if (!err) {
          resolve(camData);
        } else {
          resolve([]);
        }
      });
    });
  },

  getIpAndPort(uri) {
    let url = uri.split('@');
    var camDetails = {};
    if (url.length > 1) {
      if ((url[0].split('/').length = 2)) {
        camDetails.username = url[0].split('/')[2].split(':')[0];
        camDetails.password = url[0].split('/')[2].split(':')[1];
      }
    }
    url = url.length > 1 ? `rtsp://${url[1]}` : url[0];
    url = url.split('/');

    if (url.length > 0) {
      url = url[2];
      url = url.split(':');
      (camDetails.ip = url[0]),
        (camDetails.port = Number(url.length > 1 ? url[1] : 80));
      return camDetails;
    }
  },
  storeNotification: async (data, type, fromUpdateMachineStatus) => {
    let snl = new SiteNotificationLog({
      storeId: data.storeId,
      status: data.status,
      type: type,
      sentOn: null,
      connectDateTime: null,
      disConnectDateTime: null,
    });
    await snl.save();
    // await snl.save((err, record) => {
    //     if (err) {
    //         logger.error(err);
    //         return;
    //     }

    //     User.find({
    //         storeId: data.storeId
    //     }, (err, userData) => {
    //         let to = '';
    //         if (err) {
    //             logger.error(err);
    //         } else {
    //             let storeData = null;
    //             if (userData && userData.length > 0) {

    //                 for (let index = 0, len = userData.length; index < len; index++) {
    //                     let user = userData[index];
    //                     let store = user.storeId.find(e => e._id.toString() === data.storeId);
    //                     if (!storeData && store) {
    //                         storeData = store;
    //                     }
    //                 }

    //                 userData.forEach(user => {
    //                     to += `${to.length == 0 ? '' : ', '}${user.email}`;
    //                 });

    //                 let template = type == STORE_NOTIFICATION_TYPE.CAMERA ? emailNotifier.templates.CameraInfo : emailNotifier.templates.StoreInfo,
    //                     tags = type == STORE_NOTIFICATION_TYPE.CAMERA ? {
    //                         SITE: storeData.name,
    //                         CAMERA_NAME: data.cameraName,
    //                         IP: data.ip,
    //                         STATUS: data.status ? 'Start' : 'Stop',
    //                         PORT: data.port,
    //                         TIME: moment.utc().toString()
    //                     } : {
    //                             SITE: storeData.name,
    //                             STATUS: data.status ? 'Start' : 'Stop',
    //                             TIME: moment.utc().toString(),
    //                             LATITUDE: storeData.latitude || null,
    //                             LONGITUDE: storeData.longitude || null,
    //                             SERIAL_NUMBER: storeData.serialNumber || null
    //                         },
    //                     otn = { to: to, template, tags };
    //              
    //                 otn.to = 'abhijeet.kolay@spraxa.com';
    //                 if (!this.IsDev) {
    //                     emailNotifier.send(otn).then(function (response) {
    //                     }, (err) => {
    //                     }).catch(err => logger.error(err));
    //                 }
    //                 if (fromUpdateMachineStatus) {
    //                     userData.forEach(user => {
    //                         if (user.isSMSEnable) {
    //                             let status = data.status ? 'Start' : 'Stop';
    //                             twilio.createSMS(`${user.mobile}`, `${storeData.name} ${status}.`).then((data) => {
    //                             });
    //                         }
    //                     })
    //                 }
    //             }
    //         }
    //     }).populate('storeId');
    // });
  },
  tunnelPortClose: (port) => {
    return new Promise((resolve, reject) => {
      let requests = [];
      let portResuolt = [];

      store.find({ status: 'Active' }, (err, resp) => {
        if (err) {
          reject({ success: false, message: err.message });
          return;
        }

        if (resp.length == 0) {
          reject({ success: false, message: 'All port are available' });
          return;
        }

        let ports = resp
          .filter((e) => e.tunnelPort !== undefined)
          .map((e) => e.tunnelPort);
        if (port) {
          ports = [port];
        }
        // let cmd = `netstat -ano | findstr :"${ports.join(' ')}"`;
        child.exec(
          'netstat -ano',
          { maxBuffer: 1024 * 1024 * 10 },
          function (error, stdout, stderr) {
            if (error) {
              reject({
                success: false,
                message: error.toString(),
                netstat: true,
                stderr: stderr,
              });
              return;
            }
            let response = [];
            //extra
            response = JSON.parse(JSON.stringify(stdout.trim().split('TCP')));
            delete response[0];
            delete response[response.length - 1];
            //end
            //let list = response.trim().split('\n');
            response.forEach((item) => {
              item = item.split(' ');
              item = item.filter((el) => el != '');
              if (Number(item[3]) !== 0) {
                portResuolt.push({
                  port: Number(
                    item[0].substr(item[0].lastIndexOf(':') + 1, item[0].length)
                  ),
                  pid: Number(item[3]),
                });
              }
            });

            portResuolt = portResuolt
              .map((e) => e['port'])
              // store the keys of the unique objects
              .map((e, i, final) => final.indexOf(e) === i && i)
              // eliminate the dead keys & store unique objects
              .filter((e) => portResuolt[e])
              .map((e) => portResuolt[e]);

            for (
              let index = 0, len = portResuolt.length;
              index < len;
              index++
            ) {
              const item = portResuolt[index];
              let portIndex = this.ports.findIndex((e) => e == item.port);
              if (portIndex > -1) {
                requests.push(
                  child.exec(`taskkill /PID ${item.pid} /F `, {
                    maxBuffer: 1024 * 1024 * 10,
                  })
                );
              }
            }

            Promise.all(requests).then(
              (resp) => {
                resolve({ success: true, message: resp });
              },
              (err) => {
                reject({ success: false, message: err.message });
              }
            );
          }.bind({ ports: ports })
        );
      });
    });
  },
  groupBy(collection, property) {
    var i = 0,
      val,
      index,
      values = [],
      result = [];
    for (; i < collection.length; i++) {
      val = collection[i][property];
      index = values.indexOf(val);
      if (index > -1) result[index].push(collection[i]);
      else {
        values.push(val);
        result.push([collection[i]]);
      }
    }
    return result;
  },
  generateHash(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }

    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = 'length';
    var i, j; // Used as a counter across the whole file
    var result = '';

    var words = [];
    var asciiBitLength = ascii[lengthProperty] * 8;

    //* caching results is optional - remove/add slash from front of this line to toggle
    // Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
    // (we actually calculate the first 64, but extra values are just ignored)
    var hash = (sha256.h = sha256.h || []);
    // Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
    var k = (sha256.k = sha256.k || []);
    var primeCounter = k[lengthProperty];
    /*/
        var hash = [], k = [];
        var primeCounter = 0;
        //*/

    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) {
          isComposite[i] = candidate;
        }
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }

    ascii += '\x80'; // Append Ƈ' bit (plus zero padding)
    while ((ascii[lengthProperty] % 64) - 56) ascii += '\x00'; // More zero padding
    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return; // ASCII check: only accept characters in range 0-255
      words[i >> 2] |= j << (((3 - i) % 4) * 8);
    }
    words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
    words[words[lengthProperty]] = asciiBitLength;

    // process each chunk
    for (j = 0; j < words[lengthProperty];) {
      var w = words.slice(j, (j += 16)); // The message is expanded into 64 words as part of the iteration
      var oldHash = hash;
      // This is now the undefinedworking hash", often labelled as variables a...g
      // (we have to truncate as well, otherwise extra entries at the end accumulate
      hash = hash.slice(0, 8);

      for (i = 0; i < 64; i++) {
        var i2 = i + j;
        // Expand the message into 64 words
        // Used below if
        var w15 = w[i - 15],
          w2 = w[i - 2];

        // Iterate
        var a = hash[0],
          e = hash[4];
        var temp1 =
          hash[7] +
          (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) + // S1
          ((e & hash[5]) ^ (~e & hash[6])) + // ch
          k[i] +
          // Expand the message schedule if needed
          (w[i] =
            i < 16
              ? w[i]
              : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) + // s0
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) | // s1
              0);
        // This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
        var temp2 =
          (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + // S0
          ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2])); // maj

        hash = [(temp1 + temp2) | 0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
        hash[4] = (hash[4] + temp1) | 0;
      }

      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }

    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += (b < 16 ? 0 : '') + b.toString(16);
      }
    }
    return result;
  },
  updateCamerasPublishUrls(camData, isNvr, antMedia) {
    for (let i = 0, len = camData.length; i < len; i++) {
      let lowStreamId = camData[i].lowStreamId;
      let highStreamId = camData[i].highStreamId;
      let isAntMedia =
        camData[i].storeId && camData[i].storeId.isAntMedia == true
          ? true
          : antMedia == true
            ? true
            : false;
      camData[i].mobileStreamURLs = { low: '', high: '' };
      camData[i].publishUrlHigh = this.getPublishUrl(
        highStreamId,
        camData[i].cameraNotes,
        isAntMedia
      );
      camData[i].publishUrlLow = this.getPublishUrl(
        lowStreamId,
        camData[i].cameraNotes,
        isAntMedia
      );
      camData[i].streamHigh = highStreamId;
      camData[i].streamLow = lowStreamId;
      //If Low / High is same, publish and play same stream
      // if (
      //   camData[i].cameraRTSPUrl == camData[i].cameraThumbnailRTSPUrl ||
      //   isNvr
      // ) {
      if (isNvr) {
        camData[i].isRecordingStarted = false;
      }
      //   lowStreamId = highStreamId;
      //   camData[i].publishUrlLow = camData[i].publishUrlHigh;
      //   camData[i].streamLow = camData[i].streamHigh;
      //   camData[i].lowStreamId = highStreamId;
      // }

      let videoConfig = camData[i].storeId.liveVideoConfig;
      camData[i].hls = { lowStreamURL: '', highStreamURL: '' };
      camData[i].flv = { lowStreamURL: '', highStreamURL: '' };
      if (
        videoConfig == 'HLS' ||
        videoConfig == 'FLV' ||
        videoConfig == 'NodeMedia'
      ) {
        let mediaServerURL = camData[i].storeId.mediaServerUrl;
        if (mediaServerURL) {
          mediaServerURL = mediaServerURL.split('//');
          mediaServerURL =
            mediaServerURL.length > 1 ? mediaServerURL[1] : mediaServerURL[0];
          mediaServerURL =
            mediaServerURL + ':' + camData[i].storeId.mediaServerOutboundPort;
        }
        if (videoConfig == 'HLS') {
          camData[i].hls = {
            lowStreamURL: `https://cam-${lowStreamId}.${mediaServerURL}/LiveApp/streams/${lowStreamId}.m3u8?token=${this.generateHash(
              `${lowStreamId}play${AntMediaAdapter.secretKey}`
            )}`,
            highStreamURL: `https://cam-${highStreamId}.${mediaServerURL}/LiveApp/streams/${highStreamId}.m3u8?token=${this.generateHash(
              `${highStreamId}play${AntMediaAdapter.secretKey}`
            )}`,
          };
        }

        if (videoConfig == 'FLV' || videoConfig == 'NodeMedia') {
          if (lowStreamId) {
            var isStreamSecured = this.isNodeMediaSecured();
            var lowSign = '';
            var highSign = '';
            if (isStreamSecured) {
              lowSign = `?sign=${this.getNodeMediaSign(
                'LiveApp',
                lowStreamId
              )}`;
              highSign = `?sign=${this.getNodeMediaSign(
                'LiveApp',
                highStreamId
              )}`;
            }
            camData[i].flv = {
              lowStreamURL:
                `https://${mediaServerURL}/LiveApp/${lowStreamId}.flv` +
                lowSign,
              highStreamURL:
                `https://${mediaServerURL}/LiveApp/${highStreamId}.flv` +
                highSign,
            };
          }
        }
      }

      if (isAntMedia) {
        camData[i].mobileStreamURLs = {
          low: `${camData[i].storeId.mediaServerUrl}:${camData[i].storeId.mediaServerInboundPort}/LiveApp/${lowStreamId}`,
          high: `${camData[i].storeId.mediaServerUrl}:${camData[i].storeId.mediaServerInboundPort}/LiveApp//${highStreamId}`,
        };
      } else {
        var isStreamSecured = this.isNodeMediaSecured();
        var lowSign = '';
        var highSign = '';
        if (isStreamSecured) {
          lowSign = `?sign=${this.getNodeMediaSign('LiveApp', lowStreamId)}`;
          highSign = `?sign=${this.getNodeMediaSign('LiveApp', highStreamId)}`;
        }
        camData[i].mobileStreamURLs = {
          low:
            `${camData[i].storeId.mediaServerUrl}:${camData[i].storeId.mediaServerInboundPort}/LiveApp/${lowStreamId}` +
            lowSign,
          high:
            `${camData[i].storeId.mediaServerUrl}:${camData[i].storeId.mediaServerInboundPort}/LiveApp//${highStreamId}` +
            highSign,
        };
      }

      camData[i].streamToken = {
        low: this.generateHash(
          `${lowStreamId}play${AntMediaAdapter.secretKey}`
        ),
        high: this.generateHash(
          `${highStreamId}play${AntMediaAdapter.secretKey}`
        ),
      };
    }
    return camData;
  },
  getNumberFromGuid(guid) {
    let output = '';
    let len = guid.length;
    if (len > 12) {
      len = 12;
    }
    for (let i = 0; i < len; i++) {
      output += guid.charCodeAt(guid.length - i - 1).toString();
    }
    return output;
  },
  getNodeMediaSign(prefix, streamId) {
    //refer - https://github.com/illuspas/Node-Media-Server
    let currentTime = moment();
    currentTime.add('minutes', 60); //Adding 60 mins

    var timestamp = currentTime.toDate().getTime();

    var hashValue = md5(
      `/${prefix}/${streamId}-${timestamp}-${AntMediaAdapter.secretKey}`
    );

    return `${timestamp}-${hashValue}`;
  },
  getPublishUrl(streamId, notes, isAntMedia) {
    let prefix = 'LiveApp';
    if (notes && notes.indexOf('red5') > -1) {
      prefix = 'live';
    }
    let token;
    if (isAntMedia) {
      token = this.generateHash(
        `${streamId}publish${AntMediaAdapter.secretKey}`
      );
      return `/${prefix}/${streamId}?token=${token}`;
    } else {
      var sign = this.getNodeMediaSign(prefix, streamId);
      return `/${prefix}/${streamId}?sign=${sign}`;
    }
  },
  storeCamInfo(storeId, action) {
    return new Promise(async (resolve, reject) => {
      let storeData = await store.findOne({ _id: storeId });
      camera.find({ storeId: storeId }, (err, camData) => {
        if (err) {
          logger.error(err);
          return;
        }
        let data = JSON.parse(JSON.stringify(camData));
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          if (typeof item.cameraBrand === 'object' && item.cameraBrand !== null) {
            item.cameraBrand = item.cameraBrand.name;
            data[i] = item;
          }
        }
        data = this.updateCamerasPublishUrls(
          data,
          storeData.isNvr,
          storeData.isAntMedia
        );
        resolve(data);
      }).populate('siteSmartDevices').populate({
        path: 'siteSmartDevices.deviceId',
        select: ["name", "scaleIP", "scalePort", "connectionType", "scaleUserName", "scalePassword"],
      }).populate({ path: 'cameraBrand', select: ["name"] });
    });
  },
  async UpdateStorePing(data, isConnectionStarted, remarkContent) {
    let localDateTime = moment().toDate();
    let objDataForUpdate = {};
    logger.info('remarkContent : ' + remarkContent);
    let localDateTimeString = moment().format('MM/DD/YYYY HH:mm:ss A');
    let lastRecordFromNotification = await SiteNotificationLog.find({
      storeId: data.storeId,
      type: 'STORE',
    });

    let storeData = await store.findOne({ _id: data.storeId });

    await store.updateOne(
      { _id: data.storeId },
      { $set: !storeData.isConnected && isConnectionStarted ? { lastConnectedOn: localDateTime } : { lastDisconnectedOn: localDateTime } }
    );

    if (lastRecordFromNotification && lastRecordFromNotification.length > 0) {
      let lastStatus = lastRecordFromNotification[0].status;
      logger.info(
        'Store Updating Last Connected Status: ' +
        data.storeId +
        ' lastStatus: ' +
        lastStatus +
        ' remarkContent : ' +
        remarkContent
      );
      if (!lastStatus) {
        logger.info(
          'Store Updating Last Connected Status: ' + data.storeId + ' Part 1'
        );
        objDataForUpdate = {
          status: true,
          connectDateTime: localDateTime,
          connectStringDate: localDateTimeString,
          remarkContent: remarkContent,
        };
        await store.updateOne(
          { _id: data.storeId, isConnected: false },
          { $set: { isConnected: true } },
          async function (err, affected, resp) {
            if (affected.n > 0) {
              await SiteNotificationLog.update(
                { storeId: data.storeId, type: 'STORE', status: false },
                { $set: objDataForUpdate }
              );
            }
          }
        );
      } else {
        logger.info(
          'Store Updating Last Connected Status: ' + data.storeId + ' Part 2'
        );
        await store.updateOne(
          { _id: data.storeId },
          { $set: { isConnected: true } }
        );
        await SiteNotificationLog.update(
          { storeId: data.storeId, type: 'STORE' },
          { $set: { status: true } }
        );
      }
    } else {
      logger.info('Store Inserting Last Connected Status: ' + data.storeId);
      objDataForUpdate = {
        connectDateTime: localDateTime,
        type: STORE_NOTIFICATION_TYPE.STORE,
        disConnectDateTime: null,
        disConnectStringDate: null,
        status: isConnectionStarted,
        storeId: data.storeId,
        connectStringDate: localDateTimeString,
        connectDateTime: localDateTime,
      };
      let snl = new SiteNotificationLog(objDataForUpdate);
      await snl.save();
    }
  },
  async UpdateCameraPing(camDetail) {
    try {
      let localDateTime = moment().toDate();
      let localDateTimeString = moment().format('MM/DD/YYYY hh:mm:ss A');
      //logger.info('Date from OSS: ' + camDetail.connectDisconnectDate);
      //logger.info('CamId: ' + camDetail.camId + ' Status ' + camDetail.ConnectedDisconnectStatus);
      let lastRecordFromNotification = await SiteNotificationLog.find({
        camId: camDetail.camId.toObjectId(),
      }),
        lastConnectDateTime,
        lastDisconnectedDateTime,
        lastStatus;

      if (lastRecordFromNotification && lastRecordFromNotification.length > 0) {
        lastStatus = lastRecordFromNotification[0].status;
        if (lastStatus != camDetail.ConnectedDisconnectStatus) {
          logger.info(
            'CamId: ' +
            camDetail.camId +
            ' Status changed to: ' +
            camDetail.ConnectedDisconnectStatus
          );
          if (camDetail.ConnectedDisconnectStatus) {
            await SiteNotificationLog.update(
              { _id: lastRecordFromNotification[0].id },
              {
                $set: {
                  connectDateTime: localDateTime,
                  connectStringDate: localDateTimeString,
                  status: camDetail.ConnectedDisconnectStatus,
                },
              }
            );
          } else {
            await SiteNotificationLog.update(
              { _id: lastRecordFromNotification[0].id },
              {
                $set: {
                  disConnectDateTime: localDateTime,
                  disConnectStringDate: localDateTimeString,
                  status: camDetail.ConnectedDisconnectStatus,
                },
              }
            );
          }
          lastRecordFromNotification = await SiteNotificationLog.find({
            camId: camDetail.camId.toObjectId(),
          });
        }
      } else {
        let snl = new SiteNotificationLog({
          camId: camDetail.camId.toObjectId(),
          connectDateTime: camDetail.ConnectedDisconnectStatus
            ? localDateTime
            : null,
          connectStringDate: camDetail.ConnectedDisconnectStatus
            ? localDateTimeString
            : null,
          type: STORE_NOTIFICATION_TYPE.CAMERA,
          sentOn: null,
          disConnectDateTime: camDetail.ConnectedDisconnectStatus
            ? null
            : localDateTime,
          disConnectStringDate: camDetail.ConnectedDisconnectStatus
            ? null
            : localDateTimeString,
          status: camDetail.ConnectedDisconnectStatus,
        });
        await snl.save();
        lastRecordFromNotification = await SiteNotificationLog.find({
          camId: camDetail.camId.toObjectId(),
        });
        lastStatus = !camDetail.ConnectedDisconnectStatus;
      }
      let cameraDetail = await camera
        .find({ _id: camDetail.camId, status: 'Active' })
        .populate('storeId');
      if (cameraDetail && cameraDetail.length > 0 && cameraDetail[0].storeId) {
        let camera = cameraDetail[0];

        let notificationFrequency = Number(
          camera.storeId.notificationFrequency
        );
        if (!camDetail.ConnectedDisconnectStatus) {
          if (
            cameraDetail &&
            cameraDetail.length > 0 &&
            cameraDetail[0].storeId
          ) {
            if (
              cameraDetail[0].storeId.siteOnMonitor &&
              cameraDetail[0].storeId.status == 'Active'
            ) {
              let sendSMS = lastStatus != camDetail.ConnectedDisconnectStatus;
              if (sendSMS && camera.storeId.isConnected) {
                lastConnectDateTime =
                  lastRecordFromNotification[0].connectDateTime;
                lastDisconnectedDateTime =
                  lastRecordFromNotification[0].disConnectDateTime;
                await this.SendSMS(
                  camera.name,
                  lastDisconnectedDateTime,
                  camera.storeId.name,
                  lastConnectDateTime,
                  camera.storeId.timezoneValue,
                  camera.storeId.id,
                  camDetail.ConnectedDisconnectStatus,
                  camDetail.camId.toObjectId()
                );
              }
              let to = camera.storeId.email,
                camName = camera.name,
                camInfo = this.getIpAndPort(camera.cameraRTSPUrl),
                siteName = camera.storeId.name;
              let lastSentOn = lastRecordFromNotification[0].sentOn || 0;
              if (notificationFrequency > 0) {
                let timeDiff = moment
                  .duration(moment().diff(moment(lastSentOn)))
                  .asMinutes();
                //logger.info('CamId ' + camDetail.camId + ' Date from connectOn: ' + connectOn);
                //logger.info('CamId ' + camDetail.camId + ' Date from disconnectonOn: ' + disconnectonOn);
                //logger.info('CamId ' + camDetail.camId + ' Date from lastSentOn:  ' + lastSentOn);
                if (
                  timeDiff >= notificationFrequency &&
                  camera.storeId.isConnected
                ) {
                  logger.info(
                    'Camera Disconnect - after last date sent on  condition, sending disconnect email: ' +
                    localDateTime
                  );
                  //Fetching last record for sending in email
                  lastConnectDateTime =
                    lastRecordFromNotification[0].connectDateTime;
                  lastDisconnectedDateTime =
                    lastRecordFromNotification[0].disConnectDateTime;
                  camInfo.camId = camDetail.camId;
                  await SiteNotificationLog.update(
                    { camId: camDetail.camId },
                    {
                      $set: {
                        sentOn: moment().toDate(),
                        status: camDetail.ConnectedDisconnectStatus,
                      },
                    }
                  );
                  await this.DisconnectEvent(
                    to,
                    camName,
                    lastDisconnectedDateTime,
                    camInfo,
                    siteName,
                    lastConnectDateTime,
                    camera.storeId.timezoneValue,
                    camera.storeId.id
                  ); //to, camname, disconnectdatetime
                  logger.info(
                    `Camera Disconnect Mail Sent - Next Time Entry: CamId: ${camDetail.camId} timeDiff: ${timeDiff} notificationFrequency: ${notificationFrequency}`
                  );
                } else {
                  logger.info(
                    `Camera Disconnect Mail Not Sent - Last Sent is Less than Frequency: CamId: ${camDetail.camId
                    } currentDate: ${moment()} lastSentOn: ${lastSentOn} timeDiff: ${timeDiff} notificationFrequency: ${notificationFrequency}`
                  );
                }
              } else {
                logger.info(
                  `Camera Disconnect Mail Not Sent - Frequency is ZERO: CamId: ${camDetail.camId
                  } ${new Date()}`
                );
              }
            }
          }
        } else {
          await SiteNotificationLog.update(
            { camId: camDetail.camId },
            { $set: { status: camDetail.ConnectedDisconnectStatus } }
          );
        }
      }
    } catch (ex) {
      logger.error(`CameraNotification Exception: ${ex}`);
    }
  },
  async DisconnectEvent(
    to,
    camName,
    disConnectDateTime,
    camInfo,
    siteName,
    connectDateTime,
    timezoneValue,
    storeId
  ) {
    try {
      //to = 'yendutt@spraxa.com';
      let template = emailNotifier.templates.DisconnectCamReport,
        tags = {
          CAMERA: camName,
          DISCONNECT_DATE: timezoneValue
            ? moment(disConnectDateTime)
              .tz(timezoneValue)
              .format('MM/DD/YYYY hh:mm:ss A')
            : moment(disConnectDateTime).format('MM/DD/YYYY hh:mm:ss A'),
          SITENAME: siteName,
          CONNECT_DATE: connectDateTime
            ? timezoneValue
              ? moment(connectDateTime)
                .tz(timezoneValue)
                .format('MM/DD/YYYY hh:mm:ss A')
              : moment(connectDateTime).format('MM/DD/YYYY hh:mm:ss A')
            : '',
          IP: camInfo.ip,
          PORT: camInfo.port,
        },
        otn = { to: to, template, tags };
      return await this.SendEmail(otn, camInfo.camId, storeId);
    } catch (ex) {
      logger.error(`CameraNotification DisconnectEvent Exception: ${ex}`);
    }
  },
  async AddDeviceConnectivityLog(
    camId,
    storeId,
    isEmailMessage,
    isTextMessage,
    type,
    status,
    remarkContent
  ) {
    try {
      logger.info('Store Inserting in DeviceConnectivity for Logs');
      let deviceConnectivityLog = new DeviceConnectivityLogModel.DeviceConnectivityLogModel(
        {
          storeId: storeId,
          camId: camId,
          type: type, // Site/Camera
          eventTime: moment().toDate(),
          status: status,
          isCam: camId ? true : false,
          isStore: type == STORE_NOTIFICATION_TYPE.STORE,
          isEmailMessage: isEmailMessage,
          isTextMessage: isTextMessage,
          remarkHistory: remarkContent,
        }
      );
      await deviceConnectivityLog.save();
    } catch (ex) {
      logger.error(`CameraNotification DisconnectEvent Exception: ${ex}`);
    }
  },
  async SendEmail(options, camId, storeId) {
    let response = { success: false, message: '' };
    return new Promise((resolve) => {
      emailNotifier.send(options).then(
        async (response) => {
          response.success = true;
          await SiteNotificationLog.update(
            { camId: camId },
            {
              $set: {
                sentOn: moment().toDate(),
                status: false,
                remarkContent: response.response,
              },
            }
          );
          response.message = 'Email Notification sent.';
          logger.info(`Camera Email Notification Sent: ${options.to}`);
          await this.AddDeviceConnectivityLog(
            camId.toObjectId(),
            storeId,
            true,
            false,
            STORE_NOTIFICATION_TYPE.CAMERA,
            true,
            `Camera Email Notification Sent: ${options.to}`
          ); //to, camname, AddDeviceConnectivityLog
          resolve(response);
        },
        async (err) => {
          logger.info(`Disconnect Camera Error: ${err.message}`);
          response.message = err.message;
          await SiteNotificationLog.update(
            { camId: camId },
            {
              $set: {
                sentOn: moment().toDate(),
                status: false,
                remarkContent: `Camera Email not Sent on  ${options.to} Error: ${err.message}`,
              },
            }
          );
          await this.AddDeviceConnectivityLog(
            camId.toObjectId(),
            storeId,
            true,
            false,
            STORE_NOTIFICATION_TYPE.CAMERA,
            false,
            `Camera Email not Sent on  ${options.to} Error: ${err.message}`
          ); //to, camname, AddDeviceConnectivityLog
          resolve(response);
        }
      );
    });
  },

  async SendSMS(
    camName,
    disConnectDateTime,
    siteName,
    connectDateTime,
    timezoneValue,
    userStoreId,
    isConnected,
    camId
  ) {
    let body = `Camera Name: ${camName} of Site : ${siteName} is ${isConnected ? 'up' : 'down'
      }.
        Disconnect Time: ${disConnectDateTime
        ? timezoneValue
          ? moment(disConnectDateTime)
            .tz(timezoneValue)
            .format('MM/DD/YYYY hh:mm:ss A')
          : moment(disConnectDateTime).format('MM/DD/YYYY hh:mm:ss A')
        : ''
      }
        Last Connect Time:  ${connectDateTime
        ? timezoneValue
          ? moment(connectDateTime)
            .tz(timezoneValue)
            .format('MM/DD/YYYY hh:mm:ss A')
          : moment(connectDateTime).format('MM/DD/YYYY hh:mm:ss A')
        : ''
      }`;
    if (this.isNull(camName)) {
      body = `Site : ${siteName} is ${isConnected ? 'up' : 'down'}.
            Disconnect Time: ${disConnectDateTime
          ? timezoneValue
            ? moment(disConnectDateTime)
              .tz(timezoneValue)
              .format('MM/DD/YYYY hh:mm:ss A')
            : moment(disConnectDateTime).format('MM/DD/YYYY hh:mm:ss A')
          : ''
        }
            Last Connect Time:  ${connectDateTime
          ? timezoneValue
            ? moment(connectDateTime)
              .tz(timezoneValue)
              .format('MM/DD/YYYY hh:mm:ss A')
            : moment(connectDateTime).format('MM/DD/YYYY hh:mm:ss A')
          : ''
        }`;
    }
    try {
      logger.debug('Sending SMS');
      let userData = await User.find({
        storeId: userStoreId,
        status: 'Active',
      }).populate('storeId');
      if (userData && userData.length > 0) {
        userData.forEach(async (user) => {
          if (user.isSMSEnable && user.mobile.length >= 10) {
            await twilio.createSMS(`${user.mobile}`, body).then(
              async (data) => {
                logger.error(`SMS Sent: ${data}`);
                await this.AddDeviceConnectivityLog(
                  camId,
                  userStoreId,
                  false,
                  true,
                  this.isNull(camName)
                    ? STORE_NOTIFICATION_TYPE.STORE
                    : STORE_NOTIFICATION_TYPE.CAMERA,
                  true,
                  `SMS Sent on ${user.mobile} for Site::${siteName} ${camName}`
                ); //to, camname, AddDeviceConnectivityLog
              },
              async (err) => {
                logger.error(`SMS Twilio Error: ${err}`);
                await this.AddDeviceConnectivityLog(
                  camId,
                  userStoreId,
                  false,
                  true,
                  this.isNull(camName)
                    ? STORE_NOTIFICATION_TYPE.STORE
                    : STORE_NOTIFICATION_TYPE.CAMERA,
                  false,
                  `SMS Not Sent on ${user.mobile} Error for site:${siteName} ${camName} ${err}`
                ); //to, camname, AddDeviceConnectivityLog
              }
            );
          }
        });
      }
    } catch (ex) {
      logger.error(`CameraNotification DisconnectEvent Exception: ${ex}`);
    }
  },
  GetStoreLocalTimeByStore(datetime, offSet) {
    let utcTimeZoneOffSet = offSet;
    let currentTimeZoneOffSet = -moment().utcOffset();
    if (currentTimeZoneOffSet == utcTimeZoneOffSet || !utcTimeZoneOffSet) {
      return moment(datetime);
    }
    return moment(datetime).zone(utcTimeZoneOffSet);
  },
  async guid(isInteger) {
    if (isInteger) {
      let time = await new Promise((res, rej) => {
        setTimeout(() => res(Date.now()), 100);
      });
      return time + 621355968000000000;
    }
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return (
      s4() +
      s4() +
      '-' +
      s4() +
      '-' +
      s4() +
      '-' +
      s4() +
      '-' +
      s4() +
      s4() +
      s4()
    );
  },
  // Get url for playing videos from azure
  getAzurePlayUrl(azureVideoFileName) {
    var startDate = new Date();
    startDate.setMinutes(startDate.getMinutes() - 5);
    var expiryDate = new Date(startDate);
    expiryDate.setMinutes(startDate.getMinutes() + 60);

    var permissions = azure.BlobUtilities.SharedAccessPermissions.READ;

    var sharedAccessPolicy = {
      AccessPolicy: {
        Permissions: permissions,
        Start: startDate,
        Expiry: expiryDate
      }
    };
    var sasToken = blobService.generateSharedAccessSignature(config.azure.container, azureVideoFileName, sharedAccessPolicy);
    let url = blobService.getUrl(config.azure.container, azureVideoFileName, sasToken, true);
    return url;
  },
  getStreamId(camId, streamType) {
    return `${camId}-${streamType}`
  },
  deleteAntStream: async (storeId) => {
    let response = { success: false, message: null };
    try {
      //Find All camera with store record
      let cameraRecords = await camera.find({ storeId: storeId }).populate("storeId");
      let storeData = cameraRecords[0].storeId;
      //Check if store not configured with ANT Media
      if (!storeData.isAntMedia) {
        response.success = true;
        return response;
      }
      //Create Media Server API Instance
      let mediaServerUrl = new URL(storeData.mediaServerUrl);
      mediaServerUrl = `https://${mediaServerUrl.hostname}:${storeData.mediaServerOutboundPort}`;
      let adapter = new AntMediaAdapter(mediaServerUrl);

      if (cameraRecords && cameraRecords.length > 0) {
        //Delete all streamid from ant media
        for (let i = 0; i < cameraRecords.length; i++) {
          const cameraRecord = cameraRecords[i];
          if (cameraRecord.lowStreamId) { await adapter.delete(cameraRecord.lowStreamId) }
          if (cameraRecord.highStreamId) { await adapter.delete(cameraRecord.highStreamId) }
          if (cameraRecord.aiStreamId) { await adapter.delete(cameraRecord.aiStreamId) }
        }
        response.success = true;
      }
      else {
        response.message = "Camera Not Found";
      }
    } catch (ex) {
      response.message = ex.message;
      logger.error(ex);
    }
    return response;
  },
  delay: async (ms) => { return new Promise((res) => setTimeout(res, ms)) },
  isBroadcasting: async (streamId, storeId) => {
    let response = { success: true, message: "" };
    let storeData = await store.findOne({ _id: storeId });
    let mediaServerUrl = new URL(storeData.mediaServerUrl);
    let antMedia = {
      ami: new AntMediaAdapter(`https://xyz.${mediaServerUrl.hostname}:${storeData.mediaServerOutboundPort}`),
      store: storeData,
      mediaServerUrl: mediaServerUrl
    };

    if (antMedia.store.isAntMedia) {
      let streamResponse = await antMedia.ami.load(streamId);
      if (streamResponse.success) {
        response.success = streamResponse.status == "broadcasting";
      } else {
        response.success = false;
      }
    } else {
      mediaServerUrl = antMedia.mediaServerUrl;
      let apiResponse = await AntMediaAdapter.apiRequest({
        url: `https://xyz.${mediaServerUrl.hostname}:${antMedia.store.mediaServerOutboundPort}/api/streams`,
        rejectUnauthorized: false,
        json: true,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (apiResponse.success) {
        response.success = apiResponse.LiveApp.hasOwnProperty(streamId);
      } else {
        response.success = false;
      }
    }

    return response;
  },
  portList: async () => {
    return new Promise(res => {
      child.exec('netstat -ano', { maxBuffer: 1024 * 1024 * 10 }, function (error, stdout, stderr) {
        let response = [];
        let ports = [];
        if (error) {
          res(ports);
          return;
        }
        response = JSON.parse(JSON.stringify(stdout.trim().split('TCP')));

        delete response[0];
        delete response[response.length - 1];

        response.forEach(item => {
          item = item.split(' ');
          item = item.filter(el => el != "");
          if (Number(item[3]) !== 0) {
            let port = Number(item[0].substr(item[0].lastIndexOf(':') + 1, item[0].length));
            ports.push(port);
          }
        });
        res(ports);
      });
    })
  }
};