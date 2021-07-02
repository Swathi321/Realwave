import FetchApi from '../httpUtil/fetchApi';
import api from '../httpUtil/serverApi';

export let getSalesData = new FetchApi({
  requestType: 'GET_SALES_DATA',
  url: api.SALES_DATA
});

export let loginAction = new FetchApi({
  requestType: 'Login',
  url: api.LOGIN
});

export let socialGoogleAction = new FetchApi({
  requestType: 'GOOGLEACTION',
  url: api.GOOGLEACTION
});

export let socialFacebookAction = new FetchApi({
  requestType: 'FACEBOOKACTION',
  url: api.FACEBOOKACTION
});

export let getReceipt = new FetchApi({
  requestType: 'GET_RECEIPT',
  url: api.GET_RECEIPT
});


export let getReceiptClip = new FetchApi({
  requestType: 'GET_RECEIPT_CLIP',
  url: api.GET_RECEIPT_CLIP
});


export let getNoSales = new FetchApi({
  requestType: 'GET_NO_SALES',
  url: api.GET_NO_SALES
});

export let getSales = new FetchApi({
  requestType: 'GET_SALES',
  url: api.GET_SALES
});

export let getVoidSales = new FetchApi({
  requestType: 'GET_VOID_SALES',
  url: api.GET_VOID_SALES
});

export let getDashboardData = new FetchApi({
  requestType: 'GET_DASHBOARD_DATA',
  url: api.GET_DASHBOARD_DATA
});

export let getSalesDashboard = new FetchApi({
  requestType: 'GET_SALES_DASHBOARD',
  url: api.GET_SALES_DASHBOARD
});

export let getWeeklySales = new FetchApi({
  requestType: 'GET_WEEKLY_SALES',
  url: api.GET_WEEKLY_SALES
});

export let getSavedSales = new FetchApi({
  requestType: 'GET_SAVED_SALES',
  url: api.GET_SAVED_SALES
});

export let getEventFeed = new FetchApi({
  requestType: 'GET_EVENT_FEED',
  url: api.GET_EVENT_FEED
});

export let getTopSellingItems = new FetchApi({
  requestType: 'GET_TOP_SELLING_ITEMS',
  url: api.GET_TOP_SELLING_ITEMS
});

export let getSuspiciousTransactions = new FetchApi({
  requestType: 'GET_SUSPICIOUS_TRANSACTIONS',
  url: api.GET_SUSPICIOUS_TRANSACTIONS
});

export let universalSearch = new FetchApi({
  requestType: 'UNIVERSAL_SEARCH',
  url: api.UNIVERSAL_SEARCH
});

export let gridUniversalSearch = new FetchApi({
  requestType: 'GRID_UNIVERSAL_SEARCH',
  url: api.GRID_UNIVERSAL_SEARCH
});

export let getRecentPromotions = new FetchApi({
  requestType: 'GET_RECENT_PROMOTIONS',
  url: api.GET_RECENT_PROMOTIONS
});

export let getCommentList = new FetchApi({
  requestType: 'GET_COMMENT_LIST',
  url: api.GET_COMMENT_LIST
});

export let getAlertCommentList = new FetchApi({
  requestType: 'GET_ALERT_COMMENT_LIST',
  url: api.GET_ALERT_COMMENT_LIST
});

export let addAlertComment = new FetchApi({
  requestType: 'ADD_ALERT_COMMENT',
  url: api.ADD_ALERT_COMMENT
});

export let addComment = new FetchApi({
  requestType: 'ADD_COMMENT',
  url: api.ADD_COMMENT
});

export let setNewPassword = new FetchApi({
  requestType: 'SET_NEW_PASSWORD',
  url: api.SET_NEW_PASSWORD
});

export let getTopSelling = new FetchApi({
  requestType: 'GET_TOP_SELLING',
  url: api.GET_TOP_SELLING
});

export let suspiciousTransactions = new FetchApi({
  requestType: 'GET_SUSPICIOUS_TRANSACTION',
  url: api.GET_SUSPICIOUS_TRANSACTION
});

