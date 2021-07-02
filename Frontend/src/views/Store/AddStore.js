import React, { PureComponent } from "react";
import { connect } from "react-redux";
import Grid from "../Grid/GridBase";
import {
  Col,
  Row,
  TabContent,
  TabPane,
  Progress,
  Modal,
  ModalHeader,
  ModalBody,
  ListGroupItem,
  ListGroup,
} from "reactstrap";
import {
  storeData,
  storesData,
  cameraData,
  saveActivityLog,
  daemon,
  reverseSSH,
  startVNC,
  uploadSiteLogs
} from "../../redux/actions/httpRequest";
import { cloneDeep } from 'lodash'

import PropTypes from "prop-types";
import swal from "sweetalert";
import CardWrapper from "./../../component/CardWrapper";
import LoadingDialog from "./../../component/LoadingDialog";
import utils from "./../../Util/Util";
import consts from "../../Util/consts";
import { Select as AntSelect } from 'antd';
import util from "../../Util/Util";
import moment from "moment";
import "react-tagsinput/react-tagsinput.css";
import io from "socket.io-client";
import { instance } from "../../redux/actions/index";
import "../User/styles.scss";
import api from "../../redux/httpUtil/serverApi";
import "./store.scss";

import BasicInfoCollapse from './BasicInfoCollapse';
import MediaServerCollapse from './MediaServerCollapse';
import RecordingCollapse from './RecordingCollapse';
import NotificationsCollapse from './NotificationsCollapse';
import SSHConfgurationCollapse from './SSHConfgurationCollapse';
import VNCConfigurationCollapse from './VNCConfigurationCollapse'
// import { Formik } from "formik";
// import * as Yup from "yup";
// import classnames from "classnames";
// import TagsInput from "react-tagsinput";
// import Switch from "react-switch";
// import Geocode from "react-geocode";
// import axios from "axios";
// import TextArea from "antd/lib/input/TextArea";
// import $ from 'jquery';

const { Option } = AntSelect;

// import Item from "antd/lib/list/Item";
// import store from "../../redux/store";
// import SelectUnique from 'select-unique';

// const DriveProgressBar = (props) => {
//   let { drives } = props;
//   return <Row className="driveLists">
//     {drives.map((d, i) => {
//       let drivePercentage = ((d.driveInfo.used * 100) / d.driveInfo.total).toFixed(0);
//       let processClass = 0 < drivePercentage && drivePercentage < 60 ? "success" : 60 < drivePercentage && drivePercentage < 90 ? "warning" : 80 < drivePercentage && drivePercentage < 100 ? "danger" : null;

//       return <Col sm={4}>
//         {d.drivePath}
//         <Progress color={processClass} value={drivePercentage}>{drivePercentage}%</Progress>
//       </Col>
//     })}
//   </Row>;
// };

const format = "HH:mm a";
const DriveProgressBar = (props) => {
  let { drives } = props;
  return (
    <Row className="driveLists">
      {drives.map((d, i) => {
        let drivePercentage = (
          (d.driveInfo.used * 100) /
          d.driveInfo.total
        ).toFixed(0);
        let processClass =
          0 < drivePercentage && drivePercentage < 60
            ? "success"
            : 60 < drivePercentage && drivePercentage < 90
              ? "warning"
              : 80 < drivePercentage && drivePercentage < 100
                ? "danger"
                : null;

        return (
          <>{(d.drivePath.length < 2 || d.drivePath.indexOf('mnt') > -1) && <Col sm={2}>
            {d.drivePath}
            <Progress color={processClass} value={drivePercentage}>
              {drivePercentage}%
            </Progress>
          </Col>}</>
        );
      })}
    </Row>
  );
};

const siteConfigOptions = [
  { value: 'LowStreamOnly', label: 'Low Stream Always' },
  { value: 'OnDemand', label: 'On Demand' },
  { value: 'LowHighAlways', label: 'High Stream Always' }
]

const colourStyles2 = {
  menu: (provided, state) => ({
    ...provided,
    height: "100px",
    overflowY: "scroll"
  })
}
const colourStyles = {
  control: styles => ({ ...styles, backgroundColor: 'white' }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,
      backgroundColor: isDisabled
        ? null
        : isSelected
          ? data.color
          : isFocused
            ? null : null,
      cursor: isDisabled ? 'not-allowed' : 'default',
      color: isDisabled
        ? '#ccc'
        : isSelected
          ? "black"
          : 'black',
      ':active': {
        ...styles[':active'],
        backgroundColor: !isDisabled && (isSelected ? data.color : "red"),
      },
    };
  }
};

const customStyles = {
  clearIndicator: (styles) => ({ ...styles, width: "16", padding: "0px" }),
  control: (styles) => ({ ...styles, backgroundColor: "white" }),
};

const memberFunctions = [
  "onCancel",
  "addCamera",
  "onSave",
  "handleTagChange",
  "handleSmartDeviceChange",
  "onScanDevice",
  "onCloseDeviceModal",
  "connectSocket",
  "onOpen",
  "onClose",
  "onMessage",
  "onError",
  "getStoreId",
  "responseUpdate",
  "sendScanDeviceRequest",
  "onCameraClick",
  "onSmartDeviceClick",
];

const googleAPIKey = "AIzaSyAiOjJoFxTmd8UWwfE_nwMSsKdGH6TWoVk";

const daemonAction = {
  START: 0,
  STOP: 1,
  RESTART: 2,
  UPGRADE: 3,
  DAEMON_UPGRADE: 4
};

export class AddStore extends PureComponent { // NOTE - component declaration
  constructor(props) {
    super(props);
    this.changeRecordEngine = this.changeRecordEngine.bind(this);
    this.selectDays = this.selectDays.bind(this);
    let OpenSiteCamera = localStorage.getItem("OpenSiteCamera");
    localStorage.setItem("OpenSiteCamera", false);
    let cameraSiteVisible = (OpenSiteCamera === "true");

    let weekDays = [
      { value: "Monday", label: "Monday" },
      { value: "Tuesday", label: "Tuesday" },
      { value: "Wednesday", label: "Wednesday" },
      { value: "Thursday", label: "Thursday" },
      { value: "Friday", label: "Friday" },
      { value: "Saturday", label: "Saturday" },
      { value: "Sunday", label: "Sunday" },
    ];

    // checking permissions of the logged in user NOTE - site permission configuration
    let RecordingPermission = utils.ifPermissionAssigned('functionId', 'Recording');
    let MediaPermission = utils.ifPermissionAssigned('functionId', 'Media Server');
    let showCovertCamera = utils.ifPermissionAssigned('functionId', 'Can see Covert Cameras');
    this.SSH_Permission = utils.ifPermissionAssigned('functionId', "SSH Configuration ");
    this.VNC_Permission = utils.ifPermissionAssigned('functionId', "VNC Configuration");

    // adding accordion if the logged in user has permission to see them
    let sitesAccordians = [{ id: 0, siteName: "Basic Info", status: true }];
    if (MediaPermission) sitesAccordians.push({ id: 1, siteName: "Media Server", status: false });
    if (RecordingPermission) sitesAccordians.push({ id: 2, siteName: "Recording", status: false });
    sitesAccordians.push({ id: 3, siteName: "Notifications", status: false });
    if (this.SSH_Permission) sitesAccordians.push({ id: 4, siteName: "SSH Configuration", status: false });
    if (this.VNC_Permission) sitesAccordians.push({ id: 5, siteName: "VNC Configuration", status: false });

    // this.basic_info = React.createRef();

    this.state = { // NOTE - constructor this.state
      driveLists: [],
      columns: [
        {
          key: "_id",
          name: "Id",
          width: 200,
          filter: true,
          sort: true,
          // hidden: true,
        },
        {
          key: "name",
          name: "Name",
          width: 200,
          filter: true,
          sort: true,
          type: "string",
        },
        {
          key: "place",
          name: "Location",
          width: 150,
          filter: true,
          sort: true,
          type: "string",
        },
        {
          key: "cameraRTSPUrl",
          name: "Camera Url",
          width: 300,
          filter: true,
          sort: true,
          type: "string",
        },
        { key: "status", name: "Status", width: 100, filter: true, sort: true },
        {
          key: "isConnected",
          name: "Connection Status",
          width: 260,
          filter: true,
          sort: true,
          formatter: (props, record) =>
            record.isConnected ? "Connected" : "Disconnected",
        },
        {
          key: "cameraType",
          name: "Camera Type",
          width: 200,
          filter: true,
          sort: true,
        },
        {
          key: "isHeatMapCamera",
          name: "Heat Map Enabled",
          width: 250,
          filter: true,
          sort: true,
          hidden: true,
          formatter: (props, record) => (record.isHeatMapCamera ? "Yes" : "No"),
        },
        {
          key: "cameraBrand",
          name: "Camera Brand",
          width: 250,
          filter: true,
          sort: true,
          type: "string",
        },
        {
          key: "isRecordingEnabled",
          name: "Is Recording?",
          width: 250,
          filter: true,
          sort: true,
          formatter: (props, record) =>
            record.isRecordingEnabled ? "Yes" : "No",
        },
      ],
      RecordingPermission: RecordingPermission,
      MediaPermission: MediaPermission,
      clientSelected: null,
      tagsSelected: null,
      combos: {},
      tags: [],
      showCovertCamera: showCovertCamera,
      siteId: "",
      smartDevices: [],
      isOpenDeviceModal: false,
      scanDevices: [],
      isScanning: false,
      deviceError: null,
      file: "",
      imagePreviewUrl: "",
      modal: false,
      cameraCoordinates: [],
      selectedValues: [],
      newSelectedValue: [],
      ShowScaleRules: false,
      isApplyEnabled: true,
      autoSerialNumber: this.props.match.params.id == "0" ? utils.generateUUID() : null,
      originalImage: "",
      mapImage: "",
      openLoader: false,
      timezoneValue: "",
      cameraSiteVisible: cameraSiteVisible,
      regionStatus: true,
      clientList: [],
      defaultClientId: "",
      siteName: "",
      clientRegion: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      stateC: "",
      country: "",
      zipCode: "",
      regionName: "",
      latitude: "",
      longitude: "",
      timeZone: "",
      macAddress: "",
      serialKey: "",
      sitesNotes: "",
      collapse: 0,
      hasDedicatedPort: false,
      hasDedicatedVNCPort: false,
      siteNameErr: "",
      zipcodeErr: "",
      latitudeErr: "",
      longitudeErr: "",
      timeZoneErr: false,
      radioRecoEngine: "",
      sitesAccordians: sitesAccordians,
      isRecordedAntMedia: false,
      isRecordedMediaSameAsLive: "",
      notificationFrequency: "",
      notificationFrequencyErr: "",
      transportType: [
        { id: "WebRTC", label: "WebRTC" },
        { id: "HLS", label: "HLS" },
        { id: "FLV", label: "FLV" },
        { id: "NodeMedia", label: "Node Media" },
      ],
      transportTypeValue1: "",
      transportTypeValue2: "",
      isAntMedia: false,
      isNodeMedia: false,
      mediaServerInboundPort: "",
      mediaServerOutboundPort: "",
      mediaServerUrl: "",
      siteConfigOptions: siteConfigOptions,
      recMediaServerInboundPort: "",
      recMediaServerOutboundPort: "",
      recMediaServerUrl: "",
      engAddress: "",
      enginePort: "",
      engineLivePort: "",
      enginePlaybackPort: "",
      engUserName: "",
      engPassword: "",
      engRecoLocation: "",
      storeNotificationId: "",
      weekDaysAccordian: [
        {
          id: 0,
          day: "Monday",
          weekDay: "Mon",
          checked: false,
          status: false,
          entireDay: false,
          copiedWeekDays: [],
          weekDaysOptions: [],
          timeLine: [
            { start: "12:00 am", end: "11:59 pm", emails: [], phone: [], delStatus: false },
          ],
        },
        {
          id: 1,
          day: "Tuesday",
          weekDay: "Tue",
          checked: false,
          status: false,
          entireDay: false,
          copiedWeekDays: [],
          weekDaysOptions: [],
          timeLine: [
            { start: "12:00 am", end: "11:59 pm", emails: [], phone: [], delStatus: false },
          ],
        },
        {
          id: 2,
          day: "Wednesday",
          weekDay: "Wed",
          checked: false,
          status: false,
          copiedWeekDays: [],
          entireDay: false,
          weekDaysOptions: [],
          timeLine: [
            { start: "12:00 am", end: "11:59 pm", emails: [], phone: [], delStatus: false },
          ],
        },
        {
          id: 3,
          day: "Thursday",
          weekDay: "Thu",
          checked: false,
          status: false,
          copiedWeekDays: [],
          entireDay: false,
          weekDaysOptions: [],
          timeLine: [
            { start: "12:00 am", end: "11:59 pm", emails: [], phone: [], delStatus: false },
          ],
        },
        {
          id: 4,
          day: "Friday",
          weekDay: "Fri",
          checked: false,
          status: false,
          copiedWeekDays: [],
          entireDay: false,
          weekDaysOptions: [],
          timeLine: [
            { start: "12:00 am", end: "11:59 pm", emails: [], phone: [], delStatus: false },
          ],
        },
        {
          id: 5,
          day: "Saturday",
          weekDay: "Sat",
          checked: false,
          status: false,
          copiedWeekDays: [],
          entireDay: false,
          weekDaysOptions: [],
          timeLine: [
            { start: "12:00 am", end: "11:59 pm", emails: [], phone: [], delStatus: false },
          ],
        },
        {
          id: 6,
          day: "Sunday",
          weekDay: "Sun",
          checked: false,
          status: false,
          copiedWeekDays: [],
          entireDay: false,
          weekDaysOptions: [],
          timeLine: [
            { start: "12:00 am", end: "11:59 pm", emails: [], phone: [], delStatus: false },
          ],
        },
      ],
      collapseWeek: 0,
      notifyStatus: false,
      notifysStatus: false,
      // notifyEmailList: [],
      // notifyPhoneList: [],
      userEmailsPhones: [],
      selectedEmailNotify: "",
      selectedPhoneNotify: "",
      timeStart: "12:00 am",
      timeEnd: "11:59 pm",
      entireDayStatus: "",
      guardTimeLine: [],
      weekDays: weekDays,
      copyWeekdaysOptions: [],
      copyWeekDays: [],
      imageName: "",
      // cameraSiteVisible: false,
      clientRegionId: "",
      noneType: "",
      activeStatus: false,
      sshLocalServerPort: '',
      vncLocalServerPort: '',
      siteStreamConfig: [],
      siteErrorLogLevel: '',
      siteLogLevelError: false,
      SerialKeyError: false,
      macAddressError: false
    };
    this.isUpdate = this.props.match.params.id !== "0";
    this.alreadyclicked = false;
    this.alreadyclickedTimeout = null;
    utils.bindContext(memberFunctions, this);
    this.wsCloseRequest = false;
    this.ws = null;
    this.mouseIsDown = false;
    this.lastX = 0;
    this.lastY = 0;
    this.circles = [];
    this.offsetX = 0;
    this.offsetY = 0;
    this.canvas = null;
    this.ctx = null;
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.count = 0;
    this.onSelectCamera = this.onSelectCamera.bind(this)
    // this.addTimeSlot = this.addTimeSlot.bind(this);
    // this.saveTimeSlots = this.saveTimeSlots.bind(this);

    this.onCancel = this.onCancel.bind(this);
  }

