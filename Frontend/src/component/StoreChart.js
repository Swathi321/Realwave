import React, { Component } from 'react';
import { Col, Row } from 'reactstrap';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { Bar, HorizontalBar } from 'react-chartjs-2';
import util from '../Util/Util';
import consts from '../Util/consts';
import ReactLoading from 'react-loading';

const options = {
    tooltips: {
        enabled: false,
        custom: CustomTooltips,
        display: false
    },
    scales: {
        yAxes: [{
            gridLines: {
                display: false
            },
            ticks: {
                fontColor: 'rgb(128,128,128,1)',
                display: true
            }
        }],
        xAxes: [{
            gridLines: {
                display: true
            },
            ticks: {
                fontColor: 'rgb(128,128,128,1)',
                display: true
            }
        }]
    },
    maintainAspectRatio: true,
    responsive: true,
    legend: {
        display: false,
        position: 'top',
        labels: {
            boxWidth: 1
        }
    }

}

class StoreChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            top: 0,
            left: 0,
            date: '',
            value: 0
        };
        this.performanceChart = [
            "CONVERSION", "PROFIT", "SALES", "UPSELLS"
        ]
    }

    getTemplateData(name, tops) {
        const progressBarStyle = util.getProgressBarStyle(this.props.theme.className);
        this.template = {
            labels: [],
            datasets: [
                {
                    label: '',
                    backgroundColor: progressBarStyle.storeChart,
                    borderColor: progressBarStyle.storeChartActive,
                    borderWidth: 1,
                    hoverBackgroundColor: progressBarStyle.storeChartActive,
                    hoverBorderColor: progressBarStyle.storeChartActive,
                    data: []
                }
            ]
        };
        let customData = JSON.parse(JSON.stringify(this.template));
        customData.datasets[0].label = name;
        return JSON.parse(JSON.stringify(customData))
    }

    getstoreChart(chartType, index) {
        const { storeChange } = this.props;
        const { storeSalesData } = this.props.data || {};
        const { performance } = storeSalesData || {};
        let data = {};
        if (storeChange.selectedStore.length > 0 && performance) {
            data = this.getTemplateData(chartType);
            data.datasets[0].data = performance[chartType.toLocaleLowerCase()].data;
            data.labels = performance[chartType.toLocaleLowerCase()].label;
            data.topvalue = performance[chartType.toLocaleLowerCase()].topvalue;
            data.target = performance[chartType.toLocaleLowerCase()].target;
            data.title = performance[chartType.toLocaleLowerCase()].title;
            data.datasets[0].backgroundColor = index == 0 || index == 3 ? 'rgba(44,198,152,1)' : index == 1 ? 'rgba(24,187,200,1)' : 'rgba(0,131,206,1)';
        }

        return (
            <Col xs="12" sm="6" md="3" className="no-padding pull-left dashboard-cardbody" key={index}>
                <div className={"chart-wraper-dashbord"}>
                    <div className={`header-area tab-${index}`}>
                        <h5 className="text-center">{data.title}</h5>
                        <Row>
                            <Col xs="12" sm="6" md="6">
                                <h3 className="text-center">{data.topvalue}</h3>
                                <h6 className="text-center">{consts.Total}</h6>
                            </Col>
                            <Col xs="12" sm="6" md="6">
                                <h3 className="text-center storeChartFigures">{data.target}</h3>
                                <h6 className="text-center">{consts.Target}</h6>
                            </Col>
                        </Row>
                    </div>
                    <HorizontalBar height={200} data={data} options={options} />
                </div>
            </Col>
        )
    }

    render() {
        const { storeSalesData } = this.props.data || {};
        const { performance } = storeSalesData || {};
        return (
            <div className="dashboard-store-chart">
                {!performance && <div id="overlay"><div id="overlay-loader"><ReactLoading type={'bars'} color={'#ffffff'} height={50} width={50} /></div></div>}
                {this.performanceChart.map(this.getstoreChart, this)}
            </div>
        );
    }
}

export default StoreChart;