export let checkValidForgotLink = new FetchApi({
  requestType: 'CHECK_VALID_FORGOT_LINK',
  url: api.CHECK_VALID_FORGOT_LINK
});

export let forgotPassword = new FetchApi({
  requestType: 'FORGOT_PASSWORD',
  url: api.FORGOT_PASSWORD
});

export let resetPassword = new FetchApi({
  requestType: 'RESET_PASSWORD',
  url: api.RESET_PASSWORD
});

export let userData = new FetchApi({
  requestType: 'USER_DATA',
  url: api.USER_DATA
});

export let saveUser = new FetchApi({
  requestType: 'SAVE_USER',
  url: api.SAVE_USER
});

export let roleListUser = new FetchApi({
  requestType: 'Role_List_User',
  url: api.ROLE_LIST_USER
});

export let getAdminRoles = new FetchApi({
  requestType: 'GET_ADMIN_ROLES',
  url: api.GET_ADMIN_ROLES
});

export let clientRegionStore = new FetchApi({
  requestType: 'Client_Region_Store',
  url: api.CLIENT_REGION_STORE
});

export let clientSystemSettings = new FetchApi({
  requestType: 'CLIENT_SYSTEM_SETTINGS',
  url: api.CLIENT_SYSTEM_SETTINGS
});

export let globalWidgetsReports = new FetchApi({
  requestType: 'GLOBAL_WIDGETS_REPORTS',
  url: api.GLOBAL_WIDGETS_REPORTS
});

export let updateClientRegion = new FetchApi({
  requestType: 'UPDATE_CLIENT_REGION',
  url: api.UPDATE_CLIENT_REGION
});

export let storeData = new FetchApi({
  requestType: 'STORE_DATA',
  url: api.STORE_DATA
});

export let siteSmartDevice = new FetchApi({
  requestType: 'POS',
  url: api.SITE_SMART_DEVICE
})

export let updateUser = new FetchApi({
  requestType: 'UPDATE_USER',
  url: api.UPDATE_USER
});

export let deleteUser = new FetchApi({
  requestType: 'DELETE_USER',
  url: api.DELETE_USER
});

export let getCombos = new FetchApi({
  requestType: 'COMBOS',
  url: api.COMBOS
});

export let cameraData = new FetchApi({
  requestType: 'CAMERA_DATA',
  url: api.CAMERA_DATA
});

export let cameraRecord = new FetchApi({
  requestType: 'CAMERA_RECORD',
  url: api.CAMERA_RECORD
});

export let storesData = new FetchApi({
  requestType: 'STORES_DATA',
  url: api.STORES_DATA
});

export let tagsData = new FetchApi({
  requestType: 'GET_TAGS',
  url: api.GET_TAGS
});

export let saveTagData = new FetchApi({
  requestType: 'SAVE_TAG',
  url: api.SAVE_TAG
});

export let updateReceipt = new FetchApi({
  requestType: 'UPDATE_RECEIPT',
  url: api.UPDATE_RECEIPT
});

export let videoShare = new FetchApi({
  requestType: 'VIDEO_SHARE',
  url: api.VIDEO_SHARE
});

export let getTemperature = new FetchApi({
  requestType: 'GET_TEMPERATURE',
  url: api.GET_TEMPERATURE
});

export let getStoreListAfterUserUpdate = new FetchApi({
  requestType: 'GETSTORELISTAFTERUSERUPDATE',
  url: api.GET_STORE_LIST_BY_USER
});

export let searchFilterList = new FetchApi({
  requestType: 'SEARCH_FILTER_LIST',
  url: api.SEARCH_FILTER_LIST
});

export let getDirectoriesAndLogs = new FetchApi({
  requestType: 'GET_DIRECTORIES_AND_LOGS',
  url: api.GET_DIRECTORIES_AND_LOGS
});

export let saveActivityLog = new FetchApi({
  requestType: 'SAVE_ACTIVITY_LOG',
  url: api.SAVE_ACTIVITY_LOG
});

export let getActivityLogs = new FetchApi({
  requestType: 'GET_ACTIVITY_LOGS',
  url: api.GET_ACTIVITY_LOGS
});
export let getTimelinePlayerData = new FetchApi({
  requestType: 'GET_TIMELINE_PLAYER_DATA',
  url: api.GET_TIMELINE_PLAYER_DATA
});

