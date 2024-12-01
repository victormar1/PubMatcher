<template>
  <div class="flex flex-col gap-3 justify-center min-w-[790px]"
    @click.capture="hideSuggestions('geneSuggestions'); hideSuggestions('phenotypeSuggestions')">
    <!-- EXTRACTION -->
    <div>
      <!-- EXTRACTION -->
      <div class="flex flex-row items-center border-blue-600">
        <label for="batch" class="block text-3xl ml-10  font-bold text-gray-700">
          EXTRACT FROM TEXT
        </label>
        <!-- TOOLTIP CONT -->
        <div class="group flex z-10 relative ml-3">
          <button
            class="text-gray-600 transition-colors duration-200 focus:outline-none dark:text-gray-200 dark:hover:text-red-400 hover:text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
              stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </button>
          <!-- Tooltip -->
          <span
            class="group-hover:opacity-100 transition-opacity duration-300 bg-gray-700 text-white text-1xl font-sans italic font-medium rounded-lg px-3 py-2 shadow-lg ml-4 absolute left-1/2 translate-x-3 -translate-y-5 opacity-0 mt-2 whitespace-nowrap">
            Extract genes from raw text, file, url, webpage or SeqOne.
          </span>
        </div>
        <button class="ml-auto px-4 py-1 mr-5 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600"
          @click="clearWholeResearch">
          Clear Research
        </button>
      </div>
      <div class="flex flex-row mx-2">
        <!-- BATCH INPUT | EXTRACT BUTTONS -->
        <div class="relative w-full overflow-auto h-56">
          <textarea id="batchInput" v-model="batchInput" rows="4"
            class="block p-2.5 pb-12 w-full h-full resize-none text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Paste your genes here..."></textarea>
          <div class="absolute bottom-2 right-4 flex space-x-2">
            <button id="submitTextArea" @click="extractGeneFromBatch" type="button"
              class="flex items-center px-4 py-2 bg-gray-800 hover:bg-blue-600 text-white font-medium rounded-md space-x-2">
              <svg class="w-6 h-6 text-white dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd"
                  d="M9.586 2.586A2 2 0 0 1 11 2h2a2 2 0 0 1 2 2v.089l.473.196.063-.063a2.002 2.002 0 0 1 2.828 0l1.414 1.414a2 2 0 0 1 0 2.827l-.063.064.196.473H20a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-.089l-.196.473.063.063a2.002 2.002 0 0 1 0 2.828l-1.414 1.414a2 2 0 0 1-2.828 0l-.063-.063-.473.196V20a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-.089l-.473-.196-.063.063a2.002 2.002 0 0 1-2.828 0l-1.414-1.414a2 2 0 0 1 0-2.827l.063-.064L4.089 15H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h.09l.195-.473-.063-.063a2 2 0 0 1 0-2.828l1.414-1.414a2 2 0 0 1 2.827 0l.064.063L9 4.089V4a2 2 0 0 1 .586-1.414ZM8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
                  clip-rule="evenodd" />
              </svg>
              <span>Extract Genes</span>
            </button>
            <button id="clearTextArea" @click="clearBatchInput" type="button"
              class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md">
              Clear
            </button>
          </div>
        </div>
        <!-- DRAG FILE ZONE -->
        <div
          class="flex flex-col items-center justify-center h-56 mb-3 ml-3 max-w-lg text-center bg-gray-50 border-2 border-gray-300 border-dashed cursor-pointer dark:bg-gray-900 dark:border-gray-700 rounded-xl"
          @dragover.prevent @dragenter.prevent @drop.prevent="handleFileDrop">
          <!-- Clickable Label for File Input -->
          <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-full cursor-pointer">
            <!-- SVG Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="w-8 h-8 text-gray-500 dark:text-gray-400">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>

            <!-- Text Content -->
            <h2 class="mt-1 font-medium tracking-wide text-gray-700 dark:text-gray-200">
              Drop File Here
            </h2>
            <p class="mt-2 text-xs tracking-wide text-gray-500 dark:text-gray-400">
              Upload or drag & drop your file TXT, CSV or XML.
            </p>
          </label>

          <!-- Hidden File Input -->
          <input id="dropzone-file" type="file" class="hidden" @change="handleFileUpload" />
        </div>
      </div>
    </div>
    <!-- GENES AND PHENOTYPES -->
    <div class="flex flex-row h-full gap-2 min-h-72 mx-2 ">
      <!-- GENES -->
      <div
        class="flex flex-col w-1/2 min-w-[350px] justify-start items-center bg-gray-50  border border-gray-300 rounded-lg p-4 ">
        <div class="flex flex-row justify-between items-center  w-full">
          <button @click="clearContainer('gene')">
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
              width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
            </svg>
          </button>
          <form @submit.prevent class="w-2/3 ">

            <label for="default-search"
              class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white ">Search</label>
            <div class="relative">
              <!-- Search logo -->
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>

              <!-- Search input -->
              <input type="search" ref="geneInput" id="geneInput"
                class="block w-full h-full p-4 pl-10 text-base text-gray-900 border shadow-inner border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none"
                placeholder="Add Genes..." @input="debouncedShowSuggestions('gene')"
                @keydown.enter.prevent="addFreeGene" autocomplete="off" required />

              <!-- Search button -->
              <button type="button" id="addPhenotypeButton" @click="addFreeGene()"
                class="text-white absolute right-2 bottom-2 bg-gray-800 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                <p class="text-white">Add</p>
              </button>

              <!-- Suggestion dropdown -->
              <ul id="geneSuggestions"
                class="absolute w-full bg-white border border-gray-300 rounded-lg mt-1 hidden max-h-60 overflow-y-auto shadow-lg z-10 top-full">
              </ul>
            </div>
          </form>
          <div class="w-6">
          </div>
        </div>
        <div class="flex flex-col items-center mt-2 space-y-4 rounded max-h-48 overflow-auto  p-4">
          <!-- GENES PLACEHOLDERS -->
          <div class="flex flex-wrap gap-2 p-4 gene-items ">
            <!-- GENES POPULATE HERE -->
          </div>
        </div>
      </div>
      <!-- DIVIDER -->




      <div class=" bg-gray-300 w-0.5">
      </div>







      <!-- PHENOTYPES -->
      <div
        class="flex flex-col w-1/2 min-w-[410px] justify-start items-center bg-gray-50  border border-gray-300 rounded-lg p-4 ">
        <div class="flex flex-row justify-between items-center  w-full">
          <div class="w-6">
          </div>
          <form class="w-2/3">
            <label for="default-search"
              class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
            <div class="relative">
              <!-- Search logo -->
              <div class="absolute inset-y-0 left-0 flex  items-center pl-3 pointer-events-none">
                <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>

              <!-- Search input -->
              <input type="search" id="phenotypeInput" ref="phenotypeInput"
                class="block w-full h-full p-4 pl-10 text-base shadow-inner text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none"
                placeholder="Add phenotypes..." @input="debouncedShowSuggestions('phenotype')" autocomplete="off"
                @keydown.enter.prevent="addFreePhenotype" required />
              <!-- Search button -->
              <button type="button" id="addPhenotypeButton" @click="addFreePhenotype()"
                class="text-white absolute right-2 bottom-2 bg-gray-800 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                <p class="text-white">Add</p>
              </button>
              <ul id="phenotypeSuggestions"
                class="absolute w-full bg-white border border-gray-300 rounded-lg mt-1 hidden max-h-60 overflow-y-auto shadow-lg z-10 top-full">
              </ul>

              <!-- Suggestion dropdown -->
              <ul id="suggestions"
                class="absolute w-full bg-white border border-gray-300 rounded-lg mt-1 hidden max-h-60 overflow-y-auto shadow-lg z-10">
                <!-- Suggestions will be dynamically generated here -->
              </ul>
            </div>
          </form>
          <button @click="clearContainer('phenotype')">
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
              width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
            </svg>
          </button>
        </div>



        <div class="flex flex-col items-center mt-2 space-y-4 rounded max-h-48  overflow-auto  p-4">
          <!-- PHENOTYPES PLACEHOLDERS -->
          <div class="flex flex-wrap gap-2 p-4 phenotype-items ">
            <!-- PHENOTYPES POPULATE HERE -->
          </div>
        </div>
      </div>
    </div>
    <!-- RESEARCHED BUTTON -->
    <div class="flex flex-row justify-center mx-2 ">
      <button type="button" id="researchButton" @click="reasearch"
        class="text-white  bg-gray-800 hover:bg-blue-800 w-full justify-center  focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm  py-2.5 text-center inline-flex items-center h-24 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
        <svg class="loader w-12 h-12 text-white dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
          width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-width="2"
            d="M8.737 8.737a21.49 21.49 0 0 1 3.308-2.724m0 0c3.063-2.026 5.99-2.641 7.331-1.3 1.827 1.828.026 6.591-4.023 10.64-4.049 4.049-8.812 5.85-10.64 4.023-1.33-1.33-.736-4.218 1.249-7.253m6.083-6.11c-3.063-2.026-5.99-2.641-7.331-1.3-1.827 1.828-.026 6.591 4.023 10.64m3.308-9.34a21.497 21.497 0 0 1 3.308 2.724m2.775 3.386c1.985 3.035 2.579 5.923 1.248 7.253-1.336 1.337-4.245.732-7.295-1.275M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
        </svg>
        <p class="text-white text-3xl genes-count">RESEARCH 0 GENES</p>
        <div role="status" class="flex items-center">
          <svg class="loader w-12 h-12 text-white dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-width="2"
              d="M8.737 8.737a21.49 21.49 0 0 1 3.308-2.724m0 0c3.063-2.026 5.99-2.641 7.331-1.3 1.827 1.828.026 6.591-4.023 10.64-4.049 4.049-8.812 5.85-10.64 4.023-1.33-1.33-.736-4.218 1.249-7.253m6.083-6.11c-3.063-2.026-5.99-2.641-7.331-1.3-1.827 1.828-.026 6.591 4.023 10.64m3.308-9.34a21.497 21.497 0 0 1 3.308 2.724m2.775 3.386c1.985 3.035 2.579 5.923 1.248 7.253-1.336 1.337-4.245.732-7.295-1.275M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
          </svg>
          <span class="sr-only">Loading...</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script>
