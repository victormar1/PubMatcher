<template>
  <div class="mt-10 px-20 font-noto ">
    <SearchBuildingModule @search-complete="handleSearchComplete" :genes="genes" :phenotypes="phenotypes" />
  </div>
  <ResultModule :results="searchResults" />
</template>

<script>
import SearchBuildingModule from './SearchBuildingModule';
import ResultModule from './ResultModule';

export default {
  name: 'SearchModule',
  components: {
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
        console.error('Error parsing saved results:', error);
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
      sessionStorage.setItem('results', JSON.stringify(results));
    },
  },
};
</script>
