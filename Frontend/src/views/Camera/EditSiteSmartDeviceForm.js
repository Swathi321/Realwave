import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Row, Col, Input } from 'reactstrap';
import utils from './../../Util/Util';
import { connect } from 'react-redux';
import CardWrapper from './../../component/CardWrapper';
import { storesData } from './../../redux/actions/httpRequest';
import swal from 'sweetalert';
import Select from 'react-select';
import LoadingDialog from "./../../component/LoadingDialog";
import { instance } from '../../redux/actions/index';
import api from '../../redux/httpUtil/serverApi';
import SelectDrop from "../Store/SelectDrop";
import Grid from '../Grid/GridBase';
import BatteryWifiTemplate from "./../../component/BatteryWifiTemplate";

class EditSiteSmartDeviceForm extends Component {
  constructor(props) {
    super(props);

    let columns = [
      { key: 'kicDeviceName', name: 'Device Name', width: 200, type: 'string' },
      { key: 'kicDeviceID', name: 'Device ID', width: 200, type: 'string' },
      {
        key: 'isDeviceConnected', name: 'Connect Status', width: 200, type: 'string', formatter: (props, record) => {
          return <span>{record.isDeviceConnected ? "Connected" : "Disconnected"}</span>
        }
      },
      { key: 'updatedAt', name: 'Last Updated', width: 200, type: 'date' },
      {
        key: '', name: '', width: 70, type: 'String', formatter: (props, record) => {
          return <BatteryWifiTemplate
            power={record.kicPowerLevel ? record.kicPowerLevel : 66}
            wifi={record.kicWifiLevel ? record.kicWifiLevel : 66}
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

    let KIC_Rules = [
      {
        createClip: true,
        bookMark: true,
        eventType: 'unlocked_event',
        emailNotificationUsers: [],
        smsNotificationUsers: [],
        emailNotificationTo: [],
        smsNotificationTo: [],
        bookMarkTypeId: ''
      },
      {
        createClip: true,
        bookMark: true,
        eventType: 'access_denied_event',
        emailNotificationUsers: [],
        smsNotificationUsers: [],
        emailNotificationTo: [],
        smsNotificationTo: [],
        bookMarkTypeId: ''
      }
    ]

    let SERA_RULES = [
      {
        createClip: true,
        bookMark: true,
        eventType: 'unlocked_event',
        emailNotificationUsers: [],
        smsNotificationUsers: [],
        emailNotificationTo: [],
        smsNotificationTo: [],
        bookMarkTypeId: null
      },
      {
        createClip: true,
        bookMark: true,
        eventType: 'access_denied_event',
        emailNotificationUsers: [],
        smsNotificationUsers: [],
        emailNotificationTo: [],
        smsNotificationTo: [],
        bookMarkTypeId: null
      }
    ]

    this.state = {
      columns: columns,
      sera4Column: SeraColumns,
      isSera4: false,
      deviceName: "",
      configDevice: "",
      regNumber: "",
      location: "",
      name: "",
      showtable: false,
      selectedOption: "",
      deviceTypes: [],
      device: "",
      siteId: "",
      KIC_Error: {},
      SERA_ERROR: {},
      POSdeviceRegisterNo: "",
      rowId: "",
      SmartDeviceType: '',
      clientId: '',
      password: '',
      username: '',
      selectedConnection: { name: "Telnet", label: "Telnet" },
      port: '',
      scaleIP: '',
      isLoading: false,
      useSiteNotifiSetting: true,
      tableData: [],
      userEmailsPhones: [],
      weekDaysAccordian: [],
      KIC_Rules: KIC_Rules,
      SERA_RULES: SERA_RULES,
      SeraData: null,
      BookmarkTypes: [],
      open: {},
    }

    this.onSave = this.onSave.bind(this);
  }

  async componentDidMount() {

    if (this.props.location && this.props.location.state) {
      let { type, clientId, smart, siteId, BookmarkTypes } = this.props.location.state
      let { params } = this.props.match
      let type1 = type
      let options = []

      this.getUserList(clientId);
      this.setState({ isLoading: true })


      instance.post(`${api.GET_SITE_SMART}/${params.id}`)
        .then(res => {
          let Data = res.data.data;
          console.log("^^^",Data)
          let tableData = [];
          tableData.push(Data);

          if( Data.kicLocationID){
            console.log('000KICEVENTS')
            let kicEvent = utils.prepareEmailPhoneUsersToBind(Data.kicEvent);
          
            kicEvent.then((response)=> {
              console.log('po999',response);
              this.setState({  KIC_Rules: response && response.length ? response : this.state.KIC_Rules })
            });
          }
          if( Data.sera4DeviceID){
            console.log('000SeraEVENTS')
            let seraEvent = utils.prepareEmailPhoneUsersToBind(Data.seraEvent);
          
            seraEvent.then((response)=> {
              console.log('po999',response);
              this.setState({  SERA_RULES: response && response.length ? response : this.state.SERA_RULES })
            });
          }
        

          let KicData = {
            kicDeviceName: Data.kicDeviceName,
            kicDeviceType: Data.kicDeviceType,
            kicLocationID: Data.kicLocationID,
            kicSerialNumber: Data.kicSerialNumber,
            kicStatus: Data.kicStatus,
            kicVendorName: Data.kicVendorName,
            siteSmartDeviceStatus: Data.siteSmartDeviceStatus,
            isDeviceConnected: Data.isDeviceConnected,
            _id: Data._id
          }

          let SeraData = {
            sera4DeviceID: Data.sera4DeviceID,
            sera4LastUpdated: Data.sera4LastUpdated,
            sera4LocationID: Data.sera4LocationID,
            sera4Name: Data.sera4Name,
            sera4Open: Data.sera4Open,
            _id: Data._id
          }
          this.setState({
            showtable: true,
            tableData: tableData,
            isSera4: Data.sera4Name ? true : false,
            // useSiteNotifiSetting: Data.deviceNotificationSettings[0],
            // weekDaysAccordian: Data.day,
            // KIC_Rules: Data.kicEvent.length ? Data.kicEvent : this.state.KIC_Rules,
            KicData: KicData,
            SeraData: SeraData,
            storeId: Data.storeId
          });


          let smartDeviceType = Data.device.smartDeviceType ? Data.device.smartDeviceType : 'Access Control';

          this.setState({
            name: Data.name,
            isLoading: false,
            selectedOption: { label: Data.device.name, value: Data.device._id },
            POSdeviceRegisterNo: Data.POSdeviceRegisterNo,
            location: Data.deviceLocation,
            device: Data.device._id,
            SmartDeviceType: smartDeviceType,
            clientId: Data.clientId ? Data.clientId._id : null,
            scaleIP: Data.scaleIP,
            port: Data.scalePort,
            username: Data.scaleUserName,
            password: Data.scalePassword,
            selectedConnection: { name: Data.connectionType, label: Data.connectionType },
          });

        }).catch(error => {
          console.log(error);
          this.setState({ isLoading: false })
        })

      if (smart.length > 0) {
        smart.forEach(x => {
          if (x.smartDeviceType == type1) {
            options.push({ value: x._id, label: x.name })
          }
        });
        this.setState({ deviceTypes: options })
      }

      this.setState({ clientId: clientId, siteId: siteId, BookmarkTypes: BookmarkTypes });
    } else {
      this.props.history.push('/admin/sites')
    }
  }

  handleValueChange = (option, stateVar) => {
    this.setState({ [stateVar]: option.target ? option.target.value : option });
  }

  bookmarkColorType = (record, index, stateVar) => {
    debugger
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

  handleButtonClick = (index) => {
    let open = { ...this.state };
    open[index] = !this.state.open[index];
    this.setState({ open });
  };

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

  componentWillReceiveProps(nextProps) {
    console.log(this.props, this.state.clientList);
    if (nextProps.match && nextProps.match.params && nextProps.match.params.id) {
      console.log(nextProps.match.params.id)
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

    if (nextProps.storesData && nextProps.storesData !== this.props.storesData) {
      debugger
      if (!nextProps.storesData.isFetching) {
        utils.getUpdatedStoreData(this, nextProps);
      }
    }
  }

  KICRuleChanges = (event, index) => {
    let KIC_Rules_Copy = [...this.state.KIC_Rules];
    KIC_Rules_Copy[index][event.target.name] = event.target.checked;
    this.setState({ KIC_Rules: KIC_Rules_Copy });
  }

  SERARuleChanges = (event, index) => {
    let SERA_RULES_COPY = [...this.state.SERA_RULES];
    SERA_RULES_COPY[index][event.target.name] = event.target.checked;
    this.setState({ SERA_RULES: SERA_RULES_COPY});
  }

  handlesiteNotifi = e => {
    let checked = e.target ? e.target.checked : e;
    this.setState({ useSiteNotifiSetting: checked });
  }

  getUserList = (clientId) => {
    instance
      .get(`${api.GET_CLIENT_USER}/${clientId}`)
      .then((res) => {
        this.setState({
          userEmailsPhones: res.data.data ? res.data.data : []
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };




  async onSave(e) {

    console.log(e);
    let { params } = this.props.match;
    let deviceID = params.id;
    e.preventDefault()

    let Error;


    let { name, POSdeviceRegisterNo, selectedOption, device, location, SmartDeviceType, port, scaleIP, password, username, selectedConnection, clientId, useSiteNotifiSetting, weekDaysAccordian, KicData, SeraData,SERA_RULES,siteId, KIC_Error,SERA_ERROR, KIC_Rules } = this.state;

    if (SmartDeviceType && SmartDeviceType.toLowerCase() === "access control") {
      let RulesList
      if(KicData.kicLocationID){
        console.log('bpp1')
      RulesList =  [...KIC_Rules];
      }else{
        console.log('bpp2')
      RulesList =  [...SERA_RULES];
      }

      if (RulesList && RulesList.length) {
        RulesList.map((rule, index) => {

          if (rule.EmailError || rule.PhoneError) {
            Error = true;
            let message = rule.EmailError ? utils.NotiyEmailError : utils.NotiyPhoneError;
            this.OpenSwal("Error", message, "error");
            return
          }

          KIC_Error['bookmarkType' + index] = '';
          SERA_ERROR['bookmarkType' + index] = '';
          if (!rule.bookMarkTypeId) {
            Error = true;
            let message = 'Please select Rule Color';
            this.OpenSwal("Error", message, "error");
            return
          }
        });
      }

    }

    if (!Error) {

      var bodyFormdata = new FormData();
      let reqBody;

      if (SmartDeviceType && SmartDeviceType.toLowerCase() !== "scale") {
        reqBody = {
          clientId: clientId,
          name: name,
          POSdeviceRegisterNo: POSdeviceRegisterNo,
          device: device,
          deviceLocation: location,
          isDeviceConnected: true,
          day: [],
          kicEvent: [],
          seraEvent: []
        }
      } else {
        reqBody = {
          clientId: clientId,
          device: device,
          name: name,
          notes: "",
          POSdeviceRegisterNo: "",
          deviceNotificationSettings: [
            true
          ],
          kicDeviceID: "",
          kicDeviceType: "",
          kicVendorName: "",
          kicDeviceName: "",
          kicSerialNumber: "",
          kicStatus: "",
          kicLocationID: "",
          scaleIP: scaleIP,
          scalePort: port,
          connectionType: selectedConnection ? selectedConnection.name : null,
          scaleUserName: username,
          scalePassword: password
        }

        bodyFormdata.append('action', 'scale');
      }


      if (SmartDeviceType && SmartDeviceType.toLowerCase() === "access control") {

        reqBody.storeId = siteId;
        reqBody.deviceNotificationSettings = [useSiteNotifiSetting];

        

        if(KicData.kicLocationID){
          reqBody.kicEvent = KIC_Rules;
          reqBody.seraEvent = [];
          reqBody = { ...reqBody, ...KicData }
          bodyFormdata.append('action', 'KIC');
        }else{
          reqBody.kicEvent = [];
          reqBody.seraEvent = SERA_RULES;
          reqBody = { ...reqBody, ...SeraData }
          bodyFormdata.append('action', 'SERA');

        }


        reqBody = [reqBody];
      }

      console.log(reqBody);


      bodyFormdata.append('data', JSON.stringify(reqBody))
      //api save


      instance.
        post(`${api.POST_SITE_SMART}/${deviceID}`, bodyFormdata)
        .then(res => {
          console.log(res);
          if (res.data.message == "Updated Successfully" || res.data.message == "Record Updated Successfully") {
            swal({
              title: "Updated",
              text: res.data.message,
              icon: "success",
              // buttons: true,
              dangerMode: true,
              // showCancelButton: true,
              showConfirmButton: true,
              dangerMode: true,
            }).then(
              function (value) {
                // if (value) {
                  // this.props.history.push(`/admin/sites/smartDevice/${this.state.siteId}`)
                  this.props.history.push({ pathname: `/admin/sites/smartDevice/${this.state.siteId}`, SmartDeviceType: this.state.SmartDeviceType })
               
              }.bind(this)
            );
          } else if (res.data.error) {
            this.OpenSwal("Error", res.data.errmsg, "error");
          }
        }).catch(err => {
          console.log(err);
        });
    }
  }

  onCancel = () => {
    // this.context.router.history.goBack(-1);
    this.props.history.push({ pathname: `/admin/sites/smartDevice/${this.state.siteId}`, SmartDeviceType: this.state.SmartDeviceType })
  }

  onDelete = () => {
    let { params } = this.props.match;
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this site",
      icon: "warning",
      buttons: true,
      showCancelButton: true,
      showConfirmButton: true,
      closeOnCancel: true
      // dangerMode: true,
    }).then(
      function (willDelete) {
        console.log(willDelete);
        if (willDelete) {
          instance.post(`${api.DELETE_SITE_SMART}/${params.id}`)
            .then(res => {
              console.log(res);
              console.log(res.data.errmsg);
              console.log(res.data.msg);
              if (res.data.errmsg) {
                this.OpenSwal("Status", res.data.errmsg, "warning");
                // swal({
                //   title: "Status",
                //   text: res.data.errmsg,
                //   icon: "warning",
                //   showCancelButton: false,
                //   showConfirmButton: true,
                //   dangerMode: true,
                // })
              }
              if (res.data.msg) {
                // this.props.history.push(`/admin/sites/smartDevice/${this.state.siteId}`)
                this.props.history.push({ pathname: `/admin/sites/smartDevice/${this.state.siteId}`, SmartDeviceType: this.state.SmartDeviceType })
              }
            }).catch(err => {
              console.log(err);
            })
        } else {

        }
      }.bind(this)
    );
  };

  getInitialValueTemplate() {
    return {
      deviceName: "",
      configDevice: "",
      regNumber: "",
      location: "",
      POSdeviceRegisterNo: ""
    }
  }


  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }
  handleChange1 = (values) => {
    console.log(values);
    this.setState({
      selectedOption: values,
      device: values.value
    })
  }

  render() {
    let { name, POSdeviceRegisterNo, deviceName, configDevice, regNumber, location, selectedOption, deviceTypes, SmartDeviceType, password, username, selectedConnection, port, scaleIP, isLoading, tableData, columns, sera4Column, useSiteNotifiSetting, userEmailsPhones, clientId, weekDaysAccordian, showtable, KIC_Rules,SERA_RULES, KIC_Error,SERA_ERROR, BookmarkTypes } = this.state;

    if (!SmartDeviceType) this.setState({ SmartDeviceType: 'Access Control' })

    let ConnectionTypeOptions = [
      { name: 'Telnet', label: 'Telnet' },
      { name: 'TCP IP', label: 'TCP IP' },
      { name: 'SSH', label: 'SSH' }
    ];

    let DeviceType = SmartDeviceType && SmartDeviceType.toLowerCase();
    let ScaleSmartDevice = DeviceType === "scale";

    return (
      <div className="animated fadeIn">

        <Row>
          <LoadingDialog isOpen={isLoading} />
          <Col md={12}>
            <form
              autoComplete="off"
              onSubmit={(e) => this.onSave(e)}
            >
              <CardWrapper lg={12}
                footer={
                  <div className={'form-button-group'}>
                    <div><button type="submit" className="btn formButton" title="Save" ><i className="fa fa-save" aria-hidden="true"></i> Save </button></div>
                    <div> <button type="button" className="btn formButton" title="Cancel" onClick={this.onCancel} ><i className="fa fa-close" aria-hidden="true"></i> Cancel</button></div>
                    {SmartDeviceType && SmartDeviceType.toLocaleLowerCase() != "access control" && <div> <button type="button" className="btn formButton" title="Delete" onClick={this.onDelete}><i className="fa fa-trash" aria-hidden="true"></i> Delete</button></div>}
                  </div>
                }
              >

                <div className="">

                  {DeviceType != "access control" &&
                    <div style={{ backgroundColor: "", padding: "12px" }}>
                      <FormGroup row style={{ margin: "0px" }}>
                        <Col xs="5" className="text-field">
                          <Input
                            id="devicename"
                            type="text"
                            value={name}
                            name="name"
                            onChange={(e) => this.handleChange(e)}
                            className="form-control text-form"
                            required
                          />
                          <label className="text-label">Device Name<span className={'text-danger'}>*</span></label>
                        </Col>
                        <Col xs="5" className="text-field">
                          <Select
                            value={selectedOption}
                            onChange={this.handleChange1}
                            options={deviceTypes}
                            required={true}
                          />

                          <label className="fixed-label">Configure Device<span className={'text-danger'}>*</span></label>
                        </Col>
                      </FormGroup>

                      {!ScaleSmartDevice ? <FormGroup row style={{ margin: "0px" }}>
                        <Col xs="5" className="text-field">
                          <Input
                            id="regno"
                            type="text"
                            value={POSdeviceRegisterNo}
                            name="POSdeviceRegisterNo"
                            onChange={(e) => this.handleChange(e)}
                            className="form-control text-form"
                          // required
                          />
                          <label className="text-label">Register Number</label>
                        </Col>
                        <Col xs="5" className="text-field">
                          <Input
                            id="location"
                            type="text"
                            value={location}
                            name="location"
                            onChange={(e) => this.handleChange(e)}
                            className="form-control text-form"
                          // required
                          />
                          <label className="text-label">Location</label>
                        </Col>
                      </FormGroup> : null}

                      {ScaleSmartDevice ? <FormGroup row style={{ margin: "0px" }}>
                        <Col xs="3" className="text-field mr-0 ">
                          <Input
                            id="regno"
                            type="text"
                            value={scaleIP}
                            name="scaleIP"
                            onChange={e => this.handleValueChange(e, "scaleIP")}
                            className="form-control text-form"
                            required
                          />
                          <label className="text-label">IP<span className={'text-danger'}>*</span></label>
                        </Col>
                        <Col xs="2" className="text-field  mr-0 ml-0">
                          <Input
                            id="regno"
                            type="number"
                            value={port}
                            name="port"
                            onChange={e => this.handleValueChange(e, "port")}
                            className="form-control text-form"
                            min={0}
                            required
                          />
                          <label className="text-label">Port<span className={'text-danger'}>*</span></label>
                        </Col>
                        <Col xs="5" className="text-field">

                          <Select
                            value={selectedConnection}
                            name={"selectedConnection"}
                            onChange={option => this.handleValueChange(option, "selectedConnection")}
                            options={ConnectionTypeOptions}
                            required={true}
                          />
                          <label className="fixed-label">Connection Type<span className={'text-danger'}>*</span></label>
                        </Col>
                      </FormGroup>
                        : null}

                      {showtable && ScaleSmartDevice ? <FormGroup row style={{ margin: "0px" }}>
                        <Col xs="5" className="text-field">
                          <Input
                            id="Username"
                            type="text"
                            value={username}
                            name="username"
                            onChange={e => this.handleValueChange(e, "username")}
                            className="form-control text-form"
                          />
                          <label className="text-label">Username</label>
                        </Col>
                        <Col xs="5" className="text-field">
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            name="password"
                            autoComplete="new-password"
                            onChange={e => this.handleValueChange(e, "password")}
                            className="form-control text-form"
                          />
                          <label className="fixed-label">Password</label>
                        </Col>
                      </FormGroup> : null}

                    </div>}

                  {showtable && DeviceType === "access control" && <div style={{ padding: "12px" }}>

                    <Row className={"AutoHeightTable"}>
                      <Col>
                        <Grid 
                          columns={this.state.isSera4 ? sera4Column : columns}
                          autoHeight={true}
                          height={150}
                          dataProperty="smartAcco"
                          smartData={tableData.length > 0 ? tableData : []}
                          localPaging={false}
                          onRowClick={false}
                          exportButton={false}
                          searchVal={''}
                          hidePref={true}
                          hidePagination={true}
                          hideColumnButton={true}
                          hideSearch={true}
                          add={false}
                          screenPathLocation={this.props.location}
                          screen={"Edit Access Control Devices"}
                          noScreenTtitle={true}
                          AutoHeightClass={"no-vr-scroll"}
                        />
                      </Col>
                    </Row>

                    {/* KIC rule starts  */}
                    <div className="ml-4 mt-3"><h6 className="mb-3 ml-3">Notification Settings</h6>
                    {this.state.isSera4 && SERA_RULES && SERA_RULES.length && SERA_RULES.map((rule, index) => {
                      console.log('s////',rule);
                        const bookmarkTypeItem = (BookmarkTypes && BookmarkTypes.filter(e => e.LookupId == rule.bookMarkTypeId)[0]) || {
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
                                      {BookmarkTypes && BookmarkTypes.length && BookmarkTypes.map((bookmarkColor) => {
                                        var divStyle = {
                                          backgroundColor: bookmarkColor.Color,
                                          marginLeft: "auto"
                                        }
                                        return <li style={{ display: "flex" }} onClick={() => this.bookmarkColorType(bookmarkColor, index, "SERA_RULES")}>
                                          <span>{bookmarkColor.DisplayValue}</span>
                                          <span style={divStyle}>  <span style={{ visibility: 'hidden' }}>{`  ${bookmarkColor.Color}`}</span></span>
                                        </li>
                                      })}
                                    </ul>
                                  </div>}
                                </div>
                                {SERA_ERROR && SERA_ERROR['bookmarkType' + index] && <div className="input-feedback">Required</div>}
                              </div>

                              <div className="col-sm-2 text-field pt-2 pl-4">
                                {index===0 ? "Unlocked" : "Access Denied"}
                              </div>

                              <div col className="scaleRulesInputBox">
                                <div check className="col-sm-1.5 text-field mt-0 mb-0">
                                  <Input
                                    checked={rule.bookMark}
                                    onChange={e => this.SERARuleChanges(e, index)}
                                    name={`bookMark`}
                                    className="cursor sms-Checkbox playback_checkbox blckBackgroundClr"
                                    type="checkbox"
                                  />
                                  <span className="blckClr ml-4 BookmarkCheckbox">Bookmarks</span>
                                </div>

                                <div check className="col-sm-1.5 text-field mt-0 mb-0">
                                  <Input
                                    checked={rule.createClip}
                                    onChange={e => this.SERARuleChanges(e, index)}
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
                                  stateVar={"SERA_RULES"}

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
                                  stateVar={"SERA_RULES"}
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
                      {!this.state.isSera4 && KIC_Rules && KIC_Rules.length && KIC_Rules.map((rule, index) => {
                        console.log('***&',rule)
                        const bookmarkTypeItem = (BookmarkTypes && BookmarkTypes.filter(e => e.LookupId == rule.bookMarkTypeId)[0]) || {
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
                                      {BookmarkTypes && BookmarkTypes.length && BookmarkTypes.map((bookmarkColor) => {
                                        var divStyle = {
                                          backgroundColor: bookmarkColor.Color,
                                          marginLeft: "auto"
                                        }
                                        return <li style={{ display: "flex" }} onClick={() => this.bookmarkColorType(bookmarkColor, index, "KIC_Rules")}>
                                          <span>{bookmarkColor.DisplayValue}</span>
                                          <span style={divStyle}>  <span style={{ visibility: 'hidden' }}>{`  ${bookmarkColor.Color}`}</span></span>
                                        </li>
                                      })}
                                    </ul>
                                  </div>}
                                </div>
                                {KIC_Error && KIC_Error['bookmarkType' + index] && <div className="input-feedback">Required</div>}
                              </div>

                              <div className="col-sm-2 text-field pt-2 pl-4">
                                {index===0 ? "Unlocked" : "Access Denied"}
                              </div>

                              <div col className="scaleRulesInputBox">
                                <div check className="col-sm-1.5 text-field mt-0 mb-0">
                                  <Input
                                    checked={rule.bookMark}
                                    onChange={e => this.KICRuleChanges(e, index)}
                                    name={`bookMark`}
                                    className="cursor sms-Checkbox playback_checkbox blckBackgroundClr"
                                    type="checkbox"
                                  />
                                  <span className="blckClr ml-4 BookmarkCheckbox">Bookmark</span>
                                </div>

                                <div check className="col-sm-1.5 text-field mt-0 mb-0">
                                  <Input
                                    checked={rule.createClip}
                                    onChange={e => this.KICRuleChanges(e, index)}
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
                                  stateVar={"KIC_Rules"}

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
                                  stateVar={"KIC_Rules"}
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
                    </div>

                    {/* KIC rule ends  */}

                  </div>}
                </div>
              </CardWrapper>
              <br />
            </form>
          </Col>
        </Row>

      </div >
    );
  }
}

EditSiteSmartDeviceForm.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
  return {

  };
}

export default connect(mapStateToProps)(EditSiteSmartDeviceForm);
