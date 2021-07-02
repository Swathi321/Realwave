const restHandler = require('./restHandler')();
restHandler.setModelId('store', ['name'], 'Store name already exists');
const mongoose = require('mongoose');
const Store = require('./../modals/store');
const UserModel = require('./../modals/user');
const Client = require('../modals/client');
const SmartDeviceLog = require('./../modals/smartDeviceLog');
const util = require('../util/util');
const crypto = require('crypto');
const fs = require('fs');
const webSocket = require('../plugin/Socket');
const macAddress = require('./../modals/macAddress');
const logger = require('./../util/logger');
const camera = require('../modals/camera');
const _ = require('lodash');
var moment = require('moment');
const DaemonSocket = require('./../plugin/DaemonSocket');
const dashboard = require('./dashboard');
const ReverseSSH = require('./../util/ReverseSSH');
String.prototype.toObjectId = function () {
  var ObjectId = require('mongoose').Types.ObjectId;
  return ObjectId(this.toString());
};
var searchToken = null;
/**
 * function to handle GET request to receive all the locations
 * @param {object} req
 * @param {object} res
 */
function getStores(req, res) {
  let params = Object.assign({}, req.body, req.query);
  dashboard.getStores(req, res).then(async function (storeFilter) {
    var defaultFilter = [];

    if (storeFilter && storeFilter.clientId) {
      const clientData = await Client.findById(storeFilter.clientId, {
        clientType: 1,
      });
      console.log(clientData, 'clientData');
      if (
        storeFilter.userRoleStatus.isInstallerRole == true ||
        clientData.clientType == 'installer'
      ) {
        let query = {
          $or: [
            { _id: storeFilter.clientId._id },
            { installerId: storeFilter.clientId._id },
          ],
        };
        let clientResult = await Client.find(query);
        let clientList;
        if (clientResult.length > 0) {
          clientList = clientResult.map((el) => {
            return el._id;
          });
        }

        defaultFilter.push({
          clientId: { $in: clientList },
        });
      } else {
        defaultFilter.push({
          clientId: storeFilter.clientId,
        });
      }
    }
    if (
      params.monitorTypeSelected ||
      (storeFilter &&
        storeFilter.stores &&
        ((storeFilter.role != util.Role.Admin &&
          storeFilter.role != util.Role.ClientAdmin &&
          storeFilter.userRoleStatus.isInstallerRole != true && storeFilter.userRoleStatus.isClientAdminRole != true &&
          storeFilter.userRoleStatus.isAdminRole == false) ||
          storeFilter.isTags))
    ) {
      defaultFilter.push({
        _id: {
          $in: storeFilter.stores.map(function (strVale) {
            return strVale._id;
          }),
        },
      });
    }
    switch (req.body.action) {
      case 'export':
        restHandler.getExportRecord(req, res, null, false, defaultFilter);
        break;
      default:
        restHandler.getResources(req, res, null, false, defaultFilter);
        break;
    }
  });
}

function getStoreListByUser(req, res) {
  var params = Object.assign({}, req.body, req.query);
  var model = mongoose.model('user');
  model
    .find({ _id: mongoose.Types.ObjectId(params.userId) }, (err, user) => {
      userData = user.length > 0 ? user[0] : [];
      var storeData = [];
      if (userData && userData.storeId.length > 0) {
        storeData = userData.storeId.slice();
        storeData = storeData.filter((e) => e.status === 'Active');
      }
      var response = {};
      if (!user) {
        response.message = err;
        response.success = false;
        res.status(200).json(response);
        return;
      }
      data = user[0];
      response.success = true;
      response.data = storeData;
      res.status(200).json(response);
    })
    .populate('storeId');
}

function onActionComplete(err, respData, req) {
  // on updaet ans save call onsite sever for update config
  if (!err) {
    if (req.body.thumbnail) {
      var base64Data = req.body.thumbnail.replace(
        /^data:image\/png;base64,/,
        ''
      );

      fs.writeFile(
        'Images//Map//' + respData._id.toString() + '.png',
        base64Data,
        'base64',
        function (err) {
          logger.error(err);
        }
      );
    }
    let params = Object.assign({}, req.params, req.body),
      data = JSON.parse(params.data);
    let options = {
      action: 'storeDetail',
      data: {
        storeId: respData.id,
        storeDetail: respData,
      },
    };
    webSocket.Send(options);
  }
}