  componentDidMount() {
    let { props, isUpdate } = this,
      { params } = props.match;
    // let populate = [
    //   {
    //     path: "storeNotificationId",
    //     options: {
    //       retainNullValues: true,
    //     },
    //     populate: [
    //       {
    //         path: "day.timeSlot.emailNotificationUsers",
    //         select: {
    //           _id: 1,
    //           email: 1,
    //         },
    //         options: {
    //           retainNullValues: true,
    //         },
    //       },
    //       {
    //         path: "day.timeSlot.smsNotificationUsers",
    //         select: {
    //           _id: 1,
    //           mobile: 1,
    //         },
    //         options: {
    //           retainNullValues: true,
    //         },
    //       },
    //     ],
    //   },
    //   {
    //     path: "clientRegion",
    //   },
    //   {
    //     path: "clientId",
    //   },
    // ];
    // let reqPayload = {
    //   // "action": "load",
    //   id: params.id,
    //   populate: populate,

    //   actionType: "siteNotify",
    // };
    if (params.id !== "0") {
      // this.props.dispatch(
      //   storeData.request(
      //     reqPayload,
      //     params.id
      //   )
      // );
      instance
        .post(`${api.STORE_DATA}/${params.id}`, {
          action: "load",
          id: params.id,
          populate: [
            {
              path: "storeNotificationId",
              options: {
                retainNullValues: true,
              },
              populate: [
                {
                  path: "day.timeSlot.emailNotificationUsers",
                  select: {
                    _id: 1,
                    email: 1,
                    firstName: 1,
                  },
                  options: {
                    retainNullValues: true,
                  },
                },
                {
                  path: "day.timeSlot.smsNotificationUsers",
                  select: {
                    _id: 1,
                    mobile: 1,
                    firstName: 1,
                  },
                  options: {
                    retainNullValues: true,
                  },
                },
              ],
            },
            {
              path: "clientRegion",
            },
            {
              path: "clientId",
              options: {
                retainNullValues: true,
              },
              populate: [{ path: "smartDevicesAllowed" }],
            },
          ],
        })
        .then((res) => {
          if (res && res.data && Object.keys(res.data).length > 0) {


            let siteErrorLog = []
            if (res.data.siteErrorLogLevel.length) {
              res.data.siteErrorLogLevel.map(option => siteErrorLog.push({ value: option, label: option }));
            }

            let siteStreamConfig = this.state.siteConfigOptions.length ? this.state.siteConfigOptions.find(item => item.value === res.data.siteStreamConfig) : ''
            // siteStreamConfig: res.data.siteStreamConfig,
            //   siteErrorLogLevel: res.data.siteErrorLogLevel
            // let driveLists = initialValuesEdit.driveLists && initialValuesEdit.driveLists != "" ? JSON.parse(initialValuesEdit.driveLists) : [];
            // var gg = res.data;
            // var ggg = res.data.driveLists;
            //
            this.setState({ // NOTE - this.setState after API
              driveLists: res.data.driveLists && res.data.driveLists != "" ? JSON.parse(res.data.driveLists) : [],
              tags: res.data.tags,
              siteId: res.data._id,
              siteName: res.data.name,
              addressLine1: res.data.addressLine1,
              addressLine2: res.data.addressLine2,
              city: res.data.city,
              stateC: res.data.state,
              country: res.data.country,
              zipCode: res.data.zipCode,
              longitude: res.data.longitude,
              latitude: res.data.latitude,
              serialNumber: res.data.serialNumber,
              timezoneValue: res.data.timezoneValue,
              mediaServerInboundPort: res.data.mediaServerInboundPort,
              mediaServerOutboundPort: res.data.mediaServerOutboundPort,
              mediaServerUrl: res.data.mediaServerUrl,
              recMediaServerUrl: res.data.recordedMediaServerUrl,
              recMediaServerInboundPort: res.data.recordedMediaServerInboundPort,
              recMediaServerOutboundPort: res.data.recordedMediaServerOutboundPort,
              isAntMedia: res.data.isAntMedia ? "antMedia" : "nodeMedia",
              isRecordedAntMedia: res.data.isRecordedAntMedia ? "recAntMedia" : "recNodeMedia",
              isRecordedMediaSameAsLive: res.data.isRecordedMediaSameAsLive === false || res.data.isRecordedMediaSameAsLive === true ? res.data.isRecordedMediaSameAsLive : true,
              macAddress: res.data.macAddress,
              radioRecoEngine: res.data.type,
              engAddress: res.data.nvrAddress,
              enginePort: res.data.nvrPort,
              engineLivePort: res.data.nvrLivePort,
              enginePlaybackPort: res.data.nvrPlaybackPort,
              engUserName: res.data.nvrUsername,
              engPassword: res.data.nvrPassword,
              engRecoLocation: res.data.recordingLocation,
              notifyStatus: res.data.storeNotificationEnabled,
              notifysStatus: res.data.status,
              // notifysStatus: res.data.status === "true" ? true : false,
              sitesNotes: res.data.storeNotes,
              imageName: res.data.map,
              storeNotificationId: res.data.storeNotificationId ? res.data.storeNotificationId._id : null,
              // clientRegionId: res.data.clientRegion._id,
              clientRegionId: res.data.clientRegion && res.data.clientRegion._id ? res.data.clientRegion._id : "",
              hasDedicatedPort: res.data.hasDedicatedPort,
              sshLocalServerPort: res.data.sshLocalServerPort,
              vncLocalServerPort: res.data.vncLocalServerPort,
              hasDedicatedVNCPort: res.data.hasDedicatedVNCPort,
              // siteStreamConfig: { value: res.data.siteStreamConfig, label: res.data.siteStreamConfig },
              siteStreamConfig: siteStreamConfig,
              siteErrorLogLevel: siteErrorLog,
              notificationFrequency: res.data.notificationFrequency || "",
            }, () => {
              //
            });
          }
          let trans1 = {}
          let trans2 = {}
          if (res.data.liveVideoConfig) {
            this.state.transportType.some(x => {
              if (x.id == res.data.liveVideoConfig)
                trans1 = { id: x.id, label: x.label }
            })

            this.setState({
              transportTypeValue1: trans1
            })
          }
          if (res.data.recordedVideoConfig) {
            this.state.transportType.some(x => {
              if (x.id == res.data.recordedVideoConfig)
                trans2 = { id: x.id, label: x.label }
            })

            this.setState({
              transportTypeValue2: trans2
            })
          }
          this.getClientList(res.data.clientId ? res.data.clientId._id : '');
          if (res && res.data && Object.keys(res.data.clientId).length > 0) {

            this.setState(
              {
                defaultClientId: res.data.clientId._id,
              },
              () => {
                this.getUserList(this.state.defaultClientId);
                this.getRegions({ _id: this.state.defaultClientId });
              }
            );
          }
          if (
            res &&
            res.data &&
            res.data.storeNotificationId &&
            res.data.storeNotificationId.day &&
            res.data.storeNotificationId.day.length > 0
          ) {
            let days = res.data.storeNotificationId.day;
            let timeLine = [];
            days.map((x) => {
              this.state.weekDaysAccordian.map((y) => {
                if (x.doW == y.day) {
                  y.checked = true;
                  y.entireDay = x.entireDay;

                  if (x.entireDay) {

                    let emptyData = {
                      start: "",
                      end: "",
                      emails: [],
                      phone: [],
                      delStatus: false,
                    };
                    emptyData.start = "12:00 am";
                    emptyData.end = "11:59 pm";
                    emptyData.delStatus = false;
                    emptyData.emails = x.timeSlot[0].emailNotificationTo
                    emptyData.phone = x.timeSlot[0].smsNotificationTo
                    y.timeLine = [emptyData]
                    return y
                  } else {
                    let emptyData = {
                      start: "",
                      end: "",
                      emails: [],
                      phone: [],
                      delStatus: false,
                    };
                    if (x.timeSlot.length > 0) {
                      let timeSlot = x.timeSlot;

                      for (let i = 0; i < timeSlot.length; i++) {


                        if (timeSlot[i].emailNotificationTo.length > 0)
                          emptyData.emails = timeSlot[i].emailNotificationTo;
                        if (
                          Object.keys(timeSlot[i].emailNotificationUsers).length >
                          0
                        ) {
                          timeSlot[i].emailNotificationUsers.forEach((email) => {

                            emptyData.emails.push(email._id);
                          });
                        }
                        if (timeSlot[i].smsNotificationTo.length > 0)
                          emptyData.phone = timeSlot[i].smsNotificationTo;
                        if (
                          Object.keys(timeSlot[i].smsNotificationUsers).length > 0
                        ) {
                          timeSlot[i].smsNotificationUsers.forEach((phone) => {
                            emptyData.phone.push(phone._id);
                          });
                        }
                        emptyData.start = timeSlot[i].StartTime;
                        emptyData.end = timeSlot[i].EndTime;
                        emptyData.delStatus = true;
                        timeLine.push(emptyData);
                        y.timeLine = timeLine;
                        emptyData = {
                          start: "",
                          end: "",
                          emails: [],
                          phone: [],
                          delStatus: false,
                        };
                      }
                      timeLine = [];
                    }


                    // if (y.timeLine.length < 3) y.timeLine.push(emptyData);
                    return y;
                  }
                } else {
                  y.weekDaysOptions.push({ value: x.doW, label: x.doW });
                  return y;
                }
              });
            });

          }
          // if (res && res.data) {
          //   if (res.data.status == "Active") {
          //     this.setState({
          //       cameraSiteVisible: true
          //     })
          //   } else {
          //     this.setState({
          //       cameraSiteVisible: false
          //     })
          //   }
          // }

          // if (
          //   nextProps &&
          //   nextProps.initialValues &&
          //   nextProps.initialValues.smartDevices &&
          //   nextProps.initialValues.smartDevices.length > 0
          // ) {
          //   this.setState({ smartDevices: nextProps.initialValues.smartDevices });
          // }
        })
        .catch((err) => {

        });

      let CameraFilters = [{ value: params.id, property: "storeId", type: "string" }];
      // if (!this.state.showCovertCamera) CameraFilters.push({ value: false, property: "covertCamera", type: "boolean" });

      // let showCovertCamera = this.state.showCovertCamera
      this.props.dispatch(
        cameraData.request({
          // action: "load",
          filters: CameraFilters,
          action: "get",
          covert: this.state.showCovertCamera
        })
      );
    } else {
      this.props.dispatch(storeData.request({ action: "load", id: params.id }));
    }
    // this.props.dispatch(getCombos.request({ combos: "client" }));
  }

  toggleAccForward = async (e) => {
    // let event = e.target.dataset.event;
    // this.setState({
    //   collapse: this.state.collapse === e ? 0 : e
    // },()=>{
    // });
    let data = cloneDeep(this.state.sitesAccordians);
    data = await data.map((x) => {
      if (e == x.id) {
        x.status = !x.status;
        return x;
      } else {
        return x;
      }
    });
    this.setState({
      sitesAccordians: data
    })
  }

  // site toggle Acc
  // toggleAcc = (e) => {
  // toggleAcc = async (e) => {
  async toggleAcc(e) {
    // let event = e.target.dataset.event;

    // this.setState({
    //   collapse: this.state.collapse === e ? 0 : e
    // },()=>{

    // });
    let data = cloneDeep(this.state.sitesAccordians);
    data = await data.map((x) => {
      if (e == x.id) {
        x.status = !x.status;
        return x;
      } else {
        return x;
      }
    });

    this.setState({
      sitesAccordians: data
    })
  }

  // closeAllACC(NotValidAccIndex, NotValidAccDetails){
  //   let data = [...this.state.sitesAccordians];
  //   data.map((x) =>  x.status = false );
  //   this.setState({sitesAccordians: data }, (ob => {
  //     if (NotValidAccDetails && !NotValidAccDetails.status) this.toggleAcc(NotValidAccIndex);
  //   }));
  // }


  // schedule notify check boxes and copy weekdays options
  // selectDays = async (id) => {
  //
  //   let data = [...this.state.weekDaysAccordian];
  //   let selectedData = data.find(item => item.id === id);

  //   let add = selectedData.checked ? false : true;
  //   let dayName = selectedData.day;

  //   let weekDays = [...this.state.weekDays]

  //   data = await data.map((x) => {

  //     let options = [...x.weekDaysOptions];
  //     if (add) {
  //       if (id != x.id) options.push({ value: dayName, label: dayName });

  //       let filtterDays = weekDays.filter(ob => options.find(ob2 => ob.label === ob2.label));
  //       options = [...filtterDays];
  //     }
  //     else {
  //       let DayIndex = options.findIndex(dayy => dayy.value.toLowerCase() === dayName.toLowerCase());
  //       if (DayIndex !== -1) options.splice(DayIndex, 1);
  //     }

