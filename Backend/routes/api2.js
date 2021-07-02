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
const roleController = require('../controllers/roleList');
const permissionController = require('../controllers/permissionList');
var logsController = require('../controllers/logs');
var eventLikeController = require('../controllers/eventLike');
var sales = require('../controllers/sales');
const preferenceController = require('../controllers/preference');
const alertController = require('../controllers/alertList');
const alarmController = require('../controllers/alarmList');
const dashboardConfig = require('../controllers/dashboardConfig');
const smartDeviceLogController = require('../controllers/smartDeviceLog');
const temperatureController = require('../controllers/temperature');
const userPreferenceController = require('../controllers/userPreference');
const eventController = require('./../controllers/event');
const videoClipController = require('./../controllers/videoClip');
const notificationController = require('../controllers/notifications');
const deviceConnectivityLogController = require('../controllers/deviceConnectivityLogList');
const widgetController = require('./../controllers/widget');
const industryController = require('./../controllers/industry');
const reportController = require('./../controllers/report');
const smartDeviceController = require('./../controllers/smartDevice');
const clientRegionController = require('./../controllers/clientRegions');
const roleList = require('../controllers/roleList');
const siteSmartDeviceController = require('../controllers/siteSmartDevice');
const siteNotificationController = require('../controllers/storeNotifications');
const deviceAlertController = require('../controllers/deviceAlert');
const scaleController = require('../controllers/scales');
const KICReportController = require('../controllers/kicReport');
const CameraTagsController = require('../controllers/cameraTags');
const RefreshSession = require('../controllers/refreshSession');
const AlarmReportController = require('../controllers/alarmReport');
const roiController = require('../controllers/roiMaster');


router
  .route('/usersList')
  .get(userController.getUsers)
  .post(userController.getUsers);

router
  .route('/usersList/:id')
  .get(userController.getUser)
  .post(userController.getUser);

router
  .route('/saveUser')
  .get(userController.getUser)
  .post(userController.getUser);

router
  .route('/updateUser/:id?')
  .get(userController.getUser)
  .post(userController.getUser);

router
  .route('/deleteUser/:id?')
  .get(userController.getUser)
  .post(userController.getUser);

router
  .route('/storeList')
  .get(storeController.getStores)
  .post(storeController.getStores);

router
  .route('/storeList/:id')
  .get(storeController.getStore)
  .post(storeController.getStore);

router
  .route('/image')
  .get(imageController.getImage)
  .post(imageController.getImage);

router
  .route('/imageReceived/:storeId/:camId')
  .get(imageController.receiveImage)
  .post(imageController.receiveImage);

router
  .route('/siteList')
  .get(siteController.getSites)
  .post(siteController.getSites);

router
  .route('/siteList/:id')
  .get(siteController.getSite)
  .post(siteController.getSite);

router
  .route('/cameraList')
  .get(cameraController.getCameras)
  .post(cameraController.getCameras);

router
  .route('/cameraList/:id')
  .get(cameraController.getCamera)
  .post(cameraController.getCamera);

router
  .route('/storesData')
  .get(siteController.getStoreSites)
  .post(siteController.getStoreSites);

router
  .route('/getStoreListByUser')
  .get(storeController.getStoreListByUser)
  .post(storeController.getStoreListByUser);

router
  .route('/storeConnect')
  .get(storeController.storeConnect)
  .post(storeController.storeConnect);

router
  .route('/facialRec')
  .get(facialRecController.facialRec)
  .post(facialRecController.facialRec);

router
  .route('/uploadVideo/:storeId/:camId')
  .get(videoController.upload)
  .post(videoController.upload);

router
  .route('/uploadAureus')
  .get(videoController.uploadAureus)
  .post(videoController.uploadAureus);

router
  .route('/uploadOverlayVideo')
  .get(videoController.uploadOverlayVideo)
  .post(videoController.uploadOverlayVideo);

router
  .route('/activityLog')
  .get(activityLogController.activityLogData)
  .post(activityLogController.activityLogData);

router
  .route('/reponseTimelinePlayer')
  .get(timelinePlayerController.reponseTimelinePlayer)
  .post(timelinePlayerController.reponseTimelinePlayer);

router
  .route('/loadVideo/:storeId/:camId/:size/:dir/:video')
  .get(timelinePlayerController.loadVideo)
  .post(timelinePlayerController.loadVideo);

router
  .route('/loadVideo/:storeId/:camId/:size/:video')
  .get(timelinePlayerController.loadVideo)
  .post(timelinePlayerController.loadVideo);

router
  .route('/reponseTimelineVideo')
  .get(timelinePlayerController.reponseTimelineVideo)
  .post(timelinePlayerController.reponseTimelineVideo);

