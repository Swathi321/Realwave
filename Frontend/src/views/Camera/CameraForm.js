import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Col, FormGroup, Input, Label, Row, TabContent, TabPane, Badge, Modal, ModalHeader, ModalBody,Form } from 'reactstrap';
import { cameraData, storeData, saveActivityLog, cameraRecord, alarmEvent, cameraTags } from '../../redux/actions/httpRequest';
import PropTypes from 'prop-types';
import swal from 'sweetalert';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CardWrapper from '../../component/CardWrapper';
import LoadingDialog from '../../component/LoadingDialog';
import utils from '../../Util/Util';
import consts from '../../Util/consts';
import Select from 'react-select';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import Grid from '../Grid/GridBase';
import { instance } from "../../redux/actions/index";
import api from '../../redux/httpUtil/serverApi';
import { Button as AntButton, Select as AntSelect } from 'antd';


const customStyles = {
  btnStyle: {
    marginLeft: 5
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-5%',
    transform: 'translate(-50%, -50%)'
  }
};

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

export class CameraForm extends PureComponent {
  constructor(props) {
    super(props);

    let TagPermission = utils.ifPermissionAssigned('functionId', 'Camera Tags');
    let showCovertCamera = utils.ifPermissionAssigned('functionId', 'Can see Covert Cameras');

    const loggedUser = utils.getLoggedUser();
    this.isAdminRole = loggedUser && loggedUser.roleId.isAdminRole;

    this.state = {
      showTags: TagPermission,
      showCovertCamera: showCovertCamera,
      columns: [
        { key: '_id', name: 'Id', width: 200, filter: true, sort: true },
        { key: 'name', name: 'Name', width: 200, filter: true, sort: true },
        { key: 'place', name: 'Location', width: 150, filter: true, sort: true },
        { key: 'cameraRTSPUrl', name: 'Camera Url', width: 300, filter: true, sort: true },
        { key: 'status', name: 'Status', width: 100, filter: true, sort: true },
        { key: 'isConnected', name: 'Connection Status', width: 260, filter: true, sort: true, formatter: (props, record) => record.isConnected ? 'Connected' : 'Disconnected' },
        { key: 'cameraType', name: 'Camera Type', width: 200, filter: true, sort: true },
        { key: 'isHeatMapCamera', name: 'Heat Map Enabled', width: 250, filter: true, sort: true, formatter: (props, record) => record.isHeatMapCamera ? 'Yes' : 'No' },
        { key: 'cameraBrand', name: 'Camera Brand', width: 250, filter: true, sort: true },
        {
          key: "isRecordingEnabled", name: "Is Recording?", width: 250, filter: true, sort: true, formatter: (props, record) =>
            record.isRecordingEnabled ? "Yes" : "No",
        },
      ],
      tagsOptions: [],
      tags: [],
      // formVisible: true,
      smartDevices: [],
      triedOnceSaveNew: false,
      camSmartSelected: null,
      smartDevicesAllowed: [],
      // formVisible: true,
      isRecordingEnabled: false,
      enableHeatMap: false,
      covertCamera: false,
      activeStatus: "Active",
      nativeConnection: "",
      roleSelected: null,
      smartDropDown: [],
      selectedDevices: "",
      overallData: [],
      selectedcameraBrand: {},
      recorCollection: [],
      post: "",
      pre: "",
      cameraBrandID: '',
      selectedOption: "",
      stopUpdate: true,
      brand: "",
      recordingType: '',
      brandList: [],
      SmartName: [],
      storeTypeList: [],
      wholeSmartLoop: [],
      mainDropDown: [],
      // TagNameErr:false,
      tagName: '',
      rex: false,
      camClient: "",
      storeSmartData: [],
      recordingStream1: [{ label: "Primary Stream ID", value: "Primary Stream Id" }, { label: "Secondary Stream ID", value: "Secondary Stream Id" }],
      recordingStream2: [{ label: "Primary/Recording Stream RTSP URL", value: "Primary/Recording Stream RTSP URL" }, { label: "Secondary Stream RTSP URL", value: "Secondary Stream RTSP URL" }]
    }
    // this.onSave = this.onSave.bind(this);
    // this.onCancel = this.onCancel.bind(this);
    this.isUpdate = this.props.params._id != "0";
    this.handleTagChange = this.handleTagChange.bind(this);
    this.onStoreClick = this.onStoreClick.bind(this);
    this.onSmartDeviceClick = this.onSmartDeviceClick.bind(this);
    this.onAlarmEvent = this.onAlarmEvent.bind(this);
    if (this.props.params._id == "0") {
      this.setState({ triedOnceSaveNew: false }, () => this.scrollToMiddle())
    }
  }
  componentDidUpdate(updatedProps){
    console.log('updated life',updatedProps);
    if(updatedProps.params._id !== this.props.params._id){
    this.scrollToMiddle();
    let populate = [
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
    ]

    this.props.dispatch(storeData.request({ action: 'load', storeId: this.props.storeId, populate: populate }, this.props.storeId));

    let { props, isUpdate } = this,
     { params } = props;


    //api call for camera brand by 
    if(params.storeId !== "0") {
      instance
        .post(`${api.STORE_DATA}/${props.storeId}`, {
          action: "load",
          storeId: props.params._id,
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
          console.log(res);
          if (res && res.data && Object.keys(res.data).length > 0) {
            if (res.data && res.data.clientId && Object.keys(res.data.clientId).length > 0) {
              let { smartDevicesAllowed } = res.data.clientId
              console.log(smartDevicesAllowed);
              if (smartDevicesAllowed.length > 0) {
                let list = []
                let name = []
                smartDevicesAllowed.forEach(x => {
                  if (x.smartDeviceType == "Camera") {
                    list.push({ value: x._id, label: x.name, nativeConnection: x.nativeConnectivity })
                  }
                })

                //  smartDevicesAllowed.forEach(x=>{
                //     name.push({value:x._id,label:x.name})
                //  })


                console.log(list);
                this.setState({
                  SmartName: name,
                  brandList: list,
                  camClient: res.data.clientId._id,
                  cameraTagsAllowed: res.data.clientId.cameraTagsAllowed
                }, () => {
                  this.props.dispatch(cameraTags.request({ clientId: res.data.clientId._id, clientget: 'true', action: 'client' }));
                  this.callCamSmart();
                })
                console.log(this.state.camClient)

              }
            }
            console.log(this.state.clientId)
          }
        }).catch(err => {
          console.log(err);
        })
    }

  }
    //api call for Cam smart device

  }
  componentDidMount() {
console.log('is it reloading ?')
    // if (this.props.location.search.includes('formVisible')) {
    //   this.setState({
    //     formVisible: this.props.location.search.split("=")[1] == true
    //   }, () => window.scrollTo(0, 0))
    // }

    this.scrollToMiddle();
    let populate = [
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
    ]

    this.props.dispatch(storeData.request({ action: 'load', storeId: this.props.storeId, populate: populate }, this.props.storeId));

    let { props, isUpdate } = this,
     { params } = props;


    //api call for camera brand by 
    if(params.storeId !== "0") {
      instance
        .post(`${api.STORE_DATA}/${props.storeId}`, {
          action: "load",
          storeId: props.params._id,
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
          console.log(res);
          if (res && res.data && Object.keys(res.data).length > 0) {
            if (res.data && res.data.clientId && Object.keys(res.data.clientId).length > 0) {
              let { smartDevicesAllowed } = res.data.clientId
              console.log(smartDevicesAllowed);
              if (smartDevicesAllowed.length > 0) {
                let list = []
                let name = []
                smartDevicesAllowed.forEach(x => {
                  if (x.smartDeviceType == "Camera") {
                    list.push({ value: x._id, label: x.name, nativeConnection: x.nativeConnectivity })
                  }
                })

                //  smartDevicesAllowed.forEach(x=>{
                //     name.push({value:x._id,label:x.name})
                //  })


                console.log(list);
                this.setState({
                  SmartName: name,
                  brandList: list,
                  camClient: res.data.clientId._id,
                  cameraTagsAllowed: res.data.clientId.cameraTagsAllowed
                }, () => {
                  this.props.dispatch(cameraTags.request({ clientId: res.data.clientId._id, clientget: 'true', action: 'client' }));
                  this.callCamSmart();
                })
                console.log(this.state.camClient)

              }
            }
            console.log(this.state.clientId)
          }
        }).catch(err => {
          console.log(err);
        })
    }


    //api call for Cam smart device

  }
  callCamSmart = () => {

    let { camClient } = this.state
    let { props } = this
    let siteId = props.storeId
    console.log(siteId)
    console.log(camClient)

    let reqBody = {
      clientId: camClient,
      storeId: siteId,
    }
    var bodyFormdata = new FormData()
    bodyFormdata.append('data', JSON.stringify(reqBody))
    instance.
      post(`${api.SITE_SMART_DEVICE}`, bodyFormdata)
      .then(res => {
        console.log(res);


        this.getCameraDataRecord(this.props.storeId, this.props.params._id);

        if (res && res.data && res.data.data.length > 0) {
          let smart = res.data.data
          let data = []
          let { params } = this.props;
          console.log(params);
          if (params._id == 0) {


            smart.map(y => {

              if (!y.device && y.kicDeviceID) y.device = { smartDeviceType: "Access Control" }

              let DeviceName;
              if (y.device.smartDeviceType.toLowerCase() === "pos") DeviceName = y.POSdeviceRegisterNo;
              else if (y.device.smartDeviceType.toLowerCase() === "access control") DeviceName = y.kicDeviceName;
              else DeviceName = y.name;


              let Drop = [{ id: y._id, label: DeviceName }];

              let empty = { name: y.device.smartDeviceType, mainDrop: Drop, storeList: [{ drop: Drop, pre: "", post: "", selectedDrop: "", status: true }] }
              let check = data.findIndex(u => u.name == y.device.smartDeviceType)
              if (check == "-1") {
                data.push(empty)
              } else {
                console.log(check);
                data[check].storeList[0].drop.push({ id: y._id, label: DeviceName })
              }
            })

            console.log(data);
            this.setState({
              wholeSmartLoop: data
            })
          } else {
            this.setState({
              storeSmartData: smart
            })
          }
        }
      }).catch(err => {
        console.log(err);
      })

  }

