const express = require('express');
var router = express.Router();
const userController = require('../controllers/usersList');
const storeController = require('../controllers/storeList');
const imageController = require('../controllers/imageController');
const siteController = require('../controllers/siteList');
const cameraController = require('../controllers/cameraList');
const facialRecController = require('../controllers/facialRec');
const timelinePlayerController = require('../controllers/timelinePlayer')();
const videoController = require('../controllers/videoController');
const activityLogController = require('../controllers/activityLogs');
const thumbnailController = require('../controllers/thumbnail')();
const receipt = require('../controllers/receipt');
const userFaceController = require('../controllers/userFace');
const bookMarkController = require('../controllers/bookMark');
const clientController = require('../controllers/clientList');
const preferenceController = require('../controllers/preference');
const dashboardConfig = require('../controllers/dashboardConfig');
const userPreferenceController = require('../controllers/userPreference');
const commonController = require('../routes/common');
const eventController = require('../controllers/event');
const videoClipController = require('../controllers/videoClip');
const tagController = require('../controllers/tagList');
const macAddressController = require('../controllers/macAddress');
const bookmarkTypeController = require('../controllers/bookmarkType');
const DataUpload = require('../controllers/DataUpload');
const KicController = require('../controllers/keyInCloud');
const Sera4Controller = require('../controllers/sera4');

router.route('/usersList')
    .get(userController.getUsers)
    .post(userController.getUsers);

router.route('/usersList/:id')
    .get(userController.getUser)
    .post(userController.getUser);

router.route('/saveUser')
    .get(userController.getUser)
    .post(userController.getUser);

router.route('/updateUser/:id?')
    .get(userController.getUser)
    .post(userController.getUser);

router.route('/deleteUser/:id?')
    .get(userController.getUser)
    .post(userController.getUser);

router.route('/storeList')
    .get(storeController.getStores)
    .post(storeController.getStores);

router.route('/storeList/:id')
    .get(storeController.getStore)
    .post(storeController.getStore);

router.route('/image')
    .get(imageController.getImage)
    .post(imageController.getImage);

router.route('/imageReceived/:storeId/:camId')
    .get(imageController.receiveImage)
    .post(imageController.receiveImage);


router.route('/siteList')
    .get(siteController.getSites)
    .post(siteController.getSites);

router.route('/siteList/:id')
    .get(siteController.getSite)
    .post(siteController.getSite);

router.route('/cameraList')
    .get(cameraController.getCameras)
    .post(cameraController.getCameras);

router.route('/cameraList/:id')
    .get(cameraController.getCamera)
    .post(cameraController.getCamera);

router.route('/siteData')
    .get(siteController.getStoreSites)
    .post(siteController.getStoreSites);

router.route('/getStoreListByUser')
    .get(storeController.getStoreListByUser)
    .post(storeController.getStoreListByUser);

router.route('/storeConnect')
    .get(storeController.storeConnect)
    .post(storeController.storeConnect);

router.route('/facialRec')
    .get(facialRecController.facialRec)
    .post(facialRecController.facialRec);

router.route('/facialRecPOST/:storeId/:camId')
    .get(facialRecController.facialRecPOST)
    .post(facialRecController.facialRecPOST);

router.route('/uploadVideo/:storeId/:camId')
    .get(videoController.upload)
    .post(videoController.upload);

router.route('/uploadAureus')
    .get(videoController.uploadAureus)
    .post(videoController.uploadAureus);

router.route('/uploadOverlayVideo')
    .get(videoController.uploadOverlayVideo)
    .post(videoController.uploadOverlayVideo);

router.route('/uploadThumbnails')
    .get(videoController.uploadThumbnails)
    .post(videoController.uploadThumbnails);

router.route('/activityLog')
    .get(activityLogController.activityLogData)
    .post(activityLogController.activityLogData);

router.route('/reponseTimelinePlayer')
    .get(timelinePlayerController.reponseTimelinePlayer)
    .post(timelinePlayerController.reponseTimelinePlayer);

