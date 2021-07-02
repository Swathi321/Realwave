import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Col, FormGroup, Input, Label, Row } from 'reactstrap';
import { getSmartDevice, saveActivityLog, deleteSmartDevice } from '../../redux/actions/httpRequest';
import PropTypes from 'prop-types';
import swal from 'sweetalert';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CardWrapper from './../../component/CardWrapper';
import LoadingDialog from './../../component/LoadingDialog';
import utils from './../../Util/Util';
import consts from '../../Util/consts';
import Select from 'react-select';
import '../User/styles.scss';

const customStyles = {
  clearIndicator: styles => ({ ...styles, width: '16', padding: '0px' }),
  control: styles => ({ ...styles, backgroundColor: 'white' })
}

export class SmartDeviceForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      deleteDone: true,
      selectedSmartDevice: { smartDeviceType: "" },
      SelectedconnectionType: [],
      isSerialChecked: false,
      connectionTypeError: false,
      isCloudChecked: false,
      isTCPIPChecked: false,
      serialValue: 'serial',
      cloudValue: 'cloud',
      tcpValue: 'TCP-IP/UDP',
      nameChange: '',
      notesChange: '',
      nativeConnectivity: false,
      isSubmitting: false
    }

    this.onSave = this.onSave.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.isUpdate = this.props.match.params.id !== "0";

  }



  componentDidMount() {
    if (this.props.match.params.id !== "0") {
      this.props.dispatch(getSmartDevice.request({ action: 'load', id: this.props.match.params.id }, this.props.match.params.id));
    } else {
      this.props.dispatch(getSmartDevice.request({ action: 'load', id: this.props.match.params.id }, this.props.match.params.id));
    }
  }

  componentWillReceiveProps(nextProps) {

    if ((nextProps.getSmartDevice && nextProps.getSmartDevice !== this.props.getSmartDevice)) {
      let { data, isFetching, error } = nextProps.getSmartDevice;
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

          const { serialValue, cloudValue, tcpValue } = this.state;

          let SmartDeviceData = nextProps.getSmartDevice.data;

          if (nextProps.match.params.id == "0" && nextProps.match.params.type) {

            var selectedSmartDevice = { ...this.state.selectedSmartDevice }
            selectedSmartDevice.smartDeviceType = nextProps.match.params.type;
            this.setState({ selectedSmartDevice: selectedSmartDevice });

            // console.log('this.state.selectedSmartDevice', this.state.selectedSmartDevice);

          } else if (SmartDeviceData) {

            this.setState({
              nameChange: SmartDeviceData.name,
              nativeConnectivity: SmartDeviceData.nativeConnectivity,
              notesChange: SmartDeviceData.notes
            });

            if (SmartDeviceData.connectionType) {

              var connectionTypeArr = [];

              if (SmartDeviceData.connectionType.indexOf(serialValue) > -1) {
                this.setState({ isSerialChecked: true });
                connectionTypeArr.push(serialValue);
              }

              if (SmartDeviceData.connectionType.indexOf(cloudValue) > -1) {
                this.setState({ isCloudChecked: true });
                connectionTypeArr.push(cloudValue);
              }

              if (SmartDeviceData.connectionType.indexOf(tcpValue) > -1) {
                this.setState({ isTCPIPChecked: true });
                connectionTypeArr.push(tcpValue);
              }
            }

            this.setState({
              selectedSmartDevice: SmartDeviceData,
              SelectedconnectionType: connectionTypeArr
            });
          }
        }
      }
    }

    if (nextProps.deleteSmartDevice && nextProps.deleteSmartDevice.data && !this.state.deleteDone) {

      let DeleteRes = nextProps.deleteSmartDevice;

      if (!DeleteRes.isFetching) {

        this.setState({ deleteDone: true });

        if (!DeleteRes.data.error) {

          utils.onNavigate({
            props: this.props,
            type: "replace",
            route: '/admin/configuration'
          });


        } else {
          swal({
            title: "Status",
            text: DeleteRes.data.message,
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

  handleChange = (e, stateVar) => {
    let val = e.target.value === "true" ? true : false;
    this.setState({ [stateVar]: val });
  }

  handleClientChange(value) {
    console.log('handleClientChange val', value)
    console.log('handleClientChange', this.state.clientOptions)
    // this.setState({ value });
  }

  onCancel = () => {
    this.props.location.CheckPrevLoc = true;
    this.props.location.smartDeviceType = this.state.selectedSmartDevice.smartDeviceType;
    this.props.history.goBack(-1);
  }

  onSave(e) {

    e.preventDefault();

    const { SelectedconnectionType, selectedSmartDevice, nameChange, notesChange, nativeConnectivity } = this.state;

    // values.connectionType = SelectedconnectionType;
    // values.smartDeviceType = selectedSmartDevice.smartDeviceType;
    // values.name = nameChange;
    // values.notes = notesChange;
    // values.nativeConnectivity = nativeConnectivity;

    let values = {
      connectionType: SelectedconnectionType,
      smartDeviceType: selectedSmartDevice.smartDeviceType,
      name: nameChange,
      notes: notesChange,
      nativeConnectivity: nativeConnectivity
    }

    // setSubmitting(false);

    if (!values.connectionType.length && values.smartDeviceType.toUpperCase() == "POS") {
      this.setState({ connectionTypeError: true });
      return;
    }

    this.setState({ isSubmitting: true });

    this.props.location.CheckPrevLoc = true;
    this.props.location.smartDeviceType = selectedSmartDevice.smartDeviceType;

    let { params } = this.props.match;
    let { id } = params;
    let loggedData;
    if (id === "0") {
      loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Added + ' - ' + values.name);
      this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
      this.props.dispatch(getSmartDevice.request({ action: 'save', data: values }, id));
    } else {
      utils.deleteUnUsedValue(values);
      loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Added + ' - ' + values.name);
      this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
      this.props.dispatch(getSmartDevice.request({ action: 'update', data: values }, id));
    }
  }

  connectionTypeChange = (val, stateName, event) => {

    let checked = event.target.checked;
    let SelectedconnectionType = [...this.state.SelectedconnectionType];
    // // let SelectedconnectionType = ['serial']

    // this.setState({ "isSerialChecked": checked });
    this.setState({ [stateName]: checked });

    if (checked) {
      SelectedconnectionType.push(val);
      this.setState({ connectionTypeError: false });
    } else {
      const index = SelectedconnectionType.indexOf(val);
      if (index > -1) {
        SelectedconnectionType.splice(index, 1);
      }
    }

    this.setState({ SelectedconnectionType: SelectedconnectionType })

  }

  // Capitalize = (value) => {
  //   if (value.toUpperCase() == "POS") return value.toUpperCase();
  //   else return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  // }

  handleNameChange = (e) => {
    this.setState({ nameChange: e.target.value })
  }
  handleNotesChange = (e) => {
    this.setState({ notesChange: e.target.value })
  }

  onDelete = () => {
    swal({
      title: "Are you sure?",
      text: "Do you really want to delete this smart device? This process can not be undone.",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(function (willDelete) {
      let id = this.props.match.params.id;
      if (willDelete) {
        this.setState({ deleteDone: false })
        this.props.location.CheckPrevLoc = true;
        this.props.location.smartDeviceType = this.state.selectedSmartDevice.smartDeviceType;
        let loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Delete + ' - ' + this.props.getSmartDevice.data.name);
        this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
        this.props.dispatch(deleteSmartDevice.request({}, id, 'put'))
      }
    }.bind(this));
  }

  getInitialValueTemplate() {
    return {
      name: "",
      notes: "",
      nativeConnectivity: false
    }
  }


  render() {
    const { onCancel, props, onDelete, isUpdate, state } = this;
    const { initialValues, selectedStore, selectedTag } = props;

    const { name } = initialValues || { name: '' };
    const { Status, Theme } = consts;
    let { selectedSmartDevice, isSerialChecked, isCloudChecked, isTCPIPChecked, tcpValue, serialValue, cloudValue, notesChange, nameChange, connectionTypeError, nativeConnectivity, isSubmitting } = state;

    let initialValuesEdit = isUpdate ? initialValues : {
      name: "",
      notes: "",
      nativeConnectivity: false
    };

    if (initialValues.error || initialValues && initialValues.errmsg) {
      initialValuesEdit = this.state.data;
    }

    let { getSmartDevice } = this.props;
    let isFetching = getSmartDevice && getSmartDevice.isFetching;
    isFetching = isFetching || getSmartDevice && getSmartDevice.isFetching;

    // let NameLabel = selectedSmartDevice.smartDeviceType ? this.Capitalize(selectedSmartDevice.smartDeviceType) : '';


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
            })
          }
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
              setFieldValue
            } = props;

            // if (values) {
            //   values.nativeConnectivity = values.nativeConnectivity === true || values.nativeConnectivity === false ? values.nativeConnectivity.toString() : values.nativeConnectivity;
            // }


            return ( */}
              <Row>
                <Col md={12}>
                  <form onSubmit={this.onSave}>
                    <CardWrapper lg={12} title={isUpdate ? (name) : 'Create new ' + selectedSmartDevice.smartDeviceType} footer={
                      <div className={'form-button-group'}>
                        <div><button type="submit" className="btn formButton" disabled={isSubmitting}><i className="fa fa-save" aria-hidden="true"></i> Save</button></div>
                        <div> <button type="button" className="btn formButton" onClick={onCancel} disabled={isSubmitting}><i className="fa fa-close" aria-hidden="true"></i> Cancel</button></div>
                        {isUpdate && <div> <button type="button" className="btn formButton" onClick={onDelete} disabled={isSubmitting}><i className="fa fa-trash" aria-hidden="true"></i> Delete</button></div>}
                      </div>
                    }>
                      <div className='row'>
                        <div className='col-lg-6'>
                          <FormGroup col>
                            {/* <Label htmlFor="name" sm={12}> { NameLabel } Name<span className={'text-danger'}>*</span></Label> */}
                            <Col sm={12} className="text-field">
                              <Input
                                id="name"
                                type="text"
                                onChange={this.handleNameChange}
                                value={nameChange}
                                // onBlur={handleBlur}
                                className="form-control text-form"
                                required
                              />
                              <label className="text-label">{selectedSmartDevice.smartDeviceType} Name<span className={'text-danger'}>*</span></label>

                            </Col>
                          </FormGroup>
                          <FormGroup col>
                            {/* <Label htmlFor="notes" sm={12}>Notes</Label> */}
                            <Col sm={12} className="text-field">
                              <Input
                                id="notes"
                                type="textarea"
                                onChange={this.handleNotesChange}
                                value={notesChange}
                                // onBlur={handleBlur}
                                className="form-control text-form"
                                maxLength="500"
                                rows="3"
                                // required
                              />
                              <div class="floatRight blckClr ">{notesChange ? notesChange.length : 0}/500 characters</div>
                              <label className="text-label">Notes</label>

                            </Col>
                          </FormGroup>

                        </div>
                        <div className='col-lg-6'>
                          {selectedSmartDevice.smartDeviceType && selectedSmartDevice.smartDeviceType.toUpperCase() == "POS" ? <FormGroup col>
                            <Label className="blckClr" htmlFor="connectionType" sm={12}>Connection Type<span className={'text-danger '}>*</span></Label>
                            <Col sm={12} >
                              <Label check>
                                <Input
                                  value={isSerialChecked}
                                  checked={isSerialChecked}
                                  id="connectionType"
                                  // onChange={(event) => { this.connectionTypeChange(serialValue, 'isSerialChecked', event); handleChange(event) }}
                                  onChange={(event) => { this.connectionTypeChange(serialValue, 'isSerialChecked', event); }}
                                  name="connectionType"
                                  // onBlur={handleBlur}
                                  className="cursor sms-Checkbox playback_checkbox blckBackgroundClr" type="checkbox" />


                                <span className="blckClr ml-4 mt-1">Serial</span>
                              </Label>

                              <Label check>
                                <Input
                                  id="connectionType"
                                  name="connectionType"
                                  // onBlur={handleBlur}
                                  onChange={(event) => { this.connectionTypeChange(cloudValue, 'isCloudChecked', event) }}

                                  checked={isCloudChecked}
                                  className="cursor sms-Checkbox playback_checkbox blckBackgroundClr" type="checkbox" />
                                <span className="blckClr ml-4 mt-1">Cloud</span>

                              </Label>

                              <Label check>
                                <Input
                                  id="connectionType"
                                  name="connectionType"
                                  onChange={(event) => { this.connectionTypeChange(tcpValue, 'isTCPIPChecked', event) }}
                                  // onChange={(event) => { this.connectionTypeChange(tcpValue, 'isTCPIPChecked', event); handleChange(event) }}
                                  // onBlur={handleBlur}
                                  value={isTCPIPChecked}
                                  checked={isTCPIPChecked}
                                  className="cursor sms-Checkbox playback_checkbox blckBackgroundClr" type="checkbox" />
                                <span className="blckClr ml-4 mt-1">TCP-IP/UDP</span>

                              </Label>

                              {connectionTypeError && <div className="input-feedback">Required
                                </div>}
                            </Col>
                          </FormGroup> : null}



                          {selectedSmartDevice.smartDeviceType && selectedSmartDevice.smartDeviceType.toUpperCase() == "CAMERA" ? <FormGroup col>
                            <Label className="blckClr" htmlFor="nativeConnectivity" sm={12}>Native Connectivity</Label>
                            <Col sm={12} >
                              <div>
                                <Label check>
                                  <Input
                                    onChange={(e) => this.handleChange(e, 'nativeConnectivity')}
                                    id="nativeConnectivity"
                                    name="nativeConnectivity"
                                    // onBlur={handleBlur}
                                    value={true}
                                    checked={nativeConnectivity === true}
                                    className="cursor sms-Checkbox playback_checkbox blckBackgroundClr" type="radio" />

                                  <span className="blckClr ml-4 mt-1">Yes</span>
                                </Label>

                                <Label check>
                                  <Input
                                    id="nativeConnectivity"
                                    name="nativeConnectivity"
                                    onChange={(e) => this.handleChange(e, 'nativeConnectivity')}
                                    // onBlur={handleBlur}
                                    value={false}
                                    checked={nativeConnectivity === false}
                                    className="cursor sms-Checkbox playback_checkbox blckBackgroundClr" type="radio" />
                                  <span className="blckClr ml-4 mt-1">No</span>

                                </Label>

                              </div>
                            </Col>
                          </FormGroup> : null}
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

SmartDeviceForm.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {

  return {
    initialValues: state.getSmartDevice.data || {},
    getSmartDevice: state.getSmartDevice,
    deleteSmartDevice: state.deleteSmartDevice
  };
}

var SmartDeviceFormModule = connect(mapStateToProps)(SmartDeviceForm);
export default SmartDeviceFormModule;
