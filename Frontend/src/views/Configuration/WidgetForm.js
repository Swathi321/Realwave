import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Col, FormGroup, Input, Label, Row } from 'reactstrap';
import { getWidget, getIndustry, getReport, clientData, saveActivityLog, deleteWidget } from '../../redux/actions/httpRequest';
import PropTypes from 'prop-types';
import swal from 'sweetalert';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CardWrapper from './../../component/CardWrapper';
import LoadingDialog from './../../component/LoadingDialog';
import utils from './../../Util/Util';
import consts from '../../Util/consts';
import Select from 'react-select';


const customStyles = {
  clearIndicator: styles => ({ ...styles, width: '16', padding: '0px' }),
  control: styles => ({ ...styles, backgroundColor: 'white' })
}

export class WidgetForm extends PureComponent {
  constructor(props) {
    super(props);

    let sizeOptions = [
      { value: '1*1', label: '1*1' },
      { value: '1*2', label: '1*2' },
      { value: '1*3', label: '1*3' },
      { value: '2*1', label: '2*1' },
      { value: '2*2', label: '2*2' },
      { value: '2*3', label: '2*3' }
    ]
    this.state = {
      deleteDone: true,
      scopeGlobal: false,
      scopeIndustry: false,
      scopeClient: false,
      industryOptions: [],
      clientOptions: [],
      sizeOptions: sizeOptions,
      reportOptions: [],
      selectedIndustryOptions: [],
      selectedClientOptions: [],
      selectedSize: { value: '', label: '' },
      selectedReport: { value: '', label: '' },
      scopeClientError: false,
      scopeIndustryError: false,
      reportScopeError: false,
      sizeRequiredError: false,
      isSubmitting: false,
      FormName: '',
      FormDescription: ''
      // ReportRequiredError: false
    }

    this.onSave = this.onSave.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.isUpdate = this.props.match.params.id !== "0";

    let requestData = { action: 'load', pageSize:99999999, page:1, sort: 'name', sortDir: 'ASC' };

    props.dispatch(clientData.request(requestData));
    props.dispatch(getIndustry.request(requestData));
    props.dispatch(getReport.request(requestData));

  }



