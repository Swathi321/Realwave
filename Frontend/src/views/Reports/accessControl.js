import React, { PureComponent } from 'react'
import PropTypes from 'prop-types';
import Grid from '../Grid/GridBase';
import { kicReports, getReceiptClip, getReceipt } from '../../redux/actions/httpRequest';
import { connect } from 'react-redux';
import { Col, Row, Modal, ModalHeader, ModalBody } from 'reactstrap';
import utils from './../../Util/Util';
// import { PlayCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
import common from '../../common';
import LiveCameraCard from "../../component/LiveCameraCard";
import EventFeed from '../../views/EventFeed/EventFeed';
import noVideoBlack from '../../assets/img/Newicon/no_video_black.svg';
import noVideoWhite from '../../assets/img/Newicon/no_video_white.svg';
import { Tooltip } from 'antd';

export class AccessControl extends PureComponent {
    constructor(props) {
        super(props)

        this.toggle = this.toggle.bind(this);

        let Columns = [
            { key: 'data.attributes.occurredAt', name: 'Date Time', width: 200, sort: true, filter: true, type: 'date', converWithStoreTimezone: true },
            {
                key: 'data.attributes.associatedResourceId', name: 'User', type: 'kicuserid', filter: true, width: 150, sort: true, formatter: (props, record) => {
                    return (
                        <div>{record.data && record.data.attributes && record.data.attributes.associatedResourceId && record.data.attributes.associatedResourceId.kicAssociatedName ? record.data.attributes.associatedResourceId.kicAssociatedName : record.data.attributes.associatedResourceId}</div>
                    )
                }
            },
            {
                key: 'data.type', name: 'Event', type: 'String', filter: true, width: 100, sort: true, formatter: (props, record) => {
                    let color = record  && record.color ? "#000" : "inherit";
                    return (
                        <div class="pl-2" style={{ background: record.color, color: color }}>{record.data.type}</div>
                    )
                }
            },
            {
                key: 'pinUsed', name: 'Pin Used', type: 'String', width: 100, formatter: (props, record) => {
                    let Event = record.data.type.toLowerCase();
                    return (
                        <div>{Event == "access denied" || Event == "access_denied_event" ? record.pinUsed : ''}</div>
                    );
                }
            },
            {
                key: 'publisherId', name: 'Lock Name', type: 'lockid', filter: true, width: 120, sort: true, formatter: (props, record) => {
                    return (
                        <div>{record.publisherId && record.publisherId.kicDeviceName ? record.publisherId.kicDeviceName : record.publisherId.name}</div>
                    );
                }
            },
            { key: 'Camera.name', name: 'Camera', type: 'camid', filter: true, width: 150, sort: true },
            {
                key: 'IsVideoAvailable', name: 'Video', width: 150, toggle: true, sort: true, type: 'String', export: false, formatter: (props, record, index, scope) =>
                    <div className="cursor"
                        onClick={() => this.onRowClick(scope, record)}
                    >
                        {/* {record.VideoClipId && record.VideoClipId._id && record.VideoClipId.IsVideoAvailable ? <div className="gridVideoContainer video-thumbnail"><img className="image-video-js" src={utils.serverUrl + "/api/eventVideoThumbnail?tid=" + record.VideoClipId._id + "&modelName=realwaveVideoClip"} /> */}
                        {record.videoClipdata && record.videoClipdata._id ? <div className="gridVideoContainer video-thumbnail"><img className="image-video-js" src={utils.serverUrl + "/api/eventVideoThumbnail?tid=" + record.VideoClipId + "&modelName=realwaveVideoClip"} />
                        </div> :
                            <img src={scope.props.appliedTheme && scope.props.appliedTheme.className === 'theme-dark' ? noVideoWhite : noVideoBlack} alt="noVideo" className='width_1_5em no-video' />
                        }
                    </div>
            }
        ];

        this.state = {
            columns: Columns,
            isGridView: true,
            scaleReport: [],
            isOpen: false,
            currentReceipt: null,
            appliedTheme: '',
            notificationData: [],
            visibility: false,
            page: localStorage.getItem('currentPage')
        }

        localStorage.removeItem('ClientID');
        localStorage.removeItem('ClientDetails');

        this.onRowClick = this.onRowClick.bind(this);
        this.beforeRender = this.beforeRender.bind(this);
        this.alreadyclicked = false;
        this.alreadyclickedTimeout = null;
    }

