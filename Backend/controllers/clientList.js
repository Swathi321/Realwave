const restHandler = require('./restHandler')();
restHandler.setModelId('client', ['name', 'url'], 'Client name already exists');
const { Promise } = require('mongoose');
const {
  LogContext,
} = require('twilio/lib/rest/serverless/v1/service/environment/log');
const client = require('../modals/client');
const Role = require('../modals/role');
const User = require('../modals/user');
const Widget = require('../modals/widget');
const Report = require('../modals/report');
const Client = require('../modals/client');
const _ = require('lodash');
const BookmarkType = require('../modals/bookmarkType');
const StoreNotificationModel = require('../modals/storeNotification');
const BookmarkTypeModel = require('../modals/bookmarkType');
const CameraTagModel = require('../modals/cameraTag');
const Camera = require('../modals/camera');
const Store = require('../modals/store');

String.prototype.toObjectId = function () {
  var ObjectId = require('mongoose').Types.ObjectId;
  return ObjectId(this.toString());
};

/**
 * function to handle GET & POST request to receive all the Clients
 * @param {object} req
 * @param {object} res
 */
async function getClients(req, res) {
  switch (req.body.action) {
    case 'export':
      restHandler.getExportRecord(req, res);
      break;
    case 'get':
      let defaultFilter1 = [];
      let userResult1 = await User.findById(req.session.user._id)
        .populate('clientId')
        .populate('roleId');
      if (userResult1.clientId) {
        if (
          userResult1.clientId.clientType == 'installer' ||
          userResult1.roleId.isInstallerRole
        ) {
          defaultFilter1.push({
            $or: [
              { _id: userResult1.clientId },
              { installerId: userResult1.clientId },
            ],
          });
        } else {
          defaultFilter1.push({
            $or: [{ _id: userResult1.clientId }],
          });
        }
      }

      let modelFind = {};
      if(req.body.activeClient=="true"){
       modelFind['$and']=[]

        modelFind['$and'].push({status:'Active'})
      }
      if (defaultFilter1.length > 0) {
        if(modelFind && modelFind['$and'] && modelFind['$and'].length){
          modelFind['$and'].push(defaultFilter1[0])
        }else{
          modelFind = { $and: defaultFilter1 };

        }
      }

      const clientResult = await Client.find(modelFind).sort({ name: 1 }).collation({ locale: 'en' });
      res.send({
        error: false,
        data: clientResult,
        total: clientResult.length,
      });
      break;
    case 'installer':
      let query = [];
      let findData = {};
      if (req.body.installerId) {
        query.push({
          $or: [
            { _id: req.body.installerId },
            { installerId: req.body.installerId },
          ],
        });
      }
      if (query.length > 0) {
        findData = { $and: query };
      }
      const installerData = await Client.find(findData);
      if (installerData) {
        res.send({
          error: false,
          data: installerData,
          total: installerData.length,
        });
      }
      break;
    case 'clientType':
      let query1 = [];
      let findData1 = {};
      if (req.body.clientType) {
        query1.push({
          clientType: req.body.clientType

        });
      }
      if (query1.length > 0) {
        findData1 = { $and: query1 };
      }
      const data = await Client.find(findData1).sort({ name: 1 }).collation({ locale: 'en' });
      if (data) {
        res.send({
          error: false,
          data: data,
          total: data.length,
        });
      }
      break;
    default:
      let defaultFilter = [];
      let userResult = await User.findById(req.session.user._id)
        .populate('clientId')
        .populate('roleId');
      if (userResult.clientId) {
        if (
          userResult.clientId.clientType == 'installer' ||
          userResult.roleId.isInstallerRole
        ) {
          defaultFilter.push({
            $or: [
              { _id: userResult.clientId },
              { installerId: userResult.clientId },
            ],
          });
        } else {
          defaultFilter.push({
            $or: [{ _id: userResult.clientId }],
          });
        }
        // if (
        //   userResult.clientId.clientType == 'direct' ||
        //   userResult.clientId.clientType == 'thirdparty'
        // ) {
        //   defaultFilter.push({
        //     $or: [{ _id: userResult.clientId }],
        //   });
        // }
      }
      restHandler.getResources(req, res, null, false, defaultFilter);
      break;
  }
}

