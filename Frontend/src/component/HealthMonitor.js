import React, { PureComponent, Component } from 'react'
import { Col, Row, Collapse, Card, CardHeader, CardBody } from 'reactstrap';
import util from '../Util/Util';
import HealthChart from '../component/HealthChart';
import ProgressBar from '../component/HealthProgressBar';
import MonitorCameraGrid from '../component/HealthMonitorCameraGrid';
import MonitorIntegrationGrid from '../component/HealthMonitorIntegrationGrid';
import io from 'socket.io-client';
import { connect } from 'react-redux';

export class HealthMonitor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      collapseOpen: false,
      usageData: [{ Description: "CPU Utilization", Usage: 0 }, { Description: "GPU Utilization", Usage: 0 }]
    }
    this.usageData = [{ Description: "CPU Utilization", Usage: 0 }, { Description: "GPU Utilization", Usage: 0 }];
    this.socket = null;
  }
  instance;
  gpu;

  timeDiffCalc(dateFuture, dateNow) {

    let isValidDateTime = dateFuture instanceof Date && !isNaN(dateFuture);
    if (!isValidDateTime) {
      return null;
    }
    let diffInMilliSeconds = Math.abs(dateFuture - dateNow) / 1000;

    // calculate days
    const days = Math.floor(diffInMilliSeconds / 86400);
    diffInMilliSeconds -= days * 86400;
    console.log('calculated days', days);

    // calculate hours
    const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
    diffInMilliSeconds -= hours * 3600;
    console.log('calculated hours', hours);

    // calculate minutes
    const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
    diffInMilliSeconds -= minutes * 60;
    console.log('minutes', minutes);

    let difference = '';
    if (days > 0) {
      difference += (days === 1) ? `${days} day, ` : `${days} days, `;
    }

    difference += (hours === 0 || hours === 1) ? `${hours} hour, ` : `${hours} hours, `;

    difference += (minutes === 0 || hours === 1) ? `${minutes} minutes` : `${minutes} minutes`;

    return difference;
  }

  toggleAccodion = (index) => {

    let me = this;
    let item = this.props.sites[index];

    if (this.socket !== null) {
      this.socket.disconnect();
    }
    me.setState({ usageData: [{ Description: "CPU Utilization", Usage: 0 }, { Description: "GPU Utilization", Usage: 0 }] }, function () {
      if (item.isConnected) {
        me.usageData = [{ Description: "CPU Utilization", Usage: 0 }, { Description: "GPU Utilization", Usage: 0 }];

        me.socket = io(util.serverUrl + "?type=client&storeId=" + item._id);
        // Connection opened
        me.socket.addEventListener('connect', function (event) {
          console.log('connected to server !')
        });

        // Listen for messages
        me.socket.addEventListener('message', function (event) {
          let json = event;
          var stateData = {}, params = json.params;
          var cpu = params && (params.cpu || params.CPU);
          if (cpu) {
            cpu = JSON.parse(cpu);
            if (cpu && cpu.used && cpu.used > 0) {
              me.usageData[0].Usage = cpu.used;
              me.usageData[0].Usage = me.usageData[0].Usage.toFixed(2);
            }
          }
          var memoryData = params && (params.Memory || params.Memory);
          if (memoryData) {
            memoryData = JSON.parse(memoryData);
            if (memoryData && memoryData.availablePercent && memoryData.availablePercent > 0) {
              me.usageData[1].Usage = 100 - memoryData.availablePercent;
              me.usageData[1].Usage = me.usageData[1].Usage.toFixed(2);
            }
          }
          me.setState({ usageData: me.usageData });
        });

      }
      this.setState({ collapse: this.state.collapse === Number(index) ? -1 : Number(index) });
    });
  }

  render() {
    const { collapse, usageData } = this.state;
    const { sites } = this.props;

    return (
      <>

        <div className="MainHealthContainer">
          {
            sites.map((item, index) => {

              let CheckArray = Array.isArray(item)
              let driveList = CheckArray ? item[0].driveLists && JSON.parse(item[0].driveLists) : item.driveLists && JSON.parse(item.driveLists);
              let siteData = CheckArray ? item[0] : item;
              let status = CheckArray ? (item[0].lastConnectedOn || item[0].lastDisconnectedOn) : (item.lastConnectedOn || item.lastDisconnectedOn)

              return (
                <Card key={index}>
                  <CardHeader onClick={() => this.toggleAccodion(index)} className="MonitorCardHeaderText" >
                    {siteData.name}
                    {collapse === index ? (
                      <i className="fa fa-angle-up floatRight" />
                    ) : (
                      <i className="fa fa-angle-down floatRight" />
                    )}
                  </CardHeader>
                  <Collapse isOpen={collapse === index} ref={this.media_server} >
                    {collapse === index && <CardBody>
                      <div className="MonitorHealthContainer">
                        <Row>

                          <div className="HeathMonitorfirtCol">
                            <div className="PieChartContainer">
                              <Row style={{ width: "100%" }}>
                                <Col className="col-md-12 col-xl-6 col-12 col-sm-12 ">
                                  <div className="displayUpTimeContainer" style={{ width: "100%" }}>
                                    <span className="upTime">Usage</span>
                                  </div>
                                  {
                                    usageData.length > 0 ? usageData.map((d, i) => {
                                      let processClass = 0 < d.Usage && d.Usage < 60 ? "40, 167, 69" : 60 < d.Usage && d.Usage < 90 ? "255,193,7" : 80 < d.Usage && d.Usage < 100 ? "204, 51, 0" : "0,119,183";
                                      return (
                                        <ProgressBar totalUsage={d.Usage} colorCode={processClass} lable={d.Description} />
                                      )
                                    }) : null
                                  }
                                </Col>
                                <Col className="col-md-12 col-xl-6 col-12 col-sm-12 ">

                                  <div className="displayUpTimeContainer" style={{ width: "100%" }}>
                                    <span className="upTime">Drive List</span>
                                  </div>
                                  {
                                    (driveList && driveList.length > 0) ? driveList.map((d, i) => {
                                      let driveInfo = d.driveInfo;
                                      let used = driveInfo ? driveInfo.used : d.used ? Number(d.used) : 0;
                                      let total = driveInfo ? driveInfo.total : d.total ? Number(d.total) : 0;
                                      let drivePercentage = ((used * 100) / total).toFixed(0);
                                      let processClass = 0 < drivePercentage && drivePercentage < 60 ? "40, 167, 69" : 60 < drivePercentage && drivePercentage < 90 ? "255,193,7" : 80 < drivePercentage && drivePercentage < 100 ? "204, 51, 0" : "0,119,183";
                                      return (
                                        <ProgressBar totalUsage={drivePercentage} colorCode={processClass} lable={`${d.drivePath || d.disk}`} />
                                      )
                                    }) : <div className="displayUpTimeContainer" style={{ width: "100%" }}>
                                      <span style={{ marginTop: 5, fontSize: 20 }}>Not Available</span>
                                    </div>
                                  }{status &&
                                    <div className="displayUpTimeContainer">
                                      <span className="UptimeText" >{siteData.isConnected ? "Up Time" : "Down Time"}</span>
                                      <span className="upTime">{this.timeDiffCalc(new Date(siteData.isConnected ? siteData.lastConnectedOn : siteData.lastDisconnectedOn), new Date())}</span>
                                    </div>}
                                </Col>
                                {/* <div>{item && item.driveLists && <ProgressBar driveData={item.driveLists} />}</div> */}
                              </Row>
                            </div>

                            {/* <HealthChart showGraph={item.name} /> */}
                            {/* {item && item.driveLists && <ProgressBar driveData={item.driveLists} />} */}
                          </div>


                        </Row>
                        <Row>
                          <Col className="col-md-12 col-xl-6 col-12 col-sm-12 ">
                            <div className="HealthGridCameras">
                              <span className="CameraText">CAMERAS</span>
                              <MonitorCameraGrid StoreData={CheckArray ? item[0] : item} key={index} />
                            </div>
                          </Col>
                          <Col className="col-md-12 col-xl-6 col-12 col-sm-12 ">
                            <div className="HealthGridIntegration">
                              <span className="IntegrationText">INTEGRATION</span>
                              <MonitorIntegrationGrid StoreData={CheckArray ? item[0] : item} key={index} />
                            </div>
                          </Col>
                        </Row>
                      </div>

                    </CardBody>
                    }

                  </Collapse>

                </Card>
              )
            })
          }
        </div>


      </>
    )
  }

}


function mapStateToProps(state, ownProps) {
  return {
    storesData: state.storesData,


  };
}
export default connect(mapStateToProps)(HealthMonitor)
