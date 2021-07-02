import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { Col, FormGroup, Input, Label, Row } from "reactstrap";
import { getClientRoles, clientData, roleData, getClientPermission } from "../../redux/actions/httpRequest";
import { getroleIds } from "../../redux/actions/index";
import PropTypes from "prop-types";
import swal from "sweetalert";
import { Formik } from "formik";
import * as Yup from "yup";
import LoadingDialog from "../../component/LoadingDialog";
import utils from "../../Util/Util";
import consts from "../../Util/consts";
import './styles.scss';
import api from '../../redux/httpUtil/serverApi';
import $ from "jquery";
import { Button as AntButton, Tooltip } from 'antd';
import { Steps } from 'rsuite';
import 'rsuite/dist/styles/rsuite-default.css';
import { instance } from '../../redux/actions/index';

(function ($) {
  "use strict";

  $.fn.floatingLabel = function (option) {
    var parent = $(this).closest(".form-group");
    console.log(option, parent);

    if (parent.length) {
      switch (option) {
        case "focusin":
          $(this).closest(".form-group").addClass("control-focus");
          break;
        case "focusout":
          $(this).closest(".form-group").removeClass("control-focus");
          break;
        case "ChangeFortText":
          if (this.val()) {
            parent.addClass("control-highlight");
          } else {
            parent.removeClass("control-highlight");
          }
          break;
        default:
          $(this).closest(".form-group").addClass("control-highlight");
          break;
      }
    }

    return this;
  };
})($);

$(document).ready(function () {
  "use strict";
  $("option").closest("select").css({ color: "red" });

  $(".form-group .form-control").each(function () {
    $(this).floatingLabel("ChangeFortText");
  });

  $(document).on("change", ".form-group .form-control", function () {
    $(this).floatingLabel("ChangeFortText");
  });

  $(document).on("focusin", ".form-group .form-control", function () {
    $(this).floatingLabel("focusin");
  });

  $(document).on("focusout", ".form-group .form-control", function () {
    $(this).floatingLabel("focusout");
  });
});
export class ClientRoleForm extends PureComponent {
  constructor(props) {
    super(props);

    let ClientID = localStorage.getItem("ClientID");
    let ClientDetails = JSON.parse(localStorage.getItem("ClientDetails"));

    var loggedData = utils.getLoggedUser();

    let DefaultTab = 'pages';

    this.state = {
      userName: "",
      selectedRole: {},
      newRoleName: "New Role",
      AddMode: false,
      firsTime: true,
      isAdmin: loggedData && loggedData.roleId ? loggedData.roleId.isAdminRole : false,
      permissionPageData: {},
      permissionFunctionData: {},
      permissionReportsData: {},
      permissionWidgetData: {},
      currentTab: DefaultTab,
      DefaultTab: DefaultTab,
      rolesData: [],
      screen: 2,
      ClientID: ClientID,
      configuredRole: "Use a Blank Template",
      maxRolesAllowed: 10,
      viewRoleDetails: {},
      viewMode: false,
      selectedData: [],
      newKey: '',
      disabled: true,
      AdminRolesData: [],
      isLoading: true,
      showField: false,
      showFunction: false,
      showFunctionVar: '',
      roleName: "",
      FormName: '',
      copyRolesData: '',
      FormDescription: '',
      BlankTemplateName: "Use a Blank Template",
      ClientName: ClientDetails ? ClientDetails.name : ' ',
      clientType: ClientDetails ? ClientDetails.clientType : ' ',
      reqRoleKey: ClientDetails && ClientDetails.clientType === "installer" ? 'isInstallerRole' : 'isClientAdminRole',
      reqRoletype: ClientDetails && ClientDetails.clientType === "installer" ? 'Installer role' : 'Client Admin role',
      columns: [
        { key: 'name', name: 'Name', width: 50, filter: true, sort: true, type: 'string' },
        { key: 'description', name: 'Description', width: 200, filter: true, sort: true, type: 'string' }
      ]
    };
    console.log(props, "prpspps");
    this.onSave = this.onSave.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.ChangeCheckbox = this.ChangeCheckbox.bind(this);

    this.props.dispatch(clientData.request({ action: 'load', id: ClientID }, ClientID));
  }

  handleNavigate = (stateVar, page) => {
    if (this.state.ClientData1 && this.state.ClientData1[stateVar]) {
      utils.onNavigate({
        props: this.props,
        type: "replace",
        route: `/admin/clients/${page}/${this.props.match.params.id}`
      });
    }
  }

  addNewRole = async () => {
    const { rolesData, maxRolesAllowed } = this.state;
    await this.resetAll();
    this.CheckDashboard();

    if (rolesData.length >= maxRolesAllowed) {
      let message = `Roles cannot exceed ${maxRolesAllowed}.`;
      this.openSwal("Error", message, "warning");
      return;
    }
    this.setState({ AddMode: true, disabled: false, newRoleName: "New Role", configuredRole: this.state.BlankTemplateName, selectedRole: '', newKey: '' });
  }

  onCancel = () => {
    this.props.history.goBack(-1);
  };

  showTabs = (tabName) => {
    this.setState({ currentTab: tabName });
  }

  CheckDashboard = () => {
    const { permissionPageData, selectedData } = this.state;
    let pageData = { ...permissionPageData };
    let selectedData1 = selectedData ? [...selectedData] : [];

    // checking all selected pages for selected role  
    if (pageData && pageData.data && pageData.data.length) {
      pageData.data.map(option1 => {
        if (option1.name && option1.name.toLowerCase() == "dashboard") {
          option1.isEditAllowed = true;
          option1.isViewAllowed = true;

          selectedData1.push(option1);
        }
      });
    }

    this.setState({ permissionPageData: pageData, selectedData: selectedData1 });
  }

  configuredRoleChange = async (e) => {
    let selectedValue = e.target.value;

    this.setState({ configuredRole: selectedValue }, async option => {

      if (selectedValue == this.state.BlankTemplateName) {
        let yy = await this.resetAll();
        this.CheckDashboard();

      } else {
        let role;
        if (selectedValue) role = this.state.rolesData.find(option => option._id == selectedValue);
        else role = this.state.rolesData.find(option => option.newKey == selectedValue);

        this.viewRole(role);
      }
    });
  }

  updateData = () => {
    this.setState({
      copyRolesData: "save",
      disabled: false
    })
  }