function updateReq(req) {
  if (req.files && req.files.length > 0) {
    var data = JSON.parse(req.body.data);
    var map = data.map;
    req.files.forEach((element) => {
      map = element.filename;
    });
    req.body.data = JSON.stringify(Object.assign({}, data, { map: map }));
  }
  return req;
}

/**
 * Event for before delete
 * @param {*} req Server Request object
 * @param {*} res Server Request object
 * @param {*} cb Callback function.
 */
let beforeDelete = (req, res, cb) => {
  let params = Object.assign({}, req.body, req.query, req.params);
  UserModel.countDocuments(
    { storeId: params.id.toObjectId() },
    async (err, count) => {
      let response = {
        success: false,
        message: 'You cannot delete the site, it is already assigned to users',
      };
      if (err) {
        response.message = err.message;
        res.json(response);
        return;
      }

      if (count > 0) {
        res.json(response);
        return;
      }
      //deleting all Cam's assigned to Store before deleting Store
      await camera.deleteMany({ storeId: params.id.toObjectId() });
      cb();
    }
  );
};

const onStoreDelete = async (id) => {
  await camera.remove({ storeId: id }, { multi: true });
}

function getStore(req, res) {
  switch (req.body.action) {
    case 'load':
      restHandler.getResource(req, res);
      break;
    case 'update':
      restHandler.updateResource(updateReq(req), res, onActionComplete);
      break;
    case 'save':
      restHandler.insertResource(updateReq(req), res, onActionComplete);
      break;
    case 'delete':
      beforeDelete(req, res, () => {
        restHandler.deleteResource(req, res, onStoreDelete);
      });
      break;
    default:
      restHandler.getResource(req, res);
      break;
  }
}

/**
 * function to handle GET/POST request to create the raw store with machine serial number.
 * @param {object} req
 * @param {object} res
 */
function getStoreCameras(req, res) {
  var cameraModel = mongoose.model('camera');
  var params = Object.assign({}, req.body, req.query);
  var guid =
    params.serialNumber ||
    crypto.randomBytes(20).toString('hex').toLocaleUpperCase();
  Store.find({ serialNumber: guid }, (err, store) => {
    if (err) {
      res.json({
        success: false,
        message: err.message,
      });
      return;
    }
    // get cameras
    if (store.length > 0) {
      var filter = {
        storeId: { $in: store[0].id },
        status: { $ne: 'Inactive' },
      };
      var query = cameraModel
        .find(filter)
        .populate(
          'storeId',
          'id name address city state country zipCode latitude longitude isConnected'
        );
      query.lean().exec(function (err, data) {
        if (!err) {
          res.json({ message: 'camera lists.', success: true, data });
        } else {
          res.json({ message: 'camera not found', success: false, data: [] });
        }
      });
    } else {
      res.json({ message: 'camera not found', success: false, data: [] });
    }
  });
}

/**
 * function to handle GET/POST request to create the raw store with machine serial number.
 * @param {object} req
 * @param {object} res
 */
async function storeConnect(req, res) {
  var params = Object.assign({}, req.body, req.query);
  var guid =
    (params.serialNumber && params.serialNumber.trim()) ||
    crypto.randomBytes(20).toString('hex').toLocaleUpperCase();
  var reqMacAddress = params.macAddress;
  var searchCriteria = { serialNumber: guid };

  // Add a check for Ticket 21860 to validate mac
  var chuncks = reqMacAddress ? reqMacAddress.match(/.{1,2}/g) : null;
  var found = await macAddress.find({
    $or: [
      {
        macaddress: chuncks ? chuncks.join('-') : null, //returns 12-34-56-78-90
      },
      {
        macaddress: chuncks ? chuncks.join(':') : null, //returns 12:34:56:78:90
      },
    ],
  });

  //Don't continue further
  if (!found || found.length <= 0) {
    logger.info('Unauthorized request from MAC:' + reqMacAddress);
    return res.json({
      message: 'Unauthorized MAC: ' + reqMacAddress || '',
      success: false,
      data: {},
      camera: [],
    });
  }

  Store.find(searchCriteria, (err, storeBySerialNumber) => {
    if (err) {
      return res.json({
        success: false,
        message: err.message,
      });
    }

    if (storeBySerialNumber.length > 0) {
      let storeData = storeBySerialNumber[0];
      Store.findOne({ _id: storeData.id }, function (err, record) {
        let updateOptions = {
          driveLists: params.drivesInfo,
          timeZone: Number(params.timezone),
          macAddress: reqMacAddress,
        };
        if (
          storeData.latitude == 0 &&
          storeData.longitude == 0 &&
          params.latitude &&
          params.longitude
        ) {
          updateOptions.latitude = params.latitude;
          updateOptions.longitude = params.longitude;
        }
        Store.findOneAndUpdate({ _id: storeData.id }, updateOptions, {
          new: true,
        }).then((updateed) => {
          util.getConfiguredAllCamera(storeData.id).then((camData) => {
            res.json({
              message: 'Store have been Updated.',
              success: true,
              data: updateed,
              camera: camData,
            });
          });
        });
      });
    } else {
      let newStore = new Store({
        name: guid,
        storeType: '',
        serialNumber: guid,
        status: 'Inactive',
        address: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        isDeleted: 0,
        videoDir: params.videoDirPath,
        driveLists: params.drivesInfo,
        latitude: params.latitude,
        longitude: params.longitude,
        macAddress: reqMacAddress,
      });
      newStore.save().then((inserted) => {
        res.json({
          message:
            'Store has been created, contact administrator to activate it',
          success: true,
          data: inserted,
          camera: [],
        });
      });
    }
  });
}

