import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Col, FormGroup, Input, Label, Row } from 'reactstrap';
import { clientProfile, clientData, clientDataType, saveActivityLog, getAllIndustries } from '../../redux/actions/httpRequest';
import PropTypes from 'prop-types';
import swal from 'sweetalert';
import { Formik } from 'formik';
import * as Yup from 'yup';
import LoadingDialog from '../../component/LoadingDialog';
import utils from '../../Util/Util';
import consts from '../../Util/consts';
import regex from '../../Util/regex';
import Select from 'react-select';
import { Steps } from 'rsuite';
import 'rsuite/dist/styles/rsuite-default.css';
import { Button as AntButton } from 'antd';

// const customStyles = {
//   clearIndicator: styles => ({ ...styles, width: '16', padding: '0px' }),
//   control: styles => ({ ...styles, backgroundColor: 'white' })
// }
const colourStyles = {
  menu: (provided, state) => ({
    ...provided,
    height: "110px",
    overflowY: "scroll"
  }),
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
        backgroundColor: !isDisabled && (isSelected ? data.color : "#3498ff !important"),
      },
    };
  }
};

export class ClientForm extends PureComponent {

  constructor(props) {

    super(props);
    this.ClientID = localStorage.getItem("ClientID");

    this.loggedData = utils.getLoggedUser();
    this.isAdmin = this.loggedData && this.loggedData.roleId ? this.loggedData.roleId.isAdminRole : false;
    this.isInstallerRole = this.loggedData && this.loggedData.roleId ? this.loggedData.roleId.isInstallerRole : false;
    debugger


    this.state = {
      activeTab: 0,
      fetchedIndustryID: '',
      industryOptions: [],
      defaultThemeOptions: [],
      selectedThemes: [],
      InstallerClients: [],
      submitRejcted: false,
      submittedData: {},
      industryError: false,
      file: '',
      ClientID: this.ClientID,
      isOpen: false,
      InstallerClientError: false,
      // disabledClientType: false
    }
    this.onSave = this.onSave.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.handleNavigate = this.handleNavigate.bind(this);
    this.isUpdate = this.ClientID ? true : false;
    // this.isUpdate = this.props.match.params.id !== "0";

    props.dispatch(getAllIndustries.request({}, '', 'GET'));
  }

  handleNavigate = (stateVar, page) => {
    if (this.state.data && this.state.data[stateVar]) {
      utils.onNavigate({
        props: this.props,
        type: "replace",
        route: `/admin/clients/${page}/${this.props.match.params.id}`
      });
    }
  }

  NumberOnly = (e, handleChange, value) => {
    let numValue = value.replace(/\D/g, '');
    e.target.value = numValue;
    handleChange(e);
  }