  viewRole = async (role) => {
    const { AddMode, rolesData, maxRolesAllowed, newRoleName, screen, disabled, permissionPageData, permissionReportsData, permissionWidgetData, permissionFunctionData } = this.state;

    if (AddMode) {
      if (rolesData.length >= maxRolesAllowed) {
        let message = `Roles cannot exceed ${maxRolesAllowed}.`;
        this.openSwal("Error", message, "warning");
        this.resetAll();
        return
      }
    }

    if (role) {
      await this.resetAll();

      this.CheckDashboard();

      if (AddMode) {
        this.setState({ configuredRole: role._id })
      }

      let SelectedValue = role._id ? role._id : role.newKey;

      let selectedDataArr = [];

      if (role && role.permissions.length) {
        role.permissions.forEach(option => {
          if (AddMode) {
            if (!option.functionId) {
              selectedDataArr.push(option);
            }
          } else {
            selectedDataArr.push(option);
          }
        });
      }

      this.setState({
        FormName: role.name,
        FormDescription: role.description,
        viewRoleDetails: role,
        newRoleName: AddMode ? role.name : newRoleName,
        disabled: screen == 2 && AddMode ? true : screen == 2 && !AddMode ? false : disabled,
        selectedRole: role._id,
        newKey: role.newKey,
        selectedData: selectedDataArr,
        showFunction: role.isClientAdminRole || role.isInstallerRole,
        showFunctionVar: role.isClientAdminRole ? 'isForClientAdminRole' : 'isForInstallerRole'
      });

      let rolePage, roleWidget, roleFunction, roleReport = [];

      if (role.permissions) {
        rolePage = role.permissions.filter(option => option.pageId);
        roleWidget = role.permissions.filter(option => option.widgetId);
        roleFunction = role.permissions.filter(option => option.functionId);
        roleReport = role.permissions.filter(option => option.reportId);
      }

      let pageData = { ...permissionPageData };
      let reportData = { ...permissionReportsData };
      let widgetData = { ...permissionWidgetData };
      let functionData = { ...permissionFunctionData };

      // checking all selected pages for selected role  
      if (rolePage.length) {

        if (pageData && pageData.data && pageData.data.length) {
          pageData.data.map(option1 => {
            rolePage.map(option2 => {
              if (option1._id === option2.pageId) {
                option1.isEditAllowed = option2.isEditAllowed;
                option1.isViewAllowed = option2.isViewAllowed;
              }
            });
          });
        }
      }

      // checking all selected reports for selected role  
      if (roleReport.length) {
        if (reportData && reportData.data && reportData.data.length) {
          reportData.data.map(option1 => {
            roleReport.map(option2 => {
              if (option1._id === option2.reportId) {
                option1.isViewAllowed = option2.isViewAllowed;
              }
            });
          });
        }
      }

      // checking all selected widgets for selected role  
      if (roleWidget.length) {
        if (widgetData && widgetData.data && widgetData.data.length) {
          widgetData.data.map(option1 => {
            roleWidget.map(option2 => {
              if (option1._id === option2.widgetId) {
                option1.isViewAllowed = option2.isViewAllowed;
              }
            });
          });
        }
      }

      // checking all selected functions for selected role  
      if (roleFunction.length) {
        if (functionData && functionData.data && functionData.data.length) {
          functionData.data.map(option1 => {
            roleFunction.map(option2 => {
              if (option1._id === option2.functionId) {
                option1.isViewAllowed = option2.isViewAllowed;
              }
            });
          });
        }
      }

      this.setState({
        permissionPageData: pageData,
        permissionReportsData: reportData,
        permissionWidgetData: widgetData,
        permissionFunctionData: functionData,
        viewMode: true
      });

    }

  }

  handleContinueClick = () => {
    const { maxRolesAllowed, rolesData, ClientID, isAdmin } = this.state;

    let CheckedRoles = [];
    if (rolesData.length) {
      CheckedRoles = rolesData.filter(option => option.checked);
    }
    let errorMsg = false;
    if (CheckedRoles.length > maxRolesAllowed) {
      errorMsg = `Roles cannot exceed ${maxRolesAllowed}.`;
    }
    if (!CheckedRoles.length) errorMsg = "Select atleast one role.";

    if (!errorMsg) {
      this.setState({ rolesData: CheckedRoles, screen: 2, viewMode: false });

      if (isAdmin) this.callPageList();
      else this.props.dispatch(getClientPermission.request({}, ClientID));
      this.resetAll();
    }
    else {
      this.openSwal("Error", errorMsg, "warning");
    }
  }

  CancelNewRole = () => {
    this.resetAll();
    this.setState({ AddMode: false, disabled: true });
  }

  resetAll = () => {

    const { DefaultTab, permissionPageData, permissionReportsData, permissionWidgetData, permissionFunctionData } = this.state;

    let pageData = { ...permissionPageData };
    let reportData = { ...permissionReportsData };
    let widgetData = { ...permissionWidgetData };
    let functionData = { ...permissionFunctionData };

    if (pageData.data && pageData.data.length) {
      pageData.data.map(option => {
        option.isViewAllowed = false;
        option.isEditAllowed = false;
      });
    }
    if (reportData.data && reportData.data.length) {
      reportData.data.map(option => { option.isViewAllowed = false });
    }
    if (widgetData.data && widgetData.data.length) {
      widgetData.data.map(option => { option.isViewAllowed = false });
    }
    if (functionData.data && functionData.data.length) {
      functionData.data.map(option => { option.isViewAllowed = false });
    }

    this.setState({
      permissionPageData: pageData,
      permissionReportsData: reportData,
      permissionWidgetData: widgetData,
      permissionFunctionData: functionData,
      FormName: '',
      FormDescription: '',
      viewMode: false,
      viewRoleDetails: {},
      currentTab: DefaultTab,
      selectedData: [],
      showFunction: false,
      showFunctionVar: ''
    }, () => false);

  }

  openSwal = (title, text, icon) => {
    swal({
      title: title,
      text: text,
      icon: icon,
      showCancelButton: false,
      showConfirmButton: true,
      dangerMode: true,
    });
  }

