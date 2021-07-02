import React, { PureComponent } from 'react';
import {
  Col,
  FormGroup,
  Input,
  Collapse,
  CardBody,
	Card,
	CardHeader
} from "reactstrap";
import utils from "./../../Util/Util";
import { Radio } from "antd";
import Select from "react-select";
import "react-tagsinput/react-tagsinput.css";
import "../User/styles.scss";
import "./store.scss";
import { cloneDeep, clone} from 'lodash';

export class BasicInfoCollapse extends PureComponent {
  constructor(props) {
		super(props);
		this.state = {
			collapseOpen: props.item && clone(props.item.status),
			isAntMedia: clone(props.isAntMedia),
			isRecordedAntMedia: clone(props.isRecordedAntMedia),
			mediaServerUrl: clone(props.mediaServerUrl),
			InboundErr1: clone(props.InboundErr1),
			InboundErr2: clone(props.InboundErr2),
			isRecordedMediaSameAsLive: clone(props.isRecordedMediaSameAsLive),
			MediaServerErr1: clone(props.MediaServerErr1),
			MediaServerErr2: clone(props.MediaServerErr2),
			mediaServerInboundPort:clone(props.mediaServerInboundPort),
			mediaServerOutboundPort: clone(props.mediaServerOutboundPort),
			OutboundErr1: clone(props.OutboundErr1),
			OutboundErr2: clone(props.OutboundErr2),
			recMediaServerInboundPort: clone(props.recMediaServerInboundPort),
			recMediaServerOutboundPort: clone(props.recMediaServerOutboundPort),
      recMediaServerUrl: clone(props.recMediaServerUrl),
      transportTypeValue1: clone(props.transportTypeValue1),
      transportTypeValue2: clone(props.transportTypeValue2),
			TransportErr1: clone(props.TransportErr1),
			TransportErr2: clone(props.TransportErr2),
		}
	}

	componentDidUpdate(prevProps, prevState) {
		const {
			isAntMedia,
			isRecordedAntMedia,
			isRecordedMediaSameAsLive,
			item,
			InboundErr1,
			InboundErr2,
			MediaServerErr1,
			MediaServerErr2,
			mediaServerUrl,
			OutboundErr1,
			OutboundErr2,
			recMediaServerUrl,
			recMediaServerInboundPort,
			recMediaServerOutboundPort,
			mediaServerInboundPort,
			mediaServerOutboundPort,
			transportTypeValue1,
			transportTypeValue2,
			TransportErr1,
			TransportErr2,
		} = this.props;
		
		if (isAntMedia && isAntMedia !== prevProps.isAntMedia) {
			this.setState({
				isAntMedia: isAntMedia
			})
		}
		if (item && item.status && item.status !== prevProps.item.status) {
			this.setState({
				collapseOpen: item.status
			})
		}
		if (isRecordedAntMedia && isRecordedAntMedia !== prevProps.isRecordedAntMedia) {
			this.setState({
				isRecordedAntMedia: isRecordedAntMedia
			})
		}
		if (InboundErr1 && InboundErr1 !== prevProps.InboundErr1) {
			this.setState({
				InboundErr1: InboundErr1
			})
		}
		if (InboundErr2 && InboundErr2 !== prevProps.InboundErr2) {
			this.setState({
				InboundErr2: InboundErr2
			})
		}
		if (MediaServerErr1 && MediaServerErr1 !== prevProps.MediaServerErr1) {
			this.setState({
				MediaServerErr1: MediaServerErr1
			})
		}
		if (MediaServerErr2 && MediaServerErr2 !== prevProps.MediaServerErr2) {
			this.setState({
				MediaServerErr2: MediaServerErr2
			})
		}
		if (OutboundErr1 && OutboundErr1 !== prevProps.OutboundErr1) {
			this.setState({
				OutboundErr1: OutboundErr1
			})
		}
		if (OutboundErr2 && OutboundErr2 !== prevProps.OutboundErr2) {
			this.setState({
				OutboundErr2: OutboundErr2
			})
		}
		if (isRecordedMediaSameAsLive && isRecordedMediaSameAsLive !== prevProps.isRecordedMediaSameAsLive) {
			this.setState({
				isRecordedMediaSameAsLive: isRecordedMediaSameAsLive
			})
		}
		if (mediaServerUrl && mediaServerUrl !== prevProps.mediaServerUrl) {
			this.setState({
				mediaServerUrl: mediaServerUrl
			})
		}
		if (recMediaServerInboundPort && recMediaServerInboundPort !== prevProps.recMediaServerInboundPort) {
			this.setState({
				recMediaServerInboundPort: recMediaServerInboundPort
			})
		}
		if (recMediaServerOutboundPort && recMediaServerOutboundPort !== prevProps.recMediaServerOutboundPort) {
			this.setState({
				recMediaServerOutboundPort: recMediaServerOutboundPort
			})
		}
		if (recMediaServerUrl && recMediaServerUrl !== prevProps.recMediaServerUrl) {
			this.setState({
				recMediaServerUrl: recMediaServerUrl
			})
		}
		if (mediaServerInboundPort && mediaServerInboundPort !== prevProps.mediaServerInboundPort) {
			this.setState({
				mediaServerInboundPort: mediaServerInboundPort
			})
		}
		if (mediaServerOutboundPort && mediaServerOutboundPort !== prevProps.mediaServerOutboundPort) {
			this.setState({
				mediaServerOutboundPort: mediaServerOutboundPort
			})
		}
		if (transportTypeValue1 && transportTypeValue1 !== prevProps.transportTypeValue1) {
			this.setState({
				transportTypeValue1: transportTypeValue1
			})
		}
		if (transportTypeValue2 && transportTypeValue2 !== prevProps.transportTypeValue2) {
			this.setState({
				transportTypeValue2: transportTypeValue2
			})
		}
		if (TransportErr1 && TransportErr1 !== prevProps.TransportErr1) {
			this.setState({
				TransportErr1: TransportErr1
			})
		}
		if (TransportErr2 && TransportErr2 !== prevProps.TransportErr2) {
			this.setState({
				TransportErr2: TransportErr2
			})
		}
	} 

