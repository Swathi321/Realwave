let CameraTagModel = require('../modals/cameraTag');
const restHandler = require('./restHandler')();
restHandler.setModelId('cameraTags');
const Client=require('../modals/client');
// restHandler.setModelId('cameraTags');
const common = require('./common');




async function getcameraTag(req, res) {
  switch (req.body.action) {
    case 'load':
      common.getData(req, res, restHandler);
      break;
    case 'update':
      restHandler.updateResource(req, res);
      break;
    case 'save':
      // restHandler.insertResource(req, res);
      beforeSave(req, res, () => {
        restHandler.insertResource(req, res);
      });
      break;
    case 'client':
      if (req.body.clientsave == 'true') {
        req.body.data = JSON.parse(req.body.data);
        if (req.body.data.clientId) {
          req.body.data = JSON.stringify(req.body.data);
          beforeSaveClient(req, res, () => {
            restHandler.insertResource(req, res);
          });
        } else {
          res.send({ success: false, errmsg: 'ClientId Required' });
        
        }
      }
      if (req.body.clientedit == 'true') {
        req.body.data = JSON.parse(req.body.data);
        if (req.body.data.clientId) {
          req.body.data = JSON.stringify(req.body.data);

          restHandler.updateResource(req, res);
        } else {
          res.send({ success: false, errmsg: 'ClientId Required' });

        }
      }
      if (req.body.clientget == 'true') {
        let defaultFilter = [
          {      
      $or: [{ clientId: req.body.clientId },{ isGlobal: true }]
          }
        ];
        restHandler.getResources(req, res, null, false, defaultFilter)
      }

      break;

    case 'get':
      let defaultFilter = [{ isGlobal: true }];
      restHandler.getResources(req, res, null, false, defaultFilter);

      break;
    case 'delete':
      await bookMark.deleteMany({ 'bookmarkType.value': req.params.id })
      restHandler.deleteResource(req, res)
      break
    case 'globalTag':
      try {
        const data1 = JSON.parse(req.body.data)
        let data =await  CameraTagModel.find({ name: data1.name })
        console.log(data,'@');
        if (data.length > 0) {
          return res.send({
            success: false,
            errmsg: 'Tag name already exists'
          })
        } else {
          restHandler.insertResource(req, res, onActionComplete)
        }
      } catch (err) {
        return res.send({
          success: false,
          errmsg: err.message
        })
      }

      break
    default:
      restHandler.getResources(req, res)
      break
  }
}
let beforeSave = (req, res, cb) => {
  const data = JSON.parse(req.body.data)
  CameraTagModel.find({ name: data.name}, async (err, data) => {
    if (err) {
      return res.send({
        success: false,
        errmsg: err.message,
      });
    }
    if (data.length > 0) {
      return res.send({
        success: false,
        errmsg: 'Tag name already exists',
      });
    }
    cb();
  });
};
let beforeSaveClient =(req, res, cb) => {
  try {
    const data = JSON.parse(req.body.data);
    CameraTagModel.find(
      {
        name: data.name,
        isGlobal: true
      },
      async (err, data) => {
        if (data.length > 0) {
          return res.send({
            success: false,
            errmsg: 'Tag name already exists'
          })
        } else {
          const data1 = JSON.parse(req.body.data)

          CameraTagModel.find(
            { name: data1.name, clientId: data1.clientId },
            async (err, data) => {
              console.log('asad', data)
              if (data.length > 0) {
                return res.send({
                  success: false,
                  errmsg: 'Tag name already exists'
                })
              } else {
                cb()
              }
            }
          )
        }
      }
    )
  } catch (err) {
    return res.send({
      success: false,
      errmsg: err.message
    })
  }
}
const onActionComplete = async (err, respData, req) => {
  if (!err) {
    let params = Object.assign({}, req.params, req.body);
    if(params.clientId){
      let clientData =await Client.findById(params.clientId);
      clientData.cameraTagsAllowed.push(respData._id);
      clientData.save();
    }
    
    
  }
}
module.exports = { getcameraTag }
