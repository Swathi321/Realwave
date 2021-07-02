import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Col, FormGroup, Row } from 'reactstrap'
import { scaleReport, saveActivityLog } from "../../redux/actions/httpRequest";
import PropTypes, { func } from 'prop-types'
import swal from 'sweetalert'
import { Formik } from 'formik'
import * as Yup from 'yup'
import CardWrapper from '../../component/CardWrapper'
import LoadingDialog from '../../component/LoadingDialog'
import utils from '../../Util/Util'
import consts from '../../Util/consts'
import $ from 'jquery'
import { instance } from '../../redux/actions';

 export class ScaleForm extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            scaleReport: [],
            columns: [
                { key: 'DateTime', name: 'Date Time', width: 250, filter: true, sort: true, type: 'string' },
                { key: 'Weight', name: 'Weight', width: 200, filter: true, sort: true, type: 'string' },
                { key: 'ScaleId', name: 'Scale Name', width: 250, filter: true, sort: true },
                { key: 'CamId', name: 'Camera', width: 250, filter: true, sort: true },
                { key: 'VideoClipId', name: 'Clip', width: 250, filter: true, sort: true }
            ]
        };
        this.onSave = this.onSave.bind(this);
    }

    componentDidMount() {
        console.log(this.props.match.params.id,"this.props.match.params.id");
        if ( this.props.match.params.id !== "0" ) {
            this.props.dispatch(
                scaleReport.request(
                    { action: "load", id: this.props.match.params.id },
                    this.props.match.params.id
                )
            );
        } else {
            this.props.dispatch(
                scaleReport.request(
                    { action: "load", id: this.props.match.params.id },
                    this.props.match.params.id
                )
            );
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.scaleReport && nextProps.scaleReport !== this.props.scaleReport) {
            let { data, isFetching, error } = nextProps.scaleReport;
            if (!isFetching) {
                if (error || (data && data.errmsg)) {
                    let errorMessage = error || "" ;
                    if (data && data.errmsg && typeof data.errmsg == "object") {
                        errorMessage = data.errmsg.message;
                    } else if (data && data.errmsg) {
                        errorMessage = data.errmsg;
                    }
                    swal({ title: "Error", text: errorMessage, icon: "error" });
                    return;                    
                } else if (data && data.message) {
                    this.props.history.goback(-1);
                } else {
                    this.setState({
                        data: data
                    });
                }
            }
        }
    }

    onSave(values, { setSubmitting }) {

        setSubmitting(false);

        var bodyFormData = new FormData();
        bodyFormData.append('action', action);
        bodyFormData.append('data', JSON.stringify(values));

            instance.post(`${api.GET_SCALES_DATA}/${id}`, bodyFormData)
                .then(res => {
                    console.log(res);
                    console.log(res.data.errmsg);
                    console.log(res.data.msg);
                    if (!res.data.success) {
                        console.log('Errorr');
                    }
                    if (res.data.success) {

                        localStorage.setItem('ClientID', res.data.data._id)
                        localStorage.setItem('ClientDetails', JSON.stringify(res.data.data))

                        utils.onNavigate({
                            props: this.props,
                            type: "replace",
                            route: '/admin/report/scales/'+ id
                        });
                    }
                }).catch(err => {
                    console.log(err)
                })
    }

    getInitialValueTemplate() {
        return {
            DateTime: "",
            Weight: "",
            ScaleId: "",
            CamId: "",
            VideoClipId: ""
        };
    }

    componentDidUpdate() {
        console.log(this.props.scaleReport,"I'm Scaless");
            if (this.props.scaleReport.data != null) {
                this.setState({
                    scaleReport: this.props.scaleReport.data.data
                })
            }
    }

    render() {

        const { props, isUpdate } = this;
        const { initialValues, scaleReport } = props;
        const { name } = initialValues || { name: '' };

        let initialValuesEdit = initialValues;

        if (initialValues.error || (initialValues && initialValues.errmsg)) {
            initialValuesEdit = this.state.data;
        }

        let isFetching = scaleReport && scaleReport.isFetching;
        isFetching = isFetching || (scaleReport && scaleReport.isFetching);

        return (
            <div>
                <LoadingDialog isOpen={isFetching} />
                <Formik
                    enableReinitialize={true}
                    initialValues={initialValuesEdit}
                    onSubmit={this.onSave}
                >
                    {function (props) {
                        const {
                            errors,
                            handleSubmit,
                            handleChange,
                            handleBlur
                        } = props;
                        return (
                            <Row>
                                <Col md={12}>
                                    <CardWrapper
                                        lg={12}
                                    >
                                        <div>
                                            <Steps>
                                                <Step.Item title="Date Time" />
                                                <Step.Item title="Weight (Lbs)" />
                                                <Step.Item title="Scale Name" />
                                                <Step.Item title="Camera" />
                                                <Step.Item title="Clip" />
                                            </Steps>
                                        </div>
                                        <Col>
                                            <form onSubmit={handlesubmit}>
                                                <div>
                                                    {this.state.activeTab == 0 ? <div>
                                                        <div>
                                                            <FormGroup col>
                                                                <Col sm={12}>
                                                                    <Input
                                                                        id="name"
                                                                        type="text"
                                                                        onBlur={handleBlur}
                                                                        value={values.DateTime}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                     />
                                                                     <label> Date Time</label>
                                                                     {errors.DateTime && <div>{errors.DateTime}</div>}
                                                                </Col>
                                                                <Col sm={12}>
                                                                    <Input
                                                                        id="name"
                                                                        type="text"
                                                                        onBlur={handleBlur}
                                                                        value={values.Weight}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                     />
                                                                     <label> Weight (Lbs)</label>
                                                                     {errors.Weight && <div>{errors.Weight}</div>}
                                                                </Col>
                                                                <Col sm={12}>
                                                                    <Input
                                                                        id="name"
                                                                        type="text"
                                                                        onBlur={handleBlur}
                                                                        value={values.ScaleId}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                     />
                                                                     <label> Scale Name</label>
                                                                     {errors.ScaleId && <div>{errors.ScaleId}</div>}
                                                                </Col>
                                                                <Col sm={12}>
                                                                    <Input
                                                                        id="name"
                                                                        type="text"
                                                                        onBlur={handleBlur}
                                                                        value={values.CamId}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                     />
                                                                     <label> Camera</label>
                                                                     {errors.CamId && <div>{errors.CamId}</div>}
                                                                </Col>
                                                                <Col sm={12}>
                                                                    <Input
                                                                        id="name"
                                                                        type="text"
                                                                        onBlur={handleBlur}
                                                                         value={values.VideoClipId}
                                                                        // value={values.VideoClipId = 'true' ? Yes : No}
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                     />
                                                                     <label> Clip</label>
                                                                     {errors.VideoClipId && <div>{errors.VideoClipId}</div>}
                                                                </Col>
                                                            </FormGroup>
                                                        </div>
                                                    </div> : null}
                                                </div>
                                            </form>
                                        </Col>
                                    </CardWrapper>
                                </Col>
                            </Row>
                        );
                    }.bind(this)}
                </Formik>
            </div>
        )
    }
}

ScaleForm.contextTypes = {
    router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {

    return{
        initialValues: state.scaleReport.data || {},
        scaleReport: state.scaleReport
    }
}

var ScaleFormModule = connect(mapStateToProps)(ScaleForm);

export default ScaleFormModule;