export let getUploadedFaces = new FetchApi({
  requestType: 'GET_UPLOADED_FACES',
  url: api.GET_UPLOADED_FACES
});

export let saveFace = new FetchApi({
  requestType: 'SAVE_FACE',
  url: api.SAVE_FACE
});

export let getFace = new FetchApi({
  requestType: 'GET_FACE',
  url: api.GET_FACE
});

export let saveBookmark = new FetchApi({
  requestType: 'SAVE_BOOKMARK',
  url: api.SAVE_BOOKMARK
});

export let getBookMarks = new FetchApi({
  requestType: 'GET_BOOKMARKS',
  url: api.GET_BOOKMARKS
});

export let deleteBookMarkData = new FetchApi({
  requestType: 'DELETE_BOOKMARK',
  url: api.DELETE_BOOKMARK
});

export let deleteFace = new FetchApi({
  requestType: 'DELETE_FACE',
  url: api.DELETE_FACE
});

export let getStoreCameras = new FetchApi({
  requestType: 'GET_STORE_CAMERAS',
  url: api.GET_STORE_CAMERAS
});

export let getStoreId = new FetchApi({
  requestType: 'GET_STORE_ID',
  url: api.GET_STORE_ID
});

export let clientData = new FetchApi({
  requestType: 'CLIENT_DATA',
  url: api.CLIENT_LIST
});

export let scaleReport = new FetchApi({
  requestType: 'GET_SCALES_DATA',
  url: api.GET_SCALES_DATA
})

export let kicReports = new FetchApi({
  requestType: 'GET_KIC_REPORTS',
  url: api.GET_KIC_REPORTS
})

export let clientProfile = new FetchApi({
  requestType: 'CLIENT_DATA',
  url: api.CLIENT_LIST
});

export let regionsByClientId = new FetchApi({
  requestType: 'GET_CLIENT_REGION',
  url: api.GET_CLIENT_REGION
});

export let deleteClientRegion = new FetchApi({
  requestType: 'DELETE_CLIENT_REGION',
  url: api.DELETE_CLIENT_REGION
});

export let clientDataType = new FetchApi({
  requestType: 'CLIENT_DATA_TYPE',
  url: api.CLIENT_LIST_TYPE
});

export let saveClient = new FetchApi({
  requestType: 'SAVE_CLIENT',
  url: api.CLIENT_LIST
});

export let saveClientRole = new FetchApi({
  requestType: 'SAVE_CLIENT_ROLE',
  url: api.CLIENT_ROLE
});

export let clientGlobalRegion = new FetchApi({
  requestType: 'CLIENT_GLOBAL_REGION',
  url: api.CLIENT_GLOBAL_REGION
});

// export let createClientProfile = new FetchApi({
//   requestType: 'createClientProfile',
//   url: api.CREATE_ROLE
// });

export let getEventFeedTimeline = new FetchApi({
  requestType: 'GET_EVENT_FEED_TIMELINE',
  url: api.GET_EVENT_FEED_TIMELINE
});

export let roleData = new FetchApi({
  requestType: 'ROLE_DATA',
  url: api.ROLE_LIST
});

export let getClientRoles = new FetchApi({
  requestType: 'CLIENT_ROLE_LIST',
  url: api.CLIENT_ROLE_LIST
});

export let getClientPermission = new FetchApi({
  requestType: 'CLIENT_PERMISSIONS',
  url: api.CLIENT_PERMISSIONS
});

export let saveRole = new FetchApi({
  requestType: 'SAVE_ROLE',
  url: api.ROLE_LIST
});
export let roleIdData = new FetchApi({
  requestType: 'ROLE_ID_DATA',
  url: api.ROLE_LIST
});
export let createRole = new FetchApi({
  requestType: 'createRole',
  url: api.CREATE_ROLE
});


