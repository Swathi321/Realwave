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
import "react-tagsinput/react-tagsinput.css";
import "../User/styles.scss";
import "./store.scss";
import { cloneDeep, clone} from 'lodash';


export class BasicInfoCollapse extends PureComponent {
  constructor(props) {
		super(props);
		this.state = {
			collapseOpen: props.item && clone(props.item.status),
			hasDedicatedVNCPort: clone(props.hasDedicatedVNCPort),
			vncLocalServerPort: clone(props.vncLocalServerPort),
			VNCportErr: clone(props.VNCportErr),
		}
	}

	componentDidUpdate(prevProps) {
		const {
			item,
			hasDedicatedVNCPort,
			vncLocalServerPort,
			VNCportErr,
		} = this.props;
		
		if (item && item.status && item.status !== prevProps.item.status) {
			this.setState({
				collapseOpen: item.status
			})
		}
		if (hasDedicatedVNCPort && hasDedicatedVNCPort !== prevProps.hasDedicatedVNCPort) {
			this.setState({
				hasDedicatedVNCPort: hasDedicatedVNCPort
			})
		}
		if (vncLocalServerPort && vncLocalServerPort !== prevProps.vncLocalServerPort) {
			this.setState({
				vncLocalServerPort: vncLocalServerPort
			})
		}
		if (VNCportErr && VNCportErr !== prevProps.VNCportErr) {
			this.setState({
				VNCportErr: VNCportErr
			})
		}
	}

	componentWillReceiveProps(nextProps) {
		const {
			item,
			hasDedicatedVNCPort,
			vncLocalServerPort,
			VNCportErr,
		} = nextProps;
		
		if (item && item.status && item.status !== this.state.collapseOpen) {
			this.setState({
				collapseOpen: item.status
			})
		}
		if (hasDedicatedVNCPort && hasDedicatedVNCPort !== this.state.hasDedicatedVNCPort) {
			this.setState({
				hasDedicatedVNCPort: hasDedicatedVNCPort
			})
		}
		if (vncLocalServerPort && vncLocalServerPort !== this.state.vncLocalServerPort) {
			this.setState({
				vncLocalServerPort: vncLocalServerPort
			})
		}
		if (VNCportErr && VNCportErr !== this.state.VNCportErr) {
			this.setState({
				VNCportErr: VNCportErr
			})
		}
	}

	handleChange = (e, ErrorStateVar) => { 
		let name = e.target.name
		const eventCopy = {...e};
		this.setState({ [name]: e.target.value }, () => this.props.handleChange(eventCopy, ErrorStateVar));
		if (name === "vncLocalServerPort" && this.state.hasDedicatedVNCPort) {
			if (e.target.value.length == 0) {
				this.setState({ [ErrorStateVar]: "Required" });
			} else {
				this.setState({ [ErrorStateVar]: "" });
			}
		}
	}

	setVNCStatus = (status) => {
    this.setState({ hasDedicatedVNCPort: !status, VNCportErr: false }, () => this.props.setVNCStatus(status));
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
			collapseOpen,
			hasDedicatedVNCPort,
			vncLocalServerPort,
			VNCportErr,
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
				<Collapse isOpen={collapseOpen} ref={this.vnc_configuration} className="pl-1 vnc_configuration">
					<CardBody>
						<FormGroup row className="site-tab-holder">
							<div class="col-lg-6">
								<Input
									id="vncLocalServerPort"
									name="vncLocalServerPort"
									type="number"
									value={vncLocalServerPort}
									className="form-control text-form"
									min={0}
									onChange={e => this.handleChange(e, 'VNCportErr')}
									required
								// onBlur={handleBlur}
								/>
								<label className="text-label" style={{ margin: "0px 12px" }}>VNC Local Server Port
								{hasDedicatedVNCPort && <span className={'text-danger'}>*</span>}
								</label>
								{VNCportErr && <div className="input-feedback">Required</div>}
							</div>

							<div class="col-lg-6">
								<FormGroup row className="pt-2 site-tab-holder">

									<div className="col-lg-4"></div>
									<div className="col-lg-4 ">Dedicated VNC Port</div>
									<div className="col-lg-4">
										<label className="switch">
											<input type="checkbox" className="toggle"
												//checked={values.hasDedicatedVNCPort || false}
												checked={hasDedicatedVNCPort}
												onClick={() => this.setVNCStatus(hasDedicatedVNCPort)}
												id="isActive"
											/>
											<span className="slider round"></span>
										</label>
									</div>
								</FormGroup>
							</div>
						</FormGroup>
					</CardBody>
				</Collapse>
			</Card>
		)
	}
}
export default BasicInfoCollapse
