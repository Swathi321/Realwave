const restHandler = require('./restHandler')();
restHandler.setModelId('widgets', ['name'], 'Widget name already exists');
const common = require('./common');
const widget = require('../modals/widget');
const Role = require('../modals/role');
const User = require('../modals/user');
const Client = require('../modals/client');
const Reports = require('../modals/report');
const Widgets = require('../modals/widget');

/**
 * function to handle GET request to receive all the Widgets
 * @param {object} req
 * @param {object} res
 */

async function getWidget(req, res) {
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
      let result1 = await Widgets.findById(id);
      if (result1) {
        let query = {
          _id: { $ne: result1._id },
          name: data1.name
        }
        const duplicate = await Widgets.findOne(query);
        if (duplicate) {
          return res.json({
            success: false,
            errmsg: 'Widget name already exists',
          });
        } else {
          const data = await Widgets.findByIdAndUpdate(id, data1, { new: true });
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
    case 'populate':
      getWidgetsWithClientIndusytry(req, res);
      break;
    default:
      restHandler.getResource(req, res);
      break;
  }
}

/**
 * function to handle POST request to get Widget list based on IndustryID's
 * @param {object} req
 * @param {object} res
 */
function getWidgetByIndustryId(req, res) {
  const { industryId, clientId } = req.body;
  let query = {
    industryId: {
      $in: industryId,
    },
  };

  // clientId
  //   ? (query = {
  //       clientId: {
  //         $in: clientId,
  //       },
  //     })
  //   : query;
  widget.find(query, (err, result) => {
    if (err) {
      res.send({ error: true, errmsg: err });
    }
    return res.send({ error: false, data: result });
  });
}

/**
 * function to handle DELETE request to delete the Widget
 * @param {object} req
 * @param {object} res
 */
async function deleteWidgetById(req, res) {
  const { id } = req.params;
  let query = {
    widgetsAllowed: {
      $in: [id],
    },
  };
  let query2 = {
    permissions: { $elemMatch: { widgetId: id } },
  };
  const clientResult = await Client.find(query);
  const userResult = await User.find(query);
  const roleResult = await Role.find(query2);
  if (
    clientResult.length > 0 ||
    userResult.length > 0 ||
    roleResult.length > 0
  ) {
    let msg = [],
      associatedResult = [],
      client,
      user,
      role;
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
      msg = [...msg, ' Client'];
    }
    if (userResult.length > 0) {
      user = userResult.map((e) => {
        return e.firstName;
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
      msg = [...msg, 'User'];
    }
    if (roleResult.length > 0) {
      role = roleResult.map((el) => {
        return el.name;
      });
      let roleList = role.slice(0, 5);
      roleList = roleList.join(', ');
      if (role.length > 5) {
        let roleCount = role.length;
        roleCount = roleCount - 5;
        associatedResult = [
          ...associatedResult,

          ` 

          Associated Role : ${roleList}..${roleCount} more Roles associated`,
        ];
      } else {
        associatedResult = [
          ...associatedResult,
          ` 

          Associated Role : ${roleList}`,
        ];
      }
      msg = [...msg, 'Role'];
    }
    res.send({
      error: true,
      errmsg: `Widget is associated with some ${msg}. Please disassociate before you delete it. 
      ${associatedResult}`,
    });
  } else {
    const data = await widget.findById({ _id: id });
    if (data == null) {
      res.send({
        error: true,
        errmsg: 'Widegt Already Deleted',
      });
    } else {
      data.widgetStatus = 1;
      data.save((err, result) => {
        if (err) {
          res.send({ error: true, errmsg: err });
        }
        return res.send({
          error: false,
          msg: 'widget deleted Success',
        });
      });
    }
  }
}

/**
 * function to handle POST & GET request to get Widget's
 * @param {object} req
 * @param {object} res
 */
function getWidgets(req, res) {
  switch (req.body.action) {
    case 'export':
      restHandler.getExportRecord(req, res);
      break;
    case 'populate':
      getWidgetsWithClientIndusytry(req, res);
      break;
    default:
      restHandler.getResources(req, res);
      break;
  }
}

/**
 * function to handle POST request to get Widgets with populate's for Industry and Client
 * @param {object} req
 * @param {object} res
 */
async function getWidgetsWithClientIndusytry(req, res) {
  try {
    let query, result;
    if (req.params.id) {
      query = {
        _id: req.params.id,
      };
      result = await widget.find(query).populate([
        {
          path: 'clientId',
          select: { _id: 1, name: 1 },
        },
        {
          path: 'industryId',
          select: { _id: 1, name: 1 },
        },
      ]);
    } else {
      result = await widget.find().populate([
        {
          path: 'clientId',
          select: { _id: 1, name: 1 },
        },
        {
          path: 'industryId',
          select: { _id: 1, name: 1 },
        },
      ]);
    }
    const data = JSON.parse(JSON.stringify(result));
    if (data.length > 0) {
      data.map((ele, i) => {
        if (ele.industryId !== null && ele.industryId.length > 0) {
          ele.industryId.map((e) => {
            e.value = e._id;
            e.label = e.name;
            delete e._id;
            delete e.name;
          });
        }
        if (ele.clientId !== null && ele.clientId.length > 0) {
          ele.clientId.map((e) => {
            e.value = e._id;
            e.label = e.name;
            delete e._id;
            delete e.name;
          });
        }
      });
      res.send({
        error: false,
        data: data,
        count: data.length,
      });
    } else {
      res.send({
        error: true,
        errmsg: 'No Reports Found',
      });
    }
  } catch (err) {
    logger.error('err', err);
    res.send({
      error: true,
      errmsg: err.message,
    });
  }
}

/**
 * function to handle POST request to get global Widgets And Reports
 * @param {object} req
 * @param {object} res
 */
async function getGlobalWidgetsReports(req, res) {
  try {
    let widgetResult = await widget.find();
    let reportResult = await Reports.find();
    const widgetData = JSON.parse(JSON.stringify(widgetResult));
    const reportData = JSON.parse(JSON.stringify(reportResult));


    if (widgetResult.length > 0) {
      widgetData.map((e) => {
        e.value = e._id;
        e.label = e.name;
        delete e._id;
        delete e.name;
      });
    }
    if(reportResult.length>0){
      reportData.map(e=>{
         e.value = e._id;
        e.label = e.name;
        delete e._id;
        delete e.name;
      })
    }
    res.send({
      error: false,
      widgetData: widgetData,
      widgetsCount:widgetResult.length,
      reportData:reportData,
      reportsCount:reportResult.length
    });
  } catch (err) {
    logger.error('err', err);
    res.send({
      error: true,
      errmsg: err.message,
    });
  }
}

/**
 * function to handle GET request to get All Active Widgets
 * @param {object} req
 * @param {object} res
 */
async function getAllWidgets(req,res){
  try{
    const widgetResult = await widget.find({
      widgetStatus : 0
    });
    if(widgetResult.length > 0){
      return res.send({
        error: false,
        success: true,
        data : widgetResult,
        total : widgetResult.length
      });
    }
    else{
      return res.send({
        error: true,
        errmsg : 'No Records Found'
      })
    }
  }catch(err){
    return res.send({
      error: true,
      errmsg : err.message
    })
  }
}

//helper function
let beforeSave = (req, res, cb) => {
  const data = JSON.parse(req.body.data);
  Widgets.find({ name: data.name, widgetStatus: 0 }, async (err, data) => {
    if (err) {
      return res.send({
        success: false,
        errmsg: err.message,
      });
    }
    if (data.length > 0) {
      return res.send({
        success: false,
        errmsg: 'Widget name already exists',
      });
    }
    cb();
  });
};

module.exports = {
  getWidget,
  getWidgets,
  getWidgetByIndustryId,
  deleteWidgetById,
  getGlobalWidgetsReports,
  getAllWidgets,
};