/**
 * function to handle GET/POST Moniter.
 * @param {object} req
 * @param {object} res
 */
function moniterCpuData(req, res) {
  var params = Object.assign({}, req.body, req.query);
  webSocket.BroadcastToClient({ params });
}

/**
 * function to handle GET/POST Moniter.
 * @param {object} req
 * @param {object} res
 */
function moniterMemoryData(req, res) {
  var params = Object.assign({}, req.body, req.query);
  webSocket.BroadcastToClient({ params });
  console.log(params);
  res.json({ success: true, message: 'Data Received' });
}

function getStoreId(req, res) {
  var params = Object.assign({}, req.body, req.query);
  if (params.storeName) {
    Store.find({ name: params.storeName }, (err, store) => {
      if (err) {
        res.send(err);
        return;
      }

      res.json(store);
    });
  }
}

/**
 * @desc success event for post data on server.
 * @param {Object} success response data return from server.
 */
function lastInvoiceId(req, res) {
  let params = Object.assign({}, req.body, req.query),
    response = { success: false, message: '', data: null };

  switch (params.action) {
    case 'GET':
      Store.findOne({ _id: params.storeId.toObjectId() }, (err, store) => {
        if (err) {
          response.message = err.message;
          res.json(response);
          return;
        }
        response.success = true;
        response.data = store;
        res.json(response);
      });
      break;

    case 'SET':
      Store.findOne({ _id: params.storeId.toObjectId() }, (err, store) => {
        if (err) {
          response.message = err.message;
          res.json(response);
          return;
        }
        response.success = true;
        response.data = store;
        res.json(response);
      });
      break;
  }
}

function dateFormat(date) {
  return new Date(
    moment(date, 'YYYY-MM-DDTHH:mm:ss').format('YYYY-MM-DD HH:mm:ss.000') + 'Z'
  );
}

