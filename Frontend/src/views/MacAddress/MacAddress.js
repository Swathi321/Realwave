import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
import Grid from '../Grid/GridBase';
import { Col, Row } from 'reactstrap';
import { macAddress } from '../../redux/actions/httpRequest';

export class MacAddress extends PureComponent {
	constructor(props) {
		super(props)
		this.state = {
			columns: [
				{ key: 'macaddress', name: 'Mac Address', width: 170, filter: true, sort: true, type: 'string' }
			],
			page: localStorage.getItem('currentPage')
		}
		this.alreadyclicked = false;
		this.alreadyclickedTimeout = null;
		this.onRowClick = this.onRowClick.bind(this);
	}

	onRowClick = (index, record) => {
		if (this.alreadyclicked) {
			this.alreadyclicked = false;
			this.alreadyclickedTimeout && clearTimeout(this.alreadyclickedTimeout);
			this.context.router.history.push('/admin/macAddresses/addMacAddress/' + record._id);
		}
		else {
			this.alreadyclicked = true;
			this.alreadyclickedTimeout = setTimeout(() => {
				this.alreadyclicked = false;
			}, 300);
		}
	}

	addNew = () => {
		this.context.router.history.push('/admin/macAddresses/addMacAddress/' + 0);
	}

	componentWillMount() {
		localStorage.removeItem("currentPage");
	}
	
	setPage = (page) => {
		localStorage.setItem('currentPage', page)
		this.setState({
			page: page
		})
	}

	render() {
		const { props, state, addNew } = this;
		const { columns, page } = state;
		let { listAction, actionName, sortColumn, sortDirection, localPaging } = props
		return (
			<div className="grid-wrapper-area">
				<Row>
					<Col>
						<Grid
							listAction={listAction}
							dataProperty={actionName}
							columns={columns}
							autoHeight={true}
							screen={"Mac Address"}
							filename={"Mac Address"}
							defaultSort={{ sortColumn: sortColumn, sortDirection: sortDirection }}
							localPaging={localPaging || false}
							onRowClick={this.onRowClick}
							exportButton={false}
							screenPathLocation={this.props.location}
							add={addNew}
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

MacAddress.defaultProps = {
	listAction: macAddress,
	actionName: 'macAddress'
}

MacAddress.contextTypes = {
	router: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
    
})

export default connect(mapStateToProps)(MacAddress)
