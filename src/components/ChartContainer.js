import React, {useRef, useEffect, useState} from 'react';
import { Chart } from "chart.js";

const ChartContainer = ({ data, currency }) => {
    const [chart, setChart] = useState(null);
    const chartRef = useRef(null);

    const printChart = async (times, prices) => {
        let canvasChart = chartRef.current.getContext('2d');

        let gradient = canvasChart.createLinearGradient(0, 0, 0, 400);

        gradient.addColorStop(0, 'rgba(247,147,26,.5)');
        gradient.addColorStop(1, 'rgba(255,193,119,.2)');

        Chart.defaults.global.defaultFontFamily = 'sans-serif';
        Chart.defaults.global.defaultFontSize = 12;

        if (chart) {
            chart.destroy();
        }

        const chartjs = new Chart(canvasChart, {
            type: 'line',
            data: {
                labels: times,
                datasets: [{
                    label: currency,
                    data: prices,
                    backgroundColor: gradient,
                    borderColor: 'rgba(247,147,26,1)',
                    borderJoinStyle: 'round',
                    borderCapStyle: 'round',
                    borderWidth: 3,
                    pointRadius: 0,
                    pointHitRadius: 10,
                    lineTension: .2,
                }]
            },
            options: {
                title: {
                    display: false,
                },
                legend: {
                    display: false
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 10,
                        bottom: 0
                    }
                },
                tooltips: {
                    callbacks: {
                        title: () => {}
                    },
                    displayColors: false,
                    yPadding: 10,
                    xPadding: 10,
                    position: 'nearest',
                    caretSize: 10,
                    backgroundColor: 'rgba(255,255,255,.9)',
                    bodyFontSize: 15,
                    bodyFontColor: '#303030'
                }
            }
        });

        setChart(chartjs);
    }

    useEffect(() => {
        if (data) {
            const times = data?.map(obj => {
                const converted = new Date(obj.time_close).toDateString();
                return converted.substr(converted.indexOf(" ") + 1);
            }).reverse();
            const prices = data?.map(obj => obj.rate_close.toFixed(3)).reverse();

            printChart(times, prices);
        }
    }, [data]);

    return (
        <div className="chart-container">
            <div className="chart-wrapper">
                <canvas ref={chartRef}></canvas>
            </div>
        </div>
    );
};

export default ChartContainer;
