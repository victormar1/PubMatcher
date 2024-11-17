<template>
    <div>
        <label for="geneInput" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Gene:</label>
        <div class="relative">
        <input type="text" id="geneInput" v-model="gene" class="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline-none" placeholder="Enter gene symbol" />
        <button @click="addGene" class="text-white absolute right-2 bottom-2 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            Add
        </button>
        </div>
        <ul v-if="showSuggestions" class="mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
        <li v-for="suggestion in suggestions" :key="suggestion" class="p-2 hover:bg-blue-100 cursor-pointer" @click="selectSuggestion(suggestion)">{{ suggestion }}</li>
        </ul>
    </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
name: 'GeneInput',
setup() {
    const gene = ref('');
    const suggestions = ref([]);
    const showSuggestions = ref(false);

    const addGene = () => {
    // Your existing addGene logic here (send the 'gene' data to the backend)
    console.log('Gene to add:', gene.value);
    gene.value = ''; // Clear input after adding
    showSuggestions.value = false; //hide the suggestion list
    };

    const fetchSuggestions = async (query) => {
    //Your existing fetchGenesAPI logic here
    const result = await fetchGenesAPI(query); // Replace with your actual API call
    suggestions.value = result.map(item => item.name);
    };

    watch(gene, async () => {
    if (gene.value.length > 2) {  //Show suggestions after 2 characters
        showSuggestions.value = true;
        await fetchSuggestions(gene.value);
    } else {
        showSuggestions.value = false;
        suggestions.value = [];
    }
    });

    const selectSuggestion = (suggestion) => {
    gene.value = suggestion;
    showSuggestions.value = false;
    suggestions.value = [];
    };
    return { gene, addGene, suggestions, showSuggestions, selectSuggestion };
},
};
</script>