function eventParser(recordType, dataObj) {
  var data = _.values(dataObj);
  return new Promise(function (resolveMain, rejectMain) {
    var length = data.length;
    if (Array.isArray(data)) {
      var deviceSerials = [
        ...new Set(data.map((deviceData) => deviceData.DeviceSerial)),
      ];
      Store.find({ smartDevices: { $in: deviceSerials } }, (err, storeData) => {
        var bulk = SmartDeviceLog.collection.initializeUnorderedBulkOp();
        var stores = {};
        for (let index = 0; index < length; index++) {
          let element = data[index];
          if (storeData && storeData.length > 0) {
            storeData = JSON.parse(JSON.stringify(storeData));
            if (!stores[element.DeviceSerial]) {
              var storeIndex = storeData.findIndex(
                (e) =>
                  e.smartDevices &&
                  e.smartDevices.length > 0 &&
                  e.smartDevices.indexOf(element.DeviceSerial) != -1
              );
              if (storeIndex != -1) {
                stores[element.DeviceSerial] = {
                  storeId: storeData[storeIndex]._id.toObjectId(),
                  clientId: storeData[storeIndex].clientId
                    ? storeData[storeIndex].clientId.toObjectId()
                    : null,
                };
              }
            }
          }
          var storeId = null,
            clientId = null;
          if (stores[element.DeviceSerial]) {
            storeId = stores[element.DeviceSerial].storeId;
            clientId = stores[element.DeviceSerial].clientId;
          }
          if (element.EventTime) {
            element.EventTime = dateFormat(element.EventTime);
          }
          if (element.DoorOpen) {
            element.DoorOpen = dateFormat(element.DoorOpen);
          }
          if (element.DoorClose) {
            element.DoorClose = dateFormat(element.DoorClose);
          }
          if (element.DoorClose) {
            element.DoorClose = dateFormat(element.DoorClose);
          }
          if (element.StartTime) {
            element.StartTime = dateFormat(element.StartTime);
          }
          if (element.EndTime) {
            element.EndTime = dateFormat(element.EndTime);
          }
          if (element.CaptureTime) {
            element.CaptureTime = dateFormat(element.CaptureTime);
          }
          element.RecordType = recordType;
          element.clientId = clientId;
          element.storeId = storeId;
          bulk
            .find({ Id: element.Id, RecordType: recordType })
            .upsert()
            .updateOne({ $set: element });

          if (recordType == 'HealthRecord') {
            if (element.Temperature > 25) {
              let alarmData = {
                storeId: storeId,
                cameraId: null,
                type: 'Temperature',
                eventTime: element.EventTime,
                status: 'Open',
                location: 'Cold Storage',
                details:
                  'Temperature higher than ' +
                  ((element.Temperature * 9) / 5 + 32) +
                  ' °F',
                closedOn: null,
              };
              util.createAlarm(alarmData);
            }
          }
          if (recordType == 'DoorRecord') {
            if (element.DoorOpen) {
              let alarmData = {
                storeId: storeId,
                cameraId: null,
                type: 'Door Open',
                eventTime: element.EventTime,
                location: 'Back Door',
                status: 'Open',
                details: '',
                closedOn: null,
              };
              util.createAlarm(alarmData);
            }
          }
        }
        resolveMain(bulk);
      });
    } else {
      resolveMain(null);
    }
  });
}

function getSmartDeviceTemperature(req, res) {
  logger.info('Cooler Data Received');
  var data = Object.assign({}, req.body, req.params);

  logger.info('Store List: GetSmartDeviceTemperature: ' + data);
  var query = req.query;
  var recordType = query && query.recordType ? query.recordType : null;

  switch (recordType) {
    case 'HealthRecord':
    case 'DoorRecord':
    case 'MovementRecord':
    case 'VisionRecord':
      eventParser(recordType, data)
        .then(function (bulk) {
          if (bulk && bulk.length > 0) {
            bulk.execute().then(function (data) {
              console.log(data);
              res.json({ message: 'Record saved successfully.', data: data });
            });
          } else {
            logger.info('getSmartDeviceTemperature No record found to update ');
          }
        })
        .catch((err) => {
          res.status(404).json({
            success: false,
            message: err.message,
          });
        });
      break;
    default:
      console.log('Invalid record type ' + recordType);
      break;
  }

  logger.info('Cooler Data Received End');
  //	var response = {};
  //response.success = true;
  //response.data = data;
  //res.status(200).json(response);
}

/**
 * Api for restart the oss.
 * @param {object} req
 * @param {object} res
 */
const restartOss = async (req, res) => {
  var params = Object.assign({}, req.body, req.params, req.query);
  let response = { success: false };

  try {
    if (util.isNull(params.storeId)) {
      response.message = 'Store id cannot be blank';
      return res.json(response);
    }

    let storeRecord = await Store.findById({ _id: params.storeId });
    if (storeRecord) {
      let clientAll = webSocket.clients.filter(
        (e) => e.type == 'onsite' && e.storeId == params.storeId
      );
      if (clientAll && clientAll.length > 0) {
        let options = {
          action: 'restart',
          isFullRestart: true,
          data: {
            storeId: params.storeId,
          },
        };
        webSocket.Send(options);
        response.success = true;
        response.message =
          'Your request has been processed,\n It will take 2-3 minutes for Rex to reconnect';
      } else {
        response.message =
          'Hub is not connected, Your request could not be processed';
      }
    } else {
      response.message = 'Store not exists';
    }
  } catch (ex) {
    response.success = false;
    response.message = ex.message;
    logger.error(ex);
  }

  res.json(response);
};

