import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, Col, Row } from 'reactstrap';
import classNames from 'classnames';
import { mapToCssModules } from 'reactstrap/lib/utils';
import { Bar } from 'react-chartjs-2';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips'
import utils from '../Util/Util';
import moment from 'moment';

const propTypes = {
  subHeader: PropTypes.string,
  boldValue: PropTypes.string,
  icon: PropTypes.string,
  color: PropTypes.string,
  value: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
  cssModule: PropTypes.object,
  invert: PropTypes.bool
};

const defaultProps = {
  header: '',
  subHeader: '',
  boldValue: '',
  icon: '',
  color: 'white',
  value: '25',
  children: '',
  invert: false
};

const cardChartOpts4 = {
  tooltips: {
    enabled: false,
    custom: CustomTooltips
  },
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  scales: {
    xAxes: [
      {
        display: false,
        barPercentage: 0.6,
      }],
    yAxes: [
      {
        display: false,
      }],
  },
};

// Card Chart 4
const cardChartData4 = {
  labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  datasets: [
    {
      label: 'Sales',
      backgroundColor: 'rgba(1,210,108,1)',
      borderColor: 'transparent',
      data: [78, 81, 80, 45, 34, 12, 40, 75, 34, 89, 32, 68, 54, 72, 18, 98],
    },
  ],
};

const customerCountData = {
  labels: [],
  datasets: [
    {
      label: 'Customer Count',
      backgroundColor: 'rgba(1,210,108,1)',
      borderColor: 'transparent',
      data: []
    },
  ],
};

class SalesStrip extends Component {
  constructor() {
    super();
    this.state = {
      ios: false,
      isPortait: false
    }
  }

