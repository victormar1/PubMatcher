<template>
    <Pie id="my-chart-id" :options="chartOptions" :data="chartData" class="" />
</template>


<script>
import { Pie } from 'vue-chartjs';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement);
ChartJS.register(ChartDataLabels);

export default {
    name: 'VUSVizualiser',
    components: { Pie },
    props: {
        variantData: {
            type: Array,
            required: true
        }
    },
    computed: {
        chartData() {
            // Destructure data from the prop
            let [lofUnknown, missenseUnknown] = this.variantData;


            return {
                labels: ['LoF Unknown', 'Missense Unknown'], // Labels for each slice
                datasets: [
                    {
                        data: [lofUnknown, missenseUnknown], // Corresponding data for each slice
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.8)', // Red
                            'rgba(54, 162, 235, 0.8)', // Blue
                            'rgba(255, 205, 86, 0.8)', // Yellow
                            'rgba(75, 192, 192, 0.8)'  // Green
                        ],
                        hoverBackgroundColor: [
                            'rgba(255, 99, 132, 1)', // Red hover
                            'rgba(54, 162, 235, 1)', // Blue hover
                            'rgba(255, 205, 86, 1)', // Yellow hover
                            'rgba(75, 192, 192, 1)'  // Green hover
                        ],
                        borderWidth: 2
                    }
                ]
            };
        }
    },
    data() {
        return {
            chartOptions: {
                animation: {
                    duration: 2000
                },
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false, // Show the legend
                        position: 'top'
                    },
                    tooltip: {
                        enabled: false,
                    },
                    datalabels: {
                        display: false,
                        color: '#fff',
                        anchor: 'center',
                        align: 'center',
                        formatter: function (value) {
                            return value.toLocaleString(); // Format values
                        },
                        font: {
                            family: 'Roboto, sans-serif',
                            size: 12,
                            weight: 'bold'
                        }
                    }
                },

            }
        };
    }
};
</script>
