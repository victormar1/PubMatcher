<template>
  <div class="flex flex-col gap-3 justify-center min-w-[790px] "
    @click.capture="hideSuggestions('geneSuggestions'); hideSuggestions('phenotypeSuggestions')">
    <!-- EXTRACTION -->
    <div>
      <!-- EXTRACTION -->
      <div class="flex flex-row items-center border-blue-600">
        <label for="batch" class="block text-3xl ml-5  font-extrabold text-gray-700">
          EXTRACT FROM TEXT
        </label>
        <!-- TOOLTIP CONT -->
        <div class="group flex relative ml-3">
          <button data-popover-target="popover-extract" data-popover-placement="right"
            class="text-gray-600 transition-colors duration-200 focus:outline-none dark:text-gray-200 dark:hover:text-red-400 hover:text-red-500">
            <svg class="w-6 h-6 text-gray-700 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
              width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd"
                d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9.008-3.018a1.502 1.502 0 0 1 2.522 1.159v.024a1.44 1.44 0 0 1-1.493 1.418 1 1 0 0 0-1.037.999V14a1 1 0 1 0 2 0v-.539a3.44 3.44 0 0 0 2.529-3.256 3.502 3.502 0 0 0-7-.255 1 1 0 0 0 2 .076c.014-.398.187-.774.48-1.044Zm.982 7.026a1 1 0 1 0 0 2H12a1 1 0 1 0 0-2h-.01Z"
                clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        <div data-popover id="popover-extract" role="tooltip"
          class="absolute z-20 invisible opacity-0  inline-block  text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm  dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800">
          <div
            class="flex flex-row items-center space-x-2 px-3 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg dark:border-gray-600 dark:bg-gray-700">
            <svg class="w-6 h-6 text-gray-700 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
              width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd"
                d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9.008-3.018a1.502 1.502 0 0 1 2.522 1.159v.024a1.44 1.44 0 0 1-1.493 1.418 1 1 0 0 0-1.037.999V14a1 1 0 1 0 2 0v-.539a3.44 3.44 0 0 0 2.529-3.256 3.502 3.502 0 0 0-7-.255 1 1 0 0 0 2 .076c.014-.398.187-.774.48-1.044Zm.982 7.026a1 1 0 1 0 0 2H12a1 1 0 1 0 0-2h-.01Z"
                clip-rule="evenodd" />
            </svg>
            <h3 class="font-semibold text-gray-800 dark:text-white">Automatic genes extraction</h3>
          </div>
          <div class="px-3 py-2 font-semibold  text-nowrap">
            <p>Paste text or drag a file to extract gene names automatically.</p>
          </div>
          <div data-popper-arrow></div>
        </div>
        <button class="ml-auto px-4 py-1 mb-1 mr-5 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600"
          @click="showLogoutModal">
          New Research
        </button>
      </div>
      <div class="flex flex-row mx-2">
        <!-- BATCH INPUT | EXTRACT BUTTONS -->
        <div class="relative w-full overflow-auto h-56 ">
          <textarea id="batchInput" v-model="batchInput" rows="4"
            class="block p-2.5 pb-12 w-full h-full resize-none text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Paste your genes here..."></textarea>
          <div class="absolute bottom-2 right-4 flex space-x-2 ">
            <button id="submitTextArea" @click="extractGeneFromBatch" type="button"
              class="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-600 text-white font-medium rounded-md space-x-2">
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
            <p class="mt-2 px-1.5 text-xs tracking-wide text-gray-500 dark:text-gray-400">
              Upload or drag & drop your file TXT, CSV or XML.
            </p>
          </label>

          <!-- Hidden File Input -->
          <input id="dropzone-file" type="file" class="hidden" @change="handleFileUpload" />
        </div>
      </div>
    </div>
    <!-- GENES AND PHENOTYPES --------------------------------------------------------------------------------->
    <div class="flex flex-row h-full gap-2 min-h-72 mx-2 ">
      <!-- GENES -->
      <div class="flex flex-col w-1/2 min-w-[350px] items-center bg-gray-50  border border-gray-300 rounded-lg p-4 ">
        <div class="flex flex-row items-center w-full ">
          <div
            class="bg-white p-2 w-24 h-12 flex flex-row justify-between items-center rounded-lg  border border-gray-200">
            <!-- Delete Button -->
            <button @click="clearContainer('gene')"
              class="p-1 rounded-md hover:bg-gray-100 transition-colors duration-200" aria-label="Delete">
              <svg class="w-6 h-6 text-gray-500 hover:text-red-500 transition-colors duration-200" aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
              </svg>
            </button>

            <!-- Divider -->
            <div class="w-px h-6 bg-gray-200"></div>

            <button data-popover-target="copy-to-clipboard-menu" type="button"
              class="p-1 rounded-md hover:bg-gray-100 transition-colors duration-200" aria-label="Clipboard">
              <svg class="w-6 h-6 text-gray-500 hover:text-blue-500 transition-colors duration-200"
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"></path>
                <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"></path>
              </svg>
            </button>

            <div data-popover id="copy-to-clipboard-menu" role="tooltip"
              class="absolute z-20 invisible inline-block w-64 text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-xs opacity-0 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800">
              <div
                class="px-3 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg dark:border-gray-600 dark:bg-gray-700 flex items-center gap-x-1">
                <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                  width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path fill-rule="evenodd"
                    d="M18 3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1V9a4 4 0 0 0-4-4h-3a1.99 1.99 0 0 0-1 .267V5a2 2 0 0 1 2-2h7Z"
                    clip-rule="evenodd" />
                  <path fill-rule="evenodd"
                    d="M8 7.054V11H4.2a2 2 0 0 1 .281-.432l2.46-2.87A2 2 0 0 1 8 7.054ZM10 7v4a2 2 0 0 1-2 2H4v6a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z"
                    clip-rule="evenodd" />
                </svg>
                <h3 class="font-semibold text-gray-900 dark:text-white flex-grow">Copy options</h3>
                <span v-if="copied" class="italic text-blue-600 mr-2">Copied!</span>
              </div>
              <div class="px-3 py-2 flex flex-col gap-2">
                <button @click="handleClipboardClickGene(' ')"
                  class="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 text-left bg-gray-50">
                  <h1>SPACE separated values</h1>
                </button>

                <button @click="handleClipboardClickGene(',')"
                  class="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 text-left bg-gray-50">
                  <h1>COMMA separated values</h1>
                </button>

                <button @click="handleClipboardClickGene(';')"
                  class="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 text-left bg-gray-50">
                  <h1>SEMICOLON separated values</h1>
                </button>
              </div>
              <div
                class="px-3 py-2 bg-gray-100 border-b border-gray-200 dark:border-gray-600 dark:bg-gray-700 flex items-center gap-x-1">
                <div class="flex items-center gap-2">
                  <input v-model="customSeparator" type="text" placeholder="Custom separator"
                    class="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-300">
                  <button @click="handleClipboardClickGene(customSeparator)"
                    class="px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors duration-200">
                    Copy
                  </button>
                </div>
              </div>
              <div data-popper-arrow></div>
            </div>
          </div>
          <form @submit.prevent class="w-2/3 px-8 ">

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
                class="text-white absolute right-2 bottom-2 bg-gray-800 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                <p class="text-white">Add</p>
              </button>

              <!-- Suggestion dropdown -->
              <ul id="geneSuggestions"
                class="absolute w-full bg-white border border-gray-300 rounded-lg mt-1 hidden max-h-60 overflow-y-auto shadow-lg top-full">
              </ul>
            </div>
          </form>

          <div class="flex flex-row gap-2">
            <!-- Bouton pour les gènes blacklistés -->
            <button data-popover-target="blacklisted-genes-popover" type="button"
              class="bg-red-500 py-1 px-3 rounded-full text-white text-center flex items-center gap-2">
              <svg class="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24"
                height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-width="2"
                  d="m6 6 12 12m3-6a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span class="text-lg font-bold">{{ blacklistedGenes.length }}</span>
            </button>
            <div data-popover id="blacklisted-genes-popover" role="tooltip"
              class="absolute z-20 invisible opacity-0 inline-block w-64 text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800">
              <div
                class="px-3 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg dark:border-gray-600 dark:bg-gray-700">
                <h3 class="font-bold text-gray-900 dark:text-white">Blacklisted Genes</h3>
              </div>
              <div class="px-3 py-2">
                <div v-if="blacklistedGenes.length > 0" class="flex flex-wrap gap-2">
                  <div v-for="gene in blacklistedGenes" :key="gene"
                    class="inline-flex px-2 justify-center items-center bg-red-200 rounded-full">
                    <p class="text-gray-700 font-bold">{{ gene }}</p>
                  </div>
                </div>
                <div v-else>
                  <p class="text-gray-700">No genes are currently blacklisted.</p>
                </div>
              </div>
              <div class="px-3 py-2">
                <button @click="clearBlacklist"
                  class="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200">
                  Clear All
                </button>
              </div>
              <div data-popper-arrow></div>
            </div>

            <!-- Bouton pour les alias blacklistés -->
            <button data-popover-target="blacklisted-aliases-popover" type="button"
              class="bg-blue-500 py-1 px-3 rounded-full text-white text-center flex items-center gap-2">
              <svg class="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24"
                height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-width="2"
                  d="m6 6 12 12m3-6a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span class="text-lg font-bold">{{ blacklistedAliases.length }}</span>
            </button>
            <div data-popover id="blacklisted-aliases-popover" role="tooltip"
              class="absolute z-20 invisible opacity-0 inline-block w-64 text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800">
              <div
                class="px-3 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg dark:border-gray-600 dark:bg-gray-700">
                <h3 class="font-bold text-gray-900 dark:text-white">Blacklisted Aliases</h3>
              </div>
              <div class="px-3 py-2">
                <div v-if="blacklistedAliases.length > 0" class="flex flex-wrap gap-2">
                  <div v-for="alias in blacklistedAliases" :key="alias"
                    class="inline-flex px-2 justify-center items-center bg-blue-200 rounded-full">
                    <p class="text-gray-700 font-bold">{{ alias }}</p>
                  </div>
                </div>
                <div v-else>
                  <p class="text-gray-700">No aliases are currently blacklisted.</p>
                </div>
              </div>
              <div class="px-3 py-2">
                <button @click="clearAliasBlacklist"
                  class="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200">
                  Clear All
                </button>
              </div>
              <div data-popper-arrow></div>
            </div>
          </div>
        </div>
        <div class=" flex flex-col items-center mt-2 space-y-4 rounded max-h-48 overflow-auto p-4">
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
                class="text-white absolute right-2 bottom-2 bg-gray-800 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                <p class="text-white">Add</p>
              </button>
              <ul id="phenotypeSuggestions"
                class="absolute w-full bg-white border border-gray-300 rounded-lg mt-1 hidden max-h-60 overflow-y-auto shadow-lg z-20 top-full">
              </ul>

              <!-- Suggestion dropdown -->
              <ul id="suggestions"
                class="absolute w-full bg-white border border-gray-300 rounded-lg mt-1 hidden max-h-60 overflow-y-auto shadow-lg z-20">
                <!-- Suggestions will be dynamically generated here -->
              </ul>
            </div>
          </form>
          <div
            class="bg-white p-2 w-24 h-12 flex flex-row justify-between items-center rounded-lg border border-gray-200">

            <button data-popover-target="copy-to-clipboard-menu-pheno" type="button"
              class="p-1 rounded-md hover:bg-gray-100 transition-colors duration-200" aria-label="Clipboard">
              <svg class="w-6 h-6 text-gray-500 hover:text-blue-500 transition-colors duration-200"
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"></path>
                <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"></path>
              </svg>
            </button>

            <div data-popover id="copy-to-clipboard-menu-pheno" role="tooltip"
              class="absolute z-10 invisible inline-block w-64 text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-xs opacity-0 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800">
              <div
                class="px-3 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg dark:border-gray-600 dark:bg-gray-700 flex items-center gap-x-1">
                <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                  width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path fill-rule="evenodd"
                    d="M18 3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1V9a4 4 0 0 0-4-4h-3a1.99 1.99 0 0 0-1 .267V5a2 2 0 0 1 2-2h7Z"
                    clip-rule="evenodd" />
                  <path fill-rule="evenodd"
                    d="M8 7.054V11H4.2a2 2 0 0 1 .281-.432l2.46-2.87A2 2 0 0 1 8 7.054ZM10 7v4a2 2 0 0 1-2 2H4v6a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z"
                    clip-rule="evenodd" />
                </svg>
                <h3 class="font-semibold text-gray-900 dark:text-white flex-grow">Copy options</h3>
                <span v-if="copiedPheno" class="italic text-blue-600 mr-2">Copied!</span>
              </div>
              <div class="px-3 py-2 flex flex-col gap-2">
                <button @click="handleClipboardClickPheno(' ')"
                  class="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 text-left bg-gray-50">
                  <h1>SPACE separated values</h1>
                </button>

                <button @click="handleClipboardClickPheno(',')"
                  class="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 text-left bg-gray-50">
                  <h1>COMMA separated values</h1>
                </button>

                <button @click="handleClipboardClickPheno(';')"
                  class="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 text-left bg-gray-50">
                  <h1>SEMICOLON separated values</h1>
                </button>
              </div>
              <div
                class="px-3 py-2 bg-gray-100 border-b border-gray-200 dark:border-gray-600 dark:bg-gray-700 flex items-center gap-x-1">
                <div class="flex items-center gap-2">
                  <input v-model="customSeparator" type="text" placeholder="Custom separator"
                    class="px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-gray-300">
                  <button @click="handleClipboardClickPheno(customSeparator)"
                    class="px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors duration-200">
                    Copy
                  </button>
                </div>
              </div>
              <div data-popper-arrow></div>
            </div>



            <!-- Divider -->
            <div class="w-px h-6 bg-gray-200"></div>

            <!-- Delete Button (Now on the Right) -->
            <button @click="clearContainer('phenotype')"
              class="p-1 rounded-md hover:bg-gray-100 transition-colors duration-200" aria-label="Delete">
              <svg class="w-6 h-6 text-gray-500 hover:text-red-500 transition-colors duration-200" aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
              </svg>
            </button>
          </div>
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
        class="text-white  bg-gray-800 hover:bg-gray-600 w-full justify-center  focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm  py-2.5 text-center inline-flex items-center h-24 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
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
      <div v-if="logoutModalVisible" class="fixed inset-0  flex items-center justify-center bg-black bg-opacity-50">
        <!-- Modal Content -->
        <div class="bg-white rounded-lg shadow-lg w-96 p-6 text-center">
          <h2 class="text-xl font-bold mb-4">Are you sure?</h2>
          <p class="text-gray-600 mb-6">This will clear all the research fields</p>
          <div class="flex justify-center gap-4">
            <button @click="confirm"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none">
              Yes, I'm Sure
            </button>
            <button @click="cancel"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none">
              Cancel
            </button>
          </div>
        </div>
      </div>
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
      logoutModalVisible: false,
      blacklistedGenes: [],
      blacklistedAliases: [],
      copied: false,
      copiedPheno: false,

    };
  },

  mounted() {

    const storedAliasBlacklist = localStorage.getItem('blacklistedAliases');
    this.blacklistedAliases = storedAliasBlacklist ? JSON.parse(storedAliasBlacklist) : [];


    this.fetchGenesListAndCache(); // Load genes list
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
    //GET STORED GENE BLACKLIST
    const storedBlacklist = localStorage.getItem('blacklistedGenes');
    this.blacklistedGenes = storedBlacklist ? JSON.parse(storedBlacklist) : [];

    this.displayItems('gene');
    this.displayItems('phenotype');

    if (this.genes.length || this.phenotypes.length) {
      this.searchFromUrl();
    }



  },
  created() {
    this.debouncedShowSuggestions = this.debounce(this.showSuggestions, 300);
  },
  methods: {
    showLogoutModal() {
      this.logoutModalVisible = true;
    },
    confirm() {
      this.logoutModalVisible = false;
      this.clearWholeResearch()
    },
    cancel() {
      this.logoutModalVisible = false;
    },
    async handleClipboardClickGene(exp) {
      console.log(exp)
      this.copied = true
      await navigator.clipboard.writeText(this.getItems('gene').join(exp ? exp : ','));
      setTimeout(() => {
        this.copied = false;
      }, 1500);
    },
    async handleClipboardClickPheno(exp) {
      this.copiedPheno = true
      await navigator.clipboard.writeText(this.getItems('phenotype').join(exp ? exp : ','));
      setTimeout(() => {
        this.copiedPheno = false;
      }, 1500);
    },


    removeBlacklistedGene(gene) {
      this.blacklistedGenes = this.blacklistedGenes.filter(g => g !== gene);
      localStorage.setItem('blacklistedGenes', JSON.stringify(this.blacklistedGenes));
      this.displayItems('gene');
    },
    removeBlacklistedAlias(alias) {
      this.blacklistedAliases = this.blacklistedAliases.filter(a => a !== alias);
      localStorage.setItem('blacklistedAliases', JSON.stringify(this.blacklistedAliases));
      this.displayItems('gene');
    },


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

      if (!container) {
        console.error('Container element not found!');
        return;
      }

      container.innerHTML = '';

      const aliasInfoMap = new Map(
        (this.extractedGenes || [])
          .filter(g => g.fromAlias)
          .map(g => [g.symbol.toUpperCase(), g.aliasUsed])
      );

      const orderedItems = [...items].sort((a, b) => {
        const aIndex = this.extractedGenes.findIndex(g => g.symbol.toUpperCase() === a);
        const bIndex = this.extractedGenes.findIndex(g => g.symbol.toUpperCase() === b);
        return (aIndex === -1 ? Infinity : aIndex) - (bIndex === -1 ? Infinity : bIndex);
      });



      orderedItems.forEach((item) => {
        const isAlias = aliasInfoMap.has(item);
        const aliasUsed = aliasInfoMap.get(item);

        const cardElement = document.createElement('div');
        const geneNameElement = document.createElement('span');
        geneNameElement.textContent = item;

        const svgIcon = this.createSvgIcon(type, item);
        cardElement.appendChild(geneNameElement);

        if (isAlias) {
          const badge = document.createElement('span');
          badge.textContent = 'alias';
          badge.className =
            'ml-2 px-2 py-0.5 text-xs font-semibold text-white bg-blue-500 rounded-full cursor-help';
          badge.setAttribute('title', `Found via alias: ${aliasUsed}`);
          cardElement.appendChild(badge);
        }

        cardElement.appendChild(svgIcon);

        if (type === 'gene') {
          cardElement.className =
            (this.blacklistedGenes.includes(item)
              ? 'bg-red-200'
              : isAlias
                ? 'bg-yellow-100'
                : 'bg-gray-200') +
            ' text-gray-700 rounded-full text-ml font-mono font-bold px-4 py-2 flex items-center space-x-2 select-none';
          cardElement.addEventListener('click', () => {
            this.handleGeneClick(item, cardElement);
          });
        } else {
          cardElement.className =
            'bg-gray-200 text-gray-700 rounded-full text-ml font-mono font-bold px-4 py-2 flex items-center space-x-4';
        }

        container.appendChild(cardElement);
      });

      if (type === 'gene') {
        const activeBlacklistedGenes = this.blacklistedGenes.filter((gene) =>
          items.includes(gene)
        ).length;

        const geneCount = Math.max(items.length - activeBlacklistedGenes, 0);
        document.querySelector('.genes-count').textContent = `RESEARCH ${geneCount} GENES`;
      }
    },
    handleGeneClick(gene, container) {
      const aliasInfo = this.extractedGenes.find(
        (g) => g.symbol === gene && g.fromAlias
      );

      if (aliasInfo) {
        // C'est un alias : toggle dans blacklistedAliases
        this.toggleAliasBlacklist(aliasInfo.symbol, aliasInfo.aliasUsed);
      } else {
        // Sinon : blacklist du gène entier
        const isBlacklisted = this.blacklistedGenes.includes(gene);
        if (isBlacklisted) {
          this.blacklistedGenes = this.blacklistedGenes.filter((item) => item !== gene);
        } else {
          this.blacklistedGenes.push(gene);
        }
        localStorage.setItem('blacklistedGenes', JSON.stringify(this.blacklistedGenes));
      }

      this.displayItems('gene');
    },

    clearBlacklist() {
      this.blacklistedGenes = []
      localStorage.removeItem('blacklistedGenes')
      this.displayItems('gene')
    },


    toggleAliasBlacklist(symbol, alias) {
      const key = `${symbol}:${alias}`;
      const index = this.blacklistedAliases.indexOf(key);

      if (index !== -1) {
        this.blacklistedAliases.splice(index, 1);
      } else {
        this.blacklistedAliases.push(key);
      }

      localStorage.setItem('blacklistedAliases', JSON.stringify(this.blacklistedAliases));
      this.displayItems('gene');
    },

    clearAliasBlacklist() {
      this.blacklistedAliases = [];
      localStorage.removeItem('blacklistedAliases');
      this.displayItems('gene');
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
      svgIcon.addEventListener('click', (event) => {
        event.stopPropagation(); // 
        this.removeItem(type, item);
      });
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
      let extPhenos = []
      if (inputValue) {
        if (inputValue.length > 20) {
          const regex = /\d{7}:\s[^0-9]+(?=\s|$)/g;
          extPhenos = inputValue.match(regex)
          for (let i in extPhenos) {
            extPhenos[i] = extPhenos[i].split(':')[1].trim()
            this.addPhenotype(extPhenos[i])
          }
        } else {
          this.addPhenotype(inputValue);

        }
        // Add the input value as a gene, whether it's in suggestions or not

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

      event('research_click', {
        event_category: 'user_interaction', // Category: What kind of action is this?
        event_label: 'search_button',
        debug_mode: true
        // Label: Which button was clicked?
      });


      this.startLoader();
      let genes = this.getItems('gene');
      const phenotypes = this.getItems('phenotype');
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user ? user.id : null;
      genes = genes.filter((gene) => !this.blacklistedGenes.includes(gene));
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
              throw new Error(`HTTP error! status: ${response.status} `);
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
        this.genesList = data.genes.map(gene => ({
          symbol: gene.symbol,
          aliases: gene.aliases,
        }));
        sessionStorage.setItem('genesList', JSON.stringify(this.genesList));
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
      const foundGenesMap = new Map();
      const matchedSymbols = new Set();

      // Étape 1 : matcher les symboles officiels
      this.genesList.forEach(gene => {
        const regexSymbol = new RegExp(`\\b${gene.symbol}\\b`, 'i');
        if (regexSymbol.test(text)) {
          foundGenesMap.set(gene.symbol, { fromAlias: false, aliasUsed: null });
          matchedSymbols.add(gene.symbol);
        }
      });

      // Étape 2 : matcher les alias uniquement si le symbole n'a pas été détecté
      this.genesList.forEach(gene => {
        if (matchedSymbols.has(gene.symbol)) return;
        if (gene.aliases?.length) {
          for (const alias of gene.aliases) {
            if (alias.length < 3) continue;
            if (this.blacklistedAliases.includes(`${gene.symbol}:${alias}`)) continue;
            const regexAlias = new RegExp(`\\b${alias}\\b`, 'i');
            if (regexAlias.test(text)) {
              foundGenesMap.set(gene.symbol, { fromAlias: true, aliasUsed: alias });
              break;
            }
          }
        }
      });

      const foundGenes = Array.from(foundGenesMap.entries())
        .map(([symbol, info]) => {
          let index = text.search(new RegExp(`\\b${symbol}\\b`, 'i'));
          if (index === -1 && info.fromAlias && info.aliasUsed) {
            index = text.search(new RegExp(`\\b${info.aliasUsed}\\b`, 'i'));
          }
          return {
            symbol,
            fromAlias: info.fromAlias,
            aliasUsed: info.aliasUsed,
            position: index
          };
        })
        .sort((a, b) => a.position - b.position)
        .map(({ symbol, fromAlias, aliasUsed }) => ({ symbol, fromAlias, aliasUsed }));

      const currentSymbols = new Set(this.extractedGenes.map(g => g.symbol));
      const newGenes = foundGenes.filter(g => !currentSymbols.has(g.symbol));
      this.extractedGenes = [...this.extractedGenes, ...newGenes];

      this.populateSearchWithExtraction(foundGenes);
    },



    async populateSearchWithExtraction(genes) {
      const existingSessionGenes = new Set(this.getItems('gene'));
      this.extractedGenes = genes; // on réinitialise ici

      for (const geneObj of genes) {
        if (geneObj.symbol && !existingSessionGenes.has(geneObj.symbol)) {
          this.addGene(geneObj.symbol);
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
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
      this.clearList('gene');
      this.clearList('phenotype');
      this.batchInput = '';
      this.extractedGenes = [];
    },
    clearContainer(type) {
      this.clearList(type);
    },
  },
};
</script>
