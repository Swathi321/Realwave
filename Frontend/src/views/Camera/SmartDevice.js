import React, { PureComponent } from 'react';
import { Row, Col, FormGroup, Input, Collapse, Card, CardHeader, CardBody } from "reactstrap";
import swal from "sweetalert";
import LoadingDialog from "./../../component/LoadingDialog";
import CardWrapper from "./../../component/CardWrapper";
import Grid from '../Grid/GridBase';
import { storeData, getCombos, cameraData } from "../../redux/actions/httpRequest";
import { connect } from 'react-redux';
import util from '../../Util/Util';
import utils from "./../../Util/Util";
import { instance } from "../../redux/actions/index";
import api from "../../redux/httpUtil/serverApi";
import SelectDrop from "../Store/SelectDrop";
import BatteryWifiTemplate from "./../../component/BatteryWifiTemplate";
import regex from '../../Util/regex';

export class SmartDevice extends PureComponent {
  constructor(props) {
    super(props)
    let columns = [
      { key: 'Name', name: 'Name', width: 250, type: 'string' },
      { key: 'RegisterNo', name: 'Register No', width: 175, type: 'string' },
      { key: 'smartType', name: 'smart Type', width: 175, type: 'string' },
      { key: 'ConnectStatus', name: 'Connect Status', width: 200, type: 'string' },
      { key: 'Location', name: 'Location', width: 200, type: 'string' },
    ]

    let ScaleColumns = [
      { key: 'Name', name: 'Device Name', width: 250, type: 'string' },
      { key: 'configuredDevice', name: 'Configured Device', width: 200, type: 'string' },
      { key: 'scaleIP', name: 'IP', width: 185, type: 'string' },
      { key: 'scalePort', name: 'Port', width: 130, type: 'string' },
      { key: 'connectionType', name: 'Connection Type', width: 200, type: 'string' },
    ]

    let AccessColumns = [
      { key: 'kicDeviceName', name: 'Device Name', width: 200, type: 'string' },
      { key: 'id', name: 'Device ID', width: 200, type: 'string' },
      { key: 'ConnectStatus', name: 'Connect Status', width: 200, type: 'string' },
      { key: 'updatedAt', name: 'Last Updated', width: 200, type: 'date' },
      {
        key: '', name: '', width: 70, type: 'String', formatter: (props, record) => {
          return <BatteryWifiTemplate
            power={record.powerLevel ? record.powerLevel : 66}
            wifi={record.wifiLevel ? record.wifiLevel : 66}
          />
        }
      }
    ];

    let SeraColumns = [
      { key: 'sera4Name', name: 'Device Name', width: 200, type: 'string' },
       { key: 'sera4DeviceID', name: 'Device ID', width: 200, type: 'string' },
      {
        key: 'sera4Open', name: 'Lock State', width: 200, type: 'string', formatter: (props, record) => {
          console.log('8888',record.sera4Open)
          return <span>{record.sera4Open ? "Open" : "Closed"}</span>
        }
      },
      { key: 'sera4LastUpdated', name: 'Last Updated', width: 200, type: 'date' },
      // {
      //   key: '', name: '', width: 70, type: 'String', formatter: (props, record) => {
      //     return <BatteryWifiTemplate
      //       power={record.kicPowerLevel ? record.kicPowerLevel : 66}
      //       wifi={record.kicWifiLevel ? record.kicWifiLevel : 66}
      //     />
      //   }
      // }
    ]

    this.RulesArray = [
      {
        respKey: "scale",
        stateVar: "storeNotificationScale"
      },
      {
        respKey: "alarm",
        stateVar: "alarmRule"
      }
    ]

    let storeNotificationScale = [
      {
        createClip: true,
        bookMark: false,
        emailNotificationUsers: [],
        smsNotificationUsers: [],
        emailNotificationTo: [],
        smsNotificationTo: [],
        fromWeight: '',
        toWeight: "",
        bookMarkTypeId: null
      },
      {
        createClip: true,
        bookMark: false,
        emailNotificationUsers: [],
        smsNotificationUsers: [],
        emailNotificationTo: [],
        smsNotificationTo: [],
        fromWeight: '',
        toWeight: "",
        bookMarkTypeId: null
      },
      {
        createClip: true,
        bookMark: false,
        emailNotificationUsers: [],
        smsNotificationUsers: [],
        emailNotificationTo: [],
        smsNotificationTo: [],
        fromWeight: '',
        toWeight: "",
        bookMarkTypeId: null
      },
      {
        createClip: true,
        bookMark: true,
        emailNotificationUsers: [],
        smsNotificationUsers: [],
        emailNotificationTo: [],
        smsNotificationTo: [],
        fromWeight: '',
        toWeight: "",
        bookMarkTypeId: null
      }
    ];

    let alarmRule = [{
      createClip: true,
      bookMark: true,
      emailNotificationUsers: [],
      smsNotificationUsers: [],
      emailNotificationTo: [],
      smsNotificationTo: [],
      clipPreAlarm: '',
      clipPostAlarm: "",
      bookMarkTypeId: null
    }]

    this.state = {
      columns: columns,
      AccessColumns: AccessColumns,
      SeraColumns: SeraColumns,
      isSera4: false,
      ScaleColumns: ScaleColumns,
      alarmRule: alarmRule,
      smartDevices: [],
      collapse: -1,
      siteSmartDevice: "",
      clientId: "",
      siteId: "",
      smartDevicesAllowed: [],
      tableData: [{ "Name": "ABC", "smartType": "smartType", "RegisterNo": "RegisterNo" }],
      currentPageSize: currentPageSize,
      currentPage: currentPage,
      storeNotificationScale: storeNotificationScale,
      ScaleError: {},
      userEmailsPhones: [],
      bookmarkTypeAllowed: [],
      bookmarkType: [],
      storeNotificationDay: [],
      open: {},
      isLoading: false
    }
    this.container = React.createRef();
    this.toggleAcc = this.toggleAcc.bind(this);
    this.onRowClick = this.onRowClick.bind(this);
    this.beforeRender = this.beforeRender.bind(this);
    this.alreadyclicked = false;
    this.alreadyclickedTimeout = null;
    let currentPageSize = localStorage.getItem("currentPageSize")
    let currentPage = localStorage.getItem("currentPage")

    // this.handleClickOutside = this.handleClickOutside.bind(this);
  };
  handleButtonClick = (index) => {
    let open = { ...this.state };
    open[index] = !this.state.open[index];
    this.setState({ open });
  };
  componentWillMount() {
    localStorage.removeItem("currentPage");
  }

