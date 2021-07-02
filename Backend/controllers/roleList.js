const restHandler = require('./restHandler')();
restHandler.setModelId('role', ['name', 'clientId'], 'Role name already exists');
const Role = require('../modals/role');
const User = require('../modals/user');
const common = require('./common');

/**
 * function to handle POST & GET request to receive all the Roles
 * @param {object} req
 * @param {object} res
 */
function getRoles(req, res) {
  switch (req.body.action) {
    case 'export':
      let defaultFilt = [
        {
          $and: [{ clientId: null }, { roleStatus: 0 }],
        },
      ];
      restHandler.getExportRecord(req, res, null, false, defaultFilt);
      break;
    case 'search':
      restHandler.getResources(req, res);
      break;
    default:
      let defaultFilter = [
        {
          $and: [{ clientId: null }, { roleStatus: 0 }],
        },
      ];
      restHandler.getResources(req, res, null, false, defaultFilter);
      break;
  }
}

/**
 * function to handle POST & GET request to create a Role
 * @param {object} req
 * @param {object} res
 */
function getRole(req, res) {
  common.getData(req, res, restHandler);
}

/**
 * function to handle POST request to delete a Role
 * @param {object} req
 * @param {object} res
 */
async function deleteRole(req, res) {
  try {
    const { id } = req.params;
    const query = {
      roleId: id,
    };
    const roleResult = await Role.findById(id);
    const userResult = await User.find(query);
    if (
      roleResult.isSystemRole ||
      roleResult.isAdminRole ||
      roleResult.isClientAdminRole ||
      roleResult.isInstallerRole
    ) {
      return res.send({
        error: true,
        errmsg: 'You are Unauthorized to Delete this  System Role',
      });
    }
    if (roleResult == null) {
      res.send({
        error: true,
        errmsg: 'Role is Already Deleted',
      });
    }
    if (userResult.length > 0) {
      let user = userResult.map((el) => {
        return el.firstName;
      });
      let userList = user.slice(0, 5);
      userList = userList.join(', ');
      if (user.length > 5) {
        let userCount = user.length;
        userCount = userCount - 5;
        associatedResult = [
          ...associatedResult,

          ` 

          Associated Users : ${userList}..${userCount} more Users associated`,
        ];
      } else {
        associatedResult = [
          ...associatedResult,
          ` 

          Associated Users : ${userList}`,
        ];
      }
      res.send({
        error: true,
        errmsg: `Oops! The Roles seems to be associated with some Account. Please disassociate it before you delete it.
       ${userAccounts} `,
      });
    } else {
      roleResult.roleStatus = 1;
      roleResult.save((err, data) => {
        if (err) {
          res.send({ error: true, errmsg: err });
        }
        return res.send({
          error: false,
          msg: 'Role Deleted Success',
        });
      });
    }
  } catch (err) {
    res.send({
      error: true,
      errmsg: err.message,
    });
  }
}

/**
 * function to handle POST request to get Roles based on clientID & isAdminRole true
 * @param {object} req
 * @param {object} res
 */
async function getAdminRoles(req, res) {
  const { isAdminRole, clientId } = req.body;
  let query = {
    isAdminRole: isAdminRole,
  };
  if (clientId) {
    query = {
      isAdminRole: isAdminRole,
      clientId: clientId,
    };
  }
  const result = await Role.find(query);
  if (result.length > 0) {
    res.send({
      error: false,
      data: result,
      count: result.length,
    });
  } else {
    res.send({
      error: true,
      errmsg: 'No Roles Found',
    });
  }
}

/**
 * function to handle POST request to get Global Roles
 * @param {object} req
 * @param {object} res
 */

async function getGlobalRoles(req, res) {
  try {
    const pageSize = parseInt(req.body.pageSize);
    const page = parseInt(req.body.page);
    let query = {
      $and: [
        { clientId: null },
        {
          $or: [
            { isAdminRole: true },
            { isClientAdminRole: true },
            { isInstallerRole: true },
            { isSystemRole: true },
          ],
        },
      ],
    };
    const result = await Role.find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    const count = await Role.find(query).countDocuments();
    return res.send({
      error: false,
      data: result,
      pages: Math.ceil(count / pageSize),
      success: true,
      total: count,
    });
  } catch (err) {
    return res.send({
      error: true,
      errmsg: err.message,
    });
  }
}
module.exports = {
  getRoles,
  getRole,
  deleteRole,
  getAdminRoles,
  getGlobalRoles,
};