  componentWillMount() {
    this.updateDimensions();
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  updateDimensions = () => {
    let ios = utils.isIOS();
    let isPortait = ios && window.innerHeight > window.innerWidth;
    this.setState({ ios: ios, isPortait: isPortait });
  }

  chartData = () => {
    let { peopleCountChartData } = this.props;
    if (peopleCountChartData && peopleCountChartData.data && peopleCountChartData.data.data && peopleCountChartData.data.data.length > 0) {
      let rowData = peopleCountChartData.data.data,
        inCountDaily = [],
        peopleCountdaily = [];
      rowData.forEach(function (count) {
        let inCountDay = 0,
          dayLabel = '';
        count && count.forEach(function (dailyCount) {
          inCountDay = inCountDay + dailyCount.InCount;
          dayLabel = dailyCount.PeopleCountDatetime;
        });
        inCountDaily.push(inCountDay);
        peopleCountdaily.push(moment(dayLabel).format(utils.peopleCountDataUsed));
      });
      if (inCountDaily.length > 0) {
        customerCountData.datasets[0].data = inCountDaily;
        customerCountData.labels = peopleCountdaily;
      }
    }
    return customerCountData;
  }

  render() {
    const { onLeftItemClick, onRightItemClick, showUpDownRow, showUpDownText, offonColor, updownIcon, className, cssModule, header, hideMiddle, subHeader, boldValue, icon, color, value, showMiddleRow, bottomHigh, bottomCount, showBottomRow, isChart, showUpDownCount, middleHigh, children, invert, headerSubValue, headerSubValueColor, onClick, isShowHeader, leftCount, rightCount, leftColor, rightColor, leftText, rightText, offlineColor, isCustomerCount, rightBottomCount, rightBottomColor, rightBottomText, peopleCountChartData, ...attributes } = this.props;
    const { isPortait, ios } = this.state;
    const progress = { style: '', color: color, value: value };
    const card = { style: '', bgColor: '', icon: icon };

    if (invert) {
      progress.style = 'progress-white';
      progress.color = '';
      card.style = 'text-white';
      card.bgColor = 'bg-' + color;
    }

    const classes = mapToCssModules(classNames(className, card.style, card.bgColor), cssModule);
    progress.style = classNames('progress-xs mt-3 mb-0', progress.style);

    let cardProps = { onClick: onClick || null };

    if (onLeftItemClick || onRightItemClick) {
      cardProps = {};
    }

    return (
      <Card className={classes} {...cardProps} {...attributes} >
        <CardBody className="salestrip-color">
          {isShowHeader ? <Row>
            <Col xs={12}>
              <div className="h3 mb-0 text-center strip-commom-hight">{header}{' '}<i className={card.icon ? card.icon : ''}></i></div>
              {!hideMiddle ? <Row>
                <Col xs={12} className="text-center chart-font strip-commom-hight">
                  <div className={"h3 mb-0 " + (middleHigh ? 'up-percent' : 'down-percent')}> {showMiddleRow ? <i className={middleHigh ? 'fa fa-arrow-up' : 'fa fa-arrow-down'} /> : <br />}</div>
                </Col>
              </Row> : null}
              <Row className={ios && isPortait && isChart ? "average-salses-widget" : ""}>
                <Col onClick={onLeftItemClick || null} xs={12} md={12} lg={showUpDownRow ? 4 : (rightCount == undefined && !isChart) ? 12 : 6} className="text-center strip-commom-hight">

                  {isCustomerCount &&
                    <div className="top-left-text">
                      <div className={`h3 mb-0 ${offlineColor}`}>{rightCount}</div>
                      <div className={"h5 mb-0 " + (rightColor ? rightColor : null)}>{rightText}</div>
                    </div>

                  }
                  <div className={"h3 mb-0 "} > {leftCount}</div>
                  <div className={"h5 mb-0 " + (leftColor ? leftColor : null)}>{leftText}</div>
                  {showBottomRow ? <Row>
                    <Col xs={12} className="text-center chart-font strip-commom-hight">
                      <div className={"h3 mb-0 " + (bottomHigh ? 'up-percent' : 'down-percent')}>{bottomCount} {showBottomRow ? <i className={bottomHigh ? 'fa fa-arrow-up' : 'fa fa-arrow-down'} /> : <br />}</div>
                    </Col>
                  </Row> : null}
                </Col>
                <Col onClick={onRightItemClick || null} xs={12} md={12} lg={showUpDownRow ? 4 : 6} className="text-center strip-commom-hight">
                  {isChart ? <div>{isCustomerCount ? <Bar data={this.chartData} options={cardChartOpts4} height={50} /> : <Bar data={cardChartData4} options={cardChartOpts4} height={50} />} </div> :
                    <div>
                      <div className={`h3 mb-0 ${offlineColor}`}>{rightCount}</div>
                      <div className={"h5 mb-0 " + (rightColor ? rightColor : null)}>{rightText}</div>
                    </div>
                  }
                </Col>

                {showUpDownRow && <Col xs={12} md={12} lg={4} className="text-center strip-commom-hight">
                  <div className={isCustomerCount ? "top-left-text" : null}>
                    <div className={`h3 mb-0 ${color}`}><i className={`fa ${updownIcon}`}></i> {showUpDownCount}</div>
                    <div className={"h5 mb-0 " + (rightColor ? rightColor : null)}>{showUpDownText}</div>

                  </div>
                  {isCustomerCount &&
                    <div >
                      <div className={`h3 mb-0 ${offlineColor}`}>{rightBottomCount}</div>
                      <div className={"h5 mb-0 " + (rightBottomColor ? rightBottomColor : null)}>{rightBottomText}</div>
                    </div>
                  }
                </Col>}
              </Row>
            </Col>
          </Row> :
            <Row>
              <Col xs={2} className="kpi-text"></Col>
              <Col xs={8} className="kpi-text"></Col>
              <Col xs={2} className="kpi-text"></Col>
              <Col xs={8} className="kpi-text">
                <div className="h3 mb-0">{header} {headerSubValue ? <span className={headerSubValueColor ? "up-percent" : "down-percent"}>{headerSubValue}</span> : null}</div>
                <Row>
                  <Col xs={12} className="text-center">
                    <div className={"h3 mb-0 " + (middleHigh ? 'up-percent' : 'down-percent')}>{showUpDownCount} {showMiddleRow ? <i className={middleHigh ? 'fa fa-arrow-up' : 'fa fa-arrow-down'} /> : <br />}</div>
                  </Col>
                </Row>
                <div className="h3 mb-0">{subHeader}</div>
                <div className="h3 mb-0">{boldValue}</div>
                <small className="text-uppercase font-weight-bold">{children}</small>

              </Col>
              <Col xs={4} sm={4} md={4}>
                <div className="h1 text-right mb-2 kpi-text">
                  <i className={card.icon}></i>
                </div>
              </Col>
            </Row>}
        </CardBody>
      </Card>
    );
  }
}

SalesStrip.propTypes = propTypes;
SalesStrip.defaultProps = defaultProps;

export default SalesStrip;
