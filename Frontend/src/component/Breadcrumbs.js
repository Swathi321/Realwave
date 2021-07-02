
import React, { Component } from 'react';
import { NavLink, Link } from "react-router-dom";
import utils from '../Util/Util';

export default class Breadcrumb extends Component {
  constructor(props) {
    super(props)
    this.routes = [
      // { path: 'site', breadcrumb: 'Video' },
      { path: 'addUserForm', breadcrumb: 'Add User' },
      { path: 'addSmartDevice', breadcrumb: 'Add SmartDevice' },
      { path: 'smartDevice', breadcrumb: 'Smart Device' },
      { path: 'eventfeed', breadcrumb: 'Events' },
      { path: 'sites', breadcrumb: 'Site' },
      { path: 'addBookmarkType', breadcrumb: 'Bookmark Type' },
      // { path: 'addstore', breadcrumb: 'Site' },
      { path: 'userForm', breadcrumb: 'User' },
      { path: 'industryForm', breadcrumb: 'Industry' },
      { path: 'reportForm', breadcrumb: 'Report' },
      { path: 'widgetForm', breadcrumb: 'Widget' },
      { path: 'smartDeviceForm', breadcrumb: 'Smart Device' },
      { path: 'siteSmartDeviceForm', breadcrumb: ' Site Smart Device' },
      { path: 'Profile', breadcrumb: 'Profile' },
      { path: 'Roles', breadcrumb: 'Roles' },
      { path: 'Regions', breadcrumb: 'Regions' },
      { path: 'System Settings', breadcrumb: 'System Settings' },
      { path: 'roleForm', breadcrumb: 'Role' },
      { path: 'addForm', breadcrumb: 'Add Role' },
      { path: 'addcamera', breadcrumb: 'Site Camera' },
      { path: 'savedsales', breadcrumb: 'Sales' },
      { path: 'nosales', breadcrumb: 'No Sales' },
      { path: 'accesscontrol', breadcrumb: 'Access Control' },
      { path: 'weeklysales', breadcrumb: 'Weekly Sales' },
      { path: '404', breadcrumb: '404' },
      { path: 'topsellingitem', breadcrumb: 'Top Selling Item' },
      { path: 'suspicioustransactions', breadcrumb: utils.isIOS() ? 'Suspicious Txn' : 'Suspicious Transactions' },
      { path: 'recentpromotions', breadcrumb: 'Recent Promotions' },
      { path: 'logsDirectories', breadcrumb: 'Site Logs' },
      { path: 'activityLogs', breadcrumb: 'Activity Logs' },
      { path: 'faceUpload', breadcrumb: 'User Faces' },
      { path: 'logs', breadcrumb: 'Site Logs' },
      { path: 'faceEvents', breadcrumb: 'Face Events' },
      { path: 'mapView', breadcrumb: 'Map View' },
      { path: 'MonitorSummary', breadcrumb: 'Monitor' },
      { path: 'huboffline', breadcrumb: 'Hub Offline' },
      { path: 'cameraoffline', breadcrumb: 'Camera Offline' },
      { path: 'pos', breadcrumb: 'Point of Sale' },
      { path: 'cameraLogs', breadcrumb: 'Camera Logs' },
      { path: 'healthmonitor', breadcrumb: 'Health Monitor' },
      { path: 'peopleCountLog', breadcrumb: 'People Count' },
      { path: 'macAddresses', breadcrumb: 'Mac Addresses' },
      { path: 'bookmarkType', breadcrumb: 'Bookmark Type' }
    ]
    this.deleteRoute = ['transaction', 'promotions'];
  }

  capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  generateBreadCrumb(pathname) {

    let { routes, deleteRoute } = this;
    let paths = decodeURI(pathname).split("/");
    let { screenData } = this.props;

    if (screenData && screenData.name && paths && paths.length > 0) {
      let lastIndex = paths.length - 1;
      paths[lastIndex] = screenData.name;
    }

    // remove the last element if there was a / at the end of the pathname
    paths = paths[paths.length - 1] === "" ? paths.slice(0, paths.length - 1) : paths;

    // Delete route
    let deleteIndex = paths.findIndex(x => deleteRoute.includes(x));
    deleteIndex > -1 && paths.splice(deleteIndex, 1);
    // remove the first element if the second one is an empty string which means that we are in the root of the website
    paths = paths[1] === "" ? paths.slice(1) : paths;
    //Removing the path from settng in the Index path

    //removing site id from breadcrumb in case of addcamera
    if (paths.length) {
      let AddCameraIndex = paths.findIndex(i => i === "addcamera");
      if (AddCameraIndex > -1) paths = paths.slice(AddCameraIndex - 1);
    }

    if (paths[paths.length - 2] === "MonitorSummary" || paths[paths.length - 2] === "search" || paths[paths.length - 2] === "timelineWindow") {
      paths.splice(0, paths.length - 1)
    }
    let breadcrumb = paths.map((path, index) => {
      let findIndex = routes.findIndex(x => x.path == path && x.path != 'logs' && x.path != 'MonitorSummary');

      // Add the / symbol only between two links
      var arrow = findIndex > -1 ? " " : paths[index + 1] != 0 ? index !== paths.length - 1 ? " > " : " " : " ";

      // The first element should receive the <NavLink > React element
      if (index === 0) {
        return (<li key={index} className="breadcrumb-item"><NavLink key={index} to="/" activeClassName="active">Home</NavLink >{arrow}</li>);
      }

      if (path == 0) return false;

      // Build the path for the current URL
      let url = paths[index + 1] == 0 ? "" : paths.slice(0, index + 1).join('/');

      switch (url) {
        case "/admin":
          url = '/'
          break;
        case "/logs":
          url = '/health/logsDirectories'
          break;
        case "/addFace":
          url = '/admin/faceUpload'
          break;
        case "/clients":
          url = '/admin/clients'
          break;
        case "/users":
          url = '/admin/users'
          break;
        case "/role":
          url = '/admin/role'
          break;
        case "/MonitorSummary":
          url = '/health/monitor'
          break;
        case "/alert":
          url = '/alert'
          break;
        default:
          url = '/'
      }

      let checkLastIndexName = '';
      if (findIndex > -1) {
        checkLastIndexName = paths[paths.length - 1] && paths[index + 1] ? paths[paths.length - 1] == "0" ? 'Add' : 'Edit' : '';
        path = checkLastIndexName + ' ' + routes[findIndex].breadcrumb;
        url = routes[findIndex].path;

        let deleteIndex = -1;
        paths.forEach((element, index) => {
          routes.forEach((val) => {
            if (element == val.path) {
              deleteIndex = index;
            }
          });
        });

        if (deleteIndex > -1 && paths[deleteIndex + 1]) {
          paths.splice((deleteIndex + 1))
        }
      } else if (paths[index] == 'health') {
        path = 'System Health';
      } else if (paths[index] == 'logs') {
        path = 'Site Logs';
      } else if (paths[index] == 'MonitorSummary') {
        path = 'Monitor';
      } else if (paths[index] == 'changePassword') {
        path = 'Change Password';
      } else if (paths[index] == 'timelineWindow') {
        path = 'Timeline Window';
      }
      if ((paths.length - 1) == index || checkLastIndexName != '') {
        return <span key={index}>{this.capitalize(path)}</span>
      }
      return (<li key={index} className="breadcrumb-item"><Link key={index} to={url}>{this.capitalize(path)}</Link>{arrow}</li>);
    });

    let syncplaybackscreen = pathname.split('/')[1]
    if (syncplaybackscreen === "timelineWindow") {
      return (<ul className="breadcrumb mr-4"></ul>);
    } else {
      return (<ul className="breadcrumb mr-4">{breadcrumb}</ul>);
    }
  }

  render() {
    var breadcrumb = this.generateBreadCrumb(window.location.hash.substring(1));
    return (
      <div>
        {breadcrumb}
      </div>
    );
  }
}