router.route('/loadVideo/:storeId/:camId/:size/:dir/:video')
    .get(timelinePlayerController.loadVideo)
    .post(timelinePlayerController.loadVideo);

router.route('/loadVideo/:storeId/:camId/:size/:video')
    .get(timelinePlayerController.loadVideo)
    .post(timelinePlayerController.loadVideo);

router.route('/reponseTimelineVideo')
    .get(timelinePlayerController.reponseTimelineVideo)
    .post(timelinePlayerController.reponseTimelineVideo);

router.route('/loadThumbnail/:storeId/:camId/:video')
    .get(thumbnailController.loadThumbnail)
    .post(thumbnailController.loadThumbnail);

router.route('/reponseThumbnail')
    .get(thumbnailController.reponseThumbnail)
    .post(thumbnailController.reponseThumbnail);

router.route('/eventVideoThumbnail')
    .get(thumbnailController.eventVideoThumbnail)
    .post(thumbnailController.eventVideoThumbnail);

router.route('/event/:id')
    .get(receipt.event)
    .post(receipt.event);

router.route('/getUserFaces')
    .get(userFaceController.getUserFaces)
    .post(userFaceController.getUserFaces);

router.route('/getUserFaces/:id')
    .get(userFaceController.getUserFace)
    .post(userFaceController.getUserFace);

router.route('/facesThumbnail/:dir/:imageName')
    .get(imageController.facesThumbnail)
    .post(imageController.facesThumbnail);

router.route('/clientThumbnail/:width/:height?/:imageName/:version?')
    .get(imageController.clientThumbnail)
    .post(imageController.clientThumbnail);

router.route('/userProfile/:width/:height?/:imageName/:version?')
    .get(imageController.userProfile)
    .post(imageController.userProfile);

router.route('/getBookMarks')
    .get(bookMarkController.bookMarkData)
    .post(bookMarkController.bookMarkData);

router.route('/bookMark/:id')
    .get(bookMarkController.bookMarkData)
    .post(bookMarkController.bookMarkData);

router.route('/facialConfigDownload')
    .get(userFaceController.facialConfigDownload)
    .post(userFaceController.facialConfigDownload);

router.route('/getStoreId')
    .get(storeController.getStoreId)
    .post(storeController.getStoreId);

router.route('/clientList')
    .get(clientController.getClients)
    .post(clientController.getClients);

router.route('/clientList/:id')
    .get(clientController.getClient)
    .post(clientController.getClient);

router.route('/getNonProcessedEvents')
    .get(receipt.getNonProcessedEvents)
    .post(receipt.getNonProcessedEvents);

router.route('/rejectEvent')
    .get(receipt.rejectEvent)
    .post(receipt.rejectEvent);

router.route('/populateCameras')
    .get(cameraController.populateCameras)
    .post(cameraController.populateCameras);

router.route('/lastInvoiceId')
    .get(storeController.lastInvoiceId)
    .post(storeController.lastInvoiceId);

router.route('/POSDataInsert')
    .get(receipt.POSDataInsert)
    .post(receipt.POSDataInsert);
router.route('/RemoteLockDataInsert')
    .get(receipt.RemoteLockDataInsert)
    .post(receipt.RemoteLockDataInsert);
router.route('/GetLastInsertedAlarmEventId')
    .get(receipt.GetLastInsertedAlarmEventId)
    .post(receipt.GetLastInsertedAlarmEventId);
router.route('/updateCategoryData')
    .get(receipt.updateCategoryData)
    .post(receipt.updateCategoryData);

router.route('/preference')
    .get(preferenceController.handleAction)
    .post(preferenceController.handleAction);

router.route('/preference/:id')
    .get(preferenceController.handleAction)
    .post(preferenceController.handleAction);

router.route('/moniterCpuData')
    .get(storeController.moniterCpuData)
    .post(storeController.moniterCpuData);