  componentDidMount() {
    if (this.props.match.params.id !== "0") {
      this.props.dispatch(getWidget.request({ action: 'load', id: this.props.match.params.id }, this.props.match.params.id));
    } else {
      this.props.dispatch(getWidget.request({ action: 'load', id: this.props.match.params.id }, this.props.match.params.id));
    }
  }
  componentWillReceiveProps(nextProps) {



    if ((nextProps.getWidget && nextProps.getWidget !== this.props.getWidget)) {
      let { data, isFetching, error } = nextProps.getWidget;
      if (!isFetching) {
        this.setState({ isSubmitting: false })
        if (error || data && data.errmsg) {
          let errorMessage = error || "";
          if (data && data.errmsg && typeof data.errmsg == "object") {
            errorMessage = data.errmsg.message;
          } else if (data && data.errmsg) {
            errorMessage = data.errmsg;
          }
          swal({ title: "Error", text: errorMessage, icon: "error", });
          return;
        } else if (data && data.message) {
          this.props.history.goBack(-1)
        } else {



          if (nextProps.clientData) {
            if (nextProps.clientData.data && nextProps.clientData.data.data && nextProps.clientData.data.data.length) {
              nextProps.clientData.data.data.forEach(element => {
                element.label = element.name;
                element.value = element._id;
              });

              this.setState({ clientOptions: nextProps.clientData.data.data })
            }
          }

          if (nextProps.getIndustry) {
            if (nextProps.getIndustry.data && nextProps.getIndustry.data.data && nextProps.getIndustry.data.data.length) {
              nextProps.getIndustry.data.data.forEach(element => {
                element.label = element.name;
                element.value = element._id;
              });

              this.setState({ industryOptions: nextProps.getIndustry.data.data })
            }
          }

          if (nextProps.getReport) {
            if (nextProps.getReport.data && nextProps.getReport.data.data && nextProps.getReport.data.data.length) {
              nextProps.getReport.data.data.forEach(element => {
                element.label = element.name;
                element.value = element._id;
              });

              this.setState({ reportOptions: nextProps.getReport.data.data })
            }
          }

          let WidgetData = nextProps.getWidget.data;

          if (WidgetData) {

            this.setState({
              scopeGlobal: WidgetData.isGlobal,
              FormName: WidgetData.name,
              FormDescription: WidgetData.description
            });

            let fetchedSize = {
              "label": WidgetData.size,
              "value": WidgetData.size
            }
            this.setState({ selectedSize: fetchedSize });

            if (nextProps.getReport.data) {
              if (nextProps.getReport.data.data && nextProps.getReport.data.data.length) {

                let report = nextProps.getReport.data.data.find(item => item.value == WidgetData.report);
                if (report) {
                  this.setState({ selectedReport: report });
                }

              }
            }

            if (WidgetData.industryId && nextProps.getIndustry.data && nextProps.getIndustry.data.data && nextProps.getIndustry.data.data.length) {
              let selectedIndustries = [];
              WidgetData.industryId.map(industry => {

                let Industry = nextProps.getIndustry.data.data.find(item => item.value == industry);

                if (Industry) selectedIndustries.push(Industry)
              });
              if (selectedIndustries.length) {
                this.setState({
                  selectedIndustryOptions: selectedIndustries,
                  scopeIndustry: true
                });
              }

            }

            //populating the fetched reports in edit mode
            if (WidgetData.clientId && nextProps.clientData.data && nextProps.clientData.data.data && nextProps.clientData.data.data.length) {
              let selectedClients = [];
              WidgetData.clientId.map(client => {

                let Client = nextProps.clientData.data.data.find(item => item.value == client);
                if (Client) selectedClients.push(Client)
              });
              if (selectedClients.length) {
                this.setState({
                  selectedClientOptions: selectedClients,
                  scopeClient: true
                });

              }

            }
          }


        }
      }
    }


    if (nextProps.deleteWidget && nextProps.deleteWidget.data && !this.state.deleteDone) {

      let DeleteRes = nextProps.deleteWidget;

      if (!DeleteRes.isFetching) {

        this.setState({ deleteDone: true })

        if (!DeleteRes.data.error) {

          utils.onNavigate({
            props: this.props,
            type: "replace",
            route: '/admin/configuration'
          });


        } else {
          swal({
            title: "Status",
            text: DeleteRes.data.errmsg,
            icon: "warning",
            showCancelButton: false,
            showConfirmButton: true,
            dangerMode: true,
          }).then(
            function (res) {

            }
          );
          return
        }

      }
      
    }

  }

  onCancel = () => {
    this.props.location.CheckPrevLoc = true;
    this.props.history.goBack(-1);
  }

