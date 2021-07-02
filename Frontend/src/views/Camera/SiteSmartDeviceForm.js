import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Row, Col, Input } from 'reactstrap';
import utils from './../../Util/Util';
import { connect } from 'react-redux';
import CardWrapper from './../../component/CardWrapper';
import * as Yup from 'yup';
import { storesData, getKIClocations,getSeraLocations,getSeraByLocation, getKICdeviceByLocation, siteSmartDevice, deleteKICDevice, getLinkedLocationSites, deleteSeraDevice } from './../../redux/actions/httpRequest';
import swal from 'sweetalert';
import Select from 'react-select';
import Grid from '../Grid/GridBase';
import { instance } from '../../redux/actions/index';
import api from '../../redux/httpUtil/serverApi';
import LoadingDialog from "./../../component/LoadingDialog";
import BatteryWifiTemplate from "./../../component/BatteryWifiTemplate";

class SiteSmartDeviceForm extends Component {
  constructor(props) {
    super(props);

    let columns = [
      { key: 'attributes.name', name: 'Device Name', width: 200, type: 'string' },
      { key: 'id', name: 'Device ID', width: 200, type: 'string' },
      {
        key: 'attributes.connected', name: 'Connect Status', width: 200, type: 'string', formatter: (props, record) => {
          return <span>{record.attributes.connected ? "Connected" : "Disconnected"}</span>
        }
      },
      { key: 'attributes.updated_at', name: 'Last Updated', width: 200, type: 'date' },
      {
        key: '', name: '', width: 70, type: 'String', formatter: (props, record) => {
          let wifi = record.attributes.wifi_level;
          let power = record.attributes.power_level;

          return <BatteryWifiTemplate
            wifi={wifi ? wifi : 66}
            power={power ? power : 66}
          />
        }
      }
    ];

    let KicColumns = [
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
    ]

    let SeraColumns = [
      { key: 'name', name: 'Device Name', width: 200, type: 'string' },
       { key: 'id', name: 'Device ID', width: 200, type: 'string' },
      {
        key: 'open', name: 'Lock State', width: 200, type: 'string', formatter: (props, record) => {
          return <span>{record.open ? "Open" : "Closed"}</span>
        }
      },
      { key: 'last_reported_at', name: 'Last Updated', width: 200, type: 'date' },
      // {
      //   key: '', name: '', width: 70, type: 'String', formatter: (props, record) => {
      //     return <BatteryWifiTemplate
      //       power={record.kicPowerLevel ? record.kicPowerLevel : 66}
      //       wifi={record.kicWifiLevel ? record.kicWifiLevel : 66}
      //     />
      //   }
      // }
    ]

    let GetSeraColumns = [
      { key: 'name', name: 'Device Name', width: 200, type: 'string' },
       { key: 'sera4DeviceID', name: 'Device ID', width: 200, type: 'string' },
      {
        key: 'sera4Open', name: 'Lock State', width: 200, type: 'string', formatter: (props, record) => {
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

    this.state = {
      deviceName: "",
      configDevice: "",
      regNumber: "",
      location: "",
      name: "",
      selectedOption: "",
      deviceTypes: [],
      clientId: "",
      device: "",
      disableSave: false,
      checked: "False",
      // siteId: props.location.state ? props.location.state.siteId : "5fc6398bb474ce4640c21b23",
      siteId: props.location.state ? props.location.state.siteId : null,
      POSdeviceRegisterNo: "",
      SmartDeviceType: props.location.state ? props.location.state.data.type : null,
      // SmartDeviceType: props.location.state ? props.location.state.data.type : "Access Control",
      // clientId: props.location.state ? props.location.state.clientId : "60141dd01c696f64d8d5725a",
      clientId: props.location.state ? props.location.state.clientId : null,
      password: '',
      username: '',
      selectedConnection: { name: "Telnet", label: "Telnet" },
      port: '',
      scaleIP: '',
      selectedLocation: {},
      lastData: [],
      selectedLocationID: '',
      linkedLocation: false,
      locationOptions: [],
      columns: columns,
      KicColumns: KicColumns,
      showKIC: false,
      SeraColumns: SeraColumns,
      GetSeraColumns: GetSeraColumns,
      SeraLocations: false,
      GetSeraLocations: false,
      showGrid: false,
      refreshDevice: false,
      isLoading: true,
      tableData: [],
      isSera4: false,
    }
    // this.isUpdate = this.props.match.params.id !== "0";
    console.log(props);
    this.onSave = this.onSave.bind(this);
    this.saveAccessDevices = this.saveAccessDevices.bind(this);

  }

  componentDidMount() {
    const { SmartDeviceType, clientId } = this.state;
    console.log('componentDidMount sitesmartDevice', this.props.location.state)

    if (this.props.location && this.props.location.state) {
      let { data, clientId, smartDevicesAllowed, siteId } = this.props.location.state
      let type = data.type
      let options = []
      let obj = { value: '', label: '' }
      if (smartDevicesAllowed.length > 0) {
        console.log('smartDevicesAllowed.length > 0',smartDevicesAllowed)
        smartDevicesAllowed.forEach(x => {
          if (x.smartDeviceType == type) {
            options.push({ value: x._id, label: x.name })
          }
        })
        this.setState({
          deviceTypes: options,
          selectedOption: options.length == 1 ? options[0] : '',
          device: options.length == 1 ? options[0].value : ''
        })
      }
      this.setState({
        clientId: clientId,
        siteId: siteId
      });

      if (SmartDeviceType && SmartDeviceType.toLocaleLowerCase() === "access control") {
        //   console.log('not access control device ');
        // } else {
        console.log('access control device ',options)
        this.setState({ isLoading: true })
        this.getData(clientId, siteId,options);
      }
    } else {
      this.props.history.push('/admin/sites')
    }
  }

  getData = async (clientId, siteId,options) => {
    const { state } = this.props.location
    console.log('mg99',state.data.tableData.length);
    let gg = await this.props.dispatch(getLinkedLocationSites.request({ data: { clientId: clientId, storeId: siteId, isSera4: state.data.tableData.length && state.data.tableData[0].sera4DeviceID !== undefined ? true : false } })); 
    options.map(async (e) =>{
      if(e.label === "Sera4"){
        this.setState({ isSera4: true });
        let gcg = await this.props.dispatch(getSeraLocations.request({ clientId: clientId }));
        console.log('gcg---->',gcg);
      }else{
    let gcg = await this.props.dispatch(getKIClocations.request({ clientId: clientId }));
        console.log('gcg---->',gcg);
  }
    });

  }

  BindDevices = () => {
    const { locationOptions, selectedLocationID ,tableData} = this.state;

    console.log('selectedLocationID-----', selectedLocationID, '---->',tableData)

    let option;
    if (locationOptions.length) {
      option = locationOptions.find(ob =>ob.id == selectedLocationID);
    }

    if (option){
      console.log('option----->',option.label)
      
      this.setState({ selectedLocation: { label: option.label, value: selectedLocationID } });}
  }

  refreshLocation = () => {
    console.log('refresh___')
    this.setState({ refreshDevice: true }, () => this.saveAccessDevices());
  }

  // linkLocation = () => {
  //   const { selectedLocationID, clientId } = this.state;
  //   // console.log('selectedLocationID',selectedLocationID)

  //   // let locationId = parseInt()
  //   // this.props.dispatch(getKICdeviceByLocation.request({ locationId: selectedLocationID }, '', 'GET'));
  //   // 

  //   if (this.state.selectedLocationID) {
  //     this.setState({ isLoading: true });
  //     // this.props.dispatch(getKICdeviceByLocation.request({ locationId: selectedLocationID, clientId: clientId }));
  //     this.saveAccessDevices(data.data);

  //   } else {
  //     swal({ title: "Error", text: "Please select the location to link.", icon: "error" });
  //   }


  delinkLocation = () => {
    const { siteId, selectedLocationID,isSera4 } = this.state;
    this.setState({ isLoading: true })
    console.log('delink data-->',this.state.tableData);
    if(this.state.tableData[0].hasOwnProperty('kicDeviceID')){
    this.props.dispatch(deleteKICDevice.request({ storeId: siteId }, selectedLocationID));
    }else{
      this.props.dispatch(deleteSeraDevice.request({ storeId: siteId }, selectedLocationID));
  }
  }

  componentWillReceiveProps(nextProps) {
    console.log('Locations----------->',nextProps);
    console.log(this.props, this.state.clientList);
    if (nextProps.match && nextProps.match.params && nextProps.match.params.id) {
      console.log("HIIIIIIIIIIIIIIIIIIIII", nextProps.match.params.id)
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

    if(nextProps.getSeraLocations && nextProps.getSeraLocations !== this.props.getSeraLocations){
      let { data, isFetching, error } = nextProps.getSeraLocations;
      if(!isFetching){
        if(error || (data && data.errmsg)) {
          // swal({ title: "Error", text: error || data.errmsg, icon: "error" });
          this.setState({ isLoading: false });
          return;
        } else {
          let dd = [];
          if( data && data.data) {
            dd = data.data;
            console.log('data.data--->',dd)
            dd.data.map(item => {
              // let at = item.location;
              item.value = item.id;
              item.label = item.name;
            });
          }
          this.setState(prevState => ({
            locationOptions: [...prevState.locationOptions, ...dd.data]
          }));
          this.setState({ isLoading:false},() => {
            console.log('setState---')
            this.BindDevices()

          });
           
        }
      }
    }

    if (nextProps.getSeraByLocation && nextProps.getSeraByLocation !== this.props.getSeraByLocation) {

      let { data, isFetching, error } = nextProps.getSeraByLocation;
      if (!isFetching) {
        if (error || (data && data.errmsg)) {
          swal({ title: "Error", text: error || data.errmsg, icon: "error" });
          this.setState({ isLoading: false });
          return;
        } else {
          if (data && data.data) {
            console.log('getSeralocationProp--',data);
            if(this.state.showKIC === true){
              this.setState({showKIC: false});
            }
            this.setState({ tableData: data.data, isLoading: false, SeraLocations: true, showGrid: true });
          }
        }
      }
    }

    if (nextProps.deleteSeraDevice && nextProps.deleteSeraDevice !== this.props.deleteSeraDevice) {

      let { data, isFetching, error } = nextProps.deleteSeraDevice;
      if (!isFetching) {

        if (error || (data && data.errmsg)) {

          this.setState({ isLoading: false });
          swal({ title: "Error", text: error || data.errmsg, icon: "error" });
          return;
        } else {

          if (data && !data.error) {

            // Location Delinked Successfully
            this.setState({ isLoading: false, showGrid: false, KicLocations: false, linkedLocation: false, selectedLocationID: '', selectedLocation: {}, lastData: [] });

            swal({
              title: "De-Linked",
              text: data.message,
              icon: "success",
              dangerMode: true,
              showConfirmButton: true,
              dangerMode: true,
            });

          }
        }
      }
    }

    if (nextProps.getKIClocations && nextProps.getKIClocations !== this.props.getKIClocations) {

      let { data, isFetching, error } = nextProps.getKIClocations;
      if (!isFetching) {
        if (error || (data && data.errmsg)) {
          // swal({ title: "Error", text: error || data.errmsg, icon: "error" });
          this.setState({ isLoading: false });
          return;
        } else {
          let dd = [];
          if (data && data.data) {
            dd = data.data;
            dd.map(item => {
              let at = item.attributes;
              item.value = item.id;
              // creating label to display
              item.label = at.address + `${at.address ? ', ' : ' '}` + at.address2 + `${at.address2 ? ', ' : ' '}` + at.city + `${at.city ? ', ' : ' '}` + at.state + `${at.state ? ', ' : ' '}` + at.postal_code + `${at.postal_code ? ', ' : ' '}` + at.country;
            });
          }

          this.setState(prevState => ({
            locationOptions: [...prevState.locationOptions, ...dd]
          }));
          this.setState({  isLoading: false }, () => this.BindDevices())
        }
      }
    }

    if (nextProps.getKICdeviceByLocation && nextProps.getKICdeviceByLocation !== this.props.getKICdeviceByLocation) {

      let { data, isFetching, error } = nextProps.getKICdeviceByLocation;
      if (!isFetching) {
        if (error || (data && data.errmsg)) {
          swal({ title: "Error", text: error || data.errmsg, icon: "error" });
          this.setState({ isLoading: false });
          return;
        } else {
          if (data && data.data) {
            console.log('kicgetData',data)
            if(this.state.SeraLocations === true){
              this.setState({showGrid: false ,SeraLocations: false});
            } //showKIC:true
            this.setState({ tableData: data.data, isLoading: false, showGrid: true });
          }
        }
      }
    }

    if (nextProps.getLinkedLocationSites && nextProps.getLinkedLocationSites !== this.props.getLinkedLocationSites) {

      let { data, isFetching, error } = nextProps.getLinkedLocationSites;
      if (!isFetching) {
        console.log('getLinkedLocationSites', data)
        if (data && !data.error) {
          if(data.data[0].sera4LocationID){
            this.setState({ selectedLocationID: data.locationId, GetSeraLocations: data.linked, linkedLocation: data.linked ,showGrid: data.linked, lastData: data.data, tableData: data.data },()=>{ this.BindDevices() });
          }else{
          this.setState({ selectedLocationID: data.locationId, KicLocations: data.linked, showGrid: data.linked, lastData: data.data, tableData: data.data });
        }
      }
    }
    }

    if (nextProps.storesData && nextProps.storesData !== this.props.storesData) {
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
    if (nextProps.siteSmartDevice && nextProps.siteSmartDevice !== this.props.siteSmartDevice) {

      let { data, isFetching, error } = nextProps.siteSmartDevice;
      if (!isFetching) {

        this.setState({ checked: "False", refreshDevice: false });

        if (error || (data && data.errmsg)) {

          this.setState({ KicLocations: false, linkedLocation: false, isLoading: false });

          // in case we have to show info that location is already linked
          if (data.errmsg.indexOf("The selected Location is already linked with some other site") > -1) {

            swal({
              // title: "Information",
              text: error || data.errmsg,
              // icon: "info",
              showCancelButton: true,
              showConfirmButton: true,
              buttons: ["Cancel", "Proceed Anyway"],
            }).then(function (willDelete) {
              if (willDelete) {
                this.setState({ checked: 'True' });
                this.saveAccessDevices(true);
              }
            }.bind(this));
          } else {
            swal({ title: "Error", text: error || data.errmsg, icon: "error" });
          }

          return;
        } else {
          this.setState({ showGrid: true, isLoading: false, KicLocations: false, linkedLocation: true, });
        }
      }
    }

    if (nextProps.deleteKICDevice && nextProps.deleteKICDevice !== this.props.deleteKICDevice) {
      let { data, isFetching, error } = nextProps.deleteKICDevice;
      if (!isFetching) {

        if (error || (data && data.errmsg)) {
          swal({ title: "Error", text: error || data.errmsg, icon: "error" });
          this.setState({ isLoading: false });
          return;
        } else {

          // console.log('getLinkedLocationSites',data)
          if (data && !data.error) {

            // Location Delinked Successfully
            this.setState({ showGrid: false, KicLocations: false, linkedLocation: false, selectedLocationID: '', selectedLocation: {}, isLoading: false, lastData: [] });

            swal({
              title: "De-Linked",
              text: data.message,
              icon: "success",
              dangerMode: true,
              showConfirmButton: true,
              dangerMode: true,
            })
          }
        }
      }
    }
  }

  saveAccessDevices = (alreadyLinkedError) => {
    const { clientId, siteId, selectedLocationID, refreshDevice, lastData, tableData, deviceTypes, checked } = this.state;
    console.log('id---->',selectedLocationID);
    // debugger
    // return

    // if(refreshDevice) 
    //   let gg = await this.delinkLocation()
    // }
    // 
    // const { selectedLocationID, clientId } = this.state;
    // console.log('selectedLocationID',selectedLocationID)

    // let locationId = parseInt()
    // this.props.dispatch(getKICdeviceByLocation.request({ locationId: selectedLocationID }, '', 'GET'));
    // 
    // Location seems to be Linked with some other site
    if (selectedLocationID) {
      // this.setState({ isLoading: true });
      // this.props.dispatch(getKICdeviceByLocation.request({ locationId: selectedLocationID, clientId: clientId }));
      // this.saveAccessDevices(data.data);


      let newData;
      // let oldData = lastData.filter(item => tableData.findIndex(item2 => item.kicDeviceID == item2.id) != -1)
      if (alreadyLinkedError) newData = [...tableData];
      else newData = tableData.filter(item => lastData.findIndex(item2 => item._id === item2._id) == -1);
      // let newData =  tableData.filter(item => data.findIndex(item2=> item.id==item2.kicDeviceID) == -1 );
      // let data = [...oldData, ...newData];
      console.log('newData----->',newData);
      let data = [];
      // debugger
      if (newData.length) {
        newData.map(ob => {
          if(ob.hasOwnProperty('attributes')){
          let object = {
            clientId: clientId,
            deviceNotificationSettings: [
              true
            ],
            kicDeviceID: ob.id,
            kicDeviceType: ob.type,
            kicDeviceName: ob.attributes.name,
            kicSerialNumber: ob.attributes.serial_number,
            updated_at: ob.attributes.updated_at,
            kicLocationID: ob.attributes.location_id,
            kicWifiLevel: ob.attributes.wifi_level,
            kicPowerLevel: ob.attributes.power_level,
            isDeviceConnected: ob.attributes.connected,
            device: deviceTypes.length ? deviceTypes[0].value : null
          }
          data.push(object);
        }else{
          let object = {
            clientId: clientId,
            deviceNotificationSettings: [
              true
            ],
            name: ob.name,
            id: ob.id,
            open: ob.open,
            last_reported_at: ob.last_reported_at,
            sera4LocationID: selectedLocationID,
            device: deviceTypes.length ? deviceTypes[0].value : null
          }
          data.push(object)
        }
        });
      }
      console.log('objectData--->',data)
      // let reqData = [...oldData, ...data];
      let reqData = [...data];

      if (!reqData.length) {
        let object = {
          clientId: clientId,
          kicLocationID: selectedLocationID,
          deviceNotificationSettings: [false]
        }

        reqData.push(object)
      }


      // let req = {
      //   action: 'KIC',
      //   data: reqData
      // };
      console.log('5656',reqData)
      this.setState({ refreshDevice: false, lastData: reqData })

      if(reqData[0].hasOwnProperty('kicDeviceID')){
      this.props.dispatch(siteSmartDevice.request({ action: 'KIC', data: reqData.length ? reqData : [], checked: refreshDevice ? 'True' : checked }, siteId));
      }else{
        this.props.dispatch(siteSmartDevice.request({ action: 'Sera4', data: reqData.length ? reqData : [], checked: refreshDevice ? 'True' : checked }, siteId));
      }

    } else {
      swal({ title: "Error", text: "Please select the location to link.", icon: "error" });
    }
  }

  onSave(e) {

    e.preventDefault()

    let { name, POSdeviceRegisterNo, device, location, SmartDeviceType, port, scaleIP, password, username, selectedConnection, clientId, showGrid, linkedLocation, KicLocations, ConfigDevErr, selectedOption, disableSave } = this.state

    if (!disableSave) {

      let DeviceType = SmartDeviceType && SmartDeviceType.toLowerCase();

      this.setState({ ConfigDevErr: !selectedOption || (selectedOption && !selectedOption.label) ? true : false });

      if (DeviceType === "scale" && (ConfigDevErr || (!selectedOption || (selectedOption && !selectedOption.label)))) {
        this.setState({ disableSave: false, isLoading: false })
        return;
      }

      else {
        if (DeviceType !== "access control") {
          var bodyFormData = new FormData();

          let reqBody;

          if (DeviceType !== "scale") {
            reqBody = {
              clientId: clientId,
              name: name,
              POSdeviceRegisterNo: POSdeviceRegisterNo,
              device: device,
              deviceLocation: location,
              isDeviceConnected: true,
              day: []

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
              kicWifiLevel: "",
              kicPowerLevel: "",
              scaleIP: scaleIP,
              scalePort: port,
              connectionType: selectedConnection ? selectedConnection.name : null,
              scaleUserName: username,
              scalePassword: password
            }

            bodyFormData.append('action', 'scale');
          }

          bodyFormData.append('data', JSON.stringify(reqBody));
          instance.post(`${api.CREATE_SITE_SMART}/${this.state.siteId}`, bodyFormData)
            .then(res => {

              this.setState({ isLoading: false, disableSave: false });
              console.log(res);
              if (res.data.message == "Record Inserted Successfully") {
                swal({
                  title: "Created",
                  text: "Created sucessfully ",
                  icon: "success",
                  dangerMode: true,
                  showConfirmButton: true,
                  dangerMode: true,
                }).then(
                  function (value) {
                    // if (value) {
                    this.props.history.push({ pathname: `/admin/sites/smartDevice/${this.state.siteId}`, SmartDeviceType: SmartDeviceType })
                    // }
                  }.bind(this)
                );
              } else if (res.data.error) {
                swal({
                  title: "Error",
                  text: res.data.errmsg,
                  icon: "error",
                  dangerMode: true,
                  showConfirmButton: true,
                  showCancelButton: false,
                });
              }

            }).catch(err => {
              this.setState({ isLoading: false, disableSave: false });
              console.log(err);
            })

        } else {

          this.setState({ disableSave: false, isLoading: false });
          if (showGrid && (linkedLocation || KicLocations)) {
            swal({
              title: "Saved",
              text: "Saved sucessfully",
              icon: "success",
              dangerMode: true
            }).then(
              function (value) {
                // if (value) {
                this.props.history.push({ pathname: `/admin/sites/smartDevice/${this.state.siteId}`, SmartDeviceType: SmartDeviceType })
                // }
              }.bind(this)
            );

          } else {
            swal({ title: "Error", text: "Please link the location to Save the devices for the Site.", icon: "error" }).then(() => this.setState({ disableSave: false, isLoading: false }));

          }

        }
      }
    }

  }

  handleValueChange = (option, stateVar) => {
    this.setState({ [stateVar]: option.target ? option.target.value : option });
  }
  onCancel = () => {
    this.props.history.push({ pathname: `/admin/sites/smartDevice/${this.state.siteId}`, SmartDeviceType: this.state.SmartDeviceType });
  }

  getInitialValueTemplate() {
    return {
      deviceName: "",
      configDevice: "",
      regNumber: "",
      location: "",
      POSdeviceRegisterNo: ""
    }
  }

  handleChange = (e, ErrorStateVar) => {
    let name = e.target.name;
    this.setState({ [name]: e.target.value });

    if (name === "name" || name === "name") {
      this.setState({ [ErrorStateVar]: e.target.value.length == 0 ? true : false })
    }
  }
  handleChange1 = (values, selectedOption, device) => {
    // debugger

    if (selectedOption === "selectedOption" && (!values || values && !values.label)) {
     console.log('ConfigErr')
      this.setState({ ConfigDevErr: true });
    } else{ 
     console.log('ConfigErr false')
     this.setState({ ConfigDevErr: false });}

    this.setState({
      [selectedOption]: values,
      [device]: values.value
    });

    if (device === "selectedLocationID") {
     console.log('selectedLocation---',values,selectedOption,device);

      this.setState({ isLoading: true });
      // if(!this.state.isSera4){
      //   this.props.dispatch(getKICdeviceByLocation.request({ locationId: values.value, clientId: this.state.clientId }));
      // } else {
      //   this.props.dispatch(getSeraByLocation.request({locationId: values.value, clientId: this.state.clientId}))
      // }
      if(values.hasOwnProperty('attributes')){
        console.log("111111KIC")
        this.setState({showGrid: false });
      this.props.dispatch(getKICdeviceByLocation.request({ locationId: values.value, clientId: this.state.clientId }));
      }else{
        console.log("111111SERA")
        this.setState({showGrid: false });
        this.props.dispatch(getSeraByLocation.request({locationId: values.value, clientId: this.state.clientId}))
    }
  }
  }

  render() {
    let { name, POSdeviceRegisterNo, location, selectedOption, deviceTypes, SmartDeviceType, password, username, selectedConnection, port, scaleIP, selectedLocation, locationOptions, columns, KicColumns,SeraColumns, showKIC,showGrid, selectedLocationID, clientId, isLoading, linkedLocation, siteId, KicLocations, SeraLocations, GetSeraLocations, GetSeraColumns, tableData, ConfigDevErr, disableSave } = this.state;

    // PortErr, IpErr, DevNameErr, ConnectionTypeErr, 
    // let { listAction, actionName, sortColumn, sortDirection } = this.props
console.log('44444',locationOptions)
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
              onSubmit={(e) => { this.setState({ disableSave: true, isLoading: true }, this.onSave(e)); }}
            >
              <CardWrapper lg={12}
                footer={
                  <div className={'form-button-group'}>
                    <div><button type="submit" onDoubleClick={() => {console.log('double clieck')}} disabled={disableSave} className="btn formButton" title="Save" ><i className="fa fa-save" aria-hidden="true"></i> Save</button></div>
                    <div> <button type="button" className="btn formButton" title="Cancel" onClick={this.onCancel} ><i className="fa fa-close" aria-hidden="true"></i> Cancel</button></div>
                    {/* {this.isUpdate && <div> <button type="button" className="btn formButton" onClick={this.onDelete} ><i className="fa fa-trash" aria-hidden="true"></i> Delete</button></div>} */}
                  </div>
                }
              >

                <div>
                  {DeviceType != "access control" ?
                    <div style={{ backgroundColor: "", padding: "12px" }}>
                      <FormGroup row style={{ margin: "0px" }}>
                        <Col xs="5" className="text-field">
                          <Input
                            id="devicename"
                            type="text"
                            value={name}
                            name="name"
                            onChange={(e) => this.handleChange(e, 'DevNameErr')}
                            className="form-control text-form"
                            required
                          />
                          <label className="text-label">Device Name
                          <span className={'text-danger'}>*</span>
                          </label>
                          {/* {DevNameErr && <div className="input-feedback">Required</div>} */}
                        </Col>
                        <Col xs="5" className="text-field">
                          <Select
                            value={selectedOption}
                            onChange={option => this.handleChange1(option, 'selectedOption', 'device')}
                            options={deviceTypes}
                            required={true}
                          />

                          <label className="fixed-label">Configure Device
                          <span className={'text-danger'}>*</span>
                          </label>
                          {ConfigDevErr && <div className="input-feedback">Required</div>}
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
                      </FormGroup>
                        : null}

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
                          {/* {IpErr && <div className="input-feedback">Required</div>} */}
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
                          {/* {PortErr && <div className="input-feedback">Required</div>} */}
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
                          {/* {ConnectionTypeErr && <div className="input-feedback">Required</div>} */}
                        </Col>
                      </FormGroup>
                        : null}

                      {ScaleSmartDevice ? <FormGroup row style={{ margin: "0px" }}>
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

                    </div> :
                    <div style={{ padding: "12px" }}>
                      <FormGroup row style={{ margin: "0px" }}>

                        <Col xs="5" className="text-field mr-4">
                          <Select
                            value={selectedLocation}
                            onChange={option => this.handleChange1(option, 'selectedLocation', 'selectedLocationID')}
                            options={locationOptions}
                            required={true}
                            placeholder="Select Location"
                            isDisabled={KicLocations || linkedLocation}
                          />
                          <label className="fixed-label">Location<span className={'text-danger'}>*</span></label>
                        </Col>
                        <Col xs="5" className="text-field ml-4">
                          {!linkedLocation && !KicLocations ? <button type="button" onClick={this.saveAccessDevices} className="btn formButton" title="Link Location" ><i className="fa fa-link" aria-hidden="true"></i> Link Location</button> : <>

                            <button type="button" onClick={this.delinkLocation} className="btn formButton mr-4" title="Link Location" ><i className="fa fa-chain-broken" aria-hidden="true"></i> De-Link Location</button>
                            {/* onClick={this.refreshLocation} */}
                            <button type="button" className="btn formButton" title="Link Location" ><i className="fa fa-refresh" aria-hidden="true"></i> Refresh Device</button>
                          </>}
                        </Col>

                      </FormGroup>

                      {showGrid ?
                        <div className="">
                          <Row>
                            <Col>
                              <Grid
                                columns={showKIC || KicLocations? KicColumns : (SeraLocations ? SeraColumns : (GetSeraLocations? GetSeraColumns : columns) )}
                                autoHeight={true}
                                // listAction={KicLocations ? getLinkedLocationSites : getKICdeviceByLocation}
                                // dataProperty={KicLocations ? 'getLinkedLocationSites' : 'getKICdeviceByLocation'}
                                dataProperty="smartAcco"
                                smartData={tableData.length > 0 ? tableData : []}
                                localPaging={this.props.localPaging || false}
                                onRowClick={false}
                                exportButton={false}
                                searchVal={''}
                                hidePref={true}
                                hideColumnButton={true}
                                hideSearch={true}
                                saveAccessDevices={KicLocations ? false : this.saveAccessDevices.bind(this)}
                                add={false}
                                screenPathLocation={this.props.location}
                                screen={"Access Control Devices"}
                                noScreenTtitle={true}
                                // pageSizeProps={changePage ? currentPageSize : false}
                                // height={450}
                                locationId={selectedLocationID}
                                clientId={clientId}
                                storeId={siteId}
                              />
                            </Col>
                          </Row>
                        </div> : null}


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

SiteSmartDeviceForm.defaultProps = {
  // listAction: getKICdeviceByLocation,
  // actionName: 'getKICdeviceByLocation',
}

SiteSmartDeviceForm.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    getSeraLocations: state.getSeraLocations,
    getSeraByLocation: state.getSeraByLocation,
    deleteSeraDevice: state.deleteSeraDevice,
    getKIClocations: state.getKIClocations,
    deleteKICDevice: state.deleteKICDevice,
    getLinkedLocationSites: state.getLinkedLocationSites,
    siteSmartDevice: state.siteSmartDevice,
    getKICdeviceByLocation: state.getKICdeviceByLocation
  };
}

export default connect(mapStateToProps)(SiteSmartDeviceForm);
