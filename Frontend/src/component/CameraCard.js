import React, { PureComponent } from 'react';
import {
    Card,
    CardBody,
    CardFooter,
    Col,
    CardImg,
    Row,
    Tooltip,
    CardHeader
} from 'reactstrap';
import dateUtil from './../Util/dateUtil';
import utils from '../Util/Util';
import cameraImage from './../assets/img/icons/camera-off.png';
import TooltipContent from './../component/ToolTip';
import Reactions from '../views/User/Reactions';
import consts from '../Util/consts';

class CameraCard extends PureComponent {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.state = {
            tooltipOpen: false
        };
    }

    toggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        });
    }

    onCardSelect() {
        const { onClick } = this.props;
        if (onClick) onClick();
    }

    getConfidenceLavel = (percentage) => {
        if (percentage >= utils.facialConfidenceLevel.low && percentage <= utils.facialConfidenceLevel.high) {
            return "Low";
        }
        if (percentage > utils.facialConfidenceLevel.high) {
            return "High";
        }
    }
    getUserNames = (userInfo) => {
        let concatenatedNames = '';
        if (userInfo && userInfo.length > 0) {
            userInfo.forEach(user => {
                if (user.Name && user.Name.trim().length > 0) {
                    concatenatedNames += user.Name + ", ";
                }
            });
            concatenatedNames = utils.trimEnd(concatenatedNames);
        }
        return concatenatedNames;
    }

    render() {
        const { transactionNumber, register, xs, sm, md, lg, className, imagePath, IsVideoAvailable, item, index, isFromDashboard, IsImageAvailable } = this.props;
        const { tooltipOpen } = this.state;
        let userExist = item.UserInfo;
        let percentage = item.EventType == consts.FaceEvent && userExist.length > 0 && Number(userExist[0].RecognizeScore).toFixed(2);
        let toolTipKey = "Tooltip" + (index + 1).toString();
        const { StoreId, CamId } = item;
        let camName, camFullName = '';
        if (StoreId) {
            let completeName = CamId ? StoreId.name + ' (' + CamId.name + ')' : StoreId ? StoreId.name : consts.NotAvailable;
            camName = utils.trunString(completeName, 17);
            camFullName = completeName;
        }
        let ios = utils.isIOS();
        let isPortait = ios && window.innerHeight > window.innerWidth;
        return (
            <Col xs={xs} sm={sm} md={md} lg={lg} className="pull-left">
                <Card className={className}>
                    <CardHeader className="cameracard-cardheader cameracardText textConvert">
                        <Row>
                            <Col md={9} xs={9} sm={9} className="event-feed-items card-title ellipsis fw-500">
                                <i className="fa icon2-camera-icon" />  {(item && item.CamId && item.CamId.name) || ''}
                            </Col>
                        </Row>
                    </CardHeader>
                    <div className="cardImage" onClick={() => this.onCardSelect()} style={{
                        backgroundImage: `url(${IsVideoAvailable ? imagePath : IsImageAvailable ? imagePath : require('../assets/img/na.png')})`
                    }}></div>
                    <CardBody className="cameracard-cardbody">
                    </CardBody>
                    <CardFooter className="cameracard-cardfooter">
                        <Row className="cameracardText cameraCardContentRow">
                            <Col xs={3} sm={3} md={2} className="event-feed-items">
                                <i className="fa icon2-events cameracardleftContent" aria-hidden="true" />
                            </Col>
                            <Col xs={9} sm={9} md={10} className="event-feed-items text-right cameracardRightContent ">
                                <span className="cameracardRightContent">{transactionNumber} {!IsVideoAvailable ? <img src={cameraImage} /> : <i className="fa fa-camera" />}</span>
                            </Col>
                        </Row>
                        <hr className="hrThickness" />
                        <Row className="cameracardText cameraCardContentRow">
                            <Col xs={3} sm={3} md={3} className="event-feed-items">
                                <i className="fa icon2-location-icon cameracardleftContent" aria-hidden="true" />
                            </Col>
                            <Col xs={9} sm={9} md={9} className="event-feed-items text-right">
                                <span className="cameracardRightContent" title={camFullName}>{camName}</span>
                            </Col>
                        </Row>
                        <hr className="hrThickness" />
                        <Row className="textConvert">
                            <Col sm={7} xs={7} md={7} className="event-feed-items">
                                <span className="cameracardleftContent">{utils.splitWordFromCapitalLater(item.Category) || consts.NotAvailable}</span>
                            </Col>
                            <Col sm={5} xs={5} md={5} className="text-right event-feed-items">
                                <span className="cameracardRightContent">{item.EventType == consts.FaceEvent ? (userExist && userExist.length > 0 ? this.getUserNames(userExist) : "") : register}</span>
                            </Col>
                        </Row>
                        <Row className="textConvert">
                            <Col sm={5} xs={5} md={ios && !isPortait ? 4 : 6} className={ios && "remove-padding-event-time" || ''}>
                                <span className="cameracardleftContentText">{consts.Time}</span>
                            </Col>
                            <Col sm={5} xs={5} md={ios && !isPortait ? 8 : 6} className="event-feed-items text-right">
                                <span className="cameracardRightContent">{item.StoreId && item.StoreId.timeZone ? utils.standardDate(item.StartTime, item, false, false) : dateUtil.standardDateTime(item.EventTime, utils.dateTimeFormat)}</span>
                            </Col>
                        </Row>
                        {!isFromDashboard ?
                            item.EventType == consts.FaceEvent &&
                            <Row className="textConvert">
                                <Col sm={5} xs={5} md={6} className="event-feed-items">
                                    <span className="cameracardleftContent">{userExist && userExist.length > 0 ? this.getUserNames(userExist) : ""}</span>
                                </Col>
                                <Col sm={5} xs={5} md={6} className="event-feed-items text-right">
                                    {userExist && userExist.length > 0 ?
                                        <div className="cameracardRightContent">
                                            <span className="recognizeScore">{percentage + '%'}</span>
                                            <span id={toolTipKey}><i className="fa fa-user-plus" /> </span>
                                            <span className={this.getConfidenceLavel(percentage) == "Low" ? "text-danger" : "text-success"}>{userExist ? this.getConfidenceLavel(percentage) : consts.NotAvailable}</span>
                                            <Tooltip placement="top" isOpen={tooltipOpen} autohide={false} toggle={this.toggle} target={toolTipKey}>
                                                <table>
                                                    <TooltipContent userInfo={userExist} />
                                                </table>
                                            </Tooltip>
                                        </div> :
                                        <div className="cameracardRightContent">
                                            <span className="recognizeScore">{consts.NotAvailable}</span>
                                            <span><i className="fa fa-user-times" /></span>
                                        </div>
                                    }
                                </Col>
                            </Row> : ''
                        }
                        {!isFromDashboard &&
                            <Row className="textConvert">
                                {item.EventType != consts.FaceEvent &&
                                    <Col sm={5} xs={5} md={7} className="event-feed-items">
                                        <span className="cameracardleftContent">{item.OperatorName ? item.OperatorName : consts.NotAvailable}</span>
                                    </Col>
                                }
                                {item.EventType != consts.FaceEvent &&
                                    <Col sm={5} xs={5} md={5} className="event-feed-items text-right">
                                        <span className="cameracardRightContent">{item.Total ? '$' + item.Total : consts.NotAvailable}</span>
                                    </Col>
                                }
                            </Row>
                        }
                        {!isFromDashboard &&
                            <Row className="cameracardleftContent">
                                <Reactions item={item} />
                            </Row>
                        }
                    </CardFooter>
                </Card>
            </Col>
        );
    }
}

CameraCard.defaultProps = {
    title: null,
    subTitle: null
}

export default CameraCard;
