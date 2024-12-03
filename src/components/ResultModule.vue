<template>
    <main id="searchResults" class="flex px-20 my-10 w-full bg-transparent rounded-lg flex-grow flex-col"
        :class="{ 'hidden': !results || results.length === 0 }">
        <div class="flex justify-center">
            <p class="text-bold text-4xl font-mono font-bold underline pb-5  text-gray-700">RESULTS</p>
        </div>
        <!-- BACK TO TOP BUTTON -->
        <div>
            <button v-if="isScrolled" @click="scrollToTop"
                class="fixed bottom-20 right-1 p-3 z-50 bg-gray-800 text-white rounded-full hover:bg-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
                </svg>
            </button>
        </div>
        <div class="block">
            <div class="relative overflow-visible shadow-lg sm:rounded-lg">
                <table id="resultsTable"
                    class="w-full text-sm text-left rtl:text-right text-gray-500  rounded-3xl dark:text-gray-400 bg-gray-200">
                    <thead>
                        <tr>
                            <!-- Gene -->
                            <th scope="col"
                                class="px-6 py-3 text-center border-r border-gray-300 relative group cursor-pointer">
                                GENE
                                <div
                                    class="absolute whitespace-nowrap bg-gray-800 text-white text-sm font-bold rounded px-3 py-1 z-50 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -top-10 left-1/2 transform -translate-x-1/2">
                                    Gene name and GnomAd constraints
                                </div>
                            </th>

                            <!-- PubMatch -->
                            <th scope="col"
                                class="px-6 py-3 text-center border-r border-gray-300 relative group cursor-pointer"
                                @click="sortByPubMedCount">
                                PUBMATCH
                                <span>
                                    <svg v-if="sortDirection === 'asc'" xmlns="http://www.w3.org/2000/svg"
                                        class="h-4 w-4 inline-block" fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
                                    </svg>
                                    <svg v-else-if="sortDirection === 'desc'" xmlns="http://www.w3.org/2000/svg"
                                        class="h-4 w-4 inline-block" fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <line x1="5" y1="10" x2="19" y2="10" stroke-linecap="round" />
                                        <line x1="5" y1="14" x2="19" y2="14" stroke-linecap="round" />
                                    </svg>
                                </span>
                                <div
                                    class="absolute whitespace-nowrap bg-gray-800 text-white text-sm font-bold rounded px-3 py-1 z-50 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -top-10 left-1/2 transform -translate-x-1/2">
                                    Number of article for the Match & Name of First Publication
                                </div>
                            </th>

                            <!-- Function -->
                            <th scope="col"
                                class="px-6 py-3 text-center border-r border-gray-300 relative group cursor-pointer">
                                FUNCTION
                                <div
                                    class="absolute whitespace-nowrap bg-gray-800 text-white text-sm font-bold rounded px-3 py-1 z-50 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -top-10 left-1/2 transform -translate-x-1/2">
                                    Uniprot keywords , function & link
                                </div>
                            </th>

                            <!-- Phenotype KO -->
                            <th scope="col"
                                class="px-6 py-3 text-center border-r border-gray-300 relative group cursor-pointer">
                                PHENOTYPE KO
                                <div
                                    class="absolute whitespace-nowrap bg-gray-800 text-white text-sm font-bold rounded px-3 py-1 z-50 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -top-10 left-1/2 transform -translate-x-1/2">
                                    IMPC Signficant Phenotype on KO Mice
                                </div>
                            </th>


                                                        <!-- ClinVar Data -->
                                                        <th scope="col" class="px-6 py-3 text-center border-r border-gray-300 relative group cursor-pointer">
                                ClinVar LookUp
                                <div
                                    class="absolute whitespace-nowrap bg-gray-800 text-white text-sm font-bold rounded px-3 py-1 z-50 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -top-10 left-1/2 transform -translate-x-1/2">
                                    Variants P/PL or VUS repartition from ClinVar
                                </div>
                            </th>

                            <!-- Status -->
                            <th scope="col" class="px-6 py-3 text-center relative group cursor-pointer">
                                STATUS
                                <div
                                    class="absolute whitespace-nowrap bg-gray-800 text-white text-sm font-bold rounded px-3 py-1 z-50 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -top-10 left-2 transform -translate-x-1/2">
                                    Status on GeneCC & PanelApp Data
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="result in results" :key="result.gene"
                            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 ">
                            <!-- GENE -->
                            <td
                                class="px-6 py-4 text-lg text-center font-medium text-gray-900 whitespace-nowrap dark:text-white border-r border-gray-200">
                                <div class="flex flex-col items-center justify-center">
                                    <!-- Gene Name -->
                                    <a :href="result.gene ? `https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/${result.hgncId}` : '#'"
                                        target="_blank" rel="noopener noreferrer" class="relative">
                                        <p><em>{{ result.gene }}</em></p>
                                    </a>
                                    <!--  <p class="text-gray-500 text-sm font-light">{{ result.hgncId }}</p> -->

                                    <!-- Table for contraintes -->
                                    <div class="relative flex h-full items-center justify-center  "
                                        @click="toggleVersion">
                                        <div class="flex w-32 h-24 justify-center items-center ">
                                            <div class="relative  w-full  ">
                                                <!-- Top-Right Indicator -->
                                                <div v-if="result.constraintsDelta"
                                                    v-tooltip="{ content: 'Notable differences exist between V2 and V4 constraints <br/> Click to swap versions', html: true, placement: 'right' }"
                                                    class="absolute z-20 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full dark:border-gray-900 cursor-pointer"
                                                    style="top: 50%; left: 90%; transform: translateY(-50%);">
                                                    !
                                                </div>


                                            <!-- Grid for Constraints -->
                                            <div class="grid grid-cols-2 text-center text-xs border-blue-600 bg-gray-100 rounded-lg">
                                                <!-- pLI -->
                                                <div 
                                                    class="flex py-1.5 flex-col items-center justify-center border-t border-l rounded-tl-lg border-gray-400"
                                                    :class="displayVersion === 'v2' ? getConstraintColor(result.constraints_v2.pLI, 'pLI') : 'text-black'">
                                                    <p class="font-bold">pLI</p>
                                                    <p>{{ displayVersion === 'v2' ? result.constraints_v2.pLI : result.constraints_v4.pLI }}</p>
                                                </div>

                                                <!-- LOEUF -->
                                                <div 
                                                    class="flex py-1.5 flex-col items-center justify-center border-t border-l border-r rounded-tr-lg border-gray-400"
                                                    :class="displayVersion === 'v2' ? getConstraintColor(result.constraints_v2.oe_lof_upper, 'LOEUF') : 'text-black'">
                                                    <p class="font-bold">LOEUF</p>
                                                    <p>{{ displayVersion === 'v2' ? result.constraints_v2.oe_lof_upper : result.constraints_v4.oe_lof_upper }}</p>
                                                </div>

                                                <!-- Z_score -->
                                                <div class="flex py-1.5 flex-col items-center justify-center border-t border-l border-b rounded-bl-lg border-gray-400">
                                                    <p class="font-bold">Z_score</p>
                                                    <p>{{ displayVersion === 'v2' ? result.constraints_v2.mis_z : result.constraints_v4.mis_z }}</p>
                                                </div>

                                                <!-- MOEUF -->
                                                <div 
                                                    class="flex py-1.5 flex-col items-center justify-center border border-gray-400 rounded-br-lg"
                                                    :class="displayVersion === 'v2' ? getConstraintColor(result.constraints_v2.oe_mis_upper, 'MOEUF') : 'text-black'">
                                                    <p class="font-bold">MOEUF</p>
                                                    <p>{{ displayVersion === 'v2' ? result.constraints_v2.oe_mis_upper : result.constraints_v4.oe_mis_upper }}</p>
                                                </div>

                                                <div class="absolute inset-0 flex items-center justify-center select-none">
                                                    <div class="flex items-center justify-center">
                                                        <div class="bg-white border border-gray-300 rounded-full w-10 h-5 flex items-center justify-center">
                                                            <p class="text-gray-700 font-bold text-sm">{{ displayVersion }}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>


                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <!-- PubMed Article -->
                            <td class="flex w-96 py-4 pr-3 items-center border-r border-gray-200 hover:bg-blue-50 ">
                                <div
                                    class="w-32 h-32 flex items-center justify-center  border-green-500 hover:bg-blue-50">
                                    <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                        <!-- Background Circle -->
                                        <circle class="text-gray-300" cx="50" cy="50" r="25" stroke-width="5"
                                            :stroke="getColor(result.count)" fill="none" />
                                        <text x="50" y="50" fill="black" font-size="14" font-weight="bold"
                                            font-family="Arial, sans-serif" text-anchor="middle"
                                            dominant-baseline="middle" transform="rotate(90, 50, 50)">
                                            {{ result.count || 0 }}
                                        </text>
                                    </svg>
                                </div>
                                <div class="flex flex-col flex-grow items-center justify-center border-red-700 w-32 ">
                                    <div class="flex items-center justify-center">
                                        <a :href="result.url" target="_blank"
                                            class="underline text-blue-600 text-base font-medium flex items-center transition duration-200 hover:text-blue-800">
                                            {{ result.firstArticleTitle || 'N/A' }}
                                            <i class="fas fa-external-link-alt ml-2 text-xs"></i>
                                        </a>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 border-r border-gray-200">
                                <div v-if="result.bioProcessKeywordsOnly && result.bioProcessKeywordsOnly.length > 0"
                                    class="mb-2 flex flex-wrap gap-2">
                                <span v-for="keyword in result.bioProcessKeywordsOnly" :key="keyword"
                                        class="px-2 py-1 text-xs font-bold font-sans text-blue-700 bg-blue-100 rounded">
                                    {{ keyword }}
                                </span>
                                </div>

                                {{ result.geneFunction || 'N/A' }} <a :href="result.urlAccession" target="_blank"
                                    class="font-bold text-blue-600">[...]</a>
                            </td>
                            <td class="px-6 py-4 border-r border-gray-200">
                                <div v-if="result.mousePhenotypes && Object.keys(result.mousePhenotypes).length > 0"
                                    class="flex flex-wrap gap-2 justify-center">
                                    <div v-for="(details, category) in result.mousePhenotypes" :key="category"
                                        class="relative flex items-center gap-2">
                                        <!-- Tooltip Trigger -->
                                        <span v-html="details.icon" class="w-6 h-6 cursor-pointer"
                                            @mouseenter="showTooltip(details, $event)"
                                            @mouseleave="hideTooltip(details)">
                                        </span>
                                        <!-- Tooltip -->
                                        <div v-if="details.showTooltip"
                                            :style="{ top: `${details.tooltipY}px`, left: `${details.tooltipX}px`, transform: 'translate(-100%, 30%)' }"
                                            class="absolute whitespace-nowrap bg-gray-800  text-white text-sm pointer-events-none font-bold rounded px-3 py-1 z-50 shadow-lg">
                                            <span v-for="name in details.names" :key="name" class="block">{{ name
                                                }}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>

                      <!-- ClinVar Data Column -->
