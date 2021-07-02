import React, { Fragment } from 'react';
import { Col, Row, Table } from 'reactstrap';
import 'video-react/dist/video-react.css';
import moment from 'moment';
import Util from '../Util/Util';

const Template = (props) => {
	const { isBlank, children, rowClass } = props;
	return (
		isBlank ? <>{children}</> : <Row className={rowClass}>{children}</Row>
	)
}

const Receipt = (props) => {
	let data = props.data;
	let event = data.event;
	let eventDetail = data.eventDetail;
	let isAppearLiveVideo = props.isAppearLiveVideo || false;
	return (
		<div className={'receipt-view-video ' + (isAppearLiveVideo ? 'overlayLiveVideo' : '')}>
			<Template isBlank={isAppearLiveVideo}>
				<Col md={12} >
					<Row className="container-ie">
						<Col md={4}><h6 className="receiptdata receipt-info">Register: {event.Register} </h6></Col>
						<Col md={4} className="text-left">
							<h6 className="receiptdata receipt-info">{moment(event.EventTime).format(Util.dateTimeFormatAmPm)}</h6>
							<h6 className="receiptdata receipt-info">Order Number: {event.InvoiceId}</h6>
						</Col>
						<Col md={4}>
							<h6 className="text-right card-text-left receiptdata receipt-info">Cashier: {event.OperatorName} </h6>
							<h6 className="text-right card-text-left receiptdata receipt-info">Tran Seq No: {event.InvoiceId}</h6>
						</Col>
					</Row>
					<div className={'dashed-border'}></div>
				</Col>
			</Template>

			<Template isBlank={isAppearLiveVideo} rowClass="container-ie">
				<Col md={12} xs={12} className="receipt-data">
					<Table borderless size="sm">
						<thead>
							<tr>
								<th className="receiptdata">QTY </th>
								<th className="receiptdata">ITEM</th>
								<th className="receiptdata">AMT</th>
							</tr>
						</thead>
						<tbody>
							{/* {
								verifiedTransaction && verifiedTransaction.length > 0 &&
								verifiedTransaction.map((verifiedTransaction, index) => {
									return (<tr key={index}>
										<td>{verifiedTransaction.VerificationType}</td>
										<td></td>
										<td>Age: {verifiedTransaction.VerifiedAge}</td>
									</tr>)
								})
							}
							*/}
							{
								eventDetail && eventDetail.map((value, index) => {
									return (<Fragment key={index} >
										<tr key={index}>
											<td className="receiptdata">{value.Qty}</td>
											<td className="receiptdata">{value.Name}</td>
											<td className={'receiptdata'}>${value.Price ? Number(value.Price).toFixed(2) : '0.00'}</td>
										</tr>
									</Fragment>)
								})
							}
							{
								<tr key={'SubTotal'}>
									<td className="receipt-total receiptdata"> <b>Sub. Total:</b></td>
									<td></td>
									<td className={'receiptdata'}>${event.SubTotal ? Number(event.SubTotal).toFixed(2) : '0.00'}</td>
								</tr>
							}
							{
								<tr key={'Tax'}>
									<td className="receipt-total receiptdata"><b>Tax:</b></td>
									<td></td>
									<td className={'receiptdata'}>${event.Tax ? Number(event.Tax).toFixed(2) : '0.00'}</td>
								</tr>
							}
							{
								<tr key={'Total'}>
									<td className="receiptdata receipt-total"><b>Total:</b></td>
									<td></td>
									<td className={'receiptdata text-bold'}>${event.Total ? Number(event.Total).toFixed(2) : '0.00'}</td>
								</tr>
							}
							{
								event.Payment && event.Payment.length > 0 &&
								event.Payment.map((pay, index) => {
									return (
										pay.InvPaid && pay.PayMethod ? <tr key={0}>
											<td className={'receiptdata'}><b>{pay.PayMethod}:</b></td>
											<td></td>
											<td className={'receiptdata text-bold'}>${pay.InvPaid ? Number(pay.InvPaid).toFixed(2) : '0.00'}</td>
										</tr> : null
									)
								})
							}
						</tbody>
					</Table>
				</Col>
			</Template>
		</div>
	)
}

export default Receipt;