/**
 * function to handle GET & POST request to create a Client
 * @param {object} req
 * @param {object} res
 */
 async function getClient(req, res) {
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
      const clientData=await Client.findById(req.params.id,{name:1,clientType:1});
      if(JSON.parse(req.body.data).status=='Inactive'&&clientData){
        let associatedStores = await Store.find({clientId:req.params.id},{name:1,clientId:1});
        if(associatedStores.length){
          let store,
          associatedResult = []
          store=associatedStores.map(el=>{
            return el.name
          });
          let storeList = store.slice(0, 5);
          storeList=storeList.join(', ');

        if (store.length > 5) {
          let storeCount = store.length;
          storeCount = storeCount - 5;
          associatedResult = [
            ...associatedResult,
            ` Associated Sites : ${storeList}..${storeCount} more sites left`,
          ];
        } else {
          associatedResult = [
            ...associatedResult,
            ` Associated Sites : ${storeList} `,
          ];
        }

         return res.json({
            success: false,
            errmsg: `Sorry, you can not update the Client Status for ${clientData.name}. It is linked with Sites. 
            Please Unlink the Sites  before you make this update.
            
            ${associatedResult}`,
          });
        }

      }
   
      if(req.body.installerChange=="true"&&clientData){

        const associatedClients=await Client.find({installerId:req.params.id},{name:1,clientType:1});

        if(clientData&&associatedClients.length){
          let client,
          associatedResult = []
          client=associatedClients.map(el=>{
            return el.name
          });
          let clientList = client.slice(0, 5);
          clientList=clientList.join(', ');

        if (client.length > 5) {
          let clientCount = client.length;
          clientCount = clientCount - 5;
          associatedResult = [
            ...associatedResult,
            ` Associated Third Party Client(s) : ${clientList}..${clientCount} more third partyclients left`,
          ];
        } else {
          associatedResult = [
            ...associatedResult,
            ` Associated Third Party Client(s) : ${clientList} `,
          ];
        }

         return res.json({
            success: false,
            errmsg: `Sorry, you can not update the Client type for ${clientData.name}. It is associated with Third party client(s). 
            Please Unlink the Third party client(s) before you make this update.
            
            ${associatedResult}`,
          });
          
        }
      }
      if(req.body.thirdPartyChange=="true"){
        let data = JSON.parse(req.body.data);
        data.installerId=null;
        req.body.data = JSON.stringify(Object.assign({}, data));
        

      }
     await restHandler.updateResource(req, res);
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
      restHandler.insertResource(req, res);
      break;
    case 'delete':
      restHandler.deleteResource(req, res);
      break;
    case 'find':
      getClinetById(req, res);
      break;
    default:
      restHandler.getResource(req, res);
      break;
  }
}

/**
 * function to handle POST request to create a Client System Settings
 * @param {object} req
 * @param {object} res
 */