  componentDidMount() {

    this.props.dispatch(clientDataType.request({
      action: 'clientType',
      clientType: 'installer'
    }));

    let ID = this.state.ClientID ? this.state.ClientID : this.props.match.params.id;
    // if (this.props.match.params.id != 0) {
    //   this.setState({ disabledClientType: true });
    // }

    this.props.dispatch(clientData.request({ action: 'load', id: ID }, ID));

  }
  componentWillReceiveProps(nextProps) {

    console.log('nextProps', nextProps)

    if (nextProps.clientProfile && nextProps.clientProfile.data) {
      let { data, isFetching, error } = nextProps.clientProfile;
      if (!isFetching) {

        if (error || data && data.errmsg) {

          this.setState({ submitRejcted: true });
        } else {

          if (data.success) {
            let id = this.props.match.params.id;

            localStorage.setItem('ClientID', data.data._id);
            localStorage.setItem('ClientDetails', JSON.stringify(data.data));

            utils.onNavigate({
              props: this.props,
              type: "replace",
              route: `/admin/clients/Roles/${id}`
            });
            return
          }

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

    if (nextProps.getAllIndustries) {
      if (nextProps.getAllIndustries.data && nextProps.getAllIndustries.data.data && nextProps.getAllIndustries.data.data.length) {
        nextProps.getAllIndustries.data.data.forEach(element => {
          element.label = element.name;
          element.value = element._id;
        });

        if (nextProps.getAllIndustries.data.data && this.state.fetchedIndustryID) this.industryHandle(nextProps.getAllIndustries.data.data, this.state.fetchedIndustryID);

        this.setState({ industryOptions: nextProps.getAllIndustries.data.data })
      }
    }

    if ((nextProps.clientData && nextProps.clientData !== this.props.clientData)) {
      let { data, isFetching, error } = nextProps.clientData;

      if (!isFetching) {
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

          localStorage.setItem('ClientID', data._id);
          this.setState({ ClientID: data._id })
          localStorage.setItem('ClientDetails', JSON.stringify(data));

          let selectedThemes = [];
          if (data.allowedThemes && data.allowedThemes.length) {
            data.allowedThemes.map(theme => {
              selectedThemes.push({ value: theme, label: theme })
            })
          }

          if (this.state.industryOptions && data.industry) this.industryHandle(this.state.industryOptions, data.industry);

          let selectedDefaultThemeOption = { value: data.theme, label: data.theme }

          this.setState({ fetchedIndustryID: data.industry });

          console.log('image url --', utils.serverUrl + '/Client/' + (data.logo || 'NoVideoAvailable.jpg'))

          data.origClientType = data.clientType;

          this.setState({
            selectedThemes: selectedThemes,
            defaultThemeOptions: selectedThemes,
            selectedDefaultThemeOption: selectedDefaultThemeOption,
            data: data,
            action: 'update',
            // imagePreviewUrl: data.logo ? utils.serverUrl + '/Client/' + (data.logo || 'NoVideoAvailable.jpg') : null
            imagePreviewUrl: data.logo ? utils.serverUrl + '/Client/' + (data.logo || 'NoVideoAvailable.jpg') : null
          });

        }
      }
    }

    this.setState({ file: null });
  }

  toggleModal = () => {
    this.setState({ isOpen: !this.state.isOpen });
  }

  clientTypeChange = () => {

    const { InstallerClients, ClientID } = this.state;
    if (ClientID) {
      let Index;
      if (InstallerClients.length) {
        Index = InstallerClients.findIndex(client => client._id === ClientID)
      }
      if (Index && Index > -1) {
        InstallerClients.splice(Index, 1);
        this.setState({ InstallerClients: InstallerClients });
      }
    }
  }

  onCancel = () => {
    this.props.history.goBack(-1)
  }

  onSave(values, { setSubmitting }) {

    const { selectedIndustry, selectedThemes, file, ClientID } = this.state;

    if (selectedIndustry) {
      values.industry = selectedIndustry.value;
      this.setState({ industryError: false });
    } else {
      this.setState({ industryError: true });
      return false
    }

    if (values.clientType == 'thirdparty' && !values.installerId) {
      this.setState({ InstallerClientError: true });
      return false;
    } else {
      this.setState({ InstallerClientError: false });

    }

    setSubmitting(false);

    values.allowedThemes = [];

    selectedThemes.map(theme => {
      values.allowedThemes.push(theme.value)
    });

    if (values.status === "true" || values.status === "Active") values.status = "Active";
    else values.status = "Inactive";

    values.isProfileCompleted = true;

    let installerChange = values.origClientType === 'installer' && values.clientType !== 'installer' ? 'true' : 'false';
    let thirdPartyChange = values.origClientType === 'thirdparty' && values.clientType !== 'thirdparty' ? 'true' : 'false';

    values.logo = file ? file.name : values.logo ? values.logo : null;

    let { params } = this.props.match;
    let { id } = params;
    let loggedData;
    let action = !ClientID ? 'save' : 'update';

    // changing in case of creating new client and logged-in user is installer admin
    if (!this.isUpdate && this.isInstallerRole) {
      values.clientType = 'thirdparty';
      values.installerId = this.loggedData && this.loggedData.clientId ? this.loggedData.clientId._id : '';
    }

    this.setState({ submittedData: values })

    let ID = ClientID ? ClientID : id;

    loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Added + ' - ' + values.name);
    this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));

