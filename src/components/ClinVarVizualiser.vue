<template>
    <Bar id="my-chart-id" :options="chartOptions" :data="chartData" />
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
            const [lofVariants, missenseVariants, lofUnknown, missenseUnknown] = this.variantData;

            return {
                labels: ['P/LP', 'VUS'], // Labels for the two groups
                datasets: [
                    {
                        label: 'Lof', // LOF data
                        data: [lofVariants, lofUnknown],
                        backgroundColor: 'rgba(54, 162, 235, 0.8)', // Blue color

                    },
                    {
                        label: 'Missense', // Missense data
                        data: [missenseVariants, missenseUnknown],
                        backgroundColor: 'rgba(255, 99, 132, 0.8)', // Red color
                    }
                ]
            };
        }
    },
    data() {
        return {
            chartOptions: {
                responsive: true,
                maintainAspectRatio: false,
                categoryPercentage: 0.5,
                barPercentage: 1,
                layout: {
                    padding: {
                        top: 20 // Add extra space above the chart
                    }
                }, // Reduce the width of each group
                plugins: {
                    legend: {
                        display: false, // Hide the legend
                    },
                    tooltip: {
                        enabled: true // Enable tooltips
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
                        categoryPercentage: 0.6, // Reduce the width of each group
                        barPercentage: 0.9 // Adjust the width of bars within the group
                    },
                    y: {

                        ticks: {
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
