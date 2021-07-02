import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Label, Row, Col, Input, Badge } from 'reactstrap';
import utils from './../../Util/Util';
import { connect } from 'react-redux';
import { forgotPassword } from '../../redux/actions/httpRequest';
import CardWrapper from './../../component/CardWrapper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  saveUser,
  roleListUser,
  clientRegionStore,
  updateUser,
  userData,
  deleteUser,
  getCombos,
  storesData,
  saveActivityLog,
  getUploadedFaces, clientData, clientDataType
} from './../../redux/actions/httpRequest';
import { storeChange } from './../../redux/actions';
import swal from 'sweetalert';
import LoadingDialog from './../../component/LoadingDialog';
import Select from 'react-select';
import consts from '../../Util/consts';
import regex from './../../Util/regex';
import './styles.scss';
import Switch from "react-switch";
import TreeStructure from './tree';
import { instance } from '../../redux/actions/index';
import api from '../../redux/httpUtil/serverApi';
import RegionSelect from './RegionSelect';
const { Search } = Input;

const customStyles = {
  clearIndicator: styles => ({ ...styles, width: '16', padding: '0px' }),
  control: styles => ({ ...styles, backgroundColor: 'white' })
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


class UserForm extends Component {
  constructor(props) {
    super(props);

    let loggedInAdmin = utils.ifPermissionAssigned('', '', 'isAdminRole');
    let loggedInInstaller = utils.ifPermissionAssigned('', '', 'isInstallerRole');

    this.state = {
      formData: {},
      combos: {},
      loggedInInstaller: loggedInInstaller,
      loggedInAdmin: loggedInAdmin,
      selectedOption: null,
      clientSelected: null,
      roleSelected: null,
      imagePreviewUrl: '',
      file: '',
      modalIsOpen: false,
      widRepo: false,
      isRoleClear: false,
      widgets: [],
      reports: [],
      showTree: false,
      treeData: {
        treeData: [],
        status: false
      },
      firstTime: true,
      UserStatus: 'Inactive',
      widgetReport: [],
      activeStatus: "",
      emailNotif: false,
      smsStatus: false,
      roleErr: "",
      regData: [],
      userProfile: "",
      selectedStoreId: [],
      selectedRegion: "",
      regSiteData: [],
      selectedRegions: [],
      regionDropDown: {},
      onlyTreeId: [],
      dropDownCheckedKeys: [],
      isClearClients: false,
      clientsList: [],
      isAdmin: false,
      isInstaller: false,
      installerHit: false,
      clientHit: false,
      emailId: '',
      emptyArray: false
    }
    this.isUpdate = this.props.match.params.id !== "0";
    this.onSave = this.onSave.bind(this);
    this.installerChange = this.installerChange.bind(this);
  }

  async componentDidMount() {
    if (this.props.match.params.id !== "0") {
      let d = await this.props.dispatch(userData.request({ populate: 'roleId storeId clientId widgetsAllowed reportsAllowed' }, this.props.match.params.id));
    }


    let g = await this.props.dispatch(getCombos.request({ combos: "store,client,role" }));

    let loggedUser = utils.getLoggedUser();

    if (loggedUser.clientId !== null) {
      if (loggedUser.clientId.clientType === "installer") {
        let g = await this.props.dispatch(clientData.request({ action: "find" }, loggedUser.clientId._id, null, (res) => {this.setState({InstallerCreateClients: [{label: res.name, value: res._id}]})}))
      }
    }

  }

  componentWillReceiveProps(nextProps) {

    if (nextProps.clientData && nextProps.clientData && nextProps.clientData != this.props.clientData) {
      let { data, isFetching, error } = nextProps.clientData;
      if (!isFetching) {

        if (!error && data) {
          this.setState({ clientsList: data.data })
        }
      }

    }

    if (Object.keys(nextProps.initialValues).length > 0) this.setState({ UserStatus: nextProps.initialValues.status });

    if (Object.keys(nextProps.initialValues).length > 0 && nextProps.initialValues.clientId && Object.keys(nextProps.initialValues.clientId).length > 0 && !this.state.isClearClients && nextProps.initialValues != this.props.initialValues) {

      console.log("111111", nextProps.initialValues.clientId);


      let clientSelected;
      let roleSelected;


      if (nextProps.initialValues.roleId && nextProps.initialValues.roleId.isInstallerRole && this.state.firstTime) {
        clientSelected = {};

        this.setState({ installerId: nextProps.initialValues.clientId._id })
      } else {
        clientSelected = { label: nextProps.initialValues.clientId.name, value: nextProps.initialValues.clientId._id };
        if (nextProps.initialValues.roleId !== null) {
          roleSelected = { label: nextProps.initialValues.roleId.name, value: nextProps.initialValues.roleId._id };
        }
      }

      this.setState({
        clientSelected: clientSelected,
        roleSelected: roleSelected,
        firstTime: false,
        // finalStoreId: nextProps.initialValues.clientId.smartDevicesAllowed
      })
    }

    if (nextProps.clientDataType && nextProps.clientDataType.data && nextProps.clientDataType.data.data && nextProps.clientDataType.data.data.length && nextProps.clientDataType != this.props.clientDataType) {

      let { data, isFetching, error } = nextProps.clientDataType;
      if (!isFetching) {

        if (!error && data) {
          nextProps.clientDataType.data.data.map(element => {
            element.label = element.name;
            element.value = element._id;
          });
          
          this.setState({ InstallerClients: nextProps.clientDataType.data.data })
        }
      }


    }


    if (this.state.clientSelected && !this.state.isClearClients) {

      if (this.state.clientSelected.value != this.state.LastClientSelectedd) {
        this.setState({ LastClientSelectedd: this.state.clientSelected.value });
        this.handleClientChange(null, this.state.clientSelected);
      }

    }

    if (Object.keys(nextProps.initialValues).length > 0 && nextProps.initialValues.roleId && Object.keys(nextProps.initialValues.roleId).length > 0 && nextProps.getCombos.data && nextProps.getCombos.data.role) {
      this.setState({ adminRole: nextProps.initialValues.roleId._id, roleSelected: utils.selectOption(nextProps.getCombos.data.role, nextProps.initialValues.roleId._id) })


    }
    if (Object.keys(nextProps.initialValues).length > 0 && nextProps.initialValues.storeId && nextProps.initialValues !== this.props.initialValues) {
      console.log(this.state.selectedStoreId, this.state.onlyTreeId)
      let data = []

      if (nextProps.initialValues.storeId.length > 0) {
        nextProps.initialValues.storeId.forEach(x => {
          data.push(x._id)
        })
        console.log(data);
        
        this.setState({
          selectedStoreId: nextProps.initialValues.storeId,
          onlyTreeId: data,
          finalStoreId: data
        })
      }
      else {
        //   
        this.setState({ selectedStoreId: [] })
      }
    }
    if (Object.keys(nextProps.initialValues).length > 0 && !this.state.isRoleClear) {
      console.log('this.stateeeeeeee will', this.state)

      this.setState({
        reports: nextProps.initialValues.reportsAllowed,
        widgets: nextProps.initialValues.widgetsAllowed
      })
    }

    if (this.state.emptyArray) {
      this.setState({
        reports: [],
        widgets: []
      })
    }

    // if (Object.keys(nextProps.initialValues).length > 0) {
    //   console.log(this.state.clientSelected);
    //   if(this.state.clientSelected){
    //     console.log(this.state.treeData.status);
    //     if(!this.state.treeData.status){
    //     console.log("ll");
    //     this.handleClientChange(null,this.state.clientSelected)
    //   }
    //   }
    //   // this.setState({ treeData: nextProps.initialValues.storeId })
    // }

    if ((nextProps.storesData && nextProps.storesData !== this.props.storesData)) {
      if (!nextProps.storesData.isFetching) {
        utils.getUpdatedStoreData(this, nextProps);
      }
    }

    if ((nextProps.saveUser && nextProps.saveUser !== this.props.saveUser)) {
      let { data, isFetching, error } = nextProps.saveUser;
      if (!isFetching) {
        if (error || data && data.errmsg) {
          swal({ title: "Error", text: error || data.errmsg, icon: "error", });
          return;
        }
        if (data.message) {
          swal({
            title: utils.getAlertBoxTitle(data.success),
            text: data.message,
            icon: utils.getAlertBoxIcon(data.success)
          }).then(function () {
            this.updateStore();
          }.bind(this));
        }
      }
    }

    if ((nextProps.updateUser && nextProps.updateUser !== this.props.updateUser)) {
      let { data, isFetching, error } = nextProps.updateUser;
      if (!isFetching) {
        if (error || data && data.errmsg) {
          swal({ title: "Error", text: error || data.errmsg, icon: "error", });
          return;
        }
        if (data.message) {
          swal({
            title: utils.getAlertBoxTitle(data.success),
            text: data.message,
            icon: utils.getAlertBoxIcon(data.success)
          }).then(function () {
            this.updateStore();
          }.bind(this));
        }
      }
    }

    if ((nextProps.userData && nextProps.userData !== this.props.userData)) {
      let { data, isFetching, error } = nextProps.userData;
      if (!isFetching) {
        if (error || data && data.errmsg) {
          swal({ title: "Error", text: error || data.errmsg, icon: "error", });
          return;
        }
      }
    }

    if ((nextProps.userData && nextProps.userData !== this.props.userData)) {
      let { data, isFetching, error } = nextProps.userData;
      if (!isFetching) {
        if (error || data && data.errmsg) {
          swal({ title: "Error", text: error || data.errmsg, icon: "error", });
          return;
        }

        else if (data && data.message) {
          this.props.history.goBack(-1)
        } else {


          let isInstaller = data && data.roleId ? data.roleId.isInstallerRole : false;
          if (isInstaller) {


            // this.installerChange(data && data.clientId ? data.clientId._id : '');

            this.setState({ clientsList: [], installerId: data && data.clientId ? data.clientId._id : '' }, () => this.installerChange(data && data.clientId ? { value: data.clientId._id } : '', 'fromNextprops'));
          }


          this.setState({
            data: data,
            isAdmin: data && data.roleId ? data.roleId.isAdminRole : false,
            isInstaller: isInstaller,

            // imagePreviewUrl: data && data.userProfile ? utils.serverUrl + '/UserProfile/' + (data.userProfile) : null
            // imagePreviewUrl: data.userProfile ? "http://3.213.194.99:9002/api/" + '/userProfile/' + (data.userProfile)+ "/Date.now()": null
            // imagePreviewUrl: data.userProfile ? "http://localhost:5000/api/" + 'userProfile/' + (data.userProfile)+ "/Date.now()": null

            imagePreviewUrl: data && data.userProfile ? utils.serverUrl + '/UserProfile/' + (data.userProfile) : null


            // imagePreviewUrl:`${api.USER_PROFILE}/50/50/${data.userProfile}/${Date.now()}`
          }, () => {
            console.log(this.state.imagePreviewUrl);
          })
        }
        this.setState({ file: null })
      }
    }


    // if ((nextProps.roleListUser && nextProps.roleListUser !== this.props.roleListUser)) {
    //   let { data, isFetching, error } = nextProps.roleListUser;
    //   if (!isFetching) {
    //     if (error || data && data.errmsg) {
    //       swal({ title: "Error", text: error || data.errmsg, icon: "error", });
    //       return;
    //     }
    //   }
    // }

    // if ((nextProps.clientRegionStore && nextProps.clientRegionStore !== this.props.clientRegionStore)) {
    //   let { data, isFetching, error } = nextProps.clientRegionStore;
    //   if (!isFetching) {
    //     if (error || data && data.errmsg) {
    //       swal({ title: "Error", text: error || data.errmsg, icon: "error", });
    //       return;
    //     }
    //   }
    // }

    if ((nextProps.deleteUser && nextProps.deleteUser !== this.props.deleteUser)) {
      let { data, isFetching, error } = nextProps.deleteUser;
      if (!isFetching) {
        if (error || data && data.errmsg) {
          swal({ title: "Error", text: error || data.message, icon: "error", });
          return;
        }
        if (data.message) {
          swal({
            title: utils.getAlertBoxTitle(data.success),
            text: data.message,
            icon: utils.getAlertBoxIcon(data.success)
          }).then(function () {
            this.updateStore();
          }.bind(this));
        }
      }
    }

    if ((nextProps.getCombos && nextProps.getCombos !== this.props.getCombos)) {
      let { data, isFetching, error } = nextProps.getCombos;
      if (!isFetching) {
        data && data.client.map((d, i) => {
          if (d.status == "Inactive") {
            data.client.splice(i, 1)
          }
        })
        this.setState({ combos: data });
      }
    }
    if (nextProps.roleListUser.data) {
      // console.log(nextProps.roleListUser.data.permissions, "!!!!!!!!!!!!!!",this.state.widgets,this.state.widRepo);
      if (nextProps.roleListUser.data.permissions.length > 0) {
        // if(!this.state.widRepo){
        let widgets = []
        let reports = []
        let data = nextProps.roleListUser.data.permissions
        console.log('willreceiveprops', data, this.state)

        data.forEach(x => {
          if (x.widgetId) {
            widgets.push(x.widgetId)
          }
          if (x.reportId) {
            reports.push(x.reportId)
          }
        });
        // console.log(reports,widgets);
        this.setState({
          widgets: widgets,
          reports: reports,
          widRepo: true
        }, () => {
          // console.log(this.state.widgets);
        })
        // }
      }
    }
  }

  
  NumberOnly = (e, handleChange, value) => {
    let numValue = value.replace(/\D/g, '');
    e.target.value = numValue;
    handleChange(e);
  }

  updateStore() {
    this.props.dispatch(storesData.request({ stores: [] }));
  }
  getStoreData = async (data) => {

    const { isInstaller, isAdmin, regData, selectedStoreId, DataCheck, finalStoreId } = this.state;

    console.log(data, this.state.regData);
    let gop = []
    let sitesData = regData;

    if ((isAdmin || isInstaller) && selectedStoreId.length) selectedStoreId.map(ob => gop.push(ob._id))

    let SelectedSites = (isAdmin || isInstaller) ? [...selectedStoreId] : [];

    await sitesData.forEach(x => {
      data.forEach(y => {
        if (x.storeId === y) {
          console.log("Hi");

          gop.findIndex(item => item === x.storeId) == -1 && gop.push(x.storeId);

          SelectedSites.findIndex(item => item._id === x.storeId) == -1 && SelectedSites.push({ _id: x.storeId, name: x.storeName });
        }
      })
    })
   
    this.setState({
      finalStoreId: !DataCheck && finalStoreId ? finalStoreId : gop,
      selectedStoreId:  !DataCheck && selectedStoreId.length ? selectedStoreId :SelectedSites
    }, () => {
      this.setState({DataCheck: true});
      console.log('finalStoreId', this.state.finalStoreId);
    })
  }

  callMe = async (data) => {
    console.log(data);
    await data.forEach(x => {
      console.log(x);
      if (x.items && x.items.length > 0) {
        let data1 = [...x.items, ...this.state.regSiteData]
        console.log(this.state.regSiteData, data1)
        this.state.regSiteData = data1
        this.callMe(x.items)
      }
      if (x.storeData && x.storeData.length > 0) {
        console.log("JJS", x.storeData);
        let data2 = [...x.storeData, ...this.state.regData]
        // this.state.regSiteData=data2
        console.log(data2);
        this.state.regData = data2

      }
    })
    console.log(this.state.regSiteData, this.state.regData);
  }

  onSave(values, { setSubmitting }) {

    setSubmitting(false);

    let storeIds = [];
    let clientId = null;
    let roleId = null;
    let { selectedOption, clientSelected, roleSelected, file, finalStoreId, selectedStoreId, widgets, reports, UserStatus, isAdmin, isInstaller, installerId, adminRole } = this.state;
    console.log('clientSelectedclientSelected', clientSelected, roleSelected);
    let id = this.props.match.params.id;
    let loggedData, loggedUser = utils.getLoggedUser();
    let isAdminRole = loggedUser && loggedUser.roleId.name == 'Admin' || false;
    if (isAdminRole) {
      values.storeId = storeIds;
      values.roleId = roleId;
    }

    //Manageing saving data for new records
    if (!isAdminRole && this.props.match.params.id === "0") {
      values.storeId = storeIds;
    }
    selectedOption && selectedOption.map((val, i) => {
      storeIds.push(val.value);
    })

    console.log(roleSelected);
    console.log(finalStoreId, widgets, reports);
    let user = values.firstName.toUpperCase() + ' ' + values.lastName.toUpperCase();
    console.log(values, clientSelected);

    if (!roleSelected && isInstaller) {
      swal({ title: "Error", text: "Please select Installer Role to create Installer type user.", icon: "error" });
      return

    } else {
      let record = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        // displayPicture:'' ,
        status: UserStatus,
        // status: values.status,
        isEmailNotificationEnabled: values.isEmailNotificationEnabled,
        roleId: roleSelected ? (typeof(roleSelected.data) !== "undefined" ? roleSelected.data._id : (roleSelected.value ? roleSelected.value: null)) : null,
        widgetsAllowed: widgets,
        reportsAllowed: reports,
        storeId: selectedStoreId,
        clientId: !isAdmin && !isInstaller && clientSelected && Object.keys(clientSelected).length > 0 ? clientSelected.value : isInstaller ? installerId : null,
        secretKey: "",
        secretKeyUsed: true,
        secretKeyGeneratedAt: "",
        userProfile: "",
        theme: "",
        mobile: values.mobile,
        isSMSEnable: values.isSMSEnable,
        checkedData: this.state.treeData
      }
      console.log(values, record);

      if (isAdmin) record.roleId = adminRole;

      console.log('reord onsave', record, 'stateeee', this.state)
      // utils.deleteUnUsedValue(record);
      // loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Update + ' - ' + user);
      // this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
      this.props.dispatch(updateUser.request({ action: 'update', data: record, isAdmin: isAdmin, isInstaller: isInstaller, userForm: "true", file: file }, id));
      this.props.dispatch(getCombos.request({ combos: "store,client,role" }));
    }
  }

  onCancel = () => {
    this.context.router.history.goBack(-1);
  }

  installerChange = async (option, from) => {

    let installerID = option ? option.value : '';

    // this.handleClient(option ? option.value : '')

    var gg = await this.props.dispatch(clientData.request({
      action: 'installer',
      installerId: installerID
    }));
    // var gg = await this.props.dispatch(clientData.request({
    //   action: "load", filters: [
    //     {
    //       "operator": "like",
    //       "value": installerID,
    //       "property": "installerId",
    //       "type": "object"
    //     }]
    // }));

    var state = this.state;
    console.log("++++", installerID != this.state.installerId)
    console.log("++++==", installerID)
    console.log("++++88", this.state.installerId)
    if (installerID != this.state.installerId) {
      console.log('in')
      
      this.setState({ clientSelected: [], roleSelected: [], reports: [], widgets: [], isRoleClear: true, finalStoreId: [], selectedStoreId: [] })
    }

    this.setState({ installerId: installerID, clientName: {} },
      () => this.getRoleOptions(option));
  }

  getRoleOptions = async clientName => {

    if (clientName && clientName.value) {

      const { isInstaller, roleSelected } = this.state;

      this.setState({ isLoading: true });

      let url = `${api.GET_CLIENT_ROLE_USERS}/${clientName.value}`;

      var body = new FormData()

      if (isInstaller) {

        body.append('action', 'search')
        body.append('filters', JSON.stringify([{ "operator": "like", "value": 0, "property": "roleStatus", "type": "numeric" }, { "operator": "like", "value": true, "property": "isInstallerRole", "type": "boolean" }, { "operator": "like", "value": clientName.value, "property": "clientId", "type": "object" }]));

        url = `${api.ROLE_LIST_USER}`;
      }

      await instance.post(url, body)
        .then(async res => {
          console.log(res);
          this.setState({ isLoading: false });
          let data = []
          if (res.data.data) {
            if (res.data.data.length > 0) {
              await res.data.data.forEach(x => {
                let label = { label: x.name }
                let val = { data: x }
                data.push({ ...val, ...label })
              })
              this.setState({
                roles: data,
                rolesErr: ""
              })
            }
          }

          if (res.data.errmsg || (isInstaller && !res.data.data.length)) {
            if (isInstaller) res.data.errmsg = "No Roles Found for this Client";
            this.setState({
              rolesErr: res.data.errmsg,
              roles: [],
              roleSelected: isInstaller ? '' : roleSelected
            })
          }

        }).catch(err => {
          console.log(err);
          this.setState({ isLoading: false });
        })
    }

  }


  onDelete = () => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this user",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(function (willDelete) {
      let { data } = this.props.userData;
      let id = this.props.match.params.id;
      let user = data.firstName.toUpperCase() + ' ' + data.lastName.toUpperCase();
      if (willDelete) {
        let loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Delete + ' - ' + user);
        this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
        this.props.dispatch(deleteUser.request({ action: 'delete' }, id))
      }
    }.bind(this));
  }

  onresetPassowrd = () => {
    
    this.props.dispatch(forgotPassword.request({ email: this.state.emailId }, null, null, (response) => {
      let { success, message } = response;
      if (success) {
        swal({
          title: utils.getAlertBoxTitle(success),
          text: message,
          icon: "success",
          showConfirmButton: true
        })
      }
    }))
  }

  getInitialValueTemplate() {
    return {
      email: "",
      firstName: "",
      // gender: "",
      lastName: "",
      password: "",
      status: "",
      clientId: "",
      userRole: "",
      roleId: "",
      file: "",
      permissions: "",
      widgetId: "",
      reportId: "",
      treeData: "",
      storeId: "",
      reportsAllowed: "",
      widgetsAllowed: "",
      activeStatus: "Active",
      emailNotif: false,
      smsStatus: false,
      roles: [],
      selectedRegion: "",
      showRegionTree: false,
      userProfile: ''
    }
  }

  getOption(item) {
    return (<option value={item.LookupId}>{item.DisplayValue}</option>)
  }
  selectRegionSites = async (values) => {
    //  
    if (values) {

      console.log(values, this.state.regData, this.state.regSiteData);
      let sites = []
      this.setState({
        regionDropDown: values,
      })
      let v = this.state.selectedStoreId
      console.log(v);
      // const trigger = (x) =>{
      // console.log(x._id,values.id);
      //   return x._id=== values.id};
      // const trigger = (x) => x.name=== values.id;
      // if(!(this.state.selectedStoreId.some(trigger))){
      //   v.push(values)
      //   this.setState({
      //     selectedStoreId:v
      //   })
      // }

      let marked = {}
      this.state.regSiteData.some(x => {
        if (x.id === values.id)
          marked = x
        console.log("D");
        return x.id === values.id
      })
      console.log(marked);
      console.log(marked);
      if (marked && marked.items && marked.items.length > 0) {

        this.state.dropDownCheckedKeys.push(marked._id)
        await this.filterSyncCheck(marked.items)
        this.setState({
          onlyTreeId: this.state.dropDownCheckedKeys
        }, () => {
          console.log(this.state.onlyTreeId);
          this.showBadges(this.state.onlyTreeId)

        })
      } else if (values.storeId) {
        let data = this.state.dropDownCheckedKeys
        data.push(values.storeId)
        this.setState({
          onlyTreeId: data
        }, () => {
          console.log(this.state.onlyTreeId);
          this.showBadges(this.state.onlyTreeId)

        })
      } else {
        let data = this.state.dropDownCheckedKeys
        data.push(values._id)
        this.setState({
          onlyTreeId: data
        }, () => {
          console.log(this.state.onlyTreeId);
          this.showBadges(this.state.onlyTreeId)

        })
      }


      console.log(this.state.selectedRegions, this.state.selectedStoreId, this.state.onlyTreeId);
      // this.callMe(this.state.selectedRegions)
    }
  }
  showBadges = (data) => {
    this.state.regSiteData.forEach(x => {
      data.forEach(y => {
        data.push(x._id)
      })
    })
  }
  filterSyncCheck = (marked) => {

    let { dropDownCheckedKeys } = this.state
    let d = dropDownCheckedKeys;
    console.log(marked);
    marked.forEach(x => {
      if (!x.storeId) {
        dropDownCheckedKeys.push(x._id)
      }
      if (x.items && x.items.length > 0) {
        console.log("Asda");
        //  if(x.items.length>0)

        this.filterSyncCheck(x.items)
      }
      if (x.storeData && x.storeData.length > 0) {
        this.filterSyncCheck(x.storeData)

      }
      if (x.storeId) {
        dropDownCheckedKeys.push(x.storeId)
      }

    })
    console.log(dropDownCheckedKeys);
    //  dropDownCheckedKeys=d
  }

  handleClientChange = async (setFieldValue, clientSelected) => {

    const { isAdmin, selectedStoreId, isInstaller } = this.state;

    if (clientSelected == null) {
      this.setState({ isClearClients: true })
    }
    console.log('selectedvalue', clientSelected, this.state);
    if (this.state.clientSelected && this.state.clientSelected.value && clientSelected && clientSelected.value) {

      if (this.state.clientSelected.value != clientSelected.value) {

        this.setState({
          // roleSelected: {},
          // reports: [],
          // widgets: [],
          roleSelected: !isAdmin && !isInstaller ? {} : this.state.roleSelected,
          reports: !isAdmin && !isInstaller ? [] : this.state.reports,
          widgets: !isAdmin && !isInstaller ? [] : this.state.widgets,
          selectedStoreId: isAdmin || isInstaller ? selectedStoreId : [],
          regionDropDown: {},
          onlyTreeId: {}
        })
      }
    }
    if (clientSelected && clientSelected.value) {

      console.log('clientSelected.value second if')
      this.setState({
        clientSelected: clientSelected,
        showTree: true,
        isLoading: true
      });
      await instance.post(`${api.CLIENT_REGION_STORE}/${clientSelected.value}`)
        .then(async res => {
          // console.log(res);
          let regSites = []

          this.setState({ isLoading: false });

          if (res.data.clientRegionResut) {
            //  
            let data = {
              treeData: res.data.clientRegionResut,
              status: true
            }

            this.setState({
              treeData: data,
              regData: [],
            })

            console.log('treeData', data);

            let wait = await this.callMe(res.data.clientRegionResut)
            console.log(this.state.regSiteData, this.state.regData);
            regSites = [...this.state.regSiteData, ...this.state.regData]
            console.log(regSites);
            regSites = regSites.map(x => {
              let label = {}
              if (x.name) {
                label = { label: x.name, id: x._id }
                console.log({ ...x, ...label });
                return { ...x, ...label }
              } else {
                label = { label: x.storeName, id: x.storeId }
                return { ...x, ...label }
              }
            })

            this.setState({ regSiteData: regSites })
            console.log(this.state.regSiteData, "{...x,...label}");
          }
        }).catch(err => {
          console.log(err);
          this.setState({ isLoading: false });
        });

      if (!isAdmin && !isInstaller) {
        this.getRoleOptions(clientSelected)
      }
    } else {
      console.log('elseeeee 745', this.state)
      
      this.setState({
        clientSelected: {},
        finalStoreId: [],
        selectedStoreId: [],
        selectedRegion: "",
        selectedRegions: [],
        showTree: false
      });

      if (!isAdmin && !isInstaller) {
        this.setState({
          widgets: [],
          reports: [],
          roleSelected: '',
          roles: []
        });
      }
    }
  }
  handleRoleChange = async (setFieldValue, roleSelected) => {

    setFieldValue('roleId', roleSelected || '');
    console.log(roleSelected, "@@@@@@@@@@@@@@@@@@@");

    await this.setState({ roleSelected });

    if (roleSelected) {

      this.setState({ isLoading: true });
      console.log('roleselecteddd', roleSelected)
      let data = {
        "populate": [
          "permissions.widgetId",
          "permissions.reportId"
        ]
      }
      // this.props.dispatch(roleListUser.request( data,roleSelected.value))
      instance.post(`${api.ROLE_LIST_USER}/${roleSelected.data._id}`, data)
        .then(async res => {
          this.setState({ isLoading: false });
          console.log(res);
          if (res.data) {
            let widgets = []
            let reports = []
            await res.data.permissions.forEach(x => {
              if (x.widgetId) {
                widgets.push(x.widgetId)
              }
              if (x.reportId) {
                reports.push(x.reportId)
              }
            });
            // console.log(reports,widgets);
            this.setState({
              widgets: widgets,
              reports: reports,
              widRepo: true,
              isRoleClear: false
            }, () => {
              console.log(this.state.widgets, this.state.reports);
            })
            this.setState({
              widgetReport: res.data.data.permissions
            })
          }
        }).catch(err => {
          // console.log(err);
          this.setState({ isLoading: false });

        });
    } else {
      this.setState({ widgets: [], reports: [], widRepo: false, isRoleClear: true })
    }

  }

  // showRegionTree = () => {
  //   console.log("showTre");
  //   if (!this.state.showTree) {
  //     this.setState({
  //       showTree: true
  //     })
  //   }
  // }
  deleteReports = async (id) => {
    let data = this.state.reports
    // console.log(id);
    data = await data.filter(x => {
      console.log(x._id, id);
      return x._id !== id
    })
    this.setState({
      reports: data
    })
  }
  deleteWidgets = async (id) => {
    let data = this.state.widgets
    // console.log(id);
    data = await data.filter(x => {
      console.log(x._id, id);
      return x._id !== id
    })
    this.setState({
      widgets: data
    })
  }

  deleteRegSite = async (id) => {
    
    let data = this.state.selectedStoreId;
    let finalStoreId = this.state.finalStoreId;
    console.log(id);
    data = await data.filter(x => {
      console.log(x._id, id);
      return x._id !== id
    })

    if (finalStoreId.length) {
      let DeleteIndex = finalStoreId.findIndex(sid => sid == id)
      finalStoreId.splice(DeleteIndex, 1);
    }
     
    this.setState({
      selectedStoreId: data,
      finalStoreId: finalStoreId
    }, () => { console.log('finalStoreId', this.state.finalStoreId); })
  }

  changeStatus(value) {
    this.setState({ UserStatus: value })
  }

  handleImageChange(e) {
    e.preventDefault();
    console.log(e, e.target.files);
    let reader = new FileReader();
    if (e.target.files.length > 0) {
      let file = e.target.files[0];
      if (/\.(jpe?g|png)$/i.test(file.name) === false) {
        swal({ title: "Error", text: "Only PNG and JPEG/JPG are allowed." });
        return;
      }
      if (file.size > 1000000) {
        swal({ title: "Error", text: "Image size exceeds 1 MB." });
        return;
      }
      reader.onloadend = () => {
        this.setState({
          file: file,
          imagePreviewUrl: reader.result
        });
      }
      reader.readAsDataURL(file)
    }
  }

  openModal = (file) => {
    this.targetFileName = file.name;
    this.setState({ modalIsOpen: true });
  }

  closeModal = () => {
    this.setState({ modalIsOpen: false });
  }

  handleClient = async clientName => {

    const { isAdmin, isInstaller, selectedStoreId } = this.state;

    if (this.state.clientName && this.state.clientName.value && clientName && clientName.value) {
      if (this.state.clientName.value != clientName.value) {

        this.setState({
          roleName: !isAdmin && !isInstaller ? {} : this.state.roleName,
          reports: !isAdmin && !isInstaller ? [] : this.state.reports,
          widgets: !isAdmin && !isInstaller ? [] : this.state.widgets,
          selectedStoreId: isAdmin || isInstaller ? selectedStoreId : [],
          regionDropDown: {},
          onlyTreeId: {}

        })
      }
    }

    if (clientName && Object.keys(clientName).length) {
      this.setState({ isLoading: true });
      console.log(clientName);
      this.setState({ clientName, showTree: true });
      await instance.post(`${api.CLIENT_REGION_STORE}/${clientName.value}`)
        .then(async res => {
          // console.log(res);

          this.setState({ isLoading: false });

          let regSites = []
          if (res.data.clientRegionResut) {
            this.setState({
              treeData: res.data.clientRegionResut,
              regData: []
            })

            let wait = await this.callMe(res.data.clientRegionResut)
            console.log(this.state.regSiteData, this.state.regData);
            regSites = [...this.state.regSiteData, ...this.state.regData]
            console.log(regSites);
            regSites = regSites.map(x => {
              let label = {}
              if (x.name) {
                label = { label: x.name, id: x._id }
                console.log({ ...x, ...label });
                return { ...x, ...label }
              } else {
                label = { label: x.storeName, id: x.storeId }
                return { ...x, ...label }
              }
            })
            this.setState({
              regSiteData: regSites
            })
            console.log(this.state.regSiteData, "{...x,...label}");
          }
        }).catch(err => {
          this.setState({ isLoading: false });
          console.log(err);
        });


      //role must not populate if Realwave admin toggle is on
      if (!isAdmin && !isInstaller) {
        this.getRoleOptions(clientName);
      }
    } else {

      if (!isAdmin && !isInstaller) {

        this.setState({
          widgets: [],
          reports: [],
          roleSelected: '',
          roles: []
        });
      }


      this.setState({
        clientSelected: {},
        finalStoreId: [],
        selectedStoreId: [],
        selectedRegion: "",
        selectedRegions: [],
        showTree: false,
        clientName: {}
      });

      // this.resetClientFields();
    }
  }

  adminStatus = async (fieldName, status) => {
    let fieldName2 = fieldName === "isInstaller" ? "isAdmin" : "isInstaller";

    if (!status) this.setState({ emptyArray: true });

    this.setState({ [fieldName]: status, clientName: {}, clientSelected: {}, installerId: '' },
      () => this.handleClient());
    if (status) this.setState({ [fieldName2]: false });

    if (fieldName === "isAdmin") {
      let g = await this.props.dispatch(clientData.request({ action: "get" }));
    } else {
      if (status) {
        let g = await this.props.dispatch(clientDataType.request({
          action: 'clientType',
          clientType: 'installer'
        }));

        this.setState({ clientsList: [] });
      } else {
        this.setState({ roleName: {}})
        let g = await this.props.dispatch(clientData.request({ action: "get" }));
      }
    }

    // this.resetClientFields();

  }

  activeStatus = (status) => {

    this.setState({
      activeStatus: status
    }, () => {
      console.log(this.state.activeStatus, status);
    })
  }
  emailStatus = (status) => {

    this.setState({
      emailNotif: status
    }, () => {
      console.log(this.state.emailNotif, status);
    })
  }

  smsStatus = (status) => {

    this.setState({
      smsStatus: status
    }, () => {
      console.log(this.state.smsStatus, status);
    })
  }
  selectedKeys = async (data) => {
    console.log(data)
  }

  render() {
    let { initialValues } = this.props;
    console.log('userProfileuserProfile', this.state.imagePreviewUrl)
    console.log(this.props);
    let init = {}
    let { firstName, lastName } = initialValues || { firstName: '' };
    const { Status } = consts;
    let options = [
      { value: Status.Active, label: Status.Active },
      { value: Status.Inactive, label: Status.Inactive }
    ];
    //  console.log(initialValues);
    if (typeof (initialValues) == "object") {
      init = initialValues
      init.roleId = ""
    }
    console.log(init);
    let initialValuesEdit = this.isUpdate ? init : {
      email: "",
      firstName: "",
      // gender: "",
      lastName: "",
      password: "",
      status: "",
      storeId: "",
      clientId: "",
      userRole: "",
      roleId: "",
      file: "",
      activeStatus: "Active",
      emailNotif: false,
      smsStatus: false,
    };
    let { combos, roles, selectedOption, rolesErr, clientSelected, roleSelected, regSiteData, imagePreviewUrl, widgets, UserStatus, onlyTreeId, reports, storeId, showRegionTree, selectedRegion, showTree, treeData, widRepo, smsStatus, activeStatus, emailNotif, selectedStoreId, userProfile, regionDropDown, selectedRegions, clientsList, isAdmin, isInstaller, InstallerClients, InstallerCreateClients, installerId, clientHit, installerHit, isLoading, loggedInAdmin, loggedInInstaller } = this.state;


    if (!clientHit && !isInstaller) {
      this.setState({ clientHit: true })
      this.props.dispatch(clientData.request({ action: "get" }));
    }
    if (!installerHit && !isInstaller) {
      this.setState({ installerHit: true });
      
      this.props.dispatch(clientDataType.request({
        action: "clientType",
        clientType: "installer"
      }));
    }

    let { store, client, role } = combos || {};
    //let clientDisabled = roleSelected && roleSelected.label == 'Admin' || false;
    let imagePreview = null, loggedUser = utils.getLoggedUser();
    let clientDisabled = roleSelected && roleSelected.value == utils.adminRoleId || loggedUser && loggedUser.clientId || false;
    let isAdminRole = loggedUser && (loggedUser.roleId._id === utils.adminRoleId || loggedUser.roleId._id === utils.clientAdminRoleId) || false;
    let isShowField = isAdminRole || !this.isUpdate;
    if (imagePreviewUrl) {
      imagePreview = (<img src={imagePreviewUrl} alt="" />);
    }
    if (role && role.length > 0 && loggedUser && loggedUser.roleId.name === 'Client - Admin') {
      role = role.filter((item) => item.DisplayValue != 'Admin');
    }
    return (
      <div className="animated fadeIn">
        <Formik
          enableReinitialize={true}
          initialValues={initialValuesEdit}
          onSubmit={this.onSave}
          setError={(err) => console.log(err)}
          validationSchema={() => {
            let validation = {
              firstName: Yup.string().trim().required('Required'),
              lastName: Yup.string().trim().required('Required'),
              // gender: Yup.string().trim().required('Required'),
              // status: Yup.string().trim().required('Required'),
              // roleId: Yup.string().trim().required('Required'),
              email: Yup.string().email().trim().required('Required'),
              mobile: Yup.string().matches(regex.tenDigitNumberValidation, 'Please Enter 10 digit number').required('Required')
              // mobile: Yup.string().matches(regex.mobileValidation, 'Phone number is not valid').required()
            }
            if (!this.isUpdate) {
              validation.password = Yup.string().matches(regex.passwordValidation, 'Password should contain 8 characters, one uppercase,one lower case letter,one number and one special character').required();
            }
            if (isShowField) {
              validation.clientId = Yup.string().nullable().when('roleId', {
                is: (value) => {
                  return value === null && !clientDisabled ? true : value ? value.label === "Client - Admin" || value.label === "User" : false;
                },
                then: Yup.string().required('Required'),
                otherwise: Yup.string()
              })
            }
            return Yup.object().shape(validation);
          }
          }>
          {function (props) {
            const {
              values,
              touched,
              errors,
              isSubmitting,
              handleChange,
              setFieldValue,
              handleBlur,
              handleSubmit
            } = props;
            console.log(props, values);
            let { updateUser, saveUser } = this.props;
            let isFetching = updateUser.isFetching;
            isFetching = isFetching || saveUser.isFetching;
            // let imagePreview = null;
            // if (imagePreviewUrl) {
            //   imagePreview = (<img src={imagePreviewUrl} />);
            // }
            return (
              <Row>
                <LoadingDialog isOpen={isFetching || isLoading} />
                <Col md={12}>
                  <form onSubmit={handleSubmit}>
                    <CardWrapper lg={12} title={this.isUpdate ? ((firstName ? firstName : '') + " " + (lastName ? lastName : '')) : 'Create new user'} footer={
                      <div className={'form-button-group'}>
                        <div><button type="submit" className="btn formButton" title="Save" disabled={isSubmitting}><i className="fa fa-save" aria-hidden="true"></i> Save</button></div>
                        <div> <button type="button" className="btn formButton" title="Cancel" onClick={this.onCancel} disabled={isSubmitting}><i className="fa fa-close" aria-hidden="true"></i> Cancel</button></div>
                        {this.isUpdate && <div> <button type="button" className="btn formButton" onClick={this.onDelete} disabled={isSubmitting}><i className="fa fa-trash" aria-hidden="true"></i> Delete</button></div>}
                        {loggedUser.roleId.isAdminRole && <div> <button type="button" className="btn formButton" title="Reset Password" onClick={() => {this.state.emailId = values.email; this.onresetPassowrd(); }} disabled={isSubmitting} >Reset Password</button> </div>}
                      </div>
                    }>

                      <div className="userFormHeight">
                        <h5>General Information</h5>

                        <div style={{ backgroundColor: "", padding: "12px" }} class="pb-1">
                          <FormGroup row style={{ margin: "0px" }}>
                            <Col xs="5" className="text-field">
                              <Input
                                id="firstName"
                                type="text"
                                value={values.firstName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="form-control text-form"
                                required
                              />
                              <label className="text-label">First Name</label>
                              {errors.firstName && <div className="input-feedback">{errors.firstName}</div>}
                            </Col>
                            <Col xs="3"></Col>
                            <Col xs="1">
                              <p style={{ color: "white" }} >Status </p>
                            </Col>
                            <Col xs="1">
                              <label className="switch">
                                <input type="checkbox" className="toggle"
                                  checked={UserStatus === "Active" ? true : false}
                                  onClick={() => this.changeStatus(UserStatus == "Active" ? "Inactive" : "Active")}
                                  id="isActive"
                                />

                                <span className="slider round"></span>
                              </label>
                            </Col>
                          </FormGroup>

                          <FormGroup row style={{ margin: "0px" }}>
                            <Col xs="5" className="text-field">
                              <Input
                                id="lastName"
                                type="text"
                                value={values.lastName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="form-control text-form"
                                required
                              />
                              {errors.lastName && <div className="input-feedback">{errors.lastName}</div>}
                              {/* <label>Last Name</label> */}
                              <label className="text-label">Last Name</label>
                            </Col>

                            {loggedInAdmin ? <>
                              <Col xs="2"></Col>
                              <Col xs="2">
                                <p class="floatRight" style={{ color: "white" }} >Realwave Admin</p>
                                {/* {errors.status && <div className="input-feedback">{errors.status}</div>} */}
                              </Col>
                              <Col xs="1">
                                <label className="switch">
                                  <input type="checkbox" className="toggle"
                                    checked={isAdmin}
                                    onClick={() => {this.adminStatus("isAdmin", !isAdmin); if (!isAdmin) this.setState({ roleSelected: [], emptyArray: true }) }}
                                    id="isActive"
                                  />
                                  <span className="slider round"></span>
                                </label>
                              </Col> </> : null}

                          </FormGroup>

                          <FormGroup row style={{ margin: "0px" }}>
                            <Col xs="5" className="text-field">
                              <Input
                                id="email"
                                type="text"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="form-control text-form"
                                autoComplete="new-password"
                                required
                                error={errors.email}
                              />
                              <label className="text-label">Email</label>
                              {errors.email && <div className="input-feedback">{errors.email}</div>}
                            </Col>
                            <Col xs="2">
                              <p style={{ color: "white" }} >Enable Email Notification</p>
                            </Col>
                            <Col xs="1">
                              {/* <Input className="sms-Checkbox" type="checkbox" checked={values.isSMSEnable} onClick={(option) => setFieldValue("isSMSEnable", option ? option.target.checked : "")} id="isSMSEnable" /> */}
                              <label class="switch">
                                <input type="checkbox" className="toggle"
                                  checked={values.isEmailNotificationEnabled ? true : false}
                                  onClick={(option) => setFieldValue("isEmailNotificationEnabled", values.isEmailNotificationEnabled ? false : true)}
                                  id="isActive"
                                />
                                <span className="slider round"></span>
                              </label>
                            </Col>
                            {loggedInInstaller || loggedInAdmin ? <>   
                              <Col xs="0" ></Col>                           
                              <Col xs="1">
                                <p class="floatRight" style={{ color: "white", paddingRight: "10px" }} >Installer Admin</p>
                              </Col>
                              <Col xs="1" >
                                <label className="switch">
                                  <input type="checkbox" className="toggle"
                                    checked={isInstaller}
                                    onClick={() => {this.adminStatus("isInstaller", !isInstaller); if(!isInstaller) this.setState({ roleSelected: [], emptyArray: true }) }}

                                    id="isActive"
                                  />
                                  <span className="slider round"></span>
                                </label>
                              </Col> </> : null}
                          </FormGroup>

                          {!this.isUpdate && <FormGroup row style={{ margin: "0px" }}>
                            <Col xs="5" className="text-field">
                              <Input
                                id="password"
                                type="password"
                                value={values.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="form-control text-form"
                                autoComplete="new-password"
                                required
                              />
                              {/* {errors.password && <div className="input-feedback">{errors.password}</div>} */}
                              <label className="text-label">Password</label>
                            </Col>
                          </FormGroup>}

                          <FormGroup row style={{ margin: "0px" }}>
                            <Col xs="5" className="text-field">
                              <Input
                                id="mobile"
                                type="text"
                                value={values.mobile}
                                // onChange={handleChange}
                                onChange={e => this.NumberOnly(e, handleChange, e.target.value)}
                                onBlur={handleBlur}
                                className="form-control text-form"
                                required
                              />
                              {errors.mobile && <div className="input-feedback">{errors.mobile}</div>}
                              <label className="text-label">Phone Number</label>
                            </Col>
                            <Col xs="2">
                              <p style={{ color: "white" }} >Enable Phone SMS Notification</p>
                            </Col>
                            <Col xs="1">
                              {/* <Input className="sms-Checkbox" type="checkbox" checked={values.isSMSEnable} onClick={(option) => setFieldValue("isSMSEnable", option ? option.target.checked : "")} id="isSMSEnable" /> */}
                              <label class="switch">

                                <input type="checkbox" className="toggle"
                                  checked={values.isSMSEnable ? true : false}
                                  onClick={(option) => setFieldValue("isSMSEnable", values.isSMSEnable ? false : true)}
                                  id="isSMSEnable"
                                />
                                <span class="slider round"></span>
                              </label>

                            </Col>
                          </FormGroup>

                          <FormGroup row style={{ margin: "0px 0px 15px" }}>
                            <Col xs="2" >
                              <label htmlFor="file" className="custom-file-upload choose-file"><i className="fa fa-file" aria-hidden="true"></i> Profile Picture</label>
                              <input name="file" className="profile" value={values.file} id="file" type="file" onChange={
                                (e) => {
                                  var file = e.target.files[0];
                                  setFieldValue("userProfile", file.name);
                                  this.handleImageChange(e);
                                }
                              }
                              />
                            </Col>
                            <Col xs="3">
                              {imagePreview ?
                                <div className="imgPreview">
                                  {imagePreview}
                                </div> : <i className="fa fa-camera fa-2x"></i>
                              }
                            </Col>
                          </FormGroup>
                          <FormGroup row className="mb-0">
                            <Col xs="6">
                              <label htmlFor="fileInfo" style={{ color: "red" }}>Note - Only PNG and JPEG/JPG are allowed and size must be 1 MB or below.</label>
                            </Col>
                          </FormGroup>
                        </div>

                        <h5>User Privilege</h5>
                        <div style={{ padding: "12px" }}>

                          {/* ============================================================================================= */}
                          <div className='row'>

                            <div className='col-lg-5 pr-0 mr-0 pt-1  hiddenOverflow'>
                              {isInstaller ? <FormGroup col >

                                <Col xs="12" className="text-field mb-3">
                                  <Select
                                    isClearable={true}
                                    onChange={(option) => this.installerChange(option)}
                                    value={InstallerClients ? InstallerClients.find(option => option.value === installerId) : '' }
                                    options={ isInstaller && (loggedUser.clientId === null ? false : loggedUser.clientId.clientType === "installer") ? InstallerCreateClients : InstallerClients }
                                    placeholder="Select Installer"
                                    class="form-control custom-select "
                                    styles={colourStyles}
                                  />
                                  <label class="fixed-label" for="userName">Installer</label>
                                </Col>

                              </FormGroup> : null}

                              <FormGroup col >
                                <Col sm={12} className="text-field mb-3">
                                  <Select class="form-control custom-select" required
                                    id="clientId"
                                    isClearable={true}
                                    value={clientSelected || ''}
                                    isDisabled={clientDisabled}
                                    onChange={this.handleClientChange.bind(this, setFieldValue)}
                                    options={utils.selectOptionGenerator(clientsList, 'name', '_id')}
                                    styles={colourStyles}
                                  />
                                  <label class="fixed-label" for="userName">Clients</label>
                                  {errors.clientId && <div className="input-feedback">{errors.clientId}</div>}
                                </Col>

                                <Col xs="12" className="text-field" style={{ backgroundColor: "white", minHeight: "35px", padding: "6px" }}>


                                  {selectedStoreId && selectedStoreId.map(x => {
                                    console.log(x);
                                    return <>
                                      <Badge color="secondary" style={{ padding: "6px", margin: "2px" }}>{x.name}&nbsp;
                                     {isAdmin || isInstaller ? <span className="badgeCross pointer" onClick={() => this.deleteRegSite(x._id)}>X</span> : null}
                                      </Badge>
                                    </>
                                  })}
                                  <label class="fixed-label" style={{ margin: "-4px 0px" }} for="userName">Sites</label>


                                </Col>

                              </FormGroup>

                              <FormGroup col className="m-0 mb-2">
                                <Col xs="12">
                                  {!showTree ? null : <TreeStructure
                                    getStoreData={this.getStoreData}
                                    selectedKeys={onlyTreeId}
                                    treeData={treeData.treeData}
                                  />}
                                </Col>
                              </FormGroup>

                              {/* <Col xs="5" className="text-field"> */}
                              {/* {regSiteData &&
                                  // <RegionSelect region={regSiteData} selectReg={this.selectRegionSites}/>
                                  <>
                                  <Select class="form-control custom-select"
                                id="finalStoreId"
                                isClearable={true}
                                value={regionDropDown}
                                styles={colourStyles}
                                onChange={(value)=>this.selectRegionSites(value)}
                                // options={utils.selectOptionGenerator(role)}
                                options={regSiteData}

                              /><label className="fixed-label">Region</label></>
                              } */}
                              {/* </Col> */}
                            </div>

                            <div className='col-lg-5 pr-0 mr-0 pt-1 hiddenOverflow'>
                              <FormGroup col >
                                <Col xs="12" className="text-field ml-1  mb-3">
                                  <Select class="form-control custom-select"
                                    id="roleId"
                                    isClearable={true}
                                    isDisabled={isAdmin}
                                    value={roleSelected || ''}
                                    onChange={this.handleRoleChange.bind(this, setFieldValue)}
                                    options={roles}
                                    styles={colourStyles}
                                  />
                                  <label class="fixed-label" for="userName">Role</label>
                                  {rolesErr ? <div className="input-feedback">{rolesErr}</div> : <></>}
                                </Col>

                                <Col xs="12" className="text-field ml-2  mb-3"
                                  style={{ backgroundColor: "white", minHeight: "35px", padding: "6px" }}
                                >


                                  <label class="fixed-label" style={{ margin: "-4px 0px" }} for="userName">Widgets</label>
                                  {
                                    widgets && widgets.map(x => {
                                      return <>
                                        <Badge key={x._id} color="secondary" style={{ padding: "6px", margin: "2px" }}>{x.name}&nbsp;
                                    <span className="badgeCross pointer" onClick={() => this.deleteWidgets(x._id)}>X</span></Badge> &nbsp;
                                     </>
                                    })
                                  }
                                  {widRepo && widgets.length == 0 ? <Badge style={{ color: "red" }}> No Data </Badge> : <></>}
                                </Col>

                              </FormGroup>


                              <FormGroup col >


                                <Col xs="12" className="text-field ml-2  mb-3"
                                  style={{ backgroundColor: "white", minHeight: "35px", padding: "6px" }}
                                >
                                  <label class="fixed-label" style={{ margin: "-4px 0px" }} for="userName">Reports</label>
                                  <label class="fixed-label" style={{ margin: "-4px 0px" }} for="userName">Reports</label>
                                  {
                                    reports && reports.map((x, index) => {
                                      return <>
                                        <Badge style={{ padding: "6px", margin: "2px" }} key={x._id} color="secondary">{x.name}&nbsp;
                                    <span className="badgeCross pointer" onClick={() => this.deleteReports(x._id)}>X</span></Badge> &nbsp;
                                  </>
                                    })
                                  }
                                  {widRepo && reports.length == 0 ? <Badge style={{ color: "red" }}> No Data </Badge> : <></>}
                                </Col>

                              </FormGroup>

                            </div>
                          </div>
                          {/* ============================================================================================= */}

                          {/* <FormGroup row className="m-0 mb-2">
                            <Col xs="5" className="text-field">
                              <Select class="form-control custom-select" required
                                id="clientId"
                                isClearable={true}
                                value={clientSelected || ''}
                                isDisabled={clientDisabled}
                                onChange={this.handleClientChange.bind(this, setFieldValue)}
                                options={utils.selectOptionGenerator(clientsList, 'name', '_id')}
                                styles={colourStyles}
                              />
                              <label class="fixed-label" for="userName">Clients</label>
                              {errors.clientId && <div className="input-feedback">{errors.clientId}</div>}
                            </Col>

                            <Col xs="5" className="text-field ml-1">
                              <Select class="form-control custom-select"
                                id="roleId"
                                isClearable={true}
                                isDisabled={isAdmin}
                                value={roleSelected || ''}
                                onChange={this.handleRoleChange.bind(this, setFieldValue)}
                                options={roles}
                                styles={colourStyles}
                              />
                              <label class="fixed-label" for="userName">Role</label>
                              {rolesErr ? <div className="input-feedback">{rolesErr}</div> : <></>}
                            </Col>
                          </FormGroup>

                          <FormGroup row className="m-0 mb-2">
                            <Col xs="5" className="text-field" style={{ backgroundColor: "white", minHeight: "35px", padding: "6px" }}>

                              {selectedStoreId && selectedStoreId.map(x => {
                                console.log(x);
                                return <>
                                  <Badge color="secondary" style={{ padding: "6px", margin: "2px" }}>{x.name}&nbsp;
                                  {isAdmin ? <span className="badgeCross pointer" onClick={() => this.deleteRegSite(x._id)}>X</span> : null}
                                  </Badge>
                                </>
                              })}
                              <label class="fixed-label" style={{ margin: "-4px 0px" }} for="userName">Sites</label>
                            </Col>

                            <Col xs="5" className="text-field ml-2" style={{ backgroundColor: "white", minHeight: "35px", padding: "6px" }}>

                              <label class="fixed-label" style={{ margin: "-4px 0px" }} for="userName">Widgets</label>
                              {
                                widgets && widgets.map(x => {
                                  return <>
                                    <Badge key={x._id} color="secondary" style={{ padding: "6px", margin: "2px" }}>{x.name}&nbsp;
                                    <span className="badgeCross pointer" onClick={() => this.deleteWidgets(x._id)}>X</span></Badge> &nbsp;
                                  </>
                                })
                              }
                              {widRepo && widgets.length == 0 ? <Badge style={{ color: "red" }}> No Data </Badge> : <></>}
                            </Col>
                            <br />

                          </FormGroup>
                          
                          <FormGroup row className="m-0 mb-2">
                            <Col xs="5" className="text-field"> */}


                          {/* {regSiteData &&
                                // <RegionSelect region={regSiteData} selectReg={this.selectRegionSites}/>
                                <>
                                  <Select class="form-control custom-select"
                                    id="finalStoreId"
                                    isClearable={true}
                                    value={regionDropDown}
                                    onChange={(value) => this.selectRegionSites(value)}
                                    // options={utils.selectOptionGenerator(regSiteData)}
                                    options={regSiteData}
                                    styles={colourStyles}

                                  // isMulti={true}
                                  /><label className="fixed-label">Region</label></>
                              } */}
                          {/* </Col>
                            <Col xs="5" className="text-field ml-2" style={{ backgroundColor: "white", minHeight: "35px", padding: "6px" }}>

                              <label class="fixed-label" style={{ margin: "-4px 0px" }} for="userName">Reports</label>
                              {
                                reports && reports.map((x, index) => {
                                  return <>
                                    <Badge style={{ padding: "6px", margin: "2px" }} key={x._id} color="secondary">{x.name}&nbsp;
                                    <span className="badgeCross pointer" onClick={() => this.deleteReports(x._id)}>X</span></Badge> &nbsp;
                                  </>
                                })
                              }
                              {widRepo && reports.length == 0 ? <Badge style={{ color: "red" }}> No Data </Badge> : <></>}
                            </Col>
                          </FormGroup>
                          <FormGroup row style={{ margin: "0px" }}>
                            <Col xs="5">
                             
                               
                                {!showTree ? null : <TreeStructure
                                  getStoreData={this.getStoreData}
                                  selectedKeys={onlyTreeId}
                                  treeData={treeData.treeData}
                                />}
                              </>
                            </Col>
                          </FormGroup> */}
                        </div>
                      </div>
                    </CardWrapper>
                  </form>
                </Col>
              </Row>
            );
          }.bind(this)}
        </Formik>
      </div >
    );
  }
}

UserForm.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    initialValues: state.userData.data || {},
    saveUser: state.saveUser,
    userData: state.userData,
    updateUser: state.updateUser,
    deleteUser: state.deleteUser,
    getCombos: state.getCombos,
    storesData: state.storesData,
    storeChange: state.storeChange,
    roleListUser: state.roleListUser,
    clientRegionStore: state.clientRegionStore,
    clientData: state.clientData,
    clientDataType: state.clientDataType
  };
}

var UserFormModule = connect(mapStateToProps)(UserForm);
export default UserFormModule;