  getCameraDataRecord(storeId, camId) {
    if (camId !== "0") {
      // this.props.dispatch(cameraData.request({ action: 'load', id: camId,populate:"siteSmartDevices.deviceId" }, camId));
      this.props.dispatch(cameraData.request({ action: 'load', id: camId }, camId));

    } else {
      this.props.dispatch(cameraData.request({ action: 'load', filters: [{ "value": this.props.storeId, "property": "storeId", "type": "string" }] }));
    }
  }

  scrollToMiddle = () => {
    Element.prototype.documentOffsetTop = function () {
      return this.offsetTop + (this.offsetParent ? this.offsetParent.documentOffsetTop() : 0);
    };

    var top = document.getElementById('middle').documentOffsetTop() - (window.innerHeight / 10);
    window.scrollTo(0, top);
  }


  checkRecordingStream = (RecordingStreamURL) => {

    let { recordingType, recordingStream1, recordingStream2 } = this.state

    let recStreamSource
    if (recordingType === "Rex") recStreamSource = recordingStream1;
    else recStreamSource = recordingStream2;

    let itemm;
    if (RecordingStreamURL) {
      itemm = recStreamSource.find(ob => ob.value === RecordingStreamURL);
      if (!itemm) this.setState({ resetRecordingStreamURL: true });
    }

    return itemm ? true : false;
  }

  async componentWillReceiveProps(nextProps) {
    console.log('nextprops------->',nextProps);

    const { tagsOptions, tags, cameraTagsAllowed } = this.state;

    if (nextProps && nextProps.storeData && nextProps.storeData.data) {

      this.setState({
        rex: nextProps.storeData.data.isNvr,
        recordingType: nextProps.storeData.data.type,

      })
    }

    if (nextProps.cameraTags && nextProps.cameraTags.data && nextProps.cameraTags.data !== this.props.cameraTags.data) {
      const { error, data, isFetching } = nextProps.cameraTags;

      if (!isFetching) {

        this.setState({ tagSaving: false });

        if (data.success) {
          //when creating new bookmarks
          if (data.message === "Record saved successfully") {
            swal({ title: "Success", text: data.message, icon: "success" });

            let tagsoptionss = [...tagsOptions];
            tagsoptionss.push(data.data);

            let tagss = tags ? [...tags] : [];
            tagss.push(data.data.name);

            this.setState({ tagsOptions: tagsoptionss, AddTags: false, tags: tagss });

          } else {
            // for filtering the all client tags to selected client tags 
            let tagsOptionss = [];
            let ClientTags = cameraTagsAllowed ? [...cameraTagsAllowed] : [];

            ClientTags.length && ClientTags.forEach(tag_id => {
              data.data && data.data.length && data.data.forEach(ob => {
                if (tag_id == ob._id) tagsOptionss.push(ob);
              });
            });

            this.setState({ tagsOptions: tagsOptionss });
          }
        } else {
          swal({ title: "Error", text: data.errmsg, icon: "error", });
          this.setState({ tagSaving: false });
        }
      }
    }

    if (nextProps && nextProps.cameraData && nextProps.cameraData.data && nextProps.cameraData !== this.props.cameraData) {

      let siteSmartDevices = nextProps.cameraData.data.siteSmartDevices
      let { storeSmartData } = this.state

      this.checkRecordingStream(nextProps.cameraData.data.RecordingStreamURL);

      if (nextProps.cameraData.data) {
        let resTags = nextProps.cameraData.data.tags;

        let value = [];

        resTags && resTags.length && resTags.forEach(tag => {
          let record = tagsOptions.find(ob => ob._id === tag);
          if (record) value.push(record.name);
        });

        this.setState({ tags: value });
      }

      console.log(storeSmartData, siteSmartDevices, nextProps.cameraData.data);
      if (storeSmartData && storeSmartData.length) {

        let data = []
        storeSmartData.forEach(y => {

          if (!y.device && y.kicDeviceID) y.device = { smartDeviceType: "Access Control" }

          let DeviceName;
          if (y.device.smartDeviceType.toLowerCase() === "pos") DeviceName = y.POSdeviceRegisterNo;
          else if (y.device.smartDeviceType.toLowerCase() === "access control") DeviceName = y.kicDeviceName;
          else DeviceName = y.name;

          let Drop = [{ id: y._id, label: DeviceName }];

          let empty = { name: y.device.smartDeviceType, mainDrop: Drop, id: y.device._id, storeList: [{ drop: Drop, pre: "", post: "", selectedDrop: "", status: true }] }

          let check = data.findIndex(u => u.name == y.device.smartDeviceType)
          if (check == "-1") {
            data.push(empty)
          } else {
            console.log(check);
            data[check].storeList[0].drop.push({ id: y._id, label: DeviceName })
          }
        })

        let mainDrop1 = []

        if (siteSmartDevices && siteSmartDevices.length) {
          siteSmartDevices.map(SD => {
            data.map(WSL => {
              if (WSL && WSL.storeList.length) {
                let StoreCopy = [...WSL.storeList];
                let TrueStatus = StoreCopy.filter(dat => dat.status);

                WSL.storeList.map(row => {
                  let record = row.drop.find(x => SD && x.id == SD.deviceId);

                  // if 2 or more  elements come for same device type and from second all devices will be added in this fuction
                  if (record && !TrueStatus.length) {
                    let dataObj = {
                      drop: row.drop,
                      pre: SD.devicePreRecordingDuration,
                      post: SD.devicePostRecordingDuration,
                      selectedDrop: { label: record.label, id: record.id },
                      status: false
                    }

                    let CheckIfThere;
                    if (mainDrop1.length) CheckIfThere = mainDrop1.findIndex(d => dataObj.selectedDrop && d.id == dataObj.selectedDrop.id);
                    if (!CheckIfThere || CheckIfThere == -1) {
                      WSL.storeList.push(dataObj)
                      mainDrop1.push(dataObj.selectedDrop);
                    }
                    return;
                  }

                  // first element for each type will be configured here
                  if (record && row.status) {
                    row.status = false
                    row.pre = SD.devicePreRecordingDuration
                    row.post = SD.devicePostRecordingDuration
                    row.selectedDrop = { label: record.label, id: record.id }

                    let CheckIfThere;
                    if (mainDrop1.length) CheckIfThere = mainDrop1.findIndex(d => data.selectedDrop && d.id == data.selectedDrop.id);
                    if (!CheckIfThere || CheckIfThere == -1) {
                      mainDrop1.push(row.selectedDrop);
                    }
                    return;
                  }
                });
              }
            });
          });
        }

        this.setState({
          wholeSmartLoop: data,
          mainDropDown: mainDrop1
        });
      }
    }



    if (nextProps && nextProps.initialValues && nextProps.initialValues.siteSmartDevices) {
      if (nextProps.initialValues.siteSmartDevices)
        var selectedcameraBrand1 = this.state.brandList.length ? this.state.brandList.find(brand => brand.value === nextProps.initialValues.cameraBrand) : {}

      this.setState({
        updatedSmartDevices: nextProps.initialValues.siteSmartDevices,
        cameraBrandID: nextProps.initialValues.cameraBrand,
        selectedcameraBrand: selectedcameraBrand1 ? selectedcameraBrand1 : {}
      });

    }

    if ((nextProps.cameraData && nextProps.cameraData !== this.props.cameraData)) {
      let { data, isFetching, error } = nextProps.cameraData;
      if (!isFetching) {

        if (data && data.error && !data.success) {
          console.log('Swal: ', error || data.error);
          swal({ title: "Error", text: error || data.error, icon: "error", });
          return;
        }
        if (nextProps.cameraData.data && nextProps.cameraData.data.message) {
          swal({
            title: utils.getAlertBoxTitle(nextProps.cameraData.data.success),
            text: nextProps.cameraData.data.message,
            icon: utils.getAlertBoxIcon(nextProps.cameraData.data.success)
          }).then(function () {
            this.props.dispatch(cameraRecord.request({ action: 'load', filters: [{ "value": this.props.storeId, "property": "storeId", "type": "string" }] }));
            window.scrollTo(0, 0);
            this.setState({ formVisible: false });
            // this.props.history.push("/admin/addcamera/" + this.props.match.params.storeId + "/0" + "?formVisible=false");
            this.props.setFormVisible(false);
          }.bind(this));
        }
      }
    }

    if ((nextProps.storesData && nextProps.storesData !== this.props.storesData)) {
      if (!nextProps.storesData.isFetching) {
        utils.getUpdatedStoreData(this, nextProps);
      }
    }
  }
  // addCamera = () => {
  //   this.setState({ formVisible: true, triedOnceSaveNew: false }, () => this.scrollToMiddle())
  //   let { params } = this.props.match;
  //   this.props.history.push("/admin/addcamera/" + params.storeId + "/0");
  // }----test it