    componentWillReceiveProps(nextProps) {

        const { receiptActionName, updateReceiptActionName } = this.props;

        if (nextProps[receiptActionName] !== this.props[receiptActionName]) {
            let { data, error, isFetching } = nextProps[receiptActionName];
            let valid = common.responseHandler(data, error, isFetching);
            if (valid) {
                if (this.state.isGridView) {
                    this.setState({ isOpen: true, currentReceipt: data.data });
                }
            }
        }

        if (nextProps.theme) {
            this.setState({ appliedTheme: nextProps.theme });
        }

        if (nextProps['getReceiptClip'] !== this.props['getReceiptClip']) {
            let { data, error, isFetching } = nextProps['getReceiptClip'];
            let valid = common.responseHandler(data, error, isFetching);
            if (valid) {
                this.setState({ currentReceipt: data.data });
            }
        }

        if ((nextProps['getCameraClipData'] && nextProps['getCameraClipData'] !== this.props['getCameraClipData'])) {
            const { data, isFetching } = nextProps['getCameraClipData'];
            if (!isFetching && data) {
                this.setState({ data: data.data });
            }
        }

    }

    onRowClick = (index, record) => {
        this.setState({ isOpen: false }, function () {
            if (record.VideoClipId && record.VideoClipId.IsVideoAvailable) {
                this.setState({ isOpen: true });
                this.props.dispatch(getReceiptClip.request({ InvoiceId: record.VideoClipId.InvoiceId, modelName: 'realwaveVideoClip', ViewedOn: (new Date()).toISOString(), Id: record.VideoClipId._id }));
            }
        })

    }

    toggle() {
        let { isOpen } = this.state
        this.setState({ isOpen: !isOpen });
    }


    getStoreName(storeData) {
        let name = '';
        storeData.forEach(element => {
            name += ", " + element.name;
        });
        if (name[0] == ",") {
            name = name.substring(1);
        }
        return name;
    }

    beforeRender(data) {
        let customData = [];
        if (data && data.length > 0) {
            data.forEach(item => {
                let storeData = item.storeId;
                item.storeId = storeData instanceof Array ? this.getStoreName(storeData) : storeData;
                customData.push(item);
            });
        }
        if (customData.length > 0) {
            console.log(this.state.scaleReport);
            if (this.state.scaleReport.length == 0)
                this.setState({
                    scaleReport: customData
                })
        }

        return customData;
    }

    componentWillMount() {
        localStorage.removeItem('currentPage')
    }

    setPage = (page) => {
        localStorage.setItem('currentPage', page)
        this.setState({
            page: page
        })
    }

    render() {
        const { columns, loadedData, ShowAddBtn, dataSource, isOpen, currentReceipt, isGridView, appliedTheme, page } = this.state;
        let { listAction, actionName, sortColumn, sortDirection } = this.props
        return (
            <div className="grid-wrapper-area">
                {isGridView ?
                    <Row>
                        <Col md={12}>
                            <Grid
                                appliedTheme={appliedTheme}
                                AccessControlFilter={true}
                                add={false}
                                hideSearch={true}
                                hideColumnButton={true}
                                beforeRender={this.beforeRender}
                                loadedData={loadedData}
                                listAction={listAction}
                                dataProperty={actionName}
                                exportButton={true}
                                columns={columns}
                                autoHeight={true}
                                showCleanFilter={true}
                                hidePref={true}
                                filename={"Access Control"}
                                defaultSort={{ sortColumn: sortColumn, sortDirection: sortDirection }}
                                localPaging={this.props.localPaging || false}
                                onRowClick={this.onRowClick}
                                screen={"Access Control"}
                                showCollapse={isOpen}
                                onToggle={() => this.toggle()}
                                screenPathLocation={this.props.location}
                                height={450}
                                pageProps={page}
                                setPage={this.setPage}
                                model="realWave"
                            />
                        </Col>
                        {/* {currentReceipt && currentReceipt.event && isGridView && isOpen &&
                            <Col md={6} className="event-feed-stop-scroll grid-video" style={{ height: heights - 130 }}>
                                <Card className="camera-card-height">
                                    <CardHeader className="eventFeed-title contentText">
                                        <Row>
                                            <Col md={12}>
                                                {screenDetails.name + " Register " + (currentReceipt.event.Register || '') + "-" + moment(currentReceipt.event.EventTime).format(utils.dateFormat)}
                                            </Col>
                                        </Row>
                                    </CardHeader>
                                    <CardBody className="event-feed-transaction">
                                        <LiveCameraCard className="receipt-popup" data={currentReceipt} hideReceipt={this.props.hideReceipt || false} overVideoReceipt={true} downloadVideo={true} modelName={'realwaveVideoClip'} />
                                    </CardBody>
                                </Card>
                            </Col>
                        } */}
                    </Row> : <EventFeed currentSearchResult={this.props} exchange={this.exchange} location={this.props.location} />}

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

AccessControl.defaultProps = {
    listAction: kicReports,
    actionName: 'kicReports',
    receiptAction: getReceipt,
    sortColumn: 'data.attributes.occurredAt',
    sortDirection: 'DESC',
}

AccessControl.contextTypes = {
    router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
    return {
        getReceiptClip: state.getReceiptClip,
        getReceipt: state.getReceipt,
        theme: state.theme
    };
}

var AccessControlModule = connect(mapStateToProps)(AccessControl);
export default AccessControlModule;
