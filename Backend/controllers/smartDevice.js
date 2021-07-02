const restHandler = require('./restHandler')();
restHandler.setModelId(
  'smartDevice',
  ['name'],
  'SmartDevice name already exists'
);
const common = require('./common');
const SmartDevice = require('../modals/smartDevice');
const SiteSmartDevice = require('../modals/siteSmartDevices');
const _ = require('lodash');
const Client = require('../modals/client');
const { findByIdAndUpdate } = require('../modals/client');

/**
 * function to handle GET & POST request to receive all the smartDevices
 * @param {object} req
 * @param {object} res
 */

function getSmartDevices(req, res) {
  switch (req.body.action) {
    case 'export':
      restHandler.getExportRecord(req, res);
      break;
    case 'find':
      getAllSmartDevices(req, res);
      break;
    case 'type':
      let deviceType = req.body.deviceType;
      if (deviceType == 'Camera') {
        req.body.sortDir = "DESC",
          req.body.sort = "nativeConnectivity"
      }
      let defaultFilter = [
        {
          $and: [{ smartDeviceType: deviceType }, { smartDeviceStatus: 0 }],
        },
      ];
      restHandler.getResources(req, res, null, false, defaultFilter);
      break;
    default:
      restHandler.getResources(req, res);
      break;
  }
}

/**
 * function to handle GET & POST request to create the smartDevice
 * @param {object} req
 * @param {object} res
 */
async function getSmartDevice(req, res) {
  switch (req.body.action) {
    case 'load':
      restHandler.getResource(req, res);
      break;
    case 'update':
      // if (req.files && req.files.length > 0) {
      //   var data = JSON.parse(req.body.data);
      //   var logo = data.logo;
      //   req.files.forEach((element) => {
      //     logo = element.filename;
      //   });
      //   req.body.data = JSON.stringify(Object.assign({}, data, { logo: logo }));
      // }
      // restHandler.updateResource(req, res);
      const { id } = req.params;
      const data1 = JSON.parse(req.body.data)
      let result1 = await SmartDevice.findById(id);
      if (result1) {
        let query = {
          _id: { $ne: result1._id },
          name: data1.name
        }
        const duplicate = await SmartDevice.findOne(query);
        if (duplicate) {
          return res.json({
            success: false,
            errmsg: 'SmartDevice name already exists',
          });
        } else {
          const data = await SmartDevice.findByIdAndUpdate(id, data1, { new: true });
          return res.json({
            message: 'Record updated successfully.',
            data,
            success: true,
          });
        }
      }
      break;
    case 'save':
      if (req.files && req.files.length > 0) {
        var data = JSON.parse(req.body.data);
        var logo = data.logo;
        req.files.forEach((element) => {
          logo = element.filename;
        });
        req.body.data = JSON.stringify(Object.assign({}, data, { logo: logo }));
      }
      beforeSave(req, res, () => {
        restHandler.insertResource(req, res);
      });
      break;
    case 'delete':
      restHandler.deleteResource(req, res);
      break;
    case 'getById':
      getSmartDeviceById(req, res);
      break;
    default:
      restHandler.getResource(req, res);
      break;
  }
}

/**
 * function to handle DELETE request to delete the SmartDevice
 * @param {object} req
 * @param {object} res
 */
