import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Col, FormGroup, Input, Label, Row, TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import { macAddress } from '../../redux/actions/httpRequest';
import { siteChange } from './../../redux/actions';
import PropTypes from 'prop-types';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CardWrapper from './../../component/CardWrapper';
import LoadingDialog from './../../component/LoadingDialog';
import utils from './../../Util/Util';
import swal from 'sweetalert';
import 'react-tagsinput/react-tagsinput.css';
export class AddMacAddress extends PureComponent {
    constructor(props) {
        super(props);
        this.onCreateMacAddress = this.onCreateMacAddress.bind(this);
        this.onCreateMacAddressRange = this.onCreateMacAddressRange.bind(this);
        this.onCancel = this.onCancel.bind(this);
    }

    componentDidMount() {
        let { params } = this.props.match;
        if (params.id !== "0") {
            this.props.dispatch(macAddress.request({ action: 'load' }, this.props.match.params.id));
        }
    }

    onCancel = () => {
        this.props.history.goBack(-1)
    }


    checkalphanumeric = (e) => {
        var regex = new RegExp("^[a-zA-Z0-9.:-]+$");
        var key = e.key;
        if (!regex.test(key)) {
            e.preventDefault();
            return false;
        }
    }

    handleKeyUp = (value) => {
        if (value) {
            return value.toUpperCase()
        }


        // if(Object.keys(values).length!==0 && values.macaddress){
        //     values.macaddress=values.macaddress.toUpperCase()
        // }

    }

    onCreateMacAddress(values, { setSubmitting }) {
        values.macaddress = values.macaddress.toUpperCase()
        setSubmitting(false);
        let { params } = this.props.match;
        let { id } = params;
        if (id === "0") {
            this.props.dispatch(macAddress.request({ action: 'save', data: values }, id, null, (response) => {
                let { success, message, errmsg, error } = response;
                if (success) {
                    swal({
                        title: utils.getAlertBoxTitle(success),
                        text: message,
                        icon: utils.getAlertBoxIcon(success)
                    }).then(function () {
                        this.props.history.push('/admin/macAddresses');
                    }.bind(this));
                } else {
                    swal({ title: "Error", text: errmsg && errmsg.code === 11000 ? "Mac Address already exists" : errmsg && errmsg.errors && errmsg.errors.macaddress && errmsg.errors.macaddress.kind === "minlength" ? "Please enter valid Mac Address" : error || errmsg.errmsg, icon: "error" });
                    return;
                }
            }));
        } else {
            this.props.dispatch(macAddress.request({ action: 'update', data: values }, id, null, (response) => {
                let { success, message, errmsg, error, code } = response;
                if (success) {
                    swal({
                        title: utils.getAlertBoxTitle(success),
                        text: message,
                        icon: utils.getAlertBoxIcon(success)
                    }).then(function () {
                        this.props.history.push('/admin/macAddresses');
                    }.bind(this));
                } else {
                    swal({ title: "Error", text: code && code === 11000 ? "Mac Address already exists" : error || errmsg.errmsg, icon: "error" });
                    return;
                }
            }));
        }
    }

    onCreateMacAddressRange(values, { setSubmitting }) {
        setSubmitting(false);
        this.props.dispatch(macAddress.request({ action: 'create_range', data: values }, null, null, (response) => {
            let { success, message, errmsg, error, isTimedOut } = response;
            if (success) {
                swal({
                    title: utils.getAlertBoxTitle(success),
                    text: message,
                    icon: utils.getAlertBoxIcon(success)
                }).then(function () {
                    this.props.history.push('/admin/macAddresses');
                }.bind(this));
            } else {
                swal({ title: "Error", text: isTimedOut ? "Timeout" : error || errmsg.errmsg, icon: "error" });
                return;
            }
        }));
    }

