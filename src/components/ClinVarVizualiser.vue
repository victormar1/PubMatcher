<template>
    <Bar id="my-chart-id" :options="chartOptions" :data="chartData" class="" />
</template>

<script>
import { Bar } from 'vue-chartjs'
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)
ChartJS.register(ChartDataLabels);

export default {
    name: 'ClinVarVizualiser',
    components: { Bar },
    props: {
        variantData: {
            type: Array,
            required: true
        }
    },
    computed: {
        chartData() {
            // Destructure data from the prop
            const [lofVariants, missenseVariants] = this.variantData;

            return {
                labels: ['P/LP'], // Labels for the two groups
                datasets: [
                    {
                        label: 'Lof', // LOF data
                        data: [lofVariants],
                        backgroundColor: 'rgba(255, 99, 132, 0.8)',
                        // Red color

                    },
                    {
                        label: 'Missense', // Missense data
                        data: [missenseVariants],
                        backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    }
                ]
            };
        }
    },
    data() {
        return {
            chartOptions: {
                animation: {
                    duration: 2000,
                },
                borderWidth: 2,
                borderColor: '#fff',
                responsive: true,
                maintainAspectRatio: false,
                categoryPercentage: 0.4,
                barPercentage: 1,
                layout: {
                    padding: {
                        top: 20,
                    },

                }, // Reduce the width of each group
                plugins: {
                    legend: {
                        display: false, // Hide the legend
                    },
                    tooltip: {
                        enabled: false // Enable tooltips
                    },
                    datalabels: {
                        display: true,
                        color: '#888',
                        anchor: 'end', // Center the label horizontally
                        align: 'end', // Align the label vertically
                        offset: 2,
                        clamp: true,
                        font: {
                            family: 'Roboto, sans-serif',
                            size: 8,
                            weight: 'bold',
                        },
                        formatter: function (value) {

                            return value.toLocaleString(); // Format values
                        }
                    }
                },

                scales: {
                    x: {

                        ticks: {
                            display: false,
                            font: {
                                family: "'Roboto', 'Arial', sans-serif", // X-axis labels font
                                size: 12,
                                weight: 'bold'
                            },
                            color: '#888' // X-axis labels color
                        },
                        stacked: false, // Side-by-side bars
                        grid: {
                            display: false // Hide x-axis gridlines
                        },
                    },
                    y: {
                        display: false, // Completely hide the Y-axis, including labels, ticks, and the vertical line
                        ticks: {
                            display: false,
                            font: {
                                family: "'Roboto', 'Arial', sans-serif", // X-axis labels font
                                size: 12,
                                weight: 'bold'
                            },
                            color: '#aaa' // X-axis labels color
                        },
                        beginAtZero: true, // Ensure bars start at zero
                        grid: {
                            display: true // Show y-axis gridlines
                        }
                    }
                }
            }
        }
    },
}
</script>