export let permissionData = new FetchApi({
  requestType: 'PERMISSION_DATA',
  url: api.PERMISSION_LIST
});
export let permissionPageData = new FetchApi({
  requestType: 'PERMISSION_PAGE_DATA',
  url: api.PERMISSION_LIST_PAGE
});
export let permissionFunctionData = new FetchApi({
  requestType: 'PERMISSION_FUNCTION_DATA',
  url: api.PERMISSION_LIST_PAGE
});
export let permissionWidgetData = new FetchApi({
  requestType: 'PERMISSION_WIDGET_DATA',
  url: api.PERMISSION_LIST_WIDGET
});
export let permissionReportsData = new FetchApi({
  requestType: 'PERMISSION_REPORT_DATA',
  url: api.PERMISSION_LIST_REPORTS
});

export let updatePermissionData = new FetchApi({
  requestType: 'UPDATE_PERMISSION_DATA',
  url: api.UPDATE_PERMISSION_LIST
});
export let deleteRole = new FetchApi({
  requestType: 'DELETE_ROLE',
  url: api.DELETE_ROLE
});
export let userDetail = new FetchApi({
  requestType: 'USER_DETAIL',
  url: api.USER_DETAIL
});

export let userLogOut = new FetchApi({
  requestType: 'USER_LOGOUT',
  url: api.LOGOUT
});

export let overlayGraphData = new FetchApi({
  requestType: 'OVERLAY_GRAPH_DATA',
  url: api.OVERLAY_GRAPH_DATA
});

export let getFaceEvents = new FetchApi({
  requestType: 'GET_FACE_EVENTS',
  url: api.GET_FACE_EVENTS
});

export let preferenceData = new FetchApi({
  requestType: 'PREFERENCE_DATA',
  url: api.PREFERENCE_DATA
});
export let deleteCamPreference = new FetchApi({
  requestType: 'GET_DELETE_CAM_PREFERENCE',
  url: api.GET_DELETE_CAM_PREFERENCE
});
export let getSetEventLikeData = new FetchApi({
  requestType: 'GET_SET_EVENT_LIKE_DATA',
  url: api.GET_SET_EVENT_LIKE_DATA
});

export let alertData = new FetchApi({
  requestType: 'ALERT_DATA',
  url: api.ALERT_DATA
});

export let saveAlert = new FetchApi({
  requestType: 'SAVE_ALERT',
  url: api.ALERT_DATA
});

export let getSmartDeviceTemperature = new FetchApi({
  requestType: 'GET_SMART_DEVICE_TEMPERATURE',
  url: api.GET_SMART_DEVICE_TEMPERATURE
});

export let dashboardConfigAction = new FetchApi({
  requestType: 'DASHBOARD_CONFIG_ACTION',
  url: api.DASHBOARD_CONFIG_ACTION
});

export let smartDeviceData = new FetchApi({
  requestType: 'SMART_DEVICE_LOG_DATA',
  url: api.SMART_DEVICE_LOG
});

export let saveSmartDeviceData = new FetchApi({
  requestType: 'SAVE_SMART_DEVICE_LOG',
  url: api.SMART_DEVICE_LOG
});

export let alarmData = new FetchApi({
  requestType: 'ALARM_DATA',
  url: api.ALARM_DATA
});

export let saveAlarm = new FetchApi({
  requestType: 'SAVE_ALARM',
  url: api.ALARM_DATA
});

export let getAlarmCommentList = new FetchApi({
  requestType: 'GET_ALARM_COMMENT_LIST',
  url: api.GET_ALARM_COMMENT_LIST
});

export let addAlarmComment = new FetchApi({
  requestType: 'ADD_ALARM_COMMENT',
  url: api.ADD_ALARM_COMMENT
});

export let updateAlarm = new FetchApi({
  requestType: 'UPDATE_ALARM',
  url: api.UPDATE_ALARM
});

export let saveUserPreference = new FetchApi({
  requestType: 'SAVE_USER_PREFERENCE',
  url: api.SAVE_USER_PREFERENCE
});

export let getUserPreference = new FetchApi({
  requestType: 'GET_USER_PREFERENCE',
  url: api.GET_USER_PREFERENCE
});

export let deletePreference = new FetchApi({
  requestType: 'GET_DELETE_PREFERENCE',
  url: api.GET_DELETE_PREFERENCE
});

