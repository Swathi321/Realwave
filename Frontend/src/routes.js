import DefaultLayout from './containers/DefaultLayout';
import Dashboard from './views/Dashboard/Dashboard';
import Sales from './views/Sales';
import EventFeed from './views/EventFeed/EventFeed';
import LiveVideo from './views/LiveVideo/LiveVideo';
import TopSelling from './views/Sales/TopSelling';
import RecentPromotions from './views/Promotion/RecentPromotions';
import SearchResult from './views/Search/search';
import ChangePassword from './views/ChangePassword/changePassword';
import Page404 from './views/Pages/Page404';
import Users from './views/User/Users';
import UserForm from './views/User/UserForm';
import AddUserForm from './views/User/AddUserForm';
import Store from './views/Store/Store';
import addStore from './views/Store/AddStore';
import addCamera from './views/Camera/AddCamera';
import SmartDevice from './views/Camera/SmartDevice';
import LogsDirectories from './views/Store/LogsDirectories';
import Logs from './views/Store/Logs';
import ActivityLog from './views/ActivityLog/ActivityLog';
import Timeline from './views/Timeline';
import UserFaces from './views/User/UserFaces';
import AddFace from './views/User/AddFace';
import Cameras from './views/LiveVideo/Cameras';
import Clients from './views/Client/Client';
import ClientForm from './views/Client/clientProfile';
import ClientRole from './views/Client/ClientRole';
import ClientRegion from './views/Client/clientRegion';
import ClientSettings from './views/Client/clientSettings';
import Role from './views/Role/Role';
import RoleForm from './views/Role/RoleForm';
import Configuration from './views/Configuration/Configuration';
import IndustryForm from './views/Configuration/IndustryForm';
import ReportForm from './views/Configuration/ReportForm';
import WidgetForm from './views/Configuration/WidgetForm';
import SmartDeviceForm from './views/Configuration/SmartDeviceForm';
import SiteSmartDeviceForm from './views/Camera/SiteSmartDeviceForm'
import FaceEvents from './views/Face Events/FaceEvents';
import Monitor from './views/Store/Monitor';
import MonitorSummary from './views/Store/MonitorSummary';
import MapView from './views/MapView/MapView';
import Alert from './views/Alert/Alert';
import Alarm from './views/Alarm/Alarm';
import VideoClips from './views/VideoClips/VideoClips';
import Temperature from './views/Temperature/Temperature';
import CameraLog from './views/Camera/CameraLogs';
import RawPeopleCount from './views/PeopleCount/PeopleCountLog';
import DashboardSpirit from './views/Dashboard/DashboardSpirit';
import MacAddresses from './views/MacAddress/MacAddress';
import AddMacAddress from './views/MacAddress/AddMacAddress';
import DashboardALT from './views/Dashboard/DashboardALT';
import TimelineWindow from './component/TimelineWindow';
import AddRoleForm from './views/Role/AddRoleForm';
import EditRoleForm from './views/Role/EditRoleForm';
import EditSiteSmartDeviceForm from './views/Camera/EditSiteSmartDeviceForm';
import BookmarkType from './views/BookmarkType/BookmarkType';
import AddBookmarkType from './views/BookmarkType/AddBookmarkType';
import Scales from './views/Reports/scales';
import AccessControl from './views/Reports/accessControl';
import HealthMonitorCollapse from './component/HealthMonitorCollapse'
import {Alarm as AlarmReports} from './views/Reports/alarm';

