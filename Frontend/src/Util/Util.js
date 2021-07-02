import React from 'react';
import _nav from '../_nav';
import moment from 'moment';
import { reloadGrid } from '../redux/actions/';
import { updateGridData, storeChange, selectedCameraData as updateCameraData } from '../redux/actions';
import { preferenceData, storeData } from '../redux/actions/httpRequest';
import onCamPng from '../assets/img/oncam.png';
import offCamPng from '../assets/img/offcam.png';
import consts from './consts';
import api from '../redux/httpUtil/serverApi';
import store from '../redux/store';
import swal from 'sweetalert';



const toggleClasses = ["sidebar-lg-show", "sidebar-show"],
  sideBarClasses = ["sidebar-minimized", "brand-minimized"],
  compareClasses = toggleClasses.concat(sideBarClasses);

const isLocal = (window.location.origin.indexOf('localhost') > -1);

let utils = {
  dateFormat: "MM/DD/YYYY",
  timeFormat: "hh:mm:ss A",
  dateTimeFormat: "MM/DD/YYYY HH:mm",
  dateTimeFormatAmPm: "MM/DD/YYYY hh:mm A",
  dateTimeFormatAmPmPOS: "MM/DD/YYYY hh:mm:ss A",
  dateTimeFormatSecond: "MM/DD/YYYY HH:mm:ss",
  faceDateformat: "MMMM Do YYYY, h:mm:ss A",
  swalErrorTitle: "Error",
  peopleCountDateFormat: "YYYY-MM-DD 00:00:00",
  peopleCountDataUsed: "MM/DD/YYYY",
  peopleCountHours: "HH:00",
  cameraStatus: {
    Active: "Active"
  },
  playerWidth: '90%',
  playerInnerWidth: 50,
  playerFillWidth: '100%',
  textMaxLength: 15,
  facialConfidenceLevel: {
    low: 85,
    high: 90
  },
  adminRoleId: '5c540eefb224473e50f12236',
  clientAdminRoleId: '5c544ffa72730e1d603d3512',
  userRoleId: '5c581923de665b2bc00615a6',
  SessionExpired: "Session Expired. Please re-login.",
  baseUrl: api.baseUrl,
  wsUrl: window.location.protocol.indexOf('https') > -1 ? `wss://${window.location.host}` : 'ws://' + window.location.hostname,
  serverUrl: window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')),
  sessionTimeOut: false,
  isIpad: navigator.maxTouchPoints > 2,
  serverImageUrl: window.location.host.indexOf("localhost") != -1 ? "http://localhost:5001" : window.location.host.indexOf("kmgin") != -1 ? "http://realwave.kmgin.com:9092" : window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')),
  isTestSite() {
    let result = {};
    let regexParse = new RegExp('([a-z\-0-9]{2,63})\.([a-z\.]{2,5})$');
    let urlParts = regexParse.exec(window.location.hostname.toLocaleLowerCase());
    result.domain = urlParts[1];
    result.type = urlParts[2];
    result.subdomain = window.location.hostname.replace(result.domain + '.' + result.type, '').slice(0, -1);
    return result.subdomain === "test";
  },
  isEmpty(v, allowBlank) {
    if (typeof v === 'object' || typeof v === 'function') {
      let i;
      for (i in v) {
        if (v.hasOwnProperty(i)) {
          return false;
        }
      }
      return true;
    } else {
      // not an object or function - same as before
      return v === null || v === undefined || (!allowBlank ? v === '' : false);
    }
  },
  storeInfo: null,
  //Get current logged in user info
  getLoggedUser() {
    var user = store.getState().userDetail.data;
    return user ? user.data : null;
  },
  ifPermissionAssigned(permKey, permName, findRole) {
    var user = store.getState().userDetail.data;
    let loggedUser = user ? user.data : null;
    let roleId = loggedUser.roleId;

    if (findRole) {
      return roleId[findRole];
    }

    if (permName == "Add Clients" || permName == "Recording" || permName == "Media Server") {
      if (!roleId.isAdminRole && !roleId.isInstallerRole) return false;
    } else if (permName == "Can see Covert Cameras") {
      if (!roleId.isAdminRole && !roleId.isInstallerRole && !roleId.isClientAdminRole) return false;
    } else {
      if (!roleId.isAdminRole) return false;
    }

    let LoggedInPermissions = loggedUser && loggedUser.roleId ? loggedUser.roleId.permissions : [];

    let PermObjPresent;
    if (LoggedInPermissions.length) PermObjPresent = LoggedInPermissions.find(perm => perm[permKey] && perm[permKey].name === permName);

    return PermObjPresent && PermObjPresent.isViewAllowed ? true : false;
  },
  deleteUnUsedValue(values, ignoreList = []) {
    let list = [
      "password", "createdAt", "updatedAt", "_id", "__v"
    ];

    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (ignoreList.indexOf(item) > -1) {
        continue;
      }
      delete values[item];
    }
  },
  getErrorInfo: (action) => {
    const { response = {}, type } = action;
    let { isTimedOut, status, message } = response;
    let errorMessage = message == 'Failed to fetch' ? 'Please check your network connection' : message;
    if (type == 'ALARM_EVENT_ERROR') {
      errorMessage = 'Hub is not connected'
    }
    else if (status) {
      errorMessage = consts.ResponseCode[status];
    }
    else if (isTimedOut) {
      errorMessage = consts.ResponseCode["408"];
    }
    if (errorMessage) {
      swal('Error', errorMessage, 'error');
    }
    return errorMessage;
  },
  onNavigate(options) {
    let history = options.props.history;
    let params = options.params && options.params.id ? options.params.id : options.params && options.params.id === 0 ? options.params.id : "";

    switch (options.type) {
      case "forgotPassword":
        history.push(options.route);
      case "replace":
        history.replace(options.route + (params ? '/' + params : ''));
        break;
      default:
        history.push(options.route + '/' + params);
        break;
    }
  },
  selectOption(options, selectedValue) {
    let seletedOption = [];
    console.log('utils22 options', options)
    console.log('utils22 selectedValue', selectedValue)
    options && options.map((val, index) => {
      let valIndex = typeof selectedValue == "string" ? (selectedValue == val.LookupId ? 1 : -1) : selectedValue ? selectedValue.findIndex(x => x == val.LookupId) : -1;
      console.log('utils22 val', val)
      console.log('utils22 valIndex', valIndex)
      if (valIndex > -1) {
        console.log('utils22 valIndex -1')
        if (typeof selectedValue == "string") {
          console.log('utils22 typeof selectedValue string')
          seletedOption = { value: val.LookupId, label: val.DisplayValue }
        } else {
          console.log('utils22 typeof selectedValue string else')
          seletedOption.push({ value: val.LookupId, label: val.DisplayValue });
        }
      } else {
        console.log('utils22 valIndex -1 else')
      }

    })
    console.log("utils22 ", seletedOption);
    return seletedOption;
  },
  selectOptionGenerator(options, lableField, valueField) {
    let optionList = [];
    options && options.map((val, index) => {
      optionList.push({ value: valueField ? val[valueField] : val.LookupId, label: lableField ? val[lableField] : val.DisplayValue });
    })
    return optionList;
  },
  clipStatus(props, record, index) {
    let icon;
    switch (props && props.toLocaleUpperCase()) {
      case "REVIEWED":
        icon = <center><div title="Reviewed"><i className="fa fa-check-square text-green status-icon-size"></i></div></center>
        break;

      case "NOT REVIEWED":
        icon = <center><div title="Not Reviewed"><i className="fa fa-times-circle status-icon-size"></i></div></center>
        break;

      case "ISSUE":
        icon = <center><div title="Issue"><i className="fa fa-exclamation-triangle text-red status-icon-size"></i></div></center>
        break;

      case "PENDING":
        icon = <center><div title="Pending"><i className="fa fa-clock-o text-red status-icon-size"></i></div></center>
        break;

      default:
        icon = <center><div title="Not Reviewed"><i className="fa fa-times-circle status-icon-size"></i></div></center>
        break;
    }
    return icon;

  },
  clipStatusEvents(props, record, index) {
    let icon;
    switch (props && props.toLocaleUpperCase()) {
      case "REVIEWED":
        icon = "fa fa-check-square text-green status-icon-size";
        break;

      case "NOT REVIEWED":
        icon = "fa fa-times-circle status-icon-size";
        break;

      case "ISSUE":
        icon = "fa fa-exclamation-triangle text-red status-icon-size";
        break;

      case "PENDING":
        icon = "fa fa-clock-o text-red status-icon-size";
        break;

      default:
        icon = "fa fa-times-circle status-icon-size";
        break;
    }
    return icon;

  },
  isIOS() {
    var iOS = navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
    return iOS
  },
  email: value => value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ? 'Invalid email address' : undefined,
  allowNumeric: value => value && !/^[0-9]+$/.test(value) ? 'Please enter numeric values only' : undefined,
  allowAlphabet: value => value && !/[a-zA-Z]+/g.test(value) ? 'Please enter alphabets values only' : undefined,
  allowNumericMobile: value => value && !/^[0-9--]*$/.test(value) ? 'Please enter numeric values only' : undefined,
  textWrapperOnLimit(text) {
    let paraLenth = text.split(" ").length;
    let last = "";
    if (paraLenth > this.textMaxLength) {
      last = " ... ";
    }

    return text.split(" ").splice(0, this.textMaxLength).join(" ") + last;
  },

  /**
  * function to check if the user is having required permission
  */
  isPermitted(permissions) {
    //console.log(permissions);
    let user = this.getLoggedUser(), havePermission = false;
    if (!user)
      return havePermission;

    if (!user.roleId)
      return havePermission;

    if (!user.roleId.permissions)
      return havePermission;

    for (var i = 0; i < permissions.length; i++) {
      // let perm = user.roleId.permissions.filter(e => e.name === permissions[i]);
      let perm = user.roleId.permissions.filter(e => {
        // console.log(e,permissions[i]);
        if (e.pageId)
          return e.pageId.name === permissions[i]
        if (e.widgetId)
          return e.widgetId.name === permissions[i]
        if (e.reportId)
          return e.reportId.name === permissions[i]
        if (e.functionId)
          return e.functionId.name === permissions[i]
      });
      if (perm.length > 0) {
        havePermission = true;
        break;
      }
    }
    return havePermission;
  },

  getMenuUrlPermitted(url) {
    var isUrlPermitted = false;

    var allMenus = _nav.navigation().items;
    for (let index = 0; index < allMenus.length; index++) {
      const menuItem = allMenus[index];
      if (menuItem.url == url) {
        if (this.isPermitted(menuItem.permission)) {
          isUrlPermitted = true;
          break;
        } else {
          break;
        }
      }

      if (menuItem.children && menuItem.children.length > 0) {
        for (let j = 0; j < menuItem.children.length; j++) {
          const children = menuItem.children[j];
          if (children.url == url) {
            if (this.isPermitted(children.permission)) {
              isUrlPermitted = true;
              break;
            } else {
              break;
            }
          }
        }
      }
    }

    return isUrlPermitted;
  },

  getMenu(returnDefaultMenu) {

    var menu = [];
    let activeMenu = '/login';
    var allMenus = _nav.navigation().items;
    allMenus.forEach(function (menuItem) {
      let isPermittedMenu = true;
      let tempMenu = null;
      if (menuItem.hidden) {
        isPermittedMenu = false;
      }
      if (menuItem.permission && isPermittedMenu) {
        //check menu permission access based upon menu role
        if (!this.isPermitted(menuItem.permission)) {
          isPermittedMenu = false;
        } else {
          tempMenu = {
            name: menuItem.name, url: menuItem.url, icon: menuItem.icon, permission: menuItem.permission
          };
        }
      }

      if (isPermittedMenu && menuItem.children && menuItem.children.length > 0 && !menuItem.hidden) {
        tempMenu.children = []
        menuItem.children.forEach(function (childItem) {
          if (childItem.permission) {
            //check menu permission access based upon menu role
            isPermittedMenu = true;
            if (!this.isPermitted(childItem.permission)) {
              isPermittedMenu = false;
            }
            if (isPermittedMenu) {
              tempMenu.children.push(childItem);
            }
            if (activeMenu == '/login' && isPermittedMenu) {
              activeMenu = menuItem.url;
            }
          } else {
            tempMenu.children.push(childItem);
          }
        }, this)
      } else {
        if (activeMenu == '/login' && isPermittedMenu) {
          activeMenu = menuItem.url;
        }
      }

      if (tempMenu) {
        menu.push(tempMenu);
      }
    }, this)

    if (returnDefaultMenu) {
      return activeMenu;
    } else {
      return {
        items: menu
      };
    }
  },

  getScreenName(route, otherDetails) {
    let pathArray = route.split('/');
    let screenName = '';
    let screensData = {
      '/dashboard': 'Dashboard',
      '/video': 'Video',
      '/eventfeed': 'Events',
      '/reports/sales': 'Reports - Saved Sales',
      '/reports/nosales': 'Reports - No Sales',
      '/reports/weeklysales': 'Reports - Weekly Sales',
      '/reports/voids': 'Reports - Void Sales',
      '/safe': 'Logs - Safe',
      '/logs/alarm': 'Logs - Alarm',
      '/logs/temperature': 'Temperature',
      '/health': 'System Health',
      '/other': 'Other',
      '/analysis': 'Analysis',
      '/admin/configuration': 'Admin - Configuration',
      '/admin/users': 'Admin - Users',
      '/admin/clients': 'Admin - Clients',
      '/admin/sites': 'Admin - Sites',
      '/health/logsDirectories': 'System Health - Site Logs',
      '/health/logsDirectories/logs/:id': 'System Health - View Logs',
      '/admin/activityLogs': 'Admin - Activity Logs',
      '/404': 'Page Not Found',
      '/user/login': 'Login',
      '/sales/topsellingitem': 'Top Selling Items',
      '/transaction/suspicioustransactions': 'Suspicious Transactions',
      '/promotions/recentpromotions': 'Recent Promotions',
      '/timeline': 'Timeline',
      '/admin/userFaces': 'Admin - User Faces',
      '/admin/role': 'Admin - Role',
      '/mapView': 'Map View',
      '/faceEvents': 'Face Events',
      '/search': 'Search',
      '/alert': 'Alerts',
      '/health/monitor': 'System Health - Monitor',
      '/login': 'Login',
      '/': 'Dashboard',
      '/reports': 'Reports',
      '/configuration': 'Admin - Configuration',
      '/sales/pos': 'Logs - Point of Sale',
      '/logs/pos': 'Logs - Point of Sale',
      '/video/': 'Video',
      '/health/monitor/': 'System Health - Monitor',
      '/changePassword': 'Change Password',
      '/login/': 'Login',
      '/ForgotPassword': 'Forgot Password',
      '/forgotPassword': 'Forgot Password',
      '/cameraLogs': 'Camera Logs',
      '/healthmonitor': 'Health Monitor',
      '/peopleCountLog': 'People Count'
    }
    screenName = screensData[route];
    let thirdValue = pathArray[3], secondValue = pathArray[2], firstValue = pathArray[1];
    if (thirdValue == 'userForm') {
      screenName = 'Admin - Users';
    } else if (thirdValue == 'addstore') {
      screenName = 'Admin - Sites';
    } else if (thirdValue == 'addcamera') {
      screenName = 'Admin - Sites - Camera';
    } else if (thirdValue == 'logs') {
      screenName = 'System Health - View Site Logs';
    } else if (thirdValue == 'roleForm') {
      screenName = 'Admin - Roles';
    } else if (secondValue == 'MonitorSummary') {
      screenName = 'System Health - Monitor - Monitor Summary';
    } else if (thirdValue == 'clientForm') {
      screenName = 'Admin - Client';
    } else if (firstValue == 'forgotPassword') {
      screenName = 'Forgot Password';
    }
    return ((screenName ? screenName : '') + ((otherDetails === true ? ' - Success' : otherDetails === false ? ' - Failed' : otherDetails ? otherDetails : '')));
  },
  guid(isInteger) {
    if (isInteger) {
      return (((new Date()).getTime() * 10000) + 621355968000000000);
    }
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  },
  getClone(data) {
    if (typeof (data) == 'object') {
      let strData = JSON.stringify(data),
        objData = JSON.parse(strData);
      return objData;
    }
    return data;
  },
  getAlertBoxTitle(isSuccess) {
    return isSuccess ? "Success" : "Error";
  },
  getAlertBoxIcon(isSuccess) {
    return isSuccess ? "success" : "error";
  },
  trimEnd(str) {
    if (str) {
      str = str.replace(/,\s*$/, "");
    }
    return str;
  },
  rendererFloat(value, data) {
    if (value) {
      return parseFloat(value).toFixed(2);
    }
    return null;
  },
  rendererBool(value) {
    return value ? "Yes" : "No";
  },
  rendererStore(value, data, col) {
    let { combos } = this.state;
    if (value) {
      if (combos && combos.hasOwnProperty(col.store)) {
        let storeValue = combos[col.store].find(e => e[col.storeMapping ? col.storeMapping : 'LookupId'] == value);
        return storeValue ? storeValue.DisplayValue : value
      } else {
        return value;
      }
    }
    return null;
  },
  rendererCurrency(value) {
    return value ? "$" + value : null;
  },
  standardDate(value, data, isLocal, converWithStoreTimezone) {
    if (value) {
      if (converWithStoreTimezone) {
        let val = moment(value).utcOffset(data.StoreId.timeZone);
        return val && val.format ? val.format(this.dateTimeFormatAmPmPOS) : null;
      }
      else {
        if (isLocal) {
          return moment.utc(value).format(this.dateTimeFormatAmPm);
        } else {
          return moment(value).format(this.dateTimeFormatAmPm);
        }
      }

    }
    return null;
  },
  getSalesScreenDetails(location) {
    switch (location) {
      case "/sales/nosales":
        return { category: ["NoSales"], fileName: "NoSales", noCategory: [], name: 'No Sales' }
      case "/sales/voids":
        return { category: ["Void"], fileName: "WeeklySales", noCategory: [], name: 'Voids' }
      case "/sales/weeklysales":
        return { category: ["Sales"], fileName: "WeeklySales", noCategory: [], name: 'Weekly Sales' }
      case "/sales/savedsales":
        return { category: ["Sales"], fileName: "SavedSales", noCategory: ["Void", "NoSales", "Face"], name: 'Sales' }
      case "/sales/pos":
        return { category: ["Sales"], fileName: "POS", noCategory: [], name: 'Point of Sale' }
      case "/transaction/suspicioustransactions":
        return { category: ["Void", "NoSales", "SuspiciousTransactions"], fileName: "SuspiciousTransactions", noCategory: [], name: 'Suspicious Transactions' }
      case "/faceEvents":
        return { category: [], fileName: "FaceEvents", noCategory: [], name: 'Face Events' }
      case "/logs/pos":
        return { category: ["Sales"], fileName: "POS", noCategory: [], name: 'Point of Sale' }
      case "/reports/sales":
        return { category: ["Sales"], fileName: "SavedSales", noCategory: ["Void", "NoSales", "Face"], name: 'Sales' }
      case "/reports/nosales":
        return { category: ["NoSales"], fileName: "NoSales", noCategory: [], name: 'No Sales' }
      case "/reports/weeklysales":
        return { category: ["Sales"], fileName: "WeeklySales", noCategory: [], name: 'Weekly Sales' }
      case "/reports/voids":
        return { category: ["Void"], fileName: "WeeklySales", noCategory: [], name: 'Voids' }


      default:
        return { category: [], noCategory: [], fileName: "", name: "" }
    }
  },
  defaultChatConfig: { minWidth: 6, minHeight: 4, maxWidth: 12, maxHeight: 6 },
  getProgressBarStyle(themename) {

    let progressBarStyle = {
      'theme-dark': { stroke: '#fff', fill: '#1E6E62', backgroundColor: '#1E6E62', fontcolor: '#ffffff', storeChart: 'rgba(45,194,154,0.3)', storeChartActive: '#35E8B5' },
      'theme-light': { stroke: '#343b41', fill: '#4bc0c0', backgroundColor: '#ffffff', fontcolor: '#000000', storeChart: 'rgba(47,208,162,0.3)', storeChartActive: '#2FD0A2' },
      'theme-cocacola': { stroke: '#343b41', fill: '#4bc0c0', backgroundColor: '#ffffff', fontcolor: '#000000', storeChart: '#903e3e40', storeChartActive: '#BF3737' },
      'theme-bacardi': { stroke: '#343b41', fill: '#fff', backgroundColor: '#BCA681', fontcolor: '#ffffff', storeChart: '#9d825340', storeChartActive: '#756036' },
      'theme-starbucks': { stroke: '#343b41', fill: '#4bc0c0', backgroundColor: '#ffffff', fontcolor: '#000000', storeChart: '#00653b40', storeChartActive: '#00B369' },
      'theme-hanwha': { stroke: '#343b41', fill: '#4bc0c0', backgroundColor: '#ffffff', fontcolor: '#000000', storeChart: '#f89b6c40', storeChartActive: '#ff6633' },
      'theme-geutebruck': { stroke: '#fff', fill: '#FFD633', backgroundColor: '#FFD633', fontcolor: '#ffffff', storeChart: 'rgba(64,104,130,0.3)', storeChartActive: '#406882' },
      'theme-snowwhite': { stroke: '#343b41', fill: '#0095cc', backgroundColor: '#ffffff', fontcolor: '#000000', storeChart: 'rgba(0,221,228,0.3)', storeChartActive: '#00dde4' }
    }
    return progressBarStyle[themename] || { stroke: '#fff', fill: '#4bc0c0', backgroundColor: '#ffffff', fontcolor: '#000000' };
  },
  getPeopleCountingBarOneStyle(themename) {

    let peopleCountBarOneStyle = {
      'theme-dark': { backgroundColor: '#006492' },
      'theme-light': { backgroundColor: '#008ed1' },
      'theme-cocacola': { backgroundColor: '#ffcccc' },
      'theme-bacardi': { backgroundColor: '#fff' },
      'theme-starbucks': { backgroundColor: '#008c52' },
      'theme-hanwha': { backgroundColor: '#ff6633' },
      'theme-geutebruck': { backgroundColor: '#ffd633' },
      'theme-snowwhite': { backgroundColor: '#00dde4' }
    }
    return peopleCountBarOneStyle[themename];
  },
  getPeopleCountingBarTwoStyle(themename) {

    let peopleCountBarTwoStyle = {
      'theme-dark': { backgroundColor: '#2cc698' },
      'theme-light': { backgroundColor: '#c1d9f5' },
      'theme-cocacola': { backgroundColor: '#ff6666' },
      'theme-bacardi': { backgroundColor: '#756036' },
      'theme-starbucks': { backgroundColor: '#00db80' },
      'theme-hanwha': { backgroundColor: '#f9a87f' },
      'theme-geutebruck': { backgroundColor: '#191b1d' },
      'theme-snowwhite': { backgroundColor: '#0095cc' }
    }
    return peopleCountBarTwoStyle[themename];
  },
  getPeopleCountingGridStyle(themename) {

    let peopleCountGridStyle = {
      'theme-dark': { stroke: '#005f88', fill: '#2cc698', backgroundColor: '#142531', fontcolor: '#0f8977' },
      'theme-light': { stroke: '#c8ecef', fill: '#70c4ae', backgroundColor: '#1ac08c', fontcolor: '#0f8977' },
      'theme-cocacola': { stroke: '#ffffff', fill: '#bf3737', backgroundColor: '#ffcccc', fontcolor: '#12c869' },
      'theme-bacardi': { stroke: '#efede1', fill: '#bca681', backgroundColor: '#756036', fontcolor: '#12c869' },
      'theme-starbucks': { stroke: '#c8ecef', fill: '#70c4ae', backgroundColor: '#1ac08c', fontcolor: '#0f8977' },
      'theme-hanwha': { stroke: '#f9a87f', fill: '#ff835a', backgroundColor: '#ff6633', fontcolor: '#12c869' },
      'theme-geutebruck': { stroke: '#191b1d', fill: '#ffd633', backgroundColor: '#191b1d', fontcolor: '#406882' },
      'theme-snowwhite': { stroke: '#256b8d', fill: '#00dde4', backgroundColor: '#256b8d', fontcolor: '#0077b7' }
    }
    return peopleCountGridStyle[themename];
  },
  getGoogleMarkerCount(markerCluster) {
    if (markerCluster && markerCluster.length > 0) {
      markerCluster.map((m, i) => {
        let count = 0;
        let markerLat = m.getPosition() ? m.getPosition().lat().toString() : '';
        let markerLng = m.getPosition() ? m.getPosition().lng().toString() : '';
        markerCluster.map((n, i) => {
          if (n.getPosition() && markerLat == n.getPosition().lat() && markerLng == n.getPosition().lng()) {
            count += 1;
          }
        })
        m.setLabel({ color: "#00aaff", fontWeight: "bold", fontSize: "14px", text: count.toString() })
      })
    }
  },

  addThemetoBody(name) {
    let bodyClass = document.querySelector("body").classList;
    let themeList = ['theme-dark', 'theme-dark2', 'theme-light', 'theme-bacardi', 'theme-cocacola', 'theme-starbucks', 'theme-snowwhite', 'theme-hanwha', 'theme-geutebruck'];
    var themeIndex = themeList.indexOf(name);
    if (themeIndex != -1) {
      themeList.splice(themeIndex, 1);
    }
    themeList.forEach(function (theme) {
      if (bodyClass.contains(theme)) {
        bodyClass.remove(theme);
      }
    });
    if (!bodyClass.contains(name)) {
      bodyClass.add(name);
    }
  },

  updateGrid(scope, nextProps, gridName) {
    let selectedStoreData = nextProps.storeChange ? nextProps.storeChange.selectedStore : null;
    let selectedTagsData = nextProps.storeChange ? nextProps.storeChange.selectedTag : null;
    let storeChangeData = scope.props.storeChange;
    let updateGrid = false;
    if (selectedStoreData || selectedTagsData) {
      if (selectedStoreData) {
        if (storeChangeData.selectedStore != selectedStoreData) {
          storeChangeData.selectedStore = selectedStoreData;
          updateGrid = true;
        }
      }
      if (selectedTagsData) {
        if (storeChangeData.selectedTag != selectedTagsData) {
          storeChangeData.selectedTag = selectedTagsData;
          updateGrid = true;
        }
      }
      if (updateGrid) {
        scope.props.dispatch(reloadGrid({
          grid: gridName
        }));
      }
    }
  },
  updateSiteAndTagsFilter(scope, params, fromEventGrid) {
    if (scope.props.skipGlobalFilter) {
      return params;
    }
    if (scope.props.childFilter) {
      params.selectedValue = [scope.props.childFilter];
      return params;
    }
    let storeAndTagsValue = scope.props.storeChange;
    let storesData = scope.props.storesData;
    if (fromEventGrid) {
      storeAndTagsValue = scope.newParams;
    }
    let filterData = [];
    let selectedStoreData = JSON.parse(localStorage.getItem('SelectedStore'));
    if (storeAndTagsValue && storeAndTagsValue.selectedStore && storeAndTagsValue.selectedStore.length > 0 && storeAndTagsValue.selectedStore[0].value != 'All') {
      params.fromSites = true;
      filterData = [];
      storeAndTagsValue.selectedStore.forEach(function (data) {
        filterData.push(data.value);
      })
      params.selectedValue = filterData;
    }
    if (selectedStoreData && selectedStoreData.length > 0 && filterData.length == 0 && selectedStoreData[0].value != 'All') {
      params.fromSites = true;
      filterData = [];
      selectedStoreData.forEach(function (data) {
        filterData.push(data.value);
      })
      params.selectedValue = filterData;
    }
    if (storeAndTagsValue && storeAndTagsValue.selectedTag && storeAndTagsValue.selectedTag.length > 0) {
      params.fromTags = true;
      filterData = [];
      storeAndTagsValue.selectedTag.forEach(function (data) {
        filterData.push(data.value);
      })
      params.selectedValue = filterData;
    }
    return params;
  },
  UpdateDataForGrid(scope, nextProps) {
    const { dataProperty, filters, combos } = scope.props;
    const { page, pageSize, sortInfo, filtersGrid } = scope.state;
    if ((nextProps[dataProperty] && nextProps[dataProperty] !== scope.props[dataProperty])) {
      const { data, isFetching } = nextProps[dataProperty];
      if (!isFetching) {
        scope.setState({ isLoading: false });
        if (data && !data.error) {
          if (!data.message) {
            scope.setState({ gridData: data.data || data.records, pageTotal: data.pages, total: data.total || data.recordCount, combos: data.combos });
            scope.props.dispatch(updateGridData({
              page: page, pageSize: pageSize,
              sort: sortInfo.sortColumn,
              sortDir: sortInfo.sortDirection,
              filters: JSON.stringify(filters || scope.getFilterParams(filtersGrid) || {}),
              combos: combos || ''
            }));
          }
        }
      }
    }
  },
  splitWordFromCapitalLater(value = "") {
    let result = '';
    let reg = /[A-Z][a-z]+|[0-9]+/g;
    let length = value.length;
    if (value instanceof Array) {
      length > 0 && value.map((d, i) => {
        result += d.match(reg).join(" ")
        if ((length - 1) != i) {
          result += ', ';
        }
      })
    } else {
      result = value.match(reg) ? value.match(reg).join(" ") : value;
    }
    return result;
  },
  toggleMenu: (isSmall) => {
    // Check if local storage is available.
    if (localStorage) {
      // Get navigation info from local storage.
      let navInfo = localStorage.getItem("navInfo");

      if (navInfo && navInfo.length > 0) {
        navInfo = JSON.parse(navInfo);
      }
      else {
        navInfo = {};
      }
      let bodyClasses = document.querySelector("body").className.split(" ");

      // In case of md(meduim) screen, handle required class(sidebar-lg-show) manually.
      if (isSmall) {
        if (bodyClasses && Array.isArray(bodyClasses) && bodyClasses.length > 0) {
          toggleClasses.forEach(clsName => {
            let clsIndex = bodyClasses.findIndex((cls) => cls == clsName);
            if (clsIndex == -1) {
              bodyClasses.push(clsName);
            }
            else {
              bodyClasses.splice(clsIndex, 1);
            }
          });
          let bodyClassNames = bodyClasses.join(" ");
          document.querySelector("body").className = bodyClassNames;
        }
      }
      let toSaveClasses = [];

      // Add only nav required classes.
      bodyClasses.forEach(clsName => {
        let clsIndex = compareClasses.findIndex((cls) => cls == clsName);
        if (clsIndex != -1) {
          toSaveClasses.push(clsName);
        }
      });
      navInfo.classList = toSaveClasses;
      navInfo = JSON.stringify(navInfo);

      // Save navigation info to local storage.
      localStorage.setItem("navInfo", navInfo);
    }
  },
  setNavigationProps: () => {
    // Check if local storage is available.
    if (localStorage) {
      // Get navigation info from local storage.
      let navInfo = localStorage.getItem("navInfo");

      if (navInfo && navInfo.length > 0) {
        navInfo = JSON.parse(navInfo);
        let savedClassList = navInfo.classList;

        if (!savedClassList || !Array.isArray(savedClassList)) {
          savedClassList = [];
        }
        let bodyClasses = document.querySelector("body").className.split(" ");

        // Add only nav required classes.
        savedClassList.forEach(clsName => {
          let clsIndex = bodyClasses.findIndex((cls) => cls == clsName);

          if (clsIndex == -1) {
            bodyClasses.push(clsName);
          }
        });

        // Remove nav required classes.
        bodyClasses.forEach(clsName => {
          let clsIndex = savedClassList.findIndex((cls) => cls == clsName);

          if (clsIndex == -1 && compareClasses.indexOf(clsName) != -1) {
            clsIndex = bodyClasses.findIndex((cls) => cls == clsName);
            bodyClasses.splice(clsIndex, 1);
          }
        });
        let bodyClassNames = bodyClasses.join(" ");
        document.querySelector("body").className = bodyClassNames;
      }
    }
  },
  bindContext(funcList, context) {
    funcList.forEach(func => {
      context[func] = context[func].bind(context);
    });
  },
  getUpdatedStoreData(scope, nextProps) {
    let { data } = nextProps.storesData;
    console.log(data);
    if (data) {
      let filterData = [];
      let storeData = data.data,
        selectedStore = nextProps.storeChange && nextProps.storeChange.selectedStore || null;
      if (selectedStore && selectedStore.length > 0 && selectedStore[0].value != 'All') {
        selectedStore.forEach(storeSelected => {
          let filteredStoredData = storeData.filter(function (e) { return e.storeId._id === storeSelected.value });
          if (filteredStoredData.length > 0) {
            filteredStoredData.forEach(element => {
              filterData.push(element);
            });
          }
        });
        if (filterData.length > 0) {
          storeData = filterData;
        }
      }
      scope.props.dispatch(storeChange({ data: storeData }));
      scope.props.history.goBack(-1)
    }
  },
  getScreenDetails(data, location, extras, others = {}) {
    let userId = data && data._id || '';
    let path = location && location.pathname;
    let userName = data && data.firstName.toUpperCase() + " " + data.lastName.toUpperCase() || '';
    let pathArray = location && path ? path.split('/') : '';
    if (location) {
      delete location.hash;
      delete location.search;
    }
    let logData = {
      userId, userName, screen: this.getScreenName(path || '', extras), route: (pathArray[1] == 'forgotPassword' ? '/forgotPassword' : path) || '',
      otherOptions: JSON.stringify({ ...location, ...others } || {})
    };
    if (!userId) {
      delete logData.userId;
      delete logData.userName;
    }
    return logData;
  },
  trunString(str = '', limit) {
    let length = str.length;
    if (limit < length) {
      str = str.substr(0, limit) + "...";
    }
    return str;
  },
  isComputer() {
    let result = true;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      result = false;
    }
    return result;
  },
  drawCircle(circle, ctx, height, width, circles, commingFrom, isConnected) {
    if (commingFrom !== "map") {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.beginPath();
      ctx.fillStyle = circle.fill;
      ctx.strokeStyle = "black";
      ctx.font = "20px Georgia";
      ctx.lineWidth = 10;
      //avoid outside canvas x and y
      circle.x = Math.min(circle.x, width - circle.r);
      circle.x = Math.max(circle.x, circle.r);
      circle.y = Math.min(circle.y, height - circle.r);
      circle.y = Math.max(circle.y, circle.r);
      //then check if circles are not too close
      if (circle.isDragging) {
        circles.forEach(function (c) {
          if (c != circle) {
            //calculate distance
            let dist = Math.sqrt(Math.pow(Math.abs(c.x - circle.x), 2) + Math.pow(Math.abs(c.y - circle.y), 2));
            if (dist < circle.r * 2) {
              let angle = Math.atan2(c.y - circle.y, c.x - circle.x);
              circle.x = c.x - Math.cos(angle) * 40;
              circle.y = c.y - Math.sin(angle) * 40;
            }
          }
        });
      }
      ctx.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(circle.cameraData.name.substring(0, 3), circle.x, circle.y);
      ctx.fill();
    } else {
      var img = new Image();
      img.onload = function () {
        ctx.drawImage(img, (circle.x - circle.r), (circle.y - circle.r), circle.r * 2, circle.r * 2);
      };
      img.src = isConnected ? onCamPng : offCamPng;
    }
  },
  generateUUID() {
    var d = new Date().getTime();
    if (Date.now) {
      d = Date.now(); //high-precision timer
    }
    var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid.toUpperCase();
  },
  addSpaceBetweenWords(str) {
    return (str.replace(/([A-Z])/g, ' $1').trim());
  },
  clipStatusText(props, record, index) {
    let icon;
    const { Reviewed, NotReviewed, Issue, Pending, NoReview } = consts;
    switch (props && props.toLocaleUpperCase()) {
      case Reviewed:
        icon = <center><div title="Reviewed" className="text-green text-bold">{Reviewed}</div></center>
        break;
      case NotReviewed:
        icon = <center><div title="Not Reviewed" className="text-bold">{NoReview}</div></center>
        break;
      case Issue:
        icon = <center><div title="Issue" className="text-red text-bold">{Issue}</div></center>
        break;
      case Pending:
        icon = <center><div title="Pending" className="text-red text-bold">{Pending}</div></center>
        break;
      default:
        icon = <center><div title="Not Reviewed" className="text-bold">{NoReview}</div></center>
        break;
    }
    return icon;
  },
  getCategoryFilters(value) {
    let category = [], noCategory = [];
    switch (value) {
      case 'SavedSales':
        category = ['Sales'];
        noCategory = ["Void", "NoSales", "Face"];
        break;
      case 'NoSales':
        category = ["NoSales"];
        break;
      case 'WeeklySales':
        category = ['Sales'];
        break;
      case 'Void':
        category = ["Void"];
        break;
      case 'FaceEvents':
        category = ["Face"];
        break;
      case 'SuspiciousTransactions':
        category = ["Void", "NoSales", "SuspiciousTransactions"];
        break;
      case 'Alert':
        category = ["Alert"];
        break;
      default:
        break;
    }

    return {
      category: category,
      noCategory: noCategory
    }
  },
  /**
   * @description - Function get video player visibility
   * @param {String} - Html tag element id
   */
  containerVisibility(elementId) {
    let camContainer = document.getElementById(elementId);
    if (camContainer) {
      let imageContainer = camContainer.parentElement.parentNode.parentNode.parentNode;
      var element = imageContainer.getBoundingClientRect();

      return (
        element.top >= 0 && element.left >= 0 &&
        element.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        element.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    } else {
      return true;
    }
  },
  onChangeStore(val, storesData) {
    val = val.filter(function (e) { return val.length >= 1 && val[val.length - 1].label != 'All' ? e.label != 'All' : e.label === 'All' });
    let cameraData = this.state && this.state.cameraData ? this.state.cameraData : [],
      filterData = [],
      selectedMultipleStoreLength = val.length;
    if (val && val.length == 0) {
      val = [{ label: 'All', value: 'All' }]
    }
    localStorage.setItem('SelectedStore', JSON.stringify(val));

    if (val && selectedMultipleStoreLength > 0) {
      val.forEach(function (data) {
        let selectedSite = data.label === 'All' ? cameraData : cameraData.filter(function (e) { return e.storeId._id === data.value });
        if (selectedSite.length > 0) {
          selectedSite.forEach(function (data) {
            filterData.push(data);
          });
        }
      });

      if (val && val.length > 0 && val[0].label === 'All') {
        filterData = cameraData;
      }
      this.props.dispatch(storeChange({ data: filterData, selectedStore: val }));
    } else {
      this.props.dispatch(storeChange({ data: cameraData, selectedStore: val }));
    }
    this.setState({
      selectedOption: val,
      disableSelectTag: val.length > 0 ? true : false,
      selectedTag: ''
    });
    this.props.dispatch(updateCameraData({ cameraData: [], seekProp: null }));
    this.updateDashboardData(val, '', true);
    if (window.location.hash === '#/video') {
      this.props.dispatch(preferenceData.request({ action: 'load' }));
    }

    if (storesData) {
      let { data } = storesData;
      let getCheckedCamera = data && data.data;
      if (getCheckedCamera && getCheckedCamera.length > 0) {
        for (let i = 0; i < getCheckedCamera.length; i++) {
          getCheckedCamera[i].checked = false;
        }
      }
    }
  },
  controller: {
    ZOOMIN: 'ZoomIn',
    ZOOMOUT: 'ZoomOut',
    LEFT: 'Left',
    RIGHT: 'Right',
    UP: 'Up',
    DOWN: 'Down'
  },
  isSafari: navigator.vendor && navigator.vendor.indexOf('Apple') > -1 && navigator.userAgent && navigator.userAgent.indexOf('CriOS') == -1 && navigator.userAgent.indexOf('FxiOS') == -1,
  requestFullscreen: (element) => {
    try {
      if (!element.fullscreen) {
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.mozRequestFullScreen) { /* Firefox */
          element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
          element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { /* IE/Edge */
          element.msRequestFullscreen();
        }
      }
    } catch (ex) {
      console.log(ex);
    }
  },
  exitFullScreen(element) {
    try {
      if (document.fullscreen) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    } catch (ex) {
      console.log(ex);
    }
  },
  isFullScreen: (document.fullScreenElement && document.fullScreenElement !== null) || document.mozFullScreen || document.webkitIsFullScreen,
  sso: {
    google: {
      clientId: isLocal ? '875773135384-5njvtis4ih0rjdbil162rprf9em7ooqo.apps.googleusercontent.com' : '888224047811-vmgo709gpke1vrb7s2bpe2phlgouinki.apps.googleusercontent.com',
      clientSecret: isLocal ? '' : 'RQm2_gxI7meqRvBGlYTv8xK0'
    },
    facebook: {
      appId: isLocal ? 2108794362694538 : 147444069609059,
      appSecret: isLocal ? '' : '140c8a098019e68451d4eff5aa049c0b'
    }
  },
  initializeLogger() {
    let me = this;
    window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
      let appName = 'Realwave',
        isSendError = true;

      let ignoreList = [
        "memory access out of bounds",
        "Memory index is out of range"
      ];

      isSendError = !(ignoreList.indexOf((errorObj && errorObj.message || "").trim()) > -1);

      if (window.location.hostname.indexOf('localhost') > -1) {
        isSendError = false;
      }

      if (errorObj) {
        let metaData = {};

        metaData.MachineName = appName;
        metaData.DateTime = moment(new Date()).format('MM/DD/YY hh:mm:ss A');
        metaData.DateTimeUTC = moment(new Date()).utc().format('MM/DD/YY hh:mm:ss A');
        metaData.rawurl = window.location.href;
        metaData.exception = ['<b>Message:</b> ' + errorObj.message,
        '<b>Stack Trace:</b> ' + errorObj.stack,
        '<b>Browser Custom Error Message</b>' + errorMsg,
        '<b>Browser Url</b>' + url,
        '<b>Browser Line Number</b>' + lineNumber,
        '<b>Browser Column</b>' + column
        ].join('\r\n');
        let user = me.getLoggedUser();
        let userName = '';
        if (user) {
          userName = user.firstName.toUpperCase() + " " + user.lastName.toUpperCase();
        }

        metaData.User = userName;
        metaData.UserAgent = navigator.userAgent;
        metaData.Browser = navigator.appVersion;
        metaData.VirtualPath = '/' + appName;
        metaData.SystemPath = appName;
        metaData.Location = appName;
        if (isSendError) {
          me.postError(metaData);
        }
        else {
          console.log(metaData);//In case of local, if error is coming, then print it on console
        }
      }
    }
  },
  postError(data) {
    let formData = new FormData();
    for (var key in data) {
      formData.append(key, data[key]);
    }
    fetch("https://exceptionbrowser.coolrgroup.com/ExceptionHandler.ashx", {
      method: 'POST',
      body: formData
    })
      .then((response) => response.text())
      .then((responsetext) => {
        console.log(responsetext)
      })
      .catch((error) => {
        console.error(error);
      });
  },
  searchValueFilter(value) {
    let valueType = 'string';
    if (!isNaN(Number(value))) {
      valueType = 'numeric';
    } else if (Date.parse(value) instanceof Date) {
      valueType = 'date';
    }
    let columns = [
      { key: "EventId", type: "numeric" },
      { key: "EventTime", type: "date" },
      { key: "EventType", type: "string" },
      { key: "InvoiceId", type: "numeric" },
      { key: "Register", type: "numeric" },
      { key: "SubTotal", type: "numeric" },
      { key: "Tax", type: "numeric" },
      { key: "Total", type: "numeric" },
      { key: "Discount", type: "numeric" },
      { key: "OperatorName", type: "string" },
      { key: "Status", type: "string" },
      { key: "Store", type: "string" },
      { key: "Camera", type: "string" },
      { key: "Category", type: "string" },
      { key: "ItemId", type: "numeric" },
      { key: "Name", type: "string" },
      { key: "Size", type: "string" },
      { key: "Price", type: "numeric" },
      { key: "RegPrice", type: "numeric" },
      { key: "Qty", type: "numeric" },
      { key: "ItemTotal", type: "numeric" },
      { key: "Cost", type: "numeric" },
      { key: "ItemDiscount", type: "numeric" }
    ], filter = [];

    columns.forEach(item => {
      if (valueType === item.type || item.type === 'string') {
        filter.push({ operator: "like", value: value, property: item.key, type: item.type });
      }
    });
    return filter;
  },
  generateTwoGridLayout(layout) {
    console.log("generateTwoGridLayout", layout)
    let prevY = 0;
    let nextY = 0;
    let row = 0;
    const ml = layout.map((l, i) => {
      let newLayout = {}
      if (l.i == "10") {
        newLayout = { ...l, x: (row % 2) * 6, y: nextY, w: 12, maxH: 1.94, minH: 1.94, h: 1.94, isResizable: false }
      } else {
        newLayout = { ...l, x: (row % 2) * 6, y: nextY }
      }
      row++;
      if (l.i == "10") { row = 0 }

      if (row % 2 === 0) {
        nextY = prevY + 3
        prevY = nextY;
        row = 0;
      }
      return newLayout
    });
    return ml
  },
  getThemeBasedColor: () => {
    let theme = localStorage.getItem('ThemeSelected');

    let Obj = {
      Dark: { name: 'Dark', color: '#fff' },
      Light: { name: 'Light', color: '#545557' },
      Bacardi: { name: 'Bacardi', color: '#fff' },
      CocaCola: { name: 'Coca Cola', color: '#fff' },
      Starbucks: { name: 'Starbucks', color: '#fff' },
      Hanwha: { name: 'Hanwha', color: '#fff' },
      Geutebruck: { name: 'Geutebruck', color: '#ffd633' }
    }
    let color = Obj["Dark"];
    if (theme) {
      color = Obj[theme];
    }
    return color.color;
  },
  deepFind: (obj, path) => {
    var paths = path.split('.')
      , current = obj
      , i;

    for (i = 0; i < paths.length; ++i) {
      if (current[paths[i]] == undefined) {
        return undefined;
      } else {
        current = current[paths[i]];
      }
    }
    return current;
  }
};


