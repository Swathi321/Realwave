const restHandler = require('./restHandler')();
restHandler.setModelId('reports', ['name'], 'Report name already exists');
const common = require('./common');
const report = require('../modals/report');
const Widget = require('../modals/widget');
const Client = require('../modals/client');
const Role = require('../modals/role');
const User = require('../modals/user');
const Reports = require('../modals/report');

/**
 * function to handle POST&GET request to receive all the REPORTS
 * @param {object} req
 * @param {object} res
 */

function getReports(req, res) {
  switch (req.body.action) {
    case 'export':
      restHandler.getExportRecord(req, res);
      break;
    case 'populate':
      getReportsWithClientIndusytry(req, res);
      break;
    default:
      restHandler.getResources(req, res);
      break;
  }
}

/**
 * function to handle POST & GET create a the REPORTS
 * @param {object} req
 * @param {object} res
 */
async function getReport(req, res) {
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
      let result1 = await Reports.findById(id);
      if (result1) {
        let query = {
          _id: { $ne: result1._id },
          name: data1.name
        }
        const duplicate = await Reports.findOne(query);
        if (duplicate) {
          return res.json({
            success: false,
            errmsg: 'Report name already exists',
          });
        } else {
          const data = await Reports.findByIdAndUpdate(id, data1, { new: true });
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
      getReportsWithClientIndusytry(req, res);
      break;
    default:
      restHandler.getResource(req, res);
      break;
  }
}

/**
 * function to handle POST request to get REPORTS based on IndustryID
 * @param {object} req
 * @param {object} res
 */
function getReportByIndustryId(req, res) {
  const { industryId, clientId } = req.body;
  let query = {
    industryId: {
      // $in: [mongoose.Types.ObjectId(industryId)],
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
  report.find(query, (err, result) => {
    if (err) {
      res.send({ error: true, errmsg: err });
    }
    return res.send({ error: false, data: result });
  });
}

/**
 * function to handle PUT request to delete REPORTS based on reportID
 * @param {object} req
 * @param {object} res
 */
async function deleteReportById(req, res) {
  const { reportId } = req.params;
  let query = {
    report: reportId,
  };
  let query2 = {
    reportsAllowed: {
      $in: [reportId],
    },
  };
  let query3 = {
    permissions: { $elemMatch: { reportId: reportId } },
  };
  const widgetResult = await Widget.find(query);
  const userResult = await User.find(query2);
  const clientResult = await Client.find(query2);
  const roleResult = await Role.find(query3);
  if (
    widgetResult.length > 0 ||
    userResult.length > 0 ||
    clientResult.length > 0 ||
    roleResult.length > 0
  ) {
    let msg = [],
      associatedResult = [],
      client,
      widget,
      user,
      role;
    if (widgetResult.length > 0) {
      widget = widgetResult.map((el) => {
        return el.name;
      });
      let widgetList = widget.slice(0, 5);
      widgetList = widgetList.join(', ');
      if (widget.length > 5) {
        let widgetCount = widget.length;
        widgetCount = widgetCount - 5;
        associatedResult = [
          ...associatedResult,

          ` 
          Associated Widgets : ${widgetList}..${widgetCount} more Widgets associated`
        ];
      } else {
        associatedResult = [
          ...associatedResult,
          ` 
          Associated Widgets : ${widgetList}`
        ];
      }
      // associatedResult = [
      //   ...associatedResult,
      //   `\u00A0 AssociatedWidgets : ${widget}`,
      // ];
      msg = [...msg, ' Widget'];
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

          Associated Clients : ${clientList}..${clientCount} more Clients associated`
          
        ];
      } else {
        associatedResult = [
          ...associatedResult,
          ` 

          Associated Clients : ${clientList}`
     
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

          Associated Users : ${userList}..${userCount} more Users associated`
         
        ];
      } else {
        associatedResult = [
          ...associatedResult,
          ` 

          Associated Users : ${userList}`
          
        ];
      }
      msg = [...msg, ' User'];
    }
    if (roleResult.length > 0) {
      role = roleResult.map((el) => {
        return el.name;
      });
      let roleList = role.slice(0, 5);
      roleList=roleList.join(', ');
      if (role.length > 5) {
        let roleCount = role.length;
        roleCount = roleCount - 5;
        associatedResult = [
          ...associatedResult,

          ` 

          Associated Role : ${roleList}..${roleCount} more Roles associated`
          
        ];
      } else {
        associatedResult = [
          ...associatedResult,
          ` 

          Associated Role : ${roleList}`
        ];
      }
      msg = [...msg, ' Role'];
    }
    res.send({
      error: true,
      errmsg: `Report is associated with some ${msg}. Please disassociate before you delete it. 
      ${associatedResult}`,
    });
  } else {
    const result = await report.findById(reportId);
    if (result == null) {
      res.send({
        error: true,
        errmsg: 'Report Already Deleted',
      });
    } else {
      result.reportStatus = 1;
      result.save((err, data) => {
        if (err) {
          res.send({ error: true, errmsg: err.message });
        }
        return res.send({
          error: false,
          msg: 'Reported deleted Success',
        });
      });
    }
  }
}

/**
 * function to handle POST request to get REPORTS with populate's for Industry and Client
 * @param {object} req
 * @param {object} res
 */
async function getReportsWithClientIndusytry(req, res) {
  try {
    let query, result;
    if (req.params.id) {
      query = {
        _id: req.params.id,
      };
      result = await report.find(query).populate([
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
      result = await report.find().populate([
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
      data.map((ele) => {
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
    res.send({
      error: true,
      errmsg: err,
    });
  }
}

/**
 * function to handle GET request to get All Active Widgets
 * @param {object} req
 * @param {object} res
 */
async function getAllReports(req, res) {
  try {
    const reportResult = await Reports.find({
      reportStatus: 0,
    });
    if (reportResult.length > 0) {
      return res.send({
        error: false,
        success: true,
        data: reportResult,
        total: reportResult.length,
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
  Reports.find({ name: data.name, reportStatus: 0 }, async (err, data) => {
    if (err) {
      return res.send({
        success: false,
        errmsg: err.message,
      });
    }
    if (data.length > 0) {
      return res.send({
        success: false,
        errmsg: 'Report name already exists',
      });
    }
    cb();
  });
};

module.exports = {
  getReport,
  getReports,
  getReportByIndustryId,
  deleteReportById,
  getAllReports,
};
