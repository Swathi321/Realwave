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
import utils from "../../Util/Util";
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
			hasDedicatedPort: clone(props.hasDedicatedPort),
			sshLocalServerPort: clone(props.sshLocalServerPort),
			SSHportErr: clone(props.SSHportErr),
		}
	}

	componentDidUpdate(prevProps) {
		const {
			item,
			hasDedicatedPort,
			sshLocalServerPort,
			SSHportErr,
		} = this.props;
		
		if (item && item.status && item.status !== prevProps.item.status) {
			this.setState({
				collapseOpen: item.status
			})
		}
		if (hasDedicatedPort && hasDedicatedPort !== prevProps.hasDedicatedPort) {
			this.setState({
				hasDedicatedPort: hasDedicatedPort
			})
		}
		if (sshLocalServerPort && sshLocalServerPort !== prevProps.sshLocalServerPort) {
			this.setState({
				sshLocalServerPort: sshLocalServerPort
			})
		}
		if (SSHportErr && SSHportErr !== prevProps.SSHportErr) {
			this.setState({
				SSHportErr: SSHportErr
			})
		}
	}
	
	componentWillReceiveProps(nextProps) {
		const {
			item,
			hasDedicatedPort,
			sshLocalServerPort,
			SSHportErr,
		} = nextProps;
		
		if (item && item.status && item.status !== this.state.collapseOpen) {
			this.setState({
				collapseOpen: item.status
			})
		}
		if (hasDedicatedPort && hasDedicatedPort !== this.state.hasDedicatedPort) {
			this.setState({
				hasDedicatedPort: hasDedicatedPort
			})
		}
		if (sshLocalServerPort && sshLocalServerPort !== this.state.sshLocalServerPort) {
			this.setState({
				sshLocalServerPort: sshLocalServerPort
			})
		}
		if (SSHportErr && SSHportErr !== this.state.SSHportErr) {
			this.setState({
				SSHportErr: SSHportErr
			})
		}
	}

	handleChange = (e, ErrorStateVar) => { 
		let name = e.target.name
		const eventCopy = {...e};
		this.setState({ [name]: e.target.value }, () => this.props.handleChange(eventCopy, ErrorStateVar));
		if (name === "sshLocalServerPort" && this.state.hasDedicatedPort) {
			if (e.target.value.length == 0) {
				this.setState({ [ErrorStateVar]: "Required" });
			} else {
				this.setState({ [ErrorStateVar]: "" });
			}
		}
	}

	setSitesStatus = (status) => {
    this.setState({ hasDedicatedPort: !status, SSHportErr: false }, () => this.props.setSitesStatus(status));
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
			hasDedicatedPort,
			sshLocalServerPort,
			SSHportErr,
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
				<Collapse isOpen={collapseOpen} ref={this.ssh_configuration} className="pl-1 ssh_configuration">
					<CardBody>
						<FormGroup row className="site-tab-holder">
							<div class="col-lg-6">
								<Input
									id="sshLocalServerPort"
									name="sshLocalServerPort"
									type="number"
									value={sshLocalServerPort}
									className="form-control text-form"
									min={0}
									onChange={e => this.handleChange(e, 'SSHportErr')}
									required
								// onBlur={handleBlur}
								/>
								<label className="text-label" style={{ margin: "0px 12px" }}>SSH Local Server Port
								{hasDedicatedPort && <span className={'text-danger'}>*</span>}
								</label>
								{SSHportErr && <div className="input-feedback">Required</div>}
							</div>

							<div class="col-lg-6">
								<FormGroup row className="pt-2 site-tab-holder">

									<div className="col-lg-4"></div>
									<div className="col-lg-4 ">Dedicated SSH Port</div>
									<div className="col-lg-4">
										<label className="switch">
											<input type="checkbox" className="toggle"
												//checked={values.hasDedicatedPort || false}
												checked={hasDedicatedPort}
												onClick={() => this.setSitesStatus(hasDedicatedPort)}
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
