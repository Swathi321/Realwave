import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { Col, FormGroup, Input, Label, Row } from "reactstrap";
import {
  roleData, saveActivityLog, permissionPageData, permissionFunctionData
  , permissionWidgetData, permissionReportsData, createRole, roleIdData, updatePermissionData, deleteRole
} from "../../redux/actions/httpRequest";
import TabsTables from "./TabsTables";
import { clearCreateRoleData, createRoleAction, getroleIds, roleUpdate } from "../../redux/actions/index";
import PropTypes from "prop-types";
import swal from "sweetalert";
import { Formik } from "formik";
import * as Yup from "yup";
import CardWrapper from "../../component/CardWrapper";
import LoadingDialog from "../../component/LoadingDialog";
import utils from "../../Util/Util";
import Permission from "./Permission";
import consts from "../../Util/consts";
import "../../scss/roleForm.scss";
import $ from "jquery";
import api from '../../redux/httpUtil/serverApi';
import { instance } from '../../redux/actions/index';
import { cloneDeep } from 'lodash';

(function ($) {
  "use strict";

  $.fn.floatingLabel = function (option) {
    var parent = $(this).closest(".form-group");

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
export class AddRoleForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      userName: "",
      selectedRole: "",
      copyRolesData: "",
      currentTab: "pages",
      roleData: [],
      permissionPageData: {},
      permissionFunctionData: {},
      permissionReportsData: {},
      permissionWidgetData: {},
      selectedData: [],
      roleIdData: [],
      updateRoleId: "",
      updateData: "",
      deleteStatus: "",
      showField: false,
      isLoading: true,
      roleName: "",
      math: 0,
      columns: [
        { key: 'name', name: 'Name', width: 50, filter: true, sort: true, type: 'string' },
        { key: 'description', name: 'Description', width: 200, filter: true, sort: true, type: 'string' }
      ]
    };
    // console.log(props,"prpspps",this);
    this.onSave = this.onSave.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.isUpdate = this.props.match.params.id !== "0";
  }

  async componentDidMount() {
    let callRoleData = await this.callRoleData();
  }
  callRoleData = () => {
    instance.post(`${api.ROLE_LIST}`, { action: "load" })
      .then(res => {
        console.log(res);
        let data = res.data.data
        let useBlank = { _id: "Use Blank Template", name: "Use Blank Template" }
        data.unshift(useBlank)
        this.setState({ roleData: data });
        this.callPageList();
      }).catch(err => {
        this.setState({ isLoading: false });
        console.log(err);
      })

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
          this.setState({ permissionPageData: { data: res.data.data, status: true } });
          this.callFunctionsList();
        }
      }).catch(err => {
        this.setState({ isLoading: false });
        console.log(err);
      });
  }
  callFunctionsList = () => {
    let filters = [
      {
        "operator": "like",
        "value": "Functions",
        "property": "permType",
        "type": "string"
      },
      {
        "operator": "like",
        "value": true,
        "property": "isForAdminRole",
        "type": "boolean"
      }
    ]

    var bodyFormData = new FormData();
    bodyFormData.append('filters', JSON.stringify(filters));
    bodyFormData.append('page', 1);
    bodyFormData.append('pageSize', 50);
    instance.post(`${api.PERMISSION_LIST_PAGE}`, bodyFormData)
      .then(res => {
        console.log(res);
        if (res.data.data) {
          this.setState({
            permissionFunctionData: { data: res.data.data, status: true }
          })
          this.callWidgetList()
        }
      }).catch(err => {
        console.log(err);
        this.setState({ isLoading: false });
      });
  }

  callWidgetList = () => {

    var bodyFormData = new FormData();
    bodyFormData.append('page', 1);
    bodyFormData.append('pageSize', 100);
    instance.post(`${api.PERMISSION_LIST_WIDGET}`, bodyFormData)
      .then(res => {
        console.log(res);
        if (res.data.data) {
          this.setState({ permissionWidgetData: { data: res.data.data, status: true } });
          this.callReportsList();
        }
      }).catch(err => {
        console.log(err);
        this.setState({ isLoading: false });
      });

  }
  callReportsList = () => {
    this.props.dispatch(permissionReportsData.request({ page: 1, pageSize: 100 }));
    this.setState({ isLoading: false });
  }

  onCancel = () => {
    this.props.history.goBack(-1);
  };

  onSave(values, { setSubmitting }) {
    setSubmitting(false);
    let { params } = this.props.match;
    let { id } = params;
    let loggedData;
    if (id === "0") {
      loggedData = utils.getScreenDetails(
        utils.getLoggedUser(),
        this.props.location,
        consts.Added + " - " + values.name
      );
      this.props.dispatch(saveActivityLog.request({ action: "save", data: loggedData }));
      this.props.dispatch(roleData.request({ action: "save", data: values }, id));
    } else {
      utils.deleteUnUsedValue(values);
      loggedData = utils.getScreenDetails(
        utils.getLoggedUser(),
        this.props.location,
        consts.Update + " - " + values.name
      );
      this.props.dispatch(saveActivityLog.request({ action: "save", data: loggedData }));
      this.props.dispatch(roleData.request({ action: "update", data: values }, id));
    }
  }
  showTabs = (tabName) => {
    this.setState({ currentTab: tabName });
  }

  onDelete = (id) => {

    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this site",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(
      function (willDelete) {
        this.props.dispatch(deleteRole.request(null, id, "PUT"))
      }.bind(this)
    );
  };

  getInitialValueTemplate() {
    return {
      name: "",
      description: "",
      permissions: [],
    };
  }
  handleChange = (e) => {
    console.log(e, e.target.name);
    this.setState({
      [e.target.name]: e.target.value,
      usernameErr: e.target.name === "userName" ? false : this.state.usernameErr
    });
  };
  intialArray = (perm) => {
    let data1 = []
    // 
    perm.forEach(x => {
      let editView = {
        isViewAllowed: false,
        isEditAllowed: false
      }
      if (x.name.toLowerCase() == "dashboard") {
        this.storeCheckedData(x, 'pages', "view");
        this.storeCheckedData(x, 'pages', "edit");
      }
      data1.push({ ...x, ...editView });
    })
    return data1;
  }
  async componentDidUpdate() {

    const { permissionPageData, permissionWidgetData, permissionFunctionData, permissionReportsData } = this.state

    if (this.props.roleData.data != null) {
      if (this.state.roleData.length == 0) {
        let data = this.props.roleData.data.data
        let useBlank = { _id: "Use Blank Template", name: "Use Blank Template" }
        data.unshift(useBlank)

        this.setState({
          roleData: this.props.roleData.data.data
        })
      }
    }
    try {

      if (this.props.permissionPageData.data != null) {
        let data1 = await this.intialArray(this.props.permissionPageData.data.data)


        if (!this.state.permissionPageData.status) {
          let data2 = {
            data: data1,
            status: this.props.permissionPageData.data.success
          }
          this.setState({ permissionPageData: data2 });
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
        let data1 = await this.intialArray(this.props.permissionWidgetData.data.data);
        let status = this.props.permissionWidgetData.data.success;

        let data2 = {
          data: data1,
          status: status
        }
        if (!this.state.permissionWidgetData.status) {
          this.setState({ permissionWidgetData: data2 });
        }
      }
      if (this.props.permissionReportsData.data != null) {
        let data1 = await this.intialArray(this.props.permissionReportsData.data.data);
        let data2 = {
          data: data1,
          status: this.props.permissionReportsData.data.success
        }
        if (!this.state.permissionReportsData.status) {
          this.setState({ permissionReportsData: data2 });
        }
      }
      console.log(this.props.roleIdData._id, this.state.updateRoleId);
      if (this.props.roleIdData != null) {

        if (this.state.selectedRole == "Use Blank Template") {
          console.log(this.props.roleIdData, this.state.userName, this.state.description);
          if (this.props.roleIdData.name == this.state.userName && this.props.roleIdData.description == this.state.description) {
            this.setState({
              userName: "",
              description: ""
            });
          }
        }
        if (this.props.roleIdData._id != this.state.updateRoleId) {
          if (this.state.selectedRole == "Use Blank Template") {
            if (this.props.roleIdData.name == this.state.userName && this.props.roleIdData.description == this.state.description) {
              this.setState({
                userName: "",
                description: ""
              });
            }
          } else if (this.state.copyRolesData == "save") {
            this.setState({
              userName: "",
              description: ""
            });
          }
          else {
            let permissions = cloneDeep(this.props.roleIdData.permissions);

            if (permissions && permissions.length) {
              permissions.forEach(ob => {
                if (ob.pageId && ob.pageId.name === "Dashboard") {
                  ob.isViewAllowed = true;
                  ob.isEditAllowed = true;
                }
              })
            }

            await this.setState({
              // roleIdData: this.props.roleIdData.permissions,
              roleIdData: permissions,
              updateRoleId: this.props.roleIdData._id,
              userName: this.props.roleIdData.name,
              description: this.props.roleIdData.description,
            });
            if (this.state.roleIdData && permissionPageData.status == true &&
              permissionFunctionData.status == true && permissionWidgetData.status == true && permissionReportsData.status == true) {
              if (this.state.math <= 1) {
                if (this.state.selectedRole != "Use Blank Template") {
                  this.showRoleIdData(permissions)
                  // this.showRoleIdData(this.props.roleIdData.permissions)
                } else this.setState({ isLoading: false });
              } else {
                this.state.math = 0
                this.setState({ isLoading: false });
              }
            }
          }
        }
      }
      if (this.props.deleteRole.data != null) {
        if (this.state.deleteStatus.length == 0) {
          this.setState({
            deleteStatus: this.props.deleteRole.data
          })
        }
      }

      if (Object.keys(this.props.createRole).length > 0) {

        this.setState({ isLoading: false });

        if (this.props.createRole.errmsg) {
          swal({
            title: "Status",
            text: this.props.createRole.errmsg,
            icon: "warning",
            showCancelButton: false,
            showConfirmButton: true,
            dangerMode: true,
          }).then(
            function () {
              this.props.dispatch(clearCreateRoleData())
            }.bind(this)
          );
        } else {
          swal({
            title: "Status",
            text: this.props.createRole.message,
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

    } catch (err) {
      this.setState({ isLoading: false });
      // console.log(err);
    }
  }
  
  updateState = () => {

    console.log("updateState", this.state.permissionPageData, this.state.math);
    this.setState({
      showField: true,
      math: this.state.math + 1,
      permissionFunctionData: this.state.permissionFunctionData,
      permissionReportsData: this.state.permissionReportsData,
      permissionPageData: this.state.permissionPageData,
      permissionWidgetData: this.state.permissionWidgetData,
      isLoading: false
    });
  }
  showRoleIdData = async (data) => {

    let dat = await data.forEach(async x => {
      if (x.pageId) {
        this.state.permissionPageData.data = await this.state.permissionPageData.data.map(y => {

          if (y._id == x.pageId._id) {
            y.isEditAllowed = y.name.toLowerCase() == "dashboard" ? true : x.isEditAllowed;
            y.isViewAllowed = y.name.toLowerCase() == "dashboard" ? true : x.isViewAllowed;
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
    let da = await this.updateState();
  }
  saveName = () => {
    this.setState({ showField: true, isLoading: false });
  }
  checkElement = (checkedData, _id) => {
    let value = 0;
    for (let i = 0; i < checkedData.length; i++) {
      if (checkedData[i].id == _id) {
      } else {
        value = value + 1;
      }
    }
    if (value != checkedData.length) {
      return true;
    } else {
      return false;
    }
  }
  finalDataCheck = () => {
    let c = [];
    this.state.selectedData.forEach(x => {
      if (x.isEditAllowed || x.isViewAllowed) c.push(x);
    });

    this.setState({ selectedData: c });
  }
  pushCheckedData = (tabData, clickedData, perm) => {
    let editView = {};
    let checkTheData = this.state.selectedData;
    if (checkTheData.length == 0) {
      let data = {}
      if (this.state.copyRolesData == "save") {
        if (perm == "edit") {
          editView = {
            isViewAllowed: clickedData.isViewAllowed,
            isEditAllowed: clickedData.isEditAllowed
          }
        } else {
          editView = {
            isViewAllowed: clickedData.isViewAllowed,
            isEditAllowed: clickedData.isEditAllowed
          }
        }
      } else {
        if (perm == "edit") {
          editView = {
            isViewAllowed: false,
            isEditAllowed: true
          }
        } else {
          editView = {
            isViewAllowed: true,
            isEditAllowed: false
          }
        }
      }
      data = { ...tabData, ...editView };
      this.state.selectedData.push(data);
    } else {
      let con = this.checkElement(checkTheData, clickedData._id)
      if (!con) {
        let record = this.state.selectedData;
        if (this.state.copyRolesData == "save") {
          if (perm == "edit") {
            editView = {
              isViewAllowed: clickedData.isViewAllowed,
              isEditAllowed: clickedData.isEditAllowed
            }
          } else {
            editView = {
              isViewAllowed: clickedData.isViewAllowed,
              isEditAllowed: clickedData.isEditAllowed
            }
          }
          // console.log(editView);
        } else {
          if (perm == "edit") {
            editView = {
              isViewAllowed: false,
              isEditAllowed: true
            }
          } else {
            editView = {
              isViewAllowed: true,
              isEditAllowed: false
            }
          }
        }
        record.push({ ...tabData, ...editView });
        this.setState({ selectedData: record });
      }
      else {

        this.state.selectedData = this.state.selectedData.map(x => {
          if (x.id == clickedData._id) {
            if (this.state.copyRolesData == "save") {
              if (perm == "edit") {
                editView = {
                  isViewAllowed: x.isViewAllowed,
                  isEditAllowed: !x.isEditAllowed
                }
              } else {
                editView = {
                  isViewAllowed: !x.isViewAllowed,
                  isEditAllowed: x.isEditAllowed
                }
              }
              x = { ...editView, ...tabData }

            } else {
              if (perm == "edit") {
                editView = {
                  isViewAllowed: x.isViewAllowed,
                  isEditAllowed: !x.isEditAllowed
                }
              } else {
                editView = {
                  isViewAllowed: !x.isViewAllowed,
                  isEditAllowed: x.isEditAllowed
                }
              }
              x = { ...editView, ...tabData }
            }

            return x;
          } else {
            return x;
          }
        });
      }
    }
    console.log(checkTheData, "checkTheData", this.state.selectedData, this.state.permissionPageData);
  }
  updateCheck = async (id, row, tab) => {

    let data1 = [];
    console.log(row);
    await row.data.forEach(x => {
      let obj = {}
      if (x._id == id) {

        if (tab == "edit") {
          x.isEditAllowed = !x.isEditAllowed;
          obj = { ...x };
          console.log(obj);
        } else {
          x.isViewAllowed = !x.isViewAllowed;
          obj = { ...x };
        }
        data1.push(obj);
      } else {
        obj = { ...x };
        data1.push(obj);
      }
    });
    console.log(data1);
    return data1;
  }
  updateData = () => {

    console.log(this.state.permissionPageData, this.state.permissionReportsData, this.state.permissionReportsData);
    if (this.state.selectedRole != "") {
      this.setState({
        showField: true,
        copyRolesData: "save",
        userName: "",
        isLoading: false
      });
    }
  }
  storeCheckedData = async (clickedData, tab, perm) => {

    console.log("happy", tab, clickedData, perm, this.state.permissionPageData);
    switch (tab) {
      case "pages":

        let pageData = {
          pageId: clickedData._id,
          widgetId: null,
          reportId: null,
          functionId: null,
          id: clickedData._id
        }
        let pageCheck = [];

        console.log(pageCheck, this.state.permissionPageData);
        let page = await this.updateCheck(clickedData._id, this.state.permissionPageData, perm)
        let check1 = await this.pushCheckedData(pageData, clickedData, perm)
        console.log(this.state.permissionPageData, "check1", page);
        let permPage = {
          data: this.state.permissionPageData.data,
          status: true
        }
        await this.setState({ permissionPageData: permPage });

        if (this.state.copyRolesData == "")
          await this.finalDataCheck(this.state.selectedData)

        return clickedData
      case "widgets":
        let widgetData = {
          pageId: null,
          widgetId: clickedData._id,
          reportId: null,
          functionId: null,
          id: clickedData._id
        }
        let widgetCheck = []
        widgetCheck = await this.updateCheck(clickedData._id, this.state.permissionWidgetData, perm)
        let check2 = await this.pushCheckedData(widgetData, clickedData, perm)
        let permWid = {
          data: widgetCheck,
          status: true
        }
        await this.setState({
          permissionWidgetData: permWid
        })
        if (this.state.copyRolesData == "")
          await this.finalDataCheck(this.state.selectedData)
        return widgetData

      case "reports":
        let reportsData = {
          pageId: null,
          widgetId: null,
          reportId: clickedData._id,
          functionId: null,
          id: clickedData._id
        }
        let reportCheck = []
        reportCheck = await this.updateCheck(clickedData._id, this.state.permissionReportsData, perm)
        let check3 = await this.pushCheckedData(reportsData, clickedData, perm)
        let permRepo = {
          data: reportCheck,
          status: true
        }
        await this.setState({
          permissionReportsData: permRepo
        })
        if (this.state.copyRolesData == "")
          await this.finalDataCheck(this.state.selectedData)
        return reportsData
      case "functions":
        let functionData = {
          pageId: null,
          widgetId: null,
          reportId: null,
          functionId: clickedData._id,
          id: clickedData._id
        }
        let funCheck = []
        funCheck = await this.updateCheck(clickedData._id, this.state.permissionFunctionData, perm)
        await this.pushCheckedData(functionData, clickedData, perm)
        let permFun = {
          data: funCheck,
          status: true
        }
        await this.setState({
          permissionFunctionData: permFun
        })
        if (this.state.copyRolesData == "")
          await this.finalDataCheck(this.state.selectedData)

        return functionData
      default:
        return clickedData
    }
  }

  checkItem = (id, data) => {
    const even = (check) => {
      if (check.pageId)
        return check.pageId == id
      else if (check.widgetId)
        return check.widgetId == id
      else if (check.reportId)
        return check.reportId == id
      else
        return check.functionId == id
    };
    return data.some(even);
  }
  commonUpdateCopy = () => {

    let data2 = []
    data2 = this.state.selectedData
    console.log(data2, this.state.roleIdData);
    this.state.roleIdData.forEach(x => {
      console.log(x);
      let check = false;
      if (x.pageId)
        check = (y) => y.id == x.pageId._id;
      else if (x.widgetId)
        check = (y) => y.id == x.widgetId._id;
      else if (x.functionId)
        check = (y) => y.id == x.functionId._id;
      else if (x.reportId) {
        console.log(x.reportId);
        check = (y) => y.id == x.reportId._id;
      }
      if (check && !data2.some(check) && !x.functionId) {

        data2.push(x)
      }
    })
    return data2
  }
  saveCreateRole = async () => {

    const { description, userName, selectedData, copyRolesData } = this.state;
    let checkedData1 = [];

    if (!userName) {
      this.setState({ usernameErr: true });
    } else {
      this.setState({ isLoading: true });

      if (copyRolesData == "save") {
        checkedData1 = await this.commonUpdateCopy()
      }

      let data = {
        name: userName,
        description: description,
        permissions: copyRolesData == "save" ? checkedData1 : selectedData,
        isAdminRole: false,
        isClientAdminRole: false,
        isInstallerRole: false,
        clientId: null,
        createdByUserId: 1
      }

      this.props.dispatch(createRoleAction({
        action: "save",
        data: data
      }));

      if (copyRolesData == "save") {
        this.setState({ selectedData: [] });
      }
    }
  }

  secondIntialArray = (perm) => {
    let data1 = [];

    perm.forEach(x => {
      x.isViewAllowed = false
      x.isEditAllowed = false
      if (x.name.toLowerCase() == "dashboard") {
        this.storeCheckedData(x, 'pages', "view");
        this.storeCheckedData(x, 'pages', "edit");
      }
      console.log(x);
      data1.push(x);
    })
    return data1;
  }
  handleSelect = async (e) => {
    e.persist()
    this.setState({ isLoading: true });
    console.log(e.target.value, e.target.name);
    let { permissionPageData, permissionFunctionData, permissionReportsData, permissionWidgetData } = this.state

    if (permissionPageData.status && permissionFunctionData.status && permissionReportsData.status && permissionWidgetData.status) {

      if (e.target.value == "Use Blank Template") {

        console.log(permissionPageData, permissionFunctionData, permissionReportsData, permissionWidgetData, this.state.selectedRole, e.target.value);
        let page = await this.secondIntialArray(permissionPageData.data)
        let func = await this.secondIntialArray(permissionFunctionData.data)
        let report = await this.secondIntialArray(permissionReportsData.data)
        let wid = await this.secondIntialArray(permissionWidgetData.data)
        console.log(page);
        this.setState({
          permissionPageData: { data: page, status: true },
          permissionFunctionData: { data: func, status: true },
          permissionReportsData: { data: report, status: true },
          permissionWidgetData: { data: wid, status: true },
          showField: true,
          userName: "",
          copyRolesData: "",
          description: "",
          isLoading: false
        }, () => {
          if (this.state.userName.length == 0 && this.state.description.length == 0) {
            this.setState({ selectedRole: "Use Blank Template" });
          }
          this.setState({ isLoading: false });
        })
      } else {
        let fetchBody = {
          populate: ["permissions.widgetId", "permissions.pageId", "permissions.reportId", "permissions.functionId"],
          id: e.target.value
        }
        await this.setState({ selectedRole: e.target.value });
        let wait = await this.props.dispatch(getroleIds(fetchBody));
      }
    }
  }

  render() {
    const { onCancel, props, onDelete, isUpdate, showTabs } = this;
    const { initialValues } = props;
    const { userName, selectedRole, currentTab, roleData, permissionPageData, roleIdData,
      permissionFunctionData, roleName, description, showField, permissionWidgetData, permissionReportsData, copyRolesData, usernameErr, isLoading } = this.state;
    const { name } = initialValues || { name: "" };
    const options = [
      { value: "chocolate", label: "Chocolate" },
      { value: "strawberry", label: "Strawberry" },
      { value: "vanilla", label: "Vanilla" },
    ];
    let initialValuesEdit = initialValues;

    if (initialValues.error || (initialValues && initialValues.errmsg)) {
      initialValuesEdit = this.state.data;
    }
    console.log(userName && description &&
      selectedRole == "Use Blank Template", userName && description, userName, description);
    // let isFetching = roleData && roleData.isFetching;
    // isFetching = isFetching || (roleData && roleData.isFetching);
    let isFetching = !roleData;
    return (
      <div className="animated fadeIn">
        <LoadingDialog isOpen={isFetching || isLoading} />

        <Formik
          enableReinitialize={true}
          initialValues={initialValuesEdit}
          onSubmit={this.onSave}
          validationSchema={Yup.object().shape({
            name: Yup.string().trim().required("Required"),
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
                  <form onSubmit={handleSubmit}>
                    <CardWrapper
                      lg={12}
                      footer={
                        (selectedRole && permissionPageData.status && permissionFunctionData.status && permissionReportsData.status && permissionWidgetData.status) &&
                        <div className={"form-button-group"}>
                          <div>
                            <button
                              type="submit"
                              className="btn formButton"
                              onClick={() => this.saveCreateRole()}
                              disabled={isSubmitting}
                            >
                              <i className="fa fa-save" aria-hidden="true"></i>{" "}
                              Save
                            </button>
                          </div>
                          <div>
                            {" "}
                            <button
                              type="button"
                              className="btn formButton"
                              onClick={onCancel}
                              disabled={isSubmitting}
                            >
                              <i className="fa fa-close" aria-hidden="true"></i>{" "}
                              Cancel
                            </button>
                          </div>
                          {!isUpdate && (
                            <div>
                              {" "}
                              <button
                                type="button"
                                className="btn formButton"
                                onClick={() => onDelete(this.state.updateRoleId)}
                                disabled={isSubmitting}
                              >
                                <i
                                  className="fa fa-trash"
                                  aria-hidden="true"
                                ></i>{" "}
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      }
                    >

                      <div className="row">
                        <div className="col">
                          <div className="container-ie table-header-area row">
                            <div className="col-12 col-sm-12 col-md-4 col-lg-5">
                              <div className="cameracardText textConvert gridHeader">
                                Role
                              </div>
                            </div>
                          </div>
                          <br />
                          <div className="roes-page-section">
                            <div className="card">
                              <div className="bg-white pt-3 pb-3">
                                <div className="row">
                                  <div className="col-lg-6">
                                    <form
                                      className="floating-label-form needs-validation bootstrap-form"
                                      novalidate
                                    >

                                      <div className="form-group">
                                        <div className="d-flex">
                                          <div className="w-100">

                                            <div className="w-100 position-relative pl-3">
                                              <select
                                                disabled={copyRolesData == "save" ? true : false}
                                                value={this.state.selectedRole}
                                                name="selectedRole"
                                                className="form-control custom-select"
                                                onChange={(e) => this.handleSelect(e)}
                                                required=""
                                              >
                                                <option hidden hidden >Select Role</option>
                                                {
                                                  roleData && roleData.map((x, index) => {
                                                    return <option key={index} value={x._id} selected="selected">{x.name}</option>
                                                  })
                                                }
                                              </select>
                                              <label className="fixed-label ml-3" for="userName">Select a Configured Role to Copy the details <span className="red">*</span></label>
                                            </div>

                                          </div>
                                          <div class="ml-2" style={{ minWidth: "110px" }} >
                                            <button
                                              type="submit"
                                              className="btn formButton"
                                              title="Copy"
                                              onClick={this.updateData}
                                              disabled={copyRolesData == "save" ? true : (selectedRole == "" ? true : (selectedRole == "Use Blank Template" ? true : false))}
                                            >
                                              <i className="fa fa-copy" aria-hidden="true"
                                              ></i>{" "}  Copy Role
                                            </button>
                                          </div>
                                        </div>
                                      </div>

                                      {showField ?
                                        <div className=" pl-3">
                                          <div className="form-group">

                                            {selectedRole == "Use Blank Template" ?
                                              <Input
                                                id="firstName"
                                                type="text"
                                                defaultValue={userName}
                                                disabled={selectedRole == "Use Blank Template" ? false : (copyRolesData == "save" ? false : true)}
                                                name="userName"
                                                onChange={(e) => this.handleChange(e)}
                                                onBlur={handleBlur}
                                                className="form-control text-form"
                                                required
                                              />
                                              :
                                              <Input
                                                id="firstName"
                                                type="text"
                                                value={userName}
                                                disabled={selectedRole == "Use Blank Template" ? false : (copyRolesData == "save" ? false : true)}
                                                name="userName"
                                                onChange={(e) => this.handleChange(e)}
                                                onBlur={handleBlur}
                                                className="form-control text-form"
                                                required
                                              />}

                                            <label className="text-label">Role Name <span className={"text-danger"}>*</span></label>

                                            {usernameErr ? <div className="input-feedback">Required</div> : null}

                                          </div>
                                          <div className="form-group">
                                            {selectedRole == "Use Blank Template" ?
                                              <Input
                                                id="description"
                                                type="textarea"
                                                defaultValue={description}
                                                disabled={selectedRole == "Use Blank Template" ? false : (copyRolesData == "save" ? false : true)}
                                                name="description"
                                                onChange={(e) => this.handleChange(e)}
                                                onBlur={handleBlur}
                                                className="form-control text-form"
                                                required
                                              />
                                              :
                                              <Input
                                                id="description"
                                                type="textarea"
                                                value={description}
                                                disabled={selectedRole == "Use Blank Template" ? false : (copyRolesData == "save" ? false : true)}
                                                name="description"
                                                onChange={(e) => this.handleChange(e)}
                                                onBlur={handleBlur}
                                                className="form-control text-form"
                                                required
                                              />
                                            }
                                            {selectedRole == "Use Blank Template" ? <label className="text-label">Description</label> :
                                              (copyRolesData == "save" ? <label className="text-label">Description</label> : <></>)}
                                            <div className="invalid-feedback">
                                              Please write the description
                                              </div>
                                            <p className="atleast text-right mt-1">
                                              Max 500 characters
                                              </p>
                                          </div>
                                        </div> : <></>}

                                    </form>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {showField ?
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
                                </ul>

                                <div className="tab-content">
                                  {currentTab == "pages" ?
                                    <TabsTables currentTab={currentTab} pageData={permissionPageData} copy={this.state.copyRolesData} role={this.state.selectedRole} storeChecked={this.storeCheckedData} />
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
                                            {permissionWidgetData.data.length > 0 ?
                                              permissionWidgetData.data.map((x, index) => {
                                                return <tr key={index}>
                                                  <td scope="row">{x.name}</td>
                                                  <td>
                                                    <input
                                                      checked={x.isViewAllowed}
                                                      onClick={() => this.storeCheckedData(x, "widgets", "view")}
                                                      type="checkbox"
                                                      id="exampleCheck1"
                                                      disabled={selectedRole != "Use Blank Template" ? (copyRolesData == "save" ? false : true) : false}
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

                                            {permissionReportsData.data.length > 0 ?
                                              permissionReportsData.data.map((x, index) => {
                                                return <tr key={index}>
                                                  <td scope="row">{x.name}</td>
                                                  <td>
                                                    <input
                                                      checked={x.isViewAllowed}
                                                      onClick={() => this.storeCheckedData(x, "reports", "view")}
                                                      type="checkbox"
                                                      id="exampleCheck1"
                                                      disabled={selectedRole != "Use Blank Template" ? (copyRolesData == "save" ? false : true) : false}
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
                                  {/* {currentTab == "functions" ?

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

                                            {permissionFunctionData.data.length > 0 ?
                                              permissionFunctionData.data.map((x, index) => {
                                                return <tr key={index}>
                                                  <td scope="row">{x.name}</td>
                                                  <td >
                                                    <input disabled={selectedRole != "Use Blank Template" ? (copyRolesData == "save" ? false : true) : false} checked={x.isViewAllowed} onClick={() => this.storeCheckedData(x, "functions", "view")} type="checkbox" id="exampleCheck1" /></td>
                                                   <td>{x.description}</td>
                                                </tr>
                                              })
                                              : <></>}

                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                    : <></>} */}
                                </div>
                              </div>
                              : <></>}
                          </div>
                        </div>
                      </div>
                    </CardWrapper>
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


AddRoleForm.contextTypes = {
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
    permissionPageData: state.permissionPageData,
    permissionFunctionData: state.permissionFunctionData,
    permissionReportsData: state.permissionReportsData,
    permissionWidgetData: state.permissionWidgetData,
    roleIdData: state.roleIdData.roleIdData,
    deleteRole: state.deleteRole,
    createRole: state.createRole.createRole
  };
}

var RoleFormModule = connect(mapStateToProps)(AddRoleForm);
export default RoleFormModule;