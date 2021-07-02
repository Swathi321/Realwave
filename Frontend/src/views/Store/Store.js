import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
import Grid from '../Grid/GridBase';
import { Col, Row } from 'reactstrap';
import { storeData, replaceSSHKey } from '../../redux/actions/httpRequest';
import util from '../../Util/Util';
import { Button, Tooltip } from 'antd';
import swal from 'sweetalert';

export class Store extends PureComponent {
	constructor(props) {
		super(props)
		this.state = {
			columns: [
				{ key: 'name', name: 'Name', width: 400, filter: true, sort: true, type: 'string' },
				{ key: 'storeType', name: 'Type', width: 100, filter: true, sort: true, type: 'string' },
				{ key: 'status', name: 'Status', width: 100, filter: true, sort: true, type: 'string' },
				{ key: 'serialNumber', name: 'Serial Key', width: 400, filter: true, sort: true, type: 'string' },
				{ key: 'isConnected', name: 'Machine Status', width: 350, sort: true, formatter: (props, record) => record.isConnected ? 'Connected' : 'Disconnected' },
				//{ key: 'isSMSEnable', name: 'SMS Enabled', width: 250, filter: true, sort: true, formatter: (props, record) => record.isSMSEnable ? 'Yes' : 'No' },
				{ key: 'lastConnectedOn', name: 'Last Connected On', width: 300, type: 'date' },
				{ key: 'version', name: 'Version', width: 150, filter: true, sort: true, type: 'string' },
				{ key: 'daemonVersion', name: 'Daemon Version', width: 190, filter: true, sort: true, type: 'string' },
				{ key: 'rexLibVersion', name: 'Rex Version', width: 150, filter: true, sort: true, type: 'string' },
				{ key: 'address', name: 'Address', width: 270, filter: true, sort: true, type: 'string' },
				{ key: 'city', name: 'City', width: 110, filter: true, sort: true, type: 'string' },
				{ key: 'state', name: 'State', width: 110, filter: true, sort: true, type: 'string' },
				{ key: 'zipCode', name: 'Zip Code', width: 180, filter: true, sort: true, type: 'string', align: 'right' },
				{ key: 'country', name: 'Country', filter: true, sort: true, type: 'string', width: 150 },
				{ key: 'macAddress', name: 'Mac Address', filter: true, sort: true, type: 'string', width: 170 }
			],
			page: localStorage.getItem("currentPage") ? localStorage.getItem('currentPage') : 1
		}
		this.alreadyclicked = false;
		this.alreadyclickedTimeout = null;
		this.onRowClick = this.onRowClick.bind(this);
	}

	componentWillMount() {
		localStorage.removeItem("currentPage");
	}

	componentWillReceiveProps(nextProps) {
		util.UpdateDataForGrid(this, nextProps);
		util.updateGrid(this, nextProps, 'Sites');
	}

	onRowClick = (index, record) => {
		if (this.alreadyclicked) {
			this.alreadyclicked = false;
			this.alreadyclickedTimeout && clearTimeout(this.alreadyclickedTimeout);
			localStorage.setItem("OpenSiteCamera", (record.status === "Active"));
			this.context.router.history.push('/admin/sites/addstore/' + record._id);
		}
		else {
			this.alreadyclicked = true;
			this.alreadyclickedTimeout = setTimeout(() => {
				this.alreadyclicked = false;
			}, 300);
		}
	}

	// addNew = () => {
	// 	this.context.router.history.push('/admin/sites/addstore/' + 0);
	// }

	onSSHKeyGenerate = () => {
		swal({
			title: "SSH Key Replacement",
			text: "Are you sure you want to replace ssh key? if yes existing ssh connection will be disconnected and again connect after 5 seconds",
			icon: "warning",
			buttons: true,
			dangerMode: true,
		}).then((willDelete) => {
			if (willDelete) {
				this.props.dispatch(replaceSSHKey.request({}, null, null, (res) => {
					swal({
						title: res.success ? "Success" : "Error",
						text: res.message,
						icon: res.success ? "success" : "error"
					});
				}));
			}
		});
	}

	setPage = (page) => {
		localStorage.setItem('currentPage', page)
		this.setState({
			page: page
		})
	}

	render() {
		const { props, state } = this;
		const { columns, page } = state;
		let { listAction, actionName, sortColumn, sortDirection, localPaging } = props
		return (
			<div className="grid-wrapper-area">
				<Row>
					<Col>
						<Grid
							customButton={
								<Tooltip placement="bottom" title={"Generate SSH Key"}>
									<Button
										outline
										className="no-sales-header-button grid-button"
										onClick={this.onSSHKeyGenerate}
									>
										{''} <i className="fa fa-key" />
									</Button>
								</Tooltip>
							}
							listAction={listAction}
							dataProperty={actionName}
							columns={columns}
							autoHeight={true}
							screen={"Sites"}
							filename={"Store"}
							defaultSort={{ sortColumn: sortColumn, sortDirection: sortDirection }}
							localPaging={this.props.localPaging || false}
							onRowClick={this.onRowClick}
							exportButton={true}
							screenPathLocation={this.props.location}
							height={450}
							pageProps={page}
							setPage={this.setPage}
						/>
					</Col>
				</Row>
			</div>
		)
	}
}

Store.defaultProps = {
	listAction: storeData,
	actionName: 'storeData'
}

Store.contextTypes = {
	router: PropTypes.object.isRequired
};

const mapStateToProps = (state) => {
	console.log(state);
	return ({
		storeData: state.storeData,
		storeChange: state.storeChange
	})
}

export default connect(mapStateToProps)(Store)

