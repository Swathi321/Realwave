import React, { PureComponent } from 'react'
import PropTypes from 'prop-types';
import Grid from '../Grid/GridBase';
import { connect } from 'react-redux';
import { Col, Row, Card, CardBody, CardHeader, Table} from 'reactstrap';
import { Tooltip } from 'antd';
// import { Modal, ModalHeader, ModalBody, Spinner } from 'reactstrap';
import utils from './../../Util/Util';
// import { PlayCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
import common from '../../common';
import EventFeed from '../../views/EventFeed/EventFeed';
import noVideoBlack from '../../assets/img/Newicon/no_video_black.svg';
import noVideoWhite from '../../assets/img/Newicon/no_video_white.svg';
import {
    scaleReport,
    getReceipt
} from '../../redux/actions/httpRequest';
// import dateUtils from '../../Util/dateUtil';
// import { instance } from '../../redux/actions';
// import api from '../../redux/httpUtil/serverApi';

export class Alarm extends PureComponent {
    constructor(props) {
        super(props)

        this.toggle = this.toggle.bind(this);

        let Columns = [
            { key: 'DateTime', name: 'Date Time', width: 250, sort: true, filter: true, type: 'date', converWithStoreTimezone: true },

            { key: 'ScaleId', name: 'Site', type: 'string', filter: true, width: 200, sort: true },

            { key: 'CamId', name: 'Event', type: 'string', filter: true, width: 200, sort: true },

            {
                key: 'IsVideoAvailable', name: 'Video', width: 150, toggle: true, sort: true, type: 'String', export: false, formatter: (props, record, index, scope) =>
                    <div className="cursor">
                        { record.VideoClipId && record.VideoClipId._id &&  record.VideoClipId.IsVideoAvailable ? (
                            <div className="gridVideoContainer video-thumbnail">
                                <img 
                                    className="image-video-js" 
                                    src={utils.serverUrl + "/api/eventVideoThumbnail?tid=" + record.VideoClipId._id + "&modelName=realwaveVideoClip"}
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
            },
            {
                key: 'NotificationDetail', name: 'Notification', width: 150, filter: false, sort: false, export: false, type: 'String', formatter: (props, record, index) => {
                    return (
                        <div>
                            <Tooltip overlayStyle={{ maxHeight: 500, overflow: 'auto', marginTop: 50, width: 'auto' }} onVisibleChange={this.onNotificationHover.bind(this, record)} placement='leftBottom' title={() => {
                                let { notificationData, visibility } = this.state;
                                let scaleRecord = record;
                                let obj = notificationData.length ? notificationData.map(e => {
                                    return (
                                        visibility && scaleRecord && scaleRecord._id == e.associationId && !e.message ? <div className="notification-queue-cont">
                                            {e.to && <div> <span className="notification-detail">To:</span> {e.to}</div>}
                                            {e.cc && <div><span className="notification-detail">CC:</span> {e.cc}</div>}
                                            {e.bcc && <div><span className="notification-detail">BCC:</span> {e.bcc}</div>}
                                            {e.from && <div><span className="notification-detail">From:</span> {e.from}</div>}
                                            {e.subject && <div><span className="notification-detail">Subject:</span> {e.subject}</div>}
                                            {e.body && <div ><span className="notification-detail">Message:</span></div>}
                                            {e.body && <div style={{ wordBreak: 'break-word' }} dangerouslySetInnerHTML={{ __html: `${e.body.toString()}` }} />}
                                            <div style={{ height: 20 }}>
                                            </div>
                                        </div> : scaleRecord._id == e.associationId && <div className="notification-queue-cont">{e.message ? e.message : ""}</div>

                                    )
                                }) : <img src="static/media/loader.3f259006.gif" width="30" />
                                return obj;
                            }} arrowPointAtCenter >
                                <span>
                                    <i className={`fa fa-envelope fa-2x ${record && record.NotifcationData && record.NotifcationData.length > 0 ? 'NotificationAvailable' : ""}`}></i>
                                </span>
                            </Tooltip>
                        </div >
                    )
                }
            },
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
            currentRecord: null,
        }

        localStorage.removeItem('ClientID');
        localStorage.removeItem('ClientDetails');

        // this.onRowClick = this.onRowClick.bind(this);
        this.beforeRender = this.beforeRender.bind(this);
        this.alreadyclicked = false;
        this.alreadyclickedTimeout = null;
    }

    componentWillReceiveProps(nextProps) { // NOTE component will receive props

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

        // if (nextProps['getReceiptClip'] !== this.props['getReceiptClip']) {
        //     let { data, error, isFetching } = nextProps['getReceiptClip'];
        //     console.log("🚀 ~ file: scales.js ~ line 161 ~ Alarm ~ componentWillReceiveProps ~ nextProps['getReceiptClip']", nextProps['getReceiptClip'])
        //     let valid = common.responseHandler(data, error, isFetching);
        //     if (valid) {
        //         this.setState({ currentReceipt: data.data });
        //     }
        // }

        if ((nextProps['getCameraClipData'] && nextProps['getCameraClipData'] !== this.props['getCameraClipData'])) {
            const { data, isFetching } = nextProps['getCameraClipData'];
            if (!isFetching && data) {
                this.setState({ data: data.data });
            }
        }
        // utils.updateGrid(this, nextProps, 'Video Clip');
    }

    componentWillMount() {
        localStorage.removeItem("currentPage");
      }

    // playCamera = (row, scope) => {
    //     if (row.VideoClipId && row.VideoClipId.IsVideoAvailable) {
    //         this.setState({ isOpen: true, isCommentBox: false, currentReceipt: row.VideoClipId });
    //         let loggedData = utils.getScreenDetails(utils.getLoggedUser(), this.props.location, consts.Played + row.VideoClipId.EventId + ' (' + row.VideoClipId.Status + ')');
    //         this.props.dispatch(saveActivityLog.request({ action: 'save', data: loggedData }));
    //         this.props.dispatch(this.props.receiptAction.request({ InvoiceId: row.VideoClipId.InvoiceId }));
    //     }
    // }

    // onRowClick = (index, record) => {
    //     this.setState({ isOpen: false }, function () {
    //         if (record.VideoClipId && record.VideoClipId.IsVideoAvailable) {
    //             this.setState({ isOpen: true , currentRecord: record});
    //             this.props.dispatch(getReceiptClip.request({
    //                 InvoiceId: record.VideoClipId.InvoiceId,
    //                 modelName: 'realwaveVideoClip',
    //                 ViewedOn: (new Date()).toISOString(),
    //                 Id: record.VideoClipId._id
    //             }));
    //         }
    //     })
    // }

    exchange = (data, value) => {
        this.setState({ isGridView: !this.state.isGridView, filters: data, isComingFromEventFeed: value });
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
            if (this.state.scaleReport.length == 0)
                this.setState({
                    scaleReport: customData
                })
        }

        return customData;
    }

    onNotificationHover = (record) => {
        this.setState({ notificationData: [], visibility: false }, function () {
            this.setState({ notificationData: record.NotifcationData && record.NotifcationData.length > 0 ? record.NotifcationData : [{ "message": 'No Notifications found', associationId: record._id }], visibility: true });
        });

    }

    setPage = (page) => {
        localStorage.setItem('currentPage', page)
        this.setState({
          page: page
        })
    }
    
    render() {
        const { columns, loadedData, ShowAddBtn, dataSource, isOpen, currentReceipt, currentRecord, isGridView, appliedTheme, page } = this.state;
        let { listAction, actionName, sortColumn, sortDirection } = this.props
        let screenDetails = utils.getSalesScreenDetails(this.props.location.pathname);
        let heights = window.innerHeight;
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
                             filename={"Alarm"}
                             defaultSort={{ sortColumn: sortColumn, sortDirection: sortDirection }}
                             localPaging={this.props.localPaging || false}
                             onRowClick={this.onRowClick}
                             screen={"Alarm"}
                             showCollapse={isOpen}
                             onToggle={() => this.toggle()}
                             screenPathLocation={this.props.location}
                             height={450}
                             pageProps={page}
                             setPage={this.setPage}
                            />
                        </Col>
                    </Row> : <EventFeed currentSearchResult={this.props} exchange={this.exchange} location={this.props.location} />}

                {/* {isOpen && <Modal isOpen={isOpen} className={"popup-sales video-modal"} size="lg"> // video used to open in a pop up commented the same
                    <ModalHeader className="widgetHeaderColor" toggle={() => this.setState({ isOpen: false })}></ModalHeader>
                    <ModalBody className="reorderBody">
                        {currentReceipt && currentReceipt.event && (
                            <LiveCameraCard 
                                fromVideoClip={true}
                                className="receipt-popup"
                                data={currentReceipt}
                                hideReceipt={true}
                                overVideoReceipt={false}
                                downloadVideo={true}
                                modelName={'realwaveVideoClip'}
                            />
                        )}
                    </ModalBody>
                </Modal>} */}
            </div>
        )
    }
}

Alarm.defaultProps = {
    listAction: scaleReport,
    actionName: 'scaleReport',
    receiptAction: getReceipt,
    sortColumn: 'DateTime',
    sortDirection: 'DESC',
}

Alarm.contextTypes = {
    router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) { // NOTE connect method
    return {
        clientData: state.clientData,
        getReceiptClip: state.getReceiptClip,
        getReceipt: state.getReceipt,
        theme: state.theme
    };
}

var AlarmModule = connect(mapStateToProps)(Alarm);
export default AlarmModule;