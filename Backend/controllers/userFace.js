const restHandler = require('./restHandler')();
restHandler.setModelId('userFace');
const userFace = require('../modals/userFace');
const fs = require('fs-extra')
const util = require('./../util/util');
const fsextra = require('fs-extra');
const webSocket = require("../plugin/Socket");
String.prototype.toObjectId = function () {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return ObjectId(this.toString());
};
const logger = require('./../util/logger');

/**
 * function to handle GET request to receive all the locations
 * @param {object} req 
 * @param {object} res 
 */
function getUserFaces(req, res) {
    switch (req.body.action) {
        case 'export':
            restHandler.getExportRecord(req, res);
            break;
        default:
            restHandler.getResources(req, res, null, true);
            break;
    }
}

function moveFile(filePath, dir, data) {
    var oldPath = filePath;
    var filesArr = [];
    if (data.Files && data.Files.length > 0) {
        var files = data.Files || '';
        filesArr = files.split(',').filter(String);
    }
    var newPath = dir + "/" + filesArr[filesArr.length - 1];
    // Move File

    fsextra.move(oldPath, newPath, err => {
        if (err) return logger.error(err)
    })
}

function uploadImage(value, data, req) {
    var dir = "./Images/UserFaces/" + data.id;
    var filesArr = [];
    if (data.Files && data.Files.length > 0) {
        var files = data.Files || '';
        filesArr = files.split(',').filter(String);
    }
    var filePath = "./Images/UserFaces/" + filesArr[filesArr.length - 1];

    //Check directory exists or not

    if (!fs.existsSync(dir)) {
        //Create Directory
        fs.mkdirSync(dir);
        //Again Check Directory Created Successfully

        if (fs.existsSync(dir)) {
            moveFile(filePath, dir, data);
        }
    }
    else {
        moveFile(filePath, dir, data);
    }
}

function deleteImages(value, data, req) {
    var dir = "./Images/UserFaces/" + data.id;
    var filePath = dir + '/' + req.body.fileName;

    //Check directory exists or not
    if (fs.existsSync(filePath)) {
        fsextra.unlinkSync(filePath)
    }
}

function getUserFace(req, res) {
    switch (req.body.action) {
        case 'load':
            restHandler.getResource(req, res);
            break;
        case 'update':
            if (req.files && req.files.length > 0) {
                var data = JSON.parse(req.body.data);
                var files = data.Files || '';
                var filesArr = files.split(',').filter(String)
                req.files.forEach(element => {
                    filesArr.push(element.filename)
                });
                req.body.data = JSON.stringify(Object.assign({}, data, { Files: filesArr.join(',') }));
            }
            restHandler.updateResource(req, res, uploadImage);
            break;
        case 'save':
            if (req.files && req.files.length > 0) {
                var data = JSON.parse(req.body.data);
                var files = data.Files || '';
                var filesArr = files.split(',').filter(String)
                req.files.forEach(element => {
                    filesArr.push(element.filename)
                });

                req.body.data = JSON.stringify(Object.assign({}, data, { Files: filesArr.join(',') }));
            }
            restHandler.insertResource(req, res, uploadImage);
            break;
        case 'delete':
            restHandler.deleteResource(req, res);
            break;
        case 'imageDelete':
            var data = JSON.parse(req.body.data);
            var files = data.Files || '';
            var filesArr = files.split(',').filter(String)
            req.files.forEach(element => {
                filesArr.push(element.filename)
            });
            var imageIndex = filesArr.indexOf(req.body.fileName);
            if (imageIndex != -1) {
                filesArr.splice(imageIndex, 1);
            }
            req.body.data = JSON.stringify(Object.assign({}, data, { Files: filesArr.join(',') }));
            restHandler.updateResource(req, res, deleteImages);
            break;
        default:
            restHandler.getResource(req, res);
            break;
    }
}

/**
 * function to handle request to facial Config file Download 
 * @param {object} req 
 * @param {object} res 
 */
function facialConfigDownload(req, res) {
    let filePath = util.getDirectory('Temp') + "/AFR_Gallery.gal"; //Path Confirm and mention.
    fs.exists(filePath, (exists) => {
        if (exists) {
            res.download(filePath);
            return;
        }
        res.setHeader("Content-Type", "application/json");
        res.json({ success: false, message: 'File not found.' });
    });
}

function facialConfigDownloadRequest(req, res) {
    webSocket.BroadcastToOnsite({ action: 'facialConfigUpdate' })
    res.json({ success: true, message: 'Sent.' });
}

async function createRequiredDirectories(directory) {
    try {
        await fs.ensureDir(directory)
    } catch (err) {
        logger.error(err)
    }
}

module.exports = { getUserFaces, getUserFace, facialConfigDownload, createRequiredDirectories, facialConfigDownloadRequest };