	componentWillReceiveProps(nextProps) {
		const {
			isAntMedia,
			isRecordedAntMedia,
			isRecordedMediaSameAsLive,
			item,
			InboundErr1,
			InboundErr2,
			MediaServerErr1,
			MediaServerErr2,
			mediaServerUrl,
			OutboundErr1,
			OutboundErr2,
			recMediaServerUrl,
			recMediaServerInboundPort,
			recMediaServerOutboundPort,
			mediaServerInboundPort,
			mediaServerOutboundPort,
			transportTypeValue1,
			transportTypeValue2,
			TransportErr1,
			TransportErr2,
		} = nextProps;
		if (isAntMedia && isAntMedia !== this.state.isAntMedia) {
			this.setState({
				isAntMedia: isAntMedia
			})
		}
		if (item && item.status && item.status !== this.state.collapseOpen) {
			this.setState({
				collapseOpen: item.status
			})
		}
		if (isRecordedAntMedia && isRecordedAntMedia !== this.state.isRecordedAntMedia) {
			this.setState({
				isRecordedAntMedia: isRecordedAntMedia
			})
		}
		if (InboundErr1 && InboundErr1 !== this.state.InboundErr1) {
			this.setState({
				InboundErr1: InboundErr1
			})
		}
		if (InboundErr2 && InboundErr2 !== this.state.InboundErr2) {
			this.setState({
				InboundErr2: InboundErr2
			})
		}
		if (MediaServerErr1 && MediaServerErr1 !== this.state.MediaServerErr1) {
			this.setState({
				MediaServerErr1: MediaServerErr1
			})
		}
		if (MediaServerErr2 && MediaServerErr2 !== this.state.MediaServerErr2) {
			this.setState({
				MediaServerErr2: MediaServerErr2
			})
		}
		if (OutboundErr1 && OutboundErr1 !== this.state.OutboundErr1) {
			this.setState({
				OutboundErr1: OutboundErr1
			})
		}
		if (OutboundErr2 && OutboundErr2 !== this.state.OutboundErr2) {
			this.setState({
				OutboundErr2: OutboundErr2
			})
		}
		if (isRecordedMediaSameAsLive && isRecordedMediaSameAsLive !== this.state.isRecordedMediaSameAsLive) {
			this.setState({
				isRecordedMediaSameAsLive: isRecordedMediaSameAsLive
			})
		}
		if (mediaServerUrl && mediaServerUrl !== this.state.mediaServerUrl) {
			this.setState({
				mediaServerUrl: mediaServerUrl
			})
		}
		if (recMediaServerInboundPort && recMediaServerInboundPort !== this.state.recMediaServerInboundPort) {
			this.setState({
				recMediaServerInboundPort: recMediaServerInboundPort
			})
		}
		if (recMediaServerOutboundPort && recMediaServerOutboundPort !== this.state.recMediaServerOutboundPort) {
			this.setState({
				recMediaServerOutboundPort: recMediaServerOutboundPort
			})
		}
		if (recMediaServerUrl && recMediaServerUrl !== this.state.recMediaServerUrl) {
			this.setState({
				recMediaServerUrl: recMediaServerUrl
			})
		}
		if (mediaServerInboundPort && mediaServerInboundPort !== this.state.mediaServerInboundPort) {
			this.setState({
				mediaServerInboundPort: mediaServerInboundPort
			})
		}
		if (mediaServerOutboundPort && mediaServerOutboundPort !== this.state.mediaServerOutboundPort) {
			this.setState({
				mediaServerOutboundPort: mediaServerOutboundPort
			})
		}
		if (transportTypeValue1 && transportTypeValue1 !== this.state.transportTypeValue1) {
			this.setState({
				transportTypeValue1: transportTypeValue1
			})
		}
		if (transportTypeValue2 && transportTypeValue2 !== this.state.transportTypeValue2) {
			this.setState({
				transportTypeValue2: transportTypeValue2
			})
		}
		if (TransportErr1 && TransportErr1 !== this.state.TransportErr1) {
			this.setState({
				TransportErr1: TransportErr1
			})
		}
		if (TransportErr2 && TransportErr2 !== this.state.TransportErr2) {
			this.setState({
				TransportErr2: TransportErr2
			})
		}
	}