async function deleteSmartDeviceById(req, res) {
  try {
    const { id } = req.params;
    let query = {
      device: id,
    };
    let query2 = {
      smartDevicesAllowed: {
        $in: [id],
      },
    };
    const siteSMartDeviceResult = await SiteSmartDevice.find(query);
    const clientResult = await Client.find(query2);
    if (siteSMartDeviceResult.length > 0 || clientResult.length > 0) {
      let msg = [],
        associatedResult = [],
        client,
        siteSmartDevice;
      if (siteSMartDeviceResult.length > 0) {
        siteSmartDevice = siteSMartDeviceResult.map((ele) => {
          return ele.name;
        });
        let deviceList = siteSmartDevice.slice(0, 5);
        deviceList = deviceList.join(', ');
        if (siteSmartDevice.length > 5) {
          let deviceCount = siteSmartDevice.length;
          deviceCount = deviceCount - 5;
          associatedResult = [
            ...associatedResult,
            ` 
  
            Associated Sites : ${deviceList}..${deviceCount} more Sites associated`,
          ];
        } else {
          associatedResult = [
            ...associatedResult,
            ` 
  
            Associated Sites : ${deviceList}`,
          ];
        }
        msg = [...msg, 'SiteSmartDevices'];
      }
      if (clientResult.length > 0) {
        client = clientResult.map((ele) => {
          return ele.name;
        });
        let clientList = client.slice(0, 5);
        clientList = clientList.join(', ');
        if (client.length > 5) {
          let clientCount = client.length;
          clientCount = clientCount - 5;
          associatedResult = [
            ...associatedResult,
            ` 
  
            Associated Clients : ${clientList}..${clientCount} more Clients associated`,
          ];
        } else {
          associatedResult = [
            ...associatedResult,
            ` 
  
            Associated Clients : ${clientList}`,
          ];
        }
        msg = [...msg, ' Clients'];
      }

      return res.send({
        error: true,
        message: `SmartDevice is associated with some ${msg}. Please disassociate before you delete it. 
        ${associatedResult}`,
      });
    } else {
      SmartDevice.findById(id, (err, result) => {
        if (err) {
          res.send({ error: true, errmsg: err });
        }
        result.smartDeviceStatus = 1;
        result.save((err, data) => {
          if (err) {
            res.send({ error: true, errmsg: err });
          }
          return res.send({
            error: false,
            msg: 'SmartDevice deleted Success',
          });
        });
      });
    }
  } catch (err) {
    return res.send({
      error: true,
      errmsg: err.message,
    });
  }
}

/**
 * function to handle GET request to get the List of SmartDeviceTypes
 * @param {object} req
 * @param {object} res
 */
async function getSmartDeviceTypes(req, res) {
  try {
    let smartDeviceTypeList = [];
    let result = [
      'Access Control',
      'Camera',
      'Door Sensor',
      'POS',
      'Recording Devices',
      'Scale',
      'Security',
      'Temperature',
      'Alarm'
    ];
    // const smartDeviceResult = await SmartDevice.find().sort({
    //   smartDeviceType: 1,
    // });
    // if (smartDeviceResult.length > 0) {
    //   smartDeviceResult.forEach((ele) => {
    //     smartDeviceTypeList.push(ele.smartDeviceType);
    //   });
    //   result = _.uniq(smartDeviceTypeList);
    return res.send({
      error: false,
      data: result,
    });
    // } else {
    //   return res.send({
    //     error: true,
    //     errmsg: 'No Records Found',
    //   });
    // }
  } catch (err) {
    return res.send({
      error: true,
      errmsg: err.message,
    });
  }
}

/**
 * function to handle GET request to get the List of SmartDeviceTypes
 * @param {object} req
 * @param {object} res
 */
async function getSmartDeviceById(req, res) {
  try {
    const { id } = req.params;
    let query = {
      _id: id,
      smartDeviceStatus: 0,
    };
    const smartDeviceResult = await SmartDevice.findOne(query);
    if (smartDeviceResult) {
      return res.send(smartDeviceResult);
    } else {
      return res.send({
        error: true,
        errmsg: 'No Record Found',
      });
    }
  } catch (err) {
    return res.send({
      error: true,
      errmsg: err.message,
    });
  }
}
/**
 * function to handle GET request to get All Active Industries without pagination
 * @param {object} req
 * @param {object} res
 */
async function getAllSmartDevices(req, res) {
  try {
    const smartDeviceResult = await SmartDevice.find({
      smartDeviceStatus: 0,
    });
    if (smartDeviceResult.length > 0) {
      return res.send({
        error: false,
        success: true,
        data: smartDeviceResult,
        total: smartDeviceResult.length,
      });
    } else {
      return res.send({
        error: true,
        errmsg: 'No Records Found',
      });
    }
  } catch (err) {
    return res.send({
      error: true,
      errmsg: err.message,
    });
  }
}
//helper function
let beforeSave = (req, res, cb) => {
  const data = JSON.parse(req.body.data);
  SmartDevice.find(
    { name: data.name, smartDeviceStatus: 0 },
    async (err, data) => {
      if (err) {
        return res.send({
          success: false,
          errmsg: err.message,
        });
      }
      if (data.length > 0) {
        return res.send({
          success: false,
          errmsg: 'SmartDevice name already exists',
        });
      } else {
        cb();
      }
    }
  );
};
let beforeUpdate = async (req, res, cb) => {
  const { id } = req.params;
  let result = await SmartDevice.findById(id)
  if (result) {
    const duplicate = await SmartDevice.findOne({ _id: { $ne: result._id } })
  }
}

module.exports = {
  getSmartDevice,
  getSmartDevices,
  deleteSmartDeviceById,
  getSmartDeviceTypes,
};
