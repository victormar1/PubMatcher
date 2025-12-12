<template>
  <div class="mt-10 px-20 font-noto">
    <SearchBuildingModule @search-complete="handleSearchComplete" :genes="genes" :phenotypes="phenotypes" />
  </div>
  <ResultModule :results="searchResults" />
</template>

<script>
import SearchBuildingModule from './SearchBuildingModule';
import ResultModule from './ResultModule';
import { onMounted, watch } from 'vue';
import {
  initPopovers
} from 'flowbite';

export default {
  name: 'SearchModule',
  components: {
    SearchBuildingModule,
    ResultModule,
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
  setup() {
    onMounted(() => {
      initPopovers(); // Initialize popovers on mount
    });
  },
  mounted() {
    const savedResults = sessionStorage.getItem('results');
    if (savedResults) {
      try {
        const parsedResults = JSON.parse(savedResults);
        this.searchResults = parsedResults.results || [];
      } catch (error) {
        console.error('Error parsing saved results:', error);
      }
    }
  },
  watch: {
    searchResults: {
      handler() {
        this.$nextTick(() => {
          initPopovers(); // Reinitialize popovers after table updates
        });
      },
      deep: true, // Watch for deep changes in searchResults
    },
  },
  methods: {
    handleSearchComplete(results) {
      this.searchResults = results;
      sessionStorage.setItem('results', JSON.stringify(results));
    },
  },
};
</script>