    this.props.dispatch(clientProfile.request({ model: 'client', action: action, installerChange: installerChange, thirdPartyChange: thirdPartyChange, data: values, clientForm: "true", file: file }, ID));
  }

  handleThemeChange = (option) => {
    this.setState({
      defaultThemeOptions: option,
      selectedThemes: option
    });

    let DefaultTheme = this.state.selectedDefaultThemeOption;
    if (DefaultTheme && DefaultTheme.value) {
      let check;
      if (option.length) {
        check = option.find(theme => theme.value == DefaultTheme.value)
      }

      let obj = { value: '', label: '' }
      if (!check) this.setState({ selectedDefaultThemeOption: obj })

    }

  }

  handleIndustryChange = (option) => {

    this.setState({ selectedIndustry: option, industryError: false });
  }

  industryHandle = (industryOptions, fetchedIndustryID) => {

    if (industryOptions && fetchedIndustryID) {

      let selectedIndustry1 = industryOptions.find(option => option.value === fetchedIndustryID);
      let selectedindustryOption = {};

      if (selectedIndustry1) {
        selectedindustryOption = { value: fetchedIndustryID, label: selectedIndustry1.name }
      }
      this.setState({ selectedIndustry: selectedindustryOption });

    }
  }

  handleDefaultThemeChange = (setFieldValue, option) => {
    setFieldValue("theme", option ? option.value : '')

    this.setState({
      selectedDefaultThemeOption: option
    })
  }

  onDelete = () => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this client",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(function (willDelete) {
      let id = this.props.match.params.id;
      if (willDelete) {
        let loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Delete + ' - ' + this.props.clientData.data.name);
        this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
        this.props.dispatch(clientData.request({ action: 'delete' }, id))
      }
    }.bind(this));
  }

  getInitialValueTemplate() {
    return {
      name: "",
      url: "",
      status: "",
      logo: "",
      theme: "",
      clientType: 'direct'
    }
  }


  handleImageChange(e) {
    e.preventDefault();
    console.log('log', e.target.files)
    let reader = new FileReader();
    if (e.target.files.length > 0) {
      let file = e.target.files[0];
      if (/\.(jpe?g|png)$/i.test(file.name) === false) {
        swal({ title: "Error", text: "Only PNG and JPEG/JPG are allowed." });
        return;
      }

      if (file.size > 1000000) {
        swal({ title: "Error", text: "Image size cannot exceed 1 MB." });
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

  render() {
    const { onCancel, props, onDelete, isUpdate, state } = this;
    const { initialValues } = props;
    const { name } = initialValues || { name: '' };
    const { Status, Theme } = consts;
    let { imagePreviewUrl, industryOptions, fetchedIndustryID, selectedIndustry, defaultThemeOptions, selectedThemes, selectedDefaultThemeOption, InstallerClients, industryError, data, submitRejcted, submittedData, isOpen, InstallerClientError } = state;
    // disabledClientType
    let initialValuesEdit = isUpdate ? initialValues : {
      name: "",
      address1: "",
      address2: "",
      status: "",
      logo: "",
      theme: "",
      clientType: 'direct'
    };

    if (initialValues.error || initialValues && initialValues.errmsg) {
      initialValuesEdit = submittedData;
      // initialValuesEdit = this.state.data;
    }

    let themeOptions = [
      { value: Theme.Dark, label: 'Dark' },
      { value: Theme.Light, label: 'Light' },
      { value: Theme.Bacardi, label: 'Bacardi' },
      { value: Theme["Coca-Cola"], label: 'Coca-Cola' },
      { value: Theme.Starbucks, label: 'Starbucks' },
      { value: Theme["Snow-White"], label: 'Snow-White' },
      { value: Theme.Hanwha, label: 'Hanwha' },
      { value: Theme.Geutebruck, label: 'Geutebruck' }
    ];

    let { clientData } = this.props;
    let isFetching = clientData && clientData.isFetching;
    isFetching = isFetching || clientData && clientData.isFetching;
    let imagePreview = null;
    if (imagePreviewUrl) {
      imagePreview = (<img className="pointer" onClick={this.toggleModal} src={imagePreviewUrl} />);
    }
    return (
      <div className="animated fadeIn">
        <LoadingDialog isOpen={isFetching} />
        <Formik
          enableReinitialize={true}
          initialValues={initialValuesEdit}
          onSubmit={this.onSave}
          setError={(err) => console.log(err)}
          validateOnBlur={false}
          validateOnChange={false}
          validationSchema={
            Yup.object().shape({
              // contactEmail: Yup.string().email().trim().required('Required'),
              contactPhone: Yup.string().matches(regex.tenDigitNumberValidation, 'Please enter valid 10 digits Contact Phone.'),
              phoneNumber: Yup.string().matches(regex.tenDigitNumberValidation, 'Please enter valid 10 digits Phone number'),
              zipcode: Yup.string().matches(regex.fiveDigitZipValidation, 'Please enter valid 5 digits Zipcode')

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

            // if (Object.keys(values).length && (!values.name && submitRejcted ) && data) {
            //   Object.assign(values, data);
            // }

            // if (!Object.keys(values).length && submitRejcted && submittedData) {
            //   Object.assign(values, submittedData);
            //   this.setState({ submitRejcted: false })
            // }


            return (
              <Row>
                { isOpen ? <div onClick={this.toggleModal} class="p-0 overlay pointer">
                  <img class="OverlayImage m-4 p-4" src={imagePreviewUrl} />
                  <AntButton onClick={this.toggleModal} className="m-4 floatRight dashboard-button gridAdd" shape="circle" icon="cross" ghost />
                </div> :
                  <div class="col-12 mb-4 m-2">
                    <Steps class="col-12" current={0}>
                      <Steps.Item title="Profile" />
                      <Steps.Item className={data && data.isRoleCompleted ? 'pointer' : null} onClick={() => this.handleNavigate('isRoleCompleted', 'Roles')} title="Roles" />
                      <Steps.Item className={data && data.isRegionCompleted ? 'pointer' : null} onClick={() => this.handleNavigate('isRegionCompleted', 'Regions')} title="Regions" />
                      <Steps.Item className={data && data.isSystemSettingsCompleted ? 'pointer' : null} onClick={() => this.handleNavigate('isSystemSettingsCompleted', 'System Settings')} title="System Settings" />
                    </Steps>
                  </div>}
                { isOpen ? null : <Col>
                  <form onSubmit={handleSubmit}>
                    <div style={{ padding: "12px" }}>
                      <div className='row'>
                        <div className='col-lg-12'>
                          <FormGroup row className='m-0'>
                            <Col sm="6" className="text-field pr-2">
                              <Input
                                id="name"
                                type="text"
                                onBlur={handleBlur}
                                className="form-control text-form"
                                required
                                value={values.name}
                                onChange={handleChange}
                              />
                              <label className="text-label">Name<span className={'text-danger'}>*</span></label>
                            </Col>
                            <Col sm="6" className="statusToggle pt-2 floatRight">
                              <label className="mr-2 positionInline " >Status Active</label>
                              <label className=" switch">
                                <input type="checkbox" className="toggle" checked={values.status == "Active"}
                                  onClick={(option) => setFieldValue("status", option && option.target.checked ? 'Active' : option && !option.target.checked ? 'Inactive' : "")} id="status" />
                                <span className="slider round"></span>
                              </label>
                            </Col>
                          </FormGroup>
                          <FormGroup row className='m-0'>
                            <Col sm className="text-field">
                              <Input
                                id="address1"
                                type="text"
                                value={values.address1}
                                onBlur={handleBlur}
                                onChange={handleChange}
                                className="form-control text-form"
                              />
                              <label className="text-label">Addresss 1</label>
                              {errors.address1 && <div className="input-feedback">{errors.address1}</div>}
                            </Col>
                            <Col sm className="text-field">
                              <Input
                                id="address2"
                                value={values.address2}
                                type="text"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                className="form-control text-form"
                              />
                              <label className="text-label">Addresss 2</label>
                              {errors.address2 && <div className="input-feedback">{errors.address2}</div>}
                            </Col>
                          </FormGroup>

                          <FormGroup row className="m-1">
                            <Col sm className="text-field m-0 p-0 mr-2 mb-1">
                              <Input
                                id="city"
                                type="text"
                                onBlur={handleBlur}
                                value={values.city}
                                onChange={handleChange}
                                className="form-control text-form"
                              />
                              <label className="text-label">City</label>
                              {errors.city && <div className="input-feedback">{errors.city}</div>}
                            </Col>
                            <Col sm className="text-field m-0 p-0 mr-2 ml-1 pr-0 mb-1">
                              <Input
                                id="state"
                                type="text"
                                onBlur={handleBlur}
                                value={values.state}
                                onChange={handleChange}
                                className="form-control text-form"
                              />
                              <label className="text-label">State</label>
                              {errors.state && <div className="input-feedback">{errors.state}</div>}
                            </Col>
                            <Col sm className="text-field m-0 p-0 mr-1 pr-1">
                              <Input
                                id="country"
                                type="text"
                                value={values.country}
                                onBlur={handleBlur}
                                onChange={handleChange}
                                className="form-control text-form"
                              />
                              <label className="text-label">Country</label>
                              {errors.country && <div className="input-feedback">{errors.country}</div>}
                            </Col>
                            <Col sm className="text-field m-0 p-0">
                              <Input
                                id="zipcode"
                                type="text"
                                value={values.zipcode}
                                onChange={e => this.NumberOnly(e, handleChange, e.target.value)}
                                onBlur={handleBlur}
                                className="form-control text-form"
                                min={0}
                              />
                              <label className="text-label">Zipcode</label>
                              {errors.zipcode && <div className="input-feedback">{errors.zipcode}</div>}
                            </Col>
                          </FormGroup>

                          <FormGroup col className="pr-0 mt-2">
                            <Col sm="6" className="text-field">
                              <Input
                                id="phoneNumber"
                                type="text"
                                onBlur={handleBlur}
                                value={values.phoneNumber}
                                onChange={e => this.NumberOnly(e, handleChange, e.target.value)}
                                className="form-control text-form"
                                min={0}
                              />
                              <label className="text-label">Phone Number</label>
                              {errors.phoneNumber && <div className="input-feedback">{errors.phoneNumber}</div>}
                            </Col>
                          </FormGroup>

                          <FormGroup row className="">
                            <Col xs="6" className="text-field ml-3 pr-3 mr-0">
                              <Input
                                id="contactName"
                                type="text"
                                onChange={handleChange}
                                value={values.contactName}
                                onBlur={handleBlur}
                                className="form-control text-form"
                              />
                              <label className="text-label">Contact Name</label>
                              {errors.contactName && <div className="input-feedback">{errors.contactName}</div>}
                            </Col>

                            <Col xs="3" className="text-field mr-2" style={{ marginLeft: '-9px' }}>
                              <Input
                                id="contactPhone"
                                type="text"
                                value={values.contactPhone}
                                onBlur={handleBlur}
                                onChange={e => this.NumberOnly(e, handleChange, e.target.value)}
                                className="form-control text-form"
                                min={0}
                              />
                              <label className="text-label">Contact Phone</label>
                              {errors.contactPhone && <div className="input-feedback">{errors.contactPhone}</div>}
                            </Col>
                            <Col xs className="text-field" style={{ marginLeft: '-10px ', marginRight: 4 }}>
                              <Input
                                id="contactEmail"
                                name="contactEmail"
                                type="text"
                                value={values.contactEmail}
                                onBlur={handleBlur}
                                onChange={handleChange}
                                className="form-control text-form"
                                required
                              />
                              <label className="text-label ml-2">Contact Email<span className={'text-danger'}>*</span></label>
                              {errors.contactEmail && <div className="input-feedback">{errors.contactEmail}</div>}

                            </Col>
                          </FormGroup>

                          <FormGroup row>
                            <Col sm="6" className="text-field m-0 p-0 ml-3 pr-3">
                              <Select
                                isClearable={true}
                                value={selectedIndustry}
                                onChange={(val) => this.handleIndustryChange(val)}
                                required={true}
                                options={industryOptions}
                                placeholder="Select Industry"
                                class="form-control custom-select blckClr"
                                styles={colourStyles}
                              />
                              <label class="fixed-label">Industry<span className={'text-danger'}>*</span></label>
                              {industryError && <div className="input-feedback">Required</div>}
                            </Col>
                            <Col sm="1" style={{ marginLeft: '-23px' }} >
                              <label htmlFor="file" className="custom-file-upload choose-file ml-1">
                                {/* <i className="fa fa-file" aria-hidden="true"></i>  */}
                              Browse Logo</label>
                              <input name="file" className="profile" value={values.file} id="file" type="file" onChange={
                                (e) => {
                                  var file = e.target.files[0];
                                  setFieldValue("logo", file.name);
                                  this.handleImageChange(e);
                                }
                              }
                              />
                            </Col>
                            <Col sm style={{ marginLeft: '-4px', paddingTop: 2 }}>
                              {imagePreview ?
                                <div className="imgPreview">
                                  {imagePreview}
                                </div> : <i className="fa fa-camera fa-2x"></i>
                              }
                            </Col>
                          </FormGroup>

                          <FormGroup col>
                            <Col sm="6" className="text-field">
                              <Select
                                isMulti={true}
                                // styles={customStyles}
                                id="theme"
                                isClearable={true}
                                value={selectedThemes}
                                onChange={(option) => this.handleThemeChange(option)}
                                onBlur={handleBlur}
                                options={themeOptions}
                                class="form-control custom-select blckClr"
                                styles={colourStyles}
                              />
                              <label class="fixed-label">Themes</label>
                            </Col>
                          </FormGroup>

                          <FormGroup col>
                            <Col sm="6" className="text-field">
                              <Select
                                isClearable={true}
                                onChange={(val) => this.handleDefaultThemeChange(setFieldValue, val)}
                                value={selectedDefaultThemeOption}
                                required={false}
                                options={defaultThemeOptions}
                                placeholder="Default Theme"
                                class="form-control custom-select blckClr"
                                styles={colourStyles}
                              />
                              <label class="fixed-label">Default Theme</label>
                            </Col>
                          </FormGroup>

                          {this.isAdmin ? <FormGroup row style={{ margin: "0px" }} className="col-lg-6">
                            <Label htmlFor="theme" sm={3} className="lable blckClr">Client Type</Label>
                            <Col sm={3} className="mt-2">
                              <input
                                type="radio"
                                value={'direct'}
                                id="clientType"
                                checked={values.clientType == 'direct'}
                                name="clientType"
                                onChange={handleChange}
                                className="clientTypeInput"
                              // disabled={disabledClientType}
                              />
                              <span className="ml-1 blckClr">Direct</span>
                            </Col>
                            <Col sm={3} className="mt-2">
                              <input type="radio"
                                value={'installer'}
                                id="clientType"
                                checked={values.clientType == 'installer'}
                                onChange={handleChange}
                                className="clientTypeInput"
                                name="clientType"
                              // disabled={disabledClientType}
                              />
                              <span className="ml-1 blckClr">Installer</span>
                            </Col>
                            <Col sm={3} className="mt-2">
                              <input
                                type="radio"
                                value={'thirdparty'}
                                id="clientType"
                                className="clientTypeInput"
                                onChange={e => { handleChange(e); this.clientTypeChange() }}
                                checked={values.clientType == 'thirdparty'}
                                name="clientType"
                              // disabled={disabledClientType} 
                              />

                              <span className="ml-1 blckClr">Third Party</span>
                            </Col>

                            {values.clientType == 'thirdparty' ? <Col sm={12} className="text-field">
                              <Select
                                id="InstallerClient"
                                isClearable={true}
                                onChange={(option) => setFieldValue("installerId", option ? option.value : '')}
                                value={InstallerClients ? InstallerClients.find(option => option.value === values.installerId) : ''}
                                options={InstallerClients}
                                placeholder="Select Installer"
                                class="form-control custom-select "
                                menuPlacement="top"
                                // styles={colourStyles}
                                onBlur={handleBlur}
                                // isDisabled={disabledClientType}
                                required={true}
                              />
                              <label class="fixed-label">Select Installer<span className={'text-danger'}>*</span></label>
                              {InstallerClientError && <div className="input-feedback">Required</div>}
                            </Col> : null}
                          </FormGroup> : null }
                        </div>
                        <div class="col-sm-12" >
                          <button type="submit" className="floatRight btn formButton" ><i className="fa fa-save" aria-hidden="true"></i> {" "} Save & Continue</button>
                        </div>
                      </div>
                    </div>
                  </form>
                </Col>}
              </Row>
            );
          }.bind(this)}
        </Formik>
        <br /><br />
      </div>
    )
  }
}

ClientForm.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {

  return {
    initialValues: state.clientData.data || {},
    clientData: state.clientData,
    clientDataType: state.clientDataType,
    getAllIndustries: state.getAllIndustries,
    clientProfile: state.clientProfile
  };
}

var ClientFormModule = connect(mapStateToProps)(ClientForm);
export default ClientFormModule;