  createTag = () => {
    const { tagName, camClient } = this.state;

    if (!tagName) this.setState({ TagNameErr: true, tagSaving: false });
    else this.props.dispatch(cameraTags.request({
      action: 'globalTag',
      data: { name: tagName, isGlobal: true, clientId: null },
      clientId: camClient
    }));
  }

  // onRowClick(index, record) {
  //   this.setState({ formVisible: true }, () => {
  //     this.scrollToMiddle();
  //   })
  //   let currentUrl = this.props.match.url;
  //   this.getCameraDataRecord(params.storeId, record._id)
  //   //MARK: Added this conditional to fix unwanted behavior after saving camera
  //   if ((this.props.storeId && currentUrl.indexOf(params.storeId == -1)) || (record._id && currentUrl.indexOf(record._id) == -1)) {
  //     this.props.history.push('/admin/site/' + params.storeId + "/addcamera/" + record._id);
  //   }
  //   else {
  //     window.location.reload();
  //   }
  // }

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

  onStoreClick() {
    let { storeId } = this.props;
    this.context.router.history.push('/admin/sites/addstore/' + storeId);
  }
  onSmartDeviceClick() {
    let { storeId,params } = this.props;
    console.log(params)
    this.props.history.push('/admin/sites/smartDevice/' + storeId);
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

  // onCancel = () => {
  //   //this.setState({ formVisible: false }, () => window.scrollTo(0, 0));
  //   let { params } = this.props;
  //   if (params._id === "0") {
  //     return this.setState({ formVisible: false }, () => window.scrollTo(0, 0))
  //   }
  //   this.props.history.push("/admin/addcamera/" + params.storeId + "/0" + "?formVisible=false");
  // }

  validateNativeAndBrand = (setFieldValue, option, fieldName, values) => {
    const { brandList, selectedcameraBrand, rex, recordingType } = this.state;

    let AlertMessage = "Selected brand does not support native connectivity.";
    let LetGoCamera = true;
    let LetGoNative = true;

    // on changing brand if native connectivity is on then validating whether that brand supports it or not
    if (fieldName === 'cameraBrand') {

      if (values.isNativeConnection && option && !option.nativeConnection) {
        this.setState({ selectedcameraBrand: selectedcameraBrand });
        swal({ title: "Error", text: AlertMessage, icon: "error" });
        LetGoCamera = false;
        return;
      }

      if (LetGoCamera) {
        let brand = brandList && option ? brandList.find(brand => brand.value === option.value) : {};
        this.setState({ selectedcameraBrand: brand });
        setFieldValue("cameraBrand", option ? option.value : '');
      }

    } else {

      // on toggling on native connectivity checks if selected brand supports it or not
      if (selectedcameraBrand && selectedcameraBrand.nativeConnection === false && !option) {
        swal({ title: "Error", text: AlertMessage, icon: "error" });
        LetGoNative = false;
        return;
      }

      // on toggling on native connectivity checks that recording engine must be rex only
      if (!rex && !option && LetGoNative) {
        AlertMessage = `Native Connection cannot be turned on when Recording engine is ${recordingType === "Default" ? "Custom" : recordingType === "NVR" ? "IPC" : recordingType}.`;
        swal({ title: "Error", text: AlertMessage, icon: "error" });
        LetGoNative = false;
        return;
      }

      if (LetGoNative) setFieldValue("isNativeConnection", option ? false : true);
    }
  }

  static setTriedOnce = (args) => {
    this.setState({triedOnceSaveNew:args});
  } 

  static setRecordingStreamErr = (args) => {
    this.setState({recordingStreamErr:args});
  } 

    onSave = async (values,{setSubmitting}) => {
     console.log('ONSAVE',values)
    setSubmitting(false);
    this.setState({ triedOnceSaveNew: true })
    let id = this.props.params._id;
    let { wholeSmartLoop, tags, tagsOptions } = this.state
    let storeId = this.props.storeId;

    let recordingStream = this.checkRecordingStream(values.RecordingStreamURL);
    if (recordingStream) {
      this.setState({ recordingStreamErr: false });
      values.RecordingStreamURL = values.RecordingStreamURL && values.RecordingStreamURL.label ? values.RecordingStreamURL.label : values.RecordingStreamURL;

      let loggedData;
      console.log(wholeSmartLoop);
      let smartDevices = []
      wholeSmartLoop.forEach(x => {
        x.storeList.forEach(y => {
          if (y.selectedDrop && !y.status) {
            smartDevices.push({
              "deviceId": y.selectedDrop.id,
              "devicePreRecordingDuration": y.pre,
              "devicePostRecordingDuration": y.post
            })
          }
        })
      })

      values.siteSmartDevices = [...smartDevices];

      values.tags = [];

      tags && tags.length && tags.forEach(tag => {
        let record = tagsOptions.find(ob => ob.name === tag);
        if (record) values.tags.push(record._id);
      });

      if (id === "0") {
        values.storeId = storeId;
        loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.locations, consts.Added + ' - ' + values.name);
        this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
        this.props.dispatch(cameraData.request({ action: 'save', data: values }, id));
      } else {
        utils.deleteUnUsedValue(values, ["password"]);
        loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.locations, consts.Update + ' - ' + values.name);
        this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
        this.props.dispatch(cameraData.request({ action: 'update', data: values }, id));
      }
    } else {
      this.setState({ recordingStreamErr: true });
    }
  }

  onDelete = () => {
    swal({
      title: consts.ConfirmationTitle,
      text: consts.DeleteMessage,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(function (willDelete) {
      let id = this.props.params._id;
      if (willDelete) {
        let loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.locations, consts.Delete + ' - ' + this.props.cameraData.data.name);
        this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
        this.props.dispatch(cameraData.request({ action: 'delete' }, id));
      }
    }.bind(this));
  }

  onAlarmEvent() {
    let { params, storeId } = this.props;
    let id = params._id;
    let loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.locations, consts.Alarm + ' - ' + this.props.cameraData.data.name);
    let options = {
      clientId: storeId,
      camId: id,
      doorId: 1, //pass DoorId after discuss with Yen Sir
      userId: loggedData.userId
    }
    this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
    this.props.dispatch(alarmEvent.request(options, null, "GET", (data) => {
      swal({
        title: 'Alarm',
        text: data.message,
        icon: utils.getAlertBoxIcon(data.success),
      });
    }));
  }

  getInitialValueTemplate() {

    return {
      status: "Active",
      recordTimeLimit: "",
      recordPreTime: "",
      recordPostTime: "",
      isRecordingStarted: false,
      cameraNotes: "",
      cameraType: "",
      isHeatMapCamera: false,
      heatMapCameraPort: "",
      isPtzControl: false,
      protocolType: "",
      activeStatus: "Active",
      isRecordingEnabled: false,
      covertCamera: false,
      enableHeatMap: false,
      covertCamera: false,
      recordingStream: "",
      roles: [],
      // selectedStreamId: "",
      // selectedStreamId2: "",
      RecordingStreamURL: "",
      ip: "",
      post: "",
      username: "",
      password: "",
      isNativeConnection: false
    }
  }

  handleTagChange(tag) {
    this.setState({ tags: tag });
  }

  handleCamSmart = (value, name, index) => {
    console.log(value, name, index);

    let { wholeSmartLoop, mainDropDown } = this.state
    let mainDrop1 = [...mainDropDown]
    if (value) {
      wholeSmartLoop = wholeSmartLoop.map(x => {
        if (x.name == name) {
          x.storeList[index].selectedDrop = value;
          x.storeList[index].status = false

          let check = mainDrop1.some(x => x.label == name)
          if (!check) mainDrop1.push(value)

          return x
        } else {
          return x
        }
      })
      console.log(wholeSmartLoop);
      this.setState({
        wholeSmartLoop: wholeSmartLoop,
        mainDropDown: mainDrop1
      })
    }
  }

  handleLoop = (e, name, index, pStatus) => {
    console.log(e.target.value, name, index, pStatus);
    let { wholeSmartLoop } = this.state

    wholeSmartLoop = wholeSmartLoop.map(x => {
      if (x.name == name) {
        if (pStatus == "pre")
          x.storeList[index].pre = e.target.value
        else
          x.storeList[index].post = e.target.value

        return x
      } else {
        return x
      }
    });
    this.setState({
      wholeSmartLoop: wholeSmartLoop
    });
  }
  addRow = (name, index) => {
    let { wholeSmartLoop, mainDropDown } = this.state

    wholeSmartLoop = wholeSmartLoop.map(x => {
      if (x.name == name) {

        let drop = []

        drop = x.storeList[x.storeList.length - 1].drop.filter(y => {
          console.log(y.label, x.storeList);

          if (mainDropDown.length) {
            let index = mainDropDown.findIndex(drop => drop.id == y.id)

            if (index == -1) {
              return true;
            } else return false
          } else return
        });

        let empty = { drop: drop, pre: "", post: "", selectedDrop: "", status: true }
        x.storeList.push(empty)
        return x
      } else {
        return x
      }
    });
    this.setState({ wholeSmartLoop: wholeSmartLoop });
  }
  handleSmartFinal = (a, b) => {
    console.log(a, b);
  }
  deleteRow = (item) => {
    let { wholeSmartLoop, mainDropDown } = this.state
    let DeleteId = item.id;

    let data = mainDropDown.filter(x => {
      return x.id != DeleteId
    });

    let DeviceName;
    wholeSmartLoop.map(WSL => {
      if (WSL && WSL.storeList.length) {

        let DeleteRowIndex = WSL.storeList.findIndex(list => list.selectedDrop && list.selectedDrop.id === DeleteId);

        if (DeleteRowIndex != -1) {
          DeviceName = WSL.name;
        }

        WSL.storeList.map((row, rowIndex) => {
          let CheckIndex = row.drop.findIndex(x => row.selectedDrop && row.selectedDrop.id == x.id)

          // adding deleted row in the dropdowns of other fields
          if (DeviceName === WSL.name) {
            if (WSL.storeList.length > 1 && CheckIndex == -1) {
              if (rowIndex >= DeleteRowIndex) row.drop.push(item);
            } else {
              if (rowIndex > DeleteRowIndex) row.drop.push(item);
            }
            // row.drop.push(item);
          }

          if (!row.status && row.selectedDrop && row.selectedDrop.id === DeleteId) {
            row.selectedDrop = "";
            row.status = true;
            row.pre = '';
            row.post = '';
          }
        });

        // removing the row from the UI if there are more than 1 field
        if (WSL.storeList.length > 1) {
          if (DeleteRowIndex != -1) WSL.storeList.splice(DeleteRowIndex, 1);
        }
      }
    });

    this.setState({
      mainDropDown: data,
      wholeSmartLoop: wholeSmartLoop
    })
  }
  // active status
  activeStatus = (status) => {
    this.setState({
      activeStatus: status
    }, () => {
      console.log(this.state.activeStatus, status);
    })
  }

  nativeConnection = (isConnected) => {
    this.setState({
      nativeConnection: isConnected
    }, () => {
      console.log(this.state.nativeConnection, isConnected);
    })
  }

  changeRecording = (e) => {
    this.setState({
      isRecordingEnabled: e.target.value,
    });
  };
  changeConvert = (e) => {
    this.setState({
      covertCamera: e.target.value,
    });
  };
  changeHeatMap = (e) => {
    this.setState({
      enableHeatMap: e.target.value,
    });
  };

  handleSelectedTypes = (value, type, index) => {
    console.log(value);
    if (value) {
      this.setState({
        selectedOption: value
      })
      let data = this.state.recorCollection.map(x => {
        if (x.type == type) {
          x.inside[index].selectedOption = value
          return x
        } else {
          return x
        }
      })
      console.log(data);
      this.setState({
        recorCollection: data
      })
    }
  }
  addTypes = (type, index) => {
    let data = this.state.recorCollection.map(x => {
      if (x.type == type) {
        x.inside[index].status = false
        let data = { options: x.inside[0].options, preReco: "", postReco: "", status: true, selectedOption: "" }
        x.inside.push(data)
        return x
      } else {
        return x
      }
    })
    console.log(data);
    this.setState({
      recorCollection: data,
      selectedOption: {},
      pre: "",
      post: ""
    })
  }
  handleChangeTypes = (e, type, index, reco) => {
    console.log(e.target.name, e.target.value, type, index);
    if (e) {

      let data = this.state.recorCollection.map(x => {
        if (x.type == type) {
          if (e.target.name == "post") {
            x.inside[index].postReco = e.target.value
          } else {
            x.inside[index].preReco = e.target.value
          }
          return x
        } else {
          return x
        }
      });
      this.setState({
        recorCollection: data
      });
    }
  }

  render() {
    const { state, onCancel, props, onDelete, isUpdate, addCamera, onAlarmEvent } = this;
    const storeId = Number(this.props.storeId);

    const { columns, activeTab, tags, smartDevices, isOpenDeviceModal, scanDevices,
      isScanning, deviceError, imagePreviewUrl, modal, selectedValues, autoSerialNumber,
      openLoader, recorCollection, post, pre, selectedOption, recordingStream1, recordingStream2,
      brandList, SmartName, collapse, camSmartDevices, triedOnceSaveNew, showTags, showCovertCamera,
      resetRecordingStreamURL, recordingStreamErr, tagsOptions, AddTags, TagNameErr, tagName, tagSaving
    } = state;

    const { activeStatus, nativeConnection, isRecordingEnabled, covertCamera, enableHeatMap, isConnected,
      siteDevice, roleSelected, roles, smartDropDown, selectedDevices, rex, wholeSmartLoop, mainDropDown,
      recordingType, selectedcameraBrand
    } = this.state;
    const { listAction, actionName, sortColumn, sortDirection, localPaging, initialValues,isSubmittingForm } = props;
    const { Status, CameraType, cameraBrandOptions, protocolTypeOptions } = consts

    const initialValuesEdit = isUpdate ? initialValues : this.getInitialValueTemplate();

    let CameraFilters = [{ value: this.props.storeId, property: "storeId", type: "string" }];

    const options = [
      { value: Status.Active, label: Status.Active },
      { value: Status.Inactive, label: Status.Inactive }
    ];

    const cameraTypeOptions = [
      { value: CameraType.Default, label: CameraType.Default },
      { value: CameraType.CompleteView, label: CameraType.CompleteView },
      { value: CameraType.PTZ, label: CameraType.PTZ }
    ]
    let { cameraData } = this.props;
    let isFetching = cameraData && cameraData.isFetching;
    isFetching = isFetching || cameraData && cameraData.isFetching;

    props.isUpdateForm(isUpdate);

    return (
      <div className="animated fadeIn">
        {/* Modal for adding new Global tags starts */}
        <Modal
          isOpen={AddTags}
          className={"blackColor preference-modal AddTagModal"}
          onRequestClose={() => this.setState({ AddTags: false })}
        >
          <ModalHeader
            toggle={() =>
              this.setState({ AddTags: !AddTags })
            }
          >
            Add Tags
          </ModalHeader>
          <ModalBody>
            <FormGroup row className="ml-4" >
              <Label htmlFor="tagss" >Tags<span className={'text-danger'}>*</span></Label>
              <Col sm={9} >
                <Input
                  id="tagss"
                  placeholder="Enter Tags Name"
                  type="text"
                  className="form-control ml-4"
                  value={tagName}
                  onChange={(e) => this.setState({ tagName: e.target.value, TagNameErr: false })}
                />
                {TagNameErr && <div className="input-feedback ml-4"> Required </div>}
              </Col>
            </FormGroup>

            <div className='mt-1 form-button-group floatRight AddTagModalBtns' >
              <button
                type="button"
                onClick={() => this.setState({ tagSaving: true }, () => this.createTag())}
                className="btn formButton mr-2"
                disabled={tagSaving}
              >
                <i className="fa fa-save mr-1" aria-hidden="true" ></i>
                  Save
              </button>

              <button
                onClick={() => this.setState({ AddTags: !AddTags })}
                type="button" className="btn formButton" >
                <i className="fa fa-close" aria-hidden="true" ></i> Cancel
              </button>
            </div>

          </ModalBody>
        </Modal>
        {/* Modal for adding new Global tags ends */}

        <LoadingDialog isOpen={isFetching} />
        <Formik
          enableReinitialize={isUpdate || triedOnceSaveNew ? true : false}
          initialValues={initialValuesEdit}
          onSubmit={this.onSave}
          validationSchema={
            Yup.object().shape({
              cameraBrand: Yup.string().trim().required('Required'),
              cameraType: Yup.string().trim().required('Required'),
              RecordingStreamURL: Yup.string().trim().required('Required'),
              name: Yup.string().trim().required('Required'),
              primaryCameraId :Yup.string().trim().required('Required'),
              cameraRTSPUrl: Yup.string().trim().required('Required'),
              cameraThumbnailRTSPUrl:Yup.string().trim().required('Required'),
              primaryStreamId:Yup.string().trim().required('Required'),
              secondaryStreamId:Yup.string().trim().required('Required'),
              // heatMapCameraPort:Yup.string().trim().required('Required'),
              // smartDropDown: Yup.string().trim().required('Required'),
              // ip:Yup.string().trim().required('Required'),
              // port:Yup.string().trim().required('Required'),
              // username:Yup.string().trim().required('Required'),
              // password:Yup.string().trim().required('Required'),
            })
          }    
          // handleSubmit
        >
          {(props) => {

            let {
              values,
              touched,
              errors,
              isSubmitting,
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
              submitForm
            } = props;

            this.props.onSave(submitForm)

            if (values && resetRecordingStreamURL) {
              this.setState({ resetRecordingStreamURL: false })
              values.RecordingStreamURL = '';
            }

            if (values) {
              values.isRecordingEnabled = values.isRecordingEnabled === true || values.isRecordingEnabled === false ? values.isRecordingEnabled.toString() : values.isRecordingEnabled;

              values.rex = rex;

              values.covertCamera = values.covertCamera === true || values.covertCamera === false ? values.covertCamera.toString() : values.covertCamera;

              values.enableHeatMap = values.enableHeatMap === true || values.enableHeatMap === false ? values.enableHeatMap.toString() : values.enableHeatMap;
            }
            isSubmittingForm(isSubmitting);
            return (

              <Row>
                <Col md={12}>
                  <form autoComplete="off" onSubmit={handleSubmit}>
                  <div>
                          <div className='row site-tab-holder m-0' id="middle">
                            <div className='col-lg-6' style={{ padding: "0px" }}>
                              <FormGroup row style={{ margin: "0px" }}>
                                {/* <Col sm={10} className="text-field">
                                    <Select class="form-control custom-select" required
                                      id="cameraBrand"
                                      isClearable={true}
                                      onChange={this.handleConfigCamera}
                                      onBlur={handleBlur}
                                      // options={this.props.cameraData}
                                    />
                                    <label class="fixed-label" for="userName">Select a configured  Camera to Copy the Details</label>
                                </Col> */}
                              </FormGroup>
                            </div>
                          </div>
                          <div className='row site-tab-holder mt-0 generalInfoAddCamera' id="middle" >
                            <div className='col-lg-6 pt-0 pb-0' style={{ padding: "12px" }}>

                              <FormGroup row className="m-0 mb-2">
                                <Col sm={10} className="pl-2">
                                  <h5 className='pl-1'>General Information</h5>
                                </Col>
                              </FormGroup>

                              <FormGroup row style={{ margin: "0px" }}>
                                <Col sm={10} className="text-field">
                                  <Input
                                    id="name"
                                    type="text"
                                    value={values.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="form-control text-form"
                                    required
                                  />
                                  <label className="text-label">Name<span className={'text-danger'}>*</span></label>
                                  {errors.name && <div className="input-feedback">{errors.name}</div>}
                                </Col>
                              </FormGroup>

                              <FormGroup row style={{ margin: "0px" }}>
                                <Col sm={10} className="text-field">
                                  <Input
                                    id="place"
                                    type="text"
                                    value={values.place}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="form-control text-form"
                                  />
                                  <label className="text-label">Location</label>
                                </Col>
                              </FormGroup>
                              <FormGroup row style={{ margin: "0px" }}>
                                <Col sm={10} className="text-field">
                                  <Select
                                    id="cameraType"
                                    isClearable={true}
                                    value={cameraTypeOptions ? cameraTypeOptions.find(option => option.value === values.cameraType) : ''}
                                    onChange={(option) => setFieldValue("cameraType", option ? option.value : '')}
                                    onBlur={handleBlur}
                                    options={cameraTypeOptions}
                                  />
                                  <label class="fixed-label ml-1" for="userName">Type<span className={'text-danger'}>*</span></label>
                                  {errors.cameraType && <div className="input-feedback">{errors.cameraType}</div>}
                                </Col>
                              </FormGroup>

                               {/* tag field is only visible if logged in user has tags function permission */}
                              {showTags ? <FormGroup row style={{ margin: "0px" }}>
                                <Col sm={10} className="text-field mr-2">
                                  
                                  <AntSelect
                                   mode="multiple"
                                   placeholder="Add tags"
                                   value={tags}
                                   onChange={this.handleTagChange}
                                   style={{ width: '100%', backgroundColor: "white", color:"#000" }}
                                   optionLabelProp="label"
                                  >  
                                   {tagsOptions.map(item => (
                                      <AntSelect.Option label={item.name} key={item._id} value={item.name}>
                                        {item.name}
                                      </AntSelect.Option>
                                    ))}
                                  </AntSelect>

                                  <label class="fixed-label ml-1">Tag</label>
                                  
                                </Col>
                               {/* plus button is only visible if logged in user has admin role */}
                                {this.isAdminRole ? <AntButton
                                    className="mt-1 pointer dashboard-button gridAdd" shape="circle"
                                    icon="plus" ghost
                                    onClick={() => this.setState({ AddTags: true, tagName: '' })}
                                  /> : ''}

                              </FormGroup> : <> </>}

                              <FormGroup row style={{ margin: "0px" }}>
                                <Col sm={10} className="text-field">
                                  <Input
                                    id="register"
                                    type="number"
                                    value={values.register}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="form-control text-form"
                                  />
                                  <label class="fixed-label">Register No</label>
                                </Col>
                              </FormGroup>
                            </div>

                            <div className='col-lg-6 pt-2'>
                              <FormGroup row style={{ margin: "0px" }}>
                                <br /><br />
                                <Col sm={8} />
                                <Col sm={2}>Status</Col>
                                <Col sm={2} classNa1me="text-field">
                                  <label className="switch">
                                    <input type="checkbox" className="toggle"

                                      checked={values.status === "Active"}
                                      onClick={(option) => setFieldValue("status", values.status === "Inactive" ? "Active" : "Inactive")}
                                      id="isActive"
                                    />
                                    <span className="slider round"></span>
                                  </label>
                                </Col>
                              </FormGroup>
                            </div>
                          </div>
                          <div>
                            <div className='col-lg-12' style={{ padding: "0px" }}>
                              {/* backgroundColor: "#1e384c", */}
                              <FormGroup className="mb-0 form-row">
                                <Col sm={3} style={{ fontSize: "16px" }} className="pt-1 pl-1">Use Native Connection
                                
                                <label className="switch ml-4">
                                    <input type="checkbox" className="toggle"
                                      checked={values.isNativeConnection ? true : false}
                                      onClick={(option) => this.validateNativeAndBrand(setFieldValue, values.isNativeConnection, 'isNativeConnection', values)}
                                      id="isTrue"
                                    />
                                    <span className="slider round"></span>
                                  </label>
                                  </Col>
                                {/* <Col sm={2} className="text-field ml-0">
                                  <label className="switch">
                                    <input type="checkbox" className="toggle"
                                      checked={values.isNativeConnection ? true : false}
                                      onClick={(option) => this.validateNativeAndBrand(setFieldValue, values.isNativeConnection, 'isNativeConnection', values)}
                                      
                                      id="isTrue"
                                    />
                                    <span className="slider round"></span>
                                  </label>
                                </Col> */}
                                <Col sm={3} className="text-field ml-0 mr-0 pl-1">
                                  <Select class="form-control custom-select"
                                    // required
                                    id="cameraBrand"
                                    isClearable={true}
                                    value={selectedcameraBrand}
                                    onChange={(option) => this.validateNativeAndBrand(setFieldValue, option, 'cameraBrand', values)}
                                    onBlur={handleBlur}
                                    options={brandList}
                                  />
                                  <label class="fixed-label ml-1">Brand<span className={'text-danger'}>*</span></label>
                                  {errors.cameraBrand && <div className="input-feedback">{errors.cameraBrand}</div>}
                                </Col>
                              </FormGroup>
                            </div>
                          </div>

                          {/* <div className='col-lg-12  p-0'>
                            <FormGroup className="form-row mb-0" >
                              <Col sm={3} className="text-field ml-0 mr-0">
                                <Input
                                  id="primaryCameraId"
                                  type="number"
                                  value={values.primaryCameraId}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className="form-control text-form"
                                // required
                                />
                                <label class="fixed-label ml-1"> Primary Camera Id </label>
                              </Col>

                              <Col sm={3} className="text-field ml-0 mr-0">
                                <Input
                                  id="primaryStreamId"
                                  type="number"
                                  value={values.primaryStreamId}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className="form-control text-form"
                                // required
                                />
                                <label class="fixed-label ml-1">Primary Stream Id </label>
                              </Col>

                              <Col sm={3} className="text-field ml-0 mr-0">
                                <Input
                                  id="secondaryStreamId"
                                  type="number"
                                  value={values.secondaryStreamId}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className="form-control text-form"
                                // required
                                />
                                <label class="fixed-label ml-1" >Secondary Stream Id</label>
                              </Col>

                              <Col sm={3} className="text-field ml-0 mr-0">
                                <Input
                                  id="recordingStreamId"
                                  type="number"
                                  value={values.recordingStreamId}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className="form-control text-form"
                                // required
                                />
                                <label class="fixed-label ml-1"  >Recording Stream Id</label>
                              </Col>
                            </FormGroup>
                          </div> */}

                          {/* If Connection is Native show the following Information */}
                          {/* {values.isConnected ?true:<p>helooooo</p>} */}

                          <div style={{ fontSize: "16px" }}>
                            {/* Connection (Native) & Recording Engine is {rex ? <></> : <>Not</>} REX */}

                            {values.isNativeConnection ? <> Connection (Native) & Recording Engine is {recordingType === "Default" ? "Custom" : recordingType === "NVR" ? "IPC" :recordingType}
                              <div className="form-row mt-2">
                                <div className='col-lg-3' style={{ padding: "0px" }}>
                                  {/* backgroundColor: "#1e384c", */}
                                  <FormGroup row style={{ margin: "0px" }}>
                                    <Col sm={12} className="text-field p-0 ml-0 mr-0">
                                      <Input
                                        id="ip"
                                        type="text"
                                        value={values.ip}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className="form-control text-form"
                                      required
                                      />
                                      <label className="text-label">Camera IP<span className={'text-danger'}>*</span></label>
                                      {errors.ip && <div className="input-feedback">{errors.ip}</div>}

                                    </Col>
                                  </FormGroup>
                                </div>
                                <div className='col-lg-3' style={{ padding: "0px" }}>
                                  {/* backgroundColor: "#1e384c", */}
                                  <FormGroup row style={{ margin: "0px" }}>
                                    <Col sm={12} className="text-field p-0 ml-0 mr-0">
                                      <Input
                                        id="port"
                                        type="number"
                                        value={values.port}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className="form-control text-form"
                                        required
                                      />
                                      <label className="text-label">Port<span className={'text-danger'}>*</span></label>
                                      {errors.port && <div className="input-feedback">{errors.port}</div>}
                                    </Col>
                                  </FormGroup>
                                </div>
                                <div className='col-lg-12  p-0'>
                                  {/* backgroundColor: "#1e384c", */}
                                  <FormGroup className="form-row mb-0" >
                                    <Col sm={3} className="text-field p-0 ml-0 mr-0">
                                      <Input
                                        id="username"
                                        type="text"
                                        value={values.username}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className="form-control text-form"
                                        required
                                      />
                                      <label className="text-label">Login<span className={'text-danger'}>*</span></label>
                                      {errors.username && <div className="input-feedback">{errors.username}</div>} </Col>
                                    <Col sm={3} className="text-field p-0 ml-0 mr-0">
                                      <Input
                                        id="password"
                                        type="password"
                                        value={values.password}
                                        autoComplete="new-password"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className="form-control text-form"
                                        required
                                      />
                                      <label className="text-label">Password<span className={'text-danger'}>*</span></label>
                                      {errors.password && <div className="input-feedback">{errors.password}</div>}
                                    </Col>
                                    <Col sm={3} className="text-field p-0 ml-0 mr-0" >
                                      <Input
                                        id="cameraAIUrl"
                                        type="text"
                                        value={values.cameraAIUrl}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className="form-control text-form"
                                      // required
                                      />
                                      <label className="fixed-label">AI Stream RTSP URL</label>
                                    </Col>
                                  </FormGroup>
                                </div>

                                {/* <div className='col-lg-3' style={{ padding: "0px" }}>
                                  {rex ? <FormGroup row style={{ margin: "0px" }}>
                                    <Col sm={12} className="text-field p-0 ml-0 mr-0 mt-2">
                                      <Input
                                        id="primaryCameraId"
                                        type="number"
                                        value={values.primaryCameraId}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className="form-control text-form"
                                        required
                                      />
                                      <label className="text-label">Camera ID</label>
                                    </Col>
                                  </FormGroup> : <></>}
                                </div> */}

                              </div> </> : ""}

                            {!values.isNativeConnection ? <> Connection (Not Native) & Recording Engine is {recordingType === "Default" ? "Custom" : recordingType === "NVR" ? "IPC" :recordingType}
                              <div className="form-row site-tab-holder pt-2">

                                {rex && <div className='col-lg-3' style={{ padding: "0px" }}>
                                  {/* backgroundColor: "#1e384c", */}
                                  <FormGroup row style={{ margin: "0px" }}>
                                    <Col sm={12} className="text-field p-0 ml-0 mr-0">
                                      <Input
                                        id="primaryCameraId"
                                        type="number"
                                        value={values.primaryCameraId}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className="form-control text-form"
                                        required
                                      />
                                      <label className="text-label">Camera ID<span className={'text-danger'}>*</span></label>
                                      {errors.primaryCameraId && <div className="input-feedback">{errors.primaryCameraId}</div>}

                                    </Col>
                                  </FormGroup>
                                </div>}
                                <div className='col-lg-3' style={{ padding: "0px" }}>
                                  {/* backgroundColor: "#1e384c", */}
                                  <FormGroup row style={{ margin: "0px" }}>
                                    <Col sm={12} className="text-field p-0 ml-0 mr-0" >
                                      <Input
                                        id="cameraAIUrl"
                                        type="text"
                                        value={values.cameraAIUrl}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className="form-control text-form"
                                      // required
                                      />
                                      <label className="fixed-label">AI Stream RTSP URL</label>
                                    </Col>
                                  </FormGroup>
                                </div>
                                <div className='col-lg-3' style={{ padding: "0px" }}>
                                  {/* backgroundColor: "#1e384c", */}
                                  <FormGroup row style={{ margin: "0px" }}>
                                    <Col sm={12} className="text-field p-0 m-0">
                                      <Input
                                        id="cameraRTSPUrl"
                                        type="text"
                                        value={values.cameraRTSPUrl}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className="form-control text-form"
                                        required
                                      />
                                      <label className="fixed-label">Primary/Recording Stream RTSP URL<span className={'text-danger'}>*</span></label>
                                      {errors.cameraRTSPUrl && <div className="input-feedback">{errors.cameraRTSPUrl}</div>}
                                    </Col>
                                  </FormGroup>
                                </div>
                                <div className='col-lg-3' style={{ padding: "0px" }}>
                                  {/* backgroundColor: "#1e384c", */}
                                  <FormGroup row style={{ margin: "0px" }}>
                                    <Col sm={12} className="text-field p-0 m-0">
                                      <Input
                                        id="cameraThumbnailRTSPUrl"
                                        type="text"
                                        value={values.cameraThumbnailRTSPUrl}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className="form-control text-form"
                                        required
                                      />
                                      <label className="fixed-label">Secondary Stream RTSP URL<span className={'text-danger'}>*</span></label>
                                      {errors.cameraThumbnailRTSPUrl && <div className="input-feedback">{errors.cameraThumbnailRTSPUrl}</div>}
                                      
                                    </Col>
                                  </FormGroup>
                                </div>
                                {!rex && <div className='col-lg-3' style={{ padding: "0px" }}>
                                  {/* backgroundColor: "#1e384c", */}
                                  <FormGroup row style={{ margin: "0px" }}>
                                    <Col sm={12} className="text-field p-0 m-0">
                                      <Select class="form-control custom-select" required
                                        id="recordingStream1"
                                        isClearable={true}
                                        value={recordingStream2 ? recordingStream2.find(option => option.value === values.RecordingStreamURL) : ''}
                                        onChange={(option) => {this.setState({recordingStreamErr: false}); setFieldValue("RecordingStreamURL", option ? option.value : '')}}
                                        onBlur={handleBlur}
                                        options={recordingStream2}
                                        isRequired={true}
                                      >
                                      </Select>
                                      <label class="fixed-label ml-1" style={{ marginTop: "-4px" }}>Recording Stream<span className={'text-danger'}>*</span></label>
                                      {!recordingStreamErr && errors.RecordingStreamURL && <div className="input-feedback">{errors.RecordingStreamURL}</div>}
                                      {recordingStreamErr && <div className="input-feedback">Required</div>}
                                    </Col>
                                  </FormGroup>
                                </div>}

                              </div>

                              <div className="row site-tab-holder m-0">

                              </div>

                            </> : <></>}

                            {rex ?
                              <div className="form-row site-tab-holder">
                                {values.isNativeConnection && <div className='col-lg-3' style={{ padding: "0px" }}>
                                  {/* backgroundColor: "#1e384c", */}
                                  <FormGroup row style={{ margin: "0px" }}>
                                    <Col sm={12} className="text-field p-0 ml-0 mr-0">
                                      <Input
                                        id="primaryCameraId"
                                        type="number"
                                        value={values.primaryCameraId}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className="form-control text-form"
                                        required
                                      />
                                      <label className="text-label">Camera ID<span className={'text-danger'}>*</span></label>

                                      {/* {errors.primaryStreamId && <div className="input-feedback">{errors.primaryStreamId}</div>} */}

                                    </Col>
                                  </FormGroup>
                                </div>}
                                <div className='col-lg-3' style={{ padding: "0px" }}>
                                  {/* backgroundColor: "#1e384c", */}
                                  <FormGroup row style={{ margin: "0px" }}>
                                    <Col sm={12} className="text-field p-0 ml-0 mr-0">
                                      <Input
                                        id="primaryStreamId"
                                        type="number"
                                        value={values.primaryStreamId}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className="form-control text-form"
                                        required
                                      />
                                      <label className="text-label">Primary Stream ID<span className={'text-danger'}>*</span></label>
                                      {errors.primaryStreamId && <div className="input-feedback">{errors.primaryStreamId}</div>}

                                    </Col>
                                  </FormGroup>
                                </div>
                                <div className='col-lg-3' style={{ padding: "0px" }}>
                                  {/* backgroundColor: "#1e384c", */}
                                  <FormGroup row style={{ margin: "0px" }}>
                                    <Col sm={12} className="text-field p-0 ml-0 mr-0">
                                      <Input
                                        id="secondaryStreamId"
                                        type="number"
                                        value={values.secondaryStreamId}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className="form-control text-form"
                                        required
                                      />
                                      <label className="text-label">Secondary Stream ID<span className={'text-danger'}>*</span></label>
                                      {errors.secondaryStreamId && <div className="input-feedback">{errors.secondaryStreamId}</div>}
                                    </Col>
                                  </FormGroup>
                                </div>
                                <div className='col-lg-3' style={{ padding: "0px" }}>
                                  {/* backgroundColor: "#1e384c", */}
                                  <FormGroup row style={{ margin: "0px" }}>
                                    <Col sm={12} className="text-field p-0 ml-0 mr-0">
                                      <Select class="form-control custom-select" required
                                        id="recordingStream1"
                                        isClearable={true}
                                        value={recordingStream1 ? recordingStream1.find(option => option.value === values.RecordingStreamURL) : ''}
                                        onChange={(option) =>{this.setState({recordingStreamErr: false}); setFieldValue("RecordingStreamURL", option ? option.value : '')}}
                                        onBlur={handleBlur}
                                        options={recordingStream1}
                                      >
                                      </Select>

                                      <label class="fixed-label ml-1" style={{ marginTop: "-4px" }} >Recording Stream<span className={'text-danger'}>*</span></label>
                                      {!recordingStreamErr &&  errors.RecordingStreamURL && <div className="input-feedback">{errors.RecordingStreamURL}</div>}
                                      {recordingStreamErr && <div className="input-feedback">Required</div>}
                                    </Col>
                                  </FormGroup>
                                </div>
                              </div>
                              : <></>}



                          </div>

                          <div className="form-row site-tab-holder" style={{ padding: "0px" }}>
                            <div className='col-lg-3' style={{ padding: "0px" }}>
                              {/* backgroundColor: "#1e384c", */}
                              Recording Enabled <br />
                              {/* <Radio.Group
                                   onChange={(e) => this.changeRecording(e)}
                                   value={isRecordingEnabled}
                                  >
                                    <Radio value="recordingYes">yes</Radio>
                                    <Radio value="recordingNo">NO</Radio>
                                  </Radio.Group> */}
                              <div className="row" style={{ margin: "0px" }}>
                                <Label check>
                                  <Input
                                    id="isRecordingEnabled"
                                    name="isRecordingEnabled"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={'true'}
                                    checked={values.isRecordingEnabled == 'true'}
                                    className="cursor mt7 sms-Checkbox playback_checkbox blckBackgroundClr" type="radio" />

                                  <span className="blckClr ml-4 mt-1">Yes</span>
                                </Label>
                                &nbsp; &nbsp;
                                <Label check>
                                  <Input
                                    id="isRecordingEnabled"
                                    name="isRecordingEnabled"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={'false'}
                                    checked={values.isRecordingEnabled == 'false'}
                                    className="cursor mt7 sms-Checkbox playback_checkbox blckBackgroundClr" type="radio" />
                                  <span className="blckClr ml-4 mt-1">No</span>

                                </Label>
                              </div>
                            </div>
                            <div className='col-lg-3' style={{ padding: "0px" }}>
                              {/* backgroundColor: "#1e384c", */}
                              Covert Camera <br />
                              {/* <Radio.Group
                                   onChange={(e) => this.changeConvert(e)}
                                   value={isConvertEnabled}
                                  >
                                    <Radio value="convertYes">yes</Radio>
                                    <Radio value="convertNo">NO</Radio>
                                  </Radio.Group> */}
                              <div className="row" style={{ margin: "0px" }}>
                                <Label check>
                                  <Input

                                    id="covertCamera"
                                    name="covertCamera"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={'true'}
                                    checked={values.covertCamera == 'true'}
                                    className="cursor mt7 sms-Checkbox playback_checkbox blckBackgroundClr" type="radio" />

                                  <span className="blckClr ml-4 mt-1">Yes</span>
                                </Label>
                                &nbsp; &nbsp;
                                <Label check>
                                  <Input
                                    id="covertCamera"
                                    name="covertCamera"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={'false'}
                                    checked={values.covertCamera == 'false'}
                                    className="cursor mt7 sms-Checkbox playback_checkbox blckBackgroundClr" type="radio" />
                                  <span className="blckClr ml-4 mt-1">No</span>

                                </Label>
                              </div>
                            </div>
                            <div className='col-lg-3' style={{ padding: "0px" }}>
                              {/* backgroundColor: "#1e384c", */}
                              Heat Map Enable <br />
                              {/* <Radio.Group
                                   onChange={(e) => this.changeHeatMap(e)}
                                   value={isHeatMapEnabled}
                                  >
                                    <Radio value="heatMapYes">yes</Radio>
                                    <Radio value="heatMapNo">NO</Radio>
                                  </Radio.Group> */}
                              <div className="row" style={{ margin: "0px" }}>
                                <Label check>
                                  <Input

                                    id="enableHeatMap"
                                    name="enableHeatMap"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={'true'}
                                    checked={values.enableHeatMap == 'true'}
                                    className="cursor mt7 sms-Checkbox playback_checkbox blckBackgroundClr" type="radio" />

                                  <span className="blckClr ml-4 mt-1">Yes</span>
                                </Label>
                                &nbsp; &nbsp;
                                <Label check>
                                  <Input
                                    id="enableHeatMap"
                                    name="enableHeatMap"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={'false'}
                                    checked={values.enableHeatMap == 'false'}
                                    className="cursor mt7 sms-Checkbox playback_checkbox blckBackgroundClr" type="radio" />
                                  <span className="blckClr ml-4 mt-1">No</span>

                                </Label>
                              </div>
                            </div>

                            {/* heatmap selected port */}
                            {/* {values.enableHeatMap == 'true' ? */}
                            <div className='col-lg-3 mt7' style={{ padding: "0px" }}>
                              {/* backgroundColor: "#1e384c", */}
                              <Input
                                id="heatMapCameraPort"
                                type="number"
                                value={values.heatMapCameraPort}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="form-control text-form"
                                required
                                disabled={values.enableHeatMap === 'false'}
                              // placeholder="Port Number"
                              // disabled
                              />
                              <label className="fixed-label m-0 ml-2"  >Heat Map Port</label>
                              {errors.heatMapCameraPort && <div className="input-feedback">{errors.heatMapCameraPort}</div>}
                            </div>
                          </div>

                          {mainDropDown && mainDropDown.length ? <div className="site-tab-holder  ml-0">
                            <div className='col-lg-12 p-0 mt-2' >
                              <FormGroup col>
                                <Col className="form-control text-form mt-1" sm={12}
                                  style={{ backgroundColor: "white", height: "", padding: "6px" }}
                                >
                                  {mainDropDown && mainDropDown.map(x => {
                                      return <>
                                        <Badge key={x.id} color="secondary" style={{ padding: "6px", margin: "2px" }}>{x.label}&nbsp;
                                          <span className="badgeCross pointer" onClick={() => this.deleteRow(x)}>X</span></Badge> &nbsp;
                                        </>
                                    })
                                  }

                                  {/* { mainDropDown && mainDropDown.length === 0 ? <div style={{ color: "lightgray" }}>Select..</div> : <></> } */}

                                  <label style={{ marginTop: "-5px" }} className="fixed-label">Smart Devices</label>
                                </Col>
                              </FormGroup>
                            </div>
                          </div> : ''}
                          
                          {wholeSmartLoop && wholeSmartLoop.length > 0 &&
                            wholeSmartLoop.map(z => {
                              return <div style={{ fontSize: "16px" }} className={mainDropDown && !mainDropDown.length ? "mt-2" : ""} >
                                {z.name}
                                {z.storeList && z.storeList.map((g, index) => {
                                  return <div class="mb-2">
                                    <div className="form-row site-tab-holder">
                                      <div className='col-lg-5' style={{ padding: "0px", marginTop: "1px" }}>
                                        <FormGroup row style={{ margin: "0px" }}>
                                          <Col sm={12} className="text-field p-0 m-0">
                                            <Select class="form-control custom-select" required
                                              id="smartDropDown"
                                              isClearable={true}
                                              value={g.selectedDrop}
                                              onChange={(obj) => this.handleCamSmart(obj, z.name, index)}
                                              options={g.drop}
                                              isDisabled={!g.status}
                                              onBlur={handleBlur}
                                              styles={colourStyles}
                                            />
                                             {errors.smartDropDown && <div className="input-feedback">{errors.smartDropDown}</div>}
                                          </Col>
                                        </FormGroup>
                                      </div>
                                      <div className='col-lg-3' style={{ backgroundColor: "", padding: "0px" }}>
                                        <FormGroup row style={{ margin: "0px" }}>
                                          <Col sm={12} className="text-field p-0 m-0">
                                            <Input
                                              id="preRecordDur"
                                              type="number"
                                              min={0}
                                              value={g.pre}
                                              onChange={(e) => this.handleLoop(e, z.name, index, "pre")}
                                              onBlur={handleBlur}
                                              className="form-control text-form"
                                            required={g.selectedDrop && g.selectedDrop.id ? true : false}
                                            />
                                            <label className="text-label">Pre Recording Duration (Sec){g.selectedDrop && g.selectedDrop.id && <span className={'text-danger'}>*</span>}</label>
                                            {/* {errors.preRecordDur && <div className="input-feedback">{errors.preRecordDur}</div>} */}
                                          </Col>
                                        </FormGroup>
                                      </div>
                                      <div className='col-lg-3' style={{ backgroundColor: "", padding: "0px" }}>
                                        <FormGroup row style={{ margin: "0px" }}>
                                          <Col sm={12} className="text-field pl-0 pt-0 m-0 pr-2">
                                            <Input
                                              id="postRecordDur"
                                              type="number"
                                              min={0}
                                              value={g.post}
                                              onChange={(e) => this.handleLoop(e, z.name, index, "post")}
                                              onBlur={handleBlur}
                                              className="form-control text-form"
                                              required={g.selectedDrop && g.selectedDrop.id ? true : false}
                                            />
                                            <label className="text-label">Post Recording Duration (Sec){g.selectedDrop && g.selectedDrop.id && <span className={'text-danger'}>*</span>}</label>
                                          </Col>
                                        </FormGroup>
                                      </div>

                                      {z.storeList.length < z.mainDrop.length && z.storeList.length - 1 == index && <div className='col-lg-1'>
                                        <FormGroup row className="mb-0">
                                          <Col sm={10} className="text-field m-0 p-0 pl-2 text-center" >
                                            <AntButton className="ml-3 mb-1 dashboard-button gridAdd"
                                              onClick={() => this.addRow(z.name, index)}
                                              style={{ margin: "3px 0px" }} shape="circle" icon="plus" ghost
                                            />
                                          </Col>
                                        </FormGroup>
                                      </div>}
                                    </div>
                                  </div>

                                })}

                              </div>
                            })
                          }
                          <div>
                            <div className="site-tab-holder">

                              <div className='col-lg-12' style={{ padding: "0px" }}>
                                <FormGroup row style={{ margin: "0px" }}>
                                  <Col sm={12} className="text-field m-0 p-0 mt-2">
                                  
                                    <Input
                                      id="cameraNotes"
                                      type="textarea"
                                      value={values.cameraNotes}
                                      onBlur={handleBlur}
                                      onChange={handleChange}
                                      className="form-control text-form"
                                      maxLength="500"
                                      rows="5"
                                      style={{ height: "95px" }}
                                    />
                                    <label className="text-label">Notes</label>
                                  </Col>
                                </FormGroup>
                              </div>
                            </div>
                          </div>

                        </div>
                  </form>
                </Col>
              </Row>
            );
          }}
        </Formik>
      </div>
    );

  }
}

CameraForm.defaultProps = {
  listAction: cameraRecord,
  actionName: 'cameraRecord'
}

CameraForm.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    initialValues: state.cameraData.data || {},
    cameraData: state.cameraData,
    storesData: state.storesData,
    cameraRecord: state.cameraRecord,
    storeData: state.storeData,
    cameraTags: state.cameraTags
  };
}

var CameraFormModule = connect(mapStateToProps)(CameraForm);
export default CameraFormModule;
