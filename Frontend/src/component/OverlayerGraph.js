import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import VideoReceipt from '../component/VideoReceipt';
import moment from 'moment';

const options = {
	legend: {
		display: false,
	},
	scales: {
		xAxes: [{
			gridLines: {
				display: false,
				drawBorder: false
			},
			ticks: {
				display: false
			}
		}],
		yAxes: [{
			gridLines: {
				display: false,
				drawBorder: false
			},
			ticks: {
				display: false
			}
		}]
	},
	tooltips: {
		callbacks: {
			label: function (tooltipItem, data) {
				return '$' + tooltipItem.yLabel;
			}
		}
	}
}

const styles = {
	overLayerView: { display: 'inline-flex' },
	overLayGraphWrapper: { width: '100%', height: '100%', background: 'transparent', marginRight: '25px', marginTop: '20px' }
}

class OverlayerGraph extends Component {
	constructor(props) {
		super(props)
		this.state = {
			dataLine: {
				labels: [],
				datasets: [
					{
						label: "Total",
						fill: false,
						lineTension: 0.1,
						backgroundColor: "rgba(75,192,192,0.4)",
						borderColor: "rgba(75,192,192,1)",
						borderCapStyle: "butt",
						borderDash: [],
						borderDashOffset: 0.0,
						borderJoinStyle: "miter",
						pointBorderColor: "rgba(75,192,192,1)",
						pointBackgroundColor: "#fff",
						pointBorderWidth: 1,
						pointHoverRadius: 5,
						pointHoverBackgroundColor: "rgba(75,192,192,1)",
						pointHoverBorderColor: "rgba(220,220,220,1)",
						pointHoverBorderWidth: 2,
						pointRadius: 1,
						pointHitRadius: 10,
						data: []
					}
				]
			}
		}
	}


	componentDidMount() {
		let { data } = this.props;
		let dataSetObj = { ...this.state.dataLine };
		dataSetObj.labels = data && data.event && data.event.EventTime && [moment(data.event.EventTime).subtract(5, 'seconds')._d, moment(data.event.EventTime)._d, moment(data.event.EventTime).add(30, 'seconds')._d];
		dataSetObj.datasets[0].data = data && data.event && data.event.Total && [0, data.event.Total, 0];
		this.setState({ dataLine: dataSetObj });
	}

	render() {
		let { data, graphData } = this.props;

		return (
			<div id={'overLayer-view'} style={styles.overLayerView}>
				{data && data.event && !['Face', 'BackDoor'].includes(data.event.Status) ? <>
					{/* <div className={'overlayer-graph-wrapper'} style={styles.overLayGraphWrapper}>
							<Line id={'linehart'} data={this.state.dataLine || graphData} options={options} height={10} width={90} />
						</div> */}
					<VideoReceipt data={data} />
				</> : null}
			</div>
		)
	}
}

export default OverlayerGraph;
