import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Col, FormGroup, Input, Label, Row } from 'reactstrap';
import { clientData, clientDataType, saveActivityLog, getIndustry, createClientProfile } from '../../redux/actions/httpRequest';
import { clearCreateRoleData, createRoleAction, createClientProfileAction } from "../../redux/actions/index";
import PropTypes from 'prop-types';
import swal from 'sweetalert';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CardWrapper from './../../component/CardWrapper';
import LoadingDialog from './../../component/LoadingDialog';
import utils from './../../Util/Util';
import consts from '../../Util/consts';
import regex from './../../Util/regex';
import Select from 'react-select';
// import './styles.scss';
import ClientRoleForm from './ClientRole';
import { Steps } from 'rsuite';
import 'rsuite/dist/styles/rsuite-default.css';
import api from '../../redux/httpUtil/serverApi';
import { instance } from '../../redux/actions/index'

const customStyles = {
  clearIndicator: styles => ({ ...styles, width: '16', padding: '0px' }),
  control: styles => ({ ...styles, backgroundColor: 'white' })
}


export class ClientForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 0,
      fetchedIndustryID: '',
      industryOptions: [],
      defaultThemeOptions: [],
      selectedThemes: [],
      InstallerClients: [],
      file: '',
      // selectedIndustry: { value: '', label: '' },
    }

    this.onSave = this.onSave.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.isUpdate = this.props.match.params.id !== "0";

    props.dispatch(getIndustry.request({ action: 'load' }));

    props.dispatch(clientDataType.request({
      action: 'load', filters: [
        {
          "operator": "like",
          "value": "installer",
          "property": "clientType",
          "type": "string"
        }
      ]
    }));
  }



  componentDidMount() {
    if (this.props.match.params.id !== "0") {
      this.props.dispatch(clientData.request({ action: 'load', id: this.props.match.params.id }, this.props.match.params.id));
    } else {
      this.props.dispatch(clientData.request({ action: 'load', id: this.props.match.params.id }, this.props.match.params.id));
    }
  }
  componentWillReceiveProps(nextProps) {

    if (nextProps.clientDataType && nextProps.clientDataType.data && nextProps.clientDataType.data.data && nextProps.clientDataType.data.data.length) {

      nextProps.clientDataType.data.data.map(element => {
        element.label = element.name;
        element.value = element._id;
      });

      this.setState({ InstallerClients: nextProps.clientDataType.data.data })
    }

    if (nextProps.getIndustry) {
      if (nextProps.getIndustry.data && nextProps.getIndustry.data.data && nextProps.getIndustry.data.data.length) {
        nextProps.getIndustry.data.data.forEach(element => {
          element.label = element.name;
          element.value = element._id;
        });

        // let selectedIndustry = nextProps.getIndustry.data.data.find(option => option.value === nextProps.industry

        if (nextProps.getIndustry.data.data && this.state.fetchedIndustryID) this.industryHandle(nextProps.getIndustry.data.data, this.state.fetchedIndustryID);

        this.setState({ industryOptions: nextProps.getIndustry.data.data })
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

          let selectedThemes = [];
          if (data.allowedThemes && data.allowedThemes.length) {
            data.allowedThemes.map(theme => {
              selectedThemes.push({ value: theme, label: theme })
            })
          }

          if (this.state.industryOptions && data.industry) this.industryHandle(this.state.industryOptions, data.industry);

          let selectedDefaultThemeOption = { value: data.theme, label: data.theme }

          this.setState({ fetchedIndustryID: data.industry });

          // selectedDefaultThemeOption selectedThemes.find(option => option.value === values.theme)

          this.setState({
            selectedThemes: selectedThemes,
            defaultThemeOptions: selectedThemes,
            selectedDefaultThemeOption: selectedDefaultThemeOption,
            data: data,
          });

          debugger
        }
        this.setState({ file: null })
      }
    }
  }

  onCancel = () => {
    this.props.history.goBack(-1)
  }

  onSave(values, { setSubmitting }) {

    setSubmitting(false);

    // values.url = '';
    values.allowedThemes = [];

    this.state.selectedThemes.map(theme => {
      values.allowedThemes.push(theme.value)
    });

    values.industry = this.state.selectedIndustry ? this.state.selectedIndustry.value : '';

    //  = this.state.selectedThemes;

    if (values.status === "true" || values.status === "Active") values.status = "Active";
    else values.status = "Inactive";

    // debugger
    let { file } = this.state;

    values.logo = file;
    debugger
    let { params } = this.props.match;
    let { id } = params;
    let loggedData;
    let action = '';
    if (id === "0") {
      action = 'save';
    //   debugger
      // loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Added + ' - ' + values.name);
      // // loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Added + ' - ' + values.name);
      // this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
      // this.props.dispatch(clientData.request({ action: 'save', data: values }, id));

      // this.props.dispatch(createClientProfileAction({
      //   action: "save",
      //   data: values
      // }))

      // let { action, data } = value
     

    } else {
      action = 'update';
      // utils.deleteUnUsedValue(values);
      // loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Added + ' - ' + values.name);
      // this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
      // this.props.dispatch(clientData.request({ action: 'update', data: values }, id));

      // this.props.dispatch(createClientProfileAction({
      //   action: "update",
      //   data: values
      // }));
    }

    var bodyFormData = new FormData();
    bodyFormData.append('action', action);
    bodyFormData.append('data', JSON.stringify(values));

   
      instance.post(`${api.CLIENT_LIST}/${id}`, bodyFormData)
        .then(res => {
          console.log(res);
          console.log(res.data.errmsg);
          console.log(res.data.msg);
          if (!res.data.success) {
            swal({
              title: "Status",
              text: res.data.errmsg,
              icon: "warning",
              showCancelButton: false,
              showConfirmButton: true,
              dangerMode: true,
            }).then(
              function (res) {
              }
            )
          }
          if (res.data.success) {

            localStorage.setItem('ClientID', res.data.data._id);
            localStorage.setItem('ClientDetails', JSON.stringify(res.data.data));
            // this.props.history.push(`/admin/role`)
            utils.onNavigate({
              props: this.props,
              type: "replace",
              route: '/admin/clients/Roles/'+ id
            });
          }
        }).catch(err => {
          console.log(err);
        })
    

  }

  // componentDidUpdate = () => {
  //   debugger
  //   if (Object.keys(this.props.createClientProfile).length > 0) {
  //     debugger
  //   }
  // }

  handleThemeChange = (setFieldValue, option) => {
    this.setState({
      defaultThemeOptions: option,
      selectedThemes: option
    })
  }

  handleIndustryChange = (setFieldValue, option) => {

    this.setState({ selectedIndustry: option });
  }

  industryHandle = (industryOptions, fetchedIndustryID) => {

    if (industryOptions && fetchedIndustryID) {

      let selectedIndustry1 = industryOptions.find(option => option.value === fetchedIndustryID);
      let selectedindustryOption ={};

      if(selectedIndustry1){
         selectedindustryOption = { value: fetchedIndustryID, label: selectedIndustry1.name }
      }
      this.setState({ selectedIndustry: selectedindustryOption });

    }
  }

  handleDefaultThemeChange = (setFieldValue, option) => {

    // setFieldValue("allowedThemes", option ? option.value : '')
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

  ChangeActiveTab(number) {
    this.setState({ activeTab: number });

  }

  // navigateToRole(props) {
  //   debugger
  //   utils.onNavigate({
  //     props: props,
  //     type: "replace",
  //     route: '/admin/clients/ClientRole/0'
  //   });
  // }

  handleImageChange(e) {
    e.preventDefault();
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

  render() {
    const { onCancel, props, onDelete, isUpdate, state } = this;
    const { initialValues } = props;
    const { name } = initialValues || { name: '' };
    const { Status, Theme } = consts;
    let { imagePreviewUrl, activeTab, industryOptions, fetchedIndustryID, selectedIndustry, defaultThemeOptions, selectedThemes, selectedDefaultThemeOption, InstallerClients } = state;




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
      initialValuesEdit = this.state.data;
    }

    // let options = [
    //   { value: Status.Active, label: Status.Active },
    //   { value: Status.Inactive, label: Status.Inactive }
    // ];

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
      imagePreview = (<img src={imagePreviewUrl} />);
    }
    return (
      <div className="animated fadeIn">
        <LoadingDialog isOpen={isFetching} />
        <Formik
          enableReinitialize={true}
          initialValues={initialValuesEdit}
          onSubmit={this.onSave}
          setError={(err) => console.log(err)}
          validationSchema={
            Yup.object().shape({
              // name: Yup.string().trim().required('Required'),
              // address1: Yup.string().trim().required('Required'),
              contactEmail: Yup.string().email().trim().required('Required'),
              contactPhone: Yup.string().matches(regex.mobileValidation, 'Contact Phone is not valid').required('Required'),
              phoneNumber: Yup.string().matches(regex.mobileValidation, 'Phone number is not valid').required('Required'),
              // zipCode: Yup.string().matches(/^[0-9]*$/, 'Must be a number'),
              // name: Yup.string().trim().required('Required'),
              // url: Yup.string().trim().required('Required'),
              // status: Yup.string().trim().required('Required')
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
              <Row>

                {/* address1: "mainRoad"
address2: "second road"
allowedThemes: ["dark", "light"]
city: "hyd"
clientType: "direct"
contactEmail: "DirectClient@gmail.com"
contactName: "DirectClient"
contactPhone: "8765432190"
country: "india"
createdAt: "2020-10-28T09:44:06.715Z"
createdByUserId: 2
industry: "5f91181c87c9ea3b100757f8"
installerId: null
isDeleted: 0
logo: ""
name: "Direct Client3"
phoneNumber: "9876543210"
reportsAllowed: ["5f911fa86b4cec1718cc8453"]
smartDevicesAllowed: []
state: "Ts"
status: "Active"
theme: "Dark"
updatedAt: "2020-10-28T09:44:06.715Z"
url: "https://realwave.stream4.tech/Vivek123"
widgetsAllowed: ["5f911ce45e1c6e365093bd0f"]
zipcode: "500008" */}

                {/* <Col md={12}>
                  <form onSubmit={handleSubmit}>
                    <CardWrapper lg={12} title={isUpdate ? (name) : 'Create new client'} footer={
                      <div className={'form-button-group'}>
                        <div><button type="submit" className="btn formButton" disabled={isSubmitting}><i className="fa fa-save" aria-hidden="true"></i> Save</button></div>
                        <div> <button type="button" className="btn formButton" onClick={onCancel} disabled={isSubmitting}><i className="fa fa-close" aria-hidden="true"></i> Cancel</button></div>
                        {isUpdate && <div> <button type="button" className="btn formButton" onClick={onDelete} disabled={isSubmitting}><i className="fa fa-trash" aria-hidden="true"></i> Delete</button></div>}
                      </div>
                    }>
                      <FormGroup row>
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
                        <Label htmlFor="url" sm={2}>URL<span className={'text-danger'}>*</span></Label>
                        <Col sm={6}>
                          <Input
                            id="url"
                            placeholder="Enter URL"
                            type="text"
                            value={values.url}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="form-control"
                          />
                          {errors.url && <div className="input-feedback">{errors.url}</div>}
                        </Col>
                      </FormGroup>
                      <FormGroup row>
                        <Label htmlFor="status" sm={2}>Status<span className={'text-danger'}>*</span></Label>
                        <Col sm={6}>
                          <Select
                            id="status"
                            isClearable={true}
                            value={options ? options.find(option => option.value === values.status) : ''}
                            onChange={(option) => setFieldValue("status", option ? option.value : '')}
                            onBlur={handleBlur}
                            options={options}
                          />
                          {errors.status && <div className="input-feedback">{errors.status}</div>}
                        </Col>
                      </FormGroup>
                      <FormGroup row>
                        <Label htmlFor="logo" sm={2}>Select Logo</Label>
                        <Col sm={6}>
                          <Row>
                            <Col sm={9}>
                              {imagePreview ?
                                <div className="imgPreview">
                                  {imagePreview}
                                </div> : <i className="fa fa-camera fa-2x"></i>
                              }
                            </Col>
                            <Col sm={3}>
                              <label htmlFor="logo" className="custom-file-upload choose-file"><i className="fa fa-file" aria-hidden="true"></i> Browse</label>
                              <input name="logo" id="logo" type="file" onChange={(e) => {
                                var file = e.target.files[0];
                                setFieldValue("logo", file.name);
                                this.handleImageChange(e);
                              }
                              } />
                            </Col>
                          </Row>
                          <label htmlFor="fileInfo" style={{ color: "red" }}>Note - Only PNG and JPEG/JPG are allowed And Size must be 1 MB Or below.</label>
                        </Col>
                      </FormGroup>
                      <FormGroup row>
                        <Label htmlFor="theme" sm={2}>Select Theme</Label>
                        <Col sm={6}>
                          <Select
                            id="theme"
                            isClearable={true}
                            value={themeOptions ? themeOptions.find(option => option.value === values.theme) : ''}
                            onChange={(option) => setFieldValue("theme", option ? option.value : '')}
                            onBlur={handleBlur}
                            options={themeOptions}
                          />
                        </Col>
                      </FormGroup>
                    </CardWrapper>
                  </form>
                </Col> */}



                {/* <div class="row m-0"> */}
                <div class="col-12 mb-4 m-2">
                  <Steps class="col-12" current={0}>
                    <Steps.Item title="Profile" />
                    <Steps.Item title="Roles" />
                    <Steps.Item title="Regions" />
                    <Steps.Item title="System Settings" />
                  </Steps>
                  {/* <div class="multisteps-form__progress">
                      <button class="multisteps-form__progress-btn js-active" type="button" title="User Info">Profile</button>
                        <button class="multisteps-form__progress-btn" type="button" title="Address">Roles</button>
                        <button class="multisteps-form__progress-btn" type="button" title="Order Info">Regions</button>
                        <button class="multisteps-form__progress-btn" type="button" title="Comments">System Settings</button>
                     
                    </div> */}
                  {/* </div> */}
                </div>
                <br />
                <Col>
                  <form onSubmit={handleSubmit}>
                    {/* <div style={{ backgroundColor: "white", padding: "12px" }}> */}
                    <div style={{ padding: "12px" }}>

                      {this.state.activeTab == 0 ? <div className='row'>

                        <div className='col-lg-6'>
                          <FormGroup col >
                            <Col sm={12} className="text-field">
                              <Input
                                id="name"
                                type="text"
                                onBlur={handleBlur}
                                className="form-control text-form"
                                required
                                value={values.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                              <label className="text-label">Name</label>
                              {errors.name && <div className="input-feedback">{errors.name}</div>}
                            </Col>
                            {/* </FormGroup>

                      <FormGroup col> */}
                            <Col xs="12" className="text-field">
                              <Input
                                id="address1"
                                type="text"
                                value={values.address1}
                                onBlur={handleBlur}
                                onChange={handleChange}
                                className="form-control text-form"
                                required
                              />
                              <label className="text-label">Addresss 1</label>
                              {errors.address1 && <div className="input-feedback">{errors.address1}</div>}
                            </Col>
                          </FormGroup>

                          <FormGroup row style={{ margin: "0px" }}>

                            <Col sm className="text-field">
                              <Input
                                id="city"
                                type="text"
                                onBlur={handleBlur}
                                value={values.city}
                                onChange={handleChange}
                                className="form-control text-form"
                                required
                              />
                              <label className="text-label">City</label>
                              {errors.city && <div className="input-feedback">{errors.city}</div>}
                            </Col>
                            <Col sm className="text-field" >
                              <Input
                                id="state"
                                type="text"
                                onBlur={handleBlur}
                                value={values.state}
                                onChange={handleChange}
                                className="form-control text-form"
                                required
                              />
                              <label className="text-label">State</label>
                              {errors.state && <div className="input-feedback">{errors.state}</div>}
                            </Col>


                          </FormGroup>

                          <FormGroup col >
                            <Col xs="12" className="text-field">
                              <Input
                                id="phoneNumber"
                                type="number"
                                onBlur={handleBlur}
                                value={values.phoneNumber}
                                onChange={handleChange}
                                className="form-control text-form"
                                min={0}
                                required
                              />
                              <label className="text-label">Phone Number</label>

                              {errors.phoneNumber && <div className="input-feedback">{errors.phoneNumber}</div>}

                            </Col>

                          </FormGroup>


                          <FormGroup col >
                            <Col xs="12" className="text-field">
                              <Input
                                id="contactName"
                                type="text"
                                onChange={handleChange}
                                value={values.contactName}
                                onBlur={handleBlur}
                                className="form-control text-form"
                                required
                              />
                              <label className="text-label">Contact Name</label>
                              {errors.contactName && <div className="input-feedback">{errors.contactName}</div>}
                            </Col>
                          </FormGroup>

                          <FormGroup col>
                            <Col sm={12} className="text-field">
                              <Select
                                isClearable={true}
                                // value={selectedSize}
                                value={selectedIndustry}
                                // value={industryOptions ? industryOptions.find(option => option.value === values.industry) : ''}
                                onChange={(val) => this.handleIndustryChange(setFieldValue, val)}
                                // onChange={handleChange}
                                required={true}
                                options={industryOptions}
                                placeholder="Select Industry"
                                class="form-control custom-select blckClr"
                                required
                              />
                              <label class="fixed-label">Industry<span className={'text-danger'}>*</span></label>



                            </Col>
                          </FormGroup>

                          <FormGroup col>
                            <Col sm={12} className="text-field">
                              <Select
                                isMulti={true}
                                styles={customStyles}
                                id="theme"
                                isClearable={true}
                                value={selectedThemes}
                                onChange={(option) => this.handleThemeChange(setFieldValue, option)}
                                onBlur={handleBlur}
                                options={themeOptions}
                                class="form-control custom-select blckClr"
                              />
                              <label class="fixed-label">Themes<span className={'text-danger'}>*</span></label>

                              {/* {sizeRequiredError && <div className="input-feedback">Required</div>} */}
                            </Col>
                          </FormGroup>

                          <FormGroup col>
                            <Col sm={12} className="text-field">
                              <Select
                                isClearable={true}
                                // value={selectedSize}
                                onChange={(val) => this.handleDefaultThemeChange(setFieldValue, val)}
                                // onChange={handleChange}
                                value={selectedDefaultThemeOption}
                                required={true}
                                options={defaultThemeOptions}
                                placeholder="Default Theme"
                                class="form-control custom-select blckClr"
                                required
                              />
                              <label class="fixed-label">Default Theme<span className={'text-danger'}>*</span></label>

                              {/* {sizeRequiredError && <div className="input-feedback">Required</div>} */}
                            </Col>
                          </FormGroup>

                          <FormGroup row style={{ margin: "0px" }}>
                            <Label htmlFor="theme" sm={3} className="lable blckClr">Client Type</Label>
                            <Col sm={3} className="mt-2">
                              <input
                                type="radio"
                                value={'direct'}
                                id="clientType"
                                checked={values.clientType == 'direct'}
                                name="clientType"
                                onChange={handleChange}
                              // value="direct"
                              />
                              <span className="ml-1 blckClr">Direct</span>
                            </Col>
                            <Col sm={3} className="mt-2">
                              <input type="radio"
                                value={'installer'}
                                id="clientType"
                                checked={values.clientType == 'installer'}
                                onChange={handleChange}
                                name="clientType" />
                              <span className="ml-1 blckClr">Installer</span>
                            </Col>
                            <Col sm={3} className="mt-2">
                              <input
                                type="radio"
                                value={'thirdparty'}
                                id="clientType"
                                onChange={handleChange}
                                checked={values.clientType == 'thirdparty'}
                                name="clientType" />
                              <span className="ml-1 blckClr">Third Party</span>
                            </Col>

                            {values.clientType == 'thirdparty' ? <Col sm className="mt-2">
                              <Select
                                isClearable={true}
                                // value={selectedSize}
                                onChange={(option) => setFieldValue("installerId", option ? option.value : '')}
                                // onChange={handleChange}
                                // value={values.installerId}
                                value={InstallerClients ? InstallerClients.find(option => option.value === values.installerId) : ''}
                                required={true}
                                options={InstallerClients}
                                placeholder="Select Installer"
                                class="form-control custom-select blckClr"
                                required
                              />
                              <label class="fixed-label">Select Installer<span className={'text-danger'}>*</span></label>

                            </Col> : null}

                            {errors.clientType && <div className="input-feedback">{errors.clientType}</div>}
                          </FormGroup>
                        </div>

                        <div className='col-lg-6'>
                          <FormGroup col style={{ minHeight: '40px' }} >
                            <Col xs="6"> </Col>
                            <Col xs={6} className="statusToggle ">
                              <label className="mr-2 positionInline " >Status Active</label>
                              <label className=" switch">
                                <input type="checkbox" className="toggle" checked={values.status == "Active"}
                                  onClick={(option) => setFieldValue("status", option && option.target.checked ? 'Active' : option && !option.target.checked ? 'Inactive' : "")} id="status" />
                                <span className="slider round"></span>
                              </label>
                            </Col>

                          </FormGroup>
                          <FormGroup col >
                            <Col xs="12" className="text-field">
                              <Input
                                id="address2"
                                value={values.address2}
                                type="text"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                className="form-control text-form"
                                required
                              />
                              <label className="text-label">Addresss 2</label>
                              {errors.address2 && <div className="input-feedback">{errors.address2}</div>}
                            </Col>
                          </FormGroup>

                          <FormGroup row style={{ margin: "0px" }}>

                            <Col sm className="text-field">
                              <Input
                                id="country"
                                type="text"
                                value={values.country}
                                onBlur={handleBlur}
                                onChange={handleChange}
                                className="form-control text-form"
                                required
                              />
                              <label className="text-label">Country</label>
                              {errors.country && <div className="input-feedback">{errors.country}</div>}
                            </Col>
                            <Col sm className="text-field">
                              <Input
                                id="zipcode"
                                type="number"
                                value={values.zipcode}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="form-control text-form"
                                min={0}
                                required
                              />
                              <label className="text-label">Zipcode</label>

                              {errors.zipcode && <div className="input-feedback">{errors.zipcode}</div>}
                            </Col>


                          </FormGroup>

                          <FormGroup>
                            <Col sm className="text-field" style={{ minHeight: '40px' }} ></Col>
                          </FormGroup>
                          {/* style={{ minHeight: '40px' }}  */}
                          <FormGroup row style={{ margin: "0px" }}>

                            <Col sm className="text-field">
                              <Input
                                id="contactPhone"
                                type="number"
                                value={values.contactPhone}
                                onBlur={handleBlur}
                                onChange={handleChange}
                                className="form-control text-form"
                                required
                                min={0}
                              />
                              <label className="text-label">Contact Phone</label>

                              {errors.contactPhone && <div className="input-feedback">{errors.contactPhone}</div>}
                            </Col>
                            <Col sm className="text-field">
                              <Input
                                id="contactEmail"
                                type="text"
                                value={values.contactEmail}
                                onBlur={handleBlur}
                                onChange={handleChange}
                                className="form-control text-form"
                                required
                              />
                              <label className="text-label">Contact Email</label>

                              {errors.contactEmail && <div className="input-feedback">{errors.contactEmail}</div>}
                            </Col>
                          </FormGroup>

                          <FormGroup row >
                            <Col xs="3" >
                              <label htmlFor="file" className="custom-file-upload choose-file">
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
                            <Col xs="3">
                              {imagePreview ?
                                <div className="imgPreview">
                                  {imagePreview}
                                </div> : <i className="fa fa-camera fa-2x"></i>
                              }
                            </Col>
                          </FormGroup>



                        </div>
                        <div class="col-sm-12" >

                          {/* <button type="button" onClick={() => this.navigateToRole(this.props)} className="floatRight btn formButton" >Role</button> */}
                          <button type="submit" className="floatRight btn formButton" >Save & Continue</button>
                          {/* onClick={() => this.ChangeActiveTab(1)}  */}


                        </div>


                      </div> : this.state.activeTab == 1 ?

                          <div > < ClientRoleForm />
                            {/* <button onClick={() => this.ChangeActiveTab(1)} type="button" className="floatRight btn formButton" >Save & Continue</button> */}


                          </div>

                          : null}
                    </div>

                    <div>

                    </div>
                    <br />
                    <div >



                    </div>



                  </form>
                </Col>



              </Row>
            );
          }.bind(this)}
        </Formik>
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
    getIndustry: state.getIndustry,
    createClientProfile: state.createClientProfile.createClientProfile
  };
}

var ClientFormModule = connect(mapStateToProps)(ClientForm);
export default ClientFormModule;
