import React from 'react';
// Load the exporting module.
import Exporting from 'highcharts/modules/exporting';
import Highcharts from 'highcharts/highmaps';
// Initialize exporting module.
Exporting(Highcharts);

const getPointCategoryName = (point, dimension) => {
    var series = point.series,
        isY = dimension === 'y',
        axis = series[isY ? 'yAxis' : 'xAxis'];
    return axis.categories[point[isY ? 'y' : 'x']];
}

class Charts extends React.PureComponent {
    componentDidMount() {
        Highcharts.chart('container', {
            chart: {
                type: 'heatmap',
                height: 700,
                marginTop: 40
            },
            title: {
                text: ''
            },
            xAxis: {
                labels: {
                    y: -600
                },
                categories: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
            },
            yAxis: {
                categories: ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM'],
                title: null,
                reversed: true
            },
            colorAxis: {
                min: 0,
                stops: [
                    [0, '#C1E7EA'],
                    [0.20, '#6BB99E'],
                    [0.50, '#41B77C'],
                    [1, '#2A7865']
                ]
            },
            legend: {
                symbolHeight: 25,
                symbolWidth: 300,
                y: 20
            },
            tooltip: {
                formatter: function () {
                    return '<b>' + getPointCategoryName(this.point, 'x') + '</b> sold <br><b>' +
                        this.point.value + '</b> items on <br><b>' + getPointCategoryName(this.point, 'y') + '</b>';
                }
            },
            series: [{
                borderWidth: 3,
                color: 'white',
                data: [
                    [0, 0, 0], [0, 1, 3], [0, 2, 29], [0, 3, 41], [0, 4, 28], [0, 5, 56], [0, 6, 114], [0, 7, 176], [0, 8, 134], [0, 9, 85], [0, 10, 45], [0, 11, 34], [0, 12, 84], [0, 13, 75],
                    [1, 0, 2], [1, 1, 23], [1, 2, 25], [1, 3, 52], [1, 4, 28], [1, 5, 40], [1, 6, 121], [1, 7, 198], [1, 8, 145], [1, 9, 75], [1, 10, 12], [1, 11, 18], [1, 12, 92], [1, 13, 43],
                    [2, 0, 1], [2, 1, 4], [2, 2, 14], [2, 3, 36], [2, 4, 35], [2, 5, 28], [2, 6, 114], [2, 7, 198], [2, 8, 134], [2, 9, 85], [2, 10, 45], [2, 11, 34], [2, 12, 84], [2, 13, 75],
                    [3, 0, 0], [3, 1, 3], [3, 2, 29], [3, 3, 41], [3, 4, 28], [3, 5, 56], [3, 6, 114], [3, 7, 198], [3, 8, 134], [3, 9, 85], [3, 10, 45], [3, 11, 34], [3, 12, 84], [3, 13, 75],
                    [4, 0, 0], [4, 1, 3], [4, 2, 29], [4, 3, 41], [4, 4, 28], [4, 5, 56], [4, 6, 114], [4, 7, 198], [4, 8, 134], [4, 9, 85], [4, 10, 45], [4, 11, 34], [4, 12, 84], [4, 13, 75],
                    [5, 0, 0], [5, 1, 3], [5, 2, 29], [5, 3, 41], [5, 4, 28], [5, 5, 56], [5, 6, 114], [5, 7, 198], [5, 8, 134], [5, 9, 85], [5, 10, 45], [5, 11, 34], [5, 12, 84], [5, 13, 75],
                    [6, 0, 0], [6, 1, 3], [6, 2, 29], [6, 3, 41], [6, 4, 28], [6, 5, 56], [6, 6, 114], [6, 7, 198], [6, 8, 134], [6, 9, 85], [6, 10, 45], [6, 11, 34], [6, 12, 84], [6, 13, 75]
                ],
                dataLabels: {
                    enabled: true,
                    color: '#ffffff',
                    style: {
                       fontSize:15,
                        fontWeight: 200
                    }
                }
            }],
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 100,
                        maxHeight: 1200
                    },
                    chartOptions: {
                        yAxis: {
                            labels: {
                                formatter: function () {
                                    return this.value.charAt(0);
                                }
                            }
                        }
                    }
                }]
            }
        })
    }
    render = () => <figure className="highcharts-figure"><div id="container"></div></figure>
}

export default Charts