const daemon = async (req, res) => {
  var params = Object.assign({}, req.body, req.params, req.query);
  let response = { success: false, message: "" };

  let action = Number(params.action);

  if (!DaemonSocket.isHubAvailable(params.serialKey)) {
    response.message = "Hub is not connected";
    delete util.boxRestartOn[params.storeId];
    return res.json(response);
  }

  if (action == 0 || action == 2) {
    let hasBoxRecentlyRestarted = util.hasRecentlyRestarted(params.storeId);
    if (hasBoxRecentlyRestarted) {
      response.message = "Site will be available in 2-3 Minutes";
      response.success = true;
      return res.json(response);
    }
  }

  response = DaemonSocket.sendAction(params.serialKey, params.action);
  if (action == 0 || action == 2 && response.success) {
    response.message = "Site will be available in 2-3 Minutes";
  }
  if (!response.success && util.boxRestartOn.hasOwnProperty(params.storeId)) {
    delete util.boxRestartOn[params.storeId];
  }
  res.json(response);
};

const reverseShh = async (req, res) => {
  var params = Object.assign({}, req.body, req.params, req.query);
  let response = { success: false, message: '' };

  try {
    let remoteAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (remoteAddress) {
      remoteAddress = remoteAddress.split(":")[0];
    }
    ReverseSSH.deleteKnownHost();

    let isHubAvailable = DaemonSocket.isHubAvailable(params.serialKey);
    if (!isHubAvailable) {
      response.message = 'Hub is not connected';
      return res.json(response);
    }

    let store = await Store.findOne({ serialNumber: params.serialKey });
    let sshConnStartTime, sshConnEndTime;

    if (!store) {
      response.message = 'Store not found';
      return res.json(response);
    }

    let ips = [];
    ips.push(store.publicIp);
    if (remoteAddress) {
      ips.push(remoteAddress);
    }
    let current = moment();
    let hasInfo =
      !util.isNull(store.sshConnStartTime) &&
      !util.isNull(store.sshConnEndTime) &&
      !util.isNull(store.sshPort);
    if (hasInfo) {
      sshConnStartTime = moment(store.sshConnStartTime);
      sshConnEndTime = moment(store.sshConnEndTime);
      sshConnEndTime.add(15, 'minutes');
    }

    //Check if connection is not expired, then renew if not expired and get the request for connection
    if (hasInfo && current.isBetween(sshConnStartTime, sshConnEndTime)) {
      await Store.updateOne(
        { serialNumber: params.serialKey },
        { $set: { sshConnEndTime: sshConnEndTime.toDate() } }
      );
      response.success = true;

      params.port = store.sshPort;
      params.action = 'StartSSH';
      params.sshLocalServerPort = store.sshLocalServerPort;
      ReverseSSH.portMapToLocal(params.port);
      response = DaemonSocket.send(params.serialKey, params);
      if (response.success) {
        response.message = `Your SSH time will be extended by 15 minutes\n Connect ssh over port ${store.sshPort} if you are disconnected`;
      }
    } else {
      params.port = await ReverseSSH.getSSHPort(store.id);
      params.action = 'StartSSH';
      params.sshLocalServerPort = store.sshLocalServerPort;

      ReverseSSH.openPort(params.port, ips);

      sshConnStartTime = moment();
      sshConnEndTime = moment(sshConnStartTime).add(60, 'minutes');

      //Update Connection time info in DB
      await Store.updateOne(
        { serialNumber: params.serialKey },
        {
          $set: {
            sshConnStartTime: sshConnStartTime,
            sshConnEndTime: sshConnEndTime,
            sshPort: params.port,
          },
        }
      );

      response = DaemonSocket.send(params.serialKey, params);
      if (response.success) {
        response.message = `Your request has been processed\n Connect ssh over port ${params.port}`;
      }
    }
  } catch (ex) {
    response.success = false;
    response.message = ex.message;
    logger.error(ex);
  }

  res.json(response);
};

const replaceSSHKey = async (req, res) => {
  try {
    let resp = ReverseSSH.createRSAKey();
    if (resp.success) {
      Object.keys(DaemonSocket.Client).forEach((key) => {
        try {
          let client = DaemonSocket.Client[key];
          client.emit('message', {
            action: 'UpdateSSHKey',
            privateKey: ReverseSSH.privateKey,
          });
        } catch (ex) {
          logger.error(ex);
        }
      });
    }
    res.json(resp);
  } catch (ex) {
    logger.error(ex);
    res.json({
      success: false,
      message: ex.message,
    });
  }
};
/**
 * Api for upload Logs.
 * @param {object} req
 * @param {object} res
 */
