import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { Col, FormGroup, Input, Label, Row } from "reactstrap";
import {
  roleData, saveActivityLog, permissionPageData, permissionFunctionData
  , permissionWidgetData, permissionReportsData, createRole, roleIdData, updatePermissionData, deleteRole
} from "../../redux/actions/httpRequest";
import PropTypes from "prop-types";
import swal from "sweetalert";
import { Formik } from "formik";
import * as Yup from "yup";
import CardWrapper from "../../component/CardWrapper";
import LoadingDialog from "../../component/LoadingDialog";
import utils from "../../Util/Util";
import consts from "../../Util/consts";
import "../../scss/roleForm.scss";
import $ from "jquery";
import api from '../../redux/httpUtil/serverApi';
import { instance } from '../../redux/actions/index'
import { getroleIds, updateRoleAction } from "../../redux/actions/index";

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
export class EditRoleForm extends PureComponent {
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
      deleteStatus: false,
      showField: false,
      isLoading: true,
      showFunction: false,
      showFunctionVar: '',
      roleName: "",
      isSystemRole: "",
      columns: [
        { key: 'name', name: 'Name', width: 50, filter: true, sort: true, type: 'string' },
        { key: 'description', name: 'Description', width: 200, filter: true, sort: true, type: 'string' }
      ]
    };
    console.log(props, "prpspps", this);
    this.onSave = this.onSave.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.isUpdate = this.props.match.params.id !== "0";
  }

  async componentDidMount() {
    if (this.props.match.params.id != 0) {
      this.setState({ copyRolesData: "update" });

      let fetchBody = {
        populate: ["permissions.widgetId", "permissions.pageId", "permissions.reportId", "permissions.functionId"],
        id: this.props.match.params.id
      }
      this.props.dispatch(getroleIds(fetchBody));
    }
    let callRoleData = await this.callPageList()
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
        console.log(err);
        this.setState({ isLoading: false });
      });
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
        console.log(res);
        if (res.data.data) {
          this.setState({ permissionFunctionData: { data: res.data.data, status: true } });
          this.callWidgetList();
        }
      }).catch(err => {
        console.log(err);
        this.setState({ isLoading: false });
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
          this.callReportsList();
        }
      }).catch(err => {
        this.setState({ isLoading: false });
        console.log(err);
      });
  }
  callReportsList = () => {
    this.props.dispatch(permissionReportsData.request({ page: 1, pageSize: 50 }));
    this.setState({ isLoading: false });
  }
  onCancel = () => {
    this.props.history.goBack(-1);
  };

  onSave(values, { setSubmitting }) {
    setSubmitting(false);
    this.setState({ isLoading: true });
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
      showCancelButton: true,
      showConfirmButton: true,
      closeOnCancel: true
    }).then(
      function (willDelete) {
        if (willDelete) {
          this.setState({ isLoading: true });
          instance.put(`${api.DELETE_ROLE}/${id}`)
            .then(res => {

              this.setState({ isLoading: false });

              if (res.data.errmsg) {
                swal({
                  title: "Status",
                  text: res.data.errmsg,
                  icon: "warning",
                  showCancelButton: false,
                  showConfirmButton: true,
                  dangerMode: true,
                });
              }
              if (res.data.msg) this.props.history.push(`/admin/role`);

            }).catch(err => {
              console.log(err);
              this.setState({ isLoading: false });
            });
        }
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
    console.log(e, e.target.value);
    this.setState({
      [e.target.name]: e.target.value,
    }, () => {
      console.log(this.state.userName, this.state.description);
    });
  }

  intialArray = (perm) => {
    let data1 = []
    perm.forEach(x => {
      let editView = {
        isViewAllowed: false,
        isEditAllowed: false
      }

      data1.push({ ...x, ...editView });
    })
    return data1;
  }

  async componentDidUpdate() {
    const { permissionPageData, permissionWidgetData, permissionFunctionData, permissionReportsData, userName } = this.state

    const { updateRolePermission, history, roleIdData } = this.props

    try {
      
      if (Object.keys(updateRolePermission).length > 0) {
        if (updateRolePermission.message) {
          this.setState({ isLoading: false });
          swal({
            title: "Status",
            text: updateRolePermission.message,
            icon: "success",
            showCancelButton: true,
            showConfirmButton: true,
            dangerMode: true,
          }).then(
            function () {
              history.push(`/admin/role`);
            }.bind(this)
          );
        }
      }
      if (this.props.permissionPageData.data != null) {
        let data1 = await this.intialArray(this.props.permissionPageData.data.data);

        if (!this.state.permissionPageData.status) {
          let data2 = {
            data: data1,
            status: this.props.permissionPageData.data.success
          }
          this.setState({ permissionPageData: data2 });
        }

      }
      if (this.props.permissionFunctionData.data != null) {
        let data1 = await this.intialArray(this.props.permissionFunctionData.data.data);

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

        let data1 = await this.intialArray(this.props.permissionReportsData.data.data)
        console.log(this.props.permissionReportsData.data);
        let data2 = {
          data: data1,
          status: this.props.permissionReportsData.data.success
        }
        if (!this.state.permissionReportsData.status) {
          this.setState({ permissionReportsData: data2 });
        }
      }
      if (roleIdData != null) {
        if (roleIdData._id != this.state.updateRoleId) {

          let name = roleIdData.name;
          let description = roleIdData.description;

          if (!(this.state.userName || this.state.description)) {

            await this.setState({
              roleIdData: roleIdData.permissions,
              updateRoleId: roleIdData._id,
              userName: name,
              description: description,
              showFunction: roleIdData.isClientAdminRole || roleIdData.isInstallerRole || roleIdData.isAdminRole,
              showFunctionVar: roleIdData.isClientAdminRole ? 'isForClientAdminRole' : roleIdData.isInstallerRole ? 'isForInstallerRole' : roleIdData.isAdminRole ? 'isForAdminRole' : ''
            });
          }
        }

        if (this.state.roleIdData && permissionPageData.status == true &&
          permissionFunctionData.status == true && permissionWidgetData.status == true && permissionReportsData.status == true) {
          if (this.state.selectedData.length == 0)
            this.showRoleIdData(this.state.roleIdData);
        }
      }

    } catch (err) {
      this.setState({ isLoading: false });
      // console.log(err);
    }

  }
  showRoleIdData = async (data) => {

    await data.forEach(async x => {
      if (x.pageId) {
        let gg = this.state.permissionPageData.data

        this.state.permissionPageData.data = await this.state.permissionPageData.data.map(y => {
          if (y._id == x.pageId._id) {
            y.isEditAllowed = x.isEditAllowed;
            y.isViewAllowed = x.isViewAllowed;
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
            y.isEditAllowed = x.isEditAllowed
            y.isViewAllowed = x.isViewAllowed
            return y;
          } else {
            return y;
          }
        })
      }
    })

    this.setState({ showField: true });
  }
  saveName = () => {
    this.setState({ showField: true });
  }

  checkElement = (checkedData, _id) => {
    let value = 0;
    for (let i = 0; i < checkedData.length; i++) {
      if (checkedData[i].id == _id) {
      } else value = value + 1;
    }

    if (value != checkedData.length) return true;
    else return false;
  }
  finalDataCheck = () => {
    let c = []
    this.state.selectedData.forEach(x => {
      if (x.isEditAllowed || x.isViewAllowed) c.push(x);
    })

    this.setState({ selectedData: c });
  }
  pushCheckedData = (tabData, clickedData, perm) => {
    let editView = {};
    let checkTheData = this.state.selectedData;
    if (checkTheData.length == 0) {
      let data = {}

      if (typeof (clickedData.isViewAllowed) != "undefined") {
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
        if (typeof (clickedData.isViewAllowed) != "undefined") {
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
        record.push({ ...tabData, ...editView });

        this.setState({
          selectedData: record
        })
      }
      else {

        this.state.selectedData = this.state.selectedData.map(x => {
          if (x.id == clickedData._id) {
            if (typeof (clickedData.isViewAllowed) != "undefined") {
              console.log(x);
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

            return x
          } else {
            return x
          }
        });
      }
    }
  }
  updateCheck = async (id, row, tab) => {
    let data1 = []
    console.log(row);
    await row.data.forEach(x => {
      let obj = {}
      if (x._id == id) {

        if (tab == "edit") {
          x.isEditAllowed = !x.isEditAllowed;
          obj = { ...x }
          console.log(obj);
        } else {
          x.isViewAllowed = !x.isViewAllowed;
          obj = { ...x }
        }
        data1.push(obj)
      } else {
        obj = { ...x }
        data1.push(obj)
      }
    });
    return data1;
  }
  updateData = () => {
    this.setState({
      showField: true,
      copyRolesData: "save"
    });
  }
  storeCheckedData = async (clickedData, tab, perm) => {
    debugger
    console.log("happy", tab, clickedData, perm, this.state.permissionPageData);
    switch (tab) {
      case "page":

        let pageData = {
          pageId: clickedData._id,
          widgetId: null,
          reportId: null,
          functionId: null,
          id: clickedData._id
        }
        let pageCheck = [];

        pageCheck = await this.updateCheck(clickedData._id, this.state.permissionPageData, perm);
        let check1 = await this.pushCheckedData(pageData, clickedData, perm);

        let permPage = {
          data: pageCheck,
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
        await this.setState({ permissionReportsData: permRepo });

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
        console.log(x);
        check = (y) => y.id == x.reportId._id;
      }

      if (typeof (check) === "function" && !data2.some(check)) {
        data2.push(x);
      }
    })
    return data2;
  }
  saveCreateRole = async () => {

    this.setState({ isLoading: true });

    let data = {};
    let checkedData1 = [];
    console.log(this.state.selectedData, this.state.roleIdData);
    if (this.state.copyRolesData == "save") {
      checkedData1 = await this.commonUpdateCopy()
      console.log(checkedData1);

      let data = {
        name: this.state.userName,
        description: this.state.description,
        permissions: checkedData1,
        isAdminRole: false,
        isClientAdminRole: false,
        isInstallerRole: false,
        clientId: null,
        createdByUserId: 1
      }
      await this.props.dispatch( createRole.request({ action: "save", data: data }));
      this.props.history.push(`/admin/role`)

      this.setState({ selectedData: [] });

    } else if (this.state.copyRolesData == "update") {
      checkedData1 = await this.commonUpdateCopy()
      console.log(checkedData1);

      let data = {
        name: this.state.userName,
        description: this.state.description,
        permissions: checkedData1,
        clientId: null,
        createdByUserId: 1
      }
      await this.props.dispatch( updateRoleAction({ action: "update", data: data }, this.state.updateRoleId));

    } else {

      data = {
        name: this.state.userName,
        description: this.state.description,
        permissions: this.state.selectedData,
        isAdminRole: true,
        isClientAdminRole: false,
        isInstallerRole: false,
        clientId: null,
        createdByUserId: 1
      }
      await this.props.dispatch( createRole.request({ action: "save", data: data }));
    }
  }
  handleSelect = async (e) => {

    if (e.target.value == "Use Blank Template") {
      this.setState({
        selectedRole: e.target.value,
        showField: true
      });
    } else {
      this.props.dispatch(roleIdData.request({
        "populate": ["permissions.widgetId", "permissions.pageId", "permissions.reportId", "permissions.functionId"]
      }, e.target.value));
      this.setState({ selectedRole: e.target.value });
    }
  }

  render() {

    const { onCancel, props, onDelete, isUpdate, showTabs } = this;
    const { initialValues } = props;
    const { userName, selectedRole, currentTab, roleData, permissionPageData,
      permissionFunctionData, roleName, description, showField, permissionWidgetData, permissionReportsData, copyRolesData, roleIdData, showFunction, showFunctionVar, isLoading } = this.state;
    const { name } = initialValues || { name: "" };

    let initialValuesEdit = initialValues;

    if (initialValues.error || (initialValues && initialValues.errmsg)) {
      initialValuesEdit = this.state.data;
    }

    let isFetching = roleData && roleData.isFetching;
    isFetching = isFetching || (roleData && roleData.isFetching);
    console.log('roleData roleData', roleData)
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
                      role={this.state.selectedRole}
                      copyRolesData={copyRolesData}
                      footer={
                        (userName && permissionFunctionData.status && permissionWidgetData.status && permissionPageData.status &&
                          permissionReportsData.status) &&
                        <div className={"form-button-group"}>
                          <div>
                            <button
                              type="submit"
                              className="btn formButton"
                              onClick={() => this.saveCreateRole()}
                              disabled={copyRolesData == "save" ? (userName && description ? false : true) : false}
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

                          <div>
                            {isUpdate && (
                              <>
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
                              </>
                            )}
                          </div>
                        </div>
                      }
                    >

                      <div className="row">
                        <div className="col">
                          <div className="wrapper"></div>
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
                                        {copyRolesData != "update" ?
                                          <div className="d-flex">
                                            <div className="w-100">
                                              <div className="w-100 position-relative">
                                                <select disabled={copyRolesData == "save" ? true : false} value={this.state.selectedRole} name="selectedRole" onChange={(e) => this.handleSelect(e)} className="form-control custom-select" required="">
                                                  <option   >Select Role</option>
                                                  <option selected="true"  >Use Blank Template</option>
                                                  {
                                                    roleData && roleData.map((x, index) => {
                                                      return <option key={index} value={x._id} selected="selected">{x.name}</option>
                                                    })
                                                  }
                                                </select>
                                                <label className="fixed-label1" for="userName">Select a Configured Role to Copy the details <span className="red">*</span></label>
                                              </div>
                                            </div>
                                            <div
                                              style={{ minWidth: "108px" }}
                                            >
                                              <button
                                                type="submit"
                                                className="btn formButton"
                                                title="Save"
                                                onClick={this.updateData}
                                                disabled={copyRolesData == "save" ? true : false}
                                              >
                                                <i
                                                  className="fa fa-save"
                                                  aria-hidden="true"
                                                ></i>{" "}
                                                   Copy Role
                                                  </button>
                                            </div>
                                          </div>
                                          : <></>}
                                      </div>

                                      {showField ?
                                        <div className="pl-3">
                                          <div className="form-group">

                                            <Input
                                              id="firstName"
                                              type="text"
                                              name="userName"
                                              defaultValue={userName}
                                              onChange={(e) => this.handleChange(e)}
                                              onBlur={handleBlur}
                                              className="form-control text-form"
                                              required
                                            />
                                            <label className="text-label">Role Name</label>

                                          </div>
                                          <div className="form-group">

                                            <Input
                                              id="description"
                                              type="textarea"
                                              name="description"
                                              onChange={(e) => this.handleChange(e)}
                                              onBlur={handleBlur}
                                              defaultValue={description}
                                              className="form-control text-form"
                                              required
                                            />
                                            <label className="text-label">Description</label>
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
                                  {showFunction ? <li className="nav-item">
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
                                            {permissionPageData.data.length > 0 ?
                                              permissionPageData.data.map((x, index) => {
                                                return <tr key={index}>
                                                  <td scope="row">{x.name}</td>
                                                  <td >
                                                    <input checked={x.isViewAllowed} onClick={() => this.storeCheckedData(x, "page", "view")} disabled={x.name.toLowerCase() == "dashboard"} type="checkbox" id="exampleCheck1"
                                                    />
                                                  </td>
                                                  <td>
                                                    <input checked={x.isEditAllowed} disabled={x.name.toLowerCase() == "dashboard"} onClick={() => this.storeCheckedData(x, "page", "edit")} type="checkbox" id={x._id}
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
                                            {permissionWidgetData.data.length > 0 ?
                                              permissionWidgetData.data.map((x, index) => {
                                                return <tr key={index}>
                                                  <td scope="row">{x.name}</td>
                                                  <td >
                                                    <input checked={x.isViewAllowed} onClick={() => this.storeCheckedData(x, "widgets", "view")} type="checkbox" id="exampleCheck1"
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


                                            {permissionReportsData.data.length > 0 ?
                                              permissionReportsData.data.map((x, index) => {
                                                return <tr key={index}>
                                                  <td scope="row">{x.name}</td>
                                                  <td >
                                                    <input checked={x.isViewAllowed} onClick={() => this.storeCheckedData(x, "reports", "view")} type="checkbox" id="exampleCheck1" /></td>
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

                                            {permissionFunctionData.data.length > 0 ?
                                              permissionFunctionData.data.map((x, index) => {
                                                if (x[showFunctionVar]) {
                                                  return <tr key={index}>
                                                    <td scope="row">{x.name}</td>
                                                    <td >
                                                      <input checked={x.isViewAllowed} onClick={() => this.storeCheckedData(x, "functions", "view")} type="checkbox" id="exampleCheck1" /></td>
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


EditRoleForm.contextTypes = {
  router: PropTypes.object.isRequired,
};

function mapStateToProps(state, ownProps) {
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
    updateRolePermission: state.updateRolePermission.updateRole
  };
}

var RoleFormModule = connect(mapStateToProps)(EditRoleForm);
export default RoleFormModule;