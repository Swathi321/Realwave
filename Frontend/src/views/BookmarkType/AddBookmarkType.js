import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Col, FormGroup, Input, Label, Row } from 'reactstrap';
import { bookmarkType } from '../../redux/actions/httpRequest';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CardWrapper from '../../component/CardWrapper';
import LoadingDialog from '../../component/LoadingDialog';
import utils from '../../Util/Util';
import swal from 'sweetalert';
import InputColor from 'react-input-color';
import 'react-tagsinput/react-tagsinput.css';

export class AddBookmarkType extends PureComponent {
    constructor(props) {
        super(props);
        this.onCreateBookmarkType = this.onCreateBookmarkType.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
    }

    componentDidMount() {
        let { params } = this.props.match;
        if (params.id !== "0") {
            this.props.dispatch(bookmarkType.request({ action: 'load' }, this.props.match.params.id));
        }
    }

    onCancel = () => {
        this.props.history.goBack(-1)
    }


    checkalphanumeric=(e)=>{
        var regex = new RegExp("^[a-zA-Z0-9.:-]+$");
        var key = e.key;
        if (!regex.test(key)) {
            e.preventDefault();
            return false;
        }
    }
  /**
   * On change form data
   */
  changeHandler = (event, fieldName, setFieldValue) => {
    setFieldValue(fieldName, event.hex || '')
  }
    onCreateBookmarkType(values, { setSubmitting }) {
        setSubmitting(false);
        let { params } = this.props.match;
        let { id } = params;
        console.log(id,"Here is your id")
        if (id === "0") {
            this.props.dispatch(bookmarkType.request({ 
                action: 'save', 
                data: values 
            }, id, null, (response) => {
                let { success, message, errmsg, error } = response;
                if (success) {
                    swal({
                        title: utils.getAlertBoxTitle(success),
                        text: message,
                        icon: utils.getAlertBoxIcon(success)
                    }).then(function () {
                        this.props.history.push('/admin/bookmarkType');
                    }.bind(this));
                } else {
                    swal({ title: "Error", text: errmsg && errmsg.code === 11000 ? "BookMark Type already exists" : errmsg && errmsg.errors && errmsg.errors.bookmarkType && errmsg.errors.bookmarkType.kind === "minlength" ? "Please enter valid BookMark Type" : error || errmsg.errmsg, icon: "error" });
                    return;
                }
            }));
        } else {
            this.props.dispatch(bookmarkType.request({ action: 'update', data: values }, id, null, (response) => {
                let { success, message, errmsg, error, code } = response;
                if (success) {
                    swal({
                        title: utils.getAlertBoxTitle(success),
                        text: message,
                        icon: utils.getAlertBoxIcon(success)
                    }).then(function () {
                        this.props.history.push('/admin/bookmarkType');
                    }.bind(this));
                } else {
                    swal({ title: "Error", text: code && code === 11000 ? "BookMark Type already exists" : error || errmsg.errmsg, icon: "error" });
                    return;
                }
            }));
        }
    }


    onDelete = () => {
        swal({
            title: "Are you sure?",
            text: "Deleting Bookmark Type Will Delete All The Bookmark Records Associated With This Bookmark Type",
            icon: "warning",
            buttons: true,
            dangerMode: true
        }).then(function (willDelete) {
            let id = this.props.match.params.id;
            if (willDelete) {
                this.props.dispatch(bookmarkType.request({ action: 'delete' }, id, null, (response) => {
                    let { success, message, errmsg, error } = response;
                    if (success) {
                        swal({
                            title: utils.getAlertBoxTitle(success),
                            text: message,
                            icon: utils.getAlertBoxIcon(success)
                        }).then(function () {
                            this.props.history.push('/admin/bookmarkType');
                        }.bind(this));
                    } else {
                        swal({ title: "Error", text: error || errmsg.errmsg, icon: "error" });
                        return;
                    }
                }))
            }
        }.bind(this));
    }

    getInitialValueTemplate() {
        return {
            bookmarkType: ""
        }
    }

    render() {
        let isFetching = this.props.bookmarkType.isFetching;
        let { params } = this.props.match;
        let recordId = params.id;
        const initialValuesEdit = recordId !== "0" ? this.props.initialValues : {
            bookmarkType: ""
        };

        return (
            <div className="animated fadeIn">
                <LoadingDialog isOpen={isFetching} />

                <Formik
                    enableReinitialize={true}
                    initialValues={initialValuesEdit}
                    onSubmit={this.onCreateBookmarkType}

                    validationSchema={
                        Yup.object().shape({
                            bookmarkType: Yup.string().trim().required('Required')
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
                        return (
                            <Row>
                                <Col md={12}>
                                    <form onSubmit={handleSubmit}>
                                        <CardWrapper lg={12} title={recordId === "0" ? 'Create New BookMark Type' : 'Edit BookMark Type'} footer={
                                            <div className={'form-button-group'}>
                                                <div><button type="submit" className="btn formButton" disabled={isSubmitting}><i className="fa fa-save" aria-hidden="true"></i> 
                                                Save {console.log(bookmarkType," here is your response")}
                                                </button></div>
                                                <div><button type="button" className="btn formButton" onClick={this.onCancel}><i className="fa fa-close" aria-hidden="true"></i> Cancel</button></div>
                                                {recordId !== "0" && <div><button type="button" className="btn formButton" onClick={this.onDelete} ><i className="fa fa-trash" aria-hidden="true"></i> Delete</button></div>}
                                            </div>
                                        }>
                                            <FormGroup row>
                                                <Label htmlFor="bookmarkType" sm={2}>BookMark Type<span className={'text-danger'}>*</span></Label>
                                                <Col sm={6}>
                                                    <Input
                                                        id="bookmarkType"
                                                        placeholder="Enter BookMark Type"
                                                        type="text"
                                                        value={values.bookmarkType}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                       
                                                        className="form-control"
                                                    />
                                                    {errors.bookmarkType && <div className="input-feedback">{errors.bookmarkType}</div>}
                                                </Col>
                                            </FormGroup>
                                            <FormGroup row>
                                                <Label for="bookmarkColor" sm={2}>Color</Label>
                                                <Col sm={10}>
                                                    <InputColor
                                                        onChange={(e) => this.changeHandler(e, 'bookmarkColor', setFieldValue)}
                                                        initialValue={(values && values.bookmarkColor) || "#5e72e4"}
                                                        value={values && values.bookmarkColor}
                                                        placement="bottom"
                                                    />
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

AddBookmarkType.contextTypes = {
    router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
    return {
        initialValues: state.bookmarkType.data || {},
        bookmarkType: state.bookmarkType
    };
}

var AddBookmarkTypeModule = connect(mapStateToProps)(AddBookmarkType);
export default AddBookmarkTypeModule;