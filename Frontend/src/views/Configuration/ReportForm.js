import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Col, FormGroup, Input, Label, Row } from 'reactstrap';
import { getIndustry, getReport, clientData, saveActivityLog, deleteReport } from '../../redux/actions/httpRequest';
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

export class ReportForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      deleteDone: true,
      isGlobal: false,
      scopeIndustry: false,
      scopeClient: false,
      industryOptions: [],
      clientOptions: [],
      selectedIndustryOptions: [],
      selectedClientOptions: [],
      scopeClientError: false,
      scopeIndustryError: false,
      reportScopeError: false,
      isSubmitting: false,
      FormName: '',
      FormDescription: ''
    }


    this.onSave = this.onSave.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.isUpdate = this.props.match.params.id !== "0";

    
    let requestData = { action: 'load', pageSize:99999999, page:1, sort: 'name', sortDir: 'ASC' };

    props.dispatch(clientData.request(requestData));
    props.dispatch(getIndustry.request(requestData));

  }


  componentWillUnmount() {
    debugger
  }
  componentDidMount() {
    if (this.props.match.params.id !== "0") {
      this.props.dispatch(getReport.request({ action: 'load', id: this.props.match.params.id }, this.props.match.params.id));
    } else {
      this.props.dispatch(getReport.request({ action: 'load', id: this.props.match.params.id }, this.props.match.params.id));
    }

  }
  componentWillReceiveProps(nextProps) {

    if ((nextProps.getReport && nextProps.getReport !== this.props.getReport)) {
      debugger
      let { data, isFetching, error } = nextProps.getReport;
      if (!isFetching) {

        this.setState({ isSubmitting: false })
        debugger
        if (error || (data && data.errmsg) || (data && data.success === false)) {
          let errorMessage = error || "";
          if (data && data.errmsg && typeof data.errmsg == "object") {
            errorMessage = data.errmsg.message;
          } else if (data && data.errmsg) {
            errorMessage = data.errmsg;
          }

          this.setState({ submitRejcted: true })
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
            if (nextProps.getIndustry.data && nextProps.getIndustry.data.data.length) {
              nextProps.getIndustry.data.data.forEach(element => {
                element.label = element.name;
                element.value = element._id;
              });

              this.setState({ industryOptions: nextProps.getIndustry.data.data })
            }
          }

          let ReportData = nextProps.getReport.data;
          if (ReportData) {

            // debugger

            this.setState({
              isGlobal: ReportData.isGlobal,
              FormName: ReportData.name,
              FormDescription: ReportData.description
            });

            //populating the fetched industries in edit mode
            if (ReportData.industryId && nextProps.getIndustry.data && nextProps.getIndustry.data.data && nextProps.getIndustry.data.data.length) {
              let selectedIndustries = [];
              ReportData.industryId.map(industry => {

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
            if (nextProps.getReport.data.clientId && nextProps.clientData.data && nextProps.clientData.data.data && nextProps.clientData.data.data.length) {
              let selectedClients = [];
              nextProps.getReport.data.clientId.map(client => {

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


    if (nextProps.deleteReport && nextProps.deleteReport.data && !this.state.deleteDone) {


      let DeleteRes = nextProps.deleteReport;

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
      // return
    }
  }

  handleChange = (e, stateVar) => {
    this.setState({ [stateVar]: e.target.value })
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


  onCancel = () => {
    this.props.location.CheckPrevLoc = true;
    this.props.history.goBack(-1)
  }



  // onSave(values, { setSubmitting }) {
  onSave(e) {

    e.preventDefault();

    this.setState({ isSubmitting: true });

    const { selectedIndustryOptions, scopeIndustry, isGlobal, selectedClientOptions, scopeClient, FormName, FormDescription } = this.state;



    // values.name = FormName;
    // values.description = FormDescription;
    // values.isGlobal = isGlobal;
    // values.industryId = [];
    // values.clientId = [];

    let values = {
      name: FormName,
      description: FormDescription,
      isGlobal: isGlobal,
      industryId: [],
      clientId: []
    }

    if (selectedIndustryOptions.length && scopeIndustry) {
      selectedIndustryOptions.map(item => values.industryId.push(item.value))
    }

    if (selectedClientOptions.length && scopeClient) {
      selectedClientOptions.map(item => values.clientId.push(item.value))
    }

    let checkGlobal = false;
    let checkIndustry = false;
    let checkClient = false;

    if (isGlobal || scopeIndustry || scopeClient) {

      if (isGlobal) {
        checkGlobal = true;
      } else {
        if (scopeIndustry) {
          if (values.industryId.length) {
            checkIndustry = true;
          }
          else {
            checkIndustry = false;
            this.setState({ scopeIndustryError: true, isSubmitting: false });
            return
          }
        } else checkIndustry = true;

        if (scopeClient) {
          if (values.clientId.length) {
            checkClient = true;
          }
          else {
            checkClient = false;
            this.setState({ scopeClientError: true, isSubmitting: false });
            return
          }
        } else checkClient = true;
      }

      // all validations are satisfied
      if (checkGlobal || (checkClient && checkIndustry)) {


        // this.setState({ submittedData: values});

        this.props.location.CheckPrevLoc = true;

        let { params } = this.props.match;
        let { id } = params;
        let loggedData;
        if (id === "0") {
          loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Added + ' - ' + values.name);
          this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
          this.props.dispatch(getReport.request({ action: 'save', data: values }, id));
        } else {
          utils.deleteUnUsedValue(values);
          loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Added + ' - ' + values.name);
          this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
          this.props.dispatch(getReport.request({ action: 'update', data: values }, id));
        }


      }

    } else {

      this.setState({ reportScopeError: true, isSubmitting: false });
      return;

    }


    // setSubmitting(false);

    // this.setState({ isSubmitting : false})

  }

  onDelete = () => {
    swal({
      title: "Are you sure?",
      text: "Do you really want to delete this report? This process can not be undone.",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(function (willDelete) {
      let id = this.props.match.params.id;
      if (willDelete) {
        this.setState({ deleteDone: false })
        this.props.location.CheckPrevLoc = true;

        let loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Delete + ' - ' + this.props.getReport.data.name);
        this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
        this.props.dispatch(deleteReport.request({}, id, 'put'))
      }
    }.bind(this));
  }

  getInitialValueTemplate() {
    return {
      name: "",
      description: "",
      size: "",
      isGlobal: false
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

  scopeGlobalChange = (e) => {
    this.setState({ isGlobal: e.target.checked });
    if (e.target.checked) this.setState({ reportScopeError: false });
  }

  componentDidUpdate() {
    console.log("props", this.props);

  }



  render() {
    const { onCancel, props, onDelete, isUpdate, state } = this;
    const { initialValues } = props;

    const { name } = initialValues || { name: '' };
    const { Status, Theme } = consts;
    let { clientOptions, industryOptions, isGlobal, scopeIndustry, scopeClient, selectedClientOptions, selectedIndustryOptions, scopeClientError, scopeIndustryError, reportScopeError, FormDescription, FormName, isSubmitting } = state;



    let initialValuesEdit = isUpdate ? initialValues : {
      name: "",
      description: "",
      isGlobal: false
    };

    if (initialValues.error || initialValues && initialValues.errmsg) {
      initialValuesEdit = this.state.data;
    }

    let { getReport } = this.props;
    let isFetching = getReport && getReport.isFetching;
    isFetching = isFetching || getReport && getReport.isFetching;



    return (

      <div className="animated fadeIn">
        <LoadingDialog isOpen={isFetching} />
        {/* <Formik
          enableReinitialize={true}
          initialValues={initialValuesEdit}
          onSubmit={this.onSave}
          validationSchema={
            Yup.object().shape({
              // name: Yup.string().trim().required('Required')
              // selectedClientOptions: scopeClient ?  Yup.array().required('Required') : null,
              // selectedIndustryOptions: scopeIndustry ?  Yup.array().required('Required'): null
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

            // debugger
            // if (( !values || !Object.keys(values).length) && submitRejcted && submittedData) {
            //   debugger
            //   // if(!values){
            //     // values =  {};
            //   // }
            //   // else{
            //     Object.assign(values, submittedData);
            //   // }

            //   this.setState({ submitRejcted: false })
            // }

            return ( */}
        <Row>
          <Col md={12}>
            <form onSubmit={this.onSave}>
              <CardWrapper lg={12} title={isUpdate ? (name) : 'Create new Report'} footer={
                <div className={'form-button-group'}>
                  <div><button type="submit" className="btn formButton" disabled={isSubmitting}><i className="fa fa-save" aria-hidden="true"></i> Save</button></div>
                  <div> <button type="button" className="btn formButton" onClick={onCancel} disabled={isSubmitting}><i className="fa fa-close" aria-hidden="true"></i> Cancel</button></div>
                  {isUpdate && <div> <button type="button" className="btn formButton" onClick={onDelete} disabled={isSubmitting}><i className="fa fa-trash" aria-hidden="true"></i> Delete</button></div>}
                </div>
              }>
                <div className="row">
                  <div className='col-lg-6'>
                    <FormGroup col>
                      {/* <Label htmlFor="name" sm={12}> Report Name<span className={'text-danger'}>*</span></Label> */}
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
                        <label className="text-label">Report Name <span className={'text-danger'}>*</span> </label>


                      </Col>
                    </FormGroup>
                    <FormGroup col>
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



                  </div>
                  <div className='col-lg-6'>
                    <FormGroup col>
                      <Label className="blckClr" htmlFor="reportScope" sm={12}>Report Scope<span className='text-danger'>*</span></Label>
                      <Col sm={12}>
                        <Label check >
                          <Input
                            disabled={scopeIndustry || scopeClient}
                            value={isGlobal}
                            checked={isGlobal}
                            // onChange={e => { this.scopeGlobalChange(e); handleChange(e) }}
                            onChange={this.scopeGlobalChange}
                            name="reportScope"
                            // onBlur={handleBlur}
                            className="cursor sms-Checkbox playback_checkbox blckBackgroundClr" type="checkbox" />

                          <span className="ml-4 mt-1 blckClr">Global</span>
                        </Label>

                        <Label check>
                          <Input
                            disabled={isGlobal}
                            name="reportScope"
                            // onBlur={handleBlur}
                            // onChange={e => { this.scopeIndustryChange(e); handleChange(e) }}
                            onChange={this.scopeIndustryChange}
                            value={scopeIndustry}
                            checked={scopeIndustry}
                            className="cursor sms-Checkbox playback_checkbox blckBackgroundClr" type="checkbox" />
                          <span className="ml-4 mt-1 blckClr">Industry</span>

                        </Label>

                        {scopeIndustry ?
                          <Select
                            isMulti={true}
                            // styles={customStyles}
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
                            disabled={isGlobal}
                            name="reportScope"
                            // onChange={e => { this.scopeClientChange(e); handleChange(e) }}
                            onChange={this.scopeClientChange}
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
        {/* ); */}
        {/* }.bind(this)}
        </Formik> */}
      </div>
    )
  }
}

ReportForm.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {

  return {
    initialValues: state.getReport.data || {},
    getReport: state.getReport,
    clientData: state.clientData,
    getIndustry: state.getIndustry,
    deleteReport: state.deleteReport
  };
}

var ReportFormModule = connect(mapStateToProps)(ReportForm);
export default ReportFormModule;
