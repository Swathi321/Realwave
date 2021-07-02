import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import Grid from '../Grid/GridBase';
import {
  Col,
  FormGroup,
  Input,
  Label, Row, TabContent, TabPane, Nav, NavItem,
  NavLink, Progress, Modal, ModalHeader, ModalBody,
  ModalFooter, ListGroupItem, ListGroup, Button, Form
} from 'reactstrap';
import { storeData, storesData, getCombos, cameraData, saveActivityLog, daemon } from '../../redux/actions/httpRequest';

import PropTypes from 'prop-types';
import swal from 'sweetalert';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CardWrapper from './../../component/CardWrapper';
import LoadingDialog from './../../component/LoadingDialog';
import utils from './../../Util/Util';
import classnames from 'classnames';
import consts from '../../Util/consts'
import Select from 'react-select';
import TagsInput from 'react-tagsinput';
import util from '../../Util/Util';
import { Tooltip } from 'antd';
import moment from 'moment';
import 'react-tagsinput/react-tagsinput.css';
import io from 'socket.io-client';
import Switch from "react-switch";
import TimezonePicker from 'react-timezone';
import Geocode from "react-geocode";
import axios from 'axios';
import '../User/styles.scss';



const DriveProgressBar = (props) => {
  let { drives } = props;
  return <Row className="driveLists">
    {drives.map((d, i) => {
      let drivePercentage = ((d.driveInfo.used * 100) / d.driveInfo.total).toFixed(0);
      let processClass = 0 < drivePercentage && drivePercentage < 60 ? "success" : 60 < drivePercentage && drivePercentage < 90 ? "warning" : 80 < drivePercentage && drivePercentage < 100 ? "danger" : null;

      return <Col sm={4}>
        {d.drivePath}
        <Progress color={processClass} value={drivePercentage}>{drivePercentage}%</Progress>
      </Col>
    })}
  </Row>;
};

const TooltipContent = () => {
  return <>
    <div><span>1. <b>For Add Camera - </b></span>Click on particular camera in the available camera list.</div>
    <div><span>2. <b>For Remove Camera - </b></span>Click on already added camera which is highlighted in the available camera list.</div>
    <div><span>3. <b>For Save Map - </b></span>Click on save.</div>
    <div><span>4. <b>For Edit Map - </b></span>Double click On preview image.</div>
  </>;
}
const memberFunctions = [
  'onCancel',
  'addCamera',
  'onSave',
  'handleTagChange',
  'handleSmartDeviceChange',
  'onScanDevice',
  'onCloseDeviceModal',
  'connectSocket',
  'onOpen',
  'onClose',
  'onMessage',
  'onError',
  'getStoreId',
  'responseUpdate',
  'sendScanDeviceRequest',
  'onCameraClick'
];

const googleAPIKey = 'AIzaSyDenu2FJYK17nFGLKO-fs4zTWVaQDCq8YY';

const daemonAction = {
  START: 0,
  STOP: 1,
  RESTART: 2,
  UPGRADE: 3
}

