var fs = require('fs');
var util = require('./../util/util');
const logger = require('./../util/logger');
var Store = require('./../modals/store');
var SiteLogs = require('./../modals/SiteLogs');
var moment = require("moment");
const path = require('path');
const restHandler = require('./restHandler')();
restHandler.setModelId('siteLogs');
const azure = require('azure-storage');
const config = require('./../config');
const dashboard = require("./dashboard")
var blobService = azure.createBlobService(config.azure.account, config.azure.key);


String.prototype.toObjectId = function () {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return ObjectId(this.toString());
};
/**
 * function to handle POST request to upload log files from onsite server
 * @param {object} req 
 * @param {object} res 
 */
function uploadLogs(req, res) {
    let serverFileName = req.header("content-disposition").split('filename')[0];
    let storeId = serverFileName.split("_")[0];
    let storeLogDir = `${path.resolve('storeLogs')}/${storeId}`;
    //Create records directory if not exist
    if (!fs.existsSync(storeLogDir)) { fs.mkdirSync(storeLogDir, { recursive: true }) };

    //filePath - file where to create and will be available
    let filePath = storeLogDir + '/' + serverFileName;
    //First creating the file from the request
    fs.open(filePath, 'w', function (err, fd) {
        if (err) {
            throw 'error opening file: ' + err;
        }
        //writing the file from the request body
        fs.write(fd, req.body, 0, req.body.length, null, function (err) {
            if (err) throw 'error writing file: ' + err;
            fs.close(fd, function () {
                res.json({ success: true });
            });


            let extension = path.extname(serverFileName); // file extension
            let fileDateTime = serverFileName.split('_')[1];  // file name split in array for get date
            //File Date need to use for creating folder of particular date || If folder exist then it will upload in same folder
            let fileDate = moment.utc(fileDateTime, 'YYYY-MM-DD-HH-mm-ss').format(util.dateFormat.dateFolderName);
            // path to create file on azure
            let azureZipFileName = path.join(storeId, fileDate, util.zipPath, serverFileName); // Create path: storeId/date/zip/fileName.jpg.
            // console.log("Zip file to be uploaded on Azure : " + serverFileName.toString());
            //Check if containter exist on azure or not || If not then create 
            blobService.createContainerIfNotExists(config.azure.container, {
                publicAccessLevel: 'blob'
            }, function (createError, createResult, createResponse) {
                if (createError) {
                    response.message = createError.message;
                    res.json(response);
                    logger.error(createError.message);
                    return;
                }

                blobService.createBlockBlobFromLocalFile(config.azure.container, azureZipFileName, filePath,
                    function (zipFileUploadError, zipFileUploadResult, zipFileUploadResponse) {
                        if (zipFileUploadError) {
                            response.message = zipFileUploadError.message;
                            res.json(response);
                            logger.error(zipFileUploadError.message);
                            return;
                        }
                        else if (zipFileUploadResponse && zipFileUploadResponse.isSuccessful) {
                            //if file uploaded successfully then delete zip file created
                            fs.exists(filePath, (exists) => {
                                if (exists) {
                                    fs.unlinkSync(`${filePath}`);
                                }

                            })
                        }
                    }
                );
            });

            let fileSizeInBytes = fs.statSync(filePath).size;
            SiteLogs.insertMany({ fileName: serverFileName, extension: extension, fileSize: fileSizeInBytes, storeId: storeId });
        });
    });
}