router
  .route('/loadThumbnail/:storeId/:camId/:video')
  .get(thumbnailController.loadThumbnail)
  .post(thumbnailController.loadThumbnail);

router
  .route('/reponseThumbnail')
  .get(thumbnailController.reponseThumbnail)
  .post(thumbnailController.reponseThumbnail);

router
  .route('/eventVideoThumbnail')
  .get(thumbnailController.eventVideoThumbnail)
  .post(thumbnailController.eventVideoThumbnail);

router.route('/event/:id').get(receipt.event).post(receipt.event);

router
  .route('/getUserFaces')
  .get(userFaceController.getUserFaces)
  .post(userFaceController.getUserFaces);

router
  .route('/getUserFaces/:id')
  .get(userFaceController.getUserFace)
  .post(userFaceController.getUserFace);

router
  .route('/facesThumbnail/:dir/:imageName')
  .get(imageController.facesThumbnail)
  .post(imageController.facesThumbnail);

router
  .route('/getBookMarks')
  .get(bookMarkController.bookMarkData)
  .post(bookMarkController.bookMarkData);

router
  .route('/bookMark/:id')
  .get(bookMarkController.bookMarkData)
  .post(bookMarkController.bookMarkData);

router
  .route('/facialConfigDownload')
  .get(userFaceController.facialConfigDownload)
  .post(userFaceController.facialConfigDownload);

router
  .route('/getStoreId')
  .get(storeController.getStoreId)
  .post(storeController.getStoreId);

router
  .route('/clientList')
  .get(clientController.getClients)
  .post(clientController.getClients);

router
  .route('/clientList/:id')
  .get(clientController.getClient)
  .post(clientController.getClient);

router
  .route('/roleList')
  .get(roleController.getRoles)
  .post(roleController.getRoles);

router
  .route('/roleList/:id')
  .get(roleController.getRole)
  .post(roleController.getRole);

router
  .route('/permissionList')
  .get(permissionController.getPermissions)
  .post(permissionController.getPermissions);

router
  .route('/permissionList/:id')
  .get(permissionController.getPermission)
  .post(permissionController.getPermission);

router
  .route('/getDirectoriesAndLogs')
  .get(logsController.getDirectoriesAndLogs)
  .post(logsController.getDirectoriesAndLogs);

router
  .route('/getTopSellingItems')
  .get(sales.getTopSellingItems)
  .post(sales.getTopSellingItems);

router
  .route('/preference')
  .get(preferenceController.handleAction)
  .post(preferenceController.handleAction);

router
  .route('/preference/:id')
  .get(preferenceController.handleAction)
  .post(preferenceController.handleAction);

router
  .route('/deleteCamPreference')
  .get(preferenceController.handleAction)
  .post(preferenceController.handleAction);
router
  .route('/getSetEventLikeData')
  .get(eventLikeController.getSetEventLikeData)
  .post(eventLikeController.getSetEventLikeData);

router
  .route('/getAlert')
  .get(alertController.getAlerts)
  .post(alertController.getAlerts);

router
  .route('/getAlert/:id')
  .get(alertController.getAlert)
  .post(alertController.getAlert);

router
  .route('/getAlertCommentList')
  .get(alertController.getAlertCommentList)
  .post(alertController.getAlertCommentList);

router
  .route('/addAlertComment')
  .get(alertController.addAlertComment)
  .post(alertController.addAlertComment);

router
  .route('/dashboardConfig')
  .get(dashboardConfig.handleAction)
  .post(dashboardConfig.handleAction);

router
  .route('/dashboardConfig/:id')
  .get(dashboardConfig.handleAction)
  .post(dashboardConfig.handleAction);

router
  .route('/smartDeviceLog')
  .get(smartDeviceLogController.getSmartDeviceLogs)
  .post(smartDeviceLogController.getSmartDeviceLogs);

router
  .route('/smartDeviceLog/:id')
  .get(smartDeviceLogController.getSmartDeviceLog)
  .post(smartDeviceLogController.getSmartDeviceLog);

router
  .route('/getAlarm')
  .get(alarmController.getAlarms)
  .post(alarmController.getAlarms);

router
  .route('/getAlarm/:id')
  .get(alarmController.getAlarm)
  .post(alarmController.getAlarm);

router
  .route('/getAlarmCommentList')
  .get(alarmController.getAlarmCommentList)
  .post(alarmController.getAlarmCommentList);

router
  .route('/addAlarmComment')
  .get(alarmController.addAlarmComment)
  .post(alarmController.addAlarmComment);

router
  .route('/updateAlarm')
  .get(alarmController.updateAlarm)
  .post(alarmController.updateAlarm);