  //     x.weekDaysOptions = options;

  //     if (id == x.id) {
  //       x.checked = !x.checked;
  //       return x;
  //     } else {
  //       return x;
  //     }
  //   });

  //   this.setState({ weekDaysAccordian: data });
  // };

  selectDays = (id) => {
    let data = cloneDeep(this.state.weekDaysAccordian);
    let selectedData = data.find(item => item.id === id);
    let add = selectedData.checked ? false : true;
    let dayName = selectedData.day;
    let weekDays = cloneDeep(this.state.weekDays);

    for (let i = 0; i < data.length; i++) {
      const x = data[i];
      let options = cloneDeep(x.weekDaysOptions);
      if (add) {
        if (id != x.id) options.push({ value: dayName, label: dayName });

        let filtterDays = weekDays.filter(ob => options.find(ob2 => ob.label === ob2.label));
        options = cloneDeep(filtterDays);
      }
      else {
        let DayIndex = options.findIndex(dayy => dayy.value.toLowerCase() === dayName.toLowerCase());
        if (DayIndex !== -1) options.splice(DayIndex, 1);
      }

      x.weekDaysOptions = options;

      if (id == x.id) {
        x.checked = !x.checked;
      }
      data[i] = x;
    }

    this.setState({ weekDaysAccordian: data });
  };

  // copy the above schedule to other days
  copyWeekDays = (val, day) => {
    // let weekDaysAccordianCopy = [...this.state.weekDaysAccordian];
    let weekDaysAccordianCopy = cloneDeep(this.state.weekDaysAccordian);
    let weekDaysAccordian = weekDaysAccordianCopy.map(x => {
      if (x.day == day) {
        x.copiedWeekDays = cloneDeep(val)
        return x
      } else {
        return x
      }
    })

    this.setState({
      weekDaysAccordian: weekDaysAccordian,
      copyWeekDays: cloneDeep(val)
    });
  };

  // notification Acc based on the checked days
  // toggleAccWeek = async (e) => {
  //   // var data = this.state.weekDaysAccordian;
  //   let data = cloneDeep(this.state.weekDaysAccordian);
  //   data = await data.map((x) => {
  //     if (e == x.id) {
  //       x.status = !x.status;
  //       return x;
  //     } else {
  //       return x;
  //     }
  //   })
  //   this.setState({ weekDaysAccordian: data });
  // };

  toggleAccWeek = (id) => {
    // var data = [...this.state.weekDaysAccordian];
    let data = cloneDeep(this.state.weekDaysAccordian);
    for (let i = 0; i < data.length; i++) {
      const x = data[i];
      if (id === x.id) {
        x.status = !x.status;
      }
      data[i] = x;
    }
    this.setState({ weekDaysAccordian: data });
  };

  getClientList = (clientId) => {
    let role = localStorage.getItem("role");

    let reqBody = [];
    if (role != "null") {

      instance
        .post(`${api.CLIENT_LIST}`, { action: "get", activeClient: "true" })
        .then(async (res) => {

          if (res.data.data) {
            let data = res.data.data;
            let cid = ""
            data = await data.map((x) => {
              let label = { label: x.name, value: x._id };
              return { ...x, ...label };
            });
            if (clientId) {
              data.forEach((x) => {
                if (x._id == clientId) {
                  cid = x;
                }
              });

              this.setState({ clientSelected: cid });
            }
            this.setState({ clientList: data });

          }
        })
        .catch((err) => {

        });
    } else {

      instance
        .post(`${api.CLIENT_LIST}`, { action: "get", activeClient: "true" })
        .then(async (res) => {

          let clientSelected = "";
          if (res.data.data) {
            let data = res.data.data;
            data = await data.map((x) => {
              let label = { label: x.name };
              return { ...x, ...label };
            });


            if (clientId) {
              await data.forEach((x) => {
                //
                if (x._id == clientId) {
                  clientSelected = x;
                }
              });

              await this.setState(
                {
                  clientSelected: clientSelected,
                  clientId: clientSelected._id,
                },
                () => {
                  this.getRegions(this.state.clientSelected);
                }
              );
            }

            await this.setState({
              clientList: data
            });
          }
        })
        .catch((err) => {

        });
    }

  };
  getUserList = (clientId) => {
    instance
      .get(`${api.GET_CLIENT_USER}/${clientId}`)
      .then((res) => {
        this.setState(
          {
            userEmailsPhones: res.data.data,
            // notifyEmailList: res.data.emailUsers,
            // notifyPhoneList: res.data.phoneUsers,
          },
          () => {
            //
          }
        );
      })
      .catch((err) => {

      });
  };
  deleteTimeSlot = async (unique, day) => {
    // let data = this.state.weekDaysAccordian;
    let data = cloneDeep(this.state.weekDaysAccordian)
    let sendStartTime = "";
    data = await data.map((x) => {
      if (x.day == day) {
        let store = [];
        x.timeLine.forEach((y, index) => {
          if (index != unique) store.push(y);
        });

        x.timeLine = store;
        return x;
      } else {
        return x;
      }
    });

    this.setState(
      {
        weekDaysAccordian: data,
      },
      () => {

        // this.updateRowField(this.state.weekDaysAccordian, day, sendStartTime);
      }
    );
  };
  // updateRowField = async (data, day, sendStartTime) => {
  //   let emptyData = {
  //     start: sendStartTime,
  //     end: "",
  //     emails: [],
  //     phone: [],
  //     delStatus: false,
  //   };

  //   data = await data.map((x) => {
  //     if (x.day == day) {
  //       //
  //       let len = x.timeLine.length;
  //       //
  //       // x.timeLine[x.timeLine.length-1].start=x.timeLine[x.timeLine.length-1]
  //       if (x.timeLine[len - 1].start != "" || x.timeLine[len - 1].end != "")
  //         x.timeLine.push(emptyData);

  //       return x;
  //     } else {
  //       return x;
  //     }
  //   });
  //   this.setState(
  //     {
  //       weekDaysAccordian: data,
  //     },
  //     () => {
  //
  //     }
  //   );
  // };
  callClieData = (data) => {
    this.setState({
      clientSelected: data,
    });
  };
  componentWillUnmount() {
    if (this.ws) {
      this.wsCloseRequest = true;
      this.ws.close();
    }
  }

  sendScanDeviceRequest() {
    const storeId = this.getStoreId();
    if (storeId) {
      this.setState({ isScanning: true, deviceError: null }, () => {
        if (this.ws.io.readyState == "open") {
          this.ws.emit("message", {
            action: "scanDeviceRequest",
            data: {
              storeId: storeId,
            },
          });
        } else {
          this.connectSocket();
        }
      });
    }
  }

  onOpen(evt) {
    this.sendScanDeviceRequest();
  }


  enableNotification = (status) => {
    let option = { notifyStatus: !status, };
    if (status) {
      option.notificationFrequencyErr = "";
    } else {
      if (this.state.notificationFrequency.length == 0) {
        option.notificationFrequencyErr = "Required";
      }
    }
    this.setState(option);
  };

  enableStatus = (status) => {
    this.setState({
      notifysStatus: status,
    })
  }

  getStoreId() {
    const { match } = this.props,
      storeId = (match && match.params && match.params.id) || "";
    return storeId;
  }

  connectSocket() {
    const storeId = this.getStoreId();
    let wsUri = `${utils.serverUrl}?type=client&storeId=${storeId}`;
    this.ws = io(wsUri);

    this.ws.on("connect", this.onOpen);
    this.ws.on("disconnect", this.onClose);
    this.ws.on("message", this.onMessage);
    this.ws.on("error", this.onError);
  }

  responseUpdate() {
    const { isScanning } = this.state;
    if (isScanning) {
      this.setState({ isScanning: false }, () => {
        this.wsCloseRequest = true;
        this.ws.close();
        this.onError();
      });
    }
  }

  onClose(evt) {
    this.setState({ isScanning: false }, () => {
      if (!this.wsCloseRequest) {
        this.ws.io.reconnect();
      }
    });
  }

  onMessage(evt) {
    let option = {},
      notUpdate = false,
      storeId = this.getStoreId();
    try {
      let data = evt.data;
      if (evt.action == "scanDevicesReponse") {
        if (data && data.hasOwnProperty("devices") && storeId == data.storeId) {
          if (!data.hasOwnProperty("error")) {
            option.scanDevices = data.devices;
          }

          if (data.hasOwnProperty("error")) {
            option.deviceError = data.error;
          }
          option.isOpenDeviceModal = true;
          option.isScanning = false;
        }
      }
    } catch (ex) {
      option.deviceError = ex.message;
      option.isOpenDeviceModal = false;
    }
    this.setState(option);
  }

  onError(err) {
    this.setState({
      isScanning: false,
      isOpenDeviceModal: true,
      deviceError: "Not able to connect with server.",
    });
  }

  onScanDevice() {
    this.setState({ isScanning: true, scanDevices: [] }, () => {
      if (this.ws) {
        this.sendScanDeviceRequest();
      } else {
        this.connectSocket();
      }
      setTimeout(this.responseUpdate, 1000 * 30);
    });
  }

  renderScanDevices(item, index) {
    return (
      <ListGroupItem className="reorderBody">
        <Row>
          <Col md={12}>
            <div className="scannedText">
              <b>Name:</b> <span>{item.name}</span>
            </div>
            <div className="scannedText">
              <b>Hardware:</b> <span> {item.hardware}</span>
            </div>
            <div className="scannedText">
              <b>Location:</b> <span>{item.location}</span>
            </div>
            <div className="scannedText">
              <b>IP:</b> <span>{item.ip}</span>
            </div>
          </Col>
        </Row>
      </ListGroupItem>
    );
  }

  componentWillReceiveProps(nextProps) {

    // if (Object.keys(nextProps.initialValues).length > 0 && nextProps.initialValues.clientId && nextProps.initialValues.clientId.length > 0 && this.state.clientList.length>0) {
    //
    //   this.setState({ clientSelected: utils.selectOption(this.state.clientList, nextProps.initialValues.clientId)}
    //   ,()=>{
    //
    //     if(this.state.clientSelected){
    //       if(this.state.regionStatus)
    //     this.getRegions(this.state.clientSelected)
    //     }
    //   }
    //   )
    //  }
    // else if (nextProps.getCombos.data && nextProps.getCombos.data.client) {
    //   if (utils.user && utils.user.clientId) {
    //
    //     this.setState({ clientSelected: utils.selectOption(nextProps.getCombos.data.client, utils.user.clientId._id) }
    //     )
    //   }
    // }

    //
    if (nextProps && nextProps.initialValues && nextProps.initialValues.tags && nextProps.initialValues.tags.length > 0) {
      this.setState({ tags: nextProps.initialValues.tags })
    }

    if ((nextProps.storeData && nextProps.storeData !== this.props.storeData)) {
      let { data, isFetching, error } = nextProps.storeData;
      if (!isFetching) {
        if (error || data && data.errmsg) {
          swal({ title: "Error", text: error || data.errmsg, icon: "error", });
          return;
        }

        else if (data && data.message) {
          // this.props.history.goBack(-1)
          this.props.history.push(`/admin/sites`);
        } else {
          this.setState({
            data: data,
            imagePreviewUrl: data.map ? utils.serverImageUrl + '/Map/' + (data.map) : null
          }, () => {

          })
        }
        this.setState({ file: null })
      }
    }

    if (nextProps.storeData && nextProps.storeData !== this.props.storeData) {
      let { data, isFetching, error } = nextProps.storeData;
      if (!isFetching) {
        if (error || (data && data.errmsg)) {
          swal({ title: "Error", text: error || data.errmsg, icon: "error" });
          return;
        }

        if (nextProps.storeData.data && nextProps.storeData.data.message) {
          swal({
            title: utils.getAlertBoxTitle(nextProps.storeData.data.success),
            text: nextProps.storeData.data.message,
            icon: utils.getAlertBoxIcon(nextProps.storeData.data.success),
          }).then(
            function () {
              this.props.dispatch(storesData.request({ stores: [] }));
            }.bind(this)
          );
        }
      }
    }
    if (
      nextProps.storesData &&
      nextProps.storesData !== this.props.storesData
    ) {
      if (!nextProps.storesData.isFetching) {
        utils.getUpdatedStoreData(this, nextProps);
      }
    }

    if (nextProps.getCombos && nextProps.getCombos !== this.props.getCombos) {
      let { data, isFetching, error } = nextProps.getCombos;
      if (!isFetching) {
        this.setState({ combos: data });
      }
    }
  }

  handleChange = (e, ErrorStateVar) => {

    let name = e.target.name
    this.setState({ [name]: e.target.value });

    if (
      name === "siteName" ||
      name === "latitude" ||
      name === "longitude" ||
      name === "notificationFrequency" ||
      name === "mediaServerOutboundPort" ||
      name === "mediaServerInboundPort" ||
      name === "mediaServerUrl" ||
      name === "recMediaServerUrl" ||
      name === "recMediaServerInboundPort" ||
      name === "recMediaServerOutboundPort" ||
      name === "enginePlaybackPort" ||
      name === "engineLivePort" ||
      name === "enginePort" ||
      name === "engAddress" ||
      name === "engUserName" ||
      name === "engPassword" ||
      (name === "sshLocalServerPort" && this.state.hasDedicatedPort) ||
      (name === "vncLocalServerPort" && this.state.hasDedicatedVNCPort)
    ) {
      if (e.target.value.length == 0) {
        this.setState({ [ErrorStateVar]: "Required" });
      } else {
        this.setState({ [ErrorStateVar]: "" });
      }
    }
  }

