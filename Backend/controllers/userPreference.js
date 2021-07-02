
const restHandler = require('./restHandler')();
restHandler.setModelId('userPreference');
var userPreference = require('./../modals/userPreference');

String.prototype.toObjectId = function () {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return ObjectId(this.toString());
};

/**
 * function to handle GET request to receive all the locations
 * @param {object} req 
 * @param {object} res 
 */
function handleAction(req, res) {
    switch (req.body.action) {
        case 'load':
            getPreference(req, res);
            break;
        case 'save':
            savePreference(req, res);
            break;
        case 'delete':
            let params = Object.assign({}, req.body, req.query, req.params);
            req.params = params;
            restHandler.deleteResource(req, res)
            break;
        default:
            res.status(403).json({ success: false, message: "Invalid request." });
            break;
    }
}

function saveUpdate(req, res) {
    let params = Object.assign({}, req.body, req.query, req.params);
    let { id, name, description, checkDefault } = params;
    userPreference.findById(id, (err, preference) => {
        if (err) {
            response.message = err.message;
            res.json(response);
            return;
        }
        if (!preference) {
            res.json(response);
            return;
        }
        Object.assign(preference, { name: name, description: description, checkDefault: checkDefault }).save((err, data) => {
            if (err) {
                res.send(err);
                return;
            }
            res.json({ message: "Record updated successfully.", data, success: true });
        });
    });
}

/**
 * Save User Preference 
 * @param {*} req 
 * @param {*} res 
 */

function savePreference(req, res) {
    let params = Object.assign({}, req.body, req.query, req.params);
    let { id, info, prefName, type, name, description, checkDefault } = params, userId = req.session.user._id;
    let data = {};
    data.userId = userId;
    data.prefName = prefName;
    data.isDeleted = false;
    data.info = info;
    data.type = type || 'grid'
    data.name = name;
    data.description = description;
    data.checkDefault = checkDefault;
    req.body.data = JSON.stringify(data);
    if (id && id != "undefined") {
        if (checkDefault == 'true') {
            userPreference.updateMany({ userId, prefName, checkDefault: 'true' }, { $set: { checkDefault: 'false' } }, (er, updatePreference) => {
                if (er) {
                    response.message = er.message;
                    res.json(response);
                    return;
                }
                saveUpdate(req, res);
            })
        } else {
            saveUpdate(req, res);
        }
    }
    else {
        if (checkDefault == 'true') {
            userPreference.updateMany({ userId, prefName, checkDefault: 'true' }, { $set: { checkDefault: 'false' } }, (er, updatePreference) => {
                if (er) {
                    response.message = er.message;
                    res.json(response);
                    return;
                }
                restHandler.insertResource(req, res);
            });
        } else {
            restHandler.insertResource(req, res);
        }
    };
}

/**
 * Get User Preference
 * @param {*} req 
 * @param {*} res 
 */
function getPreference(req, res) {
    let params = Object.assign({}, req.body, req.query, req.params);
    let { prefName, type } = params;
    let userId = req.session.user._id;
    let response = { success: false, message: "" };
    userPreference.find({ userId, prefName, type }, (err, preference) => {
        if (err) {
            response.message = err.message;
            res.json(response);
            return;
        }
        if (!preference) {
            res.json(response);
            return;
        }
        response.success = true;
        response.data = preference;
        res.json(response);
    }).sort({ _id: -1 });
}

module.exports = { handleAction };