export class EditStore extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      columns: [
        { key: '_id', name: 'Id', width: 200, filter: true, sort: true, hidden: true },
        { key: 'name', name: 'Name', width: 200, filter: true, sort: true, type: 'string' },
        { key: 'place', name: 'Location', width: 150, filter: true, sort: true, type: 'string' },
        { key: 'cameraRTSPUrl', name: 'Camera Url', width: 300, filter: true, sort: true, type: 'string' },
        { key: 'status', name: 'Status', width: 100, filter: true, sort: true },
        { key: 'isConnected', name: 'Connection Status', width: 260, filter: true, sort: true, formatter: (props, record) => record.isConnected ? 'Connected' : 'Disconnected' },
        { key: 'cameraType', name: 'Camera Type', width: 200, filter: true, sort: true },
        { key: 'isHeatMapCamera', name: 'Heat Map Enabled', width: 250, filter: true, sort: true, hidden: true, formatter: (props, record) => record.isHeatMapCamera ? 'Yes' : 'No' },
        { key: 'cameraBrand', name: 'Camera Brand', width: 250, filter: true, sort: true, type: 'string' },
        { key: 'isRecordingStarted', name: 'Is Recording?', width: 250, filter: true, sort: true, formatter: (props, record) => record.isRecordingStarted ? 'Yes' : 'No' }

      ],
      clientSelected: null,
      tagsSelected: null,
      combos: {},
      tags: [],
      smartDevices: [],
      isOpenDeviceModal: false,
      scanDevices: [],
      isScanning: false,
      deviceError: null,
      file: '',
      imagePreviewUrl: '',
      modal: false,
      cameraCoordinates: [],
      selectedValues: [],
      newSelectedValue: [],
      isApplyEnabled: true,
      autoSerialNumber: this.props.match.params.id == "0" ? utils.generateUUID() : null,
      originalImage: '',
      mapImage: '',
      openLoader: false,
      timezoneValue: '',
      cameraSiteVisible: false
    }
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
  }

  componentWillMount() {
    localStorage.removeItem("currentPage");
  }

  componentDidMount() {
    let { props, isUpdate } = this,
      { params } = props.match;
    if (params.id !== "0") {
      this.props.dispatch(storeData.request({ action: 'load', id: params.id }, params.id));
      this.props.dispatch(cameraData.request({ action: 'load', filters: [{ "value": params.id, "property": "storeId", "type": "string" }] }));
    } else {
      this.props.dispatch(storeData.request({ action: 'load', id: params.id }));
    }
    this.props.dispatch(getCombos.request({ combos: "client" }));
  }

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
          this.ws.emit('message', {
            action: 'scanDeviceRequest',
            data: {
              storeId: storeId
            }
          });
        } else {
          this.connectSocket();
        }
      })
    }
  }

  onOpen(evt) {
    this.sendScanDeviceRequest();
  }

  getStoreId() {
    const { match } = this.props, storeId = (match && match.params && match.params.id) || '';
    return storeId;
  }

  connectSocket() {
    const storeId = this.getStoreId();
    let wsUri = `${utils.serverUrl}?type=client&storeId=${storeId}`;
    this.ws = io(wsUri);

    this.ws.on('connect', this.onOpen);
    this.ws.on('disconnect', this.onClose);
    this.ws.on('message', this.onMessage);
    this.ws.on('error', this.onError);
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
    let option = {}, notUpdate = false,
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
    this.setState({ isScanning: false, isOpenDeviceModal: true, deviceError: "Not able to connect with server." });
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
            <div className="scannedText"><b>Name:</b> <span>{item.name}</span></div>
            <div className="scannedText"><b>Hardware:</b> <span> {item.hardware}</span></div>
            <div className="scannedText"><b>Location:</b>  <span>{item.location}</span></div>
            <div className="scannedText"><b>IP:</b>  <span>{item.ip}</span></div>
          </Col>
        </Row >
      </ListGroupItem >
    )
  }

  componentWillReceiveProps(nextProps) {
    if (Object.keys(nextProps.initialValues).length > 0 && nextProps.initialValues.clientId && nextProps.initialValues.clientId.length > 0 && nextProps.getCombos.data && nextProps.getCombos.data.client) {
      this.setState({ clientSelected: utils.selectOption(nextProps.getCombos.data.client, nextProps.initialValues.clientId) })
    } else if (nextProps.getCombos.data && nextProps.getCombos.data.client) {
      if (utils.user && utils.user.clientId) {
        this.setState({ clientSelected: utils.selectOption(nextProps.getCombos.data.client, utils.user.clientId._id) })
      }
    }
    if (nextProps && nextProps.initialValues && nextProps.initialValues.tags && nextProps.initialValues.tags.length > 0) {
      this.setState({ tags: nextProps.initialValues.tags })
    }
    if (nextProps && nextProps.initialValues && nextProps.initialValues.smartDevices && nextProps.initialValues.smartDevices.length > 0) {
      this.setState({ smartDevices: nextProps.initialValues.smartDevices })
    }
    if ((nextProps.storeData && nextProps.storeData !== this.props.storeData)) {
      let { data, isFetching, error } = nextProps.storeData;
      if (!isFetching) {
        if (error || data && data.errmsg) {
          swal({ title: "Error", text: error || data.errmsg, icon: "error", });
          return;
        }

        if (nextProps.storeData.data && nextProps.storeData.data.message) {
          swal({
            title: utils.getAlertBoxTitle(nextProps.storeData.data.success),
            text: nextProps.storeData.data.message,
            icon: utils.getAlertBoxIcon(nextProps.storeData.data.success)
          }).then(function () {
            this.props.dispatch(storesData.request({ stores: [] }));
          }.bind(this));
        }
      }
    }
    if ((nextProps.storesData && nextProps.storesData !== this.props.storesData)) {
      if (!nextProps.storesData.isFetching) {
        utils.getUpdatedStoreData(this, nextProps);
      }
    }

    if ((nextProps.getCombos && nextProps.getCombos !== this.props.getCombos)) {
      let { data, isFetching, error } = nextProps.getCombos;
      if (!isFetching) {
        this.setState({ combos: data });
      }
    }
  }

  onSave(values, { setSubmitting }) {
    setSubmitting(false);
    let clientId = null;
    let { clientSelected, tags, smartDevices, file, cameraCoordinates, timezoneValue } = this.state;
    Object.assign(values, { cameraCoordinates: cameraCoordinates });
    let loggedData;
    let id = this.props.match.params.id;
    if (clientSelected) {
      clientId = clientSelected.value;
    }
    values.clientId = clientId;
    values.tags = tags;
    values.smartDevices = smartDevices;
    //values.timezoneValue = timezoneValue; //Last commit by israil > take value from state and state not or never have the data.

    //get geocoordinates from Google
    Geocode.setApiKey(googleAPIKey);
    Geocode.setLanguage("en");
    var l1, l2, pId, tz;
    Geocode.fromAddress(values.address + ',' + values.city + ',' + values.state + ' ' + values.zipCode).then(
      response => {
        const { lat, lng } = response.results[0].geometry.location;
        l1 = lat;
        l2 = lng;
        pId = response.results[0].place_id;
        values.latitude = l1;
        values.longitude = l2;
        values.googlePlaceId = pId;
      },
      error => {
        console.error(error);
      }
    )
      .then(async () => {
        //now, get timezone from Google TimeZone API from coordinates
        const ts = new Date().getTime();
        const googleTZ = 'https://maps.googleapis.com/maps/api/timezone/json?location=' + l1 + ',' + l2 + '&timestamp=' + (ts / 100) + '&key=' + googleAPIKey;
        await axios.get(googleTZ)
          .then(response => {
            tz = response.data.timeZoneId;
            values.timezoneValue = tz;
          },
            error => {
              console.error(error);
            })
      })
      .then(() => {
        if (id === "0") {
          loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Added + ' - ' + values.name);
          this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
          this.props.dispatch(storeData.request({ action: 'save', data: values, addStore: "true", thumbnail: this.state.imagePreviewUrl, file: file }, id));
        } else {
          values.tags = tags;
          values.smartDevices = smartDevices;
          utils.deleteUnUsedValue(values);
          loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Update + ' - ' + values.name);
          this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
          this.props.dispatch(storeData.request({ action: 'update', data: values, addStore: "true", thumbnail: this.state.imagePreviewUrl, file: file }, id));
        }
      })
  }

  onCancel = () => {
    //this.props.history.goBack(-1);
    this.props.history.push('/admin/sites');
  }

  addCamera = () => {
    let { params } = this.props.match;
    this.props.history.push("/admin/addcamera/" + params.id + "/0");
  }
  onDelete = () => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this store",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(function (willDelete) {
      let id = this.props.match.params.id;
      if (willDelete) {
        let loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Delete + ' - ' + this.props.storeData.data.name);
        this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
        this.props.dispatch(storeData.request({ action: 'delete' }, id))
      }
    }.bind(this));
  }
  onCameraClick() {
    // let { params } = this.props.match;
    // this.context.router.history.push('/admin/addcamera/' + params.id + "/0");
    this.setState({ cameraSiteVisible: true })
  }

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
      tunnelPort: "",
      mobile: "",
      serialNumber: this.state.autoSerialNumber || "",
      isSMSEnable: "",
      isOnmonitor: false,
      email: '',
      notificationFrequency: '',
      mediaServerUrl: null,
      mediaServerInboundPort: null,
      mediaServerOutboundPort: null,
      timezoneValue: "",
      type: "Default",
      totalDaysOfRecording: 0
    }
  }

  handleClientChange = (clientSelected) => {
    this.setState({ clientSelected });
  }

  handleTagChange(tag) {
    this.setState({ tags: tag });
  }

  handleSmartDeviceChange(smartDevice) {
    this.setState({ smartDevices: smartDevice });
  }

  onCloseDeviceModal() {
    this.setState({ isOpenDeviceModal: false }, () => {
      if (this.ws) {
        this.wsCloseRequest = true;
        this.ws.close();
      }
    })
  }
  handleImageChange(e) {
    e.preventDefault();
    let reader = new FileReader();
    let files = e.target ? e.target.files : [];
    if (files.length > 0) {
      let file = files[0];
      reader.onloadend = () => {
        this.setState({
          file: file,
          imagePreviewUrl: reader.result,
          originalImage: reader.result,
          mapImage: null
        }, () => {
          this.updateCanvas()
        });
      }
      reader.readAsDataURL(file);
      this.toggle();
    }
  }

  saveMap = () => {
    let base64CanvasImage = this.canvas.toDataURL();
    this.setState({
      cameraCoordinates: this.circles,
      imagePreviewUrl: base64CanvasImage
    }, () => { this.toggle() })
  }

  toggle = () => {
    this.setState(prevState => ({
      modal: !prevState.modal,
      selectedValues: []
    }), () => {
      let { modal } = this.state;
      !modal && this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      !modal && this.removeEvents(this.canvas)
    });
    this.count = 0;
    this.circles = [];
  }

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
    ctx.drawImage(img, 0, 0, img.width, img.height,
      centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);

    if (circles) {
      for (var i = 0; i < circles.length; i++) {
        var circle = circles[i];
        utils.drawCircle(circle, ctx, this.canvasHeight, this.canvasWidth, this.circles);
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
    img.onload = this.drawImageScaled.bind(this, img, circles, isCommingFromEdit);
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = mapImage ? mapImage : originalImage;
  }


  addCameraToCanvas = () => {
    let { count, props, state } = this
    let { cameraData } = props;
    let data = cameraData.data.data;
    let noOfCamera = data && data.length;
    let noOfCircles = this.circles.length;
    let { newSelectedValue } = state;
    let newSelectedValueindex = -1;
    if (newSelectedValue.length > 0 && data) {
      newSelectedValueindex = data.findIndex(element => { return element._id == newSelectedValue[0].value })
    }
    if (count >= 300) {
      this.count = 0; // for circle reset to start position
    }
    if (noOfCamera > noOfCircles && newSelectedValueindex > -1) {
      let { canvas, count, circles, makeCircle, updateCanvas } = this;

      makeCircle(20, 20 + count, "salmon", data[newSelectedValueindex]);
      updateCanvas(circles)
      this.count = count + 40;
      this.addEventsToCanvas(canvas);
    } else {
      swal({
        title: "Error",
        text: "You have already added available cameras.",
        icon: "error"
      });
    }
  }

  makeCircle = (x, y, fill, camera) => {
    var circle = {
      x: x,
      y: y,
      r: 20,
      isDragging: false,
      fill: fill,
      cameraData: camera,
      camId: camera._id
    }
    this.circles.push(circle);
  }

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
  }

  handleMouseUp = (e) => {
    // tell the browser we're handling this mouse event
    e.preventDefault();
    e.stopPropagation();

    // mouseup stuff here
    this.mouseIsDown = false;
    for (var i = 0; i < this.circles.length; i++) {
      this.circles[i].isDragging = false;
    }
  }

  handleMouseMove = (e) => {
    if (!this.mouseIsDown) {
      return;
    }
    // tell the browser we're handling this mouse event
    e.preventDefault();
    e.stopPropagation();

    let mouseX = parseInt(e.clientX - this.offsetX);
    let mouseY = parseInt(e.clientY - this.offsetY);

    if (mouseY < (this.centerShift_y + 18) || mouseY > (this.canvasHeight - (this.centerShift_y + 18))) {
      return;
    }
    if (mouseX < (this.centerShift_x + 18) || mouseX > (this.canvasWidth - (this.centerShift_x + 18))) {
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
    this.updateCanvas(this.circles)
  }

  getCameraNames = () => {
    let data = this.props.cameraData.data
    let camera = data && data.data;
    let cameraNames = [];
    camera && Array.isArray(camera) && camera.forEach((element, index) => {
      if (element.status == utils.cameraStatus.Active) {
        cameraNames.push({ label: element.name, value: element._id });
      }
    });
    return cameraNames;
  }

  onSelectCamera = (selectedValues) => {
    const oldSelectedValues = this.state.selectedValues;

    // Get previous common values.
    let oldValues = oldSelectedValues.filter(oldValue => {
      let index = selectedValues.findIndex(newValue => {
        return newValue.value == oldValue.value;
      })
      return index == -1;
    });
    // Get current common values.
    let newValues = selectedValues.filter(newValue => {
      let index = oldSelectedValues.findIndex(oldValue => {
        return oldValue.value == newValue.value;
      })
      return index == -1;
    });

    // Merge previous and current common values.
    let updatedRecords = oldValues.concat(newValues),
      isSelectionUpdate = updatedRecords && updatedRecords.length > 0; // Check for new added or removed item.
    this.setState({ selectedValues, isApplyEnabled: isSelectionUpdate });

    if (newValues.length > 0) {
      this.setState({ newSelectedValue: newValues }, () => { this.addCameraToCanvas(); });
    }
    if (oldValues.length > 0) {
      let index = this.circles.findIndex(element => {
        return element.camId == oldValues[0].value;
      })
      if (index > -1) {
        this.circles.splice(index, 1);
      }
      this.updateCanvas(this.circles);
    }
  }

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

        camera && Array.isArray(camera) && camera.forEach((el) => {
          if (el.status == utils.cameraStatus.Active) {
            activeCameraIds.push({ id: el._id });
          }
        });

        activeCameraIds && activeCameraIds.length > 0 && activeCameraIds.map((el) => {
          storeData.data.cameraCoordinates.filter((element) => {
            if (element.camId == el.id) {
              newCameraCoordinate.push(element);
            }
          })
        });

        newCameraCoordinate && newCameraCoordinate.length > 0 && newCameraCoordinate.map((element) => {
          this.circles.push(element);
          selectedValues.push({ label: element.cameraData.name, value: element.cameraData._id });
        });
      } else {
        cameraCoordinates && cameraCoordinates.map((element) => {
          this.circles.push(element);
          selectedValues.push({ label: element.cameraData.name, value: element.cameraData._id });
        });
      }

      this.setState(prevState => ({
        modal: !prevState.modal,
        selectedValues: selectedValues,
        openLoader: true
      }), () => setTimeout(() => { this.updateCanvas(this.circles, true) }, 500));
    }
    else {
      this.alreadyclicked = true;
      this.alreadyclickedTimeout = setTimeout(() => {
        this.alreadyclicked = false;
      }, 300);
    }

  }

  addEventsToCanvas = (canvas) => {
    var me = this;
    if (!this.eventAdded) {
      console.log("Adding event")
      this.eventAdded = true;
      canvas.addEventListener('mousedown', function (e) {
        me.handleMouseDown(e);
      });

      canvas.addEventListener('mouseup', function (e) {
        me.handleMouseUp(e);
      });
      canvas.addEventListener('mousemove', function (e) {
        me.handleMouseMove(e);
      });

      canvas.addEventListener('mouseleave', function (e) {
        this.mouseIsDown = false;
      });
    }
  }

  removeEvents = (canvas) => {
    var me = this;
    this.eventAdded = false;
    canvas.removeEventListener('mousedown', function (e) {
      me.handleMouseDown(e);
    });

    canvas.removeEventListener('mouseup', function (e) {
      me.handleMouseUp(e);
    });
    canvas.removeEventListener('mousemove', function (e) {
      me.handleMouseMove(e);
    });
  }

  setMap = (map) => {
    this.setState({ mapImage: util.serverUrl + "/api/mapThumbnail/" + map + "/?v=" + Date.now() });
    return util.serverUrl + "/api/mapThumbnail/" + map;
  }

  handleTimezoneValue = (timezoneValue) => {
    this.setState({ timezoneValue });
  }

  onRowClick(index, record) {
    let { params } = this.props.match;
    if (this.alreadyclicked) {
      this.alreadyclicked = false;
      this.alreadyclickedTimeout && clearTimeout(this.alreadyclickedTimeout);
      //this.context.router.history.push('/admin/sites/addcamera/' + params.id + "/" + record._id);
      this.props.history.push('/admin/site/' + params.id + "/addcamera/" + record._id);

    }
    else {
      this.alreadyclicked = true;
      this.alreadyclickedTimeout = setTimeout(() => {
        this.alreadyclicked = false;
      }, 300);
    }
  }

  damonAction = (action) => {
    if (this.props.storeData.data) {
      let serialNumber = this.props.storeData.data.serialNumber;
      this.props.dispatch(daemon.request({ serialKey: serialNumber, action: action }, null, null, (res) => {
        swal({ title: res.success ? "Success" : "Error", text: res.message, icon: res.success ? "success" : "error" });
      }));
    }
  }

  onRestartOss = () => {
    this.damonAction(daemonAction.RESTART);
  }

  onStopService = () => {
    this.damonAction(daemonAction.STOP);
  }

  onStartService = () => {
    this.damonAction(daemonAction.START);
  }

  onUpgradeService = () => {
    this.damonAction(daemonAction.UPGRADE);
  }

  render() {
    const { state, onCancel, props, onDelete, isUpdate, addCamera, onScanDevice, onCloseDeviceModal, onRestartOss, onStartService, onStopService, onUpgradeService } = this;
    const { columns, activeTab, tags, smartDevices, isOpenDeviceModal, scanDevices, isScanning, deviceError, imagePreviewUrl, modal, selectedValues, autoSerialNumber, openLoader } = state;
    const { listAction, actionName, sortColumn, sortDirection, localPaging, match, initialValues } = props;
    const { name } = initialValues || { name: '' };
    const { Status } = consts
    const initialValuesEdit = isUpdate ? initialValues : this.getInitialValueTemplate;

    const storeId = match && match.params && Number(match.params.id);
    const user = utils.getLoggedUser();
    let options = [
      { value: Status.Active, label: Status.Active },
      { value: Status.Inactive, label: Status.Inactive }
    ];

    let driveLists = initialValuesEdit.driveLists && initialValuesEdit.driveLists != "" ? JSON.parse(initialValuesEdit.driveLists) : [];
    const storeTypeOptions = [
      { value: 'Department', label: 'Department' },
      { value: 'Supermarket', label: 'Supermarket' },
      { value: 'Grocer', label: 'Grocer' },
      { value: 'Baker', label: 'Baker' },
      { value: 'Hardware', label: 'Hardware' },
      { value: 'Bookshop', label: 'Bookshop' },
      { value: 'Petshop', label: 'Petshop' },
      { value: 'Petrol station', label: 'Petrol station' },
      { value: 'Shoe', label: 'Shoe' },
      { value: 'Clothes', label: 'Clothes' },
      { value: 'Shopping Centre', label: 'Shopping Centre' },
      { value: 'Market', label: 'Market' },
      { value: 'Music', label: 'Music' },
      { value: 'Toy', label: 'Toy' },
      { value: 'Jewellery', label: 'Jewellery' }
    ];

    const liveVideoConfigOptions = [
      { value: 'WebRTC', label: 'WebRTC' },
      { value: 'HLS', label: 'HLS' },
      { value: 'FLV', label: 'FLV' },
      { value: 'NodeMedia', label: 'Node Media' }
    ]

    const siteTypeOptions = [
      { value: 'Default', label: 'Default' },
      { value: 'Rex', label: 'Rex' },
      { value: 'Nvr', label: 'Nvr' }
    ];

    let { combos, clientSelected, timezoneValue } = this.state;
    let { client } = combos || {};

    let { storeData, daemon } = this.props;
    let isFetching = storeData && storeData.isFetching;
    isFetching = isFetching || storeData && storeData.isFetching || daemon && daemon.isFetching || isScanning;

    let loadingMessage = isScanning ? { message: 'Scanning...' } : {};
    let imagePreview = null;
    let version = "/?v=" + moment().format(util.dateTimeFormat);
    imagePreview = imagePreviewUrl ? <img src={imagePreviewUrl} /> : storeData && storeData.data && storeData.data.map && match.params.id && (<img src={imagePreviewUrl ? imagePreviewUrl : util.serverUrl + "/api/mapThumbnail/" + match.params.id + ".png" + version} />);
    const driveListOptions = utils.selectOptionGenerator(driveLists, 'drivePath', 'drivePath');
    // console.log(initialValues.timeZoneValue);
    // console.log(timezoneValue);
    return (
      <div className="animated fadeIn">
        <LoadingDialog {...loadingMessage} isOpen={isFetching} />
        {
          !this.state.cameraSiteVisible &&

          <Formik
            enableReinitialize={true}
            initialValues={initialValuesEdit}
            onSubmit={this.onSave}
            validationSchema={
              Yup.object().shape({
                name: Yup.string().trim().required('Required'),
                storeType: Yup.string().trim().required('Required'),
                liveVideoConfig: Yup.string().trim().required('Required'),
                status: Yup.string().trim().required('Required'),
                zipCode: Yup.string().matches(/^[0-9]*$/, 'Must be a number'),
                latitude: Yup.string().trim().required('Required'),
                longitude: Yup.string().trim().required('Required'),
                //mobile: Yup.string().matches(regex.mobileValidation, 'Phone number is not valid').required()
              })
            }
            validate={(values) => {
              let errors = {};
              if (values.siteOnMonitor && !values.email) {
                errors.email = 'Required';
              }
              if (values.siteOnMonitor && !values.notificationFrequency) {
                errors.notificationFrequency = 'Required';
              }
              if (values.siteOnMonitor && util.allowNumeric(values.notificationFrequency)) {
                errors.notificationFrequency = 'Please enter numeric values only';
              }
              if (!values.timezoneValue) {
                errors.timezoneValue = 'Required';
              }
              return errors;
            }}>
            {function (props) {
              const {
                values,
                touched,
                errors,
                isSubmitting,
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue
              } = props;
              return (
                <Row>
                  <Col md={12}>
                    <form onSubmit={handleSubmit}>
                      <CardWrapper lg={12}
                        title={
                          <div className='site-tab-holder'>
                            {isUpdate ? (name) : 'Create new store'}
                          </div>
                        }
                        subTitle={
                          <div className='site-tab-holder'>
                            <div className='site-tab site-tab-active card-title' onClick={() => this.setState({ cameraSiteVisible: false })}>Site Details</div>
                            <div className='site-tab card-title'><div onClick={this.onCameraClick} className='site-tab-link'>Cameras</div></div>{/* to={{pathname: '/admin/addcamera/' + values._id}} */}
                          </div>
                        }
                        footer={
                          <div className={'form-button-group'}>
                            <div><button type="submit" className="btn formButton" disabled={isSubmitting}><i className="fa fa-save" aria-hidden="true"></i> Save</button></div>
                            <div> <button type="button" className="btn formButton" onClick={onCancel} disabled={isSubmitting}><i className="fa fa-close" aria-hidden="true"></i> Cancel</button></div>
                            {
                              isUpdate && (<><div> <button type="button" className="btn formButton" onClick={onDelete} disabled={isSubmitting}><i className="fa fa-trash" aria-hidden="true"></i> Delete</button></div>
                                <div> <button type="button" className="btn formButton" onClick={onScanDevice} disabled={isSubmitting}><i className="fa fa-qrcode" aria-hidden="true"></i> Scan Device</button></div>
                                <div>
                                  <button type="button" className="btn formButton" onClick={onRestartOss} disabled={isSubmitting}><i className="fa fa-refresh" aria-hidden="true"></i> Reload OSS</button>
                                </div>
                                <div>
                                  <button type="button" className="btn formButton" onClick={onStartService} disabled={isSubmitting}><i className="fa fa-play" aria-hidden="true"></i> Start Service</button>
                                </div>
                                <div>
                                  <button type="button" className="btn formButton" onClick={onStopService} disabled={isSubmitting}><i className="fa fa-stop" aria-hidden="true"></i> Stop Service</button>
                                </div>
                                <div>
                                  <button type="button" className="btn formButton" onClick={onUpgradeService} disabled={isSubmitting}><i className="fa fa-level-up" aria-hidden="true"></i> Upgrade</button>
                                </div>
                              </>)
                            }
                          </div>
                        }>

                        <p>Basic Information</p>
                        <div className='row site-tab-holder'>
                          <div className='col-lg-6'>
                            <Select
                              id="clientId"
                              isClearable={true}
                              value={clientSelected}
                              isDisabled={(user && user.clientId) || (user && user.roleId && user.roleId.name === 'Client - Admin')}
                              onChange={this.handleClientChange}
                              options={utils.selectOptionGenerator(client)}
                            />
                          </div>
                          <div className='col-lg-4' />
                          <div className="col-lg-2">
                            <label className="switch">
                              <Input type="checkbox" className="toggle" checked={values.isActive}
                              onClick={(option) => setFieldValue("isActive", option ? option.target.checked : "")} id="isActive" />
                              <span className="slider round"></span>
                            </label>
                          </div>
                        </div>
                        <div className='row site-tab-holder'>
                          <div className='col-lg-6'>
                            {
                              this.isUpdate && <FormGroup row>
                                <Col sm={12} className="text-field">
                                  <Input
                                    id="_id"
                                    type="text"
                                    value={values._id}
                                    onBlur={handleBlur}
                                    className="form-control text-form"
                                    required
                                  />
                                  <label className="text-label">Site Id <span className={'text-danger'}></span></label>
                                </Col>
                              </FormGroup>
                            }

                              <FormGroup row>
                                <Col sm={12} className="text-field">
                                  <Input
                                    id="address"
                                    type="text"
                                    onBlur={handleBlur}
                                    className="form-control text-form"
                                    value={values.address}
                                    onChange={handleChange}
                                    required
                                  />
                                  <label className="text-label">Address Line 1</label>
                                </Col>
                              </FormGroup>
                              <div class="row">
                                <div className='col-lg-6'>
                                  <FormGroup row>
                                    <Col sm={12} className="text-field">
                                      <Input
                                        id="city"
                                        type="text"
                                        onBlur={handleBlur}
                                        className="form-control text-form"
                                        value={values.city}
                                        onChange={handleChange}
                                        required
                                      />
                                      <label className="text-label">City</label>
                                    </Col>
                                  </FormGroup>
                                </div>
                                <div className='col-lg-6'>
                                  <FormGroup row>
                                    <Col sm={12} className="text-field">
                                      <Input
                                        id="state"
                                        type="text"
                                        onBlur={handleBlur}
                                        className="form-control text-form"
                                        value={values.state}
                                        onChange={handleChange}
                                        required
                                      />
                                      <label className="text-label">State</label>
                                    </Col>
                                  </FormGroup>
                                </div>
                              </div>
                          </div>

                          <div className='col-lg-6'>
                            <FormGroup row>
                              <Col sm={12} className="text-field">
                                <Input
                                 type="text"
                                 value={values.name}
                                onChange={handleChange}
                                 className="form-control text-form"
                                 required
                                />
                                 <label className="text-label">Site Name<span className={'text-danger'}></span></label>
                                {errors.longitude && <div className="input-feedback">{errors.longitude}</div>}
                              </Col>
                            </FormGroup>
                            <FormGroup row>
                              <Col sm={12} className="text-field">
                                <Input
                                 type="text"
                                 className="form-control text-form"
                                 required
                                />
                                 <label className="text-label">Address Line 2</label>
                              </Col>
                            </FormGroup>
                            <div class="row">
                                <div className='col-lg-6'>
                                  <FormGroup row>
                                    <Col sm={12} className="text-field">
                                      <Input
                                        id="country"
                                        type="text"
                                        onBlur={handleBlur}
                                        className="form-control text-form"
                                        value={values.country}
                                        onChange={handleChange}
                                        required
                                      />
                                      <label className="text-label">Country</label>
                                    </Col>
                                  </FormGroup>
                                </div>
                                <div className='col-lg-6'>
                                  <FormGroup row>
                                    <Col sm={12} className="text-field">
                                      <Input
                                        id="zipCode"
                                        type="text"
                                        onBlur={handleBlur}
                                        className="form-control text-form"
                                        value={values.zipCode}
                                        onChange={handleChange}
                                        required
                                      />
                                      <label className="text-label">Zip Code</label>
                                    </Col>
                                  </FormGroup>
                                </div>
                              </div>
                          </div>
                        </div>
                        <div className="row site-tab-holder">
                          <div className='col-lg-4'>
                            <Col sm={12} className="text-field">
                              <Input
                                type="text"

                                className="form-control text-form"
                                required
                              />
                                <label className="text-label">Region<span className={'text-danger'}></span></label>
                            </Col>
                          </div>
                          <div className='col-lg-3'>
                            <Col sm={12} className="text-field">
                              <Input
                                id="latitude"
                                type="text"
                                className="form-control text-form"
                                value={values.latitude}
                                onChange={handleChange}
                                required
                              />
                                <label className="text-label">Latitude<span className={'text-danger'}></span></label>
                            </Col>
                          </div>
                          <div className='col-lg-3'>
                            <Col sm={12} className="text-field">
                              <Input
                                id="longitude"
                                type="text"
                                className="form-control text-form"
                                value={values.longitude}
                                onChange={handleChange}
                                required
                              />
                                <label className="text-label">Longitude<span className={'text-danger'}></span></label>
                            </Col>
                          </div>
                          <div className='col-lg-2'>
                            <Col sm={12} className="text-field">
                              {/* <Input
                                id="timezoneValue"
                                type="text"

                                className="form-control text-form"
                                required
                              />
                                <label className="text-label">TimeZone<span className={'text-danger'}></span></label> */}
                                <TimezonePicker
                                  id="timezoneValue"
                                  value={values.timezoneValue}
                                  onChange={(timezoneValue) => setFieldValue("timezoneValue", timezoneValue)}
                                  inputProps={{
                                    placeholder: 'Select Timezone...',
                                    className: "form-control"
                                  }}
                                  className='timezone-style'
                                >
                                </TimezonePicker>
                            </Col>
                          </div>
                        </div>
                        <div className="row site-tab-holder">
                          <div className='col-lg-1'>Map</div>
                          <div className='col-lg-1'>
                            <FormGroup row>
                              <Col sm={6}>
                                <label htmlFor="file" className="custom-file-upload choose-file"><i className="fa fa-file" aria-hidden="true"></i> Browse</label>
                                <input name="file" id="file" type="file" onChange={(e) => {
                                  var file = e.target.files[0];
                                  setFieldValue("map", file.name);
                                  this.handleImageChange(e);
                                }}
                                />
                              </Col>
                            </FormGroup>
                          </div>
                          <div className='col-lg-2'>
                            <Col sm={3} xs={3}>
                                {imagePreview ?
                                  <div className="imgPreview" onClick={this.editMap}>
                                    {imagePreview}
                                  </div> : <i className="fa fa-camera fa-2x"></i>
                                }
                            </Col>
                          </div>
                          <div className='col-lg-3'>
                            <Col sm={12} className="text-field">
                              <Input
                                id="macAddress"
                                type="text"
                                className="form-control text-form"
                                value={values.macAddress}
                                required
                              />
                                <label className="text-label">Mac Address<span className={'text-danger'}></span></label>
                            </Col>
                          </div>
                          <div className='col-lg-5'>
                            <Col sm={12} className="text-field">
                              <Input
                                id="serialNumber"
                                type="text"
                                className="form-control text-form"
                                value={autoSerialNumber || values.serialNumber}
                                required
                              />
                                <label className="text-label">SerialKey<span className={'text-danger'}></span></label>
                            </Col>
                          </div>
                        </div>
                        <div className="row">
                          <Col sm={12} className="text-field">
                            <Input
                              id="storeNotes"
                              type="text"
                              className="form-control text-form"
                              value={values.storeNotes}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              rows={5}
                              required
                            />
                              <label className="text-label">Notes<span className={'text-danger'}></span></label>
                          </Col>
                        </div>


                        <br /><br />
                        <p>Media Information</p>
                        <div className='row site-tab-holder'>
                          <div className='col-lg-6'>
                            Live View Media Server<br />
                            <FormGroup row>
                              <Col sm={3}>
                                <input type="radio" id="antmedia" name="antmedia"
                              // value="direct"
                              />&nbsp;
                                <span>Ant Media</span>
                              </Col>
                              <Col sm={3}>
                                <input type="radio" id="nodemedia" name="nodemedia" />&nbsp;
                                <span>Node Media</span>
                              </Col>
                            </FormGroup>
                          </div>
                        </div>
                        <div className='row site-tab-holder'>
                          <div className='col-lg-6'>
                            <FormGroup row>
                              <Col sm={12} className="text-field">
                                <Input
                                 id="mediaServerUrl"
                                 type="text"
                                 className="form-control text-form"
                                 value={values.mediaServerUrl}
                                 onChange={handleChange}
                                 required
                                />
                                 <label className="text-label">Media Server URL</label>
                              </Col>
                            </FormGroup>
                          </div>
                          <div className='col-lg-3'>
                            <FormGroup row>
                              <Col sm={12} className="text-field">
                                <Input
                                 id="mediaServerInboundPort"
                                 type="text"
                                 className="form-control text-form"
                                 value={values.mediaServerInboundPort}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                 required
                                />
                                 <label className="text-label">Inbound Port</label>
                              </Col>
                            </FormGroup>
                          </div>
                          <div className='col-lg-3'>
                            <FormGroup row>
                              <Col sm={12} className="text-field">
                                <Input
                                 id="mediaServerOutboundPort"
                                 type="text"
                                 className="form-control text-form"
                                 value={values.mediaServerOutboundPort}
                                 onChange={handleChange}
                                 onBlur={handleBlur}
                                 required
                                />
                                 <label className="text-label">Outbound Port</label>
                              </Col>
                            </FormGroup>
                          </div>
                        </div>
                        <div className='row site-tab-holder'>
                          <div className='col-lg-6'>
                            <FormGroup row>
                              <Col sm={12} className="text-field">
                                <Input
                                 type="text"
                                 className="form-control text-form"
                                 required
                                />
                                 <label className="text-label">Transport Type</label>
                              </Col>
                            </FormGroup>
                          </div>
                        </div>
                        <div className='row site-tab-holder'>
                          <div className='col-lg-6'>
                            Recorded Video Media Server <input type="checkbox" /> Same as Live Media Server<br />
                            <FormGroup row>
                              <Col sm={3}>
                                <input type="radio" id="antmedia" name="antmedia"
                              // value="direct"
                              />&nbsp;
                                <span>Ant Media</span>
                              </Col>
                              <Col sm={3}>
                                <input type="radio" id="nodemedia" name="nodemedia" />&nbsp;
                                <span>Node Media</span>
                              </Col>
                            </FormGroup>
                          </div>
                        </div>
                        <div className='row site-tab-holder'>
                          <div className='col-lg-6'>
                            <FormGroup row>
                              <Col sm={12} className="text-field">
                                <Input
                                 type="text"
                                 className="form-control text-form"
                                 required
                                />
                                 <label className="text-label">Media Server URL</label>
                              </Col>
                            </FormGroup>
                          </div>
                          <div className='col-lg-3'>
                            <FormGroup row>
                              <Col sm={12} className="text-field">
                                <Input
                                 type="text"
                                 className="form-control text-form"
                                 required
                                />
                                 <label className="text-label">Inbound Port</label>
                              </Col>
                            </FormGroup>
                          </div>
                          <div className='col-lg-3'>
                            <FormGroup row>
                              <Col sm={12} className="text-field">
                                <Input
                                 type="text"
                                 className="form-control text-form"
                                 required
                                />
                                 <label className="text-label">Outbound Port</label>
                              </Col>
                            </FormGroup>
                          </div>
                        </div>
                        <div className='row site-tab-holder'>
                          <div className='col-lg-6'>
                            <FormGroup row>
                              <Col sm={12} className="text-field">
                                <Input
                                 type="text"
                                 className="form-control text-form"
                                 required
                                />
                                 <label className="text-label">Transport Type</label>
                              </Col>
                            </FormGroup>
                          </div>
                        </div>



                      </CardWrapper>
                    </form>
                  </Col>
                </Row>
              );
            }.bind(this)}
          </Formik>
        }
        {
          this.state.cameraSiteVisible && isNaN(storeId) || storeId ? <div className="child-record">
            <CardWrapper lg={12} title={isUpdate ? (name) : 'Create new store'}
              subTitle={
                <div className='site-tab-holder'>
                  <div className='site-tab site-tab-active card-title' onClick={() => this.setState({ cameraSiteVisible: false })}>Site Details</div>
                  <div className='site-tab card-title'><div onClick={this.onCameraClick} className='site-tab-link'>Cameras</div></div>{/* to={{pathname: '/admin/addcamera/' + values._id}} */}
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
                        defaultSort={{ sortColumn: sortColumn, sortDirection: sortDirection }}
                        localPaging={localPaging || false}
                        onRowClick={this.onRowClick.bind(this)}
                        exportButton={true}
                        add={addCamera}
                        childFilter={this.props.match.params.id}
                        pageSize="4"
                        //height={250}
                        filters={[{ "value": this.props.match.params.id, "property": "storeId", "type": "string" }]}
                      />
                    </Col>
                  </Row>
                </TabPane>
              </TabContent>
            </CardWrapper>

          </div> : null
        }

        <Modal isOpen={isOpenDeviceModal && !isScanning} className={"popup-sales dashboard-widget"} style={{ maxWidth: 400 }} >
          <ModalHeader className={"widgetHeaderColor"} toggle={onCloseDeviceModal}>
            Scanned Devices
					</ModalHeader>
          <ModalBody className={"reorderBody"}>
            {!isScanning && deviceError == '' || deviceError == null ? <p className="scannedText">{`${(scanDevices && scanDevices.length) || 0} devices were found.`}</p> : <p className="scannedText">{deviceError}</p>}
            <ListGroup>
              {scanDevices && scanDevices.length > 0 && Array.isArray(scanDevices) && scanDevices.map(this.renderScanDevices, this)}
            </ListGroup>
          </ModalBody>
        </Modal>
        <Modal isOpen={modal} toggle={() => this.toggle()} className={"modal-parent"}>
          <ModalHeader className="site-map-upload-header" toggle={() => this.toggle()}><span className="site-map-upload">Add Camera On Map</span><Tooltip placement="bottom" title={<TooltipContent />}><i className="fa fa-question-circle fa-2x add-map-help" aria-hidden="true"></i></Tooltip></ModalHeader>
          <ModalBody>
            <LoadingDialog {...loadingMessage} isOpen={openLoader} />
            <div className="canvas-display">
              <canvas id="canvas" width={582} height={425} />
              <div className="add-map-camera-list">
                <div className="site-map-upload text-center"><b>Available Camera</b></div>
                <Select
                  isClearable={true}
                  value={selectedValues}
                  onChange={(selectedValues) => this.onSelectCamera(selectedValues)}
                  options={this.getCameraNames()}
                  isMulti
                  menuIsOpen
                  hideSelectedOptions={false}
                  className="custom-select-list"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button className="btn formButton" onClick={() => this.saveMap()}>Save</Button>{' '}
            <Button className="btn formButton" onClick={() => this.toggle()}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    )
  }
}

AddStore.defaultProps = {
  listAction: cameraData,
  actionName: 'cameraData'
}

EditStore.contextTypes = {
  router: PropTypes.object.isRequired
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
    daemon: state.daemon
  };
}

var AddStoreModule = connect(mapStateToProps)(EditStore);
export default AddStoreModule;