  onSave(values, { setSubmitting }) {

    // setSubmitting(false);
    // let clientId = null;
    // let { clientSelected, tags, smartDevices, file, cameraCoordinates, timezoneValue } = this.state;
    // Object.assign(values, { cameraCoordinates: cameraCoordinates });
    // let loggedData;
    // let id = this.props.match.params.id;
    // if (clientSelected) {
    //   clientId = clientSelected.value;
    // }
    // values.clientId = clientId;
    // values.tags = tags;
    // values.smartDevices = smartDevices;
    // //values.timezoneValue = timezoneValue; //Last commit by israil > take value from state and state not or never have the data.

    // //get geocoordinates from Google
    // Geocode.setApiKey(googleAPIKey);
    // Geocode.setLanguage("en");
    // var l1, l2, pId, tz;
    // Geocode.fromAddress(values.address + ',' + values.city + ',' + values.state + ' ' + values.zipCode).then(
    //   response => {
    //     const { lat, lng } = response.results[0].geometry.location;
    //     l1 = lat;
    //     l2 = lng;
    //     pId = response.results[0].place_id;
    //     values.latitude = l1;
    //     values.longitude = l2;
    //     values.googlePlaceId = pId;
    //   },
    //   error => {
    //
    //   }
    // )
    //   .then(async () => {
    //     //now, get timezone from Google TimeZone API from coordinates
    //     const ts = new Date().getTime();
    //     const googleTZ = 'https://maps.googleapis.com/maps/api/timezone/json?location=' + l1 + ',' + l2 + '&timestamp=' + (ts / 100) + '&key=' + googleAPIKey;
    //     await axios.get(googleTZ)
    //       .then(response => {
    //         tz = response.data.timeZoneId;
    //         values.timezoneValue = tz;
    //       },
    //         error => {
    //
    //         })
    //   })
    //   .then(() => {
    //     if (id === "0") {
    //       loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Added + ' - ' + values.name);
    //       this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
    //       this.props.dispatch(storeData.request({ action: 'save', data: values, addStore: "true", thumbnail: this.state.imagePreviewUrl, file: file }, id));
    //     } else {
    //       values.tags = tags;
    //       values.smartDevices = smartDevices;
    //       utils.deleteUnUsedValue(values);
    //       loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Update + ' - ' + values.name);
    //       this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
    //       this.props.dispatch(storeData.request({ action: 'update', data: values, addStore: "true", thumbnail: this.state.imagePreviewUrl, file: file }, id));
    //     }
    //   })
  }

  handleZipCode = (event) => {
    this.setState({ ["zipCode"]: event.target.value });
    if (isNaN(Number(event.target.value)) || event.target.value.length == 0 || event.target.value.length > 10) {
      return this.setState({ zipcodeErr: "Required" })
    }
    else {
      this.setState({ zipcodeErr: "" });
    }
  }

  onCancel = () => {
    //this.props.history.goBack(-1);
    this.props.history.push("/admin/sites");
  };

  addCamera = () => {
    let { params } = this.props.match;
    this.props.history.push("/admin/addcamera/" + params.id + "/0");
  };

