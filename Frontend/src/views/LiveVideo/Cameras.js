import React, { Component } from 'react';
import { Col, Row, Navbar, Card, CardBody } from 'reactstrap';
import VideoPlayer from '../../component/VideoPlayer';
import { connect } from 'react-redux';
import siteVideoIcon from '../../assets/img/SiteVideoIcon.png';
import icons3x4 from '../../assets/img/3x4.png';
import { exitFullScreen } from './../../redux/actions';
import { getStoreCameras, getStoreId } from './../../redux/actions/httpRequest';
import LoadingDialog from '../../component/LoadingDialog';

class Cameras extends Component {
    constructor(props) {
        super(props)
        this.state = {
            camLayoutCal: { layout: '2x3', col: '4', row: 2 },
            storeCam: [],
            isFull: true,
            camData: [],
            isLoadingDialog: false
        };
        this.onSelect = this.onSelect.bind(this);
        this.fullScreenState = this.fullScreenState.bind(this);
        this.exit = this.exit.bind(this);
        this.onActionVideo = this.onActionVideo.bind(this);
    }

    getLayoutStyle(layout) {
        let toReturn = {};
        switch (layout) {
            case "1x1":
                toReturn = { layout: layout, col: '12', row: 1 };
                break;

            case "2x2":
                toReturn = { layout: layout, col: '6', row: 2 };
                break;

            case "3x3":
                toReturn = { layout: layout, col: '4', row: 3 };
                break;

            case "2x3":
                toReturn = { layout: layout, col: '4', row: 2 };
                break;

            case "3x4":
                toReturn = { layout: layout, col: '3', row: 3 };
                break;
            default:
                toReturn = { layout: '2x3', col: '4', row: 2 };
                break;
        }
        return toReturn;
    }

    getCameraView(item, index) {
        let minHeight = window.innerHeight < 415
        const { camLayoutCal } = this.state;
        let rowValue = null;
        switch (camLayoutCal.row) {
            case 1:
                rowValue = "site-video-row-one";
                break;
            case 2:
                rowValue = "site-video-row-two";
                break;
            case 3:
                rowValue = "site-video-row-three";
                break;
        }
        camLayoutCal.col = minHeight ? 6 : camLayoutCal.col;
        rowValue = minHeight ? rowValue = "site-video-row-one" : rowValue;
        return (
            <Col key={index} sm={camLayoutCal.col} md={camLayoutCal.col} className={rowValue} >
                <VideoPlayer hiddenController={true} onAction={this.onActionVideo} isStretchable={true} layout={camLayoutCal} config={item} isBlank={item.isBlank} url={null} videoIndex={index} />
            </ Col>
        )
    }

    componentWillReceiveProps(nextProps) {
        if ((nextProps['getStoreId'] && nextProps['getStoreId'] !== this.props['getStoreId'])) {
            const { data, isFetching } = nextProps['getStoreId'];
            if (!isFetching) {
                if (data && data.length && data[0]._id) {
                    this.props.dispatch(getStoreCameras.request({ stores: [data[0]._id] }));
                }
                else {
                    this.setState({ isLoadingDialog: !this.state.isLoadingDialog });
                }
            }
        }

        if ((nextProps['getStoreCameras'] && nextProps['getStoreCameras'] !== this.props['getStoreCameras'])) {
            const { data, isFetching } = nextProps['getStoreCameras'];
            if (!isFetching) {
                if (data && data.data.length) {
                    this.setState({ camData: data.data });
                }
                this.setState({ isLoadingDialog: !this.state.isLoadingDialog });
            }
        }
    }

    componentWillMount() {
        let selectedStore = window.location.hash.substr(window.location.hash.lastIndexOf('/') + 1);
        selectedStore = window.decodeURI(selectedStore);
        if (selectedStore) {
            this.setState({ isLoadingDialog: true });
            this.props.dispatch(getStoreId.request({ storeName: selectedStore }));
        }
    }

    onSelect = (layoutView) => {
        let { camData } = this.state;
        let camLayoutCal = this.getLayoutStyle(layoutView);
        let storeCam = [];
        if (camData.length) {
            if (camData && Array.isArray(camData)) {
                camData.forEach(item => {
                    item.isBlank = false;
                    storeCam.push(item);
                });
            }
            this.setState({ camLayoutCal: camLayoutCal });
        }
    }

    exit() {
        this.props.dispatch(exitFullScreen(false));
    }

