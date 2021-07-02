import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
import { getDirectoriesAndLogs } from '../../redux/actions/httpRequest';
import Grid from '../Grid/GridBase';
import { Col, Row } from 'reactstrap';
import util from '../../Util/Util';

export class LogsDirectories extends PureComponent {
	constructor(props) {
		super(props)
		this.state = {
			columns: [
				{ key: 'name', name: 'Site Name', width: 180, sort: false, filter: true, nested: '_stores.name', type: 'string' },
				{ key: 'address', name: 'Address', width: 200, filter: false, nested: '_stores.address', sort: true, type: 'string' },
				{ key: 'city', name: 'City', width: 100, filter: false, nested: '_stores.city', sort: true, type: 'string' },
				{ key: 'state', name: 'State', width: 100, filter: false, nested: '_stores.state', sort: true, type: 'string' },
				{ key: 'country', name: 'Country', width: 100, filter: false, nested: '_stores.country', sort: true, type: 'string' },
				{ key: 'createdAt', name: 'Event Time', width: 300, sort: false, type: 'date' },
			],
			page: localStorage.getItem('currentPage')
		}
		this.onRowClick = this.onRowClick.bind(this);

		this.alreadyclicked = false;
		this.alreadyclickedTimeout = null;
	}

	componentWillMount() {
		localStorage.removeItem("currentPage");
	}

	componentWillReceiveProps(nextProps) {
		util.UpdateDataForGrid(this, nextProps);
		util.updateGrid(this, nextProps, 'logs');
	}


	onRowClick = (index, record) => {
		if (this.alreadyclicked) {
			// double
			this.alreadyclicked = false;
			this.alreadyclickedTimeout && clearTimeout(this.alreadyclickedTimeout);
			this.context.router.history.push('/health/logsDirectories/logs/' + record._id);
		} else {
			this.alreadyclicked = true;
			this.alreadyclickedTimeout = setTimeout(() => {
				this.alreadyclicked = false;
			}, 300);
		}
	}

	setPage = (page) => {
		localStorage.setItem('currentPage', page)
    	this.setState({
     	 	page: page
    	})
  	}

	render() {
		const { columns, page } = this.state;
		let { listAction, actionName, sortColumn, sortDirection } = this.props

		return (
			<div className="grid-wrapper-area">
				<Row>
					<Col>
						<Grid
							listAction={listAction}
							dataProperty={actionName}
							defaultSort={{ sortColumn: sortColumn, sortDirection: sortDirection }}
							columns={columns}
							screen={"logs"}
							filename={"Logs"}
							autoHeight={true}
							action={'getDirectories'}
							onRowClick={this.onRowClick}
							populate={'_id'}
							pageProps={page}
							setPage={this.setPage}
						/>
					</Col>
				</Row>
			</div>
		)
	}
}

LogsDirectories.defaultProps = {
	listAction: getDirectoriesAndLogs,
	actionName: 'getDirectoriesAndLogs'
}

LogsDirectories.contextTypes = {
	router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
	return {
		getDirectoriesAndLogs: state.getDirectoriesAndLogs,
		storeChange: state.storeChange
	};
}

export default connect(mapStateToProps)(LogsDirectories)