	copyLiveMedia = (e) => {

    let value = "";
    if (this.state.isRecordedMediaSameAsLive) {
      value = false;
    } else {
      value = true;
    }
    // 
		const eventCopy=cloneDeep(e)
    this.setState(
      {
        isRecordedMediaSameAsLive: value,
        TransportErr2: false,
        OutboundErr2: false,
        InboundErr2: false,
        MediaServerErr2: false
      },
      () => {
        // 
        if (this.state.isRecordedMediaSameAsLive) {
          this.setState({
            recMediaServerInboundPort: this.state.mediaServerInboundPort,
            recMediaServerOutboundPort: this.state.mediaServerOutboundPort,
            recMediaServerUrl: this.state.mediaServerUrl,
            isRecordedAntMedia:
              this.state.isAntMedia == "antMedia"
                ? "recAntMedia"
                : "recNodeMedia",
            transportTypeValue2: this.state.transportTypeValue1,
          });
        } else {
          this.setState({
            recMediaServerInboundPort: "",
            recMediaServerOutboundPort: "",
            recMediaServerUrl: "",
            // isRecordedAntMedia: "",
            transportTypeValue2: "",
						TransportErr2: true,
						OutboundErr2: true,
						InboundErr2: true,
						MediaServerErr2: true
          });
        }
				this.props.copyLiveMedia(eventCopy)
      }
    );
  };

	changeLiveMedia = (e) => {
		const eventCopy = cloneDeep(e);
    this.setState({ isAntMedia: e.target.value }, () => this.props.changeLiveMedia(eventCopy));
  };