router
  .route('/temperature')
  .get(temperatureController.getTemperature)
  .post(temperatureController.getTemperature);

router
  .route('/getStoreCameras')
  .get(storeController.getStoreCameras)
  .post(storeController.getStoreCameras);

router
  .route('/saveUserPreference')
  .get(userPreferenceController.handleAction)
  .post(userPreferenceController.handleAction);

router
  .route('/getUserPreference')
  .get(userPreferenceController.handleAction)
  .post(userPreferenceController.handleAction);

router
  .route('/deletePreference')
  .get(userPreferenceController.handleAction)
  .post(userPreferenceController.handleAction);

router
  .route('/getLastTransation')
  .get(receipt.getLastTransation)
  .post(receipt.getLastTransation);

router
  .route('/createVideoClip')
  .get(videoClipController.createVideoClip)
  .post(videoClipController.createVideoClip);

router
  .route('/getPendingVideoClip/:id?')
  .get(videoClipController.getPendingVideoClip)
  .post(videoClipController.getPendingVideoClip);

router
  .route('/syncClipData')
  .get(videoClipController.syncClipData)
  .post(videoClipController.syncClipData);

router
  .route('/getNotifications')
  .get(notificationController.getNotifications)
  .post(notificationController.getNotifications);

router
  .route('/deviceConnectivity')
  .get(deviceConnectivityLogController.getDeviceConnectivities)
  .post(deviceConnectivityLogController.getDeviceConnectivities);

router
  .route('/deviceConnectivity/:id')
  .get(deviceConnectivityLogController.getDeviceConnectivity)
  .post(deviceConnectivityLogController.getDeviceConnectivity);

router
  .route('/startStream')
  .get(cameraController.startStream)
  .post(cameraController.startStream);

router
  .route('/playbackRequest')
  .get(cameraController.playbackRequest)
  .post(cameraController.playbackRequest);

router
  .route('/stopPlayback')
  .get(cameraController.stopPlayback)
  .post(cameraController.stopPlayback);

router
  .route('/daemon')
  .get(storeController.daemon)
  .post(storeController.daemon);

router
  .route('/widget')
  .get(widgetController.getWidgets)
  .post(widgetController.getWidgets);

router
  .route('/widget/:id')
  .get(widgetController.getWidget)
  .post(widgetController.getWidget);

router
  .route('/widgetByIndustryId')
  .post(widgetController.getWidgetByIndustryId);

router.route('/deleteWidget/:id').put(widgetController.deleteWidgetById);

router
  .route('/industry')
  .get(industryController.getIndustrys)
  .post(industryController.getIndustrys);

router
  .route('/industry/:id')
  .get(industryController.getIndustry)
  .post(industryController.getIndustry);

router
  .route('/deleteIndustry/:industryId')
  .put(industryController.deleteIndustryById);

router
  .route('/report')
  .get(reportController.getReports)
  .post(reportController.getReports);

router
  .route('/report/:id')
  .get(reportController.getReport)
  .post(reportController.getReport);

router
  .route('/reportByIndustryId')
  .post(reportController.getReportByIndustryId);

router.route('/deleteReport/:reportId').put(reportController.deleteReportById);

router
  .route('/smartDevice')
  .get(smartDeviceController.getSmartDevices)
  .post(smartDeviceController.getSmartDevices);

router
  .route('/smartDevice/:id')
  .get(smartDeviceController.getSmartDevice)
  .post(smartDeviceController.getSmartDevice);

router
  .route('/deleteSmartDevice/:id')
  .put(smartDeviceController.deleteSmartDeviceById);

router.route('/deleteRole/:id').put(roleController.deleteRole);

router
  .route('/clientRegion/:id')
  .get(clientRegionController.getClientRegion)
  .post(clientRegionController.getClientRegion);

router
  .route('/clientRegion')
  .get(clientRegionController.getClientRegions)
  .post(clientRegionController.getClientRegions);

router
  .route('/clientGlobalRegion')
  .post(clientRegionController.clientGlobalRegion);

router
  .route('/clientRegionId/:parentRegionId')
  .post(clientRegionController.clientRegionId);

router
  .route('/regionsByClientId/:clientId')
  .post(clientRegionController.clientRegionByClientId);

router.route('/getAdminRoles').post(roleController.getAdminRoles);

router.route('/clientRole/:clientID').post(clientController.clientRoles);

router
  .route('/clientSystemSettings/:clientID')
  .post(clientController.clientSystemSetting);

router
  .route('/getWidgetsAndReports')
  .post(industryController.getWidgetsAndReports);

router
  .route('/clientRegionStore/:clientId')
  .post(clientRegionController.clientRegions);

router.route('/getClientRoles/:clientId').post(clientController.getClientRoles);
router.route('/getClientPermission/:clientId').post(clientController.getClientRolePermission);


