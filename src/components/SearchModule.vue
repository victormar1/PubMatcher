<template>
    <span class="relative flex mt-3 justify-center mb-20">
            <div class="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-transparent bg-gradient-to-r from-transparent via-gray-500 to-transparent opacity-75"></div>
            <span class="relative z-10 bg-white px-6 font-bold font-nono text-gray-700 text-5xl ">SEARCH ENGINE</span>
    </span>
    <div>
        <SearchBuildingModule @search-complete="handleSearchComplete"
        :genes="genes" 
        :phenotypes="phenotypes" />
    </div>
    <ResultModule :results="searchResults" />  
</template>

<script>
import ExtractionModule from "./ExtractionModule";
import SearchBuildingModule from "./SearchBuildingModule";
import ResultModule from "./ResultModule";


export default {
    name: "SearchModule",
    components: {
        ExtractionModule,
        SearchBuildingModule,
        ResultModule,
    },
    mounted() {
    const savedResults = sessionStorage.getItem('results');
    if (savedResults) {
        try {
            const parsedResults = JSON.parse(savedResults);
            // Extract the array if the data is wrapped in an object
            this.searchResults = parsedResults.results || [];
        } catch (error) {
            console.error("Error parsing saved results:", error);
        }
    }
    },
    props: {
        genes: { type: Array, default: () => [] },
        phenotypes: { type: Array, default: () => [] },
    },
    data() {
        return {
        searchResults: [], // Initialize searchResults
        };
    },
    methods: {
        handleSearchComplete(results) {
            this.searchResults = results;
            console.log(results)
            sessionStorage.setItem('results', JSON.stringify(results));
        },
    },
    };
</script>