const uploadLogs = async (req, res) => {
  var params = Object.assign({}, req.body, req.params, req.query);
  let response = { success: false };
  try {
    if (util.isNull(params.storeId)) {
      response.message = 'Store id cannot be blank';
      return res.json(response);
    }
    let storeRecord = await Store.findById({ _id: params.storeId });
    if (storeRecord) {
      let clientAll = webSocket.clients.filter(
        (e) => e.type == 'onsite' && e.storeId == params.storeId
      );
      if (clientAll && clientAll.length > 0) {
        let options = {
          action: 'uploadLogs',
          data: {
            storeId: params.storeId,
          },
        };
        webSocket.Send(options);
        response.success = true;
        response.message =
          'Your request has been processed,\n It will take few minutes for Upload Logs';
      } else {
        response.message =
          'Hub is not connected, Your request could not be processed';
      }
    } else {
      response.message = 'Store not exists';
    }
  } catch (ex) {
    response.success = false;
    response.message = ex.message;
    logger.error(ex);
  }

  res.json(response);
};

const startVNC = async (req, res) => {
  var params = Object.assign({}, req.body, req.params, req.query);
  let response = { success: false, message: '' };

  try {
    let remoteAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (remoteAddress) {
      remoteAddress = remoteAddress.split(":")[0];
    }

    ReverseSSH.deleteKnownHost();

    let isHubAvailable = DaemonSocket.isHubAvailable(params.serialKey);
    if (!isHubAvailable) {
      response.message = 'Hub is not connected';
      return res.json(response);
    }

    let store = await Store.findOne({ serialNumber: params.serialKey });
    let vncConnStartTime, vncConnEndTime;

    if (!store) {
      response.message = 'Store not found';
      return res.json(response);
    }

    let ips = [];
    ips.push(store.publicIp);
    if (remoteAddress) {
      ips.push(remoteAddress);
    }

    let current = moment();
    let hasInfo =
      !util.isNull(store.vncConnStartTime) &&
      !util.isNull(store.vncConnEndTime) &&
      !util.isNull(store.vncPort);
    if (hasInfo) {
      vncConnStartTime = moment(store.vncConnStartTime);
      vncConnEndTime = moment(store.vncConnEndTime);
      vncConnEndTime.add(15, 'minutes');
    }

    //Check if connection is not expired, then renew if not expired and get the request for connection
    if (hasInfo && current.isBetween(vncConnStartTime, vncConnEndTime)) {
      await Store.updateOne(
        { serialNumber: params.serialKey },
        { $set: { vncConnEndTime: vncConnEndTime.toDate() } }
      );
      response.success = true;

      params.port = store.vncPort;
      params.action = 'StartVNC';
      params.vncLocalServerPort = store.vncLocalServerPort;

      ReverseSSH.portMapToLocal(params.port);

      response = DaemonSocket.send(params.serialKey, params);
      if (response.success) {
        response.message = `Your VNC Connection time will be extended by 15 minutes\n Connect vnc over port ${store.vncPort} if you are disconnected`;
      }
    } else {
      params.port = await ReverseSSH.getVNCPort(store.id);
      params.action = 'StartVNC';
      params.vncLocalServerPort = store.vncLocalServerPort;

      ReverseSSH.openPort(params.port, ips, "VNC");

      vncConnStartTime = moment();
      vncConnEndTime = moment(vncConnStartTime).add(60, 'minutes');

      //Update Connection time info in DB
      await Store.updateOne(
        { serialNumber: params.serialKey },
        {
          $set: {
            vncConnStartTime: vncConnStartTime,
            vncConnEndTime: vncConnEndTime,
            vncPort: params.port,
          },
        }
      );

      response = DaemonSocket.send(params.serialKey, params);
      if (response.success) {
        response.message = `Your request has been processed\n Connect vnc over port ${params.port}`;
      }
    }
  } catch (ex) {
    response.success = false;
    response.message = ex.message;
    logger.error(ex);
  }

  res.json(response);
};

const hasBoxRecentlyRestarted = async (req, res) => {
  let params = Object.assign({}, req.body, req.params, req.query);
  let isStarted = util.hasRecentlyRestarted(params.storeId, true);
  res.json({
    success: true,
    hasBoxRecentlyRestarted: isStarted,
    message: "Site will be available in 2-3 Minutes"
  });
}

module.exports = {
  getStores,
  getStore,
  getStoreListByUser,
  storeConnect,
  getStoreId,
  lastInvoiceId,
  moniterCpuData,
  moniterMemoryData,
  getSmartDeviceTemperature,
  getStoreCameras,
  restartOss,
  daemon,
  reverseShh,
  replaceSSHKey,
  uploadLogs,
  startVNC,
  hasBoxRecentlyRestarted
};