const routes = [
  { path: '/', exact: true, name: 'Home', component: DefaultLayout },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, conditionalComponent: DashboardALT },
  { path: '/sales', exact: true, name: 'Sales', component: Sales },
  { path: '/healthmonitor', exact: true, name: 'Health Monitor', component: HealthMonitorCollapse },
  { path: '/eventfeed', exact: true, name: 'Event Feed', component: EventFeed },
  { path: '/video', exact: true, name: 'Site', component: LiveVideo },
  { path: '/alert', exact: true, name: 'Alert', component: Alert },
  { path: '/alert/huboffline', exact: true, name: 'Alert', component: Alert },
  { path: '/alert/cameraoffline', exact: true, name: 'Alert', component: Alert },
  { path: '/logs/alarm', exact: true, name: 'Alarm', component: Alarm },
  { path: '/sales/savedsales', name: 'Saved Sales', component: Sales },
  { path: '/sales/topsellingitem', name: 'Top Selling Items', component: TopSelling },
  { path: '/transaction/suspicioustransactions', name: 'Suspicious Transactions', component: Sales },
  { path: '/promotions', exact: true, name: 'Promotions', component: RecentPromotions },
  { path: '/promotions/recentpromotions', name: 'Recent Promotions', component: RecentPromotions },
  { path: '/search/:searchValue', name: 'Search Result', component: SearchResult },
  { path: '/changePassword', name: 'Change Password', component: ChangePassword },
  { path: '/404', name: 'Under Construction', component: Page404 },
  { path: '/admin/users', exact: true, name: 'User', component: Users },
  { path: '/admin/users/addUserForm', exact: true, name: 'Add User Form', component: AddUserForm },
  { path: '/admin/users/userForm/:id', name: 'User Form', component: UserForm },
  { path: '/admin/clients', exact: true, name: 'Client', component: Clients },
  { path: '/admin/clients/Profile/:id', exact: true, name: 'Profile', component: ClientForm },
  { path: '/admin/clients/Roles/:id', exact: true, name: 'Roles', component: ClientRole },
  { path: '/admin/clients/Regions/:id', exact: true, name: 'Regions', component: ClientRegion },
  { path: '/admin/clients/System Settings/:id', exact: true, name: 'System Settings', component: ClientSettings },
  // { path: '/admin/sites', name: 'Store', component: Store, exact: true },
  { path: '/admin/sites/addstore/:id', exact: true, name: 'Add Store', component: addStore },
  { path: '/admin/sites/camera/:id', exact: true, name: 'Camera', component: addCamera },
  { path: '/admin/sites/smartDevice/:id', exact: true, name: 'Smart Device', component: SmartDevice },
  { path: '/admin/sites/siteSmartDeviceForm', exact: true, name: 'Add Smart Device', component: SiteSmartDeviceForm },
  { path: '/admin/sites/siteSmartDeviceForm/:id', exact: true, name: 'Edit Smart Device', component: EditSiteSmartDeviceForm },
  // { path: '/admin/siteSmartDeviceForm/:storeId/:id', exact: true, name: 'Add Smart Device', component: SiteSmartDeviceForm },
  { path: '/admin/site/:storeId/SiteSmartDeviceForm/:id', name: 'Site Smart Device', component: SiteSmartDeviceForm },
  //{ path: '/admin/sites/addcamera/:storeId/:id', name: 'Add Camera', component: addCamera, exact: true },
  { path: '/admin/sites', exact: true, name: 'Store', component: Store },
  //{ path: '/admin/addstore/:id', name: 'Add Store', component: addStore },
  { path: '/admin/site/:storeId/addcamera/:id', name: 'Add Camera', component: addCamera },
  { path: '/admin/addcamera/:storeId/:id', name: 'Add Camera', component: addCamera },
  { path: '/admin/macAddresses', name: 'Mac Addresses', component: MacAddresses, exact: true },
  { path: '/admin/macAddresses/addMacAddress/:id', name: 'Add MacAddress', component: AddMacAddress, exact: true },
  { path: '/health/logsDirectories', name: 'LogsDirectories', component: LogsDirectories, exact: true },
  { path: '/health/logsDirectories/logs/:id', name: 'Logs', component: Logs, exact: true },
  { path: '/admin/activityLogs', name: 'ActivityLog', component: ActivityLog },
  { path: '/cameraLogs', name: 'CameraLog', component: CameraLog },
  { path: '/timeline', name: 'Timeline', component: Timeline },
  { path: '/admin/userFaces', name: 'User Faces', component: UserFaces },
  { path: '/admin/addFace/:id', name: 'Add Face', component: AddFace },
  { path: '/cameras/:storename', name: 'Store Name', component: Cameras },
  { path: '/admin/role', exact: true, name: 'Role', component: Role },
  { path: '/admin/role/addForm', exact: true, name: 'Add Role', component: AddRoleForm },
  { path: '/admin/role/roleForm/:id', name: 'Role Form', component: EditRoleForm },
  { path: '/admin/configuration', exact: true, name: 'Configuration', component: Configuration },
  { path: '/admin/configuration/industryForm/:id', exact: true, name: 'Industry', component: IndustryForm },
  { path: '/admin/configuration/reportForm/:id', exact: true, name: 'Report', component: ReportForm },
  { path: '/admin/configuration/widgetForm/:id', exact: true, name: 'Widget', component: WidgetForm },
  { path: '/admin/configuration/smartDeviceForm/:id', exact: true, name: 'Smart Device', component: SmartDeviceForm },
  { path: '/admin/configuration/smartDeviceForm/:type/:id', exact: true, name: 'Smart Device', component: SmartDeviceForm },
  { path: '/faceEvents', name: 'Face Events', component: FaceEvents },
  { path: '/health/monitor/:type?', name: 'Monitor', component: Monitor },
  { path: '/health/MonitorSummary/:id', name: 'Monitor Summary', component: MonitorSummary },
  { path: '/mapView', name: 'Map View', component: MapView },
  { path: '/logs/temperature', name: 'Temperature', component: Temperature },
  { path: '/sales/pos', exact: true, name: 'Point of Sale', component: Sales },
  { path: '/logs/pos', exact: true, name: 'Logs - Point of Sale', component: Sales },
  { path: '/peopleCountLog', name: 'PeopleCountLog', component: RawPeopleCount },
  { path: '/timelineWindow/:storeId/:ids?', exact: true, name: 'Multiple Playbacks', component: TimelineWindow },
  { path: '/admin/bookmarkType', name: 'Bookmark Type', component: BookmarkType, exact: true },
  { path: '/admin/bookmarkType/addBookmarkType/:id', name: 'Add Bookmark Type', component: AddBookmarkType, exact: true },
  { path: '/reports/scales', name: 'Scales', component: Scales, exact: true },
  { path: '/reports/sales', name: 'Reports - Saved Sales', component: Sales, exact: true },
  { path: '/reports/nosales', name: 'No Sales', component: Sales },
  { path: '/reports/accesscontrol', name: 'Access Control', component: AccessControl, exact: true },
  { path: '/reports/alarm', name: 'Alarm', component: AlarmReports, exact: true },
  { path: '/reports/weeklysales', exact: true, name: 'Weekly Sales', component: Sales },
  { path: '/reports/voids', exact: true, name: 'Voids', component: Sales },
  { path: '/reports/videoClips', exact: true, name: 'Video Clip Events', component: VideoClips },
  // { path: '/spiritdashboard', name: 'Dashboard-Spirit', component: DashboardSpirit }
];

export default routes;

