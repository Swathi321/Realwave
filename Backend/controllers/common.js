const crypto = require('crypto');
var moment = require('moment');
const logger = require('./../util/logger');
const Client = require('../modals/client');
const Store = require('../modals/store');

module.exports = {
  getData(req, res, restHandler) {
    switch (req.body.action) {
      case 'load':
        restHandler.getResource(req, res);
        break;
      case 'update':
        if (req.files && req.files.length > 0) {
          var data = JSON.parse(req.body.data);
          var userProfile = data.userProfile;
          req.files.forEach((element) => {
            userProfile = element.filename;
          });
          req.body.data = JSON.stringify(
            Object.assign({}, data, { userProfile: userProfile })
          );
        }
        restHandler.updateResource(req, res);
        break;
      case 'save':
        if (req.files && req.files.length > 0) {
          var data = JSON.parse(req.body.data);
          var userProfile = data.userProfile;
          req.files.forEach((element) => {
            userProfile = element.filename;
          });
          req.body.data = JSON.stringify(
            Object.assign({}, data, { userProfile: userProfile })
          );
        }
        restHandler.insertResource(req, res);
        break;
      case 'delete':
        restHandler.deleteResource(req, res);
        break;
      case 'list':
        restHandler.getResources(req, res);
        break;
      default:
        restHandler.getResource(req, res);
        break;
    }
  },

  applySortingAndFilteringInQuery(
    res,
    data,
    query,
    defaultSort,
    sortDir,
    isUniversalSearch
  ) {
    var pageNo = data.page ? parseInt(data.page) : 1;
    var size = data.pageSize
      ? parseInt(data.pageSize)
      : isUniversalSearch
      ? 100
      : 10;
    if (pageNo <= 0) {
      res.json({
        error: true,
        message: 'invalid page number, should start with 1',
      });
      return false;
    }
    if (data.sort && data.sort != 'undefined') {
      defaultSort = data.sort;
      sortDir = data.sortDir;
    }
    query.sort = {
      [defaultSort]: sortDir == 'DESC' ? -1 : 1,
    };
    query.skip = size * (pageNo - 1);
    if (data.pageSize && data.pageSize != 0) {
      query.limit = size;
    }
    return query;
  },

  addComment(req, res, reqModal, modalName, requestId) {
    var params = Object.assign({}, req.body, req.query);
    var resp = {};
    const newComment = new reqModal({
      comment: params.comment,
      rating: params.rating,
      [requestId]: params.id,
      userId: params.userId,
    });

    newComment.save().then((data, error) => {
      if (error) {
        resp['success'] = false;
        resp['error'] = error;
        res.status(200).json(resp);
        return;
      }
      modalName.findById({ _id: params.id }, (err, data) => {
        if (data) {
          Object.assign(data, {
            comment: params.comment,
            rating: params.rating,
          }).save((err, data) => {
            resp['success'] = true;
            resp['message'] = 'Thanks for rating/comment.';
            res.status(200).json(resp);
          });
        } else {
          resp['success'] = true;
          resp['message'] = 'Thanks for rating/comment.';
          res.status(200).json(resp);
        }
      });
    });
  },

  getListData(
    req,
    res,
    restHandler,
    dashBoard,
    util,
    primaryField,
    ignoreStoreFilter
  ) {
    dashBoard.getStores(req, res).then(async function (storeFilter) {
      var defaultFilter = [];
      if (
        storeFilter.role == util.Role.ClientAdmin ||
        storeFilter.userRoleStatus.isClientAdminRole
      ) {
        defaultFilter.push({
          clientId: storeFilter.clientId,
        });
      } else {
        defaultFilter.push({
          [primaryField]: {
            $in: storeFilter.stores.map(function (strVale) {
              return strVale._id;
            }),
          },
        });
      }

      if (
        ignoreStoreFilter &&
        (storeFilter.role == util.Role.Admin ||
          storeFilter.userRoleStatus.isAdminRole) &&
        !storeFilter.isTags
      ) {
        defaultFilter = [];
      }

      if (
        ignoreStoreFilter &&
        (storeFilter.role == util.Role.ClientAdmin ||
          storeFilter.userRoleStatus.isClientAdminRole) &&
        !storeFilter.isTags
      ) {
        defaultFilter.push({
          roleId: {
            $nin: [require('mongoose').Types.ObjectId(util.AdminRoleId)],
          },
        });
      }

      //for Installer and Direct client Type
      if (storeFilter.clientId) {
        const storeData = await userInstallerList(
          storeFilter.clientId,
          storeFilter
        );

        // defaultFilter[0].clientId['$in'] =
        //   defaultFilter[0].storeId && defaultFilter[0].storeId['$in']
        //     ? storeData
        //     : defaultFilter.push({
        //         clientId: {
        //           $in: storeData,
        //         },
        //       });
        if (defaultFilter[0].storeId) {
          if(defaultFilter[0].storeId['$in'].length>=0){
            delete defaultFilter[0].storeId
          }
          let clientId={}
          defaultFilter[0].clientId=clientId
          defaultFilter[0].clientId['$in'] = storeData;
        }  
       else  {
          defaultFilter.push({
            clientId: storeFilter.clientId,
          });
       }
      }
      util
        .getAllStoreIds(req, res, defaultFilter)
        .then(function (storeCamData) {
          defaultFilter = util.getDefaultFilters(storeCamData, defaultFilter);
          switch (req.body.action) {
            case 'export':
              restHandler.getExportRecord(req, res, null, null, defaultFilter);
              break;
            default:
              restHandler.getResources(req, res, null, null, defaultFilter);
              break;
          }
        });
    });
  },
  updateGridFilters(filters, find, scope) {
    let allFilters = JSON.parse(filters);
    var me = scope;
    if (Array.isArray(allFilters)) {
      allFilters.forEach(function (filter) {
        if (filter.property.indexOf('.') <= 0 && filter.gridFilter) {
          filter.value = filter.gridFilterValue;
          me.addFilter(filter, find, '$and');
        }
      });
    }
    return find;
  },
  async sha256(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  },

  async isAuthenticated(token, storeId) {
    let encryptedValue = await this.sha256(storeId + process.env.secretKey);
    return token.toLowerCase() == encryptedValue.toLowerCase();
  },

  async decrypt(text) {
    let key = 'YFpoGQ@$ZaMNK92tZ9eg^RiaQSZ^Pw%*';
    try {
      let textParts = text.split(':');
      let iv = Buffer.from(textParts.shift(), 'hex');
      let encryptedText = Buffer.from(textParts.join(':'), 'hex');
      let decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(key),
        iv
      );
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      let validityTime = decrypted.toString();
      return (
        moment(validityTime).utc() >
        moment(moment.utc().format('M/D/YYYY hh:mm:ss A'))
      );
    } catch (err) {
      logger.log('Decryption failed for provided string');
      return false;
    }
  },
};
//for checking installer
async function userInstallerList(clientData, storeFilter) {
  let query = {
    $or: [{ _id: clientData }, { installerId: clientData }],
  };
  let storeList = [];

  let clientResult = await Client.find(query);
  if (clientResult.length > 0) {
    let clientList = clientResult.map((ele) => ele._id);
    // {
    // if (
    //   ele.clientType == 'installer' ||
    //   ele.clientType == 'thirdparty' ||
    //   storeFilter.userRoleData.isInstallerRole
    // ) {
    //   return ele._id;
    // }
    // if (ele.clientType == 'direct') {
    //   return ele._id;
    // }

    // console.log('test2', ele._id);
    // });
    
    for (let ele of clientList) {
      let storeResult = await Store.find({ clientId: ele });
      let storeResult1 = JSON.parse(JSON.stringify(storeResult));
      storeResult1.map((e) => {
        storeList.push(e._id);
      });
    }

    return clientList;
  }
}