  DeleteRole = () => {
    const { viewRoleDetails, rolesData, firsTime, ClientID, reqRoleKey, reqRoletype, isAdmin } = this.state;

    let FilteredRoles = [];
    let check;

    if (viewRoleDetails[reqRoleKey]) {
      check = true;
      FilteredRoles = rolesData.length && rolesData.filter(item => item[reqRoleKey])
    }

    if (check && FilteredRoles.length < 2) {
      this.openSwal("Error", `Sorry, It cannot be deleted. You need at least one ${reqRoletype} to proceed.`, "warning");
      return;
    }

    swal({
      title: "Are you sure?",
      text: "Do you really want to delete this role? This process can not be undone.",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(
      function (willDelete) {


        let id = viewRoleDetails._id;
        let roleList = [...rolesData];

        if (willDelete) {

          if (firsTime) {
            if (roleList && viewRoleDetails) {
              this.openSwal("Deleted", "Role deleted successfully.", "success");
              this.updateAfterDelete(roleList);
            }
          } else {
            this.setState({ isLoading: true });
            var bodyFormData = new FormData();
            bodyFormData.append('roleID', id);

            instance.put(`${api.DELETE_CLIENT_ROLE}/${ClientID}`, bodyFormData)
              .then(res => {


                if (res.data.error) {
                  this.setState({ isLoading: false });
                  this.openSwal("Status", res.data.errmsg, "warning");
                }
                if (!res.data.error) {
                  this.openSwal("Deleted", "Role deleted successfully.", "success");
                  this.updateAfterDelete(roleList);

                  if (!isAdmin) this.props.dispatch(getClientPermission.request({}, ClientID));
                  else this.setState({ isLoading: false });
                }
              }).catch(err => {
                this.setState({ isLoading: false });
                console.log(err);
              });
          }
        }
      }.bind(this)
    );
  }

  updateAfterDelete = (roleList) => {
    let index = roleList.findIndex(option => option._id == this.state.viewRoleDetails._id);
    roleList.splice(index, 1);

    this.setState({ rolesData: roleList });
    this.resetAll();
  }

  ChangeCheckbox = (clickedData, StateVar, CheckboxKey, IDkey) => {

    let DataObj = {
      pageId: null,
      widgetId: null,
      reportId: null,
      functionId: null,
      isViewAllowed: clickedData.isViewAllowed,
      id: clickedData._id,
    }

    let Data = this.state[StateVar];

    let selectedData1 = [...this.state.selectedData];

    let rolle;
    if (IDkey == 'pageId') {
      DataObj.isEditAllowed = clickedData.isEditAllowed;
      rolle = selectedData1.find(role => role[IDkey] === clickedData._id)
    }

    Data.data.map(option => {

      if (option._id == clickedData._id) {

        option[CheckboxKey] = !option[CheckboxKey];

        if (option[CheckboxKey]) {
          DataObj[IDkey] = option._id;
          DataObj[CheckboxKey] = option[CheckboxKey];
          debugger
          if (!rolle) {
            selectedData1.push(DataObj);
          } else {
            rolle[CheckboxKey] = option[CheckboxKey];
          }

        } else {

          if (rolle) {
            rolle[CheckboxKey] = false;
            if (rolle.isEditAllowed || rolle.isViewAllowed) {
              return;
            }
          }
          let index = selectedData1.findIndex(role => role[IDkey] === option._id)
          selectedData1.splice(index, 1)
        }

      }
    });

    let perm = {
      data: Data.data,
      status: true
    }

    this.setState({ [StateVar]: perm, selectedData: selectedData1 });

    return clickedData;
  }

  handleChangeData = (event, field) => {
    let NewRoleName = this.state.newRoleName;

    this.setState({
      [field]: event.target.value,
      newRoleName: field == "FormName" ? event.target.value : NewRoleName
    });
  }

  async componentDidMount() {

    let filters = [
      {
        "operator": "like",
        "value": 0,
        "property": "roleStatus",
        "type": "numeric"
      },
      {
        "operator": "like",
        "value": false,
        "property": "isAdminRole",
        "type": "boolean"
      },
      { "operator": "like", "value": null, "property": "clientId", "type": "boolean" }

    ]

    let obj = { "operator": "like", "value": false, "property": "isInstallerRole", "type": "boolean" }

    if (this.state.clientType !== "installer") filters.push(obj)

    await this.props.dispatch(
      roleData.request(
        {
          action: "load",
          page: 1,
          pageSize: 100,
          filters: filters
        }
      )
    );

    let Id = this.state.ClientID;
    this.props.dispatch(getClientRoles.request({ action: "load", id: Id }, Id));

    this.setState({ copyRolesData: "update" });
    let fetchBody = {
      populate: ["permissions.widgetId", "permissions.pageId", "permissions.reportId", "permissions.functionId"],
      id: Id
    }
    this.props.dispatch(getroleIds(fetchBody));
  }

  callPageList = () => {
    let filters = [{
      operator: "like",
      value: "Page",
      property: "permType",
      type: "string"
    }]

    var bodyFormData = new FormData();
    bodyFormData.append('filters', JSON.stringify(filters));
    bodyFormData.append('page', 1);
    bodyFormData.append('pageSize', 50);
    instance.post(`${api.PERMISSION_LIST_PAGE}`, bodyFormData)
      .then(res => {
        console.log(res);
        if (res.data.data) {

          this.setState({
            permissionPageData: { data: res.data.data, status: true }
          })
          let jj = this.state.permissionPageData

          this.callFunctionsList()
        }
      }).catch(err => {
        this.setState({ isLoading: false });
        console.log(err);
      })

  }
  callFunctionsList = () => {
    let filters = [
      {
        operator: "like",
        value: "Functions",
        property: "permType",
        type: "string"
      },
      {
        operator: "like",
        value: true,
        property: "isForAdminRole",
        type: "boolean"
      }
    ]
    var bodyFormData = new FormData();
    bodyFormData.append('filters', JSON.stringify(filters));
    bodyFormData.append('page', 1);
    bodyFormData.append('pageSize', 50);
    instance.post(`${api.PERMISSION_LIST_PAGE}`, bodyFormData)
      .then(res => {
        if (res.data.data) {
          this.setState({ permissionFunctionData: { data: res.data.data, status: true } });
          this.callWidgetList();
        }
      }).catch(err => {
        this.setState({ isLoading: false });
        console.log(err);
      });
  }

  callWidgetList = () => {
    var bodyFormData = new FormData();
    bodyFormData.append('page', 1);
    bodyFormData.append('pageSize', 50);
    instance.post(`${api.PERMISSION_LIST_WIDGET}`, bodyFormData)
      .then(res => {
        if (res.data.data) {
          this.setState({ permissionWidgetData: { data: res.data.data, status: true } });
          this.callReportsList()
        }
      }).catch(err => {
        this.setState({ isLoading: false });
        console.log(err);
      });
  }
  callReportsList = () => {
    var bodyFormData = new FormData();
    bodyFormData.append('page', 1);
    bodyFormData.append('pageSize', 50);
    instance.post(`${api.PERMISSION_LIST_REPORTS}`, bodyFormData)
      .then(res => {
        this.setState({ isLoading: false });
        if (res.data.data) {
          this.setState({ permissionReportsData: { data: res.data.data, status: true } });
        }
      }).catch(err => {
        this.setState({ isLoading: false });
        console.log(err);
      });
  }

  async componentDidUpdate() {
    const { permissionPageData, permissionWidgetData, permissionFunctionData, permissionReportsData, userName } = this.state

    try {
      if (Object.keys(this.props.updateRolePermission).length > 0) {
        console.log(this.props.updateRolePermission);
        if (this.props.updateRolePermission.message) {
          swal({
            title: "Status",
            text: this.props.updateRolePermission.message,
            icon: "success",
            showCancelButton: false,
            showConfirmButton: true,
            dangerMode: true,
          }).then(
            function () {
              this.props.history.push(`/admin/role`)

            }.bind(this)
          );
        }
      }
      if (this.props.permissionPageData.data != null) {
        let data1 = await this.intialArray(this.props.permissionPageData.data.data)

        if (!this.state.permissionPageData.status) {
          let data2 = {
            data: data1,
            status: this.props.permissionPageData.data.success
          }

          this.setState({
            permissionPageData: data2
          })
        }

      }
      if (this.props.permissionFunctionData.data != null) {
        let data1 = await this.intialArray(this.props.permissionFunctionData.data.data)

        let data2 = {
          data: data1,
          status: this.props.permissionFunctionData.data.success
        }
        if (!this.state.permissionFunctionData.status) {
          this.setState({
            permissionFunctionData: data2
          })
        }
      }
      if (this.props.permissionWidgetData.data != null) {
        let data1 = await this.intialArray(this.props.permissionWidgetData.data.data)
        let status = this.props.permissionWidgetData.data.success

        let data2 = {
          data: data1,
          status: status
        }
        if (!this.state.permissionWidgetData.status) {
          this.setState({
            permissionWidgetData: data2
          })
        }
      }
      if (this.props.permissionReportsData.data != null) {
        let data1 = await this.intialArray(this.props.permissionReportsData.data.data)
        console.log(this.props.permissionReportsData.data);
        let data2 = {
          data: data1,
          status: this.props.permissionReportsData.data.success
        }
        if (!this.state.permissionReportsData.status) {
          this.setState({
            permissionReportsData: data2
          })
        }
      }
      if (this.props.roleIdData != null) {

        if (this.props.roleIdData._id != this.state.updateRoleId) {

          let name = this.props.roleIdData.name
          let description = this.props.roleIdData.description
          console.log(this.state.name, this.props.roleIdData, description, this.state.userName, this.state.description);
          if (!(this.state.userName || this.state.description)) {
            await this.setState({
              roleIdData: this.props.roleIdData.permissions,
              updateRoleId: this.props.roleIdData._id,
              userName: name,
              description: this.props.roleIdData.description
            })
          }
        }

        if (this.state.roleIdData && permissionPageData.status == true &&
          permissionFunctionData.status == true && permissionWidgetData.status == true && permissionReportsData.status == true) {
          if (this.state.selectedData.length == 0)
            this.showRoleIdData(this.state.roleIdData)
        }
      }

    } catch (err) {
      // console.log(err);
    }

  }

  autoCheckingRoles = () => {

    const { roleData, reqRoleKey } = this.state;

    // auto-checking all the installer roles if client type is installer otherwise auto-checking all the client admin roles
    if (roleData.length) {
      roleData.map(role => {
        if (role[reqRoleKey]) this.handleRoleClick(role, roleData);
        else role.checked = false;
      });
    }
  }

  componentWillReceiveProps(nextProps) {

    if (nextProps.roleData && nextProps.roleData.data && nextProps.roleData.data.data && nextProps.roleData.data.data.length && nextProps.roleData != this.props.roleData) {
      let arr = [...nextProps.roleData.data.data];

      // auto-checking all the installer roles if client type is installer otherwise auto-checking all the client admin roles
      if (arr.length && this.state.screen == 1) {
        arr.map(role => { role.checked = false; });
      }

      this.setState({ roleData: arr });
    }

    if (nextProps.getClientPermission && nextProps.getClientPermission.data && nextProps.getClientPermission != this.props.getClientPermission) {

      let { data, isFetching, error } = nextProps.getClientPermission;
      if (!isFetching) {

        this.setState({ isLoading: false });
        if (error || (data && data.errmsg)) {
          let errorMessage = error || "";
          if (data && data.errmsg && typeof data.errmsg == "object") {
            errorMessage = data.errmsg.message;
          } else if (data && data.errmsg) {
            errorMessage = data.errmsg;
          }
          return;
        } else if (data && data.message) {

          this.props.history.goBack(-1);
        } else {

          data.pagePermission.length && data.pagePermission.map(option1 => option1._id = option1.pageId);
          data.reportPermission.length && data.reportPermission.map(option1 => option1._id = option1.reportId);
          data.widgetPermission.length && data.widgetPermission.map(option1 => option1._id = option1.widgetId);
          data.functionPermission.length && data.functionPermission.map(option1 => option1._id = option1.functionId);

          this.setState({
            permissionPageData: { data: data.pagePermission, status: true },
            permissionReportsData: { data: data.reportPermission, status: true },
            permissionWidgetData: { data: data.widgetPermission, status: true },
            permissionFunctionData: { data: data.functionPermission, status: true }
          });
        }
      }
    }

    if (nextProps.getClientRoles && nextProps.getClientRoles !== this.props.getClientRoles) {
      let { data, isFetching, error } = nextProps.getClientRoles;
      if (!isFetching) {
        if (error || (data && data.errmsg)) {
          let errorMessage = error || "";
          if (data && data.errmsg && typeof data.errmsg == "object") {
            errorMessage = data.errmsg.message;
          } else if (data && data.errmsg) {
            errorMessage = data.errmsg;
          }
          if (errorMessage === "No Roles Found for this Client") {
            debugger
            this.setState({ firsTime: true, screen: 1 }, () => {
              this.autoCheckingRoles();
              this.callPageList();
              // let callRoleData = await this.callPageList(); 
            });
          }
          return;
        } else if (data && data.message) {

          this.props.history.goBack(-1);
        } else {
          this.setState({ screen: 2, rolesData: data.data, firsTime: false });

          if (this.state.isAdmin) this.callPageList();
          else this.props.dispatch(getClientPermission.request({}, this.state.ClientID));
        }
      }
    }
  }

  onSaveContinue(type) {

    let { params } = this.props.match;
    let { id } = params;

    let ClientID = localStorage.getItem("ClientID");
    let requestID = '';
    let API_Name = '';
    let KeyName = '';

    if (this.state.firsTime) {
      API_Name = api.CLIENT_ROLE;
      KeyName = 'role';
    } else {
      API_Name = api.UPDATE_CLIENT_ROLE;
      KeyName = 'data';
    }

    if (id === "0") {
      requestID = ClientID;
    } else {
      requestID = id;
    }

    var bodyFormData = new FormData();
    bodyFormData.append(KeyName, JSON.stringify(this.state.rolesData));



    instance.post(`${API_Name}/${requestID}`, bodyFormData)
      .then(res => {
        console.log(res);
        console.log(res.data.errmsg);
        console.log(res.data.msg);
        if (res.data.error) {
          this.openSwal("Status", res.data.errmsg, "warning");

          // swal({
          //   title: "Status",
          //   text: res.data.errmsg,
          //   icon: "warning",
          //   showCancelButton: false,
          //   showConfirmButton: true,
          //   dangerMode: true,
          // }).then(
          //   function (res) {
          //   }
          // )
        }
        if (!res.data.error) {

          utils.onNavigate({
            props: this.props,
            type: "replace",
            route: '/admin/clients/Regions/' + id
          });

        }
      }).catch(err => {
        console.log(err);
      });

  }

  onSave(values, { setSubmitting }) {

    const { FormName, FormDescription, AddMode, selectedData, rolesData, selectedRole, maxRolesAllowed, firsTime, viewRoleDetails, newKey } = this.state;

    let RolesData = [...rolesData];
    let copiedRole = {};

    if (RolesData.length && (selectedRole || newKey)) {
      if (selectedRole) copiedRole = RolesData.find(option => option._id === selectedRole);
      else copiedRole = RolesData.find(option => option.newKey === newKey);
    }

    if ((AddMode && !selectedData.length) || (copiedRole && copiedRole.permissions && !copiedRole.permissions.length)) {
      this.openSwal("Error", "Please assign atleast one permission.", "warning");
      return;
    }

   

    setSubmitting(false);
    let { params } = this.props.match;
    let { id } = params;
    let loggedData;

    this.setState({ copyRolesData: "update" });

    let ClientID = localStorage.getItem("ClientID");
    let ID = id != '0' ? id : ClientID

    if (AddMode) {

      let message;
      let ErrorCame = false;
      if (rolesData.length >= maxRolesAllowed) {
        message = `Roles cannot exceed ${maxRolesAllowed}.`;
        ErrorCame = true;
      }

      if (rolesData.length) {
        let role = rolesData.find(role => FormName === role.name);
        if (role) {
          message = `Role already saved with name - ${FormName}`;
          ErrorCame = true;
        }
      }

      if (ErrorCame) {
        this.openSwal("Error", message, "warning");
        this.setState({ isLoading: false });
        return;
      }
    }

    let RequestData = {
      name: FormName,
      description: FormDescription,
      permissions: selectedData,
      isAdminRole: false,
      isInstallerRole: false,
      isClientAdminRole: false,
      clientId: ID
    }

    if (!AddMode) {
      RequestData.isInstallerRole = copiedRole.isInstallerRole
      RequestData.isClientAdminRole = copiedRole.isClientAdminRole
    }

    values = RequestData;

    if (firsTime) {

      if (AddMode) {
        let NewRole = {
          name: FormName,
          description: FormDescription,
          permissions: [...selectedData],
          newKey: FormName,
          isAdminRole: false,
          isClientAdminRole: false,
          isInstallerRole: false,
          clientId: ID
        }

        rolesData.push(NewRole);

      } else {
        if (copiedRole) {
          copiedRole.name = FormName;
          copiedRole.description = FormDescription;
          copiedRole.permissions = [...selectedData];

          this.setState({ rolesData: RolesData })
        }
      }

      this.CancelNewRole();

    } else {

      let requestID = '';
      let API_Name = '';
      let KeyName = '';

      if (id === "0") {
        loggedData = utils.getScreenDetails(
          utils.getLoggedUser(),
          this.props.location,
          consts.Added + " - " + values.name
        );

        requestID = ClientID;

      } else {
        requestID = id;

        utils.deleteUnUsedValue(values);
        loggedData = utils.getScreenDetails(
          utils.getLoggedUser(),
          this.props.location,
          consts.Update + " - " + values.name
        );
      }

      if (AddMode) {
        API_Name = api.CLIENT_ROLE;
        KeyName = 'role';
      } else {
        API_Name = api.UPDATE_CLIENT_ROLE;
        KeyName = 'data';
        values._id = viewRoleDetails._id;
      }
      this.setState({ isLoading: true });
      var bodyFormData = new FormData();
      let RequestDataSend = [];
      RequestDataSend.push(values);
      bodyFormData.append(KeyName, JSON.stringify(RequestDataSend));

      instance.post(`${API_Name}/${requestID}`, bodyFormData)
        .then(res => {

          this.setState({ isLoading: false });

          if (res.data.success === false) {
            this.openSwal("Status", res.data.errmsg, "warning");
          }

          if (!res.data.error) {
            let rolesData1 = [...rolesData];

            //update case
            if (KeyName == 'data') {
              let index = rolesData1.findIndex(op => op._id == res.data.data[0]._id);
              rolesData1.splice(index, 1)
            }

            rolesData1.push(res.data.data[0]);

            this.setState({ rolesData: rolesData1 });
            this.CancelNewRole();
          }
        }).catch(err => {
          console.log(err);
        });
    }
  }

  showTabs = (tabName) => {
    this.setState({ currentTab: tabName });
  }

  handleRoleClick = (role, roleList) => {
    const { reqRoletype, reqRoleKey, rolesData } = this.state;

    let FilteredRoles = [];
    let check;
    if (!roleList) roleList = [...rolesData]

    if (role.checked && role[reqRoleKey]) {
      check = true;
      FilteredRoles = roleList.length && roleList.filter(item => item[reqRoleKey])
    }

    if (check && FilteredRoles.length < 2) {
      this.openSwal('Error', `Sorry, It cannot be unchecked. You need at least one ${reqRoletype} to proceed.`, 'warning')
      return;
    }

    roleList.forEach(option => {
      if (option._id == role._id) {
        option.checked = !option.checked;
      }
    });

    this.setState({ roleData: roleList });
  }

  nameChange = (event) => {
    this.setState({ newRoleName: event.target.value });
  }

  showRoleIdData = async (data) => {
    console.log(data, this.state.permissionPageData);
    await data.forEach(async x => {
      if (x.pageId) {
        this.state.permissionPageData.data = await this.state.permissionPageData.data.map(y => {
          if (y._id == x.pageId._id) {
            y.isEditAllowed = y.name && y.name.toLowerCase() == "dashboard" ? true : x.isEditAllowed;
            y.isViewAllowed = y.name && y.name.toLowerCase() == "dashboard" ? true : x.isViewAllowed;
            return y;
          } else {
            return y;
          }
        })
      }
      if (x.reportId) {
        this.state.permissionReportsData.data = await this.state.permissionReportsData.data.map(y => {
          if (y._id == x.reportId._id) {
            y.isEditAllowed = x.isEditAllowed;
            y.isViewAllowed = x.isViewAllowed;
            return y;
          } else {
            return y;
          }
        })
      }
      if (x.widgetId) {
        this.state.permissionWidgetData.data = await this.state.permissionWidgetData.data.map(y => {
          if (y._id == x.widgetId._id) {
            y.isEditAllowed = x.isEditAllowed;
            y.isViewAllowed = x.isViewAllowed;
            return y;
          } else {
            return y;
          }
        })
      }
      if (x.functionId) {
        this.state.permissionFunctionData.data = await this.state.permissionFunctionData.data.map(y => {
          if (y._id == x.functionId._id) {
            y.isEditAllowed = x.isEditAllowed;
            y.isViewAllowed = x.isViewAllowed;
            return y;
          } else {
            return y;
          }
        })
      }
    });
    this.setState({ showField: true });
  }
  saveName = () => {
    if (this.state.selectedRole.length > 0) {
      this.setState({ showField: true });
    }
  }
  render() {
    const { state, props, showTabs } = this;
    const { initialValues } = props;
    const { currentTab, newRoleName, AddMode, permissionReportsData, permissionPageData, permissionFunctionData, permissionWidgetData, rolesData, FormName, FormDescription, disabled, screen, viewMode, configuredRole, BlankTemplateName, copyRolesData, roleData, ClientName, showFunction, showFunctionVar, isLoading } = state;

    const { name } = initialValues || { name: "" };
    const options = [
      { value: "chocolate", label: "Chocolate" },
      { value: "strawberry", label: "Strawberry" },
      { value: "vanilla", label: "Vanilla" },
    ];
    let initialValuesEdit = initialValues;

    if (roleData && roleData.length && screen == 1) {
      this.setState({ rolesData: roleData });
    }

    let ClientData1;
    let { clientData } = this.props;
    if (clientData && clientData.data) {
      ClientData1 = clientData.data;
      this.setState({ ClientData1: ClientData1 });
    }

    let isFetching = roleData && roleData.isFetching;
    isFetching = isFetching || (roleData && roleData.isFetching);
    
    return (
      <div className="animated fadeIn">
        <LoadingDialog isOpen={isFetching || isLoading} />
        <Formik
          enableReinitialize={true}
          initialValues={initialValuesEdit}
          onSubmit={this.onSave}
          validationSchema={Yup.object().shape({
            // name: Yup.string().trim().required("Required"),
          })}
        >
          {function (props) {
            const {
              values,
              touched,
              errors,
              isSubmitting,
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
            } = props;
            return (
              <Row>
                <Col md={12}>
                  <div class="col-12 mb-4 m-2">
                    <Steps class="col-12" current={1}>
                      <Steps.Item className={ClientData1 && ClientData1.isProfileCompleted ? 'pointer' : null} onClick={() => this.handleNavigate('isProfileCompleted', 'Profile')} title={'Profile(' + ClientName + ')'} />
                      <Steps.Item title="Roles" />
                      <Steps.Item className={ClientData1 && ClientData1.isRegionCompleted ? 'pointer' : null} onClick={() => this.handleNavigate('isRegionCompleted', 'Regions')} title="Regions" />
                      <Steps.Item className={ClientData1 && ClientData1.isSystemSettingsCompleted ? 'pointer' : null} onClick={() => this.handleNavigate('isSystemSettingsCompleted', 'System Settings')} title="System Settings" />

                    </Steps>

                  </div>
                  <form onSubmit={handleSubmit}>

                    <div className="site-video-div container-fluid">
                      <div className="grid-wrapper-area">
                        <div className="col">
                          <div className="container-ie table-header-area row">
                            <div className="col-6">
                              <div className="cameracardText textConvert gridHeader">
                                Setup Roles
                              </div>


                            </div>
                            <div className="col-6">
                              {!AddMode && screen == 2 ? <Tooltip className="floatRight" placement="bottom" title={consts.Add}>
                                <AntButton onClick={this.addNewRole} className="ml-3 mb-1 dashboard-button gridAdd" shape="circle" icon="plus" ghost />
                              </Tooltip> : null}
                            </div>

                          </div>

                          <br />
                          <div className="roes-page-section row">
                            <div className='col-lg-2'>
                              <div className="card ">

                                <div className="bg-white pt-3 pb-3">

                                  {screen == 1 ? <div>
                                    <div class="rolelist">
                                      {rolesData.length ? rolesData.map(role => {
                                        return (
                                          <div class="list-item d-flex align-items-center ml-2">
                                            <input onClick={() => this.handleRoleClick(role)} type="checkbox" id={role._id} checked={role.checked} />
                                            <label class="mb-0 ml-1 pointer" onClick={(e) => this.viewRole(role)} >{role.name}</label>
                                          </div>
                                        )
                                      }) : null}
                                    </div>
                                  </div> :
                                    <div class="rolelist">
                                      {rolesData.length ? rolesData.map(role => {
                                        return (
                                          <div class="list-item d-flex align-items-center ml-2">
                                            <label onClick={(e) => this.viewRole(role)} class="mb-0 ml-1" for="customCheck1">{role.name}</label>
                                          </div>
                                        )
                                      }) : null}
                                      {AddMode ? <div class="list-item d-flex align-items-center ml-2">
                                        <label class="mb-0 ml-1" for="customCheck2">{newRoleName} &nbsp; &nbsp;  <i className="fa fa-angle-right mt-1" /></label>
                                      </div> : <></>}
                                    </div>}
                                </div>
                              </div>
                              {screen == 1 && rolesData.length ? <div>

                                <button
                                  style={{ width: " 100%" }}
                                  type="button"
                                  className="btn formButton"
                                  title="continue"
                                  onClick={this.handleContinueClick}
                                >
                                  Continue
                                </button>
                              </div> : null}
                            </div>
                            <div className='col-lg-10'>
                              {/* 
                              <Formik
                                enableReinitialize={true}
                                initialValues={initialValuesEdit}
                                onSubmit={this.onSave}
                                validationSchema={
                                  Yup.object().shape({
                                    // name: Yup.string().trim().required('Required')
                                  })
                                }>
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

                                    <form onSubmit={handleSubmit}> */}
                              <div className='col-lg-6  p-0'>

                                {AddMode ? <div className="form-group">
                                  <div className="d-flex">
                                    <div className="w-100">

                                      <div className="w-100 position-relative">
                                        <select
                                          value={configuredRole}
                                          className="form-control custom-select"
                                          onChange={this.configuredRoleChange}
                                          required=""
                                        >
                                          <option selected="selected">{BlankTemplateName}</option>
                                          {
                                            rolesData && rolesData.map((x, index) => {
                                              return <option key={index} selected="selected" value={x._id}  >
                                                {x.name}
                                              </option>
                                            })
                                          }
                                        </select>
                                        <label className="fixed-label" for="userName">Select a Configured Role to Copy the details <span className="red">*</span></label>
                                      </div>

                                    </div>
                                    <div class="ml-2" style={{ minWidth: "110px" }}
                                    >
                                      <button
                                        type="button"
                                        className="btn formButton"
                                        title="Copy"
                                        onClick={this.updateData}
                                        disabled={configuredRole == BlankTemplateName || copyRolesData == "save"}
                                      >

                                        <i className="fa fa-copy" aria-hidden="true"
                                        ></i>{" "}  Copy Role
                                      </button>
                                    </div>
                                  </div>
                                </div> : <></>}

                                <FormGroup col>
                                  <Col sm={12} className="text-field ml-0 pl-0">
                                    <Input
                                      id="name"
                                      name="name"
                                      type="text"
                                      disabled={disabled}
                                      value={FormName}
                                      onBlur={handleBlur}
                                      onChange={(e) => this.handleChangeData(e, "FormName")}
                                      className="form-control text-form"
                                      required
                                    />
                                    <label className="fixed-label">Name</label>
                                  </Col>
                                </FormGroup>
                                <FormGroup col>
                                  <Col sm={12} className="text-field ml-0 pl-0">
                                    <Input
                                      id="description"
                                      name="description"
                                      type="textarea"
                                      disabled={disabled}
                                      value={FormDescription}
                                      onBlur={handleBlur}
                                      onChange={(e) => this.handleChangeData(e, "FormDescription")}
                                      // onChange={handleChange}
                                      className="form-control text-form"
                                      maxLength="500"
                                      rows="3"
                                      required
                                    />
                                    <div class="floatRight blckClr">{FormDescription ? FormDescription.length : 0}/500 characters</div>
                                    <label className="fixed-label">Description</label>

                                  </Col>
                                </FormGroup>

                              </div>

                              {screen == 1 ? <div className='col-lg-5  p-2 oneTimeGloablSec'>
                                <span >This is the one time option to select the Global roles and get them saved for a client, once you saved and continue to the next step, you will not be able to select the Global Roles, however, you will still have option to add new roles.</span>
                              </div> : null}
                              {/* </form>

                                  );
                                }.bind(this)}
                              </Formik> */}


                              <div className="tabs-section pt-3">
                                <ul className="nav nav-tabs navHeader " role="tablist">
                                  <li className="nav-item">
                                    <span className={`nav-link ${currentTab == "pages" ? 'active' : ""}`} onClick={() => showTabs("pages")}>Pages</span>
                                  </li>
                                  <li className="nav-item">
                                    <a className={`nav-link ${currentTab == "widgets" ? 'active' : ""}`} onClick={() => showTabs("widgets")}>Widgets</a>
                                  </li>
                                  <li className="nav-item">
                                    <a className={`nav-link ${currentTab == "reports" ? 'active' : ""}`} onClick={() => showTabs("reports")}>Reports</a>
                                  </li>
                                  {showFunction && !AddMode ? <li className="nav-item">
                                    <a className={`nav-link ${currentTab == "functions" ? 'active' : ""}`} onClick={() => showTabs("functions")}>Functions</a>
                                  </li> : null}
                                </ul>



                                <div className="tab-content">
                                  {currentTab == "pages" ?
                                    <div className="tab-pane active p-0" id="Page">
                                      <div className="table-responsive">
                                        <table className="table table-striped">
                                          <thead>
                                            <tr>
                                              <th scope="col" style={{ width: "25%" }}>{currentTab.toUpperCase()} Name</th>
                                              <th scope="col" style={{ width: "10%" }}>View</th>
                                              <th scope="col" style={{ width: "10%" }}>Edit</th>
                                              <th scope="col" style={{ width: "55%" }}>Notes</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {permissionPageData.data && permissionPageData.data.length > 0 ?
                                              permissionPageData.data.map((x, index) => {
                                                return <tr key={index}>
                                                  <td scope="row">{x.name}</td>
                                                  <td >
                                                    <input disabled={disabled} checked={x.isViewAllowed}
                                                      onClick={() => this.ChangeCheckbox(x, "permissionPageData", "isViewAllowed", "pageId")}
                                                      disabled={x.name && x.name.toLowerCase() == "dashboard"}
                                                      type="checkbox" id={"exampleCheck1"}
                                                    />
                                                  </td>
                                                  <td>
                                                    <input disabled={disabled} checked={x.isEditAllowed}

                                                      onClick={() => this.ChangeCheckbox(x, "permissionPageData", "isEditAllowed", "pageId")}
                                                      disabled={x.name && x.name.toLowerCase() == "dashboard"}
                                                      type="checkbox" id={x._id}
                                                    />
                                                  </td>
                                                  <td>{x.description}</td>
                                                </tr>
                                              })
                                              : <></>}

                                          </tbody>
                                        </table>
                                      </div>

                                    </div>

                                    : <></>}
                                  {currentTab == "widgets" ?
                                    <div className="tab-pane active p-0" id="Widgets">
                                      <div className="table-responsive">
                                        <table className="table table-striped">
                                          <thead>
                                            <tr>
                                              <th scope="col" style={{ width: "25%" }}>{currentTab.toUpperCase()} Name</th>
                                              <th scope="col" style={{ width: "10%" }}>View</th>
                                              <th scope="col" style={{ width: "55%" }}>Notes</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {permissionWidgetData.data && permissionWidgetData.data.length > 0 ?
                                              permissionWidgetData.data.map((x, index) => {
                                                return <tr key={index}>
                                                  <td scope="row">{x.name}</td>
                                                  <td >
                                                    <input disabled={disabled} checked={x.isViewAllowed}
                                                      onClick={() => this.ChangeCheckbox(x, "permissionWidgetData", "isViewAllowed", "widgetId")}
                                                      type="checkbox" id="exampleCheck1"
                                                    /></td>
                                                  <td>{x.description}</td>
                                                </tr>
                                              })

                                              : <></>}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                    : <></>}
                                  {currentTab == "reports" ?
                                    <div className="tab-pane active p-0" id="Reports">
                                      <div className="table-responsive">
                                        <table className="table table-striped">
                                          <thead>
                                            <tr>
                                              <th scope="col" style={{ width: "25%" }}>{currentTab.toUpperCase()} Name</th>
                                              <th scope="col" style={{ width: "10%" }}>View</th>
                                              <th scope="col" style={{ width: "55%" }}>Notes</th>
                                            </tr>
                                          </thead>
                                          <tbody>


                                            {permissionReportsData.data && permissionReportsData.data.length > 0 ?
                                              permissionReportsData.data.map((x, index) => {
                                                return <tr key={index}>
                                                  <td scope="row">{x.name}</td>
                                                  <td >
                                                    <input disabled={disabled} checked={x.isViewAllowed}
                                                      onClick={() => this.ChangeCheckbox(x, "permissionReportsData", "isViewAllowed", "reportId")}
                                                      type="checkbox" id="exampleCheck1" /></td>
                                                  <td>{x.description}</td>
                                                </tr>
                                              })
                                              : <></>}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                    : <></>}
                                  {currentTab == "functions" ?

                                    <div className="tab-pane active p-0" id="Functions">
                                      <div className="table-responsive">
                                        <table className="table table-striped">
                                          <thead>
                                            <tr>
                                              <th scope="col" style={{ width: "25%" }}>{currentTab.toUpperCase()} Name</th>
                                              <th scope="col" style={{ width: "10%" }}>View</th>
                                              <th scope="col" style={{ width: "55%" }}>Notes</th>
                                            </tr>
                                          </thead>
                                          <tbody>

                                            {permissionFunctionData.data && permissionFunctionData.data.length > 0 ?
                                              permissionFunctionData.data.map((x, index) => {
                                                if (x[showFunctionVar]) {
                                                  return <tr key={index}>
                                                    <td scope="row">{x.name}</td>
                                                    <td >
                                                      <input disabled={disabled} checked={x.isViewAllowed}
                                                        onClick={() => this.ChangeCheckbox(x, "permissionFunctionData", "isViewAllowed", "functionId")}
                                                        type="checkbox" id="exampleCheck1" /></td>
                                                    <td>{x.description}</td>
                                                  </tr>
                                                }

                                              })
                                              : <></>}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                    : <></>}
                                </div>
                                <div>
                                  {screen == 2 && (viewMode || AddMode) && !disabled ?
                                    <button type="submit" className="btn formButton floatRight mb-2" ><i className="fa fa-save" aria-hidden="true"></i> {" "} Save</button> : null}

                                  {screen == 2 && viewMode && !AddMode ?
                                    <button onClick={this.DeleteRole} type="button" className="btn formButton floatRight mr-4 mb-2" >
                                      <i className="fa fa-trash" aria-hidden="true" ></i>
                                      {" "} Delete
                                    </button> : null}

                                  {screen == 2 && (AddMode || viewMode) ?
                                    <button type="button" onClick={this.CancelNewRole} className="btn formButton floatRight mr-4 mb-2" >
                                      <i className="fa fa-close" aria-hidden="true" ></i>
                                      {" "} Cancel</button> : null}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3">
                            {screen == 2 && !viewMode && !AddMode ?
                              <button type="button" onClick={() => this.onSaveContinue("SC")} className="btn formButton floatRight mb-3 ml-2 mr-3" ><i className="fa fa-save" aria-hidden="true"></i> {" "}  Save & Continue</button> : null}
                          </div>

                        </div>
                      </div>
                    </div>
                  </form>
                </Col>
              </Row>
            );
          }.bind(this)}
        </Formik>
      </div>
    );
  }


}


ClientRoleForm.contextTypes = {
  router: PropTypes.object.isRequired,
};

function mapStateToProps(state, ownProps) {
  console.log(state, "state");

  return {
    initialValues: state.roleData.data || {
      name: "",
      description: "",
      permissions: [],
    },
    roleData: state.roleData,
    clientData: state.clientData,
    AdminRolesData: state.getAdminRoles,
    permissionPageData: state.permissionPageData,
    permissionFunctionData: state.permissionFunctionData,
    permissionReportsData: state.permissionReportsData,
    permissionWidgetData: state.permissionWidgetData,
    roleIdData: state.roleIdData.roleIdData,
    updateRolePermission: state.updateRolePermission.updateRole,
    getClientRoles: state.getClientRoles,
    getClientPermission: state.getClientPermission
  };
}

var ClientRoleModule = connect(mapStateToProps)(ClientRoleForm);
export default ClientRoleModule;