  // componentWillUnmount() {
  //   document.removeEventListener('mousedown', this.handleClickOutside);
  // }

  // handleClickOutside(event) {
  //   console.log('handleClickOutside this.container', this.container)
  //   console.log('handleClickOutside event', event)

  //   if (this.container && this.container.current && !this.container.current.contains(event.target)) {
  //     debugger
      
  //     if(event.target.className.indexOf('ruleColorBox')===-1){
  //       console.log('You clicked outside of me!');
  //     }
  //   }
  // }

  tableDataSites = async (id, data) => {
    let { clientId } = this.state
    let siteId = this.props.match.params.id
    console.log(clientId, siteId)
    console.log(data);
    let reqBody = {
      clientId: clientId,
      storeId: siteId,
    }
    var bodyFormdata = new FormData();
    let DeviceIndex;
    this.setState({ isLoading: true });

    bodyFormdata.append('data', JSON.stringify(reqBody))
    await instance.
      post(`${api.SITE_SMART_DEVICE}`, bodyFormdata)
      .then(res => {
        console.log('9999',res);

        this.setState({ isLoading: false });

        //opening toggle in case of created new or edited
        if (this.props.location && this.props.location.SmartDeviceType) {
          let smartDevices = this.state.smartDevices;
          DeviceIndex = smartDevices.findIndex(ob => this.props.location.SmartDeviceType.toLowerCase() == ob.type.toLowerCase());
        }
        if (res && res.data && res.data.data && res.data.data) {
          let mainData = res.data.data;

          data.forEach((x, index) => {
            let match = mainData.filter(y => y.device && y.device.smartDeviceType == x.type)
            console.log(match);
            if (match.length > 0) {
              console.log(match, "ddd")

              match.forEach(z => {

                let tableObj = { Name: "", smartType: "", RegisterNo: "", ConnectStatus: "", Location: "" }
                tableObj.Name = z.name;
                tableObj.smartType = z.device.smartDeviceType;
                tableObj.RegisterNo = z.POSdeviceRegisterNo;
                tableObj.ConnectStatus = z.isDeviceConnected ? "Connected" : "Disconnected";
                tableObj.Location = z.deviceLocation;
                tableObj.id = z._id;
                tableObj.configuredDevice = z.device.name;
                tableObj.scaleIP = z.scaleIP;
                tableObj.scalePort = z.scalePort;
                tableObj.connectionType = z.connectionType;

                tableObj.kicDeviceName = z.kicDeviceName;
                tableObj.updatedAt = z.updatedAt;
                tableObj.powerLevel = z.kicPowerLevel ? z.kicPowerLevel : "99";
                tableObj.wifiLevel = z.kicWifiLevel ? z.kicWifiLevel : "66";
                tableObj.sera4DeviceID = z.sera4DeviceID;
                tableObj.sera4LastUpdated = z.sera4LastUpdated;
                tableObj.sera4Open = z.sera4Open;
                tableObj.sera4Name = z.sera4Name;
                this.setState({isSera4: z.sera4Name ? true : false});
                console.log(tableObj)
                x.tableData.push(tableObj);
              })
            }
          })

          console.log(data);

        }
      }).catch(err => {
        console.log(err);
      })
    this.setState({
      smartDevices: data,
    }, () => { if (DeviceIndex > -1) this.toggleAccodion(DeviceIndex) })

  }

  checkColon = (e, value) => {

    if(value.length>5)  value=value.slice(0,5);

    let colonIndex = value.indexOf(":");
    if(value.length>2 && (colonIndex===-1 || colonIndex!==2)){
      if(colonIndex!==-1)    value=value.replace(':',"");

      let firstHalf = value.substring(0, 2);
      let ScndHalf = value.substring(2);
      value = firstHalf + ':' + ScndHalf;
    }

    this.alaramRuleChanges(e, value);
  }

  uptoOneDecimal = (value) => {
    let decimalCount = value.split(".")[1].length;
    let totalLen = value.length;
    return decimalCount > 1 ? value.substring(0, totalLen - decimalCount + 1) : value;
  }

