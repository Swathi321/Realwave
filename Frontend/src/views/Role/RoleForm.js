import React, { PureComponent } from "react";
import { connect } from "react-redux";
import { Col, FormGroup, Input, Label, Row } from "reactstrap";
import { roleData, saveActivityLog } from "../../redux/actions/httpRequest";

import { roleUpdate } from "../../redux/actions/index";
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
import Select from "react-select";

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
  console.log("hii");
  //  $("option").closest("select").css({ "-webkit-transform": "scale(0.9, 0.86) translateY(-27px)","color":"red",
  //   "transform": "scale(0.9, 0.86) translateY(-19px)"});
  $("option").closest("select").css({ color: "red" });
  // $(document).on("change", function () {
  //   $(".form-group .form-control").each(function () {
  //     $(this).floatingLabel("ChangeFortText");
  //   });
  // });

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
export class RoleForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      userName: "",
      selectedRole: "",
      currentTab:"page", 
      roleData:[],
      columns: [
        { key: 'name', name: 'Name', width:50, filter: true, sort: true, type: 'string' },
        { key: 'description', name: 'Description', width:200, filter: true, sort: true, type: 'string' }
      ]
    };
    console.log(props,"prpspps");
    this.onSave = this.onSave.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.isUpdate = this.props.match.params.id !== "0";
  }

  componentDidMount() {
    console.log(this.props.match.params.id,"this.props.match.params.id");
    if (this.props.match.params.id !== "0") {
      this.props.dispatch(
        roleData.request(
          { action: "load", id: this.props.match.params.id },
          this.props.match.params.id
        )
      );
    } else {
      this.props.dispatch(
        roleData.request(
          { action: "load", id: this.props.match.params.id },
          this.props.match.params.id
        )
      );
    }
   
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.roleData && nextProps.roleData !== this.props.roleData) {
      let { data, isFetching, error } = nextProps.roleData;
      if (!isFetching) {
        if (error || (data && data.errmsg)) {
          let errorMessage = error || "";
          if (data && data.errmsg && typeof data.errmsg == "object") {
            errorMessage = data.errmsg.message;
          } else if (data && data.errmsg) {
            errorMessage = data.errmsg;
          }
          swal({ title: "Error", text: errorMessage, icon: "error" });
          return;
        } else if (data && data.message) {
          this.props.history.goBack(-1);
        } else {
          this.setState({
            data: data,
          });
        }
      }
    }
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
      this.props.dispatch(
        saveActivityLog.request({ action: "save", data: loggedData })
      );
      this.props.dispatch(
        roleData.request({ action: "save", data: values }, id)
      );
    } else {
      utils.deleteUnUsedValue(values);
      loggedData = utils.getScreenDetails(
        utils.getLoggedUser(),
        this.props.location,
        consts.Update + " - " + values.name
      );
      this.props.dispatch(
        saveActivityLog.request({ action: "save", data: loggedData })
      );
      this.props.dispatch(
        roleData.request({ action: "update", data: values }, id)
      );
    }
  }
  showTabs=(tabName)=>{
    console.log(tabName);
       this.setState({
         currentTab:tabName
       })
  }
  onDelete = () => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this site",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(
      function (willDelete) {
        let id = this.props.match.params.id;
        if (willDelete) {
          let loggedData = utils.getScreenDetails(
            utils.getLoggedUser(),
            this.props.location,
            consts.Delete + " - " + this.props.roleData.data.name
          );
          this.props.dispatch(
            saveActivityLog.request({ action: "save", data: loggedData })
          );
          this.props.dispatch(roleData.request({ action: "delete" }, id));
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
    this.setState({
      [e.target.name]: e.target.value,
    });
  };
 componentDidUpdate(){
  console.log(this.props.roleData,"prpspps");
     if(this.props.roleData.data!=null){
        this.setState({
          roleData:this.props.roleData.data.data
        })
     }

 }
  render() {
    const { onCancel, props, onDelete, isUpdate,showTabs } = this;
    const { initialValues, roleData } = props;
    const { userName, selectedRole,currentTab } = this.state;
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

    let isFetching = roleData && roleData.isFetching;
    isFetching = isFetching || (roleData && roleData.isFetching);
    return (
      <div className="animated fadeIn">
        <LoadingDialog isOpen={isFetching} />
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
                  <form autoComplete="off" onSubmit={handleSubmit}>
                    <CardWrapper
                      lg={12}
                      footer={
                        <div className={"form-button-group"}>
                          <div>
                            <button
                              type="submit"
                              className="btn formButton"
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
                          {isUpdate && (
                            <div>
                              {" "}
                              <button
                                type="button"
                                className="btn formButton"
                                onClick={onDelete}
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
                      <div className="main">
                        <div className="site-video-div container-fluid">
                          <div className="grid-wrapper-area">
                            <div className="row">
                              <div className="col">
                                <div className="wrapper"></div>
                                <div className="container-ie table-header-area row">
                                  <div className="col-12 col-sm-12 col-md-4 col-lg-5">
                                    <div className="cameracardText textConvert gridHeader">
                                      {/* <i className="fa icon2-events" aria-hidden="true"></i> */}
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
                                            {/* <Select
                                              value={selectedRole}
                                              onChange={(e) =>
                                                this.handleChange(e)
                                              }
                                              options={options}
                                            /> */}
                                            <div className="form-group">
                                              <div className="d-flex">
                                                <div className="w-100">
                                                 
                                                <div className="w-100 position-relative">
            <select defaultValue="" className="form-control custom-select" required="">
                <option selected="selected">User Blank Template</option>
                <option>User</option>
            </select>
            <label className="fixed-label" for="userName">Select a Configured Role to Copy the details <span className="red">*</span></label>
        </div>
                                                  {/* <div className="invalid-feedback">
                                                    Please select this filed
                                                  </div> */}
                                                </div>
                                                <div
                                                  style={{ minWidth: "72px" }}
                                                >
                                                  <button
                                                    type="submit"
                                                    className="btn formButton"
                                                    title="Save"
                                                  >
                                                    <i
                                                      className="fa fa-save"
                                                      aria-hidden="true"
                                                    ></i>{" "}
                                                    Save
                                                  </button>
                                                </div>
                                              </div>
                                            </div>
                                           
                                            <div className="form-group">
                                              <input
                                                className="form-control"
                                                type="text"
                                                id="userName"
                                                required=""
                                                autoComplete="new-username"
                                              />
                                              <label
                                                className="control-label"
                                                for="userName"
                                              >
                                                Name{" "}
                                                <span className="red">*</span>
                                              </label>
                                              <div className="invalid-feedback">
                                                Please enter name
                                              </div>
                                            </div>
                                            <div className="form-group">
                                              <textarea
                                                className="form-control"
                                                required=""
                                              ></textarea>
                                              <label
                                                className="control-label"
                                                for="Password"
                                              >
                                                Description{" "}
                                                <span className="red">*</span>
                                              </label>
                                              <div className="invalid-feedback">
                                                Please write the description
                                              </div>
                                              <p className="atleast text-right mt-1">
                                                Max 500 characters
                                              </p>
                                            </div>

                                            <button
                                              type="submit"
                                              className="btn btn-primary show-more"
                                            >
                                              Submit
                                            </button>
                                          </form>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                   
                                  <div className="tabs-section pt-3">
											<ul className="nav nav-tabs navHeader " role="tablist"> 
											  <li className="nav-item">
												<span className={`nav-link ${currentTab=="page"?'active':""}`} onClick={()=>showTabs("page")}>Page</span>
											  </li>
											  <li className="nav-item">
												<a className={`nav-link ${currentTab=="widgets"?'active':""}`} onClick={()=>showTabs("widgets")}>Widgets</a>
											  </li>
											  <li className="nav-item">
												<a className={`nav-link ${currentTab=="reports"?'active':""}`}  onClick={()=>showTabs("reports")}>Reports</a>
											  </li>
											  <li className="nav-item">
												<a className={`nav-link ${currentTab=="functions"?'active':""}`}  onClick={()=>showTabs("functions")}>Functions</a>
											  </li>
											</ul>
									
											<div className="tab-content">
											{currentTab=="page"?  <div className="tab-pane active p-0" id="Page">
											  	<div className="table-responsive">
													<table className="table table-striped">
													  <thead>
														<tr>
														  <th scope="col" style={{width:"25%"}}>Page Name</th>
                              <th scope="col" style={{width:"10%"}}>View</th>
														  <th scope="col" style={{width:"10%"}}>Edit</th>
														  <th scope="col" style={{width:"55%"}}>Notes</th>
														</tr>
													  </thead>
													  <tbody>
														<tr>
														  <td scope="row">Video</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														<tr>
														  <td scope="row">Dashbord</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														<tr>
														  <td scope="row">Events</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														
														<tr>
														  <td scope="row">Sites</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														<tr>
														  <td scope="row">Users</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														<tr>
														  <td scope="row">Admin</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														<tr>
														  <td scope="row">Analysis(!Note Important!)</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														<tr>
														  <td scope="row">Mac Address</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														<tr>
														  <td scope="row">Temperature?</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														<tr>
														  <td scope="row">Alarm?</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														<tr>
														  <td scope="row">Safe?</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														<tr>
														  <td scope="row">Log (This is a group of pages)</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
													  </tbody>
													</table>
												</div>
												<div className="pb-3">
													<div className="form-button-group">
														<div><button type="submit" className="btn formButton" title="Save"><i className="fa fa-save" aria-hidden="true"></i> Save</button></div>
														<div> <button type="button" className="btn formButton" title="Cancel"><i className="fa fa-close" aria-hidden="true"></i> Cancel</button></div>
														
													</div>
												</div>											  	
											  </div>


          :<></>}  
                       {currentTab=="widgets"?
                        <div className="tab-pane active p-0" id="Widgets">
											  	<div className="table-responsive">
													<table className="table table-striped">
													  <thead>
														<tr>
														  <th scope="col" style={{width:"25%"}}>Widgets Name</th>
                              <th scope="col" style={{width:"10%"}}>View</th>
														  <th scope="col" style={{width:"10%"}}>Edit</th>
														  <th scope="col" style={{width:"55%"}}>Notes</th>
														</tr>
													  </thead>
													  <tbody>
														<tr>
														  <td scope="row">Sales Chart</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														<tr>
														  <td scope="row">Timeline</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														<tr>
														  <td scope="row">Other?</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														
														<tr>
														  <td scope="row">Health?</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														<tr>
														  <td scope="row">POS?</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														<tr>
														  <td scope="row">Reports</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														<tr>
														  <td scope="row">Promotions</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														<tr>
														  <td scope="row">Can see Convert Cameras</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>														
													  </tbody>
													</table>
												</div>
												<div className="pb-3">
													<div className="form-button-group">
														<div><button type="submit" className="btn formButton" title="Save"><i className="fa fa-save" aria-hidden="true"></i> Save</button></div>
														<div> <button type="button" className="btn formButton" title="Cancel"><i className="fa fa-close" aria-hidden="true"></i> Cancel</button></div>
													</div>
												</div>
											  </div>
											  :<></>}
									  {currentTab=="reports"?
                  		  <div className="tab-pane active p-0" id="Reports">
											  	<div className="table-responsive">
													<table className="table table-striped">
													  <thead>
														<tr>
														  <th scope="col" style={{width:"25%"}}>Widgets Name</th>
														  <th scope="col" style={{width:"10%"}}>View</th>
														  <th scope="col" style={{width:"10%"}}>Edit</th>
														  <th scope="col" style={{width:"55%"}}>Notes</th>
														</tr>
													  </thead>
													  <tbody>
														<tr>
														  <td scope="row">Sales Chart</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														<tr>
														  <td scope="row">Timeline</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														<tr>
														  <td scope="row">Other?</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														
														<tr>
														  <td scope="row">Health?</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														<tr>
														  <td scope="row">POS?</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														<tr>
														  <td scope="row">Reports</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														<tr>
														  <td scope="row">Promotions</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														<tr>
														  <td scope="row">Can see Convert Cameras</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>														
													  </tbody>
													</table>
												</div>
												<div className="pb-3">
													<div className="form-button-group">
														<div><button type="submit" className="btn formButton" title="Save"><i className="fa fa-save" aria-hidden="true"></i> Save</button></div>
														<div> <button type="button" className="btn formButton" title="Cancel"><i className="fa fa-close" aria-hidden="true"></i> Cancel</button></div>
													</div>
												</div>
											  </div>
											  :<></>}
									  {currentTab=="functions"?

											  <div className="tab-pane active p-0" id="Functions">
											  	<div className="table-responsive">
													<table className="table table-striped">
													  <thead>
														<tr>
														  <th scope="col" style={{width:"25%"}}>Function Name</th>
                              <th scope="col" style={{width:"10%"}}>View</th>
														  <th scope="col" style={{width:"10%"}}>Edit</th>
														  <th scope="col" style={{width:"55%"}}>Notes</th>
														</tr>
													  </thead>
													  <tbody>
														<tr>
														  <td scope="row">Recording</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														<tr>
														  <td scope="row">Media Server</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														<tr>
														  <td scope="row">Client Impression</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														
														<tr>
														  <td scope="row">Tags</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														<tr>
														  <td scope="row">Can see Convert Cameras</td>
														  <td><input type="checkbox" id="exampleCheck1"/></td>														
														  <td><input type="checkbox" id="exampleCheck2"/></td>
														  <td>The following page</td>
														</tr>
														
													  </tbody>
													</table>
												</div>
												<div className="pb-3">
													<div className="form-button-group">
														<div><button type="submit" className="btn formButton" title="Save"><i className="fa fa-save" aria-hidden="true"></i> Save</button></div>
														<div> <button type="button" className="btn formButton" title="Cancel"><i className="fa fa-close" aria-hidden="true"></i> Cancel</button></div>
													</div>
												</div>
											  </div>
											  :<></>}
											</div>
										</div>

                                </div>
                              </div>
                            </div>
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


RoleForm.contextTypes = {
  router: PropTypes.object.isRequired,
};

function mapStateToProps(state, ownProps) {
  console.log(state,"state");
  return {
    initialValues: state.roleData.data || {
      name: "",
      description: "",
      permissions: [],
    },
    roleData: state.roleData,
  };
}

var RoleFormModule = connect(mapStateToProps)(RoleForm);
export default RoleFormModule;
{
  /* <FormGroup row>
                        <Label htmlFor="name" sm={2}>Name<span className={'text-danger'}>*</span></Label>
                        <Col sm={6}>
                          <Input
                            id="name"
                            placeholder="Enter Name"
                            type="text"
                            value={values.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="form-control"
                          />
                          {errors.name && <div className="input-feedback">{errors.name}</div>}
                        </Col>
                      </FormGroup>
                      <FormGroup row>
                        <Label htmlFor="description" sm={2}>Description</Label>
                        <Col sm={6}>
                          <Input
                            id="description"
                            placeholder="Enter description"
                            type="text"
                            value={values.description}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="form-control"
                          />
                        </Col>
                      </FormGroup>
                      <FormGroup row>
                        <Col sm={12}>
                          <Permission scope={this} selectedRows={values.permissions} onChange={setFieldValue} />
                        </Col>
                      </FormGroup> */
}
