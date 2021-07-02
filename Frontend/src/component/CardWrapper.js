import React, { Component } from 'react';
import {
	Card,
	CardBody,
	CardHeader,
	CardFooter,
	CardSubtitle,
	CardTitle,
	Col,
	Badge,
	Row
} from 'reactstrap';
import utils from '../Util/Util';

class CardWrapper extends Component {
	constructor(props) {
		super(props)

		this.state = {

		}
		console.log(props);
	}
	componentDidUpdate() {
		//	console.log(this.props);
	}

	render() {
		const { children, title, subTitle, footer, xs, sm, lg, className, topRightItem, topRightCount, onClick, role } = this.props;
		let mdValue = utils.isIpad ? 12 : 6;
		return (
			<Col xs={xs} sm={sm} lg={lg} className="fullHeight">
				<Card className={className + "site-video-div"}>
					{
						(title || subTitle) &&
						<CardHeader>
							<Row>
								<Col xs={6} md={mdValue}>
									{subTitle && <CardTitle>{subTitle}</CardTitle>}
								</Col>
								<Col sm={6} md={mdValue}>
									{title && <CardTitle>{title}</CardTitle>}
								</Col>
								{topRightItem && <Col sm={6} md={mdValue}>
									<div className="card-header-actions">
										<i className="cui-options"></i>
									</div>
								</Col>}
								{topRightCount && <Col xs={6} md={mdValue} className="cardwrapper-col" >
									<div className="card-header-actions" onClick={typeof onClick == "function" && onClick} >
										<h3 className="cursor"><Badge pill color="primary" className="float-right">{topRightCount}</Badge></h3>
									</div>
								</Col>}
							</Row>
						</CardHeader>
					}
					<CardBody className="site-video-div">
						{children}
					</CardBody>
					<CardFooter>{footer}</CardFooter>
				</Card>
			</Col>
		);
	}
}

CardWrapper.defaultProps = {
	title: null
}

export default CardWrapper;