  scaleNotificationChange = (e, KeyName, index) => {

    if (KeyName === "fromWeight" && index != 0) {
      return
    }
    let NotificationScale = [...this.state.storeNotificationScale];
    let ScaleError1 = { ...this.state.ScaleError };

    let value;
    if (KeyName == "createClip" || KeyName == "bookMark") value = e.target.checked;
    else value = e.target.value;

    if (KeyName === "fromWeight" || KeyName === "toWeight") {
      if (value) {
        if (value && value.indexOf('.') > -1) value = this.uptoOneDecimal(value);
        value = parseFloat(value) || 0;
        ScaleError1[KeyName + index] = false;
      }
      else ScaleError1[KeyName + index] = true;

    }

    if (NotificationScale.length) {
      NotificationScale.map((rule, uni) => {
        if (index == uni) {
          rule[KeyName] = value;
        }
        if (index + 1 == uni) {
          if (KeyName === "toWeight" && value) {
            let toWeight = value + 0.1;
            rule.fromWeight = toWeight && toWeight.toString().indexOf('.') > -1 ? this.uptoOneDecimal(toWeight.toString()) : toWeight;
          } else if (KeyName === "toWeight" && !value) rule.fromWeight = '';
        }
      });
    }

    this.setState({ storeNotificationScale: NotificationScale, ScaleError: ScaleError1 });
  }
  ruleBookMarkDescription = (e, index) => {
    const { storeNotificationScale } = this.state;
    let notificationScale = [...storeNotificationScale];
    if (notificationScale.length) {
      notificationScale[index].bookmarkDescription = e.target.value;
    }

    this.setState({ storeNotificationScale: notificationScale });
  }

  bookmarkColorType = (record, index, stateVar) => {
    let rules = [...this.state[stateVar]];
    if (rules.length) {
      rules[index].bookMarkTypeId = record.LookupId;
    }
    this.setState({ [stateVar]: rules });
  }

  selectScaleEmail = (value, weekday, index, error, stateVar) => {
    let NotificationScale = [...this.state[stateVar]];

    let NewArray = utils.manageEmailPhoneData(value, index, error, NotificationScale, 'email', this.state.userEmailsPhones )
    this.setState({ [stateVar]: NewArray });
  }

  selectScalePhone = (value, weekday, index, error, stateVar) => {
    let NotificationScale = [...this.state[stateVar]];
    
    let NewArray = utils.manageEmailPhoneData(value, index, error, NotificationScale, 'phone', this.state.userEmailsPhones )
    this.setState({ [stateVar]: NewArray });
  }

