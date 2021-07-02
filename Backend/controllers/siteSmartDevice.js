const restHandler = require('./restHandler')();

restHandler.setModelId('siteSmartDevices');
const common = require('./common');
const siteSmartDevice = require('../modals/siteSmartDevices');
const Store = require('../modals/store');
const StoreNotification = require('../modals/storeNotification');
const connectionTypes = ['Telnet', 'SSH', 'TCP IP'];
const Camera = require('../modals/camera');
const SiteSmartDevices = require('../modals/siteSmartDevices');

/**
 * function to handle POST & GET request to create the siteSmartDevice
 * @param {object} req
 * @param {object} res
 */
async function createSiteSmartDevice(req, res) {
  try {
    await createDeviceType(req, res);
  } catch (err) {
    return res.send({
      error: true,
      errmsg: err.message,
    });
  }
}

/**
 * function to handle POST request to receive the smartDevice based on siteSmartDeviceID
 * @param {object} req
 * @param {object} res
 */
async function getSiteSmartDevices(req, res) {
  try {
    let defaultFilter = [];
    let data = JSON.parse(req.body.data);
    const { storeId, clientId } = data;
    // data.populate = [
    //   { path: 'clientId' },
    //   { path: 'device' },

    //   {
    //     path: 'storeId',
    //     populate: 'storeNotificationId',
    //   },
    // ];
    if (storeId && clientId) {
      defaultFilter.push({
        $and: [{ storeId: data.storeId }, { clientId: data.clientId }],
      });
    }
    // req.body = JSON.stringify(data);
    // console.log(defaultFilter, 'defaultFilter');
    // switch (req.body.action) {
    //   case 'export':
    //     restHandler.getExportRecord(req, res, null, false, defaultFilter);
    //     break;
    //   default:
    //     restHandler.getResources(req, res, null, false, defaultFilter);
    //     break;
    // }

    const siteSmartDeviceResult = await siteSmartDevice
      .find({ storeId: storeId, clientId: clientId })
      .populate('device')
      .populate('clientId')
      .populate([
        {
          path: 'storeId',
          populate: 'storeNotificationId',
        },
      ]);
    if (siteSmartDeviceResult.length > 0) {
      return res.send({ error: false, data: siteSmartDeviceResult });
    } else {
      return res.send({ error: true, errmsg: 'No Device found for this site' });
    }
  } catch (err) {
    return res.send({ error: false, errmsg: err.message });
  }
}

/**
 * function to handle POST request to receive the smartDevice based on siteSmartDeviceID
 * @param {object} req
 * @param {object} res
 */
async function getSiteSmartDevice(req, res) {
  try {
    const { id } = req.params;
    const deviceData = await siteSmartDevice.findById(id);
    console.log('device data',deviceData);
    const isSera = deviceData.sera4DeviceID !== undefined ? true : false //deviceData.hasOwnProperty('sera4DeviceID');
    console.log('isSera--->',deviceData.sera4DeviceID ,' ',isSera)
    const siteSmartDeviceResult = await siteSmartDevice
      .findById(id)
      .populate('device')
      .populate([
        {
          path: 'storeId',
          populate: 'storeNotificationId',
        },
      ])
      .populate('clientId').populate([{
        "path": "day.timeSlot.emailNotificationUsers",
        "select": {
          "_id": 1,
          "email": 1,
          "firstName": 1
        }
      },
      {
        "path": "day.timeSlot.smsNotificationUsers",
        "select": {
          "_id": 1,
          "mobile": 1,
          "firstName": 1
        }
      },
      {
        "path": isSera ? "seraEvent.emailNotificationUsers" : "kicEvent.emailNotificationUsers",
        "select": {
          "_id": 1,
          "mobile": 1,
          "firstName": 1
        }
      },
      {
        "path": isSera ? "seraEvent.smsNotificationUsers" : "kicEvent.smsNotificationUsers",
        "select": {
          "_id": 1,
          "mobile": 1,
          "firstName": 1
        }
      }
    ]);

    return res.send({ error: false, data: siteSmartDeviceResult });
  } catch (err) {
    return res.send({ error: false, errmsg: err.message });
  }
}

