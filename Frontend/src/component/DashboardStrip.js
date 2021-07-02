import React, { Component } from 'react';
import { Col, CardGroup } from 'reactstrap';
import SalesStrip from './SalesStrip';
import { connect } from 'react-redux';
import util from '../Util/Util';
import PropTypes from 'prop-types';
import moment from 'moment';
import { getPeopleCount, getCustomerCountChart } from './../redux/actions/httpRequest';
import { PEOPLE_COUNT_ACTION } from './../Util/consts';

class DashboardStrip extends Component {
	constructor(props) {
		super(props);
		this.state = {
			siteCount: ""
		}
	}

	openUrl = (url) => {
		this.context.router.history.push({
			pathname: url
		})
	}

	storePercentageAlert = () => {
		this.context.router.history.push({
			pathname: '/alert/huboffline'
		})
	}

	cameraPercentageAlert = () => {
		this.context.router.history.push({
			pathname: '/alert/cameraoffline'
		})
	}

	getCamData(selectedStore, storesData) {
		if (selectedStore && selectedStore.length > 0 && selectedStore[0].value != 'All') {
			let toReturn = [];
			selectedStore.forEach(item => {
				let cams = storesData.filter(e => e.storeId._id == item.value);
				toReturn = toReturn.concat(cams);
			});
			return toReturn;
		}

		return storesData;
	}

	bindStore(action) {
		let timezoneOffset = moment.utc().utcOffset(),
			currentDate = moment().format(util.peopleCountDateFormat);
		this.props.dispatch(getCustomerCountChart.request({ action: action, currentDate: currentDate, timezoneOffset: timezoneOffset }));
	}

	componentWillMount() {
		let userDetail = util.getLoggedUser();
		let storeArr = [];
		userDetail && userDetail.storeId && userDetail.storeId.forEach(data => {
			storeArr.push(Object.values(data)[0]);
		});
		let timezoneOffset = moment.utc().utcOffset(),
			currentDate = moment().format('YYYY-MM-DD 00:00:00');
		let options = { action: 'load', stores: storeArr, currentDate: currentDate, timezoneOffset: timezoneOffset };
		if (userDetail && userDetail.storeId && userDetail.storeId.length > 0) {
			this.props.dispatch(getPeopleCount.request(options));
		}
		this.bindStore(PEOPLE_COUNT_ACTION.DAILY);
	}

	getCountFromSelectedTagsAndSites(storeChange, storesData) {
		let storeCount = 0;
		let connectedCount = 0;
		let cameraActive = 0;
		let selectedStore = storeChange.selectedStore;
		if (selectedStore && selectedStore.length > 0 && selectedStore[0].value == 'All') {
			selectedStore = JSON.parse(localStorage.getItem('SelectedStore'));
		}
		if (selectedStore && selectedStore.length > 0 && storesData && storesData.data && storesData.data.stores) {
			let allStores = storesData.data.stores;
			let cameras = this.getCamData(selectedStore, storesData.data.data);
			cameras.forEach(function (camera) {
				if (camera.isConnected && camera.storeId.isConnected) {
					cameraActive++;
				}
			});
			let selectedTags = storeChange.selectedTag || {};
			if (selectedTags && selectedTags.length > 0) {
				let selectedMultipleTagsLength = selectedTags.length;
				allStores.forEach(function (data) {
					let allTags = data.tags;
					if (allTags) {
						for (var i = 0; i < selectedMultipleTagsLength; i++) {
							let validtag = allTags.filter(function (data) { return data == selectedTags[i].value });
							if (validtag.length > 0) {
								storeCount++;
								if (data.isConnected) {
									connectedCount++;
								}
								break;
							}
						}
					}
				});
			} else if (selectedStore && selectedStore.length > 0 && selectedStore[0].value != 'All') {
				let selectedMultipleStoreLength = selectedStore.length;
				if (selectedStore && selectedMultipleStoreLength > 0) {
					selectedStore.forEach(function (data) {
						let selectedSite = allStores.filter(function (e) { return e._id === data.value });
						if (selectedSite.length > 0) {
							selectedSite.forEach(function (data) {
								storeCount++;
								if (data.isConnected) {
									connectedCount++;
								}
							});
						}
					});
				}
			}
			else {
				storeCount = allStores.length;
				allStores.forEach(s => {
					if (s.isConnected) {
						connectedCount++;
					}
				});
			}
		}

		return { storeCount: storeCount, connectedCount: connectedCount, cameraActive: cameraActive };
	}

