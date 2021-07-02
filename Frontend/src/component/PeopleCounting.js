import React, { Component } from 'react';
import { CardBody, Col, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { Bar } from 'react-chartjs-2';
import { getPeopleCountWidget } from '../redux/actions/httpRequest';
import { connect } from 'react-redux';
import moment from 'moment';
import common from '../common';
import util from '../Util/Util';
import ReactLoading from 'react-loading';
import { PEOPLE_COUNT_ACTION } from './../Util/consts';

const options = {
    tooltips: {
        enabled: false,
        custom: CustomTooltips
    },
    maintainAspectRatio: false
}

class PeopleCountGrid extends React.PureComponent {
    Header = (props) => {
        return Object.keys(props.data[0]).map(function (key) {
            return <th scope="col">{key}</th>
        })
    }

    Body = (props) => {
        const { data } = props;
        let rows = [], cell = [];

        const getColor = (count) => {
            let className = '';
            if (count >= 0 && count < 20) {
                className = 'class0-20';
            }
            if (count >= 20 && count < 50) {
                className = 'class20-50';
            }
            if (count >= 50 && count < 100) {
                className = 'class50-100';
            }
            if (count > 100) {
                className = 'class100Plus';
            }
            return className;
        }

        const getCellItem = (item) => {
            return (
                <td className="pcg-cell">
                    <div className={'pcg-cell-internal people-count-grid-data ' + getColor(item.inCount)}>{item.inCount}</div>
                    <div className={'pcg-cell-internal people-count-grid-data ' + getColor(item.outCount)}>{item.outCount}</div>
                </td>
            )
        }

        const getCellTime = (item) => {
            return (
                <td className='countTimeColumn people-count-grid-row-time pcg-row'>
                    <td className="pcg-row-time">{item.time}</td>
                    <td className="pcg-row-time">
                        <div>In</div>
                        <div>Out</div>
                    </td>
                </td>
            )
        }

        for (const item of data) {
            Object.keys(item).forEach(key => {
                if (key == "time") {
                    cell.push(getCellTime(item));
                } else {
                    cell.push(getCellItem(item[key]));
                }
            });
            rows.push(<tr className="custom-tr">
                {cell}
            </tr>)
            cell = [];
        }
        return rows;
    }

    render() {
        const { data, theme } = this.props;
        const peopleCountingGridStyle = util.getPeopleCountingGridStyle(theme.className);
        return (<div><div className="table-responsive">
            <table className="table table-bordered" cellSpacing="10">
                <thead>
                    <tr>
                        <this.Header data={data && data || []} />
                    </tr>
                </thead>
                <tbody>
                    <this.Body data={data && data || []} />
                </tbody>
            </table>
        </div>
            <div className="flex-container">
                <div style={{ backgroundColor: peopleCountingGridStyle.stroke }} className="people-count-grid-data">0 - 20</div>
                <div style={{ backgroundColor: peopleCountingGridStyle.fill }} className="people-count-grid-data">20 - 50</div>
                <div style={{ backgroundColor: peopleCountingGridStyle.backgroundColor }} className="people-count-grid-data">50 - 100</div>
                <div style={{ backgroundColor: peopleCountingGridStyle.fontcolor }} className="people-count-grid-data">100+</div>
            </div>
        </div>)
    }
}

class PeopleCounting extends Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.state = {
            activeTab: PEOPLE_COUNT_ACTION.HOURLY,
            top: 0,
            left: 0,
            date: '',
            value: 0
        };
        this.tempActiveTab = PEOPLE_COUNT_ACTION.HOURLY;
    }

    componentWillMount() {
        this.bindStore(PEOPLE_COUNT_ACTION.HOURLY);
    }

    bindStore(action) {
        let timezoneOffset = moment.utc().utcOffset(),
            currentDate = moment.utc().toString();
        this.props.dispatch(getPeopleCountWidget.request({ action: action, currentDate: currentDate, timezoneOffset: timezoneOffset }));
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.getPeopleCountWidget !== this.props.getPeopleCountWidget) {
            let { data, error, isFetching } = nextProps.getPeopleCountWidget;
            let valid = common.responseHandler(data, error, isFetching);
            if (!valid) {
                //TODO: Show alert if have any issue
            } else {
                this.setState({ activeTab: this.tempActiveTab });
            }
        }
    }

    toggle(action) {
        this.tempActiveTab = action;
        this.bindStore(action);
    }

    getTemplateData(name) {
        const peopleCountBarOneStyle = util.getPeopleCountingBarOneStyle(this.props.theme.className);
        const peopleCountBarTwoStyle = util.getPeopleCountingBarTwoStyle(this.props.theme.className);
        this.template = {
            labels: [],
            datasets: [
                {
                    label: '',
                    fill: true,
                    lineTension: 0.1,
                    backgroundColor: peopleCountBarOneStyle ? peopleCountBarOneStyle.backgroundColor: '',
                    borderColor: peopleCountBarOneStyle ? peopleCountBarOneStyle.backgroundColor: '',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    borderWidth: 4,
                    hoverBackgroundColor: peopleCountBarOneStyle ? peopleCountBarOneStyle.backgroundColor: '',
                    hoverBorderColor: peopleCountBarOneStyle ? peopleCountBarOneStyle.backgroundColor: '',
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 20,
                    data: []
                },
                {
                    label: '',
                    fill: true,
                    lineTension: 0.1,
                    backgroundColor: peopleCountBarTwoStyle ? peopleCountBarTwoStyle.backgroundColor: '',
                    borderColor: peopleCountBarTwoStyle ? peopleCountBarTwoStyle.backgroundColor: '',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    borderWidth: 4,
                    hoverBackgroundColor: peopleCountBarTwoStyle ? peopleCountBarTwoStyle.backgroundColor: '',
                    hoverBorderColor: peopleCountBarTwoStyle ? peopleCountBarTwoStyle.backgroundColor: '',
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
        return JSON.parse(JSON.stringify(customData))
    }

    getChart(chartType, getPeopleCount) {
        let countData = {}, hasData = false;
        if (this.state.activeTab !== chartType) {
            return null;
        }

        /**
         * @param {String} type - Specific Tab like Hourly, Weekly etc.
         * @param {Array} data - Chart Data
         * @param {Object} options - Chart Options
            */
        const ChartLayout = (type, data, options) => {
            let cmp = null;
            switch (type) {
                case PEOPLE_COUNT_ACTION.HOURLY:
                case PEOPLE_COUNT_ACTION.DAILY:
                case PEOPLE_COUNT_ACTION.WEEKLY:
                    cmp = (
                        <CardBody>
                            <div className="chart-wrapper sale-chart-cardbody">
                                <Bar data={data} options={options} />
                            </div>
                        </CardBody>
                    )
                    break;

                case PEOPLE_COUNT_ACTION.GRID:
                    //TODO: Move gride code here
                    cmp = <PeopleCountGrid {...this.props} data={getPeopleCount && getPeopleCount.data && getPeopleCount.data.data || []} />
                    break;

                default:
                    break;
            }
            return cmp;
        }

        switch (chartType) {
            case PEOPLE_COUNT_ACTION.HOURLY:
                hasData = getPeopleCount && getPeopleCount.data && getPeopleCount.data.data && getPeopleCount.data.data.length > 0;
                countData = this.getTemplateData(chartType);
                if (hasData) {
                    let rowData = getPeopleCount.data.data,
                        inCountHourly = [],
                        outCountHourly = [];
                    rowData.forEach(function (count) {
                        inCountHourly.push(count.InCount);
                        outCountHourly.push(count.OutCount);
                    });
                    countData.datasets[0].data = inCountHourly;
                    countData.datasets[0].label = "In Count";
                    countData.datasets[1].data = outCountHourly;
                    countData.datasets[1].label = "Out Count";
                    rowData.forEach(item => { countData.labels.push(moment(item.PeopleCountDatetime).format(util.peopleCountHours)) });
                } else {
                    countData.datasets[0].data = [];
                    countData.datasets[0].label = "In Count";
                    countData.datasets[1].data = [];
                    countData.datasets[1].label = "Out Count";
                }
                return ChartLayout(chartType, countData, options);

            case PEOPLE_COUNT_ACTION.DAILY:
                hasData = getPeopleCount && getPeopleCount.data && getPeopleCount.data.data && getPeopleCount.data.data.length > 0
                countData = this.getTemplateData(chartType);
                if (hasData) {
                    let rowData = getPeopleCount.data.data,
                        inCountDaily = [],
                        outCountDaily = [],
                        peopleCountdaily = [];
                    rowData.forEach(function (count) {
                        let inCountDay = 0,
                            outCountDay = 0,
                            dayLabel = '';
                        count.forEach(function (dailyCount) {
                            inCountDay = inCountDay + dailyCount.InCount;
                            outCountDay = outCountDay + dailyCount.OutCount;
                            dayLabel = dailyCount.PeopleCountDatetime;
                        });
                        inCountDaily.push(inCountDay);
                        outCountDaily.push(outCountDay);
                        peopleCountdaily.push(moment(dayLabel).format(util.peopleCountDataUsed))
                    });
                    countData.datasets[0].data = inCountDaily;
                    countData.datasets[0].label = "In Count";
                    countData.datasets[1].data = outCountDaily;
                    countData.datasets[1].label = "Out Count";
                    countData.labels = peopleCountdaily;
                } else {
                    countData.datasets[0].data = [];
                    countData.datasets[0].label = "In Count";
                    countData.datasets[1].data = [];
                    countData.datasets[1].label = "Out Count";
                }
                return ChartLayout(chartType, countData, options);
            case PEOPLE_COUNT_ACTION.WEEKLY:
                hasData = getPeopleCount && getPeopleCount.data && getPeopleCount.data.data && Object.keys(getPeopleCount.data.data).length > 0;
                countData = this.getTemplateData(chartType);
                if (hasData) {
                    let weekValue = getPeopleCount.data.data,
                        weeklyData = Object.values(weekValue),
                        weeklyLabel = Object.keys(weekValue),
                        inCountWeekly = [],
                        outCountWeekly = [];
                    weeklyData.forEach(function (count) {
                        inCountWeekly.push(count.inCount);
                        outCountWeekly.push(count.outCount);
                    });
                    countData.datasets[0].data = inCountWeekly;
                    countData.datasets[0].label = "In Count";
                    countData.datasets[1].data = outCountWeekly;
                    countData.datasets[1].label = "Out Count";
                    weeklyLabel.forEach(item => { countData.labels.push(item) });
                } else {
                    countData.datasets[0].data = [];
                    countData.datasets[0].label = "In Count";
                    countData.datasets[1].data = [];
                    countData.datasets[1].label = "Out Count";
                }
                return ChartLayout(chartType, countData, options);
            case PEOPLE_COUNT_ACTION.GRID:
                return ChartLayout(chartType, countData, options);
            default:
                break;
        }
    }

    render() {
        const { activeTab } = this.state;
        const { getPeopleCountWidget } = this.props;
        let isFetching = getPeopleCountWidget.isFetching;
        return (
            <div>
                {isFetching && <div id="overlay"><div id="overlay-loader"><ReactLoading type={'bars'} color={'#ffffff'} height={50} width={50} /></div></div>}
                <Nav tabs className="sales-tab">
                    <NavItem>
                        <NavLink
                            className={classnames({ active: activeTab === PEOPLE_COUNT_ACTION.HOURLY }, "dashboard-sale-chart-nav hourlySales")}
                            onClick={() => { this.toggle(PEOPLE_COUNT_ACTION.HOURLY); }}>
                            Hourly
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: activeTab === PEOPLE_COUNT_ACTION.DAILY }, "dashboard-sale-chart-nav dailySales")}
                            onClick={() => { this.toggle(PEOPLE_COUNT_ACTION.DAILY); }}>
                            Daily
						</NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: activeTab === PEOPLE_COUNT_ACTION.WEEKLY }, "dashboard-sale-chart-nav weeklySales")}
                            onClick={() => { this.toggle(PEOPLE_COUNT_ACTION.WEEKLY); }}>
                            Weekly
						</NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: activeTab === PEOPLE_COUNT_ACTION.GRID }, "dashboard-sale-chart-nav dailySales")}
                            onClick={() => { this.toggle(PEOPLE_COUNT_ACTION.GRID); }}>
                            Grid
					</NavLink>
                    </NavItem>
                </Nav>
                <TabContent activeTab={activeTab} className="table-responsive dashboard-cardbody">
                    <TabPane tabId={PEOPLE_COUNT_ACTION.HOURLY}>
                        {this.getChart(PEOPLE_COUNT_ACTION.HOURLY, getPeopleCountWidget)}
                    </TabPane>
                    <TabPane tabId={PEOPLE_COUNT_ACTION.DAILY}>
                        {this.getChart(PEOPLE_COUNT_ACTION.DAILY, getPeopleCountWidget)}
                    </TabPane>
                    <TabPane tabId={PEOPLE_COUNT_ACTION.WEEKLY}>
                        {this.getChart(PEOPLE_COUNT_ACTION.WEEKLY, getPeopleCountWidget)}
                    </TabPane>
                    <TabPane tabId={PEOPLE_COUNT_ACTION.GRID}>
                        {this.getChart(PEOPLE_COUNT_ACTION.GRID, getPeopleCountWidget)}
                    </TabPane>
                </TabContent>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        getSalesDashboard: state.getSalesDashboard,
        storeChange: state.storeChange,
        getPeopleCountWidget: state.getPeopleCountWidget
    };
}

var PeopleCountngModule = connect(mapStateToProps)(PeopleCounting);
export default PeopleCountngModule;
