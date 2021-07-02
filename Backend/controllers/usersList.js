const restHandler = require('./restHandler')();
restHandler.setModelId('user', ['email'], 'Email already exists');
const util = require('../util/util');
const dashboard = require('./dashboard');
const common = require('./common');
const Role = require('../modals/role');
/**
 * function to handle GET request to receive all the locations
 * @param {object} req
 * @param {object} res
 */
function getUsers(req, res) {
  if (req.session && req.session.user && req.session.user._id) {
    if (req.body.filters) {
      common.getListData(
        req,
        res,
        restHandler,
        dashboard,
        util,
        'storeId',
        true
      );
    }
  } else {
    switch (req.body.action) {
      case 'export':
        restHandler.getExportRecord(req, res);
        break;
      default:
        restHandler.getResources(req, res);
        break;
    }
  }
}

async function getUser(req, res) {
  if (
    (req.body.action == 'save'||req.body.action=='update') &&
    (req.body.isAdmin == 'true' || req.body.isInstaller == 'true')
  ) {
    if (req.body.isAdmin == 'true') {
      let roleData = await Role.find({
        clientId: null,
        isAdminRole: true,
        isSystemRole: true,
        roleStatus: 0,
      }).sort({ createdAt: -1 });
      let data = JSON.parse(req.body.data);
      data.roleId = roleData[0]._id;
      req.body.data = JSON.stringify(data);
    }

    // if (req.body.isInstaller == 'true') {
    //   let roleData = await Role.find({
    //     clientId: null,
    //     isInstallerRole: true,
    //     isSystemRole: true,
    //     roleStatus: 0,
    //   }).sort({ createdAt: -1 });
    //   let data = JSON.parse(req.body.data);
    //   data.roleId = roleData[0]._id;
    //   req.body.data = JSON.stringify(data);
    // }
  }
  common.getData(req, res, restHandler);
}

module.exports = { getUsers, getUser };