router
  .route('/deleteClientRegion')
  .put(clientRegionController.deleteClientRegion);
router
  .route('/updateClientRegion/:id')
  .put(clientRegionController.updateClientRegion);
router
  .route('/updateClientRole/:clientID')
  .post(clientController.updateClientRole);

router
  .route('/deleteClientRole/:clientID')
  .put(clientController.deleteClientRole);

router
  .route('/deleteClientBookmarks/:clientId')
  .post(clientController.deleteClientBookMarks);

router
  .route('/deleteClientCameraTags/:clientId')
  .post(clientController.deleteClientTags);

router
  .route('/getSmartDeviceTypes')
  .get(smartDeviceController.getSmartDeviceTypes);

router.route('/clientUsers/:clientID').get(clientController.getClientUsers);
router
  .route('/siteSmartDevice')
  .post(siteSmartDeviceController.getSiteSmartDevices);
router
  .route('/siteSmartDevice/:storeId')
  .get(siteSmartDeviceController.getSiteSmartDevices)
  .post(siteSmartDeviceController.createSiteSmartDevice);

router
  .route('/getSiteSmartDevice/:id')
  .post(siteSmartDeviceController.getSiteSmartDevice);

router
  .route('/updateSiteSmartDevice/:siteSmartDeviceID')
  .post(siteSmartDeviceController.updateSiteSmartDevice);

router
  .route('/deleteSiteSmartDevice/:siteSmartDeviceID')
  .post(siteSmartDeviceController.deLinkSiteSmartDevice);
router
  .route('/globalWidgetsReports')
  .post(widgetController.getGlobalWidgetsReports);

router.route('/getAllIndustries').get(industryController.getAllIndustries);
router.route('/getAllWidgets').get(widgetController.getAllWidgets);
router.route('/getAllReports').get(reportController.getAllReports);

router
  .route('/reverseShh')
  .get(storeController.reverseShh)
  .post(storeController.reverseShh);

router
  .route('/startVNC')
  .get(storeController.startVNC)
  .post(storeController.startVNC);

router
  .route('/replaceSSHKey')
  .get(storeController.replaceSSHKey)
  .post(storeController.replaceSSHKey);

router
  .route('/uploadLogs')
  .get(storeController.uploadLogs)
  .post(storeController.uploadLogs);

router
  .route('/siteScaleRules/:storeId')
  .post(siteNotificationController.getStoreNotificationRules);

router
  .route('/updatesiteScaleRules/:id')
  .post(siteNotificationController.updateStoreNotificationRules);

router
  .route('/updatesiteAlarm/:id')
  .post(siteNotificationController.updateSiteAlarmDevice);

// router
// .route('/updatesiteKicRules/:id')
// .post(siteNotificationController.updateKicEventRules);

router.route('/deviceAlert').post(deviceAlertController.sendDeviceAlert);

router.route('/scale').get(scaleController.scale).post(scaleController.scale);
router.route('/alarmReport').get(AlarmReportController.alarmReport).post(AlarmReportController.alarmReport);

router
  .route('/getSiteSmartDeviceList/:id')
  .post(siteSmartDeviceController.findSiteSmartDevice);

router
  .route('/getSiteSmartDeviceLists')
  .post(siteSmartDeviceController.findSiteSmartDevices);

// router
//   .route('/refreshSmartDevices')
//   .post(siteSmartDeviceController.refreshDevice);
router
  .route('/deleteKICDevice/:locationId')
  .post(siteSmartDeviceController.delinkKICDevice);

router
  .route('/deleteSeraDevice/:locationId')
  .post(siteSmartDeviceController.delinkSeraDevice);

router.route('/getLinkedLocationSites').post(siteSmartDeviceController.getLinkedSiteSmartDevices)

router.route('/kicReports').post(KICReportController.kicReport);

router.route('/cameraTags/:id')
  .get(CameraTagsController.getcameraTag)
  .post(CameraTagsController.getcameraTag);

router.route('/refreshSession')
  .get(RefreshSession.refreshSession)
  .post(RefreshSession.refreshSession);

router.route('/cameraReverseSSH')
  .get(cameraController.cameraReverseSSH)
  .post(cameraController.cameraReverseSSH);

router
  .route('/roiTags')
  .get(roiController.getRoiMasters)
  .post(roiController.getRoiMasters);

router
  .route('/roiTags/:id')
  .get(roiController.getRoiMaster)
  .post(roiController.getRoiMaster);

router.route('/hasBoxRecentlyRestarted')
  .get(storeController.hasBoxRecentlyRestarted)
  .post(storeController.hasBoxRecentlyRestarted);

module.exports = router;
