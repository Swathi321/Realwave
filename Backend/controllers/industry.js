const restHandler = require('./restHandler')();
restHandler.setModelId('industry', ['name'], 'Industry name already exists');
const common = require('./common');
const industry = require('../modals/industry');
const Client = require('../modals/client');
const Widgets = require('../modals/widget');
const Reports = require('../modals/report');
const Industry = require('../modals/industry');

/**
 * function to handle POST & GET request to receive all the industries
 * @param {object} req
 * @param {object} res
 */

function getIndustrys(req, res) {
  switch (req.body.action) {
    case 'export':
      restHandler.getExportRecord(req, res);
      break;
    default:
      restHandler.getResources(req, res);
      break;
  }
}

/**
 * function to handle POST & GET request to create the industry based on ID's
 * @param {object} req
 * @param {object} res
 */
async function getIndustry(req, res) {
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
      let result1 = await Industry.findById(id);
      if (result1) {
        let query = {
          _id: { $ne: result1._id },
          name: data1.name
        }
        const duplicate = await Industry.findOne(query);
        if (duplicate) {
          return res.json({
            success: false,
            errmsg: 'Industry name already exists',
          });
        } else {
          const data = await Industry.findByIdAndUpdate(id, data1, { new: true });
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
    default:
      restHandler.getResource(req, res);
      break;
  }
}

/**
 * function to handle PUT request to delete industry based on ID
 * @param {object} req
 * @param {object} res
 */
async function deleteIndustryById(req, res) {
  const { industryId } = req.params;
  let query = {
    industry: industryId,
  };
  let query2 = {
    industryId: {
      $in: [industryId],
    },
  };
  const clientResult = await Client.find(query);
  const reportResult = await Reports.find(query2);
  const widgetResult = await Widgets.find(query2);

  if (
    clientResult.length > 0 ||
    reportResult.length > 0 ||
    widgetResult.length > 0
  ) {
    let msg = [],
    associatedResult = [],
      client,
      report,
      widget;
    if (clientResult.length > 0) {
      client = clientResult.map((ele) => {
        return ele.name;
      });
      // associatedResult = [
      //   ...associatedResult,
      //   ` \u00A0 AssociatedClients : ${client}`,
      // ];

      let clientList = client.slice(0, 5);
      clientList.join(', ');

      if (client.length > 5) {
        let clientCount = client.length;
        clientCount = clientCount - 5;
        associatedResult = [
          ...associatedResult,
          ` Associated Clients : ${clientList}..${clientCount} more clients left`,
        ];
      } else {
        associatedResult = [
          ...associatedResult,
          ` Associated Clients : ${clientList} `,
        ];
      }

      msg = [...msg, 'Client'];
    }
    if (reportResult.length > 0) {
      report = reportResult.map((ele) => {
        return ele.name;
      });

      let reportList = report.slice(0, 5);
      reportList = reportList.join(', ');
      if (report.length > 5) {
        let reportCount = report.length;
        reportCount = reportCount - 5;
        associatedResult = [
          ...associatedResult,
          ` 

          Associated Reports : ${reportList}..${reportCount} more reports associated`,
        ];
      } else {
        associatedResult = [
          ...associatedResult,
          ` 
          
          Associated Reports : ${reportList}`,
        ];
      }
      msg = [...msg, ' Reports'];
    }
    if (widgetResult.length > 0) {
      widget = widgetResult.map((ele) => {
        return ele.name;
      });
      let widgetList = widget.slice(0, 5);
      widgetList = widgetList.join(', ');

      if (widget.length > 5) {
        let widgetCount = widget.length;
        widgetCount = reportCount - 5;
        associatedResult = [
          ...associatedResult,

          ` 

          Associated Widgets : ${widgetList}..${widgetCount} more widgets associated`,
        ];
      } else {
        associatedResult = [
          ...associatedResult,
          ` 

          Associated Widgets : ${widgetList}`,
        ];
      }

      msg = [...msg, ' Widgets'];
    }
    res.send({
      error: true,
      errmsg: `The Industry seems to be associated with some ${msg}. Please disassociate it before you delete it. 
      
      ${associatedResult} `,
    });
  } else {
    const result = await industry.findById(industryId);
    if (result == null) {
      res.send({
        error: true,
        errmsg: 'Industry Already Deleted',
      });
    } else {
      result.industryStatus = 1;
      result.save((err, data) => {
        if (err) {
          res.send({ error: true, errmsg: err });
        }
        return res.send({
          error: false,
          msg: 'Industry deleted Success',
        });
      });
    }
  }
}

/**
 * function to handle POST request to get Widgets and Reports based on industryID
 * @param {object} req
 * @param {object} res
 */
async function getWidgetsAndReports(req, res) {
  try {
    const { industryId } = req.body;
    let query = {
      industryId: {
        $in: industryId,
      },
    };
    if (req.body.clientId) {
      query = {
        $or: [
          {
            industryId: {
              $in: industryId,
            },
          },
          {
            clientId: {
              $in: req.body.clientId,
            },
          },
        ],
      };
    }
    const widgetsResult = await Widgets.find(query);
    const reportResult = await Reports.find(query);
    if (reportResult.length > 0 || widgetsResult.length > 0) {
      res.send({
        error: false,
        WidgetsResult: widgetsResult,
        ReportResult: reportResult,
        WidgetsCount: widgetsResult.length,
        ReportsCount: reportResult.length,
      });
    } else {
      res.send({
        error: true,
        errmsg: 'No Widgets & Reports Found',
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
 * function to handle GET request to get All Active Industries
 * @param {object} req
 * @param {object} res
 */
async function getAllIndustries(req, res) {
  try {
    const industryResult = await Industry.find({
      industryStatus: 0,
    }).sort({ name: 1 }).collation({ locale: 'en' });
    if (industryResult.length > 0) {
      return res.send({
        error: false,
        success: true,
        data: industryResult,
        total: industryResult.length,
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
  Industry.find({ name: data.name, industryStatus: 0 }, async (err, data) => {
    if (err) {
      return res.send({
        success: false,
        errmsg: err.message,
      });
    }
    if (data.length > 0) {
      return res.send({
        success: false,
        errmsg: 'Industry name already exists',
      });
    }
    cb();
  });
};

module.exports = {
  getIndustrys,
  getIndustry,
  deleteIndustryById,
  getWidgetsAndReports,
  getAllIndustries,
};
