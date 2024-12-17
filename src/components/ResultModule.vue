<template>
    <main id="searchResults"
        class="flex px-20  w-full  flex-grow flex-col font-noto justify-center items-center  mb-10 pt-32  border-red-700"
        :class="{ 'hidden': !results || results.length === 0 }">
        <div
            class="flex justify-center flex-row items-center  bg-gray-800 w-42 rounded-t-3xl px-4  hover:bg-gray-700 select-none cursor-pointer">
            <svg v-if="results.length > 0" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                class="fill-gray-100 ">
                <path d="m12 17.586-7.293-7.293-1.414 1.414L12 20.414l8.707-8.707-1.414-1.414L12 17.586z" />
                <path d="m20.707 5.707-1.414-1.414L12 11.586 4.707 4.293 3.293 5.707 12 14.414l8.707-8.707z" />
            </svg>
            <p class="text-bold h-10 text-4xl z-10 font-semibold  pb-5  text-gray-100" @click="scrollToResults">
                RESULTS </p>
            <svg v-if="results.length > 0" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                class="fill-gray-100 ">
                <path d="m12 17.586-7.293-7.293-1.414 1.414L12 20.414l8.707-8.707-1.414-1.414L12 17.586z" />
                <path d="m20.707 5.707-1.414-1.414L12 11.586 4.707 4.293 3.293 5.707 12 14.414l8.707-8.707z" />
            </svg>
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
            <div class="drop-shadow-xl rounded-3xl ">
                <!-- Fixed spelling and applied overflow-hidden -->
                <table id="resultsTable" class="w-full text-sm text-left  text-gray-500 dark:text-gray-400 bg-gray-800">
                    <thead class="uppercase text-lg text-nowrap text-gray-200">
                        <tr>
                            <!-- Gene -->
                            <th scope="col"
                                class="px-6 py-3 text-center  border-gray-300 relative group cursor-default">
                                GENE
                                <div
                                    class="absolute whitespace-nowrap bg-gray-800 text-white text-sm font-bold px-3 py-1 z-50 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -top-10 left-1/2 transform -translate-x-1/2">
                                    Gene name and GnomAd constraints
                                </div>
                            </th>

                            <!-- PubMatch -->
                            <th scope="col" class="px-6 py-3 text-center border-gray-300 relative group cursor-pointer"
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
                                class="px-6 py-3 text-center  border-gray-300 relative group cursor-default">
                                FUNCTION
                                <div
                                    class="absolute whitespace-nowrap bg-gray-800 text-white text-sm font-bold rounded px-3 py-1 z-50 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -top-10 left-1/2 transform -translate-x-1/2">
                                    Uniprot keywords , function & link
                                </div>
                            </th>

                            <!-- Phenotype KO -->
                            <th scope="col"
                                class="px-6 py-3 text-center  border-gray-300 relative group cursor-default">
                                PHENOTYPE KO
                                <div
                                    class="absolute whitespace-nowrap bg-gray-800 text-white text-sm font-bold rounded px-3 py-1 z-50 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -top-10 left-1/2 transform -translate-x-1/2">
                                    IMPC Signficant Phenotype on KO Mice
                                </div>
                            </th>


                            <!-- ClinVar Data -->
                            <th scope="col"
                                class="px-6 py-3 text-center  border-gray-300 relative group cursor-default">
                                ClinVar LookUp
                                <div
                                    class="absolute whitespace-nowrap bg-gray-800 text-white text-sm font-bold rounded px-3 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -top-10 left-1/2 transform -translate-x-1/2">
                                    Variants P/PL or VUS repartition from ClinVar
                                </div>
                            </th>

                            <!-- Status -->
                            <th scope="col" class="px-6 py-3 text-center relative group cursor-default">
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
                            class="bg-white dark:bg-gray-800 dark:border-gray-700 odd:bg-white even:bg-gray-50 ">
                            <!-- GENE -->
                            <td
                                class="px-6 py-4 text-lg text-center font-medium text-gray-900 whitespace-nowrap dark:text-white  border-gray-200">
                                <div class="flex flex-col items-center justify-center">
                                    <!-- Gene Name -->
                                    <a :href="result.gene ? `https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/${result.hgncId}` : '#'"
                                        target="_blank" rel="noopener noreferrer" class="relative">
                                        <p><em>{{ result.gene }}</em></p>
                                    </a>
                                    <!--  <p class="text-gray-500 text-sm font-light">{{ result.hgncId }}</p> -->

                                    <!-- Table for contraintes -->
                                    <div class="relative flex h-full items-center justify-center cursor-pointer "
                                        @click="toggleVersion">
                                        <div class="flex w-32 h-24 justify-center items-center ">
                                            <div class="relative  w-full  ">
                                                <!-- Top-Right Indicator -->
                                                <div v-if="result.constraintsDelta">
                                                    <div :data-popover-target="'popover-const-' + result.gene"
                                                        data-popover-placement="right"
                                                        class="absolute inline-flex items-center z-10 justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2 dark:border-gray-900 cursor-pointer">
                                                        !
                                                    </div>
                                                </div>
                                                <div data-popover :id="'popover-const-' + result.gene" role="tooltip"
                                                    class="absolute z-20  inline-block invisible opacity-0 text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm  dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800">
                                                    <div
                                                        class="px-3 py-2   bg-gray-100 border-b border-gray-200 rounded-t-lg dark:border-gray-600 dark:bg-gray-700 flex flex-row space-x-2">
                                                        <svg class="w-5 h-5 text-red-500 dark:text-white"
                                                            aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                                            width="24" height="24" fill="currentColor"
                                                            viewBox="0 0 24 24">
                                                            <path fill-rule="evenodd"
                                                                d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0V8Zm-1 7a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H12Z"
                                                                clip-rule="evenodd" />
                                                        </svg>
                                                        <h3 class="font-semibold text-gray-900 dark:text-white">
                                                            Constraints warning</h3>

                                                    </div>
                                                    <div class="px-3 py-2 text-nowrap">
                                                        <p>Significant differences detected in constraints.
                                                        </p>
                                                    </div>
                                                    <div data-popper-arrow class="pr-2">
                                                    </div>
                                                </div>
                                                <div
                                                    class="grid grid-cols-2 text-center text-xs border-blue-600 bg-gray-100 rounded-lg">
                                                    <!-- pLI -->
                                                    <div class="flex py-1.5 flex-col items-center justify-center border-t border-l rounded-tl-lg border-gray-400"
                                                        :class="displayVersion === 'v2' ? getConstraintColor(result.constraints_v2.pLI, 'pLI') : 'text-black'">
                                                        <p class="font-bold">pLI</p>
                                                        <p>{{ displayVersion === 'v2' ? result.constraints_v2.pLI :
                                                            result.constraints_v4.pLI }}</p>
                                                    </div>

                                                    <!-- LOEUF -->
                                                    <div class="flex py-1.5 flex-col items-center justify-center border-t border-l border-r rounded-tr-lg border-gray-400"
                                                        :class="displayVersion === 'v2' ? getConstraintColor(result.constraints_v2.oe_lof_upper, 'LOEUF') : 'text-black'">
                                                        <p class="font-bold">LOEUF</p>
                                                        <p>{{ displayVersion === 'v2' ?
                                                            result.constraints_v2.oe_lof_upper :
                                                            result.constraints_v4.oe_lof_upper }}</p>
                                                    </div>

                                                    <!-- Z_score -->
                                                    <div
                                                        class="flex py-1.5 flex-col items-center justify-center border-t border-l border-b rounded-bl-lg border-gray-400">
                                                        <p class="font-bold">Z_score</p>
                                                        <p>{{ displayVersion === 'v2' ? result.constraints_v2.mis_z :
                                                            result.constraints_v4.mis_z }}</p>
                                                    </div>

                                                    <!-- MOEUF -->
                                                    <div class="flex py-1.5 flex-col items-center justify-center border border-gray-400 rounded-br-lg"
                                                        :class="displayVersion === 'v2' ? getConstraintColor(result.constraints_v2.oe_mis_upper, 'MOEUF') : 'text-black'">
                                                        <p class="font-bold">MOEUF</p>
                                                        <p>{{ displayVersion === 'v2' ?
                                                            result.constraints_v2.oe_mis_upper :
                                                            result.constraints_v4.oe_mis_upper }}</p>
                                                    </div>

                                                    <div
                                                        class="absolute inset-0 flex items-center justify-center select-none">
                                                        <div class="flex items-center justify-center">
                                                            <div
                                                                class="bg-white border border-gray-300 rounded-full w-10 h-5 flex items-center justify-center">
                                                                <p class="text-gray-700 font-bold text-sm">{{
                                                                    displayVersion }}</p>
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
                            <td class=" w-96 py-4 pr-3   border-gray-200 hover:bg-gray-100 "
                                :data-popover-target="'popover-pubmatch-' + result.firstArticleTitle"
                                data-popover-placement="right">
                                <div class="flex flex-row items-center justify-center">
                                    <div
                                        class="w-32 h-32 flex items-center justify-center  border-green-500 hover:bg-blue-50">
                                        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                            <!-- Background Circle -->
                                            <circle class="text-gray-300" cx="50" cy="50" r="25" stroke-width="5"
                                                :stroke="getColor(result.count)" fill="none" />

                                        </svg>
                                        <count-up :end-val="result.count" :duration="1.5" :delay="10" :easing="linear"
                                            class="absolute font-bold"></count-up>
                                    </div>
                                    <div
                                        class="flex flex-col flex-grow items-center justify-center  border-red-700 w-32 ">
                                        <div class="flex items-center justify-center">
                                            <a :href="result.url" target="_blank"
                                                class="underline text-blue-600 text-base font-medium flex items-center transition duration-200 hover:text-blue-800">
                                                {{ result.firstArticleTitle || 'N/A' }}
                                                <i class="fas fa-external-link-alt ml-2 text-xs"></i>
                                            </a>
                                        </div>

                                        <div data-popover :id="'popover-pubmatch-' + result.firstArticleTitle"
                                            role="tooltip"
                                            class="absolute z-10 invisible opacity-0 inline-block w-64 text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm  dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800">
                                            <div
                                                class="px-3 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg dark:border-gray-600 dark:bg-gray-700">
                                                <h3 class="font-semibold text-gray-900 dark:text-white">ALTERNATIVE
                                                    RESULTS
                                                </h3>
                                            </div>
                                            <div class=" ">
                                                <div
                                                    class="border-b border-gray-200 flex flex-row space-x-2 items-center hover:bg-blue-100">
                                                    <div>
                                                        <svg class="w-6 h-6  text-gray-500 dark:text-white"
                                                            aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                                            width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                            <path stroke="currentColor" stroke-linecap="round"
                                                                stroke-linejoin="round" stroke-width="2"
                                                                d="M13.213 9.787a3.391 3.391 0 0 0-4.795 0l-3.425 3.426a3.39 3.39 0 0 0 4.795 4.794l.321-.304m-.321-4.49a3.39 3.39 0 0 0 4.795 0l3.424-3.426a3.39 3.39 0 0 0-4.794-4.795l-1.028.961" />
                                                        </svg>
                                                    </div>

                                                    <p>RMI1 facilitates repair of ionizing radiation-induced DNA damage
                                                        and maintenance of genomic stability.</p>
                                                </div>
                                                <div
                                                    class="border-b border-gray-200 flex flex-row space-x-2 items-center">
                                                    <div>
                                                        <svg class="w-6 h-6  text-gray-500 dark:text-white"
                                                            aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                                            width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                            <path stroke="currentColor" stroke-linecap="round"
                                                                stroke-linejoin="round" stroke-width="2"
                                                                d="M13.213 9.787a3.391 3.391 0 0 0-4.795 0l-3.425 3.426a3.39 3.39 0 0 0 4.795 4.794l.321-.304m-.321-4.49a3.39 3.39 0 0 0 4.795 0l3.424-3.426a3.39 3.39 0 0 0-4.794-4.795l-1.028.961" />
                                                        </svg>
                                                    </div>
                                                    <p>RMI1 contributes to DNA repair and to the tolerance to
                                                        camptothecin.</p>
                                                </div>
                                                <div
                                                    class="border-b border-gray-200 flex flex-row space-x-2 items-center">
                                                    <div>
                                                        <svg class="w-6 h-6  text-gray-500 dark:text-white"
                                                            aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                                            width="24" height="24" fill="none" viewBox="0 0 24 24">
                                                            <path stroke="currentColor" stroke-linecap="round"
                                                                stroke-linejoin="round" stroke-width="2"
                                                                d="M13.213 9.787a3.391 3.391 0 0 0-4.795 0l-3.425 3.426a3.39 3.39 0 0 0 4.795 4.794l.321-.304m-.321-4.49a3.39 3.39 0 0 0 4.795 0l3.424-3.426a3.39 3.39 0 0 0-4.794-4.795l-1.028.961" />
                                                        </svg>
                                                    </div>
                                                    <p>
                                                        Phenotypic spectrum of BLM- and RMI1-related Bloom syndrome.
                                                    </p>
                                                </div>
                                            </div>
                                            <div data-popper-arrow></div>
                                        </div>
                                    </div>
                                </div>
                            </td>








                            <td class="px-6 py-4  border-gray-200">
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
                            <td class="relative px-6 py-4 border-gray-200">
                                <!-- Mouse Phenotype Tooltips -->
                                <div v-if="result.mousePhenotypes && Object.keys(result.mousePhenotypes).length > 0"
                                    class="relative flex flex-wrap gap-2 justify-center drop-shadow z-50">
                                    <div v-for="(details, category) in result.mousePhenotypes" :key="category"
                                        class="relative flex items-center gap-2">
                                        <!-- Tooltip Trigger -->
                                        <span v-html="details.icon" class="w-6 h-6 cursor-pointer text-gray-600"
                                            :data-popover-target="'popover-mouseKO-' + result.gene + '-' + category">
                                        </span>
                                        <!-- Tooltip -->
                                        <div :id="'popover-mouseKO-' + result.gene + '-' + category" role="tooltip"
                                            data-popover
                                            class="absolute z-50 invisible opacity-0 text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800 top-8 left-1/2 -translate-x-1/2">
                                            <div
                                                class="px-3 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg dark:border-gray-600 dark:bg-gray-700">
                                                <h3
                                                    class="font-bold text-gray-800 font-noto dark:text-white text-nowrap">
                                                    {{ formatCategory(category) }}
                                                </h3>
                                            </div>
                                            <div class="px-3 py-2">
                                                <ul class="list-disc space-y-1">
                                                    <li v-for="name in details.names" :key="name"
                                                        class="inline-flex px-2 justify-center items-center bg-blue-200 rounded-full">
                                                        <p class="text-gray-700 font-bold font-noto text-nowrap">{{ name
                                                            }}</p>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div data-popper-arrow></div>
                                        </div>
                                    </div>
                                </div>
                            </td>

                            <!-- ClinVar Data -->
                            <td class="relative px-6 py-4 border-gray-200 z-10">
                                <!-- ClinVar Visualizers -->
                                <div class="flex h-36 flex-row justify-center">
                                    <!-- P/LP Graph -->
                                    <div class="relative z-10 w-20 drop-shadow"
                                        :data-popover-target="'popover-graph-' + result.gene">
                                        <ClinVarVizualiser
                                            :variantData="[result.lofVariants, result.missenseVariants, result.lofUnknown, result.missenseUnknown]" />
                                    </div>

                                    <!-- VUS Graph -->
                                    <div class="relative z-10 w-10 drop-shadow"
                                        :data-popover-target="'popover-vus-' + result.gene">
                                        <VUSVizualiser :variantData="[result.lofUnknown, result.missenseUnknown]" />
                                    </div>

                                    <!-- P/LP Popover -->
                                    <div data-popover :id="'popover-graph-' + result.gene" role="tooltip"
                                        class="absolute z-50 invisible opacity-0 inline-block text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800">
                                        <div
                                            class="px-3 py-2 bg-gray-100 border-b border-gray-200 dark:border-gray-600 dark:bg-gray-700">
                                            <h3
                                                class="font-bold text-gray-800 font-noto text-center dark:text-white text-nowrap">
                                                P/LP
                                            </h3>
                                        </div>
                                        <div
                                            class="px-3 py-2 flex flex-row justify-center items-center bg-white border-b border-gray-200 dark:border-gray-600 dark:bg-gray-700">
                                            <div>
                                                <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg"
                                                    class="text-rose-400">
                                                    <rect width="100" height="100" fill="currentColor" />
                                                </svg>
                                            </div>
                                            <h3 class="font-bold text-gray-700 font-noto dark:text-white">LOF: {{
                                                result.lofVariants }}</h3>
                                        </div>
                                        <div
                                            class="px-3 py-2 flex flex-row items-center bg-white border-b border-gray-200 dark:border-gray-600 dark:bg-gray-700">
                                            <div>
                                                <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg"
                                                    class="text-blue-400">
                                                    <rect width="100" height="100" fill="currentColor" />
                                                </svg>
                                            </div>
                                            <h3 class="font-bold text-gray-700 font-noto dark:text-white">Missense: {{
                                                result.missenseVariants }}</h3>
                                        </div>
                                        <div data-popper-arrow class="bg-gray-100"></div>
                                    </div>

                                    <!-- VUS Popover -->
                                    <div data-popover :id="'popover-vus-' + result.gene" role="tooltip"
                                        class="absolute z-50 invisible opacity-0 inline-block text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800">
                                        <div
                                            class="px-3 py-2 bg-gray-100 border-b border-gray-200 dark:border-gray-600 dark:bg-gray-700">
                                            <h3
                                                class="font-bold text-gray-800 font-noto text-center dark:text-white text-nowrap">
                                                VUS
                                            </h3>
                                        </div>
                                        <div
                                            class="px-3 py-2 flex flex-row justify-center items-center bg-white border-b border-gray-200 dark:border-gray-600 dark:bg-gray-700">
                                            <div>
                                                <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg"
                                                    class="text-rose-400">
                                                    <rect width="100" height="100" fill="currentColor" />
                                                </svg>
                                            </div>
                                            <h3 class="font-bold text-gray-700 font-noto dark:text-white">LOF: {{
                                                result.lofUnknown }}</h3>
                                        </div>
                                        <div
                                            class="px-3 py-2 flex flex-row items-center bg-white border-b border-gray-200 dark:border-gray-600 dark:bg-gray-700">
                                            <div>
                                                <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg"
                                                    class="text-blue-400">
                                                    <rect width="100" height="100" fill="currentColor" />
                                                </svg>
                                            </div>
                                            <h3 class="font-bold text-gray-700 font-noto dark:text-white">Missense: {{
                                                result.missenseUnknown }}</h3>
                                        </div>
                                        <div data-popper-arrow class="bg-gray-100"></div>
                                    </div>
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
                                <div>
                                    <!-- Check if result.mim has at least one item -->

                                    <!-- Link to OMIM if result.omimId exists -->
                                    <a :href="result.omimId ? `https://omim.org/entry/${result.omimId}` : '#'"
                                        target="_blank" rel="noopener noreferrer" class="relative">
                                        <span v-if="result.mim && result.mim.length > 0"
                                            class="text-green-600 font-bold">
                                            MORBID
                                        </span>
                                        <span v-else class="text-red-600 font-bold">
                                            NO MORBID
                                        </span>
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
import ClinVarVizualiser from './ClinVarVizualiser.vue';
import CountUp from 'vue-countup-v3'
import VUSVizualiser from './VUSVizualiser.vue';


export default {
    name: "ResultModule",
    components: {
        ClinVarVizualiser,
        VUSVizualiser,
        CountUp,
    },

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

        formatCategory(cat) {
            let newline = ''
            newline = cat.replace('_phenotype', '')
            newline = newline.replace(/_/g, ' ');
            newline = newline.charAt(0).toUpperCase() + newline.slice(1)
            return newline
        },

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

            details.showTooltip = true;
            details.tooltipX = 0;
            details.tooltipY = 0;
        },
        scrollToResults() {
            const resultsElement = document.getElementById("searchResults");
            if (resultsElement) {
                resultsElement.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });

                const offset = 45;
                const elementPosition = resultsElement.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({
                    top: elementPosition - offset,
                    behavior: "smooth",
                });
            }
        }
        ,

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