export let ptzRequest = new FetchApi({
  requestType: 'PTZ_REQUEST',
  url: api.PTZ_REQUEST
});

export let getCameraData = new FetchApi({
  requestType: 'GET_CAMERA_DATA',
  url: api.GET_CAMERA_DATA
});

export let getPeopleCount = new FetchApi({
  requestType: 'GET_PEOPLE_COUNT',
  url: api.GET_PEOPLE_COUNT
});

export let getLastTransation = new FetchApi({
  requestType: 'GET_LAST_TRANSATION',
  url: api.GET_LAST_TRANSATION
});

export let videoRecording = new FetchApi({
  requestType: 'VIDEO_RECORDING',
  url: api.CAMERA_DATA
});

export let getCameraLogs = new FetchApi({
  requestType: 'GET_CAMERA_LOGS',
  url: api.GET_CAMERA_LOGS
});

export let getPeopleCountWidget = new FetchApi({
  requestType: 'GET_PEOPLE_COUNT_WIDGET',
  url: api.GET_PEOPLE_COUNT_WIDGET
});

export let getCustomerCountChart = new FetchApi({
  requestType: 'GET_CUSTOMER_COUNT',
  url: api.GET_CUSTOMER_COUNT
});

export let getPeopleCountLogs = new FetchApi({
  requestType: 'GET_PEOPLE_COUNT_LOGS',
  url: api.GET_PEOPLE_COUNT_LOGS
});

export let createCustomVideoClip = new FetchApi({
  requestType: 'CREATE_CUSTOM_VIDEO_CLIP',
  url: api.CREATE_CUSTOM_VIDEO_CLIP
});

export let gridSearchImage = new FetchApi({
  requestType: 'GRID_SEARCH_IMAGE',
  url: api.GRID_SEARCH_IMAGE
});

export let getPendingVideoClip = new FetchApi({
  requestType: 'GET_PENDING_VIDEO_CLIP',
  url: api.GET_PENDING_VIDEO_CLIP
});

export let getCameraClipData = new FetchApi({
  requestType: 'GET_CAMERA_CLIP_DATA',
  url: api.GET_CAMERA_CLIP_DATA
});
export let checkVideoAvailable = new FetchApi({
  requestType: 'CHECK_VIDEO_AVAILABLE',
  url: api.CHECK_VIDEO_AVAILABLE
});
export let alarmEvent = new FetchApi({
  requestType: 'ALARM_EVENT',
  url: api.ALARM_EVENT
});
export let getspiritdata = new FetchApi({
  requestType: 'SPIRIT_DATA',
  url: api.DASHBOARD_DATA
});

export let macAddress = new FetchApi({
  requestType: 'MAC_ADDRESS',
  url: api.MAC_ADDRESS
});

export let startStream = new FetchApi({
  requestType: 'START_STREAM',
  url: api.START_STREAM
});

export let playbackRequest = new FetchApi({
  requestType: 'PLAYBACK_REQUEST',
  url: api.PLAYBACK_REQUEST
});

export let playbackStop = new FetchApi({
  requestType: 'PLAYBACK_STOP',
  url: api.PLAYBACK_STOP
});

export let daemon = new FetchApi({
  requestType: 'DAEMON',
  url: api.DAEMON
});

export let getIndustry = new FetchApi({
  requestType: 'GET_INDUSTRY',
  url: api.GET_INDUSTRY
});

export let getAllIndustries = new FetchApi({
  requestType: 'GET_ALL_INDUSTRY',
  url: api.GET_ALL_INDUSTRY
});

export let deleteSmartDevice = new FetchApi({
  requestType: 'DELETE_SMART_DEVICE',
  url: api.DELETE_SMART_DEVICE
});

export let deleteWidget = new FetchApi({
  requestType: 'DELETE_WIDGET',
  url: api.DELETE_WIDGET
});

export let deleteReport = new FetchApi({
  requestType: 'DELETE_REPORT',
  url: api.DELETE_REPORT
});

export let deleteIndustry = new FetchApi({
  requestType: 'DELETE_INDUSTRY',
  url: api.DELETE_INDUSTRY
});

export let getReport = new FetchApi({
  requestType: 'GET_REPORT',
  url: api.GET_REPORT
});