  saveRules = (e, type) => {
    e.preventDefault();

    const { storeNotificationId, storeNotificationScale, storeNotificationDay, ScaleError, alarmRule } = this.state;

    let storeId = this.props.match.params.id;
    let RulesList = type === "scale" ? [...storeNotificationScale] : [...alarmRule];
    let Error;

    if (RulesList.length) {
      RulesList.map((rule, index) => {
        if ((rule.fromWeight && rule.toWeight && +rule.fromWeight >= +rule.toWeight) && type === "scale") {
          Error = true;
          let message = "'To Weight' must be greater than 'From Weight' for all rules";
          this.OpenSwal("Error", message, "error");
          return
        }

        if (type !== "scale") {
          let name;
          let valid="";
          
          if(!rule.clipPostAlarm.length || !regex.Time24HrValidation.test(rule.clipPostAlarm)) {
            if(rule.clipPostAlarm.length)  valid="valid ";
            Error = true;
            name = "Post Rec Time";
          }
          
          if(!regex.Time24HrValidation.test(rule.clipPreAlarm)) {
            if(rule.clipPreAlarm.length)  valid="valid ";
            Error = true;
            name = "Pre Rec Time";
          }

          let message = 'Please enter ' + valid + name + '.';
          if(name)  this.OpenSwal("Error", message, "error");
          return
        }

        if (rule.EmailError || rule.PhoneError) {
          Error = true;
          let message = rule.EmailError ? utils.NotiyEmailError : utils.NotiyPhoneError;
          this.OpenSwal("Error", message, "error");
          return
        }

        ScaleError['bookmarkType' + index] = '';
        if (!rule.bookMarkTypeId) {
          Error = true;
          let message = 'Please select Rule Color';;
          if (type === "scale") message = message + ' for all rules'

          this.OpenSwal("Error", message, "error");
          return
        }
      });
    }

    if (!Error) {
      let data = {
        "storeId": storeId,
        "storeNotificationSettings": [
          true
        ],
        "day": storeNotificationDay,
        "scale": storeNotificationScale,
        "alarm": alarmRule
      }

      let apiUrl = type === "scale" ? api.UPDATE_SITE_SCALE_RULE : api.UPDATE_SITE_ALARM_RULE;

      var bodyFormdata = new FormData();
      bodyFormdata.append('data', JSON.stringify(data));

      instance.post(`${apiUrl}/${storeNotificationId}`, bodyFormdata)
        .then((res) => {
          if (res.data.message == "Record updated successfully.") {
            this.OpenSwal("Updated", "Updated sucessfully", "success");
          } else if (res.data.error) {
            this.OpenSwal("Error", res.data.errmsg, "error");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  OpenSwal(title, text, icon) {
    swal({
      title: title,
      text: text,
      icon: icon,
      dangerMode: true,
      showConfirmButton: true,
      showCancelButton: false
    });

  }
  componentDidMount() {

//     document.addEventListener('mousedown', this.handleClickOutside);

    let { props } = this,
      { params } = props.match;

    //api for get pos list
    if (params.id !== "0") {
      this.setState({ isLoading: true });
      instance
        .post(`${api.STORE_DATA}/${params.id}`, {
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
                  path: "scale.emailNotificationUsers",
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
                  path: "alarm.emailNotificationUsers",
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
                {
                  path: "alarm.smsNotificationUsers",
                  select: {
                    _id: 1,
                    mobile: 1,
                    firstName: 1,
                  },
                  options: {
                    retainNullValues: true,
                  },
                },
                {
                  path: "scale.smsNotificationUsers",
                  select: {
                    _id: 1,
                    mobile: 1,
                    firstName: 1,
                  },
                  options: {
                    retainNullValues: true,
                  },
                }
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
          this.setState({ isLoading: false });
          this.props.dispatch(
            cameraData.request({
              action: "load",
              filters: [{ value: params.id, property: "storeId", type: "string" }],
            })
          );

          if (res && res.data && Object.keys(res.data).length > 0) {
            if (res.data && res.data.clientId && res.data.clientId.smartDevicesAllowed) {
              let { smartDevicesAllowed, bookmarkTypeAllowed } = res.data.clientId
              console.log(smartDevicesAllowed);
              let allAccorSites = []

              smartDevicesAllowed.forEach(x => {
                if (x.smartDeviceType != "Camera") {
                  if (!allAccorSites.find(y => y.type == x.smartDeviceType))
                    allAccorSites.push({ type: x.smartDeviceType, tableData: [], id: x._id })
                }
              });
              this.setState({
                smartDevicesAllowed: smartDevicesAllowed,
                smartDevices: allAccorSites,
                bookmarkTypeAllowed: bookmarkTypeAllowed,
                clientId: res.data.clientId && res.data.clientId._id
              }, () => {
                console.log(this.state.clientId)
                this.getUserList(this.state.clientId);
                this.tableDataSites(params.id, this.state.smartDevices)
              });

            }

            // this.RulesArray = [
            //   {
            //     respKey: "scale",
            //     stateVar: "storeNotificationScale"
            //   },
            //   {
            //     respKey: "alarm",
            //     stateVar: "alarmRule"
            //   }
            // ]
            // alarmRule: res.data.storeNotificationId.alarm.length ? res.data.storeNotificationId.alarm : this.state.alarmRule,
            //   storeNotificationScale: res.data.storeNotificationId.scale.length ? res.data.storeNotificationId.scale : this.state.storeNotificationScale,

            // prepareEmailPhoneUsersToBind for Scale and alarm rules starts
            this.RulesArray.forEach(item => {
              let kicEvent = utils.prepareEmailPhoneUsersToBind(res.data.storeNotificationId[item.respKey]);
              kicEvent.then((response) => {
                this.setState({ [item.stateVar]: response && response.length ? response : this.state[item.stateVar] })
              });
            });

            //prepareEmailPhoneUsersToBind for Scale and alarm rules ends


            //   if (res.data.storeNotificationId[item].length) {
            //     res.data.storeNotificationId[item].map(rule => {

            //       let emails = [];
            //       let phone = [];
            //       let emailIds = [];
            //       let phoneIds = [];

            //       let EmailUsers = [...rule.emailNotificationUsers];
            //       let SMSUsers = [...rule.smsNotificationUsers];

            //       if (EmailUsers.length) {
            //         rule.emailNotificationUsers.map(item => {

            //           if (item && item._id) {
            //             emails.push(item._id)
            //           }
            //           if (item && item._id) {
            //             emailIds.push(item._id)
            //           }
            //         });
            //       }
            //       if (rule.emailNotificationTo.length) {
            //         rule.emailNotificationTo.map(item => emails.push(item));
            //       }
            //       if (SMSUsers.length) {
            //         rule.smsNotificationUsers.map(item => {
            //           if (item && item.mobile) phone.push(item._id);
            //           if (item && item._id) phoneIds.push(item._id);
            //         });
            //       }
            //       if (rule.smsNotificationTo.length) {
            //         rule.smsNotificationTo.map(item => phone.push(item));
            //       }

            //       rule.emails = emails;
            //       rule.phone = phone;
            //       rule.emailNotificationUsers = emailIds;
            //       rule.smsNotificationUsers = phoneIds;
            //     });
            //   }
            // })
            // for Scale and alarm rules ends 

            this.setState({
              tags: res.data.tags,
              sitesStatus: res.data.status == "Active" ? true : false,
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
              recMediaServerInboundPort:
                res.data.recordedMediaServerInboundPort,
              recMediaServerOutboundPort: res.data.mediaServerOutboundPort,
              recMediaServerUrl: res.data.recordedMediaServerUrl,
              isLiveAntMedia: res.data.isLiveAntMedia
                ? "antMedia"
                : "nodeMedia",
              isRecordedAntMedia: res.data.isRecordedAntMedia
                ? "recAntMedia"
                : "recNodeMedia",
              isRecordedMediaSameAsLive: res.data.isRecordedMediaSameAsLive,
              macAddress: res.data.macAddress,
              radioRecoEngine: res.data.type,
              engAddress: res.data.nvrAddress,
              enginePort: res.data.nvrPort,
              engineLivePort: res.data.nvrLivePort,
              enginePlaybackPort: res.data.nvrPlaybackPort,
              engUserName: res.data.nvrUsername,
              engPassword: res.data.nvrPassword,
              engRecoLocation: res.data.nvrLocation,
              notifyStatus: res.data.storeNotificationEnabled,
              sitesNotes: res.data.storeNotes,
              imageName: res.data.map,
              storeNotificationId: res.data.storeNotificationId._id,
              storeNotificationDay: res.data.storeNotificationId.day,
              // alarmRule: res.data.storeNotificationId.alarm.length ? res.data.storeNotificationId.alarm : this.state.alarmRule,
              // storeNotificationScale: res.data.storeNotificationId.scale.length ? res.data.storeNotificationId.scale : this.state.storeNotificationScale,
            });
          }
          if (
            res &&
            res.data &&
            res.data.storeNotificationId &&
            res.data.storeNotificationId.day.length > 0
          ) {
            let days = res.data.storeNotificationId.day;
            let timeLine = [];
            days.map((x) => {
              this.state.weekDaysAccordian.map((y) => {
                if (x.doW == y.day) {
                  y.checked = true;
                  y.entireDay = x.entireDay;
                  console.log(x.timeSlot.length);
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
                      console.log(timeSlot[i]);

                      if (timeSlot[i].emailNotificationTo.length > 0)
                        emptyData.emails = timeSlot[i].emailNotificationTo;
                      if (
                        Object.keys(timeSlot[i].emailNotificationUsers).length >
                        0
                      ) {
                        timeSlot[i].emailNotificationUsers.forEach((email) => {
                          console.log(email);
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

                  console.log(y);
                  if (y.timeLine.length < 3) y.timeLine.push(emptyData);
                  return y;
                } else {
                  return y;
                }
              });
            });
            console.log(this.state.guardTimeLine, timeLine);
          }
        })
        .catch((err) => {
          console.log("err");
        });

    } else {
      console.log("Hii");
      this.props.dispatch(storeData.request({ action: "load", id: params.id }));
    }
    this.props.dispatch(getCombos.request({ combos: "bookmarkType" }));
  }

  alaramRuleChanges = (event, value) => {
    let alarmRuleCopy = [...this.state.alarmRule];
    alarmRuleCopy[0][event.target.name] = event.target.name == "bookMark" ? event.target.checked : value? value :event.target.value;
    this.setState({ alarmRule: alarmRuleCopy });
  }

  async toggleAcc(e) {
    let data = this.state.sitesAccordians;
    data = await data.map((x) => {
      if (e == x.id) {
        x.status = !x.status;
        return x;
      } else {
        return x;
      }
    });
    this.setState({ sitesAccordians: data });
  }
  toggleAccWeek = async (e) => {
    let data = this.state.weekDaysAccordian;
    data = await data.map((x) => {
      if (e == x.id) {
        x.status = !x.status;
        return x;
      } else {
        return x;
      }
    });
    this.setState({ weekDaysAccordian: data });
  };

  getUserList = (clientId) => {
    instance
      .get(`${api.GET_CLIENT_USER}/${clientId}`)
      .then((res) => {
        console.log(res);
        this.setState(
          {
            userEmailsPhones: res.data.data,
            // notifyEmailList: res.data.emailUsers,
            // notifyPhoneList: res.data.phoneUsers,
          },
          () => {
            console.log(this.state.notifyPhoneList);
          }
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
    console.log(this.props, this.state.clientList);
    if (nextProps.match && nextProps.match.params && nextProps.match.params.id) {
      console.log(this.state.siteSmartDevice);
      if (!this.state.siteSmartDevice) {
        this.setState({
          siteSmartDevice: nextProps.match.params.id
        })
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
        let { bookmarkType } = data;
        this.setState({ bookmarkType: bookmarkType });
      }
    }
  }


  onRowClick = (index, record) => {
    const { BookmarkTypes } = this.state;
    let data = { smart: this.state.smartDevicesAllowed, type: record.smartType, clientId: this.state.clientId, siteId: this.state.siteId, BookmarkTypes: BookmarkTypes }
    this.props.history.push({ pathname: '/admin/sites/siteSmartDeviceForm/' + record.id, state: data });
  }

  addNew = (data) => {
    console.log('ad00',data);
    let addData = { data: data, clientId: this.state.clientId, smartDevicesAllowed: this.state.smartDevicesAllowed, siteId: this.state.siteId }
    this.props.history.push({ pathname: '/admin/sites/siteSmartDeviceForm', state: addData });
  }

  getStoreName(storeData) {
    var loggedUser = util.getLoggedUser();
    var storeids = loggedUser.storeId;
    let name = '', filteredData;
    if (loggedUser.roleId._id !== util.adminRoleId) {
      storeids.forEach(rec => {
        filteredData = storeData.filter(function (obj) {
          return obj.id === rec.id;
        });
        filteredData.forEach(element => {
          name += ", " + element.name;
          if (name[0] == ",") {
            name = name.substring(1);
          }
        })
      })
    } else {
      storeData.forEach(element => {
        name += ", " + element.name;
      });
      if (name[0] == ",") {
        name = name.substring(1);
      }
    }
    return name;
  }

  getRoleName(roleData) {
    return roleData.name || roleData;
  }

  beforeRender(data) {
    let customData = [];
    if (data && data.length > 0) {
      data.forEach(item => {
        let storeData = item.storeId;
        let roleData = item.roleId;
        item.storeId = storeData instanceof Array ? this.getStoreName(storeData) : storeData;
        item.roleId = roleData ? this.getRoleName(roleData) : roleData;
        customData.push(item);
      });
    }
    return customData;
  }

  onStoreClick() {
    let { params } = this.props.match;
    this.props.history.push('/admin/sites/addstore/' + params.id);
  }

  onCameraClick() {
    let { params } = this.props.match;
    localStorage.setItem("OpenSiteCamera", true);
    this.props.history.push('/admin/sites/addstore/' + params.id);
  }
  onSmartDeviceClick() {
    let { params } = this.props.match;
    this.props.history.push('/admin/sites/smartDevice/' + params.id);
  }

  toggleAccodion = (index) => {
    this.setState({ collapse: this.state.collapse === Number(index) ? -1 : Number(index) });
  }

  render() {
    const { columns, collapse, currentPageSize, changePage, currentPage, ScaleColumns, AccessColumns,SeraColumns, storeNotificationScale, ScaleError, userEmailsPhones, clientId, isLoading, bookmarkTypeAllowed, bookmarkType, alarmRule, BookmarkTypes } = this.state;
    // notifyEmailList, notifyPhoneList,
    // let { listAction, actionName, sortColumn, sortDirection } = this.props;
    const { isUpdate } = this;
    // let { bookmarkType } = combos || {};
    let BookmarkType1 = [];
    if (bookmarkType.length && bookmarkTypeAllowed.length) {
      BookmarkType1 = bookmarkType.filter(book1 => bookmarkTypeAllowed.indexOf(book1.LookupId) > -1);
      if (!BookmarkTypes) this.setState({ BookmarkTypes: BookmarkType1 })
    }

    return (

      <div className="animated fadeIn grid-wrapper-area mb-4">
        <LoadingDialog isOpen={isLoading} />
        <div className="child-record">
          <CardWrapper
            lg={12}
            subTitle={
              <div className="site-tab-holder" style={{ marginLeft: "-16px" }}>
                <div
                  className="site-tab card-title"
                  onClick={() => this.onStoreClick()}
                  style={{ cursor: "pointer" }}
                >
                  Site Details
                  </div>
                <div className="site-tab card-title" onClick={() => this.onCameraClick()} style={{ cursor: "pointer" }}>
                  Cameras
                  </div>
                <div className="site-tab site-tab-active card-title" onClick={() => this.onSmartDeviceClick} style={{ cursor: "pointer" }}>
                  Smart Device
                  </div>
              </div>
            }
          >

            <Col xs={12} sm={12} md={4} lg={5} >
              <div className="cameracardText textConvert  mb-2">
                <i className="fa icon2-events" aria-hidden="true" /> SMART DEVICES
                    </div>
            </Col>
            {this.state.smartDevices.length > 0 ? (
              <div>
                {this.state.smartDevices ? this.state.smartDevices.map((item, index) => {

                  let smartType = item && item.type ? item.type.toLocaleLowerCase() : null;

                  return (
                    <div>
                      <Card style={{ marginBottom: '1rem' }} key={index} className="SmartDeviceCard">
                        <CardHeader
                          className="p-2"
                          onClick={() => this.toggleAccodion(index)}
                          data-event={index}>{item.type}
                          {collapse === index ? <i className="fa fa-angle-up floatRight" /> : <i className="fa fa-angle-down floatRight" />}
                        </CardHeader>
                        <Collapse isOpen={collapse === index}>
                          <CardBody>
                            {collapse === index && smartType != "alarm" ?
                              <div className="">
                                <Row>
                                  <Col>
                                    <Grid
                                      dataProperty="smartAcco"
                                      columns={smartType === "scale" ? ScaleColumns : smartType === "access control" ? (this.state.isSera4? SeraColumns :  AccessColumns)  : columns}
                                      autoHeight={true}
                                      smartData={item.tableData.length > 0 ? item.tableData : []}
                                      localPaging={this.props.localPaging || false}
                                      onRowClick={this.onRowClick}
                                      exportButton={false}
                                      searchVal={''}
                                      hidePagination={true}
                                      hidePref={true}
                                      hideColumnButton={true}
                                      hideSearch={true}
                                      add={() => this.addNew(item)}
                                      screenPathLocation={this.props.location}
                                      pageSizeProps={changePage ? currentPageSize : false}
                                      // height={450}
                                      MoveAddInAccodian={" PlusSmartDevice"}
                                      zeroHeight={" zeroHeight"}
                                    />
                                  </Col>
                                </Row>
                              </div> : null}
                            <br />

                            {/* scale rules starts */}

                            {smartType === "scale" ?
                              <form onSubmit={e => this.saveRules(e, 'scale')}>


                                <div><h6 className="mb-3 ml-3">Scale Notifications Rule</h6>
                                  {storeNotificationScale.map((rule, index) => {
                                    console.log('B, BookmarkType1ookmarkType1', BookmarkType1)

                                    const bookmarkTypeItem = (BookmarkType1 && BookmarkType1.filter(e => e.LookupId == rule.bookMarkTypeId)[0]) || {
                                      DisplayValue: 'Select Rule Color', Color: '#ffffff'
                                    }
                                    // bookmarkColor: "#93e35d"
                                    // _id: "603fa37d26c20a239c76d1b6"

                                    var styleBookmark = {
                                      backgroundColor: bookmarkTypeItem.Color
                                    }
                                    return (
                                      <div>
                                        <FormGroup row className="mt-2 customAntChanges">

                                          <div class="col-sm-.5 OptionalRuleText ml-3 mr-3">Rule {index + 1}</div>

                                          <div ref={this.container}>
                                            <div className={`col-sm-.5 ruleColorBox ml-2`} style={styleBookmark} id={`${index + 1}`}
                                              onClick={() => this.handleButtonClick(index + 1)}>
                                              {this.state.open[index + 1] && <div className="dropdown-bookmark" key={`dropdown${index + 1}`}>
                                                <ul>
                                                  {BookmarkType1.map((bookmarkColor) => {
                                                    var divStyle = {
                                                      backgroundColor: bookmarkColor.Color,
                                                      marginLeft: "auto"
                                                    }
                                                    return <li style={{ display: "flex" }} onClick={() => this.bookmarkColorType(bookmarkColor, index, 'storeNotificationScale')}>
                                                      <span>{bookmarkColor.DisplayValue}</span>
                                                      <span style={divStyle}>  <span style={{ visibility: 'hidden' }}>{`  ${bookmarkColor.Color}`}</span></span>
                                                    </li>
                                                  })}
                                                </ul>
                                              </div>}
                                            </div>
                                            {ScaleError && ScaleError['bookmarkType' + index] && <div className="input-feedback">Required</div>}
                                          </div>

                                          <div className="col-sm-1 text-field">
                                            <Input
                                              id={`FromRule${index + 1}`}
                                              type="number"
                                              name={`FromRule${index + 1}`}
                                              value={rule.fromWeight}
                                              onChange={e => { this.scaleNotificationChange(e, "fromWeight", index) }}
                                              className="form-control text-form"
                                              min={0}
                                              step={0.1}
                                              required
                                            />
                                            <label className="text-label">  From (Lbs)  <span className={"text-danger"} > * </span></label>
                                            {ScaleError && ScaleError['fromWeight' + index] && <div className="input-feedback">Required</div>}
                                          </div>

                                          <div className="col-sm-1 text-field">
                                            {index != 3 ? <> <Input
                                              id={`ToRule${index + 1}`}
                                              type="number"
                                              name={`ToRule${index + 1}`}
                                              value={rule.toWeight}
                                              onChange={e => { this.scaleNotificationChange(e, "toWeight", index) }}
                                              className="form-control text-form"
                                              min={0}
                                              step={0.1}
                                              required
                                            />
                                              <label className="text-label">  To (Lbs)  <span className={"text-danger"}  > * </span> </label>

                                              {ScaleError && ScaleError['toWeight' + index] && <div className="input-feedback">Required</div>}
                                            </> : null}
                                          </div>

                                          <div col className="scaleRulesInputBox">
                                            <div check className="col-sm-1.5 text-field mt-0 mb-0">
                                              <Input
                                                checked={rule.bookMark}
                                                onChange={e => { this.scaleNotificationChange(e, "bookMark", index) }}
                                                name={`bookMark${index + 1}`}
                                                className="cursor sms-Checkbox playback_checkbox blckBackgroundClr"
                                                type="checkbox"
                                              />
                                              <span className="blckClr ml-4 BookmarkCheckbox">Bookmark</span>
                                            </div>

                                            <div check className="col-sm-1.5 text-field mt-0 mb-0">
                                              <Input
                                                checked={rule.createClip}
                                                onChange={e => { this.scaleNotificationChange(e, "createClip", index) }}
                                                name={`createClip${index + 1}`}
                                                className="cursor sms-Checkbox playback_checkbox blckBackgroundClr mt-0"
                                                type="checkbox"
                                              />
                                              <span className="blckClr ml-4 mt-0 ClipCheckbox">Create Clip</span>

                                            </div>
                                          </div>

                                          <div className="col-sm-3 text-field">

                                            <SelectDrop
                                              index={index}
                                              defaultEmail={rule.emails}
                                              selectEmail={this.selectScaleEmail}
                                              check="email"
                                              clientId={clientId}
                                              userEmailsPhones={userEmailsPhones}
                                              stateVar={"storeNotificationScale"}
                                            // emailList={notifyEmailList}
                                            />
                                            <label className="fixed-label ml-3">
                                              Email Notifications Users
                                            </label>

                                            {rule.EmailError && <div className="input-feedback"> {utils.NotiyEmailError}  </div>}

                                          </div>

                                          <div className="col-sm-3 text-field">

                                            <SelectDrop
                                              index={index}
                                              defaultEmail={rule.phone}
                                              selectPhone={this.selectScalePhone}
                                              check="phone"
                                              clientId={clientId}
                                              userEmailsPhones={userEmailsPhones}
                                              stateVar={'storeNotificationScale'}
                                            // phoneList={notifyPhoneList}
                                            />
                                            <label className="fixed-label ml-3">
                                              Phone SMS Notifications Users
                                            </label>

                                            {rule.PhoneError && <div className="input-feedback"> {utils.NotiyPhoneError} </div>}
                                          </div>


                                        </FormGroup>
                                      </div>
                                    );
                                  })}

                                  <div className="row">
                                    <div class="col-sm-10 OptionalRuleText"> Anything greater than Rule 4 will be considered as exception. </div>
                                  </div>
                                  <button type="submit" className="btn formButton floatRight mb-4 mr-2" ><i className="fa fa-save" aria-hidden="true"></i> Save</button>
                                </div>
                              </form> : null}

                            {/* scale rules end */}

                            {/* alarm rule start */}

                            {smartType === "alarm" ?
                              <form onSubmit={e => this.saveRules(e, 'alarm')}>
                                <div><h6 className="mb-3 ml-3">Alarm Rule</h6>
                                  {alarmRule.map((rule, index) => {
                                    const bookmarkTypeItem = (BookmarkType1 && BookmarkType1.filter(e => e.LookupId == rule.bookMarkTypeId)[0]) || {
                                      DisplayValue: 'Select Rule Color', Color: '#ffffff'
                                    }
                                    var styleBookmark = {
                                      backgroundColor: bookmarkTypeItem.Color
                                    }
                                    return (
                                      <div>
                                        <FormGroup row className="mt-2 customAntChanges">
                                          <div ref={this.container}>
                                            <div className={`col-sm-.5 ruleColorBox ml-2`} style={styleBookmark} id={`${index + 1}`}
                                              onClick={() => this.handleButtonClick(index + 1)}>
                                              {this.state.open[index + 1] && <div className="dropdown-bookmark" key={`dropdown${index + 1}`}>
                                                <ul>
                                                  {BookmarkType1.map((bookmarkColor) => {
                                                    var divStyle = {
                                                      backgroundColor: bookmarkColor.Color,
                                                      marginLeft: "auto"
                                                    }
                                                    return <li style={{ display: "flex" }} onClick={() => this.bookmarkColorType(bookmarkColor, index, "alarmRule")}>
                                                      <span>{bookmarkColor.DisplayValue}</span>
                                                      <span style={divStyle}>  <span style={{ visibility: 'hidden' }}>{`  ${bookmarkColor.Color}`}</span></span>
                                                    </li>
                                                  })}
                                                </ul>
                                              </div>}
                                            </div>
                                            {ScaleError && ScaleError['bookmarkType' + index] && <div className="input-feedback">Required</div>}
                                          </div>

                                          <div className="col-sm-2 text-field AlarmTimepicker">
                                            <Input
                                              id={`clipPreAlarm`}
                                              type="text"
                                              name={`clipPreAlarm`}
                                              value={rule.clipPreAlarm}
                                              onChange={e => this.checkColon(e, e.target.value)}
                                              // onChange={this.alaramRuleChanges}
                                              className="form-control text-form"
                                              max={5}
                                            />
                                          
                                            <label className="text-label">  Pre Rec Time </label>
                                          </div>

                                          <div className="col-sm-2 text-field">
                                            {index != 3 ? <> <Input
                                              id={`clipPostAlarm`}
                                              type="text"
                                              name={`clipPostAlarm`}
                                              value={rule.clipPostAlarm}
                                              onChange={e => this.checkColon(e, e.target.value)}
                                              // onChange={this.alaramRuleChanges}
                                              className="form-control text-form"
                                            />
                                              <label className="text-label"> Post Rec Time </label>

                                            </> : null}
                                          </div>

                                          <div col className="scaleRulesInputBox">
                                            <div check className="col-sm-1.5 text-field mt-0 mb-0">
                                              <Input
                                                checked={rule.bookMark}
                                                onChange={this.alaramRuleChanges}
                                                name={`bookMark`}
                                                className="cursor sms-Checkbox playback_checkbox blckBackgroundClr"
                                                type="checkbox"
                                              />
                                              <span className="blckClr ml-4 BookmarkCheckbox">Bookmark</span>
                                            </div>

                                            <div check className="col-sm-1.5 text-field mt-0 mb-0">
                                              <Input
                                                checked={rule.createClip}
                                                onChange={this.alaramRuleChanges}
                                                disabled={true}
                                                name={`createClip`}
                                                className="cursor sms-Checkbox playback_checkbox blckBackgroundClr mt-0"
                                                type="checkbox"
                                              />
                                              <span className="blckClr ml-4 mt-0 ClipCheckbox">Create Clip</span>

                                            </div>
                                          </div>

                                          <div className="col-sm-3 text-field">

                                            <SelectDrop
                                              index={index}
                                              defaultEmail={rule.emails}
                                              selectEmail={this.selectScaleEmail}
                                              check="email"
                                              clientId={clientId}
                                              userEmailsPhones={userEmailsPhones}
                                              stateVar={'alarmRule'}
                                            />
                                            <label className="fixed-label ml-3">
                                              Email Notifications Users
                                            </label>

                                            {rule.EmailError && <div className="input-feedback"> {utils.NotiyEmailError}  </div>}

                                          </div>

                                          <div className="col-sm-3 text-field">

                                            <SelectDrop
                                              index={index}
                                              defaultEmail={rule.phone}
                                              selectPhone={this.selectScalePhone}
                                              check="phone"
                                              clientId={clientId}
                                              userEmailsPhones={userEmailsPhones}
                                              stateVar={'alarmRule'}
                                            // phoneList={notifyPhoneList}
                                            />
                                            <label className="fixed-label ml-3">
                                              Phone SMS Notifications Users
                                            </label>

                                            {rule.PhoneError && <div className="input-feedback"> {utils.NotiyPhoneError} </div>}
                                          </div>
                                        </FormGroup>
                                      </div>
                                    );
                                  })}


                                  <button type="submit" className="btn formButton floatRight mb-4 mr-2" ><i className="fa fa-save" aria-hidden="true"></i> Save</button>
                                </div>
                              </form> : null}

                            {/* alarm rule ends */}


                          </CardBody>
                        </Collapse>
                      </Card>
                    </div>
                  )
                }) : ""}
              </div>
            ) : <div style={{ textAlign: "center", backgroundColor: "white", padding: "50px" }}>No device Added </div>}
          </CardWrapper>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  console.log(state);
  return {
    userData: state.userData,
    storeChange: state.storeChange,
    getCombos: state.getCombos
  };
}

var SmartDeviceModule = connect(mapStateToProps)(SmartDevice);
export default SmartDeviceModule;