/**
 * function to handle POST request to Update the siteSmartDevice based on siteSmartDeviceID
 * @param {object} req
 * @param {object} res
 */
async function updateSiteSmartDevice(req, res) {
  try {
    await updateDeviceType(req, res);
  } catch (err) {
    return res.send({
      error: true,
      errmsg: err.message,
    });
  }
}

/**
 * function to handle POST request to Delete the siteSmartDevice based on siteSmartDeviceID
 * @param {object} req
 * @param {object} res
 */
async function deLinkSiteSmartDevice(req, res) {
  try {
    const { siteSmartDeviceID } = req.params;
    const result = await siteSmartDevice.findById(siteSmartDeviceID);
    if (result == null) {
      return res.send({
        error: true,
        errmsg: 'SmartDevice Already Delinked with Site',
      });
    } else {
      result.siteSmartDeviceStatus = 1;
      result.save((err, data) => {
        if (err) {
          res.send({ error: true, errmsg: err });
        }
        return res.send({
          error: false,
          msg: 'The Device has been Delinked successfully',
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
 * function to handle POST request to Delete the siteSmartDevice based on siteSmartDeviceID
 * @param {object} req
 * @param {object} res
 */

 async function delinkSeraDevice(req,res){
  try{
    const { locationId } = req.params;
    const { storeId } = req.body;
    const result = await siteSmartDevice.find({ sera4LocationID: locationId, storeId: storeId});
    if(result == null){
      return res.send({
        error: true,
        errmsg: 'No Device Found',
      });
    } else {
      Promise.all(result.map(async (el, i)=> {
        const cameraResult = await Camera.findOne({
          siteSmartDevice: { $elemMatch: { deviceId: el._id } }
        });
        if (cameraResult && cameraResult != null) {
          let updatedCamera = await Camera.update({ _id: cameraResult._id }, { $pull: { "siteSmartDevices": { deviceId: el._id } } })

        }

        el.siteSmartDeviceStatus = 1;
        return siteSmartDevice.findByIdAndUpdate(
          el._id,
          el,
          { new: true }
        );
      })).then((delinkedSeraDevices)=>{
        console.log('dinkin--->',delinkedSeraDevices);
        return res.send({
          error: false,
          message: 'Location Delinked Successfully',
          data: delinkedSeraDevices
        });
      });
    }
  }catch(err){
    return res.send({
      error: true,
      errmsg: err.message,
    });
  }
}

/**
 * function to handle POST request to Delete the siteSmartDevice based on siteSmartDeviceID
 * @param {object} req
 * @param {object} res
 */
async function delinkKICDevice(req, res) {
  try {
    const { locationId } = req.params;
    const { storeId } = req.body;
    const result = await siteSmartDevice.find({ kicLocationID: locationId, storeId: storeId });
    if (result == null) {
      return res.send({
        error: true,
        errmsg: 'No Device Found',
      });
    } else {
      Promise.all(result.map(async (el, i) => {
        const cameraResult = await Camera.findOne({ siteSmartDevices: { $elemMatch: { deviceId: el._id } } });
        if (cameraResult && cameraResult != null) {
          let updatedCamera = await Camera.update({ _id: cameraResult._id }, { $pull: { "siteSmartDevices": { deviceId: el._id } } })

        }
        el.siteSmartDeviceStatus = 1;
        return siteSmartDevice.findByIdAndUpdate(
          el._id,
          el,
          { new: true }
        );

      })).then((delinkedKICDevices) => {
        return res.send({
          error: false,
          message: 'Location Delinked Successfully',
          data: delinkedKICDevices,
        });
      });

    }
  } catch (error) {
    return res.send({
      error: true,
      errmsg: err.message,
    });
  }
} 

/**
 * function to handle POST request to create the new siteSmartDevicetype based on storeId
 * @param {object} req
 * @param {object} res
 */
async function createDeviceType(req, res) {
  try {
    const data = JSON.parse(req.body.data);
    const { storeId } = req.params;

    switch (req.body.action) {
      case 'scale':
        if (!data.clientId || data.clientId == null) {
          throw new Error({ message: 'ClientId is requied' });
        } else {
          const storeResult = await Store.findOne({
            _id: storeId,
            clientId: data.clientId,
          }).populate('storeNotificationId');

          if (storeResult) {
            data.storeId = storeId;
            data.day = storeResult.storeNotificationId
              ? storeResult.storeNotificationId.day
              : [];
            data.deviceNotificationSettings = [true];
            data.siteSmartDeviceStatus = 0;
            const siteSmartDeviceResult = await siteSmartDevice.create(data);
            if (siteSmartDeviceResult) {
              return res.send({
                error: false,
                message: 'Record Inserted Successfully',
                data: siteSmartDeviceResult,
              });
            }
          } else {
            return res.send({
              error: true,
              errmsg: 'StoreId Not found',
            });
          }
        }
        break;
      case 'KIC':

        if (data.length > 0) {
          let query = { kicLocationID: data[0].kicLocationID, storeId: { $ne: storeId } }
          let linkedSites = await SiteSmartDevices.find(query).populate('storeId');
          if (linkedSites.length && req.body.checked == "False") {
            return res.send({
              error: true,
              errmsg: `The selected Location is already linked with some other site(s).
              `,
            });
          }
          let newData = await Promise.all(data.map(async (el, i) => {
            // if (el.deviceNotificationSettings[0] == true) {
            //   const storeResult1 = await Store.findOne({
            //     _id: storeId,
            //     clientId: el.clientId,
            //   }).populate('storeNotificationId');

            //   if (storeResult1) {
            //     el.storeId = storeId;
            //     el.day = storeResult1.storeNotificationId
            //       ? storeResult1.storeNotificationId.day
            //       : [];
            //     el.siteSmartDeviceStatus = 0;
            //     return el

            //   } else {
            //     return res.send({
            //       error: true,
            //       errmsg: 'StoreId Not found',
            //     });
            //   }
            // } else {
            el.storeId = storeId;
            el.siteSmartDeviceStatus = 0;
            return el
            // }
          }))
          let siteSmartDeviceResult = await siteSmartDevice.create(newData)
          if (siteSmartDeviceResult) {
            return res.send({
              error: false,
              message: 'Record Inserted Successfully',
              data: siteSmartDeviceResult,
            });
          }
        }
        case "Sera4": 
        if(data.length > 0){
          console.log('SERA------>',data);
          let query = { sera4LocationID: data[0].sera4LocationID, storeId: { $ne: storeId }}
          let linkedSites = await SiteSmartDevices.find(query).populate('storeId');
          if(linkedSites.length && req.body.checked == "False"){
            return res.send({
              error: true,
              errmsg: `The selected Location is already linked with some other site(s).`,
            });
          }
          let newData = await Promise.all(data.map(async (el, i)=>{
            el.sera4Name = el.name;
            el.sera4DeviceID = el.id;
            el.sera4Open = el.open;
            el.sera4LastUpdated = el.last_reported_at;
            el.sera4LocationID = el.sera4LocationID;
            el.storeId = storeId;
            el.siteSmartDeviceStatus = 0;
            return el;
          }))
          let siteSmartDeviceResult = await siteSmartDevice.create(newData);
          if(siteSmartDeviceResult){
            console.log('Saved data----->',siteSmartDeviceResult);
            return res.send({
              error: false,
              message: 'Record Inserted Successfully',
              data: siteSmartDeviceResult
            })
          }
        }
        break;
      default:
        if ((!data.clientId && !data.device) || !data.clientId == null) {
          return res.send({
            error: true,
            errmsg: 'ClientId and smartDeviceId are Required',
          });
        } else {
          if (data.day.length >= 1) {
            data.storeId = storeId;
            data.siteSmartDeviceStatus = 0;

            const siteSmartDeviceResult = await siteSmartDevice.create(data);
            if (siteSmartDeviceResult) {
              return res.send({
                error: false,
                message: 'Record Inserted Successfully',
                data: siteSmartDeviceResult,
              });
            }
          } else {
            data.storeId = storeId;
            data.siteSmartDeviceStatus = 0;

            const result = await siteSmartDevice.create(data);
            if (result) {
              return res.send({
                error: false,
                message: 'Record Inserted Successfully',
                data: result,
              });
            }
          }
        }
        break;
    }
  } catch (err) {
    logger.error(err);
    return res.send({
      error: true,
      errmsg: err.message,
    });
  }
}

/**
 * function to handle POST request to create the new siteSmartDevicetype based on storeId
 * @param {object} req
 * @param {object} res
 */
async function updateDeviceType(req, res) {
  try {
    const { siteSmartDeviceID } = req.params;
    const data = JSON.parse(req.body.data);
    switch (req.body.action) {
      case 'scale':
        const getScaleSiteData = await siteSmartDevice.findById(
          siteSmartDeviceID
        );

        data.day = getScaleSiteData.day.length > 0 ? getScaleSiteData.day : [];
        data.deviceNotificationSettings = [true];

        const updatedScaleSiteResult = await siteSmartDevice.findByIdAndUpdate(
          siteSmartDeviceID,
          data,
          { new: true }
        );
        res.send({
          error: false,
          message: 'Updated Successfully',
          data: updatedScaleSiteResult,
        });
        break;
      case 'KICOld':
        if (data.length > 0) {
          Promise.all(data.map(async (el, i) => {

            if (el.deviceNotificationSettings[0] == true) {
              const storeResult1 = await Store.findOne({
                _id: el.storeId,
                clientId: el.clientId,
              }).populate('storeNotificationId');

              if (storeResult1) {
                // el.storeId = storeId;
                el.day = storeResult1.storeNotificationId
                  ? storeResult1.storeNotificationId.day
                  : [];
                el.siteSmartDeviceStatus = 0;
                return siteSmartDevice.findByIdAndUpdate(
                  el._id,
                  el,
                  { new: true }
                );

              } else {
                return res.send({
                  error: true,
                  errmsg: 'StoreId Not found',
                });
              }
            } else {

              return siteSmartDevice.findByIdAndUpdate(
                el._id,
                el,
                { new: true }
              );

            }
          })).then(documents => {
            return res.send({
              error: false,
              message: 'Record Updated Successfully',
              data: documents,
            });
          });

        }
        break;
      case 'KIC':
        if (data.length > 0) {
          Promise.all(data.map(async (el, i) => {
            console.log('test');


            el.siteSmartDeviceStatus = 0;
            return siteSmartDevice.findByIdAndUpdate(
              el._id,
              el,
              { new: true }
            );
          })).then(documents => {
            return res.send({
              error: false,
              message: 'Record Updated Successfully',
              data: documents,
            });
          });
        }
        break;
        case 'SERA':
          if (data.length > 0) {
            Promise.all(data.map(async (el, i) => {
              console.log('testSERA',el);
  
  
              el.siteSmartDeviceStatus = 0;
              return siteSmartDevice.findByIdAndUpdate(
                el._id,
                el,
                { new: true }
              );
            })).then(documents => {
              console.log('saved data',documents[0].seraEvent)
              return res.send({
                error: false,
                message: 'Record Updated Successfully',
                data: documents,
              });
            });
  
          }
          break;
      default:
        const updatedSiteResult = await siteSmartDevice.findByIdAndUpdate(
          siteSmartDeviceID,
          data,
          { new: true }
        );
        res.send({
          error: false,
          message: 'Updated Successfully',
          data: updatedSiteResult,
        });

        break;
    }
  } catch (err) {
    return res.send({
      error: true,
      errmsg: err.message,
    });
  }
}


/**
 * function to handle POST & GET request to create the SiteSmartDevice based on ID's
 * @param {object} req
 * @param {object} res
 */
function findSiteSmartDevice(req, res) {
  switch (req.body.action) {
    case 'load':
      restHandler.getResource(req, res);
      break;
    case 'update':
      if (req.files && req.files.length > 0) {
        var data = JSON.parse(req.body.data);
        var logo = data.logo;
        req.files.forEach((element) => {
          logo = element.filename;
        });
        req.body.data = JSON.stringify(Object.assign({}, data, { logo: logo }));
      }
      restHandler.updateResource(req, res);
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

    default:
      restHandler.getResource(req, res);
      break;
  }
}



function findSiteSmartDevices(req, res) {
  let defaultFilter = [];
  let data = JSON.parse(req.body.data);
  const { storeId, clientId } = data;
  if (storeId && clientId) {
    defaultFilter.push({
      $and: [{ storeId: data.storeId }, { clientId: data.clientId }],
    });
  }
  // req.body.populate = JSON.stringify(data.populate);
  switch (req.body.action) {
    case 'export':
      restHandler.getExportRecord(req, res, null, false, defaultFilter);
      break;
    default:
      restHandler.getResources(req, res, null, false, defaultFilter);
      break;
  }

}
/**
 * function to handle  request to get the SiteSmartDevice linked with any location 
 * @param {object} req
 * @param {object} res
 */
async function getLinkedSiteSmartDevices(req, res) {
  let defaultFilter = [];
  let data = JSON.parse(req.body.data);
  const { storeId, clientId, isSera4 } = data;

  if (storeId && clientId) {
    defaultFilter.push({
      $and: [{ storeId: data.storeId }, { clientId: data.clientId }, { siteSmartDeviceStatus: 0 }, isSera4 ? { sera4LocationID: { $exists: true, $ne: '' } } : { kicLocationID: { $exists: true, $ne: '' } }]
    });
  }
  restHandler.getResources(req, res, onActionComplete, false, defaultFilter);

}
const onActionComplete = async (siteSmartDeviceResult, res) => {

  if (siteSmartDeviceResult) {
    let linkedSites = []
    if (siteSmartDeviceResult.data.length > 0) {
      let linkedLocations = siteSmartDeviceResult.data.map(el => {
        if (el.kicLocationID && el.kicLocationID != '') {
          linkedSites.push(el)
        }else if(el.sera4LocationID && el.sera4LocationID != ''){
          linkedSites.push(el)
        }
      });
      if (linkedSites.length > 0) {

        res.send({ error: false, linked: true, pages: siteSmartDeviceResult.pages, total: siteSmartDeviceResult.total, locationId: linkedSites[0].kicLocationID ? `${linkedSites[0].kicLocationID}` : `${linkedSites[0].sera4LocationID}`, data: linkedSites });

      } else {
        res.send({ error: true, linked: false, errmsg: 'No Location Linked with this site' });
      }
    } else {
      res.send({ error: true, linked: false, errmsg: 'No Location Linked with this site' });

    }
  } else {
    res.send({ error: true, linked: false, errmsg: 'No Location Linked with this site' });
  }
}
module.exports = {
  createSiteSmartDevice,
  getSiteSmartDevices,
  getLinkedSiteSmartDevices,
  getSiteSmartDevice,
  updateSiteSmartDevice,
  deLinkSiteSmartDevice,
  findSiteSmartDevices,
  findSiteSmartDevice,
  delinkKICDevice,
  delinkSeraDevice
};
