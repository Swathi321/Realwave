import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
import { Col, Row, Card, CardBody, Progress, Button, CardHeader, CardFooter, CardTitle, CardText } from 'reactstrap';
import util from './../../Util/Util';
import url from '../../redux/httpUtil/serverApi'
import { storeData } from '../../redux/actions/httpRequest';
import CircularProgressbar from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { screenDetails } from '../../redux/actions/';
import FusionCharts from 'fusioncharts';
import charts from 'fusioncharts/fusioncharts.widgets';
import ReactFC from 'react-fusioncharts';
import promiseUtils from '../../redux/httpUtil/cancelableFetch';
import io from 'socket.io-client';
import CardWrapper from './../../component/CardWrapper';

charts(FusionCharts);
// grap option
const options = {
    tooltips: {
        display: true
    },
    scales: {
        yAxes: [{
            gridLines: {
                display: true
            },
            ticks: {
                display: true,
                beginAtZero: true,
                fontColor: "#CCC"

            }
        }],
        xAxes: [{
            ticks: {
                autoSkip: true,
                maxTicksLimit: 10,
                fontColor: "#CCC"
            }
        }]
    },
    maintainAspectRatio: true,
    responsive: true,
    legend: {
        display: true,
        position: 'top',
        labels: {
            boxWidth: 0,
            fontColor: "#CCC"
        }
    }

}

