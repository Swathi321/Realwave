import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Col, FormGroup, Input, Label, Row } from 'reactstrap';
import { roleData, saveActivityLog } from '../../redux/actions/httpRequest';
import { roleUpdate } from '../../redux/actions/index';
import PropTypes from 'prop-types';
import swal from 'sweetalert';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CardWrapper from '../../component/CardWrapper';
import LoadingDialog from '../../component/LoadingDialog';
import utils from '../../Util/Util';
import Permission from './Permission';
import consts from '../../Util/consts';

export class RoleForm extends PureComponent {
  constructor(props) {
    super(props);

    this.onSave = this.onSave.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.isUpdate = this.props.match.params.id !== "0";
  }

  componentDidMount() {
    if (this.props.match.params.id !== "0") {
      this.props.dispatch(roleData.request({ action: 'load', id: this.props.match.params.id }, this.props.match.params.id));
    } else {
      this.props.dispatch(roleData.request({ action: 'load', id: this.props.match.params.id }, this.props.match.params.id));
    }
  }
  componentWillReceiveProps(nextProps) {

    if ((nextProps.roleData && nextProps.roleData !== this.props.roleData)) {
      let { data, isFetching, error } = nextProps.roleData;
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
          this.props.history.goBack(-1);
        } else {
          this.setState({
            data: data
          })
        }
      }
    }
  }

  onCancel = () => {
    this.props.history.goBack(-1);
  }

  onSave(values, { setSubmitting }) {
    setSubmitting(false);
    let { params } = this.props.match;
    let { id } = params;
    let loggedData;
    if (id === "0") {
      loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Added + ' - ' + values.name);
      this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
      this.props.dispatch(roleData.request({ action: 'save', data: values }, id));
    } else {
      utils.deleteUnUsedValue(values);
      loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Update + ' - ' + values.name);
      this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
      this.props.dispatch(roleData.request({ action: 'update', data: values }, id));
    }
  }

  onDelete = () => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this site",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(function (willDelete) {
      let id = this.props.match.params.id;
      if (willDelete) {
        let loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Delete + ' - ' + this.props.roleData.data.name);
        this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
        this.props.dispatch(roleData.request({ action: 'delete' }, id))
      }
    }.bind(this));
  }

  getInitialValueTemplate() {
    return {
      name: "",
      description: "",
      permissions: []
    }
  }

  render() {
    const { onCancel, props, onDelete, isUpdate } = this;
    const { initialValues, roleData } = props;
    const { name } = initialValues || { name: '' };

    let initialValuesEdit = initialValues

    if (initialValues.error || initialValues && initialValues.errmsg) {
      initialValuesEdit = this.state.data;
    }

    let isFetching = roleData && roleData.isFetching;
    isFetching = isFetching || roleData && roleData.isFetching;
    return (
      <div className="animated fadeIn">
        <LoadingDialog isOpen={isFetching} />
        <Formik
          enableReinitialize={true}
          initialValues={initialValuesEdit}
          onSubmit={this.onSave}
          validationSchema={
            Yup.object().shape({
              name: Yup.string().trim().required('Required')
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
                    <CardWrapper lg={12} title={isUpdate ? (name) : 'Create new role'} footer={
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
                      </FormGroup>
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

RoleForm.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    initialValues: state.roleData.data || {
      name: "",
      description: "",
      permissions: []
    },
    roleData: state.roleData
  };
}

var RoleFormModule = connect(mapStateToProps)(RoleForm);
export default RoleFormModule;