const hasPOSPermission = () => utils.isPermitted(['Point of Sale']),
  hasPromotionsPermission = () => utils.isPermitted(['Promotions']),
  hasMapPermission = () => utils.isPermitted(['Map View']);

utils.dashboardWidgets = [
  { value: 1, label: "Sales Chart", hasPermission: hasPOSPermission },
  { value: 2, label: "Store Chart", hasPermission: hasPOSPermission },
  { value: 3, label: "Recent Promotions", subTitle: "", hasPermission: hasPromotionsPermission },
  { value: 4, label: "Top Selling Items", subTitle: "", hasPermission: hasPOSPermission },
  { value: 5, label: "Suspicious Transactions", subTitle: "", hasPermission: hasPOSPermission },
  { value: 6, label: "Map", subTitle: "", hasPermission: hasMapPermission },
  { value: 7, label: "Latest Events", subTitle: "", hasPermission: hasPOSPermission },
  { value: 8, label: "People Counting", subTitle: "", hasPermission: hasPOSPermission },
  { value: 9, label: "Video Clips", subTitle: "", hasPermission: hasPOSPermission },
  { value: 10, label: "Ticket Counter Layout View", subTitle: "", hasPermission: hasPOSPermission }

]

utils.NotiyEmailError = "Please enter valid email."
utils.NotiyPhoneError = "Please enter valid phone number."
utils.SessionExpiryTime = 1000 * 60 * 20;

