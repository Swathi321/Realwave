const restHandler = require('./restHandler')();
restHandler.setModelId('roiTagMaster');
const roiModel=require('../modals/roiTagMaster');

async function getRoiMasters(req, res) {
    switch (req.body.action) {
      case 'save':
        restHandler.insertResource(req, res);
        break;
        case 'get':
          const roiResult = await roiModel.find({}).sort({ tagName: 1 }).collation({ locale: 'en' });
          res.send({
            error: false,
            data: roiResult,
            total: roiResult.length,
          });
         

            break;
      default:
        restHandler.getResources(req, res);
        break;
    }
  }
  
  /**
   * function to handle GET request to receive all the ClientRegion
   * @param {object} req
   * @param {object} res
   */
  function getRoiMaster(req, res) {
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
        restHandler.insertResource(req, res);
        break;
      case 'delete':
        restHandler.deleteResource(req, res);
        break;
     
      default:
        restHandler.getResource(req, res);
        break;
    }
  }

  module.exports ={
    getRoiMasters,
    getRoiMaster
  }