
var mongoose = require("mongoose");
const util = require('../util/util');
var getFieldsInfo = function (combo, req) {
    var fieldsInfo = [];
    var select = [];
    var find = {};
    var multiSearch = false;
    var ObjectId = (require('mongoose').Types.ObjectId);
    switch (combo) {
        case "store":
            fieldsInfo.push({ field: '_id', alias: 'LookupId' });
            fieldsInfo.push({ field: 'name', alias: 'DisplayValue' });
            select.push(" _id");
            select.push(" name");
            break;
        case "role":
            fieldsInfo.push({ field: '_id', alias: 'LookupId' });
            fieldsInfo.push({ field: 'name', alias: 'DisplayValue' });
            select.push(" _id");
            select.push(" name");
            break;
        case "client":
            fieldsInfo.push({ field: '_id', alias: 'LookupId' });
            fieldsInfo.push({ field: 'name', alias: 'DisplayValue' });
            fieldsInfo.push({ field: 'theme', alias: 'theme' });
            fieldsInfo.push({ field: 'status', alias: 'status' });
            select.push(" _id");
            select.push(" name");
            select.push(" theme");
            select.push(" status");
            break;
        case "bookmarkType":
            fieldsInfo.push({ field: '_id', alias: 'LookupId' });
            fieldsInfo.push({ field: 'bookmarkType', alias: 'DisplayValue' });
            fieldsInfo.push({ field: 'bookmarkColor', alias: 'Color' });
            select.push(" _id");
            select.push(" bookmarkType");
            select.push(" bookmarkColor");
            break;        
        default:
            break;
    }
    return { fieldInfo: fieldsInfo, select: select, find: find, multiSearch: multiSearch };
}

var customizeData = function (combo, data) {
    return new Promise(function (resolve, reject) {
        let customizedData = [];
        let fieldInfo = getFieldsInfo(combo).fieldInfo;
        let multiSearch = getFieldsInfo(combo).multiSearch;
        for (var i = 0; i < data.length; i++) {
            var obj = {};
            for (var k = 0; k < fieldInfo.length; k++) {
                obj[fieldInfo[k].alias] = data[i][fieldInfo[k].field];
            }
            customizedData.push(obj);
        }
        resolve(customizedData);
    });
};

function GetComboData(combos, req) {
    var combosData = combos;
    return new Promise(function (resolveMain, rejectMain) {
        let combos = combosData;
        let comboData = {};
        let me = this;

        //Created a variable to collect all the promise 
        let promises = [];

        //Collect all the data from tables which are 
        for (var i = 0; i < combos.length; i++) {
            var combo = combos[i];
            promises.push(
                new Promise(function (combo, resolve, reject) {
                    var fieldData = getFieldsInfo(combo, req);
                    // var model = mongoose.model(combo);
                    var model;
                    model = mongoose.model(combo);
                    if (req.session.user && req.session.user._id) {
                        util.getUserDetail(req.session.user._id).then(function (data) {
                            if (data && data.clientId) {
                                var ObjectId = (require('mongoose').Types.ObjectId);
                                if (combo == "client") {
                                    fieldData.find._id = ObjectId(data.clientId);
                                }
                                if (combo == "store") {
                                    fieldData.find.clientId = ObjectId(data.clientId);
                                }
                                if (combo == "role") {
                                    fieldData.find.name = { "$ne": "Admin" }
                                }
                                if (combo == "bookmarkType") {
                                        fieldData.find.name = { "$ne": "Admin" }
                                }
                                                             
                            }
                            if (combo == "bookmarkType"&&req.body.client=='true') {
                                if(req.body.client=='true'){
                                    fieldData.find= { $or: [{ clientId: { $exists: false } }, { clientId: null }] }

                                } else{
                                    fieldData.find.name = { "$ne": "Admin" }

                                }
                            }
                            var query = model.find(fieldData.find).select(fieldData.select.join(' '));
                            query.lean().exec(function (err, data) {
                                if (!err) {
                                    customizeData(combo, data).then(function (cData) {
                                        comboData[combo] = cData;
                                        resolve();
                                    });
                                }
                            });
                        })

                    } else {
                        var query = model.find(fieldData.find).select(fieldData.select.join(' '));
                        query.lean().exec(function (err, data) {
                            if (!err) {
                                customizeData(combo, data).then(function (cData) {
                                    comboData[combo] = cData;
                                    resolve();
                                });
                            }
                        });
                    }

                }.bind(me, combo))
            );

        }
        //Send response when all the response has been collected.
        Promise.all(promises).then(function () {
            resolveMain(comboData);
        });
    })
}

/**
 * function to load values for select fields
 * @param {Array} combos 
 */
function loadCombo(req, res) {
    let combos = req.body.combos ? req.body.combos.split(',') : '';
    GetComboData(combos, req).then(function (data) {
        res.json(data);
    })
}

module.exports = { loadCombo, GetComboData };