async function clientSystemSetting(req, res) {
  try {
    const { clientID } = req.params;
    const result = await client.findById({ _id: clientID });
    const {
      smartDevicesAllowed,
      widgetsAllowed,
      reportsAllowed,
      bookmarkTypeAllowed,
      keyInCloudClientId,
      keyInCloudSecretKey,
      sera4Url,
      sera4Token,
      TwsUser,
      TwsPass,
      bookMarkData,
      cameraTagsAllowed
    } = req.body;

    if (!result) {
      res.send({
        error: true,
        errmsg: 'Client Not Found',
      });
    }
    if (keyInCloudClientId && keyInCloudSecretKey && sera4Url && sera4Token && TwsUser && TwsPass) {
      const data = await client.findOne({ _id: { $ne: clientID }, keyInCloudClientId: keyInCloudClientId, keyInCloudSecretKey: keyInCloudSecretKey, sera4Url: sera4Url, sera4Token: sera4Token, TwsUser: TwsUser, TwsPass: TwsPass });
      if (data && req.body.checked == "False") {
        return res.send({
          error: true,
          errmsg: `The used Client ID and Secret Key combination is already used for some other client.
          `,
        });
      }

    }
    // if (bookMarkData) {
    //   let bookMarkResult = await BookmarkType.insertMany(bookMarkData);
    //   if (bookMarkResult && bookMarkResult.length) {
    //     bookMarkResult.map(el => {
    //       bookmarkTypeAllowed.push(el._id)
    //     })
    //   }

    // }
    result.smartDevicesAllowed = smartDevicesAllowed;
    result.widgetsAllowed = widgetsAllowed;
    result.reportsAllowed = reportsAllowed;
    result.bookmarkTypeAllowed = bookmarkTypeAllowed;
    result.keyInCloudClientId = keyInCloudClientId;
    result.keyInCloudSecretKey = keyInCloudSecretKey;
    result.sera4Url = sera4Url;
    result.sera4Token = sera4Token;
    result.TwsUser = TwsUser;
    result.TwsPass = TwsPass;
    result.cameraTagsAllowed = cameraTagsAllowed;
    const clientSystemSettingResult = await result.save();
    // const clientSystemSettingResult = await result.update();

    if (clientSystemSettingResult) {
      result.isSystemSettingsCompleted = true;
      await result.save();
      res.send({
        error: false,
        result: clientSystemSettingResult,
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
 * function to handle POST request to create a Client Roles
 * @param {object} req
 * @param {object} res
 */
async function clientRoles(req, res) {
  try {
    const { clientID } = req.params;
    // let query= {
    //   _id : clientID.toObjectId()
    // }

    const result = await client.findById({ _id: clientID });
    if (!result) {
      res.send({
        error: true,
        errmsg: 'Client Not Found',
      });
    }
    let roleNames = [];
    let role = JSON.parse(req.body.role);
    let roles = role.map((ele) => {
      roleNames.push(ele.name);
      return {
        name: ele.name,
        description: ele.description,
        isAdminRole: ele.isAdminRole,
        permissions: ele.permissions,
        isClientAdminRole: ele.isClientAdminRole,
        isInstallerRole: ele.isInstallerRole,
        isSystemRole: ele.isSystemRole,
        clientId: clientID,
        createdByUserId: ele.createdByUserId,
      };
    });

    //checking Roles length
    if (roles.length > 10) {
      return res.send({
        success: false,
        errmsg: 'Roles can not be Excced than 10',
      });
    }

    //checking RoleName is already assiocated with the client
    const clientRoleNames = await Role.find({
      $and: [
        {
          name: {
            $in: roleNames,
          },
        },
        { clientId: clientID },
      ],
    });
    if (clientRoleNames.length > 0) {
      const duplicateRoleNames = clientRoleNames.map((ele) => {
        return ele.name;
      });
      return res.send({
        success: false,
        errmsg: `Client Already have this Roles '${duplicateRoleNames}'`,
      });
    }

    const roleResult = await Role.insertMany(roles);
    if (roleResult) {
      result.isRoleCompleted = true;
      await result.save();
      res.send({
        error: false,
        message: 'Data Inserted Successfully',
        data: roleResult,
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
 * function to handle POST request to GET all Client Roles based on clientID
 * @param {object} req
 * @param {object} res
 */
async function getClientRoles(req, res) {
  try {
    const { clientId } = req.params;
    const clientRoleResult = await Role.find({
      clientId: clientId,
    }).sort({ name: 1 }).collation({ locale: 'en' });
    if (clientRoleResult.length > 0) {
      return res.send({
        error: false,
        data: clientRoleResult,
        count: clientRoleResult.length,
      });
    } else {
      return res.send({
        error: true,
        errmsg: 'No Roles Found for this Client',
      });
    }
  } catch (err) {
    return res.send({
      error: true,
      errmsg: err,
    });
  }
}

/**
 * function to handle POST request to update a clientRole based on clientID
 * @param {object} req
 * @param {object} res
 */
async function updateClientRole(req, res) {
  try {
    const data = JSON.parse(req.body.data);
    const { clientID } = req.params;
    let existedRoles = [],
      existedRolesResult = [],
      newRoleNames = [],
      success,
      newRoles = [];

    //checking data length
    if (data.length > 10) {
      return res.send({
        error: true,
        errmsg: 'Roles can not be Excced than 10',
      });
    }

    //separting req.body
    data.map((ele) => {
      if (ele._id) {
        existedRoles.push(ele);
      } else {
        newRoles.push(ele);
      }
    });

    //updating existed Roles
    await Promise.all(
      existedRoles.map(async (ele) => {
        const query = {
          $and: [{ _id: ele._id }, { clientId: clientID }],
        };
        let result = await Role.findOne(query);
        if (!result) {
          return res.send({
            error: true,
            errmsg: 'No record Found',
          });
        }
        success = await result.updateOne(ele);
        if (!success) {
          return res.send({ error: true, errmsg: 'Failed to update' });
        } else {
          const result = await Role.findOne(query);
          existedRolesResult.push(result);
        }
      })
    );

    //checking roles name existed or not
    newRoles.forEach((e) => {
      newRoleNames.push(e.name);
    });

    const duplicateNewRoleNames = await Role.find({
      $and: [
        {
          name: {
            $in: newRoleNames,
          },
        },
        { clientId: clientID },
      ],
    });
    if (duplicateNewRoleNames.length > 0) {
      const duplicateRoles = duplicateNewRoleNames.map((e) => {
        return e.name;
      });
      return res.send({
        success: false,
        errmsg: `Client Already have this Roles '${duplicateRoles}'`,
      });
    } else {
      const newRolesResult = await Role.insertMany(newRoles);
      //finally return result
      if (newRolesResult.length > 0) {
        return res.send({
          error: false,
          message: 'Record Update Successfully',
          data: newRolesResult,
          existedRolesResult,
        });
      } else {
        return res.send({
          error: false,
          message: 'Record Update Successfully',
          data: existedRolesResult,
        });
      }
    }
  } catch (err) {
    return res.send({
      error: true,
      errmsg: err.message,
    });
  }
}

/**
 * function to handle PUT request to delete a clientRole based on clientID
 * @param {object} req
 * @param {object} res
 */
async function deleteClientRole(req, res) {
  try {
    const { clientID } = req.params;
    const { roleID } = req.body;

    const userResult = await User.find({ roleId: roleID });
    if (userResult.length > 0) {
      let userAccounts = userResult.map((el) => {
        return el.firstName;
      });
      return res.send({
        error: true,
        errmsg: `Oops! The Roles seems to be associated with some Account. Please disassociate it before you delete it.
        Associated Accounts: ${userAccounts}`,
      });
    }
    const result = await Role.findOne({
      $and: [{ _id: roleID }, { clientId: clientID }],
    });
    if (result == null) {
      res.send({
        error: true,
        errmsg: 'clientRole Already Deleted',
      });
    } else {
      if (
        result.isAdminRole ||
        result.isClientAdminRole ||
        result.isSystemRole
      ) {
        return res.send({
          error: true,
          errmsg: 'You are Unauthorized to Delete this  Role',
        });
      }
      result.roleStatus = 1;
      await result.save((err, data) => {
        if (err) {
          res.send({ error: true, errmsg: err });
        }
        return res.send({
          error: false,
          msg: 'clientRole Deleted Success',
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
 * function to handle PUT request to delete a clientRole based on clientID
 * @param {object} req
 * @param {object} res
 */
async function getClientUsers(req, res) {
  try {
    const { clientID } = req.params;
    const userDetails = await User.find({ clientId: clientID });
    if (userDetails.length > 0) {
      let emailUsers = [],
        phoneUsers = [];
      userDetails.filter((ele) => {
        if (ele.firstName) {
          emailUsers.push(ele.firstName);
        }
        if (ele.mobile) {
          phoneUsers.push(ele.firstName);
        }
      });
      return res.send({
        error: false,
        data: userDetails,
        emailUsers,
        phoneUsers,
        count: userDetails.length,
      });
    } else {
      return res.send({
        error: true,
        errmsg: 'No Users Found',
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
 * function to handle POST request to Find a client based on clientID
 * @param {object} req
 * @param {object} res
 */
async function getClinetById(req, res) {
  try {
    const { id } = req.params;
    let query = {
      clientId: {
        $in: [id],
      },
    };
    const widgetResult = await Widget.find(query);
    const reportResult = await Report.find(query);
    let clientResult = await Client.findById(id)
      .populate('widgetsAllowed')
      .populate('reportsAllowed ')
      .populate('smartDevicesAllowed ')
      .populate('bookmarkTypeAllowed')
      .populate('industry');
    if (!clientResult) {
      return res.send({ error: true, errmsg: 'No Record Found' });
    }
    if (widgetResult.length > 0 || reportResult.length > 0) {
      widgetResult.map((ele) => {
        clientResult.widgetsAllowed.push(ele);
      });
      reportResult.map((el) => {
        clientResult.reportsAllowed.push(el);
      });
      return res.send(clientResult);
    } else {
      return res.send(clientResult);
    }
  } catch (err) {
    return res.send({
      error: true,
      errmsg: err.message,
    });
  }
}
/**
 * function to handle POST request to GET all Client Permission based on clientID
 * @param {object} req
 * @param {object} res
 */
async function getClientRolePermission(req, res) {
  try {
    const { clientId } = req.params;
    const clientRoleResult = await Role.find({
      clientId: clientId,
    }).sort({ name: 1 }).collation({ locale: 'en' }).populate([{ path: 'permissions.pageId' }, { path: 'permissions.functionId' }, { path: 'permissions.widgetId', select: { name: 1, description: 1 } }, { path: 'permissions.reportId', select: { name: 1, description: 1 } }]);
    let ClientResultData = JSON.parse(JSON.stringify(clientRoleResult));
    let clientPermissions = [], clientPagePermissions = [], clientFunctionPermissions = [], clientWidgetPermissions = [], clientReportPermissions = [], resultPermission = [];
    clientPermissions = ClientResultData.map(el => { return el.permissions });
    clientPermissions.map(ele => {
      return ele.map(el => {
        if (el.widgetId !== null && (el.isViewAllowed || el.isEditAllowed)) {
          let { _id, name, description } = el.widgetId;
          el.widgetId = _id;
          el.name = name;
          el.description = description;

          clientWidgetPermissions.push(el)
        }
        if (el.reportId !== null && (el.isViewAllowed || el.isEditAllowed)) {
          let { _id, name, description } = el.reportId;
          el.reportId = _id;
          el.name = name;
          el.description = description;

          clientReportPermissions.push(el)
        }
        if (el.functionId !== null && (el.isViewAllowed || el.isEditAllowed)) {
          let { _id, name, description, permType, isForAdminRole, isForClientAdminRole, isForInstallerRole } = el.functionId;
          el.functionId = _id;
          el.name = name;
          el.description = description;
          el.permType = permType;
          el.isForAdminRole = isForAdminRole;
          el.isForClientAdminRole = isForClientAdminRole;
          el.isForInstallerRole = isForInstallerRole;
          clientFunctionPermissions.push(el)
        }
        if (el.pageId !== null && (el.isViewAllowed || el.isEditAllowed)) {
          let { _id, name, description, permType, isForAdminRole, isForClientAdminRole, isForInstallerRole } = el.pageId;

          el.pageId = _id;
          el.name = name;
          el.description = description;
          el.permType = permType;
          el.isForAdminRole = isForAdminRole;
          el.isForClientAdminRole = isForClientAdminRole;
          el.isForInstallerRole = isForInstallerRole;
          // delete el.pageId;
          clientPagePermissions.push(el)
        }
      })
    }
    )
    let resPagePermissions = _.uniqBy(JSON.parse(JSON.stringify(clientPagePermissions)), 'pageId')
    let resFunctionPermission = _.uniqBy(JSON.parse(JSON.stringify(clientFunctionPermissions)), 'functionId')
    let resWidgetPermission = _.uniqBy(JSON.parse(JSON.stringify(clientWidgetPermissions)), 'widgetId')
    let resReportPermission = _.uniqBy(JSON.parse(JSON.stringify(clientReportPermissions)), 'reportId')

    if (clientRoleResult.length > 0) {
      return res.send({
        error: false,
        pagePermission: resPagePermissions,
        pagePermissionLength: resPagePermissions.length,
        functionPermission: resFunctionPermission,
        functionPermissionLength: resFunctionPermission.length,
        reportPermission: resReportPermission,
        reportPermissionLength: resReportPermission.length,
        widgetPermission: resWidgetPermission,
        widgetPermissionLength: resWidgetPermission.length
      });
    } else {
      return res.send({
        error: true,
        errmsg: 'No Permission Found for this Client',
      });
    }
  } catch (err) {
    console.log(err)
    return res.send({
      error: true,
      errmsg: err,
    });
  }
}

/**
 * function to handle POST request to Delete Selected ClientBookMarks
 * @param {object} req
 * @param {object} res
 */
async function deleteClientBookMarks(req, res) {
  try {
    const { clientId } = req.params;
    const bookMarkTypeIds = JSON.parse(req.body.bookMarkTypeIds);
    let bookMarkRules = [];
    for (let i = 0; i < bookMarkTypeIds.length; i++) {
      const bookMarkTypeData = await BookmarkTypeModel.findOne({ _id: bookMarkTypeIds[i] });
      if (bookMarkTypeData && bookMarkTypeData.clientId == null) {
        return res.send({
          error: true,
          errmsg: `You are Unauthorized to Delete this  Global BookmarkTypes`,
        });
      }

    }
    let associatedResult = [];

    const scaleRulesData = await StoreNotificationModel.find({ $or: [{ "scale.bookMarkTypeId": { $in: bookMarkTypeIds } },{ "alarm.bookMarkTypeId": { $in: bookMarkTypeIds } }] }
    ).populate([{ path: 'scale.bookMarkTypeId' },{ path: 'alarm.bookMarkTypeId' }]);
    
    let rules = []

    if (scaleRulesData.length) {
      scaleData = scaleRulesData.map((ele) => {
        ele.scale.map(el => {
          if(el.bookMarkTypeId){
            rules.push(el.bookMarkTypeId.bookmarkType)

          }
        });
        ele.alarm.map(el => {
          if(el.bookMarkTypeId){
            rules.push(el.bookMarkTypeId.bookmarkType)

          }
        });
      });
      let bookMarkTypeData = [];
      for (let i = 0; i < bookMarkTypeIds.length; i++) {
        bookMarkTypeData[i] = await BookmarkTypeModel.findOne({ _id: bookMarkTypeIds[i] }, { bookmarkType: 1 });
      }
      bookMarkTypeData = JSON.parse(JSON.stringify(bookMarkTypeData))
      let resultRules = []
      var filteredKeywords = bookMarkTypeData.filter((word) => {
        if (rules.includes(word.bookmarkType)) {
          return resultRules.push(word.bookmarkType)
        }
      });

      let scaleList = resultRules.slice(0, 5);
      scaleList = scaleList.join(', ');
      if (resultRules.length > 5) {
        let scaleRulesCount = resultRules.length;
        scaleRulesCount = scaleRulesCount - 5;
        associatedResult = [
          ...associatedResult,
          ` Associated Rules : ${scaleList}..${scaleRulesCount} more rules left`,
        ];

      } else {
        associatedResult = [
          ...associatedResult,
          ` Associated Rules : ${scaleList} `,
        ];
      }
      return res.send({
        error: true,
        errmsg: `The BookmarkType seems to be associated with some rules. Please disassociate it before you delete it. 
        
        ${associatedResult}`,
      });
    }

    const deletedData = await BookmarkTypeModel.remove({ _id: { $in: bookMarkTypeIds }, clientId: clientId });
    const remainingClientBookMarks = await BookmarkTypeModel.find({
      $or: [{ clientId: { $exists: false } }, { clientId: null }, { clientId: clientId }],

    });
    res.send({ success: true, message: 'Record(s) deleted successfully.', data: remainingClientBookMarks })
  } catch (error) {
    res.send({
      error: true,
      errmsg: error.message
    });
  }
}


/**
 * function to handle POST request to Delete Selected ClientTags
 * @param {object} req
 * @param {object} res
 */

async function deleteClientTags(req, res) {
  try {
    const { clientId } = req.params;
    const cameraTagIds = JSON.parse(req.body.cameraTagIds);

    for (let i = 0; i < cameraTagIds.length; i++) {
      const cameraTagData = await CameraTagModel.findOne({ _id: cameraTagIds[i] });
      if (cameraTagData && cameraTagData.clientId == null || cameraTagData.isGlobal == true) {
        return res.send({
          error: true,
          errmsg: `You are Unauthorized to Delete this  Global CameraTags`,
        });
      }

    }
    let associatedResult = [];
    let cameraResult;

    const cameraData = await Camera.find({ tags: { $in: cameraTagIds } }).populate([{ path: 'storeId', select: { name: 1 } }]);
    if (cameraData.length) {
      cameraResult = cameraData.map((ele) => {
        return ele.name;
      });
      let cameraList = cameraResult.slice(0, 5);
      cameraList.join(', ');
      if (cameraData.length > 5) {
        let cameraCount = cameraData.length;
        cameraCount = cameraCount - 5;
        associatedResult = [
          ...associatedResult,
          ` Associated Cameras : ${cameraList}..${cameraCount} more cameras left`,
        ];

      } else {
        associatedResult = [
          ...associatedResult,
          ` Associated Cameras : ${cameraList} `,
        ];
      }
      console.log(associatedResult);
      return res.send({
        error: true,
        errmsg: `The Tag seems to be associated with some cameras. Please disassociate it before you delete it. 
        
        ${associatedResult}`,
      });
    }

    const deletedData = await CameraTagModel.remove({ _id: { $in: cameraTagIds }, clientId: clientId });

    res.send({ success: true, message: 'Record(s) deleted successfully.' })
  } catch (error) {
    res.send({
      error: true,
      errmsg: error.message
    });
  }
}

module.exports = {
  getClients,
  getClient,
  clientSystemSetting,
  clientRoles,
  getClientRoles,
  updateClientRole,
  deleteClientRole,
  getClientUsers,
  getClientRolePermission,
  deleteClientBookMarks,
  deleteClientTags
};
