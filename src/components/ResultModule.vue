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
                <th scope="col" class="px-6 py-3 text-center border-r border-gray-300 cursor-pointer" @click="sortByPubMedCount">
                    PUBMATCH
                    <span>
                        <svg
                            v-if="sortDirection === 'asc'"
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-4 w-4 inline-block"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                        <svg
                            v-else-if="sortDirection === 'desc'"
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-4 w-4 inline-block"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                        <svg
                            v-else
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-4 w-4 inline-block"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2">
                            <line x1="5" y1="10" x2="19" y2="10" stroke-linecap="round" />
                            <line x1="5" y1="14" x2="19" y2="14" stroke-linecap="round" />
                        </svg>
                    </span>
                </th>

                <th scope="col" class="px-6 py-3 text-center border-r border-gray-300">FUNCTION</th>
                <th scope="col" class="px-6 py-3 text-nowrap border-r border-gray-300">PHENOTYPE KO</th>
                <th scope="col" class="px-6 py-3 text-nowrap text-center">STATUS</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="result in results" :key="result.gene" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 ">
                <!-- GENE -->
                <td class="px-6 py-4 text-lg text-center font-medium text-gray-900 whitespace-nowrap dark:text-white border-r border-gray-200">
                    <div class="flex flex-col items-center justify-center">
                        <p>{{ result.gene }}</p>
                        <p class="text-gray-500 text-sm font-light">{{ result.hgncId }}</p>
                    </div>
                </td>





                
                <!-- PubMed Article --> 
                <td class="flex w-96 py-4 pr-3 items-center border-r border-gray-200 ">
                    <div class="w-32 h-32 flex items-center justify-center  border-green-500">
                        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <!-- Background Circle -->
                            <circle
                                class="text-gray-300"
                                cx="50"
                                cy="50"
                                r="25"
                                stroke-width="6"
                                stroke="lightgray"
                                fill="none"
                            />
                            <!-- Progress -->
                            <circle
                                class="text-blue-500"
                                cx="50"
                                cy="50"
                                r="25"
                                stroke-width="10"
                                :stroke="getColor(result.count)"
                                stroke-dasharray="157" 
                                :stroke-dashoffset="getDashOffset(result.count)"
                                stroke-linecap="round"
                                fill="none"
                            />
                            <text
                                x="50"
                                y="50"
                                fill="lightgray"
                                font-size="12"
                                font-weight="bold"
                                font-family="Arial, sans-serif"
                                text-anchor="middle"
                                dominant-baseline="middle"
                                transform="rotate(90, 50, 50)">
                                {{ result.count || 0 }}
                            </text>
                        </svg>
                    </div>
                    <div class="flex flex-col flex-grow items-center justify-center  border-red-700 w-32">
                        <div class="flex items-center justify-center">
                            <a :href="result.url" target="_blank" class="font-medium underline text-blue-600">
                                {{ result.title || 'N/A' }} 
                            </a>

                        </div>
                    </div>
                </td>
















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



                <td class="px-6 py-4 text-center">
                    <div :class="[getValidityColor(result.geneValidity)]" class="rounded-full text-white font-bold py-1 px-2 text-nowrap">
                        <a :href="result.geneLink" target="_blank" rel="noopener noreferrer" class="text-white hover:underline">
                            {{ result.geneValidity }}
                        </a>

                    </div>
                    <!-- ATTRIBUTION !!! -->
                    <div class="flex flex-row justify-center gap-2">
                        <a :href="result.gene ? `https://panelapp.genomicsengland.co.uk/panels/entities/${result.gene}` : '#'" target="_blank" rel="noopener noreferrer" class="relative">
                            <div class="relative">
                                <img src="/images/england.png" alt="England Flag" style="cursor: pointer;" width="50" />
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <div class="bg-white rounded-full w-5 h-5 flex items-center justify-center">
                                        <p class="text-gray-700 font-bold text-sm">
                                            {{ result.panelAppEnglandCount || 0 }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </a>
                        <a :href="result.gene ? `https://panelapp.agha.umccr.org/panels/entities/${result.gene}` : '#'" target="_blank" rel="noopener noreferrer" class="relative">
                            <div class="relative">
                                <img src="/images/australia.png" alt="Aussie Flag" style="cursor: pointer;" width="50" />
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <div class="bg-white rounded-full w-5 h-5 flex items-center justify-center">
                                        <p class="text-gray-700 font-bold text-sm">
                                            {{ result.panelAppAustraliaCount || 0 }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>
                </td>





                
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
        if (newResults && newResults.length > 0) {
            this.scrollToResults();
        }
        if (this.originalResults.length === 0) {
            this.originalResults = [...newResults];
        }
    },
    },
    data() {
    return {
        showTooltipData: { names: [], category: null, x: 0, y: 0 }, // Store tooltip data ?
        originalResults: [], // Store the original order
        sortDirection: 'default', // Start with 'default'


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

        getDashOffset(count) {
        const maxCount = 30000; 
        const progress = Math.min(count / maxCount, 1); 
        const circumference = 2 * Math.PI * 25;
        return circumference * (1 - progress); 
        },

        getColor(count) {
            if (count < 5) {
                return "Lime";
            } else if (count < 100) {
                return "yellow";
            } else if (count < 1000) {
                return "orange";
            } else {
                return "red";
            }
        },
        getValidityColor(valid){
            if(valid==='Definitive'){
                return "bg-green-700"
            }else if(valid==='Strong'){
                return "bg-green-500"
            }else if(valid==='Moderate'){
                return "bg-green-400"
            }else if(valid==='Supportive'){
                return "bg-blue-300"
            }else if(valid==='Limited'){
                return "bg-red-500"
            }else if(valid==='Disputed Evidence'){
                return "bg-red-600"
            }else if(valid==='Refuted'){
                return "bg-red-900"
            }else if(valid==='Animal'){
                return "bg-orange-300"
            }else if(valid==='No Known'){
                return "bg-gray-500"
            }
        },





        sortByPubMedCount() {
            this.sortDirection =
                this.sortDirection === 'default' ? 'asc' :
                this.sortDirection === 'asc' ? 'desc' : 'default'; 
            if (this.sortDirection === 'default') {
                this.results.splice(0, this.results.length, ...this.originalResults);
            } else if (this.sortDirection === 'asc') {
                this.results.sort((a, b) => a.count - b.count);
            } else if (this.sortDirection === 'desc') {
                this.results.sort((a, b) => b.count - a.count);
            };
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