<td class="px-6 py-4 border-r border-gray-200">
    <!-- Titre P/LP -->
    <div class="text-center text-sm font-bold text-gray-800 mb-1">P/LP</div>
    <!-- Première Barre: LOFs et Missenses -->
    <div v-if="result.lofVariants + result.missenseVariants > 0" class="relative w-full h-6 bg-gray-300 rounded-lg overflow-hidden">
        <!-- LOF Section -->
        <div
            class="absolute top-0 left-0 h-full bg-red-500"
            :style="{ width: `${getPercentage(result.lofVariants, result.lofVariants + result.missenseVariants)}%` }"
            v-tooltip="{ content: `${result.lofVariants || 0} LOFs`, placement: 'top' }"
        ></div>

        <!-- Missense Section -->
        <div
            class="absolute top-0 right-0 h-full bg-blue-500"
            :style="{ width: `${getPercentage(result.missenseVariants, result.lofVariants + result.missenseVariants)}%` }"
            v-tooltip="{ content: `${result.missenseVariants || 0} Missenses`, placement: 'top' }"
        ></div>
    </div>
    <div v-else class="text-center text-xs text-gray-500">0</div>
    <!-- Labels pour la première barre -->
    <div v-if="result.lofVariants + result.missenseVariants > 0" class="flex justify-between text-xs mt-1">
        <span
            class="text-red-700 font-bold text-xs cursor-pointer"
            v-tooltip="{ content: `${result.lofVariants || 0} LOFs`, placement: 'top' }"
        >
            LOF
        </span>
        <span
            class="text-blue-700 font-bold text-xs cursor-pointer"
            v-tooltip="{ content: `${result.missenseVariants || 0} Missenses`, placement: 'top' }"
        >
            MS
        </span>
    </div>

    <!-- Titre VUS -->
    <div class="text-center text-sm font-bold text-gray-800 mt-3 mb-1">VUS</div>
    <!-- Deuxième Barre: LOF Unknowns et Missense Unknowns -->
    <div v-if="result.lofUnknown + result.missenseUnknown > 0" class="relative w-full h-6 bg-gray-300 rounded-lg overflow-hidden">
        <!-- LOF Unknown Section -->
        <div
            class="absolute top-0 left-0 h-full bg-red-300"
            :style="{ width: `${getPercentage(result.lofUnknown, result.lofUnknown + result.missenseUnknown)}%` }"
            v-tooltip="{ content: `${result.lofUnknown || 0} LOF Unknowns`, placement: 'top' }"
        ></div>

        <!-- Missense Unknown Section -->
        <div
            class="absolute top-0 right-0 h-full bg-blue-300"
            :style="{ width: `${getPercentage(result.missenseUnknown, result.lofUnknown + result.missenseUnknown)}%` }"
            v-tooltip="{ content: `${result.missenseUnknown || 0} Missense Unknowns`, placement: 'top' }"
        ></div>
    </div>
    <div v-else class="text-center text-xs text-gray-500">0</div>
    <!-- Labels pour la deuxième barre -->
    <div v-if="result.lofUnknown + result.missenseUnknown > 0" class="flex justify-between text-xs mt-1">
        <span
            class="text-red-500 font-bold text-xs cursor-pointer"
            v-tooltip="{ content: `${result.lofUnknown || 0} LOF Unknowns`, placement: 'top' }"
        >
            LOF
        </span>
        <span
            class="text-blue-500 font-bold text-xs cursor-pointer"
            v-tooltip="{ content: `${result.missenseUnknown || 0} Missense Unknowns`, placement: 'top' }"
        >
            MS
        </span>
    </div>
