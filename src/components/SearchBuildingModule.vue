<template>
    <div @click.capture="hideSuggestions('geneSuggestions')" class="flex mx-4 h-60 flex-row  border-blue-600">
        <div class="flex flex-col items-center w-7/12 space-y-4 rounded min-h-72 overflow-auto  border-red-600  p-4">
            <form @submit.prevent class="w-full max-w-md">
                <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                <div class="relative">
                    <!-- Search logo -->
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                    </div>
                    
                    <!-- Search input -->
                    <input type="search" ref="geneInput" id="geneInput" class="block w-full h-full p-4 pl-10 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none" placeholder="Add Genes..." @input="debouncedShowSuggestions('gene')" @keydown.enter.prevent="addFreeGene"
                    autocomplete="off" required />
                    
                    <!-- Search button -->
                    <button type="button" id="addPhenotypeButton" @click="addFreeGene()  "
                        class="text-white absolute right-2 bottom-2 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        <p class="text-white">Add</p>
                    </button>
            
                    <!-- Suggestion dropdown -->
                    <ul id="geneSuggestions" class="absolute w-full bg-white border border-gray-300 rounded-lg mt-1 hidden max-h-60 overflow-y-auto shadow-lg z-10 top-full">
                    </ul>
                </div>
            </form>
            <!-- GENES PLACEHOLDERS -->
            <div class="flex flex-wrap gap-2 p-4 gene-items">
                
                <!-- GENES POPULATE HERE -->
            </div>
        </div>

        <div class="w-0.5 h-full bg-gray-300 "></div>


        <div class="flex flex-col items-center w-7/12 space-y-4 rounded min-h-72 overflow-auto  border-red-600  p-4">
            <!-- Form for Adding Phenotypes -->
            <form class="w-full max-w-md ">
                <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                <div class="relative">
                    <!-- Search logo -->
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                    </div>
                    
                    <!-- Search input -->
                    <input type="search" id="phenotypeInput" ref="phenotypeInput" class="block w-full p-4 pl-10 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none" placeholder="Add phenotypes..."  @input="debouncedShowSuggestions('phenotype')" autocomplete="off" @keydown.enter.prevent="addFreePhenotype" required />
                    <!-- Search button -->
                    <button type="button" id="addPhenotypeButton" @click="addFreePhenotype()" class="text-white absolute right-2 bottom-2 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        <p class="text-white">Add</p>
                    </button>
                    <ul id="phenotypeSuggestions" class="absolute w-full bg-white border border-gray-300 rounded-lg mt-1 hidden max-h-60 overflow-y-auto shadow-lg z-10 top-full"></ul>
                        
                        
                        <!-- Suggestion dropdown -->
                        <ul id="suggestions" class="absolute w-full bg-white border border-gray-300 rounded-lg mt-1 hidden max-h-60 overflow-y-auto shadow-lg z-10">
                            <!-- Suggestions will be dynamically generated here -->
                        </ul>
                        
                </div>
            </form>
    
            <!-- Conteneur pour les phénotypes -->
            <div class="flex flex-wrap overflow-auto gap-2 p-4 phenotype-items">
    
            </div>
        </div>
    </div>
    <!-- RESEARCHED BUTTON -->
    <div class="flex justify-center mt-3 ">
                <button type="button" id="researchButton" @click="reasearch" class="text-white justify-center bg-blue-700 hover:bg-blue-800 w-full mx-10 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center h-24 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    <svg  class="loader w-12 h-12  text-white dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M8.737 8.737a21.49 21.49 0 0 1 3.308-2.724m0 0c3.063-2.026 5.99-2.641 7.331-1.3 1.827 1.828.026 6.591-4.023 10.64-4.049 4.049-8.812 5.85-10.64 4.023-1.33-1.33-.736-4.218 1.249-7.253m6.083-6.11c-3.063-2.026-5.99-2.641-7.331-1.3-1.827 1.828-.026 6.591 4.023 10.64m3.308-9.34a21.497 21.497 0 0 1 3.308 2.724m2.775 3.386c1.985 3.035 2.579 5.923 1.248 7.253-1.336 1.337-4.245.732-7.295-1.275M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/>
                    </svg>
                    <p class="text-white text-3xl genes-count">RESEARCH 0 GENES</p>
                    <div role="status" class="flex items-center">
                        <svg class="loader w-12 h-12 text-white dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M8.737 8.737a21.49 21.49 0 0 1 3.308-2.724m0 0c3.063-2.026 5.99-2.641 7.331-1.3 1.827 1.828.026 6.591-4.023 10.64-4.049 4.049-8.812 5.85-10.64 4.023-1.33-1.33-.736-4.218 1.249-7.253m6.083-6.11c-3.063-2.026-5.99-2.641-7.331-1.3-1.827 1.828-.026 6.591 4.023 10.64m3.308-9.34a21.497 21.497 0 0 1 3.308 2.724m2.775 3.386c1.985 3.035 2.579 5.923 1.248 7.253-1.336 1.337-4.245.732-7.295-1.275M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/>
                        </svg>
                        <span class="sr-only">Loading...</span>
                    </div>
                </button>
            </div>
