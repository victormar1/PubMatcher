<template>
    <main id="searchResults" class="container mx-auto my-10 w-full border-red-500 bg-transparent rounded-lg flex-grow flex-col" :class="{ 'hidden': !results || results.length === 0 }">
    <div class="flex justify-center">
        <h2 class="text-bold text-3xl font-mono font-bold text-gray-700">RESULTS</h2>
    </div>
    <div class="block">
        <div class="relative overflow-visible shadow-lg sm:rounded-lg">
        <table id="resultsTable" class="w-full text-sm text-left rtl:text-right text-gray-500  rounded-3xl dark:text-gray-400 bg-gray-200">
            <thead>
            <tr>
                <th scope="col" class="px-6 py-3 text-center border-r border-gray-300">GENE</th>
                <th scope="col" class="px-6 py-3 text-center border-r border-gray-300">PUBMED</th>
                <th scope="col" class="px-6 py-3 text-center border-r border-gray-300">FUNCTION</th>
                <th scope="col" class="px-6 py-3 text-nowrap border-r border-gray-300">PHENOTYPE KO</th>
                <th scope="col" class="px-6 py-3 text-nowrap ">PANEL APP</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="result in results" :key="result.gene" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <!-- GENE -->
                <td class="px-6 py-4 text-lg font-medium text-gray-900 whitespace-nowrap dark:text-white border-r border-gray-200">
                <a :href="result.geneLink" target="_blank" rel="noopener noreferrer" class="text-blue-700 hover:underline">
                    {{ result.gene }}
                </a>
                </td>
                <!-- PubMed Article --> 
                <td class="px-24 py-4 border-r border-gray-200">{{ result.title || 'N/A' }}</td>
                <td class="px-6 py-4 border-r border-gray-200">
                <div v-if="result.functionKeywords && result.functionKeywords.length > 0" class="mb-2 flex flex-wrap gap-2">
                    <span v-for="keyword in result.functionKeywords" :key="keyword" class="px-2 py-1 text-xs font-bold font-sans text-blue-700 bg-blue-100 rounded">
                    {{ keyword }}
                    </span>
                </div>
                {{ result.function || 'N/A' }} <a :href="result.urlAccession" target="_blank" class="font-bold text-blue-600">[...]</a>
                </td>
                <td class="px-6 py-4 border-r border-gray-200">
                    <div v-if="result.mousePhenotype && Object.keys(result.mousePhenotype).length > 0" class="flex flex-wrap gap-2 justify-center">
                        <div v-for="(details, category) in result.mousePhenotype" :key="category" class="relative flex items-center gap-2">
                            <!-- Tooltip Trigger -->
                            <span v-html="details.icon" class="w-6 h-6 cursor-pointer" 
                                @mouseenter="showTooltip(details, $event)" 
                                @mouseleave="hideTooltip(details)">
                            </span>
                            
                            <!-- Tooltip -->
                            <div v-if="details.showTooltip" 
                                :style="{ top: `${details.tooltipY}px`, left: `${details.tooltipX}px`,transform: 'translate(-100%, 30%)' }"
                                class="absolute whitespace-nowrap bg-gray-800  text-white text-sm pointer-events-none font-bold rounded px-3 py-1 z-50 shadow-lg">
                                <span v-for="name in details.names" :key="name" class="block">{{ name }}</span>
                            </div>
                        </div>
                    </div>
                </td>

                <td class="px-6 py-4">{{ `${result.panelAppEnglandCount || 0} / ${result.panelAppAustraliaCount || 0}` }}</td>
            </tr>
            </tbody>
        </table>
        </div>
    </div>
    </main>
</template>

<script>
export default {
    name: "ResultModule",
    watch: {
    results(newResults) {
        console.log("Results received in ResultModule:", newResults);
        if (newResults && newResults.length > 0) {
            this.scrollToResults();
        }
    },
    },
    data() {
    return {
        showTooltipData: { names: [], category: null, x: 0, y: 0 }, // Store tooltip data, x, and y coordinates

    };
    },
    methods: {
        showTooltip(details, event) {
            const rect = event.target.getBoundingClientRect();
            console.log("Element rect:", rect);

            // Set tooltip state for the hovered item
            details.showTooltip = true;
            details.tooltipX = 0; // Correct calculation for x, considering scroll
            details.tooltipY = 0;
        },
        scrollToResults() {
        const resultsElement = document.getElementById("searchResults");
        if (resultsElement) {
            resultsElement.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
        },




        hideTooltip(details) {
            // Reset tooltip state
            details.showTooltip = false;
        },
        mounted() {
        // Initialize tooltip state for all details
        this.results.forEach(result => {
            if (result.mousePhenotype) {
                Object.values(result.mousePhenotype).forEach(details => {
                    details.showTooltip = false;
                    details.tooltipX = 0;
                    details.tooltipY = 0;
                });
            }
        });

        },









    
    },
    props: {
    results: {
        type: Array,
        default: () => [],
    },
    },
};
</script>