    onActionVideo(data) {
        this.setState({
            isFull: !data.isPlay
        });
    }

    fullScreenState() {
        this.setState({
            videoStyle: {
                width: '100%', height: '100%'
            }
        });
    }

    notAvailableCell(storeCam, layout) {
        let available = storeCam.length;
        let videoCount = 6;
        switch (layout) {
            case "1x1":
                videoCount = 1;
                break;
            case "2x2":
                videoCount = 4;
                break;
            case "3x3":
                videoCount = 9;
                break;
            case "2x3":
                videoCount = 6;
                break;
            case "3x4":
                videoCount = 12;
                break;
        }
        if (available == 0) return videoCount;
        let notAvailable = available % videoCount;
        return notAvailable == 0 ? notAvailable : (videoCount - notAvailable);
    }

    getScreenLayout() {
        let { onSelect } = this;
        let { camData, camLayoutCal } = this.state;
        if (camData.length) {
            var storeCam = [];
            if (camData && Array.isArray(camData)) {
                camData.forEach(function (item, index) {
                    storeCam.push(item);
                });
            }
            let notAvailableCell = this.notAvailableCell(storeCam, camLayoutCal.layout);
            if (notAvailableCell > 0) {
                for (let index = 0; index < notAvailableCell; index++) {
                    storeCam.push({ isBlank: true });
                }
            }
        }
        return (
            <Col xs={12} sm={12} md={12} className="content">
                <Card className="site-video-div">
                    <CardBody className="site-video-div">
                        <Row className="layout-hide">
                            <Col>
                                <ul className="full-screen-button">
                                    <li>
                                        <Navbar color="light" light expand="md">
                                            <ul className="nav video-control-wrapper" >
                                                {
                                                    <React.Fragment>
                                                        <li className="nav-item">
                                                            <div className="site-layout-style">Layout:</div>
                                                        </li>
                                                        <li title="1x1" className="nav-item layout-icon" onClick={() => onSelect("1x1")}>
                                                            <div className="site-video-layout cursor"><i className="fa fa-square fa-2x" aria-hidden="true"></i></div>
                                                            <div className="headerDivider"></div>
                                                        </li>
                                                        <li title="2x2" className="nav-item layout-icon" onClick={() => onSelect("2x2")} >
                                                            <div className="site-video-layout cursor"><i className="fa fa-th-large fa-2x" aria-hidden="true"></i> </div>
                                                            <div className="headerDivider"></div>
                                                        </li>
                                                        <li title="2x3" className="nav-item" onClick={() => onSelect("2x3")}>
                                                            <div className="site-video-layout-last cursor">
                                                                <img src={siteVideoIcon} />
                                                            </div>
                                                            <div className="headerDivider"></div>
                                                        </li>
                                                        <li title="3x3" className="nav-item layout-icon" onClick={() => onSelect("3x3")} >
                                                            <div className="site-video-layout cursor"> <i className="fa fa-th fa-2x" aria-hidden="true"></i> </div>
                                                            <div className="headerDivider"></div>
                                                        </li>
                                                        <li title="3x4" className="nav-item" onClick={() => onSelect("3x4")}>
                                                            <div className="site-video-layout-last cursor">
                                                                <img src={icons3x4} />
                                                            </div>
                                                        </li>
                                                    </React.Fragment>}
                                            </ul>
                                        </Navbar>
                                    </li>
                                    <li></li>
                                </ul>
                            </Col>
                        </Row>
                        {
                            <Row className={'site-video site-video-padding card-body cam-layout-body'}>
                                {
                                    storeCam && storeCam.length > 0 ? storeCam.map(this.getCameraView, this) : <p className="noCameraText"><h1>No Site Camera found !</h1></p>
                                }
                            </Row>
                        }
                    </CardBody>
                </Card>
            </Col>
        )
    }

    render() {
        const { isFull, isLoadingDialog } = this.state;
        return (
            <div>
                <div>
                    <LoadingDialog isOpen={isLoadingDialog} />
                    <Row className="site-video-div live-video-screen">
                        {isFull ? <div className='video-fullscreen-modal'>{this.getScreenLayout()}</div> : this.getScreenLayout()}
                    </Row>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        exitFullScreen: state.exitFullScreen,
        getStoreCameras: state.getStoreCameras,
        getStoreId: state.getStoreId
    };
}

var CamerasModule = connect(mapStateToProps)(Cameras);
export default CamerasModule;