	render() {
		const { storesData, attribute, data, storeChange, getPeopleCount, getCustomerCountChart } = this.props;
		const siteCount = this.getCountFromSelectedTagsAndSites(storeChange, storesData);
		let oneWeekInCount = 0;
		let averageWeekCount = 0;
		let todayInCount = 0;
		let changeCount = 0;
		let arrowUpDown = "fa-arrow-up";
		let arrowDownColor = "up-green";
		let peopleCountData = null;
		if (storeChange.selectedStore.length > 0 && getPeopleCount && getPeopleCount.data && getPeopleCount.data.records && getPeopleCount.data.records.length > 0) {
			peopleCountData = getPeopleCount.data;
			oneWeekInCount = peopleCountData.oneWeekInCount;
			averageWeekCount = peopleCountData.averageWeekCount;
			todayInCount = peopleCountData.todayInCount;
			changeCount = peopleCountData.changeCount
			if (changeCount <= 0) {
				arrowDownColor = "down-red";
				arrowUpDown = "fa-arrow-down";
			}
		}

		const { storeSalesData } = data || {};
		const { store } = storeSalesData || {};
		const cameraCount = store && store.cameraCount ? store.cameraCount : 0;

		const hasPOSPermission = util.isPermitted(['Point of Sale']);
		const hasSitePermission = util.isPermitted(['Sites']);
		const hasVideoPermission = util.isPermitted(['Video']);
		const hasSiteLogPermission = util.isPermitted(['Site Logs']);
		let rightCameraCount = storeChange.selectedStore.length > 0 ? cameraCount ? cameraCount - siteCount.cameraActive : 0 : 0;
		return (
			<Col {...attribute} className={"dashboard-strip"}>
				<CardGroup>
					<SalesStrip isShowHeader={true} className="strip-first-color color-strip-one store-percentage" offlineColor={'offon'} leftCount={siteCount.cameraActive} rightCount={rightCameraCount > 0 ? rightCameraCount : 0} leftText={'Online'} rightText={'Offline'} icon="icon2-offcam_dashboard" header={'Cameras'} onClick={() => hasVideoPermission && rightCameraCount > 0 ? this.openUrl('/video/') : ''}></SalesStrip>
					<SalesStrip
						isShowHeader={true}
						offonColor={'offon'}
						className="strip-fifth-color color-strip-two store-percentage"
						offlineColor={'offon'}
						color="danger"
						header={"Sites"}
						leftCount={siteCount.connectedCount}
						rightCount={siteCount.storeCount - siteCount.connectedCount}
						leftText={'Online'}
						rightText={'Offline'}
						onLeftItemClick={() => hasSitePermission && siteCount && siteCount.storeCount > 0 ? this.openUrl(`/health/monitor/online`) : ''}
						onRightItemClick={() => hasSitePermission && siteCount && siteCount.storeCount > 0 ? this.openUrl(`/health/monitor/offline`) : ''}
					/>
					<SalesStrip isShowHeader={true} isCustomerCount={true} isChart={true} showUpDownRow={true} updownIcon={arrowUpDown} showUpDownText={'Change'} showUpDownCount={changeCount} middleHigh={todayInCount} middleColor={''} isShowHeader={true} className="strip-fourth-color color-strip-five cursor" color={arrowDownColor} header={'Customer Count'} leftCount={oneWeekInCount} rightCount={todayInCount} leftText={'Last Week'} leftColor={''} rightText={'Today'} rightColor={''} rightBottomText={'Average'} rightBottomColor={''} rightBottomCount={averageWeekCount} peopleCountChartData={getCustomerCountChart || []} onClick={() => hasSiteLogPermission && peopleCountData && peopleCountData.records && peopleCountData.records.length > 0 ? this.openUrl('/peopleCountLog') : ''}> </SalesStrip>
					<SalesStrip
						isShowHeader={true}
						className="strip-fifth-color color-strip-four store-percentage"
						color="danger"
						header={"Suspicious Transactions"}
						leftCount={storeChange.selectedStore.length > 0 && hasPOSPermission && store && store.suspiciousData.count || 0}
						rightCount={storeChange.selectedStore.length > 0 && hasPOSPermission && store && store.suspiciousData.openCount || 0}
						leftText={'Total'}
						rightText={'Open'}
						onClick={() => hasPOSPermission && store && store.suspiciousData.count > 0 ? this.openUrl('/transaction/suspicioustransactions') : ''}>
					</SalesStrip>
					<SalesStrip
						isChart={true}
						showUpDownRow={true}
						updownIcon={'fa-arrow-up'}
						showUpDownText={'Change'}
						showUpDownCount={(storeChange.selectedStore.length > 0 && hasPOSPermission && store && store.AverageSalesLastWeek && store.AverageSalesLastWeek.toFixed(2)) || '0.00'}
						isShowHeader={true} className="strip-fourth-color color-strip-five cursor"
						color={'up-green'}
						header={'Average Sales'}
						leftText={'Week'}
						leftCount={(storeChange.selectedStore.length > 0 && hasPOSPermission && store && store.AverageSales && store.AverageSales.toFixed(2)) || '0.00'}
						onClick={() => hasVideoPermission && store && store.AverageSales > 0 && store.AverageSalesLastWeek > 0 ? this.openUrl('/sales/pos') : ''}>
					</SalesStrip>
				</CardGroup>
			</Col>
		);
	}
}

DashboardStrip.contextTypes = {
	router: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
	return {
		storesData: state.storesData,
		storeChange: state.storeChange,
		getPeopleCount: state.getPeopleCount,
		getCustomerCountChart: state.getCustomerCountChart
	};
}
var DashboardStripModule = connect(mapStateToProps)(DashboardStrip);
export default DashboardStripModule;