  onDelete = () => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this store",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(
      function (willDelete) {
        let id = this.props.match.params.id;
        if (willDelete) {
          let loggedData = utils.getScreenDetails(
            utils.getLoggedUser(),
            this.props.location,
            consts.Delete + " - " + this.props.storeData.data.name
          );
          this.props.dispatch(
            saveActivityLog.request({ action: "save", data: loggedData })
          );
          this.props.dispatch(storeData.request({ action: "delete" }, id));
        }
      }.bind(this)
    );
  };

  onCameraClick() {
    // let { params } = this.props.match;
    // this.context.router.history.push('/admin/addcamera/' + params.id + "/0");
    this.setState({ cameraSiteVisible: true });
  };

  onSmartDeviceClick() {
    // this.setState({ smartDeviceVisible: true });
    let { params } = this.props.match;

    this.context.router.history.push('/admin/sites/smartDevice/' + params.id);
  };

  getInitialValueTemplate() {
    return {
      name: "",
      storeType: "",
      isAntMedia: false,
      liveVideoConfig: "",
      status: "",
      address: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      clientId: "",
      storeNotes: "",
      videoDir: "",
      driveLists: "",
      latitude: "",
      longitude: "",
      map: "",
      zipcodeErr: "",
      tunnelPort: "",
      mobile: "",
      serialNumber: this.state.autoSerialNumber || "",
      isSMSEnable: "",
      isOnmonitor: false,
      email: "",
      notificationFrequency: "",
      mediaServerUrl: null,
      mediaServerInboundPort: null,
      mediaServerOutboundPort: null,
      timezoneValue: "",
      type: "Default",
      totalDaysOfRecording: 0,
      showTree: false,
      treeData: [],
      selectedRegion: "",
      notifysStatus: "",
      status: "",
      clientRegion: ""
    };
  }

  handleClientChange = (clientSelected) => {

    this.setState({ clientSelected, selectedRegion: '', treeData: [] });

    if (clientSelected) {
      this.setState({ clientId: clientSelected._id });
      this.getRegions({ clientId: clientSelected._id });
      this.getUserList(clientSelected._id);
    }
  };

  handleTranportChange1 = (value) => {
    let error = !value ? true : false;
    this.setState({ transportTypeValue1: value, TransportErr1: error });
  };

  handleTranportChange2 = (value) => {
    let error = !value ? true : false;
    this.setState({ transportTypeValue2: value, TransportErr2: error });
  };

  handleTagChange(tag) {
    this.setState({ tags: tag });
  };

  handleSmartDeviceChange(smartDevice) {
    this.setState({ smartDevices: smartDevice });
  };

  onCloseDeviceModal() {
    this.setState({ isOpenDeviceModal: false }, () => {
      if (this.ws) {
        this.wsCloseRequest = true;
        this.ws.close();
      }
    });
  }
  // handleImageChange(e) {
  //   e.preventDefault();
  //   let reader = new FileReader();
  //   let files = e.target ? e.target.files : [];
  //   if (files.length > 0) {
  //     let file = files[0];
  //
  //     reader.onloadend = () => {
  //       this.setState(
  //         {
  //           file: file,
  //           imageName: file.name,
  //           imagePreviewUrl: reader.result,
  //           originalImage: reader.result,
  //           mapImage: null,
  //         },
  //         () => {
  //           this.updateCanvas();
  //         }
  //       );
  //     };
  //     this.setState({
  //       weekDaysAccordian:this.state.weekDaysAccordian
  //     })
  //     reader.readAsDataURL(file);
  //     this.toggle();
  //   }
  // }


  handleImageChange = (files, result) => {
    // e.preventDefault();
    // let reader = new FileReader();
    // let files = e.target ? e.target.files : [];
    if (files.length > 0) {
      let file = files[0];
      // reader.onloadend = () => {
      this.setState({
        file: file,
        imageName: file.imageName,
        imagePreviewUrl: result,
        originalImage: result,
        mapImage: null
      }, () => {
        this.updateCanvas()
      });
      // }
      // reader.readAsDataURL(file);
      // this.toggle();
    }
  }

  saveMap = (base64CanvasImage, circles) => {
    // let base64CanvasImage = this.canvas.toDataURL();
    this.setState(
      {
        cameraCoordinates: circles,
        imagePreviewUrl: base64CanvasImage,
      },
      () => {
        this.toggle();
      }
    );
  };

  toggle = () => {
    this.setState(
      (prevState) => ({
        modal: !prevState.modal,
        selectedValues: [],
      }),
      () => {
        let { modal } = this.state;
        !modal && this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        !modal && this.removeEvents(this.canvas);
      }
    );
    this.count = 0;
    this.circles = [];
  };

  drawImageScaled(img, circles, isCommingFromEdit) {
    this.setState({ openLoader: false });
    let { ctx } = this;

    var canvas = ctx.canvas;
    this.offsetX = canvas.getBoundingClientRect().left;
    this.offsetY = canvas.getBoundingClientRect().top;
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    var hRatio = canvas.width / img.width;
    var vRatio = canvas.height / img.height;
    var ratio = Math.min(hRatio, vRatio);
    var centerShift_x = (canvas.width - img.width * ratio) / 2;
    var centerShift_y = (canvas.height - img.height * ratio) / 2;
    this.centerShift_x = centerShift_x;
    this.centerShift_y = centerShift_y;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      centerShift_x,
      centerShift_y,
      img.width * ratio,
      img.height * ratio
    );

    if (circles) {
      for (var i = 0; i < circles.length; i++) {
        var circle = circles[i];
        utils.drawCircle(
          circle,
          ctx,
          this.canvasHeight,
          this.canvasWidth,
          this.circles
        );
        ctx.fillStyle = circle.fill;
        ctx.fill();
        ctx.stroke();
      }
    }

    if (isCommingFromEdit) {
      this.addEventsToCanvas(canvas);
    }
  }

  updateCanvas = (circles, isCommingFromEdit) => {
    let { mapImage, originalImage } = this.state;
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    let img = new Image();
    img.onload = this.drawImageScaled.bind(
      this,
      img,
      circles,
      isCommingFromEdit
    );
    img.setAttribute("crossOrigin", "anonymous");
    img.src = mapImage ? mapImage : originalImage;
  };

  addCameraToCanvas = () => {
    let { count, props, state } = this;
    let { cameraData } = props;
    let data = cameraData.data.data;
    let noOfCamera = data && data.length;
    let noOfCircles = this.circles.length;
    let { newSelectedValue } = state;
    let newSelectedValueindex = -1;
    if (newSelectedValue.length > 0 && data) {
      newSelectedValueindex = data.findIndex((element) => {
        return element._id == newSelectedValue[0].value;
      });
    }
    if (count >= 300) {
      this.count = 0; // for circle reset to start position
    }
    if (noOfCamera > noOfCircles && newSelectedValueindex > -1) {
      let { canvas, count, circles, makeCircle, updateCanvas } = this;

      makeCircle(20, 20 + count, "salmon", data[newSelectedValueindex]);
      updateCanvas(circles);
      this.count = count + 40;
      this.addEventsToCanvas(canvas);
    } else {
      swal({
        title: "Error",
        text: "You have already added available cameras.",
        icon: "error",
      });
    }
  };

  makeCircle = (x, y, fill, camera) => {
    var circle = {
      x: x,
      y: y,
      r: 20,
      isDragging: false,
      fill: fill,
      cameraData: camera,
      camId: camera._id,
    };
    this.circles.push(circle);
  };

  handleMouseDown = (e) => {
    // tell the browser we're handling this mouse event
    e.preventDefault();
    e.stopPropagation();
    let mouseX = parseInt(e.clientX - this.offsetX);
    let mouseY = parseInt(e.clientY - this.offsetY);

    // mousedown stuff here
    this.lastX = mouseX;
    this.lastY = mouseY;
    for (var i = 0; i < this.circles.length; i++) {
      var circle = this.circles[i];
      var dx = circle.x - mouseX;
      var dy = circle.y - mouseY;
      if (dx * dx + dy * dy < circle.r * circle.r) {
        this.circles[i].isDragging = true;
        this.mouseIsDown = true;
      }
    }
  };

  handleMouseUp = (e) => {
    // tell the browser we're handling this mouse event
    e.preventDefault();
    e.stopPropagation();

    // mouseup stuff here
    this.mouseIsDown = false;
    for (var i = 0; i < this.circles.length; i++) {
      this.circles[i].isDragging = false;
    }
  };

  handleMouseMove = (e) => {
    if (!this.mouseIsDown) {
      return;
    }
    // tell the browser we're handling this mouse event
    e.preventDefault();
    e.stopPropagation();

    let mouseX = parseInt(e.clientX - this.offsetX);
    let mouseY = parseInt(e.clientY - this.offsetY);

    if (
      mouseY < this.centerShift_y + 18 ||
      mouseY > this.canvasHeight - (this.centerShift_y + 18)
    ) {
      return;
    }
    if (
      mouseX < this.centerShift_x + 18 ||
      mouseX > this.canvasWidth - (this.centerShift_x + 18)
    ) {
      return;
    }
    // mousemove stuff here
    for (var i = 0; i < this.circles.length; i++) {
      var circle = this.circles[i];
      if (circle.isDragging) {
        //move
        circle.x = mouseX;
        circle.y = mouseY;
      }
    }
    this.lastX = mouseX;
    this.lastY = mouseY;
    this.updateCanvas(this.circles);
  };

  getCameraNames = () => {
    let data = this.props.cameraData.data;
    let camera = data && data.data;
    let cameraNames = [];
    camera &&
      Array.isArray(camera) &&
      camera.forEach((element, index) => {
        if (element.status == utils.cameraStatus.Active) {
          cameraNames.push({ label: element.name, value: element._id });
        }
      });
    return cameraNames;
  };

  onSelectCamera = (selectedValues) => {
    const oldSelectedValues = this.state.selectedValues;

    // Get previous common values.
    let oldValues = oldSelectedValues.filter((oldValue) => {
      let index = selectedValues.findIndex((newValue) => {
        return newValue.value == oldValue.value;
      });
      return index == -1;
    });
    // Get current common values.
    let newValues = selectedValues.filter((newValue) => {
      let index = oldSelectedValues.findIndex((oldValue) => {
        return oldValue.value == newValue.value;
      });
      return index == -1;
    });

    // Merge previous and current common values.
    let updatedRecords = oldValues.concat(newValues),
      isSelectionUpdate = updatedRecords && updatedRecords.length > 0; // Check for new added or removed item.
    this.setState({ selectedValues, isApplyEnabled: isSelectionUpdate });

    if (newValues.length > 0) {
      this.setState({ newSelectedValue: newValues }, () => {
        this.addCameraToCanvas();
      });
    }
    if (oldValues.length > 0) {
      let index = this.circles.findIndex((element) => {
        return element.camId == oldValues[0].value;
      });
      if (index > -1) {
        this.circles.splice(index, 1);
      }
      this.updateCanvas(this.circles);
    }
  };

  editMap = () => {
    if (this.alreadyclicked) {
      this.alreadyclicked = false;
      this.alreadyclickedTimeout && clearTimeout(this.alreadyclickedTimeout);

      let { cameraCoordinates, originalImage, selectedValues } = this.state;
      let mapImage = null;
      if (!originalImage) {
        let { storeData } = this.props;
        if (storeData.data && storeData.data.cameraCoordinates) {
          mapImage = this.setMap(storeData.data.map);
        }
      }
      if (mapImage && cameraCoordinates.length == 0) {
        let { storeData, cameraData } = this.props,
          data = cameraData && cameraData.data,
          camera = data && data.data,
          activeCameraIds = [],
          newCameraCoordinate = [];

        camera &&
          Array.isArray(camera) &&
          camera.forEach((el) => {
            if (el.status == utils.cameraStatus.Active) {
              activeCameraIds.push({ id: el._id });
            }
          });

        activeCameraIds &&
          activeCameraIds.length > 0 &&
          activeCameraIds.map((el) => {
            storeData.data.cameraCoordinates.filter((element) => {
              if (element.camId == el.id) {
                newCameraCoordinate.push(element);
              }
            });
          });

        newCameraCoordinate &&
          newCameraCoordinate.length > 0 &&
          newCameraCoordinate.map((element) => {
            this.circles.push(element);
            selectedValues.push({
              label: element.cameraData.name,
              value: element.cameraData._id,
            });
          });
      } else {
        cameraCoordinates &&
          cameraCoordinates.map((element) => {
            this.circles.push(element);
            selectedValues.push({
              label: element.cameraData.name,
              value: element.cameraData._id,
            });
          });
      }

      this.setState(
        (prevState) => ({
          modal: !prevState.modal,
          selectedValues: selectedValues,
          openLoader: true,
        }),
        () =>
          setTimeout(() => {
            this.updateCanvas(this.circles, true);
          }, 500)
      );
    } else {
      this.alreadyclicked = true;
      this.alreadyclickedTimeout = setTimeout(() => {
        this.alreadyclicked = false;
      }, 300);
    }
  };

  addEventsToCanvas = (canvas) => {
    var me = this;
    if (!this.eventAdded) {

      this.eventAdded = true;
      canvas.addEventListener("mousedown", function (e) {
        me.handleMouseDown(e);
      });

      canvas.addEventListener("mouseup", function (e) {
        me.handleMouseUp(e);
      });
      canvas.addEventListener("mousemove", function (e) {
        me.handleMouseMove(e);
      });

      canvas.addEventListener("mouseleave", function (e) {
        this.mouseIsDown = false;
      });
    }
  };

  removeEvents = (canvas) => {
    var me = this;
    this.eventAdded = false;
    canvas.removeEventListener("mousedown", function (e) {
      me.handleMouseDown(e);
    });

    canvas.removeEventListener("mouseup", function (e) {
      me.handleMouseUp(e);
    });
    canvas.removeEventListener("mousemove", function (e) {
      me.handleMouseMove(e);
    });
  };

  setMap = (map) => {
    this.setState({
      mapImage:
        util.serverImageUrl + "/api/mapThumbnail/" + map + "/?v=" + Date.now(),
    });
    return util.serverImageUrl + "/api/mapThumbnail/" + map;
  };

  handleTimezoneValue = (timezoneValue) => {
    this.setState({ timezoneValue });
    if (timezoneValue) this.setState({ timeZoneErr: false });
  };

  onRowClick(index, record) { // NOTE - on Row click
    let { params } = this.props.match;
    if (this.alreadyclicked) {
      this.alreadyclicked = false;
      this.alreadyclickedTimeout && clearTimeout(this.alreadyclickedTimeout);
      //this.context.router.history.push('/admin/sites/addcamera/' + params.id + "/" + record._id);
      this.props.history.push(
        "/admin/site/" + params.id + "/addcamera/" + record._id
      );
    } else {
      this.alreadyclicked = true;
      this.alreadyclickedTimeout = setTimeout(() => {
        this.alreadyclicked = false;
      }, 300);
    }
  }

  damonAction = (action) => {
    const { serialNumber, siteId } = this.state;
    if (serialNumber) {
      this.props.dispatch(
        daemon.request(
          { serialKey: serialNumber, action: action, storeId: siteId },
          null,
          null,
          (res) => {
            swal({
              title: res.success ? "Success" : "Error",
              text: res.message,
              icon: res.success ? "success" : "error",
            });
          }
        )
      );
    }
  };

  onReverseSSH = () => {
    const { serialNumber } = this.state;
    if (serialNumber) {
      this.props.dispatch(reverseSSH.request({ serialKey: serialNumber }, null, null, (res) => {
        swal({ title: res.success ? "Success" : "Error", text: res.message, icon: res.success ? "success" : "error" });
      }));
    }
  }

  onStartVNC = () => {
    const { serialNumber } = this.state;
    if (serialNumber) {
      this.props.dispatch(startVNC.request({ serialKey: serialNumber }, null, null, (res) => {
        swal({ title: res.success ? "Success" : "Error", text: res.message, icon: res.success ? "success" : "error" });
      }));
    }
  }

  showRegion = (reg) => {

    this.setState({
      selectedRegion: reg.name,
      selectedRegionId: reg._id,
    });

    if (reg.name) this.setState({ RegionErr: false });
  };

  changeLiveMedia = (e) => {
    this.setState({ isAntMedia: e.target.value });
  };

  timePick1 = (ts, t, day, index) => {

    // let data = this.state.weekDaysAccordian;
    // let data = JSON.parse(JSON.stringify(this.state.weekDaysAccordian));
    let data = cloneDeep(this.state.weekDaysAccordian);
    data.map(async (x) => {
      if (x.day == day) {
        await x.timeLine.map((y, uni) => {
          if (uni == index) {
            y.start = t;

          }
          return y;
        });
        return x;
      } else {
        return x;
      }
    });

    this.setState({
      weekDaysAccordian: data,
      timeStart: t,
    });
  };

  timePick2 = async (ts, t, day, index) => {

    // let data = [...this.state.weekDaysAccordian];
    // let data = JSON.parse(JSON.stringify(this.state.weekDaysAccordian));
    let data = cloneDeep(this.state.weekDaysAccordian);
    // data = await
    data.map((x) => {
      if (x.day == day) {
        x.timeLine.map((y, uni) => {
          if (uni == index) {
            y.end = t;

          }
          return y;
        });
        if (x.timeLine.length > 1 && index != x.timeLine.length - 1) {
          x.timeLine[index + 1].start = t;
        }

        // return x;
      }
      // else {
      //   return x;
      // }
    });

    this.setState({
      weekDaysAccordian: data,
      timeEnd: t,
    });
  };
  changeRecordedVideMedia = (e) => {

    this.setState({
      isRecordedAntMedia: e.target.value,
    });
  };
  // copyLiveMedia = (e) => {
  //
  //   let value = "";
  //   if (this.state.isRecordedMediaSameAsLive) {
  //     value = false;
  //   } else {
  //     value = true;
  //   }
  // }
  //

  onDaemonUpgrade = () => {
    this.damonAction(daemonAction.DAEMON_UPGRADE);
  }

  onUploadDeviceLogs = () => {
    const { siteId } = this.state;
    if (siteId) {
      this.props.dispatch(uploadSiteLogs.request({ storeId: siteId }, null, null, (res) => {
        swal({ title: res.success ? "Success" : "Error", text: res.message, icon: res.success ? "success" : "error" });
      }));
    }
  }

  onRestartOss = () => {
    this.damonAction(daemonAction.RESTART);
  };

  onStopService = () => {
    this.damonAction(daemonAction.STOP);
  };

  onStartService = () => {
    this.damonAction(daemonAction.START);
  };

  onUpgradeService = () => {
    this.damonAction(daemonAction.UPGRADE);
  };
  showTree = () => {

    if (!this.state.showTree) {
      this.setState({ showTree: true });
    }
  };
  getRegions = async (clientSelected) => {

    let clientId = clientSelected.clientId ? clientSelected.clientId : clientSelected._id
    await instance
      .post(`${api.GET_REGIONS_BY_CLIENTID}/${clientId}`)
      .then((res) => {

        if (res.data.clientRegionsResult) {
          this.setState({
            treeData: res.data.clientRegionsResult,
          });
          this.getregionData(res.data.clientRegionsResult)
          // selectedRegion
        } else {
          this.setState({
            treeData: [],
            selectedRegion: "",
          });
        }
      })
      .catch((err) => {
        //
      });
    await this.setState({
      regionStatus: false,
    });
  };
  getregionData = (data) => {
    let { clientRegionId } = this.state

    data.forEach(x => {
      if (x._id == clientRegionId) {

        this.setState({ selectedRegion: x.name, RegionErr: false });

      } else {
        this.getregionData(x.items)
      }
    })
  }

  setSitesStatus = (status) => {
    this.setState({ hasDedicatedPort: !status, SSHportErr: false });
  };

  setVNCStatus = (status) => {
    this.setState({ hasDedicatedVNCPort: !status, VNCportErr: false });
  };
  // changeLiveMedia = (e) => {
  //
  //   this.setState({
  //     isAntMedia: e.target.value,
  //   });
  // };
  // timePick1 = (ts, t, day, index) => {
  //
  //   let data = this.state.weekDaysAccordian;
  //   data.map(async (x) => {
  //     if (x.day == day) {
  //       await x.timeLine.map((y, uni) => {
  //         if (uni == index) {
  //           y.start = t;
  //
  //         }
  //         return y;
  //       });
  //       return x;
  //     } else {
  //       return x;
  //     }
  //   });
  //
  //   this.setState({
  //     weekDaysAccordian: data,
  //     timeStart: t,
  //   });
  // };
  // timePick2 = async (ts, t, day, index) => {
  //
  //   let data = this.state.weekDaysAccordian;
  //   data = await data.map((x) => {
  //     if (x.day == day) {
  //       x.timeLine.map((y, uni) => {
  //         if (uni == index) {
  //           y.end = t;
  //
  //         }
  //         return y;
  //       });
  //       if (x.timeLine.length > 1 && index != x.timeLine.length - 1)
  //         x.timeLine[index + 1].start = t;
  //       return x;
  //     } else {
  //       return x;
  //     }
  //   });
  //
  //   this.setState({
  //     weekDaysAccordian: data,
  //     timeEnd: t,
  //   });
  // };
  changeRecordedVideMedia = (e) => {
    this.setState({ isRecordedAntMedia: e.target.value });
  };
  copyLiveMedia = (e) => {

    let value = "";
    if (this.state.isRecordedMediaSameAsLive) {
      value = false;
    } else {
      value = true;
    }
    //

    this.setState(
      {
        isRecordedMediaSameAsLive: value,
        TransportErr2: false,
        OutboundErr2: false,
        InboundErr2: false,
        MediaServerErr2: false
      },
      () => {
        //
        if (this.state.isRecordedMediaSameAsLive) {
          this.setState({
            recMediaServerInboundPort: this.state.mediaServerInboundPort,
            recMediaServerOutboundPort: this.state.mediaServerOutboundPort,
            recMediaServerUrl: this.state.mediaServerUrl,
            isRecordedAntMedia:
              this.state.isAntMedia == "antMedia"
                ? "recAntMedia"
                : "recNodeMedia",
            transportTypeValue2: this.state.transportTypeValue1,
          });
        } else {
          this.setState({
            recMediaServerInboundPort: "",
            recMediaServerOutboundPort: "",
            recMediaServerUrl: "",
            // isRecordedAntMedia: "",
            transportTypeValue2: "",
          });
        }
      }
    );
  };

  changeRecordEngine = (e) => {
    this.setState({ radioRecoEngine: e.target.value, playPortErr: false, livePortErr: false, usernameErr: false, PortErr: false, addressRecErr: false, PassErr: false });
  };

  selectEmail = (value, day, index, error) => {
    // let data = JSON.parse(JSON.stringify(this.state.weekDaysAccordian));
    let data = cloneDeep(this.state.weekDaysAccordian);
    data.map(async (x) => {
      if (x.day == day) {
        await x.timeLine.map((y, uni) => {
          if (uni == index) {
            y.emails = value;
            y.error = false;
            y.EmailError = error;
          }

          return y;
        });
        return x;
      } else {

        return x;
      }
    });

    this.setState({
      weekDaysAccordian: cloneDeep(data),
      selectedEmailNotify: { email: value, day: day },
    });
  };
  selectPhone = (value, day, index, error) => {

    // let data = JSON.parse(JSON.stringify(this.state.weekDaysAccordian));
    let data = cloneDeep(this.state.weekDaysAccordian)
    data.map(async (x) => {
      if (x.day == day) {
        await x.timeLine.map((y, uni) => {
          if (uni == index) {
            y.phone = value;
            y.error = false;
            y.PhoneError = error;
          }
          return y;
        });
        return x;
      } else {
        return x;
      }
    });

    this.setState({
      weekDaysAccordian: cloneDeep(data),
      selectedPhoneNotify: { phone: value, day: day },
    });
  };

  handleDropChange = (stateVar, option) => {
    this.setState({ [stateVar]: option });

    if (stateVar == "siteStreamConfig" && option) {
      this.setState({ siteStreamConfigError: false });
    } else if (stateVar == "siteStreamConfig" && !option) {
      this.setState({ siteStreamConfigError: true });
    } else {
      if (option.length) this.setState({ siteLogLevelError: false });
      else this.setState({ siteLogLevelError: true });
    }
  }

  addTimeSlot = (day) => {
    // let data = [...this.state.weekDaysAccordian];
    let data = cloneDeep(this.state.weekDaysAccordian);
    let selectedWeekday = data.find(option => option.day === day);
    // if (this.addTimeSlot) {
    let NewTimeLine = { start: "", end: "", emails: [], phone: [], delStatus: false };
    selectedWeekday.timeLine.push(NewTimeLine);
    this.setState({ weekDaysAccordian: data });
    // }
  }

  saveTimeSlots = async (day, id, copy) => {
    // e.preventDefault()

    let {
      weekDaysAccordian,
      entireDayStatus,
      timeEnd,
      timeStart,
      selectedPhoneNotify,
      weekDays,
      selectedEmailNotify,
      copyWeekDays,
    } = this.state;

    let data = [];
    // let weekDaysAccordianCopy = [...weekDaysAccordian];
    let weekDaysAccordianCopy = cloneDeep(weekDaysAccordian);

    // if ( weekDaysAccordian.day == day ) {
    let sendStartTime = "";
    if (
      timeEnd.length > 0 &&
      timeStart.length > 0 && selectedPhoneNotify &&
      selectedEmailNotify
    ) {
      data = await weekDaysAccordianCopy.map((x) => {
        if (x.day == day) {
          //
          x.timeLine = x.timeLine.map((y, index) => {
            let data = {
              start: timeStart,
              end: timeEnd,
              emails: selectedEmailNotify.email,
              phone: selectedPhoneNotify.phone,
              delStatus: true,
            };
            if (index == id) {
              if (y.delStatus == true) return y;
              else return data;
            } else {
              return y;
            }
          });
          // if(x.timeLine.length>0){
          //
          sendStartTime = x.timeLine[x.timeLine.length - 1].end;
          // }
          return x;
        } else {
          return x;
        }
        // x.timeLine.push(emptyData)
      });


      // data = await weekDaysAccordianCopy.map((x) => {
      //   if (x.day == day) {
      //     let emptyData = {
      //       start: sendStartTime,
      //       end: "",
      //       emails: [],
      //       phone: [],
      //       delStatus: false,
      //     };
      //     if (x.timeLine.length < 3) {
      //       x.timeLine.push(emptyData);
      //     }
      //     return x;
      //   } else {
      //     return x;
      //   }
      // });


      // let data1 = [...data];
      let data1 = cloneDeep(data);
      this.setState({
        weekDaysAccordian: data1,
        selectedEmailNotify: [],
        selectedPhoneNotify: [],
        timeEnd: "12:00 am",
        timeStart: sendStartTime,
      });
      // }

    }
    if (copy.copyWeekDays) {
      if (copyWeekDays.length > 0) {
        let data = {};


        // swal({
        //   title: "Status",
        //   text: "It will Override the timeslots",
        //   icon: "warning",
        //   showCancelButton: true,
        //   showConfirmButton: true,
        // }).then(
        // async function () {


        // weekDaysAccordianCopy.some((x) => {
        //   if (x.day == day) data = {...x};
        //   return x.day == day;
        // });

        // if( copyWeekDays.value == weekDaysAccordianCopy.day ) {
        let tempData = weekDaysAccordianCopy.find(x => x.day == day);

        copyWeekDays = await copyWeekDays.map(async (y) => {
          weekDaysAccordianCopy.map((x) => {
            if (x.day == y) {
              // if (x.day == y.value) {

              x.entireDay = tempData.entireDay;
              x.timeLine = cloneDeep(tempData.timeLine);
              return x;
            } else {
              return x;
            }
          });
        });

        this.setState({
          weekDaysAccordian: cloneDeep(weekDaysAccordianCopy)
        });
        // }
        // }.bind(this)
        // );
      }
    }
  };
  setDayStatus = async (e, day) => {
    //  this.setState({
    //    entireDayStatus:e.target.value
    //  })
    let value = e.target.value;
    let { weekDaysAccordian, entireDayStatus } = this.state;

    let data = [];

    data = await weekDaysAccordian.map((x) => {

      if (x.weekDay == day) {
        x.entireDay = value;


        if (value)
          x.timeLine = [
            { start: "12:00 am", end: "11:59 pm", emails: [], phone: [], delStatus: false },
          ];

        return x;
      } else {
        return x;
      }
    });
    this.setState({
      weekDaysAccordian: data,
      entireDayStatus: value,
    });
  };

  // checking validations on saving site data
  checkValidations = async () => { // NOTE - save site details
    const {
      notificationFrequency,
      notificationFrequencyErr,
      notifyStatus,
      siteLogLevelError,
      SerialKeyError,
      macAddressError,
      siteNameErr,
      siteName,
      latitude,
      longitude,
      timezoneValue,
      sitesAccordians,
      serialNumber,
      siteErrorLogLevel,
      macAddress,
      TransportErr1,
      OutboundErr1,
      InboundErr1,
      MediaServerErr1,
      mediaServerUrl,
      mediaServerOutboundPort,
      mediaServerInboundPort,
      transportTypeValue1,
      TransportErr2,
      OutboundErr2,
      InboundErr2,
      MediaServerErr2,
      recMediaServerUrl,
      recMediaServerOutboundPort,
      recMediaServerInboundPort,
      transportTypeValue2,
      usernameErr,
      playPortErr,
      livePortErr,
      PortErr,
      addressRecErr,
      PassErr,
      engPassword,
      engUserName,
      engAddress,
      enginePort,
      engineLivePort,
      enginePlaybackPort,
      radioRecoEngine,
      SSHportErr,
      siteStreamConfig,
      siteStreamConfigError,
      sshLocalServerPort,
      RecordingPermission,
      MediaPermission,
      hasDedicatedPort,
      weekDaysAccordian,
      timeZoneErr,
      RegionErr,
      selectedRegion,
      zipCode,
      hasDedicatedVNCPort,
      vncLocalServerPort,
      VNCportErr,
    } = this.state;

    // validating emails and phone numbers for each day starts
    let ErrorCount = 0;
    let data = await weekDaysAccordian.map((x) => {
      x.timeLine.forEach(t => {
        if (!t.emails.length && !t.phone.length && x.checked) {
          t.error = true;
          ErrorCount++;
          x.status = true;
        }
        if (t.EmailError || t.PhoneError) {
          ErrorCount++;
          x.status = true;
        }

      });
      return x;
    });
    // validating emails and phone numbers for each day ends

    // managing error states in case  first time visit to update and saving without fillin the required fields
    //
    this.setState({
      weekDaysAccordian: data,
      timeZoneErr: !timezoneValue || timezoneValue == "" ? true : false,
      RegionErr: selectedRegion ? false : true,
      SerialKeyError: !serialNumber ? true : false,
      macAddressError: !macAddress ? true : false,
      siteLogLevelError: !siteErrorLogLevel.length ? true : false,
      siteStreamConfigError: !siteStreamConfig ? true : false,
      TransportErr1: !transportTypeValue1 || (transportTypeValue1 && !transportTypeValue1.id) ? true : false,
      OutboundErr1: !mediaServerOutboundPort ? true : false,
      InboundErr1: !mediaServerInboundPort ? true : false,
      MediaServerErr1: !mediaServerUrl ? true : false,
      OutboundErr2: !recMediaServerOutboundPort ? true : false,
      InboundErr2: !recMediaServerInboundPort ? true : false,
      MediaServerErr2: !recMediaServerUrl ? true : false,
      TransportErr2: !transportTypeValue2 || (transportTypeValue2 && !transportTypeValue2.id) ? true : false,
    });

    let radioReco = radioRecoEngine === "Rex" || radioRecoEngine === "NVR";

    if (radioRecoEngine === "NVR" && !enginePlaybackPort) this.setState({ playPortErr: true });
    if (radioReco && !enginePort) this.setState({ PortErr: true });
    if (radioRecoEngine === "NVR" && !engineLivePort) this.setState({ livePortErr: true });
    if (radioReco && !engAddress) this.setState({ addressRecErr: true });
    if (radioReco && !engUserName) this.setState({ usernameErr: true });
    if (radioReco && !engPassword) this.setState({ PassErr: true });

    if (notifyStatus && notificationFrequency.length == 0) this.setState({ notificationFrequencyErr: true });

    if (hasDedicatedPort && !sshLocalServerPort) this.setState({ SSHportErr: true });

    if (hasDedicatedVNCPort && !vncLocalServerPort) this.setState({ VNCportErr: true });

    let NotValidAcc = -1;

    // for basic site info accordion fields
    if (siteName == "" || latitude == "" || zipCode == "" || zipCode.length > 10 || longitude == "" || !timezoneValue || timezoneValue == "" || siteLogLevelError || siteStreamConfigError || SerialKeyError || macAddressError || siteNameErr || !siteErrorLogLevel.length || !selectedRegion) {
      NotValidAcc = 0;

      // for Media Server accordion fields
    } else if (MediaPermission && (TransportErr1 || OutboundErr1 || InboundErr1 || MediaServerErr1 || TransportErr2 || OutboundErr2 || InboundErr2 || MediaServerErr2 || !transportTypeValue1.id || !mediaServerOutboundPort || !mediaServerInboundPort || !mediaServerUrl || !transportTypeValue2.id || !recMediaServerOutboundPort || !recMediaServerInboundPort || !recMediaServerUrl)) {
      NotValidAcc = 1;

      // for Recording accordion fields
    } else if (RecordingPermission && (usernameErr || playPortErr || livePortErr || PortErr || addressRecErr || PassErr || (radioRecoEngine === "NVR" && !enginePlaybackPort) || (radioReco && !enginePort) || (radioRecoEngine === "NVR" && !engineLivePort) || (radioReco && !engAddress) || (radioReco && !engUserName) || (radioReco && !engPassword))) {
      NotValidAcc = 2;

      // for Notification accordion fields
    } else if ((notifyStatus && (notificationFrequency.length == 0 || notificationFrequencyErr)) || ErrorCount) {
      NotValidAcc = 3;

      // for SSH Configuration accordion fields
    } else if (this.SSH_Permission && hasDedicatedPort && (!sshLocalServerPort || SSHportErr)) {
      NotValidAcc = 4;

      // for VNC Configuration accordion fields
    } else if (this.VNC_Permission && hasDedicatedVNCPort && (!vncLocalServerPort || VNCportErr)) {
      NotValidAcc = 5;
    }


    // if any of the required field is empty, open accordion and return false
    if (NotValidAcc > -1) {
      let NotValidAccDetails = sitesAccordians.find(item => item.id == NotValidAcc);
      if (NotValidAccDetails && !NotValidAccDetails.status) this.toggleAcc(NotValidAcc);
      // this.closeAllACC(NotValidAcc, NotValidAccDetails);

      return false
    } else return true;
  }

  saveSiteDetails = async (e) => { // NOTE - save site details
    e.preventDefault();
    let valid = await this.checkValidations();

    if (valid) {
      this.setState({ isLoading: true });
      let {
        userEmailsPhones,
        siteName,
        isAntMedia,
        transportTypeValue1,
        selectedRegionId,
        selectedRegion,
        zipCode,
        city,
        country,
        stateC,
        addressLine1,
        addressLine2,
        serialNumber,
        hasDedicatedPort,
        clientId,
        longitude,
        latitude,
        mediaServerUrl,
        isRecordedAntMedia,
        recordedMediaServerOutboundPort,
        recordedMediaServerInboundPort,
        recMediaServerUrl,
        mediaServerInboundPort,
        mediaServerOutboundPort,
        isRecordedMediaSameAsLive,
        timezoneValue,
        engUserName,
        engPassword,
        enginePort,
        enginePlaybackPort,
        engineLivePort,
        engRecoLocation,
        sitesNotes,
        weekDaysAccordian,
        siteId,
        imageName,
        macAddress,
        zipcodeErr,
        file,
        nvrAddress,
        radioRecoEngine,
        transportTypeValue2,
        engAddress,
        notifyStatus, imagePreviewUrl, notifysStatus,
        storeNotificationId, recMediaServerOutboundPort, recMediaServerInboundPort, activeStatus,
        sshLocalServerPort,
        siteErrorLogLevel,
        siteStreamConfig, sitesAccordians,
        notificationFrequency,
        vncLocalServerPort,
        hasDedicatedVNCPort,
      } = this.state;

      let siteStreamCon;
      if (siteStreamConfig) {
        siteStreamCon = siteStreamConfig.value;
      } else {
        // showing required field and also opening according if closed
        this.setState({ siteStreamConfigError: true });
        let basicInfoAcc = sitesAccordians.find(item => item.id == 0);
        if (basicInfoAcc && !basicInfoAcc.status) this.toggleAcc(0);
        return
      }

      let siteLogsLevel = [];
      if (siteErrorLogLevel) {
        siteErrorLogLevel.forEach(option => siteLogsLevel.push(option.value));
      }

      let checkedData = [];

      await weekDaysAccordian.forEach((x) => {
        if (x.checked) {
          checkedData.push(x);
        }
      });

      let finalDay = [];

      checkedData.forEach((y) => {
        let emptyWeek = {
          doW: "",
          entireDay: false,
          timeSlot: [],
        };
        emptyWeek.doW = y.day;
        emptyWeek.entireDay = y.entireDay;
        if (y.timeLine.length > 0) {
          y.timeLine.forEach(x => {
            let timeSlot = {
              StartTime: "",
              EndTime: "",
              emailNotificationUsers: [],
              smsNotificationUsers: [],
              emailNotificationTo: [],
              smsNotificationTo: [],
            };
            timeSlot.StartTime = x.start;
            timeSlot.EndTime = y.entireDay ? "12:00 am" : x.end;
            //
            userEmailsPhones = userEmailsPhones ? userEmailsPhones : []
            if (userEmailsPhones.length == 0) {
              timeSlot.emailNotificationTo = x.emails;
              timeSlot.smsNotificationTo = x.phone
            }
            userEmailsPhones.forEach((m) => {

              x.emails = x.emails ? x.emails : []
              x.emails.forEach((n) => {
                if (m._id != n) {
                  let find = timeSlot.emailNotificationTo.find(x => x == n)
                  let find2 = userEmailsPhones.find(x => x._id == n)
                  if (!find && !find2)
                    timeSlot.emailNotificationTo.push(n);
                } else {
                  let find = timeSlot.emailNotificationUsers.find(x => x == m._id)
                  if (!find)
                    timeSlot.emailNotificationUsers.push(m._id);
                }

              });

              x.phone.forEach((n) => {
                if (m._id != n) {
                  let find = timeSlot.smsNotificationTo.find(x => x == n)
                  let find2 = userEmailsPhones.find(x => x._id == n)
                  if (!find && !find2)
                    timeSlot.smsNotificationTo.push(n);
                } else {
                  let find = timeSlot.smsNotificationUsers.find(x => x == m._id)
                  if (!find)
                    timeSlot.smsNotificationUsers.push(m._id);
                }
              });
            });
            //
            // userEmailsPhones.forEach((m) => {
            //   //
            //   x.phone.forEach((n) => {
            //     if (m._id != n) {
            //       let find = timeSlot.smsNotificationTo.find(x => x == n)
            //       let find2 = userEmailsPhones.find(x => x._id == n)
            //       if (!find && !find2)
            //         timeSlot.smsNotificationTo.push(n);
            //     } else {
            //       let find = timeSlot.smsNotificationUsers.find(x => x == m._id)
            //       if (!find)
            //         timeSlot.smsNotificationUsers.push(m._id);
            //     }
            //   });
            // });

            emptyWeek.timeSlot.push(timeSlot)

          });
        }
        finalDay.push(emptyWeek)
      });



      let data = {
        name: siteName,
        isAntMedia: isAntMedia == "antMedia" ? true : false,
        liveVideoConfig: transportTypeValue1.id,
        storeType: "",
        serialNumber: serialNumber,
        clientId: clientId,
        addressLine1: addressLine1,
        addressLine2: addressLine2,
        city: city,
        state: stateC,
        country: country,
        zipCode: zipCode,
        clientRegion: selectedRegionId ? selectedRegionId : selectedRegionId,
        version: "",
        lastConnectedOn: "",
        lastInvoiceId: 0,
        lastVoidItemId: 0,
        isDeleted: 0,
        createdByUserId: 1,
        tags: [],
        storeNotes: sitesNotes,
        videoDir: "",
        driveLists: "",
        zipcodeErr: "",
        latitude: latitude,
        longitude: longitude,
        mobile: "",
        map: imageName, // NOTE - imagename
        timezoneOffset: 9,
        isSMSEnable: 0,
        timeZone: 7,
        siteOnMonitor: false,
        email: "",
        lastStatus: "",
        notificationFrequency: notificationFrequency,
        mediaServerUrl: mediaServerUrl,
        mediaServerInboundPort: mediaServerInboundPort,
        mediaServerOutboundPort: mediaServerOutboundPort,
        isRecordedMediaSameAsLive: isRecordedMediaSameAsLive,
        isRecordedAntMedia: isRecordedAntMedia == "recAntMedia" ? true : false,
        recordedMediaServerUrl: recMediaServerUrl,
        recordedMediaServerInboundPort: recMediaServerInboundPort,
        recordedMediaServerOutboundPort: recMediaServerOutboundPort,
        recordedVideoConfig: transportTypeValue2.id,
        timezoneValue: timezoneValue,
        macAddress: macAddress,
        isNvr: radioRecoEngine == "Rex" ? true : false,
        nvrUsername: engUserName,
        nvrPassword: engPassword,
        nvrPort: enginePort,
        nvrAddress: engAddress,
        nvrLivePort: engineLivePort,
        nvrPlaybackPort: enginePlaybackPort,
        recordingLocation: engRecoLocation,
        type: radioRecoEngine,
        totalDaysOfRecording: 0,
        storeNotificationEnabled: notifyStatus,
        status: notifysStatus,
        storeNotificationId: storeNotificationId,
        storeNotificationSettings: [
          true
        ],
        notification: {
          day: finalDay
        },
        hasDedicatedPort: hasDedicatedPort,
        sshLocalServerPort: sshLocalServerPort,
        vncLocalServerPort: vncLocalServerPort,
        hasDedicatedVNCPort: hasDedicatedVNCPort,
        siteErrorLogLevel: siteLogsLevel,
        siteStreamConfig: siteStreamCon
      };


      let reqPayload = {}
      var body = new FormData()

      body.append('action', 'update')
      body.append('data', JSON.stringify(data))
      body.append('addStore', true)
      body.append('file', file ? file : null)
      body.append('thumbnail', imagePreviewUrl ? imagePreviewUrl : null)

      instance.post(`${api.STORE_DATA}/${siteId}`, body)
        .then(res => {
          this.setState({ isLoading: false });
          if (res.data.message && res.data.message == "Record updated successfully.") {
            swal({
              title: "Updated",
              text: "Updated sucessfully ",
              icon: "success",
              // buttons: true,
              dangerMode: true,
              // showConfirmButton: true,
              // showCancelButton: true,
              showConfirmButton: true,
            }).then(
              function (value) {
                if (value) {
                  // this.props.history.goBack(-1);
                  // this.props.history.push(`/admin/sites`)
                }
                else {

                }
              }.bind(this)
            );
          } else {
            swal({
              title: "Error",
              text: res.data.errmsg,
              icon: "error",
              // buttons: true,
              dangerMode: true,
              // showConfirmButton: true,
              // showCancelButton: true,
              showConfirmButton: true,
            })
          }
          // window.location.reload()
        }).catch(err => {

          this.setState({ isLoading: false });
        });
    }

  };


  render = () => { // NOTE - render
    const {
      state,
      onCancel,
      props,
      onDelete,
      isUpdate,
      addCamera,
      onScanDevice,
      onCloseDeviceModal,
      onRestartOss,
      onStartService,
      onStopService,
      onUpgradeService,
      onDaemonUpgrade,
      onReverseSSH,
      onUploadDeviceLogs,
      onStartVNC
    } = this;
    const {
      columns,
      activeTab,
      imageName,
      tags,
      smartDevices,
      isOpenDeviceModal,
      scanDevices,
      isScanning,
      deviceError,
      imagePreviewUrl,
      modal,
      selectedValues,
      autoSerialNumber,
      openLoader,
      siteNameErr,
      zipcodeErr,
      siteConfigOptions,
      RegionErr,
      siteStreamConfig,
      siteErrorLogLevel,
      siteStreamConfigError,
      TransportErr1,
      OutboundErr1,
      InboundErr1,
      MediaServerErr1,
      TransportErr2,
      OutboundErr2,
      InboundErr2,
      MediaServerErr2,
      usernameErr,
      playPortErr,
      livePortErr,
      PortErr,
      addressRecErr,
      PassErr,
      SSHportErr,
      driveLists,
      isLoading,
    } = state;
    const {
      listAction,
      actionName,
      sortColumn,
      sortDirection,
      localPaging,
      match,
      initialValues,
      setFieldValue,
      isDisabled,
      isClicked
    } = props;
    const { name } = initialValues || { name: "" };
    // const { Status } = consts;
    const initialValuesEdit = isUpdate
      ? initialValues
      : this.getInitialValueTemplate;

    const storeId = match && match.params && Number(match.params.id);
    const user = utils.getLoggedUser();

    const storeTypeOptions = [
      { value: "Department", label: "Department" },
      { value: "Supermarket", label: "Supermarket" },
      { value: "Grocer", label: "Grocer" },
      { value: "Baker", label: "Baker" },
      { value: "Hardware", label: "Hardware" },
      { value: "Bookshop", label: "Bookshop" },
      { value: "Petshop", label: "Petshop" },
      { value: "Petrol station", label: "Petrol station" },
      { value: "Shoe", label: "Shoe" },
      { value: "Clothes", label: "Clothes" },
      { value: "Shopping Centre", label: "Shopping Centre" },
      { value: "Market", label: "Market" },
      { value: "Music", label: "Music" },
      { value: "Toy", label: "Toy" },
      { value: "Jewellery", label: "Jewellery" },
    ];

    const liveVideoConfigOptions = [
      { value: "WebRTC", label: "WebRTC" },
      { value: "HLS", label: "HLS" },
      { value: "FLV", label: "FLV" },
      { value: "NodeMedia", label: "Node Media" },
    ];

    const siteTypeOptions = [
      { value: "Default", label: "Default" },
      { value: "Rex", label: "Rex" },
      { value: "Nvr", label: "IPC" },
    ];

    let CameraFilters = [{ value: match.params.id, property: "storeId", type: "string" }];
    // if (!this.state.showCovertCamera) CameraFilters.push({ value: false, property: "covertCamera", type: "boolean" });

    // const siteConfigOptions = [
    //   { value: 'LowStreamOnly', label: 'Low Stream Always' },
    //   { value: 'OnDemand', label: 'On Demand' },
    //   { value: 'LowHighAlways', label: 'High Stream Always' }
    // ]
    const siteErrorLogLevelOption = [
      { value: 'Error', label: 'Error' },
      { value: 'Trace', label: 'Trace' },
      { value: 'Debug', label: 'Debug' }
    ]

    let {
      combos,
      clientSelected,
      timezoneValue,
      showTree,
      treeData,
      selectedRegion,
      clientList,
      sitesAccordians,
      hasDedicatedPort,
      sshLocalServerPort,
      siteId,
      addressLine1,
      city,
      stateC,
      siteName,
      addressLine2,
      country,
      zipCode,
      latitude,
      longitude,
      serialNumber,
      macAddress,
      isAntMedia,
      mediaServerInboundPort,
      mediaServerOutboundPort,
      mediaServerUrl,
      isRecordedMediaSameAsLive,
      transportType,
      longitudeErr,
      latitudeErr,
      timeZoneErr,
      notificationFrequencyErr,
      isRecordedAntMedia,
      recMediaServerOutboundPort,
      recMediaServerInboundPort,
      recMediaServerUrl,
      engAddress,
      weekDaysAccordian,
      enginePort,
      engineLivePort,
      enginePlaybackPort,
      radioRecoEngine,
      engPassword,
      engUserName,
      engRecoLocation,
      selectedPhoneNotify,
      notifyStatus,
      notifysStatus,
      // notifyEmailList,
      entireDayStatus,
      selectedEmailNotify,
      timeEnd,
      timeStart,
      copyWeekDays,
      sitesNotes,
      userEmailsPhones,
      // notifyPhoneList,
      weekDays,
      clientId,
      clientRegion,
      transportTypeValue1,
      transportTypeValue2,
      copyWeekdaysOptions,
      showCovertCamera,
      notificationFrequency,
      siteLogLevelError, SerialKeyError, macAddressError,
      vncLocalServerPort,
      hasDedicatedVNCPort,
      VNCportErr,
    } = this.state;



    let { client } = combos || {};
    let { storeData, daemon } = this.props;
    let isFetching = storeData && storeData.isFetching;
    isFetching =
      isFetching ||
      (storeData && storeData.isFetching) ||
      (daemon && daemon.isFetching) ||
      isScanning;

    let loadingMessage = isScanning ? { message: "Scanning..." } : {};
    let imagePreview = null;
    let version = "/?v=" + moment().format(util.dateTimeFormat);
    //
    imagePreview = imagePreviewUrl ? (
      <img src={imagePreviewUrl} style={{ width: "100% ", height: "100%" }} />
    ) : (
      storeData &&
      storeData.data &&
      storeData.data.map &&
      match.params.id && (
        <img
          src={
            imagePreviewUrl
              ? imagePreviewUrl
              // : util.serverUrl +
              : util.serverImageUrl +
              "/api/mapThumbnail/" +
              match.params.id +
              ".png" +
              version
          }
        />
      )
    );
    const driveListOptions = utils.selectOptionGenerator(
      driveLists,
      "drivePath",
      "drivePath"
    );
    return (
      <div className="animated fadeIn">
        <LoadingDialog isOpen={isLoading} />
        <Row>
          {/* <LoadingDialog isOpen={isFetching} /> */}
          <Col md={12}>
            <form autoComplete="off"
            //  onSubmit={(e)=>this.onSave(e)}
            >
              <CardWrapper lg={12} footer={
                !this.state.cameraSiteVisible &&
                <div className={'form-button-group'}>
                  <div><button type="submit" className="btn formButton" title="Save" onClick={(e) => this.saveSiteDetails(e)} ><i className="fa fa-save" aria-hidden="true"></i> Save</button></div>
                  <div> <button type="button" className="btn formButton" title="Cancel" onClick={() => this.onCancel()} ><i className="fa fa-close" aria-hidden="true"></i> Cancel</button></div>
                  {
                    isUpdate && (
                      <>
                        <div>
                          <button type="button" className="btn formButton" onClick={onDelete}>
                            <i className="fa fa-trash" aria-hidden="true"></i> Delete
                          </button>
                        </div>
                        <div>
                          <button type="button" className="btn formButton" onClick={onScanDevice}>
                            <i className="fa fa-qrcode" aria-hidden="true"></i> Scan Device
                          </button>
                        </div>
                        <div>
                          <button type="button" className="btn formButton" onClick={onRestartOss}>
                            <i className="fa fa-refresh" aria-hidden="true"></i> Restart Rex
                          </button>
                        </div>
                        <div>
                          <button type="button" className="btn formButton" onClick={onStartService}>
                            <i className="fa fa-play" aria-hidden="true"></i> Start Service
                          </button>
                        </div>
                        <div>
                          <button type="button" className="btn formButton" onClick={onStopService}>
                            <i className="fa fa-stop" aria-hidden="true"></i> Stop Service
                          </button>
                        </div>
                        <div>
                          <button type="button" className="btn formButton" onClick={onUpgradeService}>
                            <i className="fa fa-level-up" aria-hidden="true"></i> OSS Upgrade
                          </button>
                        </div>
                        <div>
                          <button type="button" className="btn formButton" onClick={onDaemonUpgrade}>
                            <i className="fa fa-level-up" aria-hidden="true"></i> Daemon Upgrade
                          </button>
                        </div>
                        {this.SSH_Permission ? (
                          <div>
                            <button type="button" className="btn formButton" onClick={onReverseSSH}>
                              <i className="fa fa-terminal" aria-hidden="true"></i> Request SSH
                            </button>
                          </div>
                        ) : (
                          ""
                        )}
                        {this.VNC_Permission ? (
                          <div>
                            <button type="button" className="btn formButton" onClick={onStartVNC}>
                              <i className="fa fa-terminal" aria-hidden="true"></i> Start VNC
                            </button>
                          </div>
                        ) : (
                          ""
                        )}
                        <div>
                          <button
                            type="button"
                            className="btn formButton"
                            onClick={onUploadDeviceLogs}
                          >
                            <i className="fa fa-upload" aria-hidden="true"></i> Upload Logs
                          </button>
                        </div>
                      </>
                    )
                  }
                </div>
              }>
                <LoadingDialog {...loadingMessage} isOpen={isFetching} />

                {!this.state.cameraSiteVisible && (
                  <div className="child-record site_details_page">
                    <CardWrapper
                      lg={12}
                      title={isUpdate ? name : "Create new store"}
                      subTitle={
                        <div className="site-tab-holder" style={{ margin: "0px 6px" }}>
                          <div
                            className="site-tab site-tab-active card-title" style={{ cursor: "pointer" }}
                            onClick={() => this.setState({ cameraSiteVisible: false })}
                          >
                            Site Details
                          </div>
                          <>
                            <div className="site-tab card-title">
                              <div onClick={this.onCameraClick} className="site-tab-link" style={{ cursor: "pointer" }}>
                                Cameras
                            </div>
                            </div>
                            <div className="site-tab card-title">
                              <div onClick={this.onSmartDeviceClick} className="site-tab-link" style={{ cursor: "pointer" }}>
                                Smart Device
                            </div>
                            </div>
                          </>
                          {/* :""} */}
                          {/* to={{pathname: '/admin/addcamera/' + values._id}} */}
                        </div>
                      }
                    >
                      <BasicInfoCollapse // NOTE - basic-info collapse
                        addressLine1={addressLine1}
                        addressLine2={addressLine2}
                        cameraData={this.props.cameraData}
                        city={city}
                        country={country}
                        clientList={clientList}
                        clientSelected={clientSelected}
                        colourStyles={colourStyles}
                        enableStatus={this.enableStatus}
                        handleChange={this.handleChange}
                        handleClientChange={this.handleClientChange}
                        handleDropChange={this.handleDropChange}
                        handleImageChange={this.handleImageChange}
                        handleTimezoneValue={this.handleTimezoneValue}
                        handleZipCode={this.handleZipCode}
                        item={sitesAccordians.filter(item => item.siteName === 'Basic Info')[0]}
                        imageName={imageName}
                        imagePreviewUrl={imagePreviewUrl}
                        latitude={latitude}
                        latitudeErr={latitudeErr}
                        longitude={longitude}
                        longitudeErr={longitudeErr}
                        macAddress={macAddress}
                        macAddressError={macAddressError}
                        onSelectCamera={this.onSelectCamera}
                        notifysStatus={notifysStatus}
                        paramsid={this.props.match.params.id}
                        RegionErr={RegionErr}
                        saveMap={this.saveMap}
                        selectedRegion={selectedRegion}
                        serialNumber={serialNumber}
                        showRegion={this.showRegion}
                        siteId={siteId}
                        siteName={siteName}
                        siteErrorLogLevel={siteErrorLogLevel}
                        siteErrorLogLevelOption={siteErrorLogLevelOption}
                        siteHandleChange={this.handleChange}
                        siteLogLevelError={siteLogLevelError}
                        siteNameErr={siteNameErr}
                        sitesNotes={sitesNotes}
                        siteStreamConfig={siteStreamConfig}
                        siteStreamConfigError={siteStreamConfigError}
                        stateC={stateC}
                        storeData={storeData}
                        timezoneValue={timezoneValue}
                        timeZoneErr={timeZoneErr}
                        toggleAcc={this.toggleAccForward}
                        treeData={treeData}
                        zipCode={zipCode}
                        zipcodeErr={zipcodeErr}
                      />
                      {
                        utils.ifPermissionAssigned('functionId', 'Media Server') && (
                          <MediaServerCollapse // NOTE - media server collapse
                            changeLiveMedia={this.changeLiveMedia}
                            changeRecordedVideMedia={this.changeRecordedVideMedia}
                            copyLiveMedia={this.copyLiveMedia}
                            colourStyles={colourStyles}
                            handleChange={this.handleChange}
                            handleTranportChange1={this.handleTranportChange1}
                            handleTranportChange2={this.handleTranportChange2}
                            isAntMedia={isAntMedia}
                            InboundErr1={InboundErr1}
                            InboundErr2={InboundErr2}
                            isRecordedAntMedia={isRecordedAntMedia}
                            isRecordedMediaSameAsLive={isRecordedMediaSameAsLive}
                            // item={{ id: 1, siteName: "Media Server", status: false }}
                            item={sitesAccordians.filter(item => item.siteName === 'Media Server')[0]}
                            mediaServerInboundPort={mediaServerInboundPort}
                            mediaServerOutboundPort={mediaServerOutboundPort}
                            MediaServerErr1={MediaServerErr1}
                            MediaServerErr2={MediaServerErr2}
                            mediaServerUrl={mediaServerUrl}
                            OutboundErr1={OutboundErr1}
                            OutboundErr2={OutboundErr2}
                            recMediaServerInboundPort={recMediaServerInboundPort}
                            recMediaServerOutboundPort={recMediaServerOutboundPort}
                            recMediaServerUrl={recMediaServerUrl}
                            toggleAcc={this.toggleAccForward}
                            transportType={transportType}
                            transportTypeValue1={transportTypeValue1}
                            transportTypeValue2={transportTypeValue2}
                            TransportErr1={TransportErr1}
                            TransportErr2={TransportErr2}
                          />
                        )
                      }
                      {
                        utils.ifPermissionAssigned('functionId', 'Recording') && (
                          <RecordingCollapse // NOTE - recording collapse
                            addressRecErr={addressRecErr}
                            changeRecordEngine={this.changeRecordEngine}
                            driveLists={driveLists}
                            engAddress={engAddress}
                            engineLivePort={engineLivePort}
                            enginePort={enginePort}
                            enginePlaybackPort={enginePlaybackPort}
                            engPassword={engPassword}
                            engRecoLocation={engRecoLocation}
                            engUserName={engUserName}
                            handleChange={this.handleChange}
                            // item={{ id: 2, siteName: "Recording" }}
                            item={sitesAccordians.filter(item => item.siteName === 'Recording')[0]}
                            livePortErr={livePortErr}
                            PassErr={PassErr}
                            PortErr={PortErr}
                            playPortErr={playPortErr}
                            radioRecoEngine={radioRecoEngine}
                            toggleAcc={this.toggleAccForward}
                            usernameErr={usernameErr}
                          />
                        )
                      }
                      <NotificationsCollapse // NOTE - notification collapse
                        addTimeSlot={this.addTimeSlot}
                        cleintId={clientId}
                        copyWeekDays={this.copyWeekDays}
                        deleteTimeSlot={this.deleteTimeSlot}
                        enableNotification={this.enableNotification}
                        entireDayStatus={entireDayStatus}
                        handleChange={this.handleChange}
                        isClicked={isClicked}
                        // item={{ id: 3, siteName: "Notifications" }}
                        item={sitesAccordians.filter(item => item.siteName === 'Notifications')[0]}
                        notificationFrequency={notificationFrequency}
                        notificationFrequencyErr={notificationFrequencyErr}
                        notifyStatus={notifyStatus}
                        saveTimeSlots={this.saveTimeSlots}
                        selectDays={this.selectDays}
                        selectEmail={this.selectEmail}
                        selectPhone={this.selectPhone}
                        selectedEmailNotify={selectedEmailNotify}
                        selectedPhoneNotify={selectedPhoneNotify}
                        setDayStatus={this.setDayStatus}
                        timeEnd={timeEnd}
                        timePick1={this.timePick1}
                        timePick2={this.timePick2}
                        timeStart={timeStart}
                        toggleAcc={this.toggleAccForward}
                        toggleAccWeek={this.toggleAccWeek}
                        userEmailsPhones={userEmailsPhones}
                        weekDaysAccordian={weekDaysAccordian}
                      />
                      {
                        utils.ifPermissionAssigned('functionId', "SSH Configuration ") && (
                          <SSHConfgurationCollapse // NOTE - ssh collapse
                            handleChange={this.handleChange}
                            hasDedicatedPort={hasDedicatedPort}
                            // item={{ id: 4, siteName: "SSH Configuration" }}
                            item={sitesAccordians.filter(item => item.siteName === 'SSH Configuration')[0]}
                            setSitesStatus={this.setSitesStatus}
                            sshLocalServerPort={sshLocalServerPort}
                            SSHportErr={SSHportErr}
                            toggleAcc={this.toggleAccForward}
                          />
                        )
                      }
                      {
                        utils.ifPermissionAssigned('functionId', "VNC Configuration") && (
                          <VNCConfigurationCollapse // NOTE - vnc collapse
                            handleChange={this.handleChange}
                            hasDedicatedVNCPort={hasDedicatedVNCPort}
                            item={{ id: 5, siteName: "VNC Configuration" }}
                            item={sitesAccordians.filter(item => item.siteName === 'VNC Configuration')[0]}
                            setVNCStatus={this.setVNCStatus}
                            toggleAcc={this.toggleAccForward}
                            vncLocalServerPort={vncLocalServerPort}
                            VNCportErr={VNCportErr}
                          />
                        )
                      }
                    </CardWrapper>
                  </div>
                )}

                {(this.state.cameraSiteVisible && isNaN(storeId)) || storeId ? (
                  <div className="child-record">
                    <CardWrapper
                      lg={12}
                      title={isUpdate ? name : "Create new store"}
                      subTitle={
                        <div className="site-tab-holder" style={{ margin: "0px 6px" }}>
                          <div
                            className="site-tab card-title" style={{ cursor: "pointer" }}
                            onClick={() => this.setState({ cameraSiteVisible: false })}
                          >
                            Site Details
                          </div>
                          <div className="site-tab site-tab-active card-title">
                            <div onClick={this.onCameraClick} className="site-tab-link" style={{ cursor: "pointer" }}>
                              Cameras
                            </div>
                          </div>
                          <div className="site-tab card-title">
                            <div onClick={this.onSmartDeviceClick} className="site-tab-link" style={{ cursor: "pointer" }}>
                              Smart Device
                            </div>
                          </div>
                        </div>
                      }
                    >
                      <TabContent activeTab={activeTab} className="sitecamera_table">
                        <TabPane>
                          <Row>
                            <Col>
                              <Grid
                                listAction={listAction}
                                dataProperty={actionName}
                                columns={columns}
                                autoHeight={true}
                                filename={"Camera"}
                                defaultSort={{
                                  sortColumn: sortColumn,
                                  sortDirection: sortDirection,
                                }}
                                localPaging={localPaging || false}
                                onRowClick={this.onRowClick.bind(this)}
                                exportButton={true}
                                add={addCamera}
                                childFilter={this.props.match.params.id}
                                pageSize="4"
                                height={300}
                                filters={CameraFilters}
                                populate={"cameraBrand"}
                                action="get"
                                covert={showCovertCamera}
                              />
                            </Col>
                          </Row>
                        </TabPane>
                      </TabContent>
                    </CardWrapper>
                  </div>
                ) : null}

                <Modal
                  isOpen={isOpenDeviceModal && !isScanning}
                  className={"popup-sales dashboard-widget"}
                  style={{ maxWidth: 400 }}
                >
                  <ModalHeader
                    className={"widgetHeaderColor"}
                    toggle={onCloseDeviceModal}
                  >
                    Scanned Devices
                  </ModalHeader>
                  <ModalBody className={"reorderBody"}>
                    {(!isScanning && deviceError == "") || deviceError == null ? (
                      <p className="scannedText">{`${(scanDevices && scanDevices.length) || 0
                        } devices were found.`}</p>
                    ) : (
                      <p className="scannedText">{deviceError}</p>
                    )}
                    <ListGroup>
                      {scanDevices &&
                        scanDevices.length > 0 &&
                        Array.isArray(scanDevices) &&
                        scanDevices.map(this.renderScanDevices, this)}
                    </ListGroup>
                  </ModalBody>
                </Modal>
                {/* <Modal // NOTE Canvas modal
                  isOpen={modal}
                  toggle={() => this.toggle()}
                  className={"modal-parent ImageModalML"}
                >
                  <ModalHeader
                    className="site-map-upload-header pt-2 pb-2"
                    toggle={() => this.toggle()}
                  >
                    <span className="site-map-upload">Add Camera On Map</span>
                    <Tooltip placement="bottom" title={<TooltipContent />}>
                      <i
                        className="fa fa-question-circle fa-2x add-map-help"
                        aria-hidden="true"
                      ></i>
                    </Tooltip>
                  </ModalHeader>
                  <ModalBody>
                    <LoadingDialog {...loadingMessage} isOpen={openLoader} />
                    <div className="canvas-display">
                      <canvas id="canvas" width={582} height={425} />
                      <div className="add-map-camera-list">
                        <div className="site-map-upload text-center">
                          <b>Available Camera</b>
                        </div>
                        <Select
                          isClearable={true}
                          value={selectedValues}
                          onChange={(selectedValues) =>
                            this.onSelectCamera(selectedValues)
                          }
                          options={this.getCameraNames()}
                          isMulti
                          menuIsOpen
                          hideSelectedOptions={false}

                          className="custom-select-list ImageModalwidth"
                        />
                      </div>
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button className="btn formButton" onClick={() => this.saveMap()}>
                      Save
                    </Button>{" "}
                    <Button className="btn formButton" onClick={() => this.toggle()}>
                      Cancel
                    </Button>
                  </ModalFooter>
                </Modal> */}
              </CardWrapper>
            </form>
          </Col>
        </Row>
      </div >
    );
  }
}


AddStore.defaultProps = {
  listAction: cameraData,
  actionName: "cameraData",
};

AddStore.contextTypes = {
  router: PropTypes.object.isRequired,
};

function mapStateToProps(state, ownProps) {
  const { storeData } = state;
  const { data } = storeData;


  return {
    initialValues: data && data.data ? data.data : data || {},
    storeData: state.storeData,
    getCombos: state.getCombos,
    storesData: state.storesData,
    cameraData: state.cameraData,
    storeChange: state.storeChange,
    daemon: state.daemon,
    weekDays1: state.weekDays1
  };
}

var AddStoreModule = connect(mapStateToProps)(AddStore);
export default AddStoreModule;
