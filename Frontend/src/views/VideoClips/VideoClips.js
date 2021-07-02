import React, { PureComponent } from 'react'
import PropTypes from 'prop-types';
import Grid from '../Grid/GridBase';
import { getPendingVideoClip, getReceiptClip } from '../../redux/actions/httpRequest';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Modal, ModalHeader, ModalBody, Spinner } from 'reactstrap';
import dateUtils from '../../Util/dateUtil';
import common from '../../common';
import LiveCameraCard from '../../component/LiveCameraCard';
import utils from '../../Util/Util';
import moment from 'moment';
import consts from '../../Util/consts';
import noVideoBlack from '../../assets/img/Newicon/no_video_black.svg';
import noVideoWhite from '../../assets/img/Newicon/no_video_white.svg';


export class VideoClips extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            columns: this.getColumns(),
            currentReceipt: null,
            appliedTheme: '',
            page: localStorage.getItem('currentPage')
        }
        // this.onRowClick = this.onRowClick.bind(this);
    };

    getColumns() {
        return [
            { key: 'StoreId', name: 'Store Name', width: 150, filter: false, sort: true, type: 'string' },
            { key: 'CamId', name: 'Camera Name', width: 150, filter: false, sort: true, type: 'string' },
            { key: 'AlarmEventId', name: 'Event Type', width: 150, formatter: (props, record, index, gridScope) => consts.EventType[record.Type] },
            // { Key: 'EventDetail', name: 'Event Name', width: 150, formatter: (props, record, index, gridScope) => record.EventDetail ? <div > {record.EventDetail}</div> : null },
            {
                key: 'RejectedReason',
                name: 'Is Video Available ?',
                width: 200,
                filter: false,
                sort: true,
                type: 'string',
                formatter: (props, record) => record.IsVideoAvailable ? <div >Yes</div> : <div >No</div>,
            },
            {
                key: 'IsVideoAvailable', name: 'Video', width: 150, toggle: true, sort: true, type: 'String', export: false, formatter: (props, record, index, scope) => {
                    console.log('scope.props.appliedTheme', scope.props.appliedTheme)
                    return (
                        <div className="cursor">
                            { record._id && record.IsVideoAvailable ? (
                                <div className="gridVideoContainer video-thumbnail">
                                    <img
                                        className="image-video-js"
                                        src={utils.serverUrl + "/api/eventVideoThumbnail?tid=" + record._id + "&modelName=realwaveVideoClip"}
                                    />
                                </div>
                            ) :
                                <img
                                    src={scope.props.appliedTheme && scope.props.appliedTheme.className === 'theme-dark' ? noVideoWhite : noVideoBlack}
                                    alt="noVideo"
                                    className='width_1_5em no-video'
                                />

                            }
                        </div>
                )}
            },
            { key: 'EventTime', name: 'Start Time', width: 150, filter: false, sort: true, type: 'date', formatter: (props, record) => record.StartTime },
            { key: 'EventEndTime', name: 'End Time', width: 150, filter: false, sort: true, type: 'date', formatter: (props, record) => record.EndTime },
            {
                key: 'CreatedByUserId.name',
                name: 'Created By',
                width: 150,
                filter: false,
                sort: true,
                type: 'string',
                formatter: (props, record) => record.CreatedByUserId ? record.CreatedByUserId.firstName + ' ' + record.CreatedByUserId.lastName : "System"
            },
        ]
    }

    // onRowClick = (index, record) => {
    //     if (record.IsVideoAvailable) {
    //         this.setState({ isOpen: true });
    //         this.props.dispatch(
    //             getReceiptClip
    //                 .request({
    //                     InvoiceId: record.InvoiceId,
    //                     modelName: 'realwaveVideoClip',
    //                     ViewedOn: (new Date()).toISOString(),
    //                     Id: record._id
    //                 })
    //             );
    //     }
    // }

    componentWillMount() {
        localStorage.removeItem("currentPage");
    }

    componentWillReceiveProps(nextProps) {

        if (nextProps['getReceiptClip'] !== this.props['getReceiptClip']) {
            let { data, error, isFetching } = nextProps['getReceiptClip'];
            let valid = common.responseHandler(data, error, isFetching);
            if (valid) {
                this.setState({ currentReceipt: data.data });
            }
        }

        if (nextProps.theme) {
            console.log('nextProps.theme', nextProps.theme)
            this.setState({ appliedTheme: nextProps.theme });
        }

        if ((nextProps['getCameraClipData'] && nextProps['getCameraClipData'] !== this.props['getCameraClipData'])) {
            const { data, isFetching } = nextProps['getCameraClipData'];
            if (!isFetching && data) {
                this.setState({ data: data.data });
            }
        }

        utils.updateGrid(this, nextProps, 'Video Clip');
    }

    setPage = (page) => {
        localStorage.setItem('currentPage', page)
        this.setState({
            page: page
        })
    }

    render() {
        const { loadedData, columns, currentReceipt, isOpen , page} = this.state;
        const { listAction, actionName, sortColumn, sortDirection, localPaging, storeChange, appliedTheme } = this.props;
        const screenDetails = utils.getSalesScreenDetails(this.props.location.pathname);
        return (
            <div className="grid-wrapper-area">
                <Row>
                    <Col>
                        <Grid
                            appliedTheme={appliedTheme}
                            listAction={listAction}
                            dataProperty={actionName}
                            columns={columns}
                            hidePref={true}
                            // onRowClick={this.onRowClick}
                            filename={"Video Clip"}
                            screen={"Video Clip"}
                            defaultSort={{ sortColumn: 'EventTime', sortDirection: 'DESC' }}
                            localPaging={localPaging || false}
                            screenPathLocation={this.props.location}
                            populate={'CamId StoreId CreatedByUserId'}
                            showAllRecords={true}
                            height={370}
                            // video clip implementation
                            isPOS={false}
                            model="realWave"
                            screenDetails={screenDetails}
                            pageProps={page}
                            setPage={this.setPage}
                        />
                    </Col>
                </Row>
                {isOpen && <Modal isOpen={isOpen} className={"popup-sales video-modal"} size="lg">
                    <ModalHeader className="widgetHeaderColor" toggle={() => this.setState({ isOpen: false })}></ModalHeader>
                    <ModalBody className="reorderBody">
                        {currentReceipt && currentReceipt.event && <LiveCameraCard fromVideoClip={true} className="receipt-popup" data={currentReceipt} hideReceipt={true} overVideoReceipt={false} downloadVideo={true} modelName={'realwaveVideoClip'} />}
                    </ModalBody>
                </Modal>}
            </div>
        )
    }
}

VideoClips.defaultProps = {
    listAction: getPendingVideoClip,
    actionName: 'getPendingVideoClip'
}

VideoClips.contextTypes = {
    router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
    return {
        getPendingVideoClip: state.getPendingVideoClip,
        getReceiptClip: state.getReceiptClip,
        storeChange: state.storeChange,
        getCameraClipData: state.getCameraClipData,
        theme: state.theme
    };
}

export default connect(mapStateToProps)(VideoClips);