function getDirectoriesAndLogs(req, res) {
    dashboard.getStores(req, res).then(function (storeFilter) {
        let match = {
            "_stores._id": { $in: storeFilter.stores.map(function (strVale) { return strVale._id }) }
        };
        var data = Object.assign({}, req.body, req.query);
        var find = restHandler.functionApplyFilters(data.filters, data.filterText ? true : false, restHandler._ModelId);
        find = data.filters ? restHandler.updateGridFilters(data.filters, find, restHandler._ModelId) : find;
        var modelFind = { $and: find.$and, $or: find.$or };
        modelFind.$and.push(match);
        if (modelFind.$and.length === 0) {
            delete modelFind["$and"];
        }

        if (modelFind.$or.length === 0) {
            delete modelFind["$or"];
        }
        let response = { success: true, message: "", data: null, combos: [], total: 0 };
        let directoryName = data.directoryName;
        let directoryPath = '';
        var defaultSort = "createdAt";
        var sortDir = "DESC";
        if (data.sort && data.sort != 'undefined') {
            defaultSort = data.sort;
            var sortData = data.sort.split('.');
            if (sortData.length > 0) {
                defaultSort = sortData[sortData.length - 1];
            }
            sortDir = data.sortDir;
        }
        if (directoryName) {
            directoryPath = path.join(__dirname, '../storeLogs', directoryName);
        }
        switch (data.action) {
            case 'getDirectories':

                SiteLogs.aggregate([
                    { $lookup: { from: 'store', localField: 'storeId', foreignField: '_id', as: '_stores' } },
                    { "$unwind": "$_stores" },
                    {
                        $match: modelFind,
                    },
                    {
                        $group: {
                            "_id": '$storeId',
                            count: { $sum: 1 },
                            name: { $last: '$_stores.name' },
                            address: { $last: '$_stores.address' },
                            city: { $last: '$_stores.city' },
                            state: { $last: '$_stores.state' },
                            country: { $last: '$_stores.country' },
                            createdAt: { $last: '$createdAt' }
                        }
                    },
                    {
                        $facet: {
                            records: [
                                { $sort: { [defaultSort]: sortDir == "ASC" ? 1 : -1 } },
                                { $skip: (Number(data.page) - 1) * Number(data.pageSize) },
                                { $limit: Number(data.pageSize) }
                            ],
                            pageInfo: [
                                { $group: { _id: null, count: { $sum: 1 } } },
                            ]
                        }
                    }]).then((storeLogs, error) => {
                        response.message = error;
                        response.success = false;
                        let countLogs = storeLogs[0].pageInfo[0] && storeLogs[0].pageInfo[0].count || 0;
                        if (!error) {
                            response.data = storeLogs[0].records;
                            response.recordCount = countLogs;
                            response.success = true;
                        }
                        res.status(200).json(response);
                    });
                break;
            case 'getLogs':
                let storeId = data.directoryName;

                Store.findById({ _id: util.mongooseObjectId(storeId) }, (err, storeData) => {
                    if (err) {
                        response.success = false;
                        response.message = err.message;
                        res.json(response);
                        return;
                    }
                    if (!storeData) {
                        response.success = false;
                        response.message = 'Store not found.';
                        res.json(response);
                        return;
                    }
                    let sendCombineData = function (retResponse, res) {
                        if (!retResponse || !res) {
                            response.success = false;
                            response.message = 'Store not found.';
                            res.json(response);
                            return;
                        }
                        retResponse.storeData = storeData;
                        res.json(retResponse);
                    }
                    restHandler.getResources(req, res, sendCombineData);
                });
                break;
            case 'download':
                var fileName = data.fileName;
                if (directoryPath && fileName) {
                    let fileDateTime = fileName.split('_')[1];  // file name split in array for get date
                    //File Date need to use for creating folder of particular date || If folder exist then it will upload in same folder
                    let storeId = directoryName,
                        eventDate = moment.utc(fileDateTime, util.dateFormat.zipFileDateTimeFormat).format(util.dateFormat.dateFolderName),
                        azureZipFileName = path.join(storeId, eventDate, util.zipPath, fileName); // Create path: storeId/date/thumbnails/eventId.png. 

                    // Read file stream from Azure.
                    blobService.getBlobProperties(config.azure.container, azureZipFileName,
                        function (err, properties, status) {
                            if (err) {
                                res.send(502, "Error fetching file: %s", err.message);
                            } else if (!status.isSuccessful) {
                                res.send(404, "The file %s does not exist", fileName);
                            } else {
                                res.header('Content-Disposition', 'attachment; filename=' + fileName);
                                blobService.createReadStream(config.azure.container, azureZipFileName).pipe(res);
                            }
                        });
                }
                break;
            default:
                break;

        }
    })
}

/**
 * function to handle POST request to upload log files from onsite server
 * @param {object} req 
 * @param {object} res 
 */
function uploadLogsCore(req, res) {
    let response = { success: false, message: null };
    if (req.files.length > 0) {
        let serverFileName = req.files[0].filename;
        let storeId = serverFileName.split("_")[0];

        let extension = path.extname(serverFileName); // file extension
        let fileDateTime = serverFileName.split('_')[1];  // file name split in array for get date
        //File Date need to use for creating folder of particular date || If folder exist then it will upload in same folder
        let fileDate = moment.utc(fileDateTime, 'YYYY-MM-DD-HH-mm-ss').format(util.dateFormat.dateFolderName);
        // path to create file on azure
        let azureZipFileName = path.join(storeId, fileDate, util.zipPath, serverFileName); // Create path: storeId/date/zip/fileName.jpg.
        // console.log("Zip file to be uploaded on Azure : " + serverFileName.toString());
        //Check if containter exist on azure or not || If not then create 

        let filePath = path.resolve(`Temp/${serverFileName}`);

        blobService.createContainerIfNotExists(config.azure.container, { publicAccessLevel: 'blob' }, (createError, createResult, createResponse) => {
            if (createError) {
                response.message = createError.message;
                logger.error(response.message);
                res.json(response);
                return;
            }

            blobService.createBlockBlobFromLocalFile(config.azure.container, azureZipFileName, filePath,
                (zipFileUploadError, zipFileUploadResult, zipFileUploadResponse) => {
                    if (zipFileUploadError) {
                        response.message = zipFileUploadError.message;
                        logger.error(response.message);
                        return;
                    } else if (zipFileUploadResponse && zipFileUploadResponse.isSuccessful) {
                        //if file uploaded successfully then delete zip file created
                        let fileSizeInBytes = fs.statSync(filePath);
                        SiteLogs.insertMany({
                            fileName: serverFileName,
                            extension: extension,
                            fileSize: fileSizeInBytes.size,
                            storeId: storeId
                        });
                        fs.unlinkSync(`${filePath}`);
                        response.success = true;
                        response.message = "Store log file successfully uploaded on azure";
                    }
                    res.json(response);
                }
            );
        });
    } else {
        response.success = false;
        response.message = "There is no in this request";
        res.json(response);
    }
}

module.exports = { uploadLogs, getDirectoriesAndLogs, uploadLogsCore };