utils.prepareEmailPhoneUsersToBind = async Data => {
  let data;
  if (Data.length) {
    data = Data.map(rule => {

      let emails = [];
      let phone = [];
      let emailIds = [];
      let phoneIds = [];

      let EmailUsers = [...rule.emailNotificationUsers];
      let SMSUsers = [...rule.smsNotificationUsers];

      if (EmailUsers.length) {
        rule.emailNotificationUsers.map(item => {

          if (item && item._id) {
            emails.push(item._id)
          }
          if (item && item._id) {
            emailIds.push(item._id)
          }
        });
      }
      if (rule.emailNotificationTo.length) {
        rule.emailNotificationTo.map(item => emails.push(item));
      }
      if (SMSUsers.length) {
        rule.smsNotificationUsers.map(item => {
          if (item && item.mobile) phone.push(item._id);
          if (item && item._id) phoneIds.push(item._id);
        });
      }
      if (rule.smsNotificationTo.length) {
        rule.smsNotificationTo.map(item => phone.push(item));
      }

      rule.emails = emails;
      rule.phone = phone;
      rule.emailNotificationUsers = emailIds;
      rule.smsNotificationUsers = phoneIds;

      return rule;

    });
  }
  return data;
}

utils.manageEmailPhoneData = (value, index, error, RulesArray, type, userEmailsPhones) => {
  let UsersWithID = [];
  let UsersWithoutId = [];

  for (const element of value) {
    let Option;
    if (userEmailsPhones) Option = userEmailsPhones.find(option => option._id === element);

    if (Option) {
      UsersWithID.push(Option._id);
    } else {
      UsersWithoutId.push(element)
    }

  }
  let data = [];
  if (RulesArray.length) {
    data = RulesArray.map((rule, uni) => {
      if (index == uni) {
        if (type === "email") {
          rule.emails = value;
          rule.emailNotificationUsers = UsersWithID;
          rule.emailNotificationTo = UsersWithoutId;
          rule.EmailError = error;
        } else {
          rule.phone = value;
          rule.smsNotificationUsers = UsersWithID;
          rule.smsNotificationTo = UsersWithoutId;
          rule.PhoneError = error;
        }
      }
      return rule;

    });
  }
  return data;
}

export default utils;