import { event } from 'vue-gtag';

export default {
  name: 'SearchBuildingModule',
  props: {
    genes: { type: Array, default: () => [] },
    phenotypes: { type: Array, default: () => [] },
  },
  data() {
    return {
      genesInput: this.genes.join(', '),
      phenotypesInput: this.phenotypes.join(', '),
      genesList: [],
      batchInput: '',
      extractedGenes: [],
    };
  },

  mounted() {

    // Initialize sessionStorage
    if (!sessionStorage.getItem('data')) {
      sessionStorage.setItem(
        'data',
        JSON.stringify([
          { type: 'gene', items: [] },
          { type: 'phenotype', items: [] },
        ])
      );
    }

    this.displayItems('gene');
    this.displayItems('phenotype');

    if (this.genes.length || this.phenotypes.length) {
      this.searchFromUrl();
    }

    this.fetchGenesListAndCache(); // Load genes list
  },
  created() {
    this.debouncedShowSuggestions = this.debounce(this.showSuggestions, 300);
  },
  methods: {
    async searchFromUrl() {
      const queryData = {
        genes: this.genesInput.split(',').map((g) => g.trim()),
        phenotypes: this.phenotypesInput.split(',').map((p) => p.trim()),
      };
      let count = 0;
      for (const i in this.genes) {
        count++;
      }
      document.querySelector(
        '.genes-count'
      ).textContent = `RESEARCH ${count} GENES`;

      try {
        this.startLoader();
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(queryData),
        });

        const data = await response.json();
        this.$emit('search-complete', data.results || []);
        this.stopLoader();
      } catch (error) {
        console.error('Error during search:', error);
      }
    },
    async showSuggestions(type) {
      const inputField = document.getElementById(
        type === 'gene' ? 'geneInput' : 'phenotypeInput'
      );
      const suggestionsContainer = document.getElementById(
        type === 'gene' ? 'geneSuggestions' : 'phenotypeSuggestions'
      );
      const query = inputField.value.trim();

      suggestionsContainer.innerHTML = ''; // Clear previous suggestions

      if (query) {
        try {
          const terms =
            type === 'gene'
              ? await this.fetchGenesAPI(query)
              : await this.fetchPhenotypesAPI(query);
          if (terms.length > 0) {
            terms.forEach((term) => {
              const listItem = document.createElement('li');
              listItem.textContent = term.name;
              listItem.className = 'p-2 hover:bg-blue-100 cursor-pointer';
              listItem.onclick = () => this.selectItem(type, term.name);
              suggestionsContainer.appendChild(listItem);
            });
            suggestionsContainer.classList.remove('hidden');
          } else {
            suggestionsContainer.classList.add('hidden');
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          suggestionsContainer.classList.add('hidden');
        }
      } else {
        suggestionsContainer.classList.add('hidden'); // Hide if query is empty
      }
    },
    async fetchGenesAPI(query) {
      try {
        const apiUrl = `https://clinicaltables.nlm.nih.gov/api/ncbi_genes/v3/search?terms=${encodeURIComponent(
          query
        )}&maxList=10`; //CORS BYPASS NEED TO CHANGE BEFORE PROD
        const response = await fetch(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
            Origin: 'http://localhost:3000',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch data for gene symbol ${query}`);
        }

        let data = await response.json();
        const geneSymbols = data[3].map((gene) => ({
          name: gene[3],
        }));
        // Return data in the same structure as fetchPhenotypesAPI
        return geneSymbols;
      } catch (error) {
        console.error('Fetch error:', error);
        return []; // Return an empty array on error
      }
    },
    async fetchPhenotypesAPI(query) {
      try {
        const response = await fetch(
          `https://ontology.jax.org/api/hp/search?q=${encodeURIComponent(
            query
          )}&page=0&limit=10`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch data from OLS API');
        }
        const data = await response.json();
        return data.terms;
      } catch (error) {
        console.error('Fetch error:', error);
        return []; // Return an empty array on error
      }
    },
    selectItem(type, itemName) {
      if (type === 'gene') {
        this.addGene(itemName); // Use the selected item's name
      } else if (type === 'phenotype') {
        this.addPhenotype(itemName); // Use the selected item's name
      }
      const inputField = document.getElementById(
        type === 'gene' ? 'geneInput' : 'phenotypeInput'
      ); // Move this part here
      const suggestions = document.getElementById(
        type === 'gene' ? 'geneSuggestions' : 'phenotypeSuggestions'
      ); // Move this part here
      inputField.value = '';
      inputField.focus();
      suggestions.classList.add('hidden');
    },
    addGene(gene) {
      gene = gene.toUpperCase();

      let data = JSON.parse(sessionStorage.getItem('data')) || [
        { type: 'gene', items: [] },
        { type: 'phenotype', items: [] },
      ];
      const genes = data.find((item) => item.type === 'gene');

      if (!genes.items.includes(gene) && gene !== '') {
        genes.items.push(gene);
        sessionStorage.setItem('data', JSON.stringify(data));
        this.$refs.geneInput.value = ''; // Clear input field *after* adding
        this.displayItems('gene');
      }

      this.hideSuggestions('geneSuggestions');
    },
    addPhenotype(phenotype) {
      phenotype = phenotype.toUpperCase();

      let data = JSON.parse(sessionStorage.getItem('data')) || [
        { type: 'gene', items: [] },
        { type: 'phenotype', items: [] },
      ];
      const phenotypes = data.find((item) => item.type === 'phenotype');

      if (!phenotypes.items.includes(phenotype) && phenotype !== '') {
        phenotypes.items.push(phenotype);
        sessionStorage.setItem('data', JSON.stringify(data));
        this.$refs.phenotypeInput.value = ''; // Clear input field after adding
        this.displayItems('phenotype');
      }
      this.hideSuggestions('phenotypeSuggestions');
    },
    getItems(type) {
      const data = JSON.parse(sessionStorage.getItem('data'));
      const typeObject = data.find((item) => item.type === type);
      return typeObject ? typeObject.items : []; // Return empty array if type not found
    },
    displayItems(type) {
      const items = this.getItems(type);
      const container =
        type === 'gene'
          ? document.querySelector('.flex-wrap.gene-items')
          : document.querySelector('.flex-wrap.phenotype-items');
      if (container) {
        container.innerHTML = ''; // Clear existing content

        items.forEach((item) => {
          const cardElement = document.createElement('div');
          const geneNameElement = document.createElement('div');
          cardElement.className =
            'bg-gray-200 text-gray-700 rounded-full text-ml font-mono font-bold px-4 py-2 flex items-center space-x-4';
          geneNameElement.textContent = item; // Set the text content directly
          const svgIcon = this.createSvgIcon(type, item); // Create the SVG element with click handler
          cardElement.appendChild(geneNameElement);
          cardElement.appendChild(svgIcon);
          container.appendChild(cardElement);
        });
      } else {
        console.error('Container element not found!');
      }
      if (type === 'gene') {
        document.querySelector('.genes-count').textContent = `RESEARCH ${Object.keys(items).length
          } GENES`;
      }
    },
    createSvgIcon(type, item) {
      const svgIcon = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      );
      svgIcon.setAttribute(
        'class',
        'w-6 h-6 hover:text-gray-600 text-gray-800 dark:text-white'
      );
      svgIcon.setAttribute('aria-hidden', 'true');
      svgIcon.setAttribute('width', '24');
      svgIcon.setAttribute('height', '24');
      svgIcon.setAttribute('fill', 'currentColor');
      svgIcon.setAttribute('viewBox', '0 0 24 24');
      const path = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      );
      path.setAttribute('fill-rule', 'evenodd');
      path.setAttribute(
        'd',
        'M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z'
      );
      path.setAttribute('clip-rule', 'evenodd');
      svgIcon.appendChild(path);
      svgIcon.addEventListener('click', () => this.removeItem(type, item)); // Attach click listener
      return svgIcon;
    },
    removeItem(type, itemToRemove) {
      const data = JSON.parse(sessionStorage.getItem('data'));
      const items = data.find((item) => item.type === type).items;
      const updatedItems = items.filter((item) => item !== itemToRemove);
      data.find((item) => item.type === type).items = updatedItems;
      sessionStorage.setItem('data', JSON.stringify(data));
      this.displayItems(type); // Refresh the display
    },
    clearList(type) {
      const data = JSON.parse(sessionStorage.getItem('data'));
      const items = data.find((item) => item.type === type);
      items.items = []; // Clear the list of items
      sessionStorage.setItem('data', JSON.stringify(data));
      this.displayItems(type); // Refresh the display
    },
    hideSuggestions(suggestionId) {
      const suggestionsContainer = document.getElementById(suggestionId);
      if (suggestionsContainer) {
        suggestionsContainer.classList.add('hidden');
      }
    },
    addFreeGene() {
      const inputField = document.getElementById('geneInput');
      const inputValue = inputField.value.trim();

      if (inputValue) {
        // Add the input value as a gene, whether it's in suggestions or not
        this.addGene(inputValue);

        // Clear input field and suggestions
        inputField.value = '';
        this.hideSuggestions(geneSuggestions);
      }
    },
    addFreePhenotype() {
      const inputField = document.getElementById('phenotypeInput');
      const inputValue = inputField.value.trim();

      if (inputValue) {
        // Add the input value as a gene, whether it's in suggestions or not
        this.addPhenotype(inputValue);

        // Clear input field and suggestions
        inputField.value = '';
        this.hideSuggestions(phenotypeSuggestions);
      }
    },
    startLoader() {
      document.querySelectorAll('.loader').forEach((loader) => {
        loader.classList.add('animate-spin'); // Start rotation on each loader
      });
    },
    stopLoader() {
      document.querySelectorAll('.loader').forEach((loader) => {
        loader.classList.remove('animate-spin'); // Stop rotation on each loader
      });
    },
    async reasearch() {
      this.startLoader();
      const genes = this.getItems('gene');
      const phenotypes = this.getItems('phenotype');
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user ? user.id : null;
      if (genes.length > 0 || phenotypes.length > 0) {
        const data = { userId, genes, phenotypes };
        fetch('api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // Parse the response as JSON
          })
          .then((jsonData) => {
            // jsonData now holds the parsed JSON
            if (
              !jsonData ||
              !jsonData.results ||
              jsonData.results.length === 0
            ) {
              this.stopLoader();
            } else if (jsonData && jsonData.results) {
              this.$emit('search-complete', jsonData.results); // Emit event with results
              sessionStorage.setItem('results', JSON.stringify(jsonData)); // Save results to sessionStorage
              this.stopLoader();
            }
          })
          .catch((error) => {
            console.error('Error:', error);
            //Consider adding UI feedback to the user about the error.  For example,  display an error message in the `searchResultsContainer`.
          });
      } else if (
        (genes, phenotypes) =>
          Object.keys(genes).length === 0 &&
          Object.keys(phenotypes).length === 0
      ) {
        this.stopLoader();
      }
    },
    debounce(func, delay) {
      let timer;
      return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
      };
    },
    async fetchGenesListAndCache() {
      if (sessionStorage.getItem('genesList')) {
        this.genesList = JSON.parse(sessionStorage.getItem('genesList'));
        return;
      }

      try {
        const response = await fetch('api/geneslist');
        const data = await response.json();
        this.genesList = data.genes;
        sessionStorage.setItem('genesList', JSON.stringify(data.genes));
      } catch (error) {
        console.error('Error fetching genes:', error);
      }

    },
    extractGeneFromBatch() {
      if (!this.batchInput.trim() || this.genesList.length === 0) {
        this.extractedGenes = [];
        return;
      }

      const text = this.batchInput;
      const foundGenes = this.genesList.filter((gene) => {
        const regex = new RegExp(`\\b${gene}\\b`, 'i');
        return regex.test(text);
      });

      foundGenes.sort((a, b) => text.indexOf(a) - text.indexOf(b));
      this.extractedGenes = foundGenes;
      this.populateSearchWithExtraction(foundGenes);
    },
    async populateSearchWithExtraction(genes) {
      for (const gene of genes) {
        this.addGene(gene);
        await new Promise((resolve) => setTimeout(resolve, 10)); // test                                                 REMOVE BEFORE PROD
      }
    },
    clearBatchInput() {
      this.batchInput = '';
      document.getElementById('batchInput').value = '';
    },
    readFileContent(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        this.batchInput = content; // Populate batchInput with file content
        this.extractGeneFromBatch(); // Extract genes from the file content
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
      };
      reader.readAsText(file); // Read file content as text
    },
    handleFileDrop(event) {
      const file = event.dataTransfer.files[0];
      if (file) {
        this.readFileContent(file);
      }
    },
    handleFileUpload(event) {
      const file = event.target.files[0]; // Get the manually selected file
      if (file) {
        this.readFileContent(file); // Process the file
      }
    },
    clearWholeResearch() {
      if (
        confirm('Are you sure you want to clear the entire research box?')
      ) {
        this.clearList('gene');
        this.clearList('phenotype');
        this.batchInput = '';
        this.extractedGenes = [];
      }
    },
    clearContainer(type) {
      this.clearList(type);
    },
  },
};
</script>
