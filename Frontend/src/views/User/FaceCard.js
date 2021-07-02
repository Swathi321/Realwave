import React, { Component } from 'react';
import { Card, CardBody, CardFooter, Col, CardImg, Row } from 'reactstrap';
import moment from 'moment';
import utils from '../../Util/Util';
class FaceCard extends Component {
    onCardSelect() {
        const { onClick } = this.props;
        if (onClick) onClick();
    }
    getDateTime(item) {
        if (!item) {
            return null
        }
        var date = "";
        date = item.substr(item.lastIndexOf("_") + 1);
        date = date.substr(0, date.lastIndexOf("."));
        return moment(Number(date)).format(utils.dateTimeFormatAmPm);
    }

    render() {
        const { xs, sm, lg, className, imagePath, item } = this.props;
        return (
            <Col onClick={() => this.onCardSelect()} xs={xs} sm={sm} lg={lg}>
                <Card className={className}>
                    <div className="thumbnailBig" style={{ backgroundImage: `url(${imagePath})` }}> </div>
                    <CardBody className="cameracard-cardbody">
                    </CardBody>
                    <CardFooter>
                        {
                            item.Id &&
                            <Row>
                                <Col md={12} className="event-feed-items">
                                    <strong>Id:</strong> {item.Id}
                                </Col>
                            </Row>
                        }
                        {
                            item.Name &&
                            <Row>
                                <Col md={12} className="event-feed-items">
                                    <strong>Name:</strong> {item.Name}
                                </Col>
                            </Row>
                        }
                        {
                            item.Face &&
                            <Row>
                                <Col md={12} className="event-feed-items">
                                    <strong>Date:</strong> {this.getDateTime(item.Face)}
                                </Col>
                            </Row>
                        }
                    </CardFooter>
                </Card>
            </Col>
        );
    }
}

FaceCard.defaultProps = {
    title: null,
    subTitle: null
}

export default FaceCard;