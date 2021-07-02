import React, { Component } from 'react';
import {
	CardBody,
	Col,
	Nav, NavItem, NavLink, TabContent, TabPane
} from 'reactstrap';
import classnames from 'classnames';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { Line } from 'react-chartjs-2';
import { getSalesDashboard } from '../redux/actions/httpRequest';
import { connect } from 'react-redux';
import moment from 'moment';
import common from '../common';
import util from '../Util/Util';
import ReactLoading from 'react-loading';

const options = {
	tooltips: {
		callbacks: {
			label: function (tooltipItem, data) {
				return Number(tooltipItem.yLabel) + '<br/>' + tooltipItem.xLabel
			}
		},
		enabled: false,
		custom: CustomTooltips
	},
	maintainAspectRatio: false
}

class SalesChart extends Component {
	constructor(props) {
		super(props);
		this.toggle = this.toggle.bind(this);
		this.state = {
			activeTab: '1',
			top: 0,
			left: 0,
			date: '',
			value: 0,
			startDate: moment.utc().add(-24, 'hours').format('YYYY-MM-DD HH:mm:ss'),
			endDate: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
			type: 'hourly',
			dashboardData: null
		};
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.getSalesDashboard !== this.props.getSalesDashboard) {
			let { data, error, isFetching } = nextProps.getSalesDashboard;
			let valid = common.responseHandler(data, error, isFetching);
			if (valid) {
				this.setState({ dashboardData: data.data });
			}
		}
	}

	componentWillMount() {
		var timezoneOffset = new Date().getTimezoneOffset();
		this.props.dispatch(getSalesDashboard.request({ startDate: this.state.startDate, endDate: this.state.endDate, type: this.state.type, timezoneOffset: timezoneOffset }));
	}

	setPositionAndData = (top, left, date, value) => {
		this.setState({ top, left, date, value });
	};

	toggle(tab) {
		if (this.state.activeTab !== tab) {
			this.setState({ activeTab: tab });
			var startDate, endDate, type;
			switch (tab) {
				case "1":
					startDate = moment.utc().add(-24, 'hours').format('YYYY-MM-DD HH:mm:ss');
					endDate = moment.utc().format('YYYY-MM-DD hh:mm:ss');
					type = 'hourly'
					break;
				case "2":
					startDate = moment.utc().add(-6, 'days').format('YYYY-MM-DD 00:00:00');
					endDate = moment.utc().format('YYYY-MM-DD 23:59:59');
					type = 'daily'
					break;
				case "3":
					startDate = moment.utc().add(-30, 'days').format('YYYY-MM-DD 00:00:00');
					endDate = moment.utc().format('YYYY-MM-DD 23:59:59');
					type = 'weekly'
					break;
				default:
					break;
			}
			var timezoneOffset = new Date().getTimezoneOffset()
			this.props.dispatch(getSalesDashboard.request({ startDate: startDate, endDate: endDate, type: type, timezoneOffset: timezoneOffset }));
		}
	}

	getTemplateData(name) {
		const progressBarStyle = util.getProgressBarStyle(this.props.theme.className);
		this.template = {
			labels: [],
			datasets: [
				{
					label: '',
					fill: true,
					lineTension: 0.1,
					backgroundColor: progressBarStyle.storeChart,
					borderColor: progressBarStyle.storeChartActive,
					borderCapStyle: 'butt',
					borderDash: [],
					borderDashOffset: 0.0,
					borderJoinStyle: 'miter',
					borderWidth: 4,
					hoverBackgroundColor: progressBarStyle.storeChartActive,
					hoverBorderColor: progressBarStyle.storeChartActive,
					pointBorderWidth: 1,
					pointHoverRadius: 5,
					pointHoverBorderWidth: 2,
					pointRadius: 1,
					pointHitRadius: 20,
					data: []
				}
			]
		};
		let customData = JSON.parse(JSON.stringify(this.template));
		customData.datasets[0].label = name + ' Sales';
		return JSON.parse(JSON.stringify(customData))
	}

	getChart(chartType) {
		const { storeChange } = this.props;
		let data = [];
		var labelsData = [];
		let SalesData = {};
		if (storeChange.selectedStore.length > 0) {
			switch (chartType) {
				case "Hourly":
					if (this.state.dashboardData) {
						SalesData = this.getTemplateData(chartType);
						SalesData.datasets[0].data = this.state.dashboardData.data;
						if (this.state.dashboardData.label.length > 0) {
							this.state.dashboardData.label.forEach(element => {
								labelsData.push(moment.utc(element).format("MM-DD HH:00"));
							});
						}
						SalesData.labels = labelsData;
					}
					data = SalesData;
					break;
				case "Daily":
					if (this.state.dashboardData) {
						SalesData = this.getTemplateData(chartType);
						SalesData.datasets[0].data = this.state.dashboardData.data;
						this.state.dashboardData.label.forEach(element => {
							labelsData.push(moment.utc(element).format("YYYY-MM-DD"))
						});
						SalesData.labels = labelsData;
					}
					data = SalesData;
					break;
				case "Weekly":
					if (this.state.dashboardData) {
						SalesData = this.getTemplateData(chartType);
						SalesData.datasets[0].data = this.state.dashboardData.data;
						this.state.dashboardData.label.forEach(element => {
							labelsData.push(moment.utc(element).format("YYYY-MM-DD"))
						});
						SalesData.labels = labelsData;
					}
					data = SalesData;
					break;

				default:
					data = [];
					break;
			}
		}

		return (
			<CardBody>
				<div className="chart-wrapper sale-chart-cardbody">
					<Line data={data} options={options} />
				</div>
			</CardBody>
		)
	}

	render() {
		const { activeTab } = this.state;
		const { getSalesDashboard } = this.props;
		let isFetching = getSalesDashboard.isFetching;
		return (
			<div>
				{isFetching && <div id="overlay"><div id="overlay-loader"><ReactLoading type={'bars'} color={'#ffffff'} height={50} width={50} /></div></div>}
				<Nav tabs className="sales-tab">
					<NavItem>
						<NavLink
							className={classnames({ active: activeTab === '1' }, "dashboard-sale-chart-nav hourlySales")}
							onClick={() => { this.toggle('1'); }}>
							Hourly
                        </NavLink>
					</NavItem>
					<NavItem>
						<NavLink
							className={classnames({ active: activeTab === '2' }, "dashboard-sale-chart-nav dailySales")}
							onClick={() => { this.toggle('2'); }}>
							Daily
						</NavLink>
					</NavItem>
					<NavItem>
						<NavLink
							className={classnames({ active: activeTab === '3' }, "dashboard-sale-chart-nav weeklySales")}
							onClick={() => { this.toggle('3'); }}>
							Weekly
						</NavLink>
					</NavItem>
				</Nav>
				<TabContent activeTab={activeTab} className="table-responsive dashboard-cardbody">
					<TabPane tabId="1">
						{this.getChart('Hourly')}
					</TabPane>
					<TabPane tabId="2">
						{this.getChart("Daily")}
					</TabPane>
					<TabPane tabId="3">
						{this.getChart("Weekly")}
					</TabPane>
				</TabContent>
			</div>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		getSalesDashboard: state.getSalesDashboard,
		storeChange: state.storeChange
	};
}

var SalesChartModule = connect(mapStateToProps)(SalesChart);
export default SalesChartModule;
