import React, { Fragment, PureComponent } from 'react';
import { Col, Row, Container } from 'reactstrap';
import 'video-react/dist/video-react.css';
import moment from 'moment';
import Util from '../Util/Util';
import { connect } from 'react-redux'
import utils from '../Util/Util';

class PlaybackReceipt extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            event: null,
            eventDetail: null
        }
        this.timeInterval = null;
    }

    render() {
        let { data } = this.props;
        let event = data.invoice;
        let eventDetail = data.eventDetail;
        if (!event) {
            return null;
        }
        return (
            <div className={'receipt-view'} style={{ opacity: '0.8' }}>
                <Container>
                    <Row sm={12} md={12} lg={12}>
                        <Col sm={12} md={12} lg={12} className="text-center"><div className="whiteReceipt">Register: {event.Register} </div></Col>
                    </Row>
                    <Row sm={12} md={12} lg={12}>
                        <div sm={12} md={12} lg={12} className="text-center"> <div className="whiteReceipt">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div></div>
                    </Row>
                    <Row sm={12} md={12} lg={12} style={{ marginTop: '0.4em' }}>
                        {/* <Col sm={5} md={5} lg={5} className='pull-left'><h6>Date:</h6></Col> */}
                        <Col sm={12} md={12} lg={12} className='text-center'><div className='whiteReceipt'>{event.StoreId && event.StoreId.timeZone ? moment(event.EventTime).utcOffset(event.StoreId.timeZone).format(utils.dateTimeFormatAmPmPOS) : moment(event.EventTime).format(Util.dateTimeFormat)}</div></Col>
                    </Row>
                    <Row sm={12} md={12} lg={12}>
                        <div sm={12} md={12} lg={12} className="text-center"> <div className="whiteReceipt">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div></div>
                    </Row>
                    <Row sm={12} md={12} lg={12}>
                        <Col sm={5} md={5} lg={5} className='pull-left'><div className='whiteReceipt'>Cashier:</div></Col>
                        <Col sm={6} md={6} lg={6} className='pull-right'><div className='whiteReceipt'>{event.OperatorName}</div></Col>
                    </Row>
                    <Row sm={12} md={12} lg={12}>
                        <Col sm={5} md={5} lg={5} className='pull-left'><div className='whiteReceipt'>Tran Seq No:</div></Col>
                        <Col sm={6} md={6} lg={6} className='pull-right'><div className='whiteReceipt'>{event.InvoiceId}</div></Col>
                    </Row>
                    <div>
                        {eventDetail && Object.keys(eventDetail).length > 0 && eventDetail.map((value, index) => {
                            return (
                                <Fragment key={index}>
                                    <Row sm={12} md={12} lg={12}>
                                        <Col sm={5} md={5} lg={5} className='pull-left'><div className='whiteReceipt'>{value.Quantity}</div></Col>
                                        <Col sm={6} md={6} lg={6} className='pull-right'><div className='whiteReceipt'>{value.Name} ${value.Price ? value.Price.toFixed(2) : '0.00'}</div></Col>
                                    </Row>
                                </Fragment>
                            )
                        })}
                        <Fragment>
                            <Row sm={12} md={12} lg={12}>
                                <Col sm={5} md={5} lg={5} className='pull-left'><div className='whiteReceipt'><b>Sub. Total: </b></div></Col>
                                <Col sm={6} md={6} lg={6} className='pull-right'><div className='whiteReceipt'>${event.SubTotal ? event.SubTotal.toFixed(2) : '0.00'}</div></Col>
                            </Row>
                            <Row sm={12} md={12} lg={12}>
                                <Col sm={5} md={5} lg={5} className='pull-left'><div className='whiteReceipt'><b>Tax: </b></div></Col>
                                <Col sm={6} md={6} lg={6} className='pull-right'><div className='whiteReceipt'>${event.Tax ? event.Tax.toFixed(2) : '0.00'}</div></Col>
                            </Row>
                            <Row sm={12} md={12} lg={12}>
                                <Col sm={5} md={5} lg={5} className='pull-left'><div className='whiteReceipt'><b>Total: </b></div></Col>
                                <Col sm={6} md={6} lg={6} className='pull-right'><div className='whiteReceipt'>${event.Total ? event.Total.toFixed(2) : '0.00'}</div></Col>
                            </Row>
                        </Fragment>
                    </div>
                </Container>
            </div >
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        getLastTransation: state.getLastTransation
    };
}

var PlaybackReceiptModule = connect(mapStateToProps)(PlaybackReceipt);
export default PlaybackReceiptModule;