	handleChange = (e, ErrorStateVar) => { 
		let name = e.target.name
		const eventCopy = cloneDeep(e);
		this.setState({ [name]: e.target.value }, () => this.props.handleChange(eventCopy, ErrorStateVar));
		if (
			name === "mediaServerOutboundPort" ||
      name === "mediaServerInboundPort" ||
      name === "mediaServerUrl" ||
      name === "recMediaServerUrl" ||
      name === "recMediaServerInboundPort" ||
      name === "recMediaServerOutboundPort"
		) {
				if (e.target.value.length == 0) {
					this.setState({ [ErrorStateVar]: "Required" });
				} else {
					this.setState({ [ErrorStateVar]: "" });
				}
			}
	}

	handleTranportChange1 = (value) => {
    let error = !value ? true : false;
    this.setState({ transportTypeValue1: value, TransportErr1: error }, () => this.props.handleTranportChange1(value));
  };

  handleTranportChange2 = (value) => {
    let error = !value ? true : false;
    this.setState({ transportTypeValue2: value, TransportErr2: error }, () => this.props.handleTranportChange2(value));
  };

	changeRecordedVideMedia = (e) => {
		const eventCopy = cloneDeep(e);
    this.setState({
      isRecordedAntMedia: e.target.value,
    }, () => this.props.changeRecordedVideMedia(eventCopy));
  };

	handleCollapse = (id) => {
		const {collapseOpen} = this.state;
		const e = cloneDeep(id)
		this.setState({collapseOpen: !collapseOpen}, () => this.props.toggleAcc(e))
	} 

