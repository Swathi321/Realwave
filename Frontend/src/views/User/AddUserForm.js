import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Label, Row, Col, Input, Badge } from 'reactstrap';
import utils from './../../Util/Util';
import { connect } from 'react-redux';
import CardWrapper from './../../component/CardWrapper';
import * as Yup from 'yup';
import { deleteUser, getCombos, storesData, saveActivityLog, clientData, clientDataType } from './../../redux/actions/httpRequest';
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
class AddUserForm extends Component {
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
      clientName: '',
      roleName: '',
      file: '',
      modalIsOpen: false,
      widRepo: false,
      widgets: [],
      reports: [],
      showTree: false,
      treeData: [],
      widgetReport: [],
      mobile: "",
      activeStatus: "Active",
      emailNotif: false,
      smsStatus: false,
      emailErr: "",
      storeFile: "",
      firstName: "",
      email: "",
      password: "",
      dataSaved: false,
      regData: [],
      // keyword:"",
      regSiteData: [],
      selectedRegions: [],
      regionDropDown: {},
      onlyTreeId: [],
      selectedStoreId: [],
      dropDownCheckedKeys: [],
      clientsList: [],
      isAdmin: false,
      isInstaller: false,

      formErrors: {
        firstName: null,
        email: null,
        password: null, finalStoreId: []
      }

    }
    this.isUpdate = this.props.match.params.id !== "0";
    this.onSave = this.onSave.bind(this);
  }

  async componentDidMount() {
    // if (this.props.match.params.id !== "0") {
    //   this.props.dispatch(userData.request({ action: 'load', id: this.props.match.params.id }, this.props.match.params.id));
    // }
    // this.props.dispatch(getCombos.request({ combos: "store,client,role" }));

    let clientList = await this.props.dispatch(clientData.request({ action: "get" }));
    let g = await this.props.dispatch(getCombos.request({ combos: "store,client,role" }));

    
    let loggedUser = utils.getLoggedUser();

    if (loggedUser.clientId !== null) {
      if (loggedUser.clientId.clientType === "installer") {
        let g = await this.props.dispatch(clientData.request({ action: "find" }, loggedUser.clientId._id, null, (res) => {this.setState({InstallerCreateClients: [{label: res.name, value: res._id}]})}));
      }
    }

  }

  componentWillReceiveProps(nextProps) {

    if (Object.keys(nextProps.initialValues).length > 0 && nextProps.initialValues.storeId && nextProps.initialValues.storeId.length > 0 && nextProps.getCombos.data && nextProps.getCombos.data.store) {
      this.setState({ selectedOption: utils.selectOption(nextProps.getCombos.data.store, nextProps.initialValues.storeId) })
    }

    if (nextProps.clientData && nextProps.clientData.data && nextProps.clientData.data.data && nextProps.clientData.data.data.length) {
      let { data, isFetching, error } = nextProps.clientData;
      if (!isFetching) {
        if (!error && data) {
          this.setState({ clientsList: data.data })
        }
      }
    }

    if (nextProps.clientDataType && nextProps.clientDataType.data && nextProps.clientDataType.data.data && nextProps.clientDataType.data.data.length) {

      nextProps.clientDataType.data.data.map(element => {
        element.label = element.name;
        element.value = element._id;
      });

      this.setState({ InstallerClients: nextProps.clientDataType.data.data })
    }

    if (Object.keys(nextProps.initialValues).length > 0 && nextProps.initialValues.clientId && nextProps.initialValues.clientId.length > 0 && nextProps.getCombos.data && nextProps.getCombos.data.client) {
      this.setState({ clientSelected: utils.selectOption(nextProps.getCombos.data.client, nextProps.initialValues.clientId) })
    } else if (nextProps.getCombos.data && nextProps.getCombos.data.client) {
      if (utils.user && utils.user.clientId) {
        this.setState({ clientSelected: utils.selectOption(nextProps.getCombos.data.client, utils.user.clientId._id) })
      }
    }

    if (Object.keys(nextProps.initialValues).length > 0 && nextProps.initialValues.roleId && nextProps.initialValues.roleId.length > 0 && nextProps.getCombos.data && nextProps.getCombos.data.role) {
      this.setState({ roleSelected: utils.selectOption(nextProps.getCombos.data.role, nextProps.initialValues.roleId) })
    }

    if (Object.keys(nextProps.initialValues).length > 0 && nextProps.initialValues.roleId && Object.keys(nextProps.initialValues.roleId).length > 0 && nextProps.getCombos.data && nextProps.getCombos.data.role) {
      this.setState({ roleSelected: utils.selectOption(nextProps.getCombos.data.role, nextProps.initialValues.roleId._id) })
    }
    if (Object.keys(nextProps.initialValues).length > 0 && nextProps.initialValues.storeId) {
      console.log(this.state.selectedStoreId, this.state.onlyTreeId)
      let data = []

      if (nextProps.initialValues.storeId.length > 0) {
        nextProps.initialValues.storeId.forEach(x => {
          data.push(x._id)
        })
        console.log(data);

        this.setState({
          selectedStoreId: nextProps.initialValues.storeId,
          onlyTreeId: data
        })
      }
      else {

        this.setState({ selectedStoreId: [] })
      }
    }
    if (Object.keys(nextProps.initialValues).length > 0 && nextProps.initialValues.storeId) {

      console.log(this.state.selectedStoreId)
      this.setState({ selectedStoreId: nextProps.initialValues.storeId })
    }
    if (Object.keys(nextProps.initialValues).length > 0) {
      this.setState({
        reports: nextProps.initialValues.reportsAllowed,
        widgets: nextProps.initialValues.widgetsAllowed
      })
    }
    if (Object.keys(nextProps.initialValues).length > 0) {
      console.log(this.state.clientName);
      if (this.state.clientName) {
        console.log(this.state.treeData.status);
        if (!this.state.treeData.status) {
          console.log("ll");
          if (!this.state.dataSaved) {

            // if (this.state.clientSelected.value != this.state.LastClientSelectedd) {
            // this.setState({ LastClientSelectedd: this.state.clientSelected.value });
            // this.handleClientChange(null, this.state.clientName)
            this.handleClient(this.state.clientName)
          }
        }
      }
      // this.setState({ treeData: nextProps.initialValues.storeId })
    }

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

    // if ((nextProps.updateUser && nextProps.updateUser !== this.props.updateUser)) {
    //   let { data, isFetching, error } = nextProps.updateUser;
    //   if (!isFetching) {
    //     if (error || data && data.errmsg) {
    //       swal({ title: "Error", text: error || data.errmsg, icon: "error", });
    //       return;
    //     }
    //     if (data.message) {
    //       swal({
    //         title: utils.getAlertBoxTitle(data.success),
    //         text: data.message,
    //         icon: utils.getAlertBoxIcon(data.success)
    //       }).then(function () {
    //         this.updateStore();
    //       }.bind(this));
    //     }
    //   }
    // }

    if ((nextProps.userData && nextProps.userData !== this.props.userData)) {
      let { data, isFetching, error } = nextProps.userData;
      if (!isFetching) {
        if (error || data && data.errmsg) {
          swal({ title: "Error", text: error || data.errmsg, icon: "error", });
          return;
        }
      }
    }

    if ((nextProps.deleteUser && nextProps.deleteUser !== this.props.deleteUser)) {
      let { data, isFetching, error } = nextProps.deleteUser;
      if (!isFetching) {
        this.setState({ isLoading: false });
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

  updateStore() {
    this.props.dispatch(storesData.request({ stores: [] }));
  }

   
  NumberOnly = (e) => {
    let numValue = e.target.value.replace(/\D/g, '');
    e.target.value = numValue;
    this.handleChange(e)
  }

  onSave(e) {


    e.preventDefault()
    // console.log("gg");
    let { email,
      firstName,
      lastName,
      password,
      clientName,
      roleName,
      file,
      permissions,
      widgetId,
      reportId,
      treeData,
      mobile,
      storeFile, mobileErr,
      widgets, imagePreviewUrl,
      reports, activeStatus, emailNotif,
      isAdmin,
      isInstaller, installerId,
      smsStatus, emailErr, finalStoreId } = this.state

    let roleValue = null
    if (roleName && roleName.data) {
      roleValue = roleName.data._id
     
    }

    if (!roleValue && isInstaller) {
      swal({ title: "Error", text: "Please select Installer Role to create Installer type user.", icon: "error" });
      return

    } else {
      let reqBody = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        displayPicture: file,
        status: activeStatus,
        isEmailNotificationEnabled: emailNotif,
        roleId: isAdmin ? null : roleValue,
        widgetsAllowed: widgets,
        reportsAllowed: reports,
        storeId: finalStoreId,
        clientId: isAdmin && !isInstaller ? null : !isAdmin && isInstaller ? installerId : clientName.value,
        secretKey: "",
        secretKeyUsed: true,
        secretKeyGeneratedAt: "",
        userProfile: "",
        theme: "",
        mobile: mobile,
        isSMSEnable: smsStatus
      }

      // let isAdmin1 = isAdmin ? "true" : "false";
      // let isInstaller1 = isInstaller ? "true" : "false";

      let emailValidation = this.EmailCheck(email)
      console.log(emailValidation, reqBody);
      if (email) {
        if (!emailValidation) {
          this.setState({
            emailErr: "Please Enter Valid Email"
          })
        } else {
          this.setState({
            emailErr: ""
          })
        }
      }
      if (mobile.length != 10) {
        this.setState({
          mobileErr: "Please Enter 10 digit number"
        })
      } else {
        this.setState({
          mobileErr: ""
        })
      }
      if (emailValidation && mobileErr == "") {
        console.log(reqBody);
        var bodyFormdata = new FormData()
        bodyFormdata.append('action', 'save')
        bodyFormdata.append('data', JSON.stringify(reqBody))
        bodyFormdata.append('isAdmin', JSON.stringify(isAdmin))
        bodyFormdata.append('isInstaller', JSON.stringify(isInstaller))
        if (file) {
          console.log("happy");
          bodyFormdata.append('userForm', true)
          bodyFormdata.append('file', storeFile)
        }
        console.log(bodyFormdata);
        instance.post(`${api.SAVE_USER}`, bodyFormdata)
          .then(res => {
            console.log(res);
            if (res.data.message) {

              this.setState({ dataSaved: true })
              swal({
                title: "User Status",
                text: res.data.message,
                icon: "success"
              }).then(function () {
                // this.updateStore();
                this.props.history.push(`/admin/users`)
              }.bind(this));
            }
            let message = "";
            console.log(typeof (res.data.errmsg.message), typeof (res.data.errmsg));
            if (typeof (res.data.errmsg) == "object") {
              swal({
                title: "User Status",
                text: res.data.errmsg.message,
                icon: "warning",
                showCancelButton: false,
                showConfirmButton: true,
              }).then(function () {
                // this.updateStore();
                // this.props.history.push(`/admin/users`)
              }.bind(this));
            }
            if (typeof (res.data.errmsg) == "string") {
              swal({
                title: "User Status",
                text: res.data.errmsg,
                icon: "warning",
                showCancelButton: false,
                showConfirmButton: true,
              }).then(function () {
                // this.updateStore();
                // this.props.history.push(`/admin/users`)
              }.bind(this));
            }

          }).catch(err => {
            console.log(err);
          })
      }
    }
  }

  onCancel = () => {
    this.context.router.history.goBack(-1);
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
        this.setState({ isLoading: true });
        let loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Delete + ' - ' + user);
        this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
        this.props.dispatch(deleteUser.request({ action: 'delete' }, id))
      }
    }.bind(this));
  }

  getInitialValueTemplate() {
    return {
      email: "",
      firstName: "",
      gender: "",
      lastName: "",
      password: "",
      status: "",
      storeId: [],
      clientId: "",
      userRole: "",
      roleId: "",
      file: "",
      permissions: "",
      widgetId: "",
      reportId: "",
      treeData: "",
      reportsAllowed: "",
      widgetsAllowed: "",
      activeStatus: "Active",
      roles: [],
      mobileErr: ""
    }
  }

  selectedKeys = async (data) => {
    console.log(data)
  }
  getOption(item) {
    return (<option value={item.LookupId}>{item.DisplayValue}</option>)
  }

  // handleChange = (selectedOption) => {
  //   this.setState({ selectedOption });
  // }
  // handleClientChange = (setFieldValue, clientSelected) => {
  //   setFieldValue('clientId', clientSelected || '')
  //   this.setState({ clientSelected });
  // }
  // handleClientChange = (setFieldValue, clientName) => {
  //   setFieldValue('clientId', clientName || '')
  //   if (this.state.clientName && this.state.clientName.value && clientName && clientName.value) {
  //     if (this.state.clientName.value != clientName.value) {
  //       this.setState({
  //         roleName: {},
  //         reports: [],
  //         widgets: []
  //       })
  //     }
  //   }

  //   if (clientName) {
  //     this.setState({ clientName });
  //     // console.log(clientSelected, "@@@@@@@@@@@@@@@@@@@@@@");
  //     // this.props.dispatch(clientRegionStore.request(undefined,clientSelected.value))
  //     instance.post(`${api.CLIENT_REGION_STORE}/${clientName.value}`)
  //       .then(res => {
  //         console.log(res);
  //         if (res.data.clientRegionResut) {
  //           this.setState({
  //             treeData: res.data.clientRegionResut
  //           })

  //         }
  //       }).catch(err => {
  //         // console.log(err);
  //       })
  //   }
  // }

  // handleRoleChange = (setFieldValue, roleSelected) => {
  //   setFieldValue('roleId', roleSelected || '')
  //   setFieldValue('clientId', '');
  //   this.setState({ roleSelected, clientSelected: '' });
  // }

  // showRegionTree = () => {
  //   this.setState({
  //     showTree: true
  //   })
  // }
  deleteReports = async (id) => {
    let data = this.state.reports
    // console.log(id);
    data = await data.filter(x => {
      console.log(x._id, id);
      return x._id != id
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
      return x._id != id
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

  handleImageChange(e) {
    e.preventDefault();
    console.log(e);

    let reader = new FileReader();
    if (e.target.files.length > 0) {
      console.log(e.target.files);
      let file = e.target.files[0];
      console.log(e.target.files, file);
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
          file: file.name,
          imagePreviewUrl: reader.result,
          storeFile: file
        }, () => {
          // console.log(reader.result);
        });
      }
      reader.readAsDataURL(file)
    }
  }

  installerChange = async option => {

    let installerID = option ? option.value : '';

    // this.handleClient(option ? option.value : '')

    var gg = await this.props.dispatch(clientData.request({
      action: 'installer',
      installerId: installerID
    }));

    this.setState({ installerId: installerID, roleName: {}, clientName: {}, finalStoreId: [], selectedStoreId: [] },
      () => this.getRoleOptions(option, 'installer'));


  }

  openModal = (file) => {
    this.targetFileName = file.name;
    this.setState({ modalIsOpen: true });
  }

  closeModal = () => {
    this.setState({ modalIsOpen: false });
  }
  handleChange = (e) => {
    // console.log(e.target.name,e.target.val);
    this.setState({
      [e.target.name]: e.target.value

    })
    if (e.target.name == "email") {
      let emailValidation = this.EmailCheck(e.target.value)
      console.log(emailValidation);
      if (!emailValidation) {
        this.setState({
          emailErr: "Please Enter Valid Email"
        })
      } else {
        this.setState({
          emailErr: ""
        })
      }
    }

    if (e.target.name == "mobile") {
      // let mobileValidation=this.mobileCheck(e.target.value)
      // console.log(mobileValidation);
      if (e.target.value.length != 10) {
        this.setState({
          mobileErr: "Please Enter 10 digit number"
        })
      } else {
        this.setState({
          mobileErr: ""
        })
      }
    }
    const { formErrors } = this.state;

  }

  EmailCheck = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  getRoleOptions = async (clientName, from) => {

    const { isInstaller, roleName, clientId } = this.state;


    if (clientName && clientName.value) {
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

          this.setState({ isLoading: false });
          console.log(res);
          let data = []
          if (res.data.data && res.data.data.length) {
            if (res.data.data.length > 0) {
              await res.data.data.forEach(x => {
                let label = { label: x.name }
                let val = { data: x }
                data.push({ ...val, ...label })
              })

              this.setState({
                roles: data,
                rolesErr: "",
                roleName: {}
              }, () => {
                if(data.length===1 && (clientId || from==="installer")){
                  this.handleRole(data[0]);
                }
              });

             
            }
          }
          if (res.data.errmsg || (isInstaller && !res.data.data.length)) {
            if (isInstaller) res.data.errmsg = "No Roles Found for this Client";
            this.setState({
              rolesErr: res.data.errmsg,
              roles: [],
              roleName: isInstaller ? '' : roleName
            })
          }


        }).catch(err => {
          console.log(err);
          this.setState({ isLoading: false });
        });
    }else{
      this.setState({ roleName: {} })
    }
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
  handleRole = roleName => {
    console.log(roleName);
    this.setState({ roleName });

    if (roleName) {
      this.setState({ isLoading: true });
      let data = {
        "populate": [
          "permissions.widgetId",
          "permissions.reportId"
        ]
      }
      // this.props.dispatch(roleListUser.request( data,roleSelected.value))
      instance.post(`${api.ROLE_LIST_USER}/${roleName.data._id}`, data)
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
              widRepo: true
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
        })
    }

  }

  resetClientFields = () => {
    this.setState({
      clientSelected: {},
      finalStoreId: [],
      selectedStoreId: [],
      selectedRegion: "",
      selectedRegions: [],
      widgets: [],
      reports: [],
      roleName: null,
      roles: [],
      showTree: false,
      clientName: {}
    });
  }
  adminStatus = async (fieldName, status) => {
    let fieldName2 = fieldName === "isInstaller" ? "isAdmin" : "isInstaller";

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

  // getStoreData=async (data)=>{
  //   console.log(data,this.state.regData);
  //   let gop=[]
  //   let sitesData=this.state.regData
  //   await sitesData.forEach(x=>{
  //      data.forEach(y=>{
  //        if(x.storeId==y){
  //          console.log("Hi");
  //          gop.push(x.storeId)
  //        }
  //      })
  //   })
  //   this.setState({
  //     finalStoreId:gop
  //   })
  // }

  getStoreData = async (data) => {

    const { isInstaller, isAdmin, regData, selectedStoreId } = this.state;

    //  let selectedStoreId = this.state.selectedStoreId;
    let gop = [];

    console.log(data, regData);
    // gop.findIndex(item => item===ob._id) === -1 &&
    if ((isAdmin || isInstaller) && selectedStoreId.length) selectedStoreId.map(ob => gop.push(ob._id))

    let SelectedSites = (isAdmin || isInstaller) ? selectedStoreId : []
    let sitesData = regData;

    await sitesData.forEach(x => {
      data.forEach(y => {

        // let SIndex = selectedStoreId.findIndex(store=> x.storeId==store._id);

        if (x.storeId === y) {
          console.log("Hi");
          gop.findIndex(item => item === x.storeId) == -1 && gop.push(x.storeId);
          // if(SIndex==-1)  
          SelectedSites.findIndex(item => item._id === x.storeId) == -1 && SelectedSites.push({ _id: x.storeId, name: x.storeName });
        }
      })
    })

    this.setState({
      finalStoreId: gop,
      selectedStoreId: SelectedSites
    }, () => {
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
        this.state.regData = data2
      }
    })
    console.log(this.state.regSiteData, this.state.regData);

    // this.state.regSiteData=[...this.state.regSiteData,...this.state.regData]
    // console.log(this.state.regSiteData);
    // console.log("");
  }
  // selectRegionSites=(selectedRegions)=>{
  //   console.log(selectedRegions);
  //   this.setState({ selectedRegions:selectedRegions,
  //   regSiteData:this.state.regSiteData},()=>{
  //     console.log(this.state.selectedRegions,this.state.regSiteData);
  //   })
  // }

  selectRegionSites = async (value) => {
    if (value) {

      console.log(value);
      let sites = []
      this.setState({
        regionDropDown: value,
      })
      let v = this.state.selectedStoreId
      // const trigger = (x) => x.name=== value.id;
      // if(!(this.state.selectedStoreId.some(trigger))){
      //   v.push(value)
      //   // v.sitesData
      //   this.setState({
      //     selectedStoreId:v
      //   })
      //   // onlyTreeId
      // }

      let marked = {}
      this.state.regSiteData.some(x => {
        if (x.id === value.id)
          marked = x
        console.log("D");
        return x.id === value.id
      })
      console.log(marked);
      console.log(marked);
      if (marked && marked.items && marked.items.length > 0) {
        this.state.dropDownCheckedKeys.push(marked._id)
        this.filterSyncCheck(marked.items)
        this.setState({
          onlyTreeId: this.state.dropDownCheckedKeys
        }, () => {
          console.log(this.state.onlyTreeId);
          this.showBadges(this.state.onlyTreeId)
        })
      } else if (value.storeId) {
        let data = this.state.dropDownCheckedKeys
        data.push(value.storeId)
        this.setState({
          onlyTreeId: data
        }, () => {
          console.log(this.state.onlyTreeId);
          this.showBadges(this.state.onlyTreeId)

        })
      } else {
        let data = this.state.dropDownCheckedKeys
        data.push(value._id)
        this.setState({
          onlyTreeId: data
        }, () => {
          console.log(this.state.onlyTreeId);
          this.showBadges(this.state.onlyTreeId)

        })
      }

      console.log(this.state.selectedRegions, this.state.selectedStoreId);
      this.callMe(this.state.selectedRegions)
    }
  }
  showBadges = (id) => {
    // this.state
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


  render() {
    let { firstName, lastName, email, password, mobile, combos,
      activeStatus, emailNotif, smsStatus, clientName, roleName, roles, emailErr,
      file, imagePreview, rolesErr, imagePreviewUrl, widgets, reports, showTree, treeData, widRepo, regionDropDown, onlyTreeId, selectedStoreId, clientsList, loggedInInstaller,
      loggedInAdmin, storeId, mobileErr, regSiteData, selectedRegions, isAdmin, isInstaller, InstallerClients, InstallerCreateClients, installerId, isLoading } = this.state

      let loggedUser = utils.getLoggedUser();

    console.log(this.state.combos, "@@@@@@@@");
    let imagePreview1 = null;
    if (imagePreviewUrl) {
      imagePreview1 = (<img src={imagePreviewUrl} alt="" />);
    }
    let { client } = combos || {};
    //  const options = [
    //   { value: 'chocolate', label: 'asdasdS' },
    //   { value: 'strawberry', label: 'Strawberry' },
    //   { value: 'vanilla', label: 'Vanilla' },
    // ];

    return (
      <div className="animated fadeIn">

        <Row>
          <LoadingDialog isOpen={isLoading} />
          <Col md={12}>
            <form autoComplete="off" onSubmit={(e) => this.onSave(e)}>
              <CardWrapper lg={12} title={this.isUpdate ? ((firstName ? firstName : '') + " " + (lastName ? lastName : '')) : 'Create new user'} footer={
                <div className={'form-button-group'}>
                  <div><button type="submit" className="btn formButton" title="Save" ><i className="fa fa-save" aria-hidden="true"></i> Save</button></div>
                  <div> <button type="button" className="btn formButton" title="Cancel" onClick={this.onCancel} ><i className="fa fa-close" aria-hidden="true"></i> Cancel</button></div>
                  {/* {this.isUpdate && <div> <button type="button" className="btn formButton" onClick={this.onDelete} ><i className="fa fa-trash" aria-hidden="true"></i> Delete</button></div>} */}
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
                          value={firstName}
                          name="firstName"
                          onChange={(e) => this.handleChange(e)}
                          className="form-control text-form"
                          required
                        />
                        <label className="text-label">First Name</label>
                      </Col>
                      <Col xs="3"></Col>
                      <Col xs="1">
                        <p class="floatRight" style={{ color: "white" }} >Status</p>
                      </Col>
                      <Col xs="1">
                        <label className="switch">
                          <input type="checkbox" className="toggle"
                            checked={activeStatus === "Active" ? true : false}
                            onClick={() => this.activeStatus(activeStatus == "Active" ? "Inactive" : "Active")}

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
                          value={lastName}
                          name="lastName"
                          onChange={(e) => this.handleChange(e)}
                          className="form-control text-form"
                          required
                        />
                        {/* {errors.lastName && <div className="input-feedback">{errors.lastName}</div>} */}
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
                              onClick={() => this.adminStatus("isAdmin", !isAdmin)}
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
                          value={email}
                          name="email"
                          onChange={(e) => this.handleChange(e)}
                          className="form-control text-form"
                          autoComplete="new-password"
                          required
                        />
                        {/* {errors.lastName && <div className="input-feedback">{errors.lastName}</div>} */}
                        <label className="text-label">Email</label>
                        {emailErr ? <div className="input-feedback">{emailErr}</div> : <></>}

                      </Col>

                      {/* <Col xs="2">
                        <p style={{ color: "white" }} >Enable Email Notification</p>
                      </Col>
                      <Col xs="1">
                        <label class="switch">
                          <input type="checkbox" className="toggle"
                            checked={emailNotif}
                            onClick={() => this.emailStatus(!emailNotif)}
                            id="isActive"
                          />
                          <span className="slider round"></span>
                        </label>
                      </Col> */}

                      {loggedInInstaller || loggedInAdmin ? <>
                        <Col xs="2"></Col>
                        <Col xs="2">
                          <p class="floatRight" style={{ color: "white" }} >Installer Admin</p>
                        </Col>
                        <Col xs="1">
                          <label className="switch">
                            <input type="checkbox" className="toggle"
                              checked={isInstaller}
                              onClick={() => this.adminStatus("isInstaller", !isInstaller)}

                              id="isActive"
                            />
                            <span className="slider round"></span>
                          </label>
                        </Col> </> : null}
                    </FormGroup>

                    <FormGroup row style={{ margin: "0px" }}>
                      <Col xs="5" className="text-field">
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          name="password"
                          onChange={(e) => this.handleChange(e)}
                          className="form-control text-form"
                          autoComplete="new-password"
                          required
                        />
                        {/* {errors.password && <div className="input-feedback">{errors.password}</div>} */}
                        <label className="text-label">Password</label>
                      </Col>

                      <Col xs="2">
                        <p style={{ color: "white" }} >Enable Email Notification</p>
                      </Col>
                      <Col xs="1">
                        <label class="switch">
                          <input type="checkbox" className="toggle"
                            checked={emailNotif}
                            onClick={() => this.emailStatus(!emailNotif)}
                            id="isActive"
                          />
                          <span className="slider round"></span>
                        </label>
                      </Col>
                    </FormGroup>

                    <FormGroup row style={{ margin: "0px" }}>
                      <Col xs="5" className="text-field">
                        <Input
                          id="mobile"
                          type="text"
                          value={mobile}
                          name="mobile"
                          onChange={(e) => this.NumberOnly(e)}
                          className="form-control text-form"
                          required
                        />
                        {/* {errors.mobile && <div className="input-feedback">{errors.mobile}</div>} */}
                        <label className="text-label">Phone Number</label>
                        {mobileErr ? <div className="input-feedback">{mobileErr}</div> : <></>}

                      </Col>
                      <Col xs="2">
                        <p style={{ color: "white" }} >Enable Phone SMS Notification</p>
                      </Col>
                      <Col xs="1">
                        {/* <Input className="sms-Checkbox" type="checkbox" checked={values.isSMSEnable} onClick={(option) => setFieldValue("isSMSEnable", option ? option.target.checked : "")} id="isSMSEnable" /> */}
                        <label class="switch">
                          <input type="checkbox" className="toggle"
                            checked={smsStatus}
                            onClick={() => this.smsStatus(!smsStatus)}
                            id="isActive"
                          />
                          <span class="slider round"></span>
                        </label>

                      </Col>
                    </FormGroup>

                    <FormGroup row style={{ margin: "0px 0px 15px" }}>
                      <Col xs="2" >
                        <label htmlFor="file" className="custom-file-upload choose-file"><i className="fa fa-file" aria-hidden="true"></i> Profile Picture</label>
                        <input name="file" className="profile" id="file" type="file" onChange={
                          (e) => {
                            this.handleImageChange(e);
                          }
                        }
                        />
                      </Col>
                      <Col xs="3">
                        {imagePreview1 ?
                          <div className="imgPreview">
                            {imagePreview1}
                          </div> : <i className="fa fa-camera fa-2x"></i>
                        }
                      </Col>
                    </FormGroup>
                    <FormGroup row className="mb-0">
                      <Col xs="6">
                        <label htmlFor="fileInfo" style={{ color: "red" }}>Note - Only PNG and JPEG/JPG are allowed and size must be 5 MB or below.</label>
                      </Col>
                    </FormGroup>

                  </div>

                  <h5>User privilege</h5>
                  <div style={{ padding: "12px" }}>

                    {/* {isInstaller ? <FormGroup row className="m-0 mb-2">
                      <Col xs="5" className="text-field">
                        <Select
                          isClearable={true}
                          onChange={(option) => this.installerChange(option)}
                          value={InstallerClients ? InstallerClients.find(option => option.value === installerId) : ''}
                          options={InstallerClients}
                          placeholder="Select Installer"
                          class="form-control custom-select "
                          styles={colourStyles}
                        />
                        <label class="fixed-label" for="userName">Installer Clients</label>
                      </Col>
                    </FormGroup> : null} */}

                    {/* ============================================================================================= */}
                    <div className='row'>

                      <div className='col-lg-5 pr-0 mr-0 pt-1 hiddenOverflow'>
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
                              name="clientName"
                              value={clientName}
                              styles={colourStyles}
                              onChange={this.handleClient}
                              options={utils.selectOptionGenerator(clientsList, 'name', '_id')}
                            />
                            <label class="fixed-label" for="userName">Clients</label>
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

                        <FormGroup col className="m-0">
                          <Col xs="12">
                            {!showTree ? null : <TreeStructure getStoreData={this.getStoreData}
                              selectedKeys={onlyTreeId}
                              treeData={treeData} />
                            }
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
                            <Select class="form-control custom-select" required
                              id="roleId"
                              isClearable={true}
                              isDisabled={isAdmin}
                              name="roleName"
                              value={roleName}
                              styles={colourStyles}
                              onChange={this.handleRole}
                              options={roles}
                            />
                            <label class="fixed-label" for="userName">Role</label>
                            {rolesErr && <div className="input-feedback">{rolesErr}</div>}
                          </Col>

                          <Col xs="12" className="text-field ml-2  mb-3"
                            style={{ backgroundColor: "white", minHeight: "35px", padding: "6px" }}
                          >
                            <label class="fixed-label" style={{ margin: "-4px 0px" }} for="userName">Widgets</label>
                            {widgets && widgets.length ? widgets.map( x => {
                              return <>
                                <Badge key={x._id} color="secondary" style={{ padding: "6px", margin: "2px" }}>{x.name}&nbsp;
                            <span className="badgeCross pointer" onClick={() => this.deleteWidgets(x._id)}>X</span>
                                </Badge> &nbsp;
                          </>
                            }): ''
                            }
                            {widRepo && (!widgets || widgets.length == 0) ? <Badge style={{ color: "red" }}> No Data </Badge> : <></>}
                          </Col>

                        </FormGroup>


                        <FormGroup col >


                          <Col xs="12" className="text-field ml-2  mb-3"
                            style={{ backgroundColor: "white", minHeight: "35px", padding: "6px" }}
                          >
                            <label class="fixed-label" style={{ margin: "-4px 0px" }} for="userName">Reports</label>
                            {
                              reports && reports.map((x, index) => {
                                return <>
                                  <Badge style={{ padding: "6px", margin: "2px" }} key={x._id} color="secondary">{x.name}&nbsp;
                                      <span className="badgeCross pointer" onClick={() => this.deleteReports(x._id)}>X</span>
                                  </Badge> &nbsp;
                                  </>
                              })
                            }
                            {widRepo && (!reports || reports.length == 0) ? <Badge style={{ color: "red" }}> No Data </Badge> : <></>}
                          </Col>

                        </FormGroup>

                      </div>
                    </div>
                    {/* ============================================================================================= */}

                    {/* <FormGroup row className="m-0 mb-2">

                      {isInstaller ?
                        <Col xs="5" className="text-field">
                          <Select
                            isClearable={true}
                            onChange={(option) => this.installerChange(option)}
                            value={InstallerClients ? InstallerClients.find(option => option.value === installerId) : ''}
                            options={InstallerClients}
                            placeholder="Select Installer"
                            class="form-control custom-select "
                            styles={colourStyles}
                          />
                          <label class="fixed-label" for="userName">Installer Clients</label>
                        </Col> :
                        <Col xs="5" className="text-field">
                          <Select class="form-control custom-select" required
                            id="clientId"
                            isClearable={true}
                            name="clientName"
                            value={clientName}
                            styles={colourStyles}
                            onChange={this.handleClient}
                            options={utils.selectOptionGenerator(clientsList, 'name', '_id')}
                          />
                          <label class="fixed-label" for="userName">Clients</label>
                        </Col>}

                      <Col xs="5" className="text-field ml-1">
                        <Select class="form-control custom-select" required
                          id="roleId"
                          isClearable={true}
                          isDisabled={isAdmin}
                          name="roleName"
                          value={roleName}
                          styles={colourStyles}
                          onChange={this.handleRole}
                          options={roles}
                        />
                        <label class="fixed-label" for="userName">Role</label>
                        {rolesErr && <div className="input-feedback">{rolesErr}</div>}
                      </Col>
                    </FormGroup>

                    <FormGroup row className="m-0 mb-2" >

                      {isInstaller ?
                        <Col xs="5" className="text-field">
                          <Select class="form-control custom-select" required
                            id="clientId"
                            isClearable={true}
                            name="clientName"
                            value={clientName}
                            styles={colourStyles}
                            onChange={this.handleClient}
                            options={utils.selectOptionGenerator(clientsList, 'name', '_id')}
                          />
                          <label class="fixed-label" for="userName">Clients</label>
                        </Col> :

                        <Col xs="5" className="text-field" style={{ backgroundColor: "white", minHeight: "35px", padding: "6px" }}>

                          {selectedStoreId && selectedStoreId.map(x => {
                            console.log(x);
                            return <>
                              <Badge color="secondary" style={{ padding: "6px", margin: "2px" }}>{x.name}&nbsp;
                            {isAdmin || isInstaller ? <span className="badgeCross pointer" onClick={() => this.deleteRegSite(x._id)}>X</span> : null}
                              </Badge>
                            </>
                          })}
                          <label class="fixed-label" style={{ margin: "-4px 0px" }} for="userName">Sites</label>
                        </Col>}

                      <Col xs="5" className="text-field ml-2"
                        style={{ backgroundColor: "white", minHeight: "35px", padding: "6px" }}
                      >
                        <label class="fixed-label" style={{ margin: "-4px 0px" }} for="userName">Widgets</label>
                        {widgets && widgets.length && widgets.map(x => {
                          return <>
                            <Badge key={x._id} color="secondary" style={{ padding: "6px", margin: "2px" }}>{x.name}&nbsp;
                            <span className="badgeCross pointer" onClick={() => this.deleteWidgets(x._id)}>X</span>
                            </Badge> &nbsp;
                          </>
                        })
                        }
                        {widRepo && (!widgets || widgets.length == 0) ? <Badge style={{ color: "red" }}> No Data </Badge> : <></>}
                      </Col>
                      <br />

                    </FormGroup>
                    <FormGroup row className="m-0 mb-2">
                      {isInstaller ?
                        <Col xs="5" className="text-field" style={{ backgroundColor: "white", minHeight: "35px", padding: "6px" }}>

                          {selectedStoreId && selectedStoreId.map(x => {
                            console.log(x);
                            return <>
                              <Badge color="secondary" style={{ padding: "6px", margin: "2px" }}>{x.name}&nbsp;
                           {isAdmin || isInstaller ? <span className="badgeCross pointer" onClick={() => this.deleteRegSite(x._id)}>X</span> : null}
                              </Badge>
                            </>
                          })}
                          <label class="fixed-label" style={{ margin: "-4px 0px" }} for="userName">Sites</label>
                        </Col> :
                        <Col xs="5" className="text-field"> */}


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
                    {/* </Col>}

                      <Col xs="5" className="text-field ml-2"
                        style={{ backgroundColor: "white", minHeight: "35px", padding: "6px" }}
                      >
                        <label class="fixed-label" style={{ margin: "-4px 0px" }} for="userName">Reports</label>
                        {
                          reports && reports.map((x, index) => {
                            return <>
                              <Badge style={{ padding: "6px", margin: "2px" }} key={x._id} color="secondary">{x.name}&nbsp;
                                      <span className="badgeCross pointer" onClick={() => this.deleteReports(x._id)}>X</span>
                              </Badge> &nbsp;
                                  </>
                          })
                        }
                        {widRepo && (!reports || reports.length == 0) ? <Badge style={{ color: "red" }}> No Data </Badge> : <></>}
                      </Col>
                    </FormGroup>
                    <FormGroup row style={{ margin: "0px" }}>
                      <Col xs="5">
                        {!showTree ? null : <TreeStructure getStoreData={this.getStoreData}
                          selectedKeys={onlyTreeId}
                          treeData={treeData} />
                        }
                      </Col>
                    </FormGroup> */}
                  </div>
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

AddUserForm.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    initialValues: state.userData.data || {},
    saveUser: state.saveUser,
    userData: state.userData,
    // updateUser: state.updateUser,
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

// var UserFormModule = connect(mapStateToProps)(AddUserForm);
export default connect(mapStateToProps)(AddUserForm);
