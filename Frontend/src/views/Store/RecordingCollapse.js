import React, { PureComponent } from 'react';
import {
  Col,
	Row,
  FormGroup,
  Input,
	Progress,
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

const DriveProgressBar = (props) => {
  let { drives } = props;
  return (
    <Row className="driveLists">
      {drives.map((d, i) => {
        let drivePercentage = (
          (d.driveInfo.used * 100) /
          d.driveInfo.total
        ).toFixed(0);
        let processClass =
          0 < drivePercentage && drivePercentage < 60
            ? "success"
            : 60 < drivePercentage && drivePercentage < 90
              ? "warning"
              : 80 < drivePercentage && drivePercentage < 100
                ? "danger"
                : null;

        return (
          <>{(d.drivePath.length < 2 || d.drivePath.indexOf('mnt') > -1) && <Col sm={2}>
            {d.drivePath}
            <Progress color={processClass} value={drivePercentage}>
              {drivePercentage}%
            </Progress>
          </Col>}</>
        );
      })}
    </Row>
  );
};

export class BasicInfoCollapse extends PureComponent {
  constructor(props) {
		super(props);
		this.state = {
			addressRecErr: clone(props.addressRecErr),
			collapseOpen: props.item && clone(props.item.status),
			driveLists: clone(props.driveLists),
			engAddress: clone(props.engAddress),
			engineLivePort: clone(props.engineLivePort),
			enginePort: clone(props.enginePort),
			enginePlaybackPort: clone(props.enginePlaybackPort),
			engPassword: clone(props.engPassword),
			engUserName: clone(props.engUserName),
			livePortErr: clone(props.livePortErr),
			PassErr: clone(props.PassErr),
			PortErr: clone(props.PortErr),
			playPortErr: clone(props.playPortErr),
			radioRecoEngine: clone(props.radioRecoEngine),
			usernameErr: clone(props.usernameErr),
		}
	}

	componentDidUpdate(prevProps) {
		const {
			addressRecErr,
			driveLists,
			engAddress,
			engineLivePort,
			enginePlaybackPort,
			enginePort,
			engPassword,
			engRecoLocation,
			engUserName,
			item,
			livePortErr,
			PassErr,
			PortErr,
			playPortErr,
			radioRecoEngine,
			usernameErr,
		} = this.props;

		if (addressRecErr && addressRecErr !== prevProps.addressRecErr) {
			this.setState({
				addressRecErr: addressRecErr
			})
		}
		if (driveLists && driveLists !== prevProps.driveLists) {
			this.setState({
				driveLists: driveLists
			})
		}
		if (engAddress && engAddress !== prevProps.engAddress) {
			this.setState({
				engAddress: engAddress
			})
		}
		if (engineLivePort && engineLivePort !== prevProps.engineLivePort) {
			this.setState({
				engineLivePort: engineLivePort
			})
		}
		if (engPassword && engPassword !== prevProps.engPassword) {
			this.setState({
				engPassword: engPassword
			})
		}
		if (engRecoLocation && engRecoLocation !== prevProps.engRecoLocation) {
			this.setState({
				engRecoLocation: engRecoLocation
			})
		}
		if (engUserName && engUserName !== prevProps.engUserName) {
			this.setState({
				engUserName: engUserName
			})
		}
		if (enginePlaybackPort && enginePlaybackPort !== prevProps.enginePlaybackPort) {
			this.setState({
				enginePlaybackPort: enginePlaybackPort
			})
		}
		if (enginePort && enginePort !== prevProps.enginePort) {
			this.setState({
				enginePort: enginePort
			})
		}
		if (item && item.status && item.status !== prevProps.item.status) {
			this.setState({
				collapseOpen: item.status
			})
		}
		if (livePortErr && livePortErr !== prevProps.livePortErr) {
			this.setState({
				livePortErr: livePortErr
			})
		}
		if (PassErr && PassErr !== prevProps.PassErr) {
			this.setState({
				PassErr: PassErr
			})
		}
		if (PortErr && PortErr !== prevProps.PortErr) {
			this.setState({
				PortErr: PortErr
			})
		}
		if (playPortErr && playPortErr !== prevProps.playPortErr) {
			this.setState({
				playPortErr: playPortErr
			})
		}
		if (radioRecoEngine && radioRecoEngine !== prevProps.radioRecoEngine) {
			this.setState({
				radioRecoEngine: radioRecoEngine
			})
		}
		if (usernameErr && usernameErr !== prevProps.usernameErr) {
			this.setState({
				usernameErr: usernameErr
			})
		}
	}

	componentWillReceiveProps(nextProps) {
		const {
			addressRecErr,
			driveLists,
			engAddress,
			engineLivePort,
			enginePlaybackPort,
			enginePort,
			engPassword,
			engRecoLocation,
			engUserName,
			item,
			livePortErr,
			PassErr,
			PortErr,
			playPortErr,
			radioRecoEngine,
			usernameErr,
		} = nextProps;

		if (addressRecErr && addressRecErr !== this.state.addressRecErr) {
			this.setState({
				addressRecErr: addressRecErr
			})
		}
		if (driveLists && driveLists !== this.state.driveLists) {
			this.setState({
				driveLists: driveLists
			})
		}
		if (engAddress && engAddress !== this.state.engAddress) {
			this.setState({
				engAddress: engAddress
			})
		}
		if (engineLivePort && engineLivePort !== this.state.engineLivePort) {
			this.setState({
				engineLivePort: engineLivePort
			})
		}
		if (engPassword && engPassword !== this.state.engPassword) {
			this.setState({
				engPassword: engPassword
			})
		}
		if (engRecoLocation && engRecoLocation !== this.state.engRecoLocation) {
			this.setState({
				engRecoLocation: engRecoLocation
			})
		}
		if (engUserName && engUserName !== this.state.engUserName) {
			this.setState({
				engUserName: engUserName
			})
		}
		if (enginePlaybackPort && enginePlaybackPort !== this.state.enginePlaybackPort) {
			this.setState({
				enginePlaybackPort: enginePlaybackPort
			})
		}
		if (enginePort && enginePort !== this.state.enginePort) {
			this.setState({
				enginePort: enginePort
			})
		}
		if (item && item.status && item.status !== this.state.collapseOpen) {
			this.setState({
				collapseOpen: item.status
			})
		}
		if (livePortErr && livePortErr !== this.state.livePortErr) {
			this.setState({
				livePortErr: livePortErr
			})
		}
		if (PassErr && PassErr !== this.state.PassErr) {
			this.setState({
				PassErr: PassErr
			})
		}
		if (PortErr && PortErr !== this.state.PortErr) {
			this.setState({
				PortErr: PortErr
			})
		}
		if (playPortErr && playPortErr !== this.state.playPortErr) {
			this.setState({
				playPortErr: playPortErr
			})
		}
		if (radioRecoEngine && radioRecoEngine !== this.state.radioRecoEngine) {
			this.setState({
				radioRecoEngine: radioRecoEngine
			})
		}
		if (usernameErr && usernameErr !== this.state.usernameErr) {
			this.setState({
				usernameErr: usernameErr
			})
		}
	}

	handleChange = (e, ErrorStateVar) => { 
		let name = e.target.name
		const eventCopy = {...e};
		this.setState({ [name]: e.target.value }, () => this.props.handleChange(eventCopy, ErrorStateVar));
		if (
			name === "enginePlaybackPort" ||
      name === "engineLivePort" ||
      name === "enginePort" ||
      name === "engAddress" ||
      name === "engUserName" ||
      name === "engPassword"
		) {
				if (e.target.value.length == 0) {
					this.setState({ [ErrorStateVar]: "Required" });
				} else {
					this.setState({ [ErrorStateVar]: "" });
				}
			}
	}

	changeRecordEngine = (e) => {
		const eventCopy = {...e};
		this.setState({
			radioRecoEngine: e.target.value,
			playPortErr: false, 
			livePortErr: false,
			usernameErr: false,
			PortErr: false,
			addressRecErr: false,
			PassErr: false,
		}, () => this.props.changeRecordEngine(eventCopy));
	};

	handleCollapse = (id) => {
		const {collapseOpen} = this.state;
		const e = cloneDeep(id)
		this.setState({collapseOpen: !collapseOpen}, () => this.props.toggleAcc(e))
	} 

	render() {
		const {
			item,
		} = this.props;
		const {
			addressRecErr,
			collapseOpen,
			driveLists,
			engAddress,
			engineLivePort,
			enginePort,
			enginePlaybackPort,
			engPassword,
			engRecoLocation,
			engUserName,
			livePortErr,
			PassErr,
			PortErr,
			playPortErr,
			radioRecoEngine,
			usernameErr,
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
				<Collapse isOpen={collapseOpen} ref={this.recording_list} className="recording_list ">
					<CardBody>
						<div className="row site-tab-holder mb-3 pl-3">
							<div className="col-lg-4">
								Type of Recording Engine <br />
								<Radio.Group
									onChange={(e) => this.changeRecordEngine(e)}
									value={radioRecoEngine}
								>
									<Radio value="Rex" style={{ color: "white" }}>REX</Radio>
									<Radio disabled={true} value="Ganz" style={{ color: "white" }}>Ganz</Radio>
									<Radio value="NVR" style={{ color: "white" }}>IPC</Radio>
									<Radio value="Default" style={{ color: "white" }}>Custom</Radio>
								</Radio.Group>
							</div>
							<div className="col-lg-8">
								{radioRecoEngine === "Rex" && <DriveProgressBar drives={driveLists} />}
							</div>
							<div className="col-lg-6">
								Type of Recording Engine <br />
								<Radio.Group
									onChange={(e) => this.changeRecordEngine(e)}
									value={radioRecoEngine}
								>
									<Radio value="Rex" style={{ color: "white" }}>REX</Radio>
									<Radio disabled={true} value="Ganz" style={{ color: "white" }}>Ganz</Radio>
									<Radio value="NVR" style={{ color: "white" }}>IPC</Radio>
									<Radio value="Default" style={{ color: "white" }}>Custom</Radio>
								</Radio.Group>
							</div>
						</div>
						{radioRecoEngine != "Default" && (
							<div className="row site-tab-holder pr-1">
								<div className="col-lg-5">
									<FormGroup >
										<Col xs={12} className="text-field">
											<Input
												id="engAddress"
												type="text"
												className="form-control text-form"
												name="engAddress"
												value={engAddress}
												onChange={(e) => this.handleChange(e, 'addressRecErr')}
												required
											/>
											<label className="text-label mt-1">
												Address<span className={'text-danger'}>*</span>
											</label>
											{addressRecErr && <div className="input-feedback">Required</div>}
										</Col>
									</FormGroup>
								</div>
								<div className="col-lg-2">
									<FormGroup >
										<Col sm={12} className="text-field">
											<Input
												id="enginePort"
												type="number"
												min={0}
												className="form-control text-form"
												name="enginePort"
												value={enginePort}
												onChange={(e) => this.handleChange(e, 'PortErr')}
												required
											/>
											<label className="text-label mt-1">Port<span className={'text-danger'}>*</span></label>
											{PortErr && <div className="input-feedback">Required</div>}
										</Col>
									</FormGroup>
								</div>
								{ radioRecoEngine != "Rex" && radioRecoEngine == "NVR" && (
									<div className="col-lg-2">
										<FormGroup >
											<Col sm={12} className="text-field">
												<Input
													id="engineLivePort"
													name="engineLivePort"
													type="number"
													min={0}
													className="form-control text-form"
													value={engineLivePort}
													onChange={(e) => this.handleChange(e, 'livePortErr')}
													required
												/>
												<label className="text-label mt-1">
													Live Port<span className={'text-danger'}>*</span>
												</label>
												{livePortErr && <div className="input-feedback">Required</div>}
											</Col>
										</FormGroup>
									</div>
								)}
								{radioRecoEngine != "Rex" && radioRecoEngine == "NVR" && (
									<div className="col-lg-3">
										<FormGroup >
											<Col sm={12} className="text-field">
												<Input
													id="enginePlaybackPort"
													name="enginePlaybackPort"
													type="number"
													min={0}
													className="form-control text-form"
													value={enginePlaybackPort}
													onChange={(e) => this.handleChange(e, 'playPortErr')}
													required
												/>
												<label className="text-label mt-1">
													Playback Port<span className={'text-danger'}>*</span>
												</label>
												{playPortErr && <div className="input-feedback">Required</div>}
											</Col>
										</FormGroup>
									</div>
								)}
							</div>
						)}

						{radioRecoEngine != "Default" && (
							<div className="row site-tab-holder">
								<div className="col-lg-5">
									<FormGroup >
										<Col sm={12} className="text-field">
											<Input
												id="engUserName"
												name="engUserName"
												type="text"
												className="form-control text-form"
												value={engUserName}
												autoComplete="new-username"
												onChange={(e) => this.handleChange(e, 'usernameErr')}
												required
											/>
											<label className="text-label mt-1">
												User Name<span className={'text-danger'}>*</span>
											</label>
											{usernameErr && <div className="input-feedback">Required</div>}
										</Col>
									</FormGroup>
								</div>
								<div className="col-lg-5">
									<FormGroup >
										<Col sm={12} className="text-field">
											<Input
												id="engPassword"
												name="engPassword"
												type="password"
												className="form-control text-form"
												autoComplete="new-password"
												value={engPassword}
												onChange={(e) => this.handleChange(e, 'PassErr')}
												required
											/>
											<label className="text-label mt-1">
												Password<span className={'text-danger'}>*</span>
											</label>
											{PassErr && <div className="input-feedback">Required</div>}
										</Col>
									</FormGroup>
								</div>
							</div>
						)}

						{radioRecoEngine == "Default" && (
							<div className="row site-tab-holder">
								<div className="col-lg-5">
									<FormGroup >
										<Col sm={12} className="text-field">
											<Input
												id="engRecoLocation"
												name="engRecoLocation"
												type="text"
												className="form-control text-form"
												value={engRecoLocation}
												onChange={(e) => this.handleChange(e)}
												required
											/>
											<label className="text-label mt-1">
												Recording Location
											</label>
										</Col>
									</FormGroup>
								</div>
							</div>
						)}
					</CardBody>
				</Collapse>
			</Card>
		)
	}
}
export default BasicInfoCollapse