</template>

<script>
import SearchBuildingModule from "./SearchBuildingModule";


export default {
    name: "SearchBuildingModule",
    mounted() {  
        // Initialize sessionStorage
        if (!sessionStorage.getItem('data')) {
            sessionStorage.setItem('data', JSON.stringify([{ type: 'gene', items: [] }, { type: 'phenotype', items: [] }]));
        }

        this.displayItems('gene'); 
        this.displayItems('phenotype');
    },
    created() {
    this.debouncedShowSuggestions = this.debounce(this.showSuggestions, 300);
    },
    methods: {
        async showSuggestions(type) {
            const inputField = document.getElementById(type === 'gene' ? "geneInput" : "phenotypeInput");
            const suggestionsContainer = document.getElementById(type === 'gene' ? "geneSuggestions" : "phenotypeSuggestions");
            const query = inputField.value.trim();

            suggestionsContainer.innerHTML = ""; // Clear previous suggestions

            if (query) {
                try {
                    const terms = type === 'gene' ? await this.fetchGenesAPI(query) : await this.fetchPhenotypesAPI(query);
                    if (terms.length > 0) {
                        terms.forEach(term => {
                            const listItem = document.createElement("li");
                            listItem.textContent = term.name;
                            listItem.className = "p-2 hover:bg-blue-100 cursor-pointer";
                            listItem.onclick = () => this.selectItem(type, term.name );
                            suggestionsContainer.appendChild(listItem);
                        });
                        suggestionsContainer.classList.remove("hidden");
                    } else {
                        suggestionsContainer.classList.add("hidden");
                    }
                } catch (error) {
                    console.error("Error fetching suggestions:", error);
                    suggestionsContainer.classList.add("hidden");
                }
            } else {
                suggestionsContainer.classList.add("hidden"); // Hide if query is empty
            }
        },
        async fetchGenesAPI(query) {
            try {
                const apiUrl = `https://clinicaltables.nlm.nih.gov/api/ncbi_genes/v3/search?terms=${encodeURIComponent(query)}&maxList=10`; //CORS BYPASS NEED TO CHANGE BEFORE PROD
                const response = await fetch(apiUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Origin': 'http://localhost:3000'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch data for gene symbol ${query}`);
                }

                let data = await response.json();
                const geneSymbols = data[3].map(gene => ({
                    name: gene[3] 
                }));
                // Return data in the same structure as fetchPhenotypesAPI
                return geneSymbols

            } catch (error) {
                console.error("Fetch error:", error);
                return []; // Return an empty array on error
            }
        },
        async fetchPhenotypesAPI(query) {
            try {
                const response = await fetch(`https://ontology.jax.org/api/hp/search?q=${encodeURIComponent(query)}&page=0&limit=10`);
                if (!response.ok) {
                    throw new Error('Failed to fetch data from OLS API');
                }
                const data = await response.json();
                console.log(data.terms)
                return data.terms;
            } catch (error) {
                console.error("Fetch error:", error);
                return []; // Return an empty array on error
            }
        },
        selectItem(type, itemName) {
            if (type === 'gene') {
                this.addGene(itemName); // Use the selected item's name
            } else if (type === 'phenotype') {
                this.addPhenotype(itemName); // Use the selected item's name
            }
            const inputField = document.getElementById(type === 'gene' ? "geneInput" : "phenotypeInput"); // Move this part here
            const suggestions = document.getElementById(type === 'gene' ? "geneSuggestions" : "phenotypeSuggestions"); // Move this part here
            inputField.value = '';     
            inputField.focus();       
            suggestions.classList.add("hidden");  
        },
        addGene(gene) { // Modified to accept the gene as an argument
            let data = JSON.parse(sessionStorage.getItem('data')) || [{ type: 'gene', items: [] }, { type: 'phenotype', items: [] }];
            const genes = data.find(item => item.type === 'gene');

            if (!genes.items.includes(gene) && gene !== '') {
                genes.items.push(gene);
                sessionStorage.setItem('data', JSON.stringify(data));
                this.$refs.geneInput.value = ''; // Clear input field *after* adding
                this.displayItems('gene');
            }

            this.hideSuggestions('geneSuggestions');
        },
        addPhenotype(phenotype) {
            let data = JSON.parse(sessionStorage.getItem('data')) || [{ type: 'gene', items: [] }, { type: 'phenotype', items: [] }];
            const phenotypes = data.find(item => item.type === 'phenotype');

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
            const typeObject = data.find(item => item.type === type); 
            return typeObject ? typeObject.items : []; // Return empty array if type not found
        }, 
        displayItems(type) {
            const items = this.getItems(type);
            const container = (type === 'gene') ? document.querySelector('.flex-wrap.gene-items') : document.querySelector('.flex-wrap.phenotype-items');
            if (container) {
                container.innerHTML = ''; // Clear existing content

                items.forEach(item => {
                    const cardElement = document.createElement('div');
                    const geneNameElement = document.createElement('div');
                    cardElement.className = 'bg-gray-200 text-gray-700 rounded-full text-ml font-mono font-bold px-4 py-2 flex items-center space-x-4';
                    geneNameElement.textContent = item; // Set the text content directly
                    const svgIcon = this.createSvgIcon(type, item); // Create the SVG element with click handler
                    cardElement.appendChild(geneNameElement);
                    cardElement.appendChild(svgIcon);
                    container.appendChild(cardElement);
                    
                });
                
            } else {
                
                console.error("Container element not found!");
            }
            if(type==='gene'){
                document.querySelector('.genes-count').textContent = `RESEARCH ${Object.keys(items).length} GENES`;

            }
            
        },
        createSvgIcon(type, item) {
            const svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgIcon.setAttribute('class', 'w-6 h-6 hover:text-gray-600 text-gray-800 dark:text-white');
            svgIcon.setAttribute('aria-hidden', 'true');
            svgIcon.setAttribute('width', '24');
            svgIcon.setAttribute('height', '24');
            svgIcon.setAttribute('fill', 'currentColor');
            svgIcon.setAttribute('viewBox', '0 0 24 24');
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute('fill-rule', 'evenodd');
            path.setAttribute('d', 'M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z');
            path.setAttribute('clip-rule', 'evenodd');
            svgIcon.appendChild(path);
            svgIcon.addEventListener('click', () => this.removeItem(type, item)); // Attach click listener
            return svgIcon;
        },
        removeItem(type, itemToRemove) {
            const data = JSON.parse(sessionStorage.getItem('data'));
            const items = data.find(item => item.type === type).items;
            const updatedItems = items.filter(item => item !== itemToRemove);
            data.find(item => item.type === type).items = updatedItems;
            sessionStorage.setItem('data', JSON.stringify(data));
            console.log("Item removed:", itemToRemove);
            this.displayItems(type) // Refresh the display
        },
        clearList(type) {
            console.log("List cleared:", type);
            const data = JSON.parse(sessionStorage.getItem('data'));
            const items = data.find(item => item.type === type);
            items.items = []; // Clear the list of items
            sessionStorage.setItem('data', JSON.stringify(data));
            this.displayItems(type) // Refresh the display
        },
        hideSuggestions(suggestionId) { 
            const suggestionsContainer = document.getElementById(suggestionId);
            if (suggestionsContainer) {
                suggestionsContainer.classList.add("hidden");
            }
        },
        addFreeGene() {
        const inputField = document.getElementById("geneInput");
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
        const inputField = document.getElementById("phenotypeInput");
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
            document.querySelectorAll('.loader').forEach(loader => {
                loader.classList.add('animate-spin'); // Start rotation on each loader
            });
        },
        stopLoader() {
            document.querySelectorAll('.loader').forEach(loader => {
                loader.classList.remove('animate-spin'); // Stop rotation on each loader
            });
        },
        async reasearch(){
            this.startLoader()
            const genes = this.getItems('gene');
            const phenotypes = this.getItems('phenotype');
            if (genes.length > 0 || phenotypes.length > 0) {
                const data = { genes, phenotypes };
                console.log(data)
                fetch('api/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json(); // Parse the response as JSON
                })
                .then(jsonData => { // jsonData now holds the parsed JSON
                    console.log(jsonData)
                    if (!jsonData || !jsonData.results || jsonData.results.length === 0) {
                        this.stopLoader()
                    }else if (jsonData && jsonData.results) {
                        this.$emit('search-complete', jsonData.results); // Emit event with results
                        sessionStorage.setItem("results", JSON.stringify(jsonData)); // Save results to sessionStorage
                        this.stopLoader()
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    //Consider adding UI feedback to the user about the error.  For example,  display an error message in the `searchResultsContainer`.
                });
            }else if((genes, phenotypes) => 
                Object.keys(genes).length === 0 && Object.keys(phenotypes).length === 0){
                    this.stopLoader()
                }
        },
        debounce(func, delay) {
            let timer;
            return function (...args) {
                clearTimeout(timer);
                timer = setTimeout(() => func.apply(this, args), delay);
            };
            }


        

































    }      
};
</script>