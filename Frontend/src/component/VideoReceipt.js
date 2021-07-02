import React, { Fragment, PureComponent, Component } from 'react';
import { Col, Row, Container } from 'reactstrap';
import 'video-react/dist/video-react.css';
import moment from 'moment';
import Util from '../Util/Util';
import io from 'socket.io-client';
import { getLastTransation } from './../redux/actions/httpRequest';
import { connect } from 'react-redux'

let functions = ["requestInterval"];

class VideoReceipt extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			event: null,
			eventDetail: null
		}
		this.timeInterval = null;
		this.onReceiptReceive = this.onReceiptReceive.bind(this);
		Util.bindContext(functions, this);
	}

	componentWillReceiveProps(nextProps) {
		if ((nextProps.getLastTransation && nextProps.getLastTransation !== this.props.getLastTransation)) {
			if (!nextProps.getLastTransation.isFetching) {
				let { data, isFetching, error } = nextProps.getLastTransation;
				if (!isFetching) {
					const { invoice, invoiceDetail } = data.data;
					this.setState({
						event: invoice,
						eventDetail: invoiceDetail
					});
				}
			}
		}
	}

	requestInterval() {
		const { config } = this.props;
		const camId = config._id, storeId = config.storeId._id;
		console.log(`Send request for new receipt at ${new Date()}`);
		this.props.dispatch(getLastTransation.request({ camId: camId, storeId: storeId }));
	}

	componentDidMount() {
		const { data } = this.props;
		if (data) {
			const { event, eventDetail } = data;
			this.setState({
				event: event,
				eventDetail: eventDetail
			})
			return;
		}
		// Get Last Receipt for Live Video only first time
		this.requestInterval();
	}

	componentWillMount() {
		const { config, forLiveVideo } = this.props;
		if (forLiveVideo) {
			const camId = config._id, storeId = config.storeId._id;
			let me = this;
			me.clientId = Util.guid();
			let socketUri = `${Util.serverUrl}?type=client&storeId=${storeId}&clientId=${me.clientId}`;
			me.socketClient = io(socketUri).connect();

			//Joining room from camId with subscribeReceiptPull connnection with Server Socket connection 
			me.socketClient.on('connect', function () {
				me.socketClient.emit('subscribeReceiptPull', camId);
			});
			// Receipt receive event from Socket to get latest POS transcation
			me.socketClient.on('receiptPOS', me.onReceiptReceive);
		}

	}

	onReceiptReceive = async (receiptData) => {
		if (receiptData) {
			this.setState({ event: receiptData.invoice, eventDetail: receiptData.invoiceDetail });
		}
	}

	componentWillUnmount() {
		const { camId, forLiveVideo } = this.props;
		if (camId && forLiveVideo) {
			//Leaving joined room from CamId
			this.socketClient.emit('unsubscribeReceiptPull', camId);
		}
	}

	render() {
		let { event, eventDetail } = this.state;
		if (!event) {
			return null;
		}
		return (
			<div className={'receipt-view'}>
				<Container>
					<Row sm={12} md={12} lg={12}>
						<Col sm={12} md={12} lg={12} className="text-center"><div className="whiteReceipt">Register: {event.Register} </div></Col>
					</Row>
					<Row sm={12} md={12} lg={12}>
						<div sm={12} md={12} lg={12} className="text-center"> <div className="whiteReceipt">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div></div>
					</Row>
					<Row sm={12} md={12} lg={12} style={{ marginTop: '0.4em' }}>
						{/* <Col sm={5} md={5} lg={5} className='pull-left'><h6>Date:</h6></Col> */}
						<Col sm={12} md={12} lg={12} className='text-center'><div className='whiteReceipt'>{moment(event.EventTime).format(Util.dateTimeFormat)}</div></Col>
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
			</div>
		)
	}
}

function mapStateToProps(state, ownProps) {
	return {
		getLastTransation: state.getLastTransation
	};
}

var VideoReceiptModule = connect(mapStateToProps)(VideoReceipt);
export default VideoReceiptModule;