export class MonitorSummary extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            driveLists: [],
            smartDevicesData: [],
            smartDevices: [],
            isMounted: true,
            cpu: {
                labels: [],
                datasets: [
                    {
                        label: 'CPU',
                        fill: false,
                        lineTension: 0.1,
                        borderColor: 'rgba(75,192,192,1)',
                        borderCapStyle: 'butt',
                        borderDash: [],
                        borderDashOffset: 0.0,
                        borderJoinStyle: 'miter',
                        pointBorderColor: 'rgba(75,192,192,1)',
                        pointBackgroundColor: '#fff',
                        pointBorderWidth: 1,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                        pointHoverBorderColor: 'rgba(220,220,220,1)',
                        pointHoverBorderWidth: 2,
                        pointRadius: 1,
                        pointHitRadius: 20,
                        data: []
                    },
                ],
            },
            cpupercentage: 0,
            systemcpupercentage: 0,
            memory: {
                labels: [],
                datasets: [
                    {
                        label: 'Memory',
                        fill: false,
                        lineTension: 0.1,
                        borderColor: 'rgba(75,192,192,1)',
                        borderCapStyle: 'butt',
                        borderDash: [],
                        borderDashOffset: 0.0,
                        borderJoinStyle: 'miter',
                        pointBorderColor: 'rgba(75,192,192,1)',
                        pointBackgroundColor: '#fff',
                        pointBorderWidth: 1,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                        pointHoverBorderColor: 'rgba(220,220,220,1)',
                        pointHoverBorderWidth: 2,
                        pointRadius: 1,
                        pointHitRadius: 20,
                        data: []
                    },
                ],
            },
            systemmemorypercentage: 0,
            storememorypercentage: 0
        }
    }

    setScreenName = (data) => {
        this.props.dispatch(screenDetails(data));
    }

    componentWillUnmount() {
        this.state.isMounted = false;
        this.setScreenName(null);
        this.socket.close();
    }

    tempDataRequest(nextProps) {
        var me = this;
        let { props, state } = this;
        if (nextProps) {
            props = nextProps;
        }
        let urlParam = window.location.hash.substr(2).split('/');
        let storeId = urlParam[2] ? urlParam[2] : '';
        if (storeId) {
            var formData = new FormData();
            formData.append('storeId', storeId);

            var p = fetch(url.TEMPERATURE + '?v=' + new Date().valueOf(), {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            p = promiseUtils.makeCancelable(p, 2000);
            me.lastFetch = p;
            p.then(response => {
                me.lastFetch = null;
                if (response.status === 200) {
                    response.json().then(function (data) {
                        if (data.success) {
                            var smartDevicesData = data.data;
                            me.setState({ smartDevicesData: smartDevicesData });
                            if (me.state.isMounted) {
                                me.startTemperatureData();
                            }
                        }
                    })
                } else {
                    if (me.state.isMounted) {
                        me.startTemperatureData();
                    }
                }
            }, function (err) {
                me.lastFetch = null;
                if (me.state.isMounted) {
                    me.startTemperatureData();
                }
            });
        }
        else {
            me.startTemperatureData();
        }
    }

    startTemperatureData(nextProps) {
        setTimeout(this.tempDataRequest.bind(this, nextProps), 5000);
    }

    componentDidMount() {
        let me = this;
        this.startTemperatureData();

        let urlParam = window.location.hash.substr(2).split('/');
        let storeId = urlParam[2] ? urlParam[2] : '';
        this.props.dispatch(storeData.request({ action: 'load', id: storeId }, storeId));

        this.socket = this.ws = io(util.serverUrl + "?type=client&storeId=" + storeId);

        // Connection opened
        this.socket.addEventListener('connect', function (event) {
            console.log('connected to server !')
        });

        // Listen for messages
        this.socket.addEventListener('message', function (event) {
            let json = event;
            var stateData = {}, params = json.params;
            var cpu = params && (params.cpu || params.CPU);
            if (cpu) {
                let cpuData = cpu;
                let system = cpuData.system ? Number(cpuData.system) : 0;
                let processValue = cpuData.process ? Number(cpuData.process) : 0;
                if (Array.isArray(cpuData)) {
                    let length = cpuData.length;
                    let avgSystem = 0;
                    for (let index = 0; index < length; index++) {
                        const element = cpuData[index];
                        avgSystem += element.used ? Number(element.used) : 0;

                        processValue = element.process ? Number(element.process) / 100 : 0;
                        console.log(processValue)
                    }

                    system = (avgSystem / length) / 100;
                }
                stateData = Object.assign({}, stateData, { cpupercentage: processValue.toFixed(2), systemcpupercentage: system.toFixed(2) });
                // me.setState({  cpupercentage: Number(cpuData.process), systemcpupercentage: Number(cpuData.system) });
                console.log(cpuData);
            }

            if (json.params && (json.params.memory || json.params.Memory)) {
                let memoryData = json.params.memory || json.params.Memory;
                let total = memoryData.physical_total || memoryData.total || 0;
                let used = memoryData.physical_used || memoryData.used || 0;
                let virtual = memoryData.virtual || 0;
                let memoryPercent = (((used * 100) / total)).toFixed(0);
                let storememoryPercent = (((virtual * 100) / total)).toFixed(0);
                stateData = Object.assign({}, stateData, { systemmemorypercentage: memoryPercent, storememorypercentage: storememoryPercent })
                //  me.setState({ systemmemorypercentage: memoryPercent, storememorypercentage: storememoryPercent });
                console.log(memoryData);
            }

            if (json.params && (json.params.disk || json.params.Disk)) {
                let driveLists = json.params.disk || json.params.Disk;
                stateData = Object.assign({}, stateData, { driveLists: driveLists })
            }
            me.setState(stateData);
        });
    }

    bytesToSizeWithoutUnit(bytes) {
        if (bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2);
    };

    bytesToSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
        if (bytes === 0) return 'n/a'
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)
        if (i === 0) return `${bytes} ${sizes[i]})`
        return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`
    };

    componentWillReceiveProps(nextProps) {
        if ((nextProps.storeData && nextProps.storeData !== this.props.storeData)) {
            let { data, isFetching, error } = nextProps.storeData;
            if (!isFetching && data) {
                let screenData = { name: data.name };
                this.setScreenName(screenData);
                if (error || data && data.errmsg) {
                    return;
                }

                this.setState({ driveLists: nextProps.storeData.data.driveLists ? JSON.parse(nextProps.storeData.data.driveLists) : [], smartDevices: data.smartDevices || [], name: data.name })

            }
        }
    }

    render() {
        
        const { cpupercentage, systemcpupercentage, storememorypercentage, systemmemorypercentage, driveLists, smartDevices, smartDevicesData, name } = this.state;
        const progressBarStyle = util.getProgressBarStyle(this.props.theme.className);
        return (
            <div>
                <CardWrapper title={name}>
                    <CardBody>
                        <Row>
                            <Col xl="4" lg="6" md="12" xs="12" >
                                <Card>
                                    <CardHeader className="contentText">CPU</CardHeader>
                                    <CardBody>
                                        <Row>
                                            <Col md="2" xs="12"></Col>
                                            <Col md="4" xs="6">
                                                <CircularProgressbar
                                                    percentage={(cpupercentage * 100).toFixed(2)}
                                                    text={`Site CPU ${(cpupercentage * 100).toFixed(2)}%`}
                                                    styles={{
                                                        // Customize the root svg element
                                                        root: {},
                                                        // Customize the path, i.e. the "completed progress"
                                                        path: {
                                                            // Path color
                                                            stroke: `rgba(75, 192, 192, ${(cpupercentage * 100).toFixed(2)})`,
                                                            // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                                                            strokeLinecap: 'butt',
                                                            // Customize transition animation
                                                            transition: 'stroke-dashoffset 0.5s ease 0s',
                                                        },
                                                        // Customize the circle behind the path, i.e. the "total progress"
                                                        trail: {
                                                            // Trail color
                                                            stroke: progressBarStyle.stroke,
                                                        },
                                                        // Customize the text
                                                        text: {
                                                            // Text color
                                                            fill: progressBarStyle.fill,
                                                            // Text size
                                                            fontSize: '10px',
                                                        },
                                                        // Customize background - only used when the `background` prop is true
                                                        background: {
                                                            fill: '#3e98c7',
                                                        },
                                                    }}
                                                    strokeWidth="2"
                                                />
                                            </Col>
                                            <Col md="4" xs="6">
                                                <CircularProgressbar
                                                    percentage={(systemcpupercentage * 100).toFixed(0)}
                                                    text={`System \n CPU ${(systemcpupercentage * 100).toFixed(0)}%`}
                                                    styles={{
                                                        // Customize the root svg element
                                                        root: {},
                                                        // Customize the path, i.e. the "completed progress"
                                                        path: {
                                                            // Path color
                                                            stroke: `rgba(75, 192, 192, ${(systemcpupercentage * 100).toFixed(0)})`,
                                                            // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                                                            strokeLinecap: 'butt',
                                                            // Customize transition animation
                                                            transition: 'stroke-dashoffset 0.5s ease 0s',
                                                        },
                                                        // Customize the circle behind the path, i.e. the "total progress"
                                                        trail: {
                                                            // Trail color
                                                            stroke: progressBarStyle.stroke,
                                                        },
                                                        // Customize the text
                                                        text: {
                                                            // Text color
                                                            fill: progressBarStyle.fill,
                                                            // Text size
                                                            fontSize: '10px',
                                                        },
                                                        // Customize background - only used when the `background` prop is true
                                                        background: {
                                                            fill: '#3e98c7',
                                                        },
                                                    }}
                                                    strokeWidth="2"
                                                />
                                            </Col>
                                            {/* <Col xs="12">
                                                <LineChart data={cpu} options={options} />
                                            </Col> */}
                                        </Row>
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col xl="4" lg="6" md="12" xs="12" >
                                <Card>
                                    <CardHeader className="contentText">Memory</CardHeader>
                                    <CardBody>
                                        <Row>
                                            <Col md="2" xs="12"></Col>
                                            <Col md="4" xs="6">
                                                <CircularProgressbar
                                                    percentage={storememorypercentage}
                                                    text={`Site Memory  ${storememorypercentage}%`}
                                                    styles={{
                                                        // Customize the root svg element
                                                        root: {},
                                                        // Customize the path, i.e. the "completed progress"
                                                        path: {
                                                            // Path color
                                                            stroke: `rgba(75, 192, 192, ${storememorypercentage})`,
                                                            // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                                                            strokeLinecap: 'butt',
                                                            // Customize transition animation
                                                            transition: 'stroke-dashoffset 0.5s ease 0s',
                                                        },
                                                        // Customize the circle behind the path, i.e. the "total progress"
                                                        trail: {
                                                            // Trail color
                                                            stroke: progressBarStyle.stroke,
                                                        },
                                                        // Customize the text
                                                        text: {
                                                            // Text color
                                                            fill: progressBarStyle.fill,
                                                            // Text size
                                                            fontSize: '10px',
                                                        },
                                                        // Customize background - only used when the `background` prop is true
                                                        background: {
                                                            fill: '#3e98c7',
                                                        },
                                                    }}
                                                    strokeWidth="2"
                                                />
                                            </Col>
                                            <Col md="4" xs="6">
                                                <CircularProgressbar
                                                    percentage={systemmemorypercentage}
                                                    text={`System Memory  ${systemmemorypercentage}%`}
                                                    styles={{
                                                        // Customize the root svg element
                                                        root: {},
                                                        // Customize the path, i.e. the "completed progress"
                                                        path: {
                                                            // Path color
                                                            stroke: `rgba(75, 192, 192, ${systemmemorypercentage})`,
                                                            // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                                                            strokeLinecap: 'butt',
                                                            // Customize transition animation
                                                            transition: 'stroke-dashoffset 0.5s ease 0s',
                                                        },
                                                        // Customize the circle behind the path, i.e. the "total progress"
                                                        trail: {
                                                            // Trail color
                                                            stroke: progressBarStyle.stroke,
                                                        },
                                                        // Customize the text
                                                        text: {
                                                            // Text color
                                                            fill: progressBarStyle.fill,
                                                            // Text size
                                                            fontSize: '10px',
                                                        },
                                                        // Customize background - only used when the `background` prop is true
                                                        background: {
                                                            fill: '#3e98c7',
                                                        },
                                                    }}
                                                    strokeWidth="2"
                                                />
                                            </Col>
                                            {/* <Col xs="12">
                                                <LineChart data={memory} options={options} />
                                            </Col> */}
                                        </Row>
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col xl="4" lg="6" md="12" xs="12">
                                <Card>
                                    <CardHeader className="contentText">Drives</CardHeader>
                                    <CardBody>
                                        <CardTitle></CardTitle>
                                        <Row>
                                            {driveLists &&( driveLists.length < 3 && driveLists.length != 0 )? <Col sm="2" xs="12"></Col> : null}
                                            {driveLists && driveLists.length > 0 ? driveLists.map((d, i) => {
                                                let driveInfo = d.driveInfo;
                                                let used = driveInfo ? driveInfo.used : d.used ? Number(d.used) : 0;
                                                let total = driveInfo ? driveInfo.total : d.total ? Number(d.total) : 0;
                                                let drivePercentage = ((used * 100) / total).toFixed(0);
                                                let processClass = 0 < drivePercentage && drivePercentage < 60 ? "40, 167, 69" : 60 < drivePercentage && drivePercentage < 90 ? "255,193,7" : 80 < drivePercentage && drivePercentage < 100 ? "204, 51, 0" : null;

                                                return <Col md="4" xs="6">
                                                    <CircularProgressbar
                                                        percentage={drivePercentage}
                                                        text={`${d.drivePath || d.disk} ${drivePercentage}%`}
                                                        styles={{
                                                            // Customize the root svg element
                                                            root: {},
                                                            // Customize the path, i.e. the "completed progress"
                                                            path: {
                                                                // Path color
                                                                stroke: `rgba(${processClass}, ${drivePercentage})`,
                                                                // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                                                                strokeLinecap: 'butt',
                                                                // Customize transition animation
                                                                transition: 'stroke-dashoffset 0.5s ease 0s',
                                                            },
                                                            // Customize the circle behind the path, i.e. the "total progress"
                                                            trail: {
                                                                // Trail color
                                                                stroke: progressBarStyle.stroke,
                                                            },
                                                            // Customize the text
                                                            text: {
                                                                // Text color
                                                                fill: progressBarStyle.fill,
                                                                // Text size
                                                                fontSize: '10px',
                                                            },
                                                            // Customize background - only used when the `background` prop is true
                                                            background: {
                                                                fill: '#3e98c7',
                                                            },
                                                        }}
                                                        strokeWidth="2"
                                                    />
                                                </Col>
                                            }) : <p style={{ margin: '0 auto' }}>Not Available</p>}
                                        </Row>
                                    </CardBody>
                                </Card>
                            </Col>
                            {smartDevices.map((d, i) => {
                                let temperature = null;
                                let dateTime = null;
                                if (smartDevicesData && smartDevicesData.length > 0) {
                                    let smartIndex = smartDevicesData.findIndex(e => e.DeviceSerial == d)
                                    if (smartIndex != -1) {
                                        temperature = (smartDevicesData[smartIndex].Temperature * 9 / 5 + 32)
                                        dateTime = smartDevicesData[smartIndex].EventTime
                                    }
                                }
                                return <Col lg="4" md="12" xs="12">
                                    <Card>
                                        <CardHeader className="contentText"> {"Temperature - " + d + (dateTime ? " (" + util.standardDate(dateTime, null, true) + ")" : "")}</CardHeader>
                                        <CardBody>
                                            <ReactFC type="thermometer"
                                                dataFormat="JSON"
                                                width="100%"
                                                dataSource={{
                                                    "chart": {
                                                        "lowerLimit": "-10",
                                                        "upperLimit": "140",
                                                        "decimals": "1",
                                                        "numberSuffix": "°F",
                                                        "showhovereffect": "1",
                                                        "showBorder": "0",
                                                        "bgColor": progressBarStyle.backgroundColor,
                                                        "bgAlpha": "100",
                                                        "thmFillColor": "#008ee4",
                                                        "showGaugeBorder": "1",
                                                        "gaugeBorderColor": "#008ee4",
                                                        "gaugeBorderThickness": "2",
                                                        "gaugeBorderAlpha": "30",
                                                        "chartBottomMargin": "20",
                                                        "showValue": 1,
                                                        "valueFontColor": progressBarStyle.fontcolor,
                                                        "labelFontColor": progressBarStyle.fontcolor,
                                                        "theme": "fusion"
                                                    },
                                                    "value": temperature
                                                }} />
                                        </CardBody>
                                    </Card>
                                </Col>
                            })}
                        </Row>
                    </CardBody>
                </CardWrapper >
            </div >
        )
    }
}

MonitorSummary.defaultProps = {
}

MonitorSummary.contextTypes = {
    router: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
    storeData: state.storeData,
    theme: state.theme

})

export default connect(mapStateToProps)(MonitorSummary)