	render() {
		const {
			item,
			colourStyles,
			transportType,
		} = this.props;
		const {
			collapseOpen,
			InboundErr1,
			InboundErr2,
			isAntMedia,
			isRecordedAntMedia,
			isRecordedMediaSameAsLive,
			mediaServerUrl,
			MediaServerErr1,
			MediaServerErr2,
			mediaServerInboundPort,
			mediaServerOutboundPort,
			OutboundErr1,
			OutboundErr2,
			recMediaServerInboundPort,
			recMediaServerOutboundPort,
			recMediaServerUrl,
			TransportErr1,
			TransportErr2,
      transportTypeValue1,
      transportTypeValue2,
		} = this.state;

		return (
			<Card style={{ marginBottom: "1rem", width: "", cursor: 'pointer' }} key={item.id} className="ml-auto mr-auto" >
				<CardHeader onClick={() => this.handleCollapse(item.id)} className="p-2"> {}
					{item.siteName}
					{collapseOpen ? (
						<i className="fa fa-angle-up floatRight" />
					) : (
						<i className="fa fa-angle-down floatRight" />
					)}
				</CardHeader>
				<Collapse isOpen={collapseOpen} ref={this.media_server} className="media_server">
					<CardBody>
						<form autoComplete="off" >
							<div>
								<div className="row pr-1 site-tab-holder">
									<div className="col-lg-6 ml-3">
										Live View Media Server <br />
										<Radio.Group
											onChange={(e) => this.changeLiveMedia(e)}
											value={isAntMedia}
										>
											<Radio value="antMedia" style={{ color: "white" }}>Ant Media</Radio>
											<Radio value="nodeMedia" style={{ color: "white" }}>Node Media</Radio>
										</Radio.Group>
									</div>
								</div>
								<br />

								<div className='row pl-1 mb-3 pr-1 site-tab-holder'>
									<Col sm={6} >
										<Input
											id="mediaServerUrl"
											type="text"
											className="form-control text-form"
											name="mediaServerUrl"
											value={mediaServerUrl}
											onChange={(e) => this.handleChange(e, 'MediaServerErr1')}
											required
										/>
										<label className="text-label ml-3"> Media Server URL <span className={'text-danger'}>*</span></label>
										{MediaServerErr1 && <div className="input-feedback">Required</div>}
									</Col>

									<div className='col-lg-3'>
										<Input
											id="mediaServerInboundPort"
											type="number"
											min={0}
											className="form-control text-form"
											name="mediaServerInboundPort"
											value={mediaServerInboundPort}
											onChange={(e) => this.handleChange(e, 'InboundErr1')}
											required
										/>
										<label className="text-label ml-3">
											Inbound Port<span className={'text-danger'}>*</span>
										</label>
										{InboundErr1 && <div className="input-feedback">Required</div>}
									</div>
									<div className='col-lg-3'>
										<Input
											id="mediaServerOutboundPort"
											name="mediaServerOutboundPort"
											type="number"
											min={0}
											className="form-control text-form"
											value={mediaServerOutboundPort}
											onChange={(e) => this.handleChange(e, 'OutboundErr1')}
											required
										/>
										<label className="text-label ml-3" >
											Outbound Port<span className={'text-danger'}>*</span>
										</label>
										{OutboundErr1 && <div className="input-feedback">Required</div>}
									</div>
								</div>
								<div className='row site-tab-holder'>
									<div className='col-lg-6'>
										<Col sm={12} className="text-field">
											<Select
												id="clientId"
												isClearable={true}
												value={transportTypeValue1}
												// placeholder="Transport Type"
												onChange={this.handleTranportChange1}
												options={transportType}
												styles={colourStyles}
											/>
											<label class="fixed-label" >
												Transport Type<span className={'text-danger'}>*</span>
											</label>
											{TransportErr1 && <div className="input-feedback">Required</div>}
										</Col>
									</div>
								</div>
							</div>

							<div>
								<div className='col-lg-6' style={{ fontSize: "16px" }}>
									Recorded Video Media Server&nbsp;
									<input
										type="checkbox"
										value={isRecordedMediaSameAsLive}
										checked={isRecordedMediaSameAsLive}
										onClick={() => this.copyLiveMedia()}
									/>&nbsp;
									<span>Same as Live View Media Server</span>
									<br />
									<Radio.Group
										onChange={(e) => this.changeRecordedVideMedia(e)}
										value={isRecordedAntMedia}
									>
										<Radio value="recAntMedia" style={{ color: "white" }}>Ant Media</Radio>
										<Radio value="recNodeMedia" style={{ color: "white" }}>Node Media</Radio>
									</Radio.Group>
								</div>
								<br />
								<div className='row pl-1 mb-3 pr-1 site-tab-holder'>
									{/* <div className='col-lg-6'> */}
									{/* <FormGroup col > */}
									<Col sm={6} >
										<Input
											id="recMediaServerUrl"
											type="text"
											className="form-control text-form"
											name="recMediaServerUrl"
											value={recMediaServerUrl}
											onChange={(e) => this.handleChange(e, 'MediaServerErr2')}
											required
										/>
										<label className="text-label ml-3">
											Media Server URL<span className={'text-danger'}>*</span>
										</label>
										{MediaServerErr2 && <div className="input-feedback">Required</div>}
									</Col>

									<div className='col-lg-3'>
										<Input
											id="recMediaServerInboundPort"
											type="number"
											min={0}
											className="form-control text-form"
											name="recMediaServerInboundPort"
											value={recMediaServerInboundPort}
											onChange={(e) => this.handleChange(e, 'InboundErr2')}
											required
										/>
										<label className="text-label ml-3" >
											Inbound Port<span className={'text-danger'}>*</span>
										</label>
										{InboundErr2 && <div className="input-feedback">Required</div>}
									</div>
									<div className='col-lg-3'>
										<Input
											id="recMediaServerOutboundPort"
											name="recMediaServerOutboundPort"
											type="number"
											min={0}
											className="form-control text-form"
											value={recMediaServerOutboundPort}
											onChange={(e) => this.handleChange(e, 'OutboundErr2')}
											required
										/>
										<label className="text-label ml-3" >
											Outbound Port<span className={'text-danger'}>*</span>
										</label>
										{OutboundErr2 && <div className="input-feedback">Required</div>}
									</div>
								</div>
								<div className='row site-tab-holder'>
									<div className='col-lg-6'>
										<Col sm={12} className="text-field">
											<Select
												id="clientId"
												isClearable={true}
												value={transportTypeValue2}
												onChange={this.handleTranportChange2}
												options={transportType}
												styles={colourStyles}
											/>
											<label class="fixed-label">
												Transport Type<span className={'text-danger'}>*</span>
											</label>
											{TransportErr2 && <div className="input-feedback">Required</div>}
										</Col>
									</div>
								</div>
							</div>
						</form>
					</CardBody>
				</Collapse>	
			</Card>
		)
	}
}
export default BasicInfoCollapse