</td>






                            <td class="px-6 py-4 text-center">
                                <div :class="[getValidityColor(result.geneValidity)]"
                                    class="rounded-full text-white font-bold py-1 px-2 text-nowrap">
                                    <a :href="result.geneLink" target="_blank" rel="noopener noreferrer"
                                        class="text-white hover:underline">
                                        {{ result.geneValidity }}
                                    </a>
                                </div>
                                <!-- ATTRIBUTION !!! -->
                                <div class="flex flex-row justify-center gap-2">
                                    <a :href="result.gene ? `https://panelapp.genomicsengland.co.uk/panels/entities/${result.gene}` : '#'"
                                        target="_blank" rel="noopener noreferrer" class="relative">
                                        <div class="relative">
                                            <img src="/images/england.png" alt="England Flag" style="cursor: pointer;"
                                                width="50" />
                                            <div class="absolute inset-0 flex items-center justify-center">
                                                <div
                                                    class="bg-white rounded-full w-5 h-5 flex items-center justify-center">
                                                    <p class="text-gray-700 font-bold text-sm">
                                                        {{ result.panelAppEnglandCount || 0 }}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                    <a :href="result.gene ? `https://panelapp.agha.umccr.org/panels/entities/${result.gene}` : '#'"
                                        target="_blank" rel="noopener noreferrer" class="relative">
                                        <div class="relative">
                                            <img src="/images/australia.png" alt="Aussie Flag" style="cursor: pointer;"
                                                width="50" />
                                            <div class="absolute inset-0 flex items-center justify-center">
                                                <div
                                                    class="bg-white rounded-full w-5 h-5 flex items-center justify-center">
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
            displayVersion: "v2", // Default version
            isScrolled: false,

            deltaTooltip: {
                visible: false,
                text: '',
                x: 0,
                y: 0,
            },


        };
    },
    methods: {

        getConstraintColor(value, type) {
    // Remplacement des virgules par des points pour convertir en nombre valide
    const numericValue = parseFloat(value.replace(',', '.'));
    
    if (type === 'LOEUF' || type === 'MOEUF') {
        const thresholds = [
            { max: 0.26, color: 'bg-red-300' }, // Top 10%
            { max: 0.41, color: 'bg-red-200' }, // Top 20%
            { max: 0.48, color: 'bg-orange-200' }, // Top 25%
            { max: 0.55, color: 'bg-yellow-200' }, // Top 30%
        ];
        for (const { max, color } of thresholds) {
            if (numericValue <= max) {
                return color;
            }
        }
        return 'text-black';
    } else if (type === 'pLI') {
        return numericValue > 0.97 ? 'bg-red-300' : 'text-black';
    }
    return 'text-black';
},



        getPercentage(count, total) {
                if (total === 0) return '0';
                return ((count / total) * 100).toFixed(2); // Limite à 2 décimales
            },



        toggleVersion() {
            this.displayVersion = this.displayVersion === "v2" ? "v4" : "v2";
        },
        showTooltip(details, event) {
            const rect = event.target.getBoundingClientRect();

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
            if (count < 1) {
                return "lightGrey";
            } else if (count < 10) {
                return "rgb(251 147 147)";
            } else if (count < 100) {
                return "rgb(128 166 243)";
            } else if (count > 100) {
                return "grey";
            } else {
                return "red";
            }
        },
        getValidityColor(valid) {
            if (valid === 'Definitive') {
                return "bg-green-700"
            } else if (valid === 'Strong') {
                return "bg-green-500"
            } else if (valid === 'Moderate') {
                return "bg-green-400"
            } else if (valid === 'Supportive') {
                return "bg-blue-300"
            } else if (valid === 'Limited') {
                return "bg-red-500"
            } else if (valid === 'Disputed Evidence') {
                return "bg-red-600"
            } else if (valid === 'Refuted') {
                return "bg-red-900"
            } else if (valid === 'Animal') {
                return "bg-orange-300"
            } else if (valid === 'No Known') {
                return "bg-gray-500"
            } else if (valid === 'No Known Disease Relationship') {
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


        formatConstraint(value, thresholds) {
            const numericValue = parseFloat(value.replace(",", "."));
            for (const { max, color } of thresholds) {
                if (numericValue <= max) {
                    return color;
                }
            }
            return "black";
        },

        hideTooltip(details) {
            // Reset tooltip state
            details.showTooltip = false;
        },
        scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        },
        handleScroll() {
            this.isScrolled = window.scrollY > 500; //Appear limit
        },










    },
    props: {
        results: {
            type: Array,
            default: () => [],
        },
    },
    mounted() {
        window.addEventListener("scroll", this.handleScroll);
    },
    beforeDestroy() {
        window.removeEventListener("scroll", this.handleScroll);
    }
};
</script>
