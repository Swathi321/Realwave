const restHandler = require('./restHandler')();
restHandler.setModelId('storeNotifications');

const StoreNotification = require('../modals/storeNotification');
const Store = require('../modals/store');

/**
 * function to handle  request to Get  the Scale Notification Rules Based on StoreId
 * @param {object} req
 * @param {object} res
 */

async function getStoreNotificationRules(req, res) {
  try {
    const { storeId } = req.params;
    const scaleNotificationResult = await StoreNotification.find({
      storeId: storeId,
    }).populate([
      {
        path: 'scale.emailNotificationUsers',
        select: {
          _id: 1,
          email: 1,
          firstName: 1,
        },
      },
      {
        path: 'scale.smsNotificationUsers',
        select: {
          _id: 1,
          mobile: 1,
          firstName: 1,
        },
      },
      {
        path: 'scale.bookMarkTypeId',
        select: { bookmarkColor: 1 }
      }
    ]);
    if (scaleNotificationResult) {

      return res.send({
        error: false,
        data: scaleNotificationResult,
      });
    }
  } catch (error) {
    return res.send({
      error: true,
      errmsg: error.message,
    });
  }
}

function updateStoreNotificationRules(req, res) {
  try {
    restHandler.updateResource(req, res);
  } catch (error) {
    return res.send({
      error: true,
      errmsg: err.message,
    });
  }
}

function updateSiteAlarmDevice(req, res) {
  try {
    restHandler.updateResource(req, res);
  } catch (error) {
    return res.send({
      error: true,
      errmsg: err.message,
    });
  }
}

// function updateKicEventRules(req, res) {
//   try {
//     restHandler.updateResource(req, res);
//   } catch (error) {
//     return res.send({
//       error: true,
//       errmsg: err.message,
//     });
//   }
// }
module.exports = {
  getStoreNotificationRules,
  updateStoreNotificationRules,
  updateSiteAlarmDevice,
};