router.route('/moniterMemoryData')
    .get(storeController.moniterMemoryData)
    .post(storeController.moniterMemoryData);

router.route('/getSmartDeviceTemperature')
    .get(storeController.getSmartDeviceTemperature)
    .post(storeController.getSmartDeviceTemperature);

router.route('/dashboardConfig')
    .get(dashboardConfig.handleAction)
    .post(dashboardConfig.handleAction);

router.route('/dashboardConfig/:id')
    .get(dashboardConfig.handleAction)
    .post(dashboardConfig.handleAction);

router.route('/getStoreCameras')
    .get(storeController.getStoreCameras)
    .post(storeController.getStoreCameras);

router.route('/saveUserPreference')
    .get(userPreferenceController.handleAction)
    .post(userPreferenceController.handleAction);

router.route('/mapThumbnail/:imageName/:version?')
    .get(imageController.mapThumbnail)
    .post(imageController.mapThumbnail);

router.route('/deletePreference')
    .get(userPreferenceController.handleAction)
    .post(userPreferenceController.handleAction);

router.route('/ptzRequest')
    .get(cameraController.ptzRequest)
    .post(cameraController.ptzRequest);

router.route('/galleryUpdatePing/:id')
    .get(userFaceController.facialConfigDownloadRequest)
    .post(userFaceController.facialConfigDownloadRequest);

router.route('/updateEventDetailData')
    .get(receipt.updateEventDetailData)
    .post(receipt.updateEventDetailData);

router.route('/getNonProcessedVideoClip')
    .get(videoClipController.getNonProcessedVideoClip)
    .post(videoClipController.getNonProcessedVideoClip);

router.route('/tagList')
    .get(tagController.getTagList)
    .post(tagController.getTagList);
router.route('/azureToken')
    .get(videoController.azureToken)
    .post(videoController.azureToken);


router.route('/macAddress/:id?')
    .get(macAddressController.macAddresses)
    .post(macAddressController.macAddresses);

router
    .route('/syncClipData')
    .get(videoClipController.syncClipData)
    .post(videoClipController.syncClipData);

router.route('/updateOldStreamAnt').get(cameraController.updateStreamAnt);
router.route('/updateOldStreamNMS').get(cameraController.updateStreamNMS);
router.route('/streamStatus')
    .get(cameraController.StreamStatus)
    .post(cameraController.StreamStatus);

router.route('/createCamera')
    .get(cameraController.createCamera)
    .post(cameraController.createCamera);

router.route('/getPublishUrl')
    .get(cameraController.getPublishUrl)
    .post(cameraController.getPublishUrl);

router.route('/restartOss')
    .get(storeController.restartOss)
    .post(storeController.restartOss);

router.route('/bookmarkType/:id?')
    .get(bookmarkTypeController.bookmarkType)
    .post(bookmarkTypeController.bookmarkType);

router.route('/UploadData').get(DataUpload.execute).post(DataUpload.execute);

router.route('/streamRegistered')
    .get(cameraController.streamRegistered)
    .post(cameraController.streamRegistered);

router.route('/deleteStream')
    .get(cameraController.deleteStream)
    .post(cameraController.deleteStream);

router.route('/sera4/getLocations').get(Sera4Controller.getLocations).post(Sera4Controller.getLocations);
router.route('/sera4/getSeraByLocation').get(Sera4Controller.getSeraByLocation).post(Sera4Controller.getSeraByLocation);

router.route('/kic/getLocations').get(KicController.getLocations).post(KicController.getLocations)
router.route('/kic/getDevices').get(KicController.getDevices).post(KicController.getDevices)
router.route('/kic/getAccount').get(KicController.getAccount).post(KicController.getAccount)
router.route('/kic/getEvents').get(KicController.getEvents).post(KicController.getEvents)
router.route('/kic/getDeviceByLocation').get(KicController.getDevicesByLocation).post(KicController.getDevicesByLocation)

module.exports = router;