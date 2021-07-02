const restHandler = require('./restHandler')();
restHandler.setModelId('clientRegions');
const common = require('./common');
const clientRegion = require('../modals/clientRegion');
const store = require('../modals/store');
const Client = require('../modals/client');
const Store = require('../modals/store');

/**
 * function to handle GET & POST request to receive all the ClientRegion
 * @param {object} req
 * @param {object} res
 */

function getClientRegions(req, res) {
  switch (req.body.action) {
    case 'save':
      restHandler.insertResource(req, res);
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
function getClientRegion(req, res) {
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
    case 'create':
      createClientRegion(req, res);
      break;
    default:
      restHandler.getResource(req, res);
      break;
  }
}

/**
 * function to handle POST request to receive all the Global clientRegions
 * @param {object} req
 * @param {object} res
 */
async function clientGlobalRegion(req, res) {
  try {
    const condition = {
      parentRegionId: null,
      clientId: null,
    };
    const regionsResult = await clientRegion.find(condition);
    if (regionsResult.length > 0) {
      return res.send({
        success: true,
        data: regionsResult,
        count: regionsResult.length,
      });
    } else {
      return res.send({
        success: true,
        message: 'No Data Found',
      });
    }
  } catch (err) {
    return res.send({
      success: false,
      message: err,
    });
  }
}

/**
 * function to handle GET request to receive all Regions based on 'parentsRegionId'
 * @param {object} req
 * @param {object} res
 */
async function clientRegionId(req, res) {
  try {
    const { parentRegionId } = req.params;
    const parentRegionResult = await clientRegion.find({ parentRegionId });
    if (parentRegionResult.length > 0) {
      return res.send({
        success: true,
        data: parentRegionResult,
        count: parentRegionResult.length,
      });
    } else {
      return res.send({
        success: true,
        message: 'No Records Found',
      });
    }
  } catch (err) {
    return res.send({
      success: false,
      message: err,
    });
  }
}

/**
 * function to handle POST request to get all Regions assoicated with clientID
 * @param {object} req
 * @param {object} res
 */
async function clientRegionByClientId(req, res) {
  try {
    const { clientId } = req.params;
    const result = await clientRegion
      .find({ clientId })
      .sort([['createdAt', 1]]);

    if (result.length == 0) {
      return res.send({
        success: true,
        message: 'No Records Found',
      });
    }

    //tree structure
    let array = JSON.parse(JSON.stringify(result));

    var clientRegionResut = await convert(array);
    if (clientRegionResut.length > 0) {
      const clientStoreResult = await store.find({ clientId });

      return res.send({
        success: true,
        clientRegionsResult: clientRegionResut,
        // clientStoreRegionsResult: clientStoreResult,
        // clientRegionsResultCount: clientRegionResut.length,
        // clientStoreRegionsResultCount: clientStoreResult.length,
      });
    } else {
      return res.send({
        success: true,
        message: 'No Records Found',
      });
    }
  } catch (error) {
    return res.send({
      error: true,
      message: error.message,
    });
  }
}

/**
 * function to handle POST request to get all Regions & Stores assoicated with clientID(Tree Structure)
 * @param {object} req
 * @param {object} res
 */
async function clientRegions(req, res) {
  try {
    const { clientId } = req.params;
    const result = await clientRegion.find({ clientId });
    const storeResult = await store.find({ clientId });
    if (result.length > 0) {
      const regionResult = JSON.parse(JSON.stringify(result));
      let stores = [];
      regionResult.map((ele1) => {
        storeResult.map((ele2) => {
          if (ele1._id == ele2.clientRegion) {
            stores.push({
              storeName: ele2.name,
              storeId: ele2._id,
              clientRegionId: ele2.clientRegion,
            });
          }
        });
        ele1.storeData = stores.filter((e) => {
          return ele1._id == e.clientRegionId;
        });
      });
      var clientRegionResut = await convert(regionResult);

      return res.send({
        success: true,
        // data: result,
        // storeResult: storeResult,
        // count: result.length,
        // regionResult,
        clientRegionResut,
        // stores,
        // storeResultCount: storeResult.length,
      });
    } else {
      return res.send({
        success: true,
        message: 'No Data Found',
      });
    }
  } catch (error) {
    return res.send({
      success: false,
      message: error.message,
    });
  }
}

/**
 * function to handle PUT request to delete a clientRegion based on clientID and regionID
 * @param {object} req
 * @param {object} res
 */
async function deleteClientRegion(req, res) {
  try {
    const { clientID, id } = req.body;
    const query = {
      $and: [{ clientId: clientID }, { _id: id }],
    };
    const clientRegionResult = await clientRegion.findOne(query);
    const clientResult = await Client.findById({ _id: clientID });
    const siteResult = await Store.find({ clientId: clientID, clientRegion: id });
    if (siteResult.length) {
      return res.send({
        error: true,
        errmsg: 'The region can not be deleted, it is associted with some site(s).',
      });
    }

    if (clientRegionResult !== null) {
      clientRegionResult.isDeleted = 1;
      await clientRegionResult.save();
      const result = await clientRegion
        .find({ clientId: clientID })
        .sort([['createdAt', 1]]);
      if (result.length == 0) {
        return res.send({
          success: true,
          message: 'No Records Found',
        });
      }
      if (result.length == 1) {
        clientResult.isRegionCompleted = false;
        await clientResult.save();
      }

      //tree structure
      let array = JSON.parse(JSON.stringify(result));

      let clientRegionTreeData = await convert(array);

      return res.send({
        error: false,
        message: 'ClientRegion Deleted Successfully',
        treeData: clientRegionTreeData,
      });
    }
    if (clientRegionResult == null) {
      return res.send({
        error: true,
        errmsg: 'ClientRegion Already Deleted',
      });
    } else {
      return res.send({
        error: true,
        errmsg: 'No Data Found',
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
 * function to handle POST request to create a clientRegion based on clientID and get clientRegion tree data
 * @param {object} req
 * @param {object} res
 */
async function createClientRegion(req, res) {
  try {
    const data = JSON.parse(req.body.data);
    if (!data.clientId) {
      return res.send({
        error: true,
        errmsg: 'ClientID is required',
      });
    }
    const clientId = data.clientId;
    const clientResult = await Client.findById({ _id: clientId });
    const clientRegionResult = await clientRegion.create(data);
    if (
      clientRegionResult.name != 'Global' ||
      clientRegionResult.parentRegionId != null
    ) {
      clientResult.isRegionCompleted = true;
      await clientResult.save();
    }
    const result = await clientRegion
      .find({ clientId })
      .sort([['createdAt', 1]]);

    if (result.length == 0) {
      return res.send({
        success: true,
        message: 'No Records Found',
      });
    }

    //tree structure
    let array = JSON.parse(JSON.stringify(result));
    let clientRegionTreeData = await convert(array);
    return res.send({
      error: false,
      message: 'Record Inserted Successfully',
      data: clientRegionResult,
      treeData: clientRegionTreeData,
    });
  } catch (err) {
    return res.send({
      error: true,
      errmsg: err.message,
    });
  }
}

/**
 * function to handle PUT request to Update a clientRegion based on clientID and region Id and get clientRegion tree data
 * @param {object} req
 * @param {object} res
 */
async function updateClientRegion(req, res) {
  try {
    const data = JSON.parse(req.body.data);
    const clientId= data.clientId;
    const { id } = req.params;
    const result = await clientRegion.findByIdAndUpdate(id, data, {
      new: true,
    });
    const regionResult = await clientRegion
      .find({ clientId })
      .sort([['createdAt', 1]]);
      if (regionResult.length == 0) {
        return res.send({
          success: true,
          message: 'No Records Found',
        });
      }

    //tree structure
    let array = JSON.parse(JSON.stringify(regionResult));
    let clientRegionTreeData = await convert(array);
    return res.send({
      error: false,
      message: 'Updated Successfully',
      data: result,
      treeData:clientRegionTreeData
    });
  } catch (error) {
    return res.send({
      error: true,
      errmsg: error.message,
    });
  }
}

//************** Helper Functions for Tree Structure  ************/
function convert(array) {
  var map = {};
  for (var i = 0; i < array.length; i++) {
    var obj = array[i];
    obj.items = [];

    map[obj._id] = obj;

    var parent = obj.parentRegionId || '-';
    if (!map[parent]) {
      map[parent] = {
        items: [],
      };
    }
    map[parent].items.push(obj);
  }

  return map['-'].items;
}

module.exports = {
  getClientRegions,
  getClientRegion,
  clientGlobalRegion,
  clientRegionId,
  clientRegionByClientId,
  clientRegions,
  deleteClientRegion,
  updateClientRegion,
};