  // onSave(values, { setSubmitting }) {
  onSave(e) {
    e.preventDefault();

    this.setState({ isSubmitting: true });

    const { scopeGlobal, selectedSize, selectedReport, selectedIndustryOptions, scopeIndustry, selectedClientOptions, scopeClient, FormName, FormDescription } = this.state;

    // values.name= FormName;
    // values.description= FormDescription;
    // values.isGlobal = scopeGlobal;
    // values.size = selectedSize ? selectedSize.value : selectedSize;
    // values.report = selectedReport ? selectedReport.value : selectedReport;
    // values.industryId = [];
    // values.clientId = [];

    let values = {
      name: FormName,
      description: FormDescription,
      isGlobal: scopeGlobal,
      size: selectedSize ? selectedSize.value : selectedSize,
      report: selectedReport ? selectedReport.value : selectedReport,
      industryId: [],
      clientId: []
    }

    if (selectedIndustryOptions.length && scopeIndustry) {
      selectedIndustryOptions.map(item => values.industryId.push(item.value))
    }

    if (selectedClientOptions.length && scopeClient) {
      selectedClientOptions.map(item => values.clientId.push(item.value))
    }


    // setSubmitting(false);

    if (!values.size) {
      this.setState({ sizeRequiredError: true, isSubmitting: false  });
      return;
    }

    // if(!values.report){
    //   this.setState({ ReportRequiredError : true });
    //   return;
    // }

    values.report = values.report ? values.report : null;

    let checkGlobal = false;
    let checkIndustry = false;
    let checkClient = false;

    if (scopeGlobal || scopeIndustry || scopeClient) {

      if (scopeGlobal) {
        checkGlobal = true;
      } else {
        if (scopeIndustry) {
          if (values.industryId.length) {
            checkIndustry = true;
          }
          else {
            checkIndustry = false;
            this.setState({ scopeIndustryError: true, isSubmitting: false  });
            return
          }
        } else checkIndustry = true;

        if (scopeClient) {
          if (values.clientId.length) {
            checkClient = true;
          }
          else {
            checkClient = false;
            this.setState({ scopeClientError: true, isSubmitting: false  });
            return
          }
        } else checkClient = true;
      }

      if (checkGlobal || (checkClient && checkIndustry)) {

        this.props.location.CheckPrevLoc = true;

        let { params } = this.props.match;
        let { id } = params;
        let loggedData;
        if (id === "0") {
          loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Added + ' - ' + values.name);
          this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
          this.props.dispatch(getWidget.request({ action: 'save', data: values }, id));
        } else {
          utils.deleteUnUsedValue(values);
          loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Added + ' - ' + values.name);
          this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
          this.props.dispatch(getWidget.request({ action: 'update', data: values }, id));
        }

      }

    } else {

      this.setState({ reportScopeError: true, isSubmitting: false  });
      return
    }


  }

  onDelete = () => {
    swal({
      title: "Are you sure?",
      text: "Do you really want to delete this widget? This process can not be undone.",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(function (willDelete) {
      let id = this.props.match.params.id;
      if (willDelete) {

        this.setState({ deleteDone: false })
        this.props.location.CheckPrevLoc = true;
        let loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Delete + ' - ' + this.props.getWidget.data.name);
        this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
        this.props.dispatch(deleteWidget.request({}, id, 'put'))
      }
    }.bind(this));
  }

  getInitialValueTemplate() {
    return {
      name: "",
      description: ""
    }
  }

  onChangeSize(value) {
    this.setState({
      selectedSize: value,
      sizeRequiredError: false
    });
  }

  onChangeReport(value) {
    this.setState({
      selectedReport: value,
      // ReportRequiredError: false
    });
  }

  handleOptionsChange(value, type) {

    if (type === 'industry') {
      this.setState({ selectedIndustryOptions: value });

      if (value.length) this.setState({ scopeIndustryError: false });
    }
    else {
      this.setState({ selectedClientOptions: value });
      if (value.length) this.setState({ scopeClientError: false });
    }

  }

  scopeClientChange = (e) => {
    this.setState({ scopeClient: e.target.checked });

    if (!e.target.checked) {
      this.setState({
        selectedClientOptions: [],
        scopeClientError: false
      });
    }
    else this.setState({ reportScopeError: false });
  }

  scopeIndustryChange = (e) => {
    this.setState({ scopeIndustry: e.target.checked });

    if (!e.target.checked) {
      this.setState({
        selectedIndustryOptions: [],
        scopeIndustryError: false
      });
    }
    else this.setState({ reportScopeError: false });
  }

  handleChange = (e, stateVar) => {
    this.setState({ [stateVar]: e.target.value });
  }

  scopeGlobalChange = (e) => {
    this.setState({ scopeGlobal: e.target.checked });
    if (e.target.checked) this.setState({ reportScopeError: false });
  }



  render() {
    const { onCancel, props, onDelete, isUpdate, state } = this;
    const { initialValues, selectedStore, selectedTag } = props;

    const { name } = initialValues || { name: '' };
    const { Status, Theme } = consts;
    let { clientOptions, industryOptions, tags, scopeGlobal, scopeIndustry, scopeClient, sizeOptions, reportOptions, selectedClientOptions, selectedIndustryOptions, selectedSize, selectedReport, scopeClientError, scopeIndustryError, reportScopeError, sizeRequiredError, FormName, FormDescription, isSubmitting } = state;

    let initialValuesEdit = isUpdate ? initialValues : {
      name: "",
      description: ""
    };

    if (initialValues.error || initialValues && initialValues.errmsg) {
      initialValuesEdit = this.state.data;
    }

    let { getWidget } = this.props;
    let isFetching = getWidget && getWidget.isFetching;
    isFetching = isFetching || getWidget && getWidget.isFetching;


    return (

      <div className="animated fadeIn">
        <LoadingDialog isOpen={isFetching} />
        {/* <Formik
          enableReinitialize={true}
          initialValues={initialValuesEdit}
          onSubmit={this.onSave}
          validationSchema={
            Yup.object().shape({
              // name: Yup.string().trim().required('Required'),
              // size: Yup.string().trim().required('Required')
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
            return ( */}
              <Row>
                <Col md={12}>
                  <form onSubmit={this.onSave}>
                    <CardWrapper lg={12} title={isUpdate ? (name) : 'Create new Widget'} footer={
                      <div className={'form-button-group'}>
                        <div><button type="submit" className="btn formButton" disabled={isSubmitting}><i className="fa fa-save" aria-hidden="true"></i> Save</button></div>
                        <div> <button type="button" className="btn formButton" onClick={onCancel} disabled={isSubmitting}><i className="fa fa-close" aria-hidden="true"></i> Cancel</button></div>
                        {isUpdate && <div> <button type="button" className="btn formButton" onClick={onDelete} disabled={isSubmitting}><i className="fa fa-trash" aria-hidden="true"></i> Delete</button></div>}
                      </div>
                    }>
                      <div className="row">
                        <div className='col-lg-6'>
                          <FormGroup col>
                            {/* <Label htmlFor="name" sm={12}> Widget Name<span className={'text-danger'}>*</span></Label> */}
                            <Col sm={12} className="text-field">
                              <Input
                                id="name"
                                type="text"
                                value={FormName}
                                // onBlur={handleBlur}
                                onChange={(e) => this.handleChange(e, 'FormName')}
                                className="form-control text-form"
                                required
                              />

                              <label className="text-label"> Widget Name<span className={'text-danger'}>*</span></label>

                            </Col>
                          </FormGroup>

                          <FormGroup col className="mb-3">
                            {/* <Label htmlFor="description" sm={12}>Description</Label> */}
                            <Col sm={12} className="text-field">
                              <Input
                                id="description"
                                type="textarea"
                                onChange={(e) => this.handleChange(e, 'FormDescription')}
                                value={FormDescription}
                                // onBlur={handleBlur}
                                className="form-control text-form "
                                maxLength="500"
                                rows="3"
                              />

                              <div class="floatRight blckClr ">{FormDescription ? FormDescription.length : 0}/500 characters</div>
                              <label className="text-label">Description</label>

                            </Col>
                          </FormGroup>

                          <FormGroup col>
                            {/* <Label htmlFor="size" sm={12}>Size (Rows & Columns)<span className={'text-danger'}>*</span></Label> */}
                            <Col sm={12} className="text-field">
                              <Select
                                isClearable={true}
                                value={selectedSize}
                                onChange={(val) => this.onChangeSize(val)}
                                // onChange={handleChange}
                                required={true}
                                options={sizeOptions}
                                placeholder="Select Size"
                                class="form-control custom-select blckClr"
                                required
                              />
                              <label class="fixed-label">Size (Rows & Columns)<span className={'text-danger'}>*</span></label>

                              {sizeRequiredError && <div className="input-feedback">Required</div>}
                            </Col>
                          </FormGroup>

                          <FormGroup col>
                            {/* <Label htmlFor="report" sm={12}>Report</Label> */}
                            <Col sm={12} className="text-field">
                              <Select
                                isClearable={true}
                                value={selectedReport}
                                onChange={(val) => this.onChangeReport(val)}
                                // onChange={handleChange}
                                options={reportOptions}
                                placeholder="Select Report"
                                class="form-control custom-select"
                              />
                              <label class="fixed-label">Report</label>

                              {/* {ReportRequiredError && <div className="input-feedback">Required</div>} */}
                            </Col>



                          </FormGroup>

                        </div>

                        <div className='col-lg-6'>
                          <FormGroup col>
                            <Label className="blckClr" htmlFor="reportScope" sm={12}>Widget Scope<span className={'text-danger'}>*</span></Label>
                            <Col sm={12} >
                              <Label check>
                                <Input
                                  disabled={scopeIndustry || scopeClient}
                                  value={scopeGlobal}
                                  checked={scopeGlobal}
                                  // onChange={e => { this.scopeGlobalChange(e); handleChange(e) }}
                                  onChange={this.scopeGlobalChange}
                                  name="reportScope"
                                  // onBlur={handleBlur}
                                  className="cursor sms-Checkbox playback_checkbox blckBackgroundClr" type="checkbox" />

                                <span className="blckClr ml-4 mt-1">Global</span>
                              </Label>

                              <Label check>
                                <Input
                                  disabled={scopeGlobal}
                                  name="isGlobal"
                                  // onBlur={handleBlur}
                                  // onChange={e => { this.scopeIndustryChange(e); handleChange(e) }}
                                  onChange={this.scopeIndustryChange}
                                  value={scopeIndustry}
                                  checked={scopeIndustry}
                                  className="cursor sms-Checkbox playback_checkbox blckBackgroundClr" type="checkbox" />
                                <span className="blckClr ml-4 mt-1">Industry</span>

                              </Label>

                              {scopeIndustry ?
                                <Select
                                  isMulti={true}
                                  styles={customStyles}
                                  isClearable={true}
                                  required={true}
                                  value={selectedIndustryOptions}
                                  onChange={(val) => this.handleOptionsChange(val, 'industry')}
                                  options={industryOptions}
                                  placeholder="Select Industry"
                                  className="blckClr"
                                /> : null}

                              {scopeIndustryError && <div className="input-feedback">Required</div>}


                              <Label check>
                                <Input
                                  disabled={scopeGlobal}
                                  name="reportScope"
                                  onChange={this.scopeClientChange}
                                  // onChange={e => { this.scopeClientChange(e); handleChange(e) }}
                                  // onBlur={handleBlur}
                                  value={scopeClient}
                                  checked={scopeClient}
                                  className="cursor sms-Checkbox playback_checkbox blckBackgroundClr" type="checkbox" />
                                <span className="blckClr ml-4 mt-1">Client</span>

                              </Label>

                              {scopeClient ?
                                <Select
                                  isMulti={true}
                                  styles={customStyles}
                                  isClearable={true}
                                  onChange={(val) => this.handleOptionsChange(val, 'client')}
                                  required={true}
                                  value={selectedClientOptions}
                                  options={clientOptions}
                                  placeholder="Select Client"
                                  className="blckClr"
                                /> : null}
                              {scopeClientError && <div className="input-feedback">Required</div>}

                              {reportScopeError && <div className="input-feedback">Required</div>}
                            </Col>
                          </FormGroup>
                        </div>
                      </div>

                    </CardWrapper>
                  </form>
                </Col>
              </Row>
            {/* );
          }.bind(this)}
        </Formik> */}
      </div>
    )
  }
}

WidgetForm.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    initialValues: state.getWidget.data || {},
    getWidget: state.getWidget,
    clientData: state.clientData,
    getIndustry: state.getIndustry,
    getReport: state.getReport,
    deleteWidget: state.deleteWidget
  };
}

var WidgetFormModule = connect(mapStateToProps)(WidgetForm);
export default WidgetFormModule;
