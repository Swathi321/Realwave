import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Col, FormGroup, Input, Label, Row } from 'reactstrap';
import { saveActivityLog, getIndustry, deleteIndustry } from '../../redux/actions/httpRequest';
import PropTypes from 'prop-types';
import swal from 'sweetalert';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CardWrapper from './../../component/CardWrapper';
import LoadingDialog from './../../component/LoadingDialog';
import utils from './../../Util/Util';
import consts from '../../Util/consts';
import Select from 'react-select';
// import '../User/styles.scss';

export class IndustryForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      deleteDone: true,
      FormName: '',
      FormDescription: ''
    }

    this.onSave = this.onSave.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.isUpdate = this.props.match.params.id !== "0";
  }

  componentDidMount() {

    let filters = [

      {
        "operator": "like",
        "value": 0,
        "property": "industryStatus",
        "type": "numeric"
      }
    ]
    // let props = this.props
    // if (this.props.match.params.id !== "0") {
    this.props.dispatch(getIndustry.request({ action: 'load', id: this.props.match.params.id }, this.props.match.params.id));
    // } else {
    //   this.props.dispatch(getIndustry.request({ action: 'load', id: this.props.match.params.id }, this.props.match.params.id));
    // }
  }
  componentWillReceiveProps(nextProps) {

    if (nextProps.deleteIndustry && nextProps.deleteIndustry.data && !this.state.deleteDone) {
   
      let DeleteRes = nextProps.deleteIndustry;

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

    if ((nextProps.getIndustry && nextProps.getIndustry !== this.props.getIndustry)) {
      let { data, isFetching, error } = nextProps.getIndustry;
      if (!isFetching) {
        if (error || (data && data.errmsg)) {
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
          // debugger
          this.setState({
            data: data,
            FormName: data.name,
            FormDescription: data.description
            // imagePreviewUrl: data.name ? utils.serverUrl + '/Client/' + (data.logo || 'NoVideoAvailable.jpg') : null
          })
        }
        // this.setState({ file: null })
      }
    }


  }

  onCancel = () => {
    this.props.location.CheckPrevLoc = true;
    this.props.history.goBack(-1)
  }

  onSave(values, { setSubmitting }) {
    setSubmitting(false);
    // let { file } = this.state;
    let { params } = this.props.match;
    let { id } = params;
    let loggedData;

    values.name = this.state.FormName;
    values.description = this.state.FormDescription;

    this.props.location.CheckPrevLoc = true;

    if (id === "0") {
      loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Added + ' - ' + values.name);
      this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
      this.props.dispatch(getIndustry.request({ action: 'save', data: values }, id));
    } else {
      utils.deleteUnUsedValue(values);
      loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Added + ' - ' + values.name);
      this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
      this.props.dispatch(getIndustry.request({ action: 'update', data: values }, id));
    }
  }

  handleChange = (e, stateVar) => {
    this.setState({ [stateVar]: e.target.value })
  }

  onDelete = () => {
    swal({
      title: "Are you sure?",
      text: "Do you really want to delete this industry? This process can not be undone.",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(function (willDelete) {
      let id = this.props.match.params.id;
      if (willDelete) {

        this.setState({ deleteDone: false })
        this.props.location.CheckPrevLoc = true;
        let loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Delete + ' - ' + this.props.getIndustry.data.name);
        this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
        // this.props.dispatch(getIndustry.request({ action: 'delete', data: '' }, id))
        this.props.dispatch(deleteIndustry.request({}, id, 'put'))
      }
    }.bind(this));
  }

  getInitialValueTemplate() {
    return {
      name: "",
      description: ""
    }
  }

  render() {
    const { onCancel, props, onDelete, isUpdate, state } = this;
    const { initialValues } = props;
    const { name } = initialValues || { name: '' };
    const { Status, Theme } = consts;
    let { FormDescription, FormName } = state;

    let initialValuesEdit = isUpdate ? initialValues : {
      name: "",
      description: ""
    };

    if (initialValues.error || initialValues && initialValues.errmsg) {
      initialValuesEdit = this.state.data;
    }

    // let options = [
    //   { value: Status.Active, label: Status.Active },
    //   { value: Status.Inactive, label: Status.Inactive }
    // ];

    // let themeOptions = [
    //   { value: Theme.Dark, label: 'Dark' },
    //   { value: Theme.Light, label: 'Light' },
    //   { value: Theme.Bacardi, label: 'Bacardi' },
    //   { value: Theme["Coca-Cola"], label: 'Coca-Cola' },
    //   { value: Theme.Starbucks, label: 'Starbucks' },
    //   { value: Theme["Snow-White"], label: 'Snow-White' },
    //   { value: Theme.Hanwha, label: 'Hanwha' },
    //   { value: Theme.Geutebruck, label: 'Geutebruck' }
    // ];

    let { getIndustry } = this.props;
    let isFetching = getIndustry && getIndustry.isFetching;
    isFetching = isFetching || getIndustry && getIndustry.isFetching;
    // let imagePreview = null;
    // if (imagePreviewUrl) {
    //   imagePreview = (<img src={imagePreviewUrl} />);
    // }
    return (
      <div className="animated fadeIn">
        <LoadingDialog isOpen={isFetching} />
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
              <Row>
                <Col md={12}>
                  <form onSubmit={handleSubmit}>
                    <CardWrapper lg={12} title={isUpdate ? (name) : 'Create new Industry'} footer={
                      <div className={'form-button-group'}>
                        <div><button type="submit" className="btn formButton" disabled={isSubmitting}><i className="fa fa-save" aria-hidden="true"></i> Save</button></div>
                        <div> <button type="button" className="btn formButton" onClick={onCancel} disabled={isSubmitting}><i className="fa fa-close" aria-hidden="true"></i> Cancel</button></div>
                        {isUpdate && <div> <button type="button" className="btn formButton" onClick={onDelete} disabled={isSubmitting}><i className="fa fa-trash" aria-hidden="true"></i> Delete</button></div>}
                      </div>
                    }>

                      <div className="row">
                        <div className='col-lg-6'>

                          <FormGroup col>
                            {/* <Label htmlFor="name" sm={12}> Industry Name<span className={'text-danger'}>*</span></Label> */}
                            <Col sm={12} className="text-field">
                              <Input
                                id="name"
                                type="text"
                                value={FormName}
                                onBlur={handleBlur}
                                onChange={(e) => this.handleChange(e, 'FormName')}
                                className="form-control text-form"
                                required
                              />
                              <label className="text-label">Industry Name <span className={'text-danger'}>*</span> </label>
                              {/* {errors.name && <div className="input-feedback">{errors.name}</div>} */}
                            </Col>
                          </FormGroup>

                          <FormGroup col>
                            {/* <Label htmlFor="name" sm={12}> Industry Name<span className={'text-danger'}>*</span></Label> */}
                            <Col sm={12} className="text-field">
                              <Input
                                id="description"
                                type="textarea"
                                value={FormDescription}
                                onBlur={handleBlur}
                                onChange={(e) => this.handleChange(e, 'FormDescription')}
                                className="form-control text-form"
                                maxLength="500"
                                rows="3"
                              />
                              <span class="floatRight blckClr">{FormDescription ? FormDescription.length : 0}/500 characters</span>
                              <label className="text-label">Description  </label>
                              {/* {errors.description && <div className="input-feedback">{errors.description}</div>} */}
                            </Col>
                          </FormGroup>
                          



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
    )
  }
}

IndustryForm.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
  
  return {
    initialValues: state.getIndustry.data || {},
    getIndustry: state.getIndustry,
    deleteIndustry: state.deleteIndustry
  };
}

var IndustryFormModule = connect(mapStateToProps)(IndustryForm);
export default IndustryFormModule;
