import React, { useEffect, useState } from "react";
// javascipt plugin for creating charts
import Chart from "chart.js";
// react plugin used to create charts
import { Line, Bar } from "react-chartjs-2";
// reactstrap components
import { Card, CardBody } from "reactstrap";
import Highcharts, { color } from 'highcharts';

const Charts = (props) => {
    const { showGraph } = props

    const options = {

        chart: {
            type: 'area',
            backgroundColor: "#1E384C",
            width: 500,
            height: 300,
        },
        xAxis: {
            categories: ['1', '2', '3', '4', '5', '6', '8', '9', '10'],

        },
        yAxis: {
            title: {
                text: 'MON'
            },
            gridLineWidth: 0,
            minorGridLineWidth: 0,
        },
        credits: {
            enabled: false
        },
        title: {
            text: 'Bandwidth Utilization',
            style: {
                color: 'white',
                fontWeight: 'bold'
            }
        },
        legend: {
            itemStyle: {
                color: 'white'
            }
        },

        plotOptions: {
            series: {
                fillOpacity: 0.1
            },

        },

        series: [{

            data: [30, 45.8, 12.9, 20, 30, 10, 40, 12, 60, 30, 80, 12],
            lineColor: "#0077B7",
            lineWidth: 5



        },
        {
            data: [29.9, 71.5, 39, 49, 29, 38, 18, 25, 100, 75, 125, 60],
            lineColor: '#C80015',
            lineWidth: 5


        }
        ],



    };
    useEffect(() => {

        Highcharts.chart(`${showGraph}`, options)
    })

    return (<>
        <div class="ChartLayout">


            <div id={`${showGraph}`}>

            </div>


        </div>

    </>
    )
}
export default Charts;