    onDelete = () => {
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this site",
            icon: "warning",
            buttons: true,
            dangerMode: true
        }).then(function (willDelete) {
            let id = this.props.match.params.id;
            if (willDelete) {
                this.props.dispatch(macAddress.request({ action: 'delete' }, id, null, (response) => {
                    let { success, message, errmsg, error } = response;
                    if (success) {
                        swal({
                            title: utils.getAlertBoxTitle(success),
                            text: message,
                            icon: utils.getAlertBoxIcon(success)
                        }).then(function () {
                            this.props.history.push('/admin/macAddresses');
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
            macaddress: "",
            basemacaddress: 'D0-14-11-7'
        }
    }

    macAddressFormat = (e, setFieldValue) => {
        var r = /([a-f0-9]{2})([a-f0-9]{2})/i,
            str = e.target.value.replace(/[^a-f0-9]/ig, "");

        while (r.test(str)) {
            str = str.replace(r, '$1' + ':' + '$2');
        }
        str = str.slice(0, 17);
        setFieldValue("macaddress", str);
    }

    render() {
        let isFetching = this.props.macAddress.isFetching;
        let { params } = this.props.match;
        let recordId = params.id;
        const initialValuesEdit = recordId !== "0" ? this.props.initialValues : {
            macaddress: "",
            basemacaddress: 'D0-14-11-7'
        };

        return (
            <div className="animated fadeIn">
                <LoadingDialog isOpen={isFetching} />

                <Formik
                    enableReinitialize={true}
                    initialValues={initialValuesEdit}
                    onSubmit={this.onCreateMacAddress}

                    validationSchema={
                        Yup.object().shape({
                            macaddress: Yup.string().trim().required('Required')
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
                                        <CardWrapper lg={12} title={recordId === "0" ? 'Create New Mac Address' : 'Edit Mac Address'} footer={
                                            <div className={'form-button-group'}>
                                                <div><button type="submit" className="btn formButton" disabled={isSubmitting}><i className="fa fa-save" aria-hidden="true"></i> Save</button></div>
                                                <div><button type="button" className="btn formButton" onClick={this.onCancel}><i className="fa fa-close" aria-hidden="true"></i> Cancel</button></div>
                                                {recordId !== "0" && <div><button type="button" className="btn formButton" onClick={this.onDelete} ><i className="fa fa-trash" aria-hidden="true"></i> Delete</button></div>}
                                            </div>
                                        }>
                                            <FormGroup row>
                                                <Label htmlFor="macaddress" sm={2}>Mac Address<span className={'text-danger'}>*</span></Label>
                                                <Col sm={6}>
                                                    <Input
                                                        id="macaddress"
                                                        placeholder="Enter Mac Address"
                                                        type="text"
                                                        value={this.handleKeyUp(values.macaddress)}
                                                        onChange={handleChange}
                                                        onBlur={(e) => {
                                                            this.macAddressFormat(e, setFieldValue);
                                                            handleBlur(e);
                                                        }}

                                                        className="form-control"
                                                    />
                                                    {errors.macaddress && <div className="input-feedback">{errors.macaddress}</div>}
                                                </Col>
                                            </FormGroup>
                                        </CardWrapper>
                                    </form>
                                </Col>
                            </Row>
                        );
                    }.bind(this)}
                </Formik>
                {/* {recordId === "0" &&
                        <Formik
                            enableReinitialize={true}
                            initialValues={initialValuesEdit}
                            onSubmit={this.onCreateMacAddressRange}
                            validationSchema={
                                Yup.object().shape({
                                    basemacaddress: Yup.string().trim().required('Required')
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
                                    handleSubmit
                                } = props;
                                return (
                                    <Row>
                                        <Col md={12}>
                                            <form onSubmit={handleSubmit}>
                                                <FormGroup row>
                                                    <Label htmlFor="bacemacaddress" sm={2}>Base Mac Address<span className={'text-danger'}>*</span></Label>
                                                    <Col sm={6}>
                                                        <Input
                                                            id="basemacaddress"
                                                            placeholder="Enter Base Mac Address"
                                                            type="text"
                                                            value={values.basemacaddress}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            className="form-control"
                                                        />
                                                        {errors.basemacaddress && <div className="input-feedback">{errors.basemacaddress}</div>}
                                                    </Col>
                                                </FormGroup>
                                                <FormGroup row>
                                                    <Label htmlFor="bacemacaddress" sm={2}><span className={'text-danger'}></span></Label>
                                                    <Col sm={6}>
                                                        <button type="submit" className="btn formButton" disabled={isSubmitting}>Create Mac Address Range</button>
                                                    </Col>
                                                </FormGroup>
                                            </form>
                                        </Col>
                                    </Row>
                                );
                            }.bind(this)}
                        </Formik>} */}

            </div>
        )
    }
}

AddMacAddress.contextTypes = {
    router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
    return {
        initialValues: state.macAddress.data || {},
        macAddress: state.macAddress
    };
}

var AddMacAddressModule = connect(mapStateToProps)(AddMacAddress);
export default AddMacAddressModule;