export let getWidget = new FetchApi({
  requestType: 'GET_WIDGET',
  url: api.GET_WIDGET
});

export let widgetByIndustryId = new FetchApi({
  requestType: 'GET_WIDGET_BY_INDUSRYID',
  url: api.GET_WIDGET_BY_INDUSRYID
});

export let getSmartDevice = new FetchApi({
  requestType: 'GET_SMART_DEVICE',
  url: api.GET_SMART_DEVICE
});

export let getsmartDeviceType = new FetchApi({
  requestType: 'GET_SMART_DEVICE_TYPE',
  url: api.GET_SMART_DEVICE_TYPE
});

export let getSmartDeviceTypes = new FetchApi({
  requestType: 'GET_SMART_DEVICE_TYPES',
  url: api.GET_SMART_DEVICE_TYPES
});

export let getWidgetsAndReports = new FetchApi({
  requestType: 'GET_WIDGETS_REPORTS',
  url: api.GET_WIDGETS_REPORTS
});

export let reverseSSH = new FetchApi({
  requestType: 'REVERSE_SSH',
  url: api.REVERSE_SSH
});

export let startSSHConnection = new FetchApi({
  requestType: 'startSSHConnection',
  url: api.START_SSH_CONNECTION
});

export let startVNC = new FetchApi({
  requestType: 'startVNC',
  url: api.startVNC
});

export let replaceSSHKey = new FetchApi({
  requestType: 'replaceSSHKey',
  url: api.replaceSSHKey
});

export let uploadSiteLogs = new FetchApi({
  requestType: 'UPLOAD_LOGS',
  url: api.uploadSiteLogs
});

export let bookmarkType = new FetchApi({
  requestType: 'BOOKMARK_TYPE',
  url: api.BOOKMARK_TYPE
});

export let bookmarkTypeClient = new FetchApi({
  requestType: 'BOOKMARK_TYPE_CLIENT',
  url: api.BOOKMARK_TYPE_CLIENT
});

export let cameraTags = new FetchApi({
  requestType: 'CAMERA_TAGS',
  url: api.CAMERA_TAGS
});

export let getRoiTags = new FetchApi({
  requestType: 'GET_ROI_TAGS',
  url: api.GET_ROI_TAGS
});

export let deleteClientCameraTags = new FetchApi({
  requestType: 'DELETE_CAMERA_TAGS',
  url: api.DELETE_CAMERA_TAGS
});

export let deleteClientBookmark = new FetchApi({
  requestType: 'DELETE_CLIENTBOOKMARK',
  url: api.DELETE_CLIENTBOOKMARK
});

export let getPlayUrl = new FetchApi({
  requestType: 'GET_PLAY_URL',
  url: api.GET_PLAY_URL
});

export let getSeraLocations = new FetchApi({
  requestType: 'GET_SERA_LOCATIONS',
  url: api.GET_SERA_LOCATIONS
});

export let getSeraByLocation = new FetchApi({
  requestType: "GET_SERA_BY_LOCATION",
  url: api.GET_SERA_BY_LOCATION
});

export let deleteSeraDevice = new FetchApi({
  requestType: 'DELETE_SERA_DEVICE',
  url: api.DELETE_SERA_DEVICE
});

export let getKIClocations = new FetchApi({
  requestType: 'GET_KIC_LOCATIONS',
  url: api.GET_KIC_LOCATIONS
});

export let getKICdeviceByLocation = new FetchApi({
  requestType: 'GET_KIC_DEVICE_BY_LOCATION',
  url: api.GET_KIC_DEVICE_BY_LOCATION
});

export let deleteKICDevice = new FetchApi({
  requestType: 'DELETE_KIC_DEVICE',
  url: api.DELETE_KIC_DEVICE
});

export let getLinkedLocationSites = new FetchApi({
  requestType: 'GET_LINKED_LOCATIONS',
  url: api.GET_LINKED_LOCATIONS
});

export let hasBoxRecentlyRestarted = new FetchApi({
  requestType: 'hasBoxRecentlyRestarted',
  url: api.hasBoxRecentlyRestarted
});