<template>
    <div class="flex flex-row items-center border-blue-600">
        <label for="batchInput" class="block text-3xl ml-16 font-mono font-bold text-gray-700 "> EXTRACT FROM TEXT </label>
        <!-- TOOLTIP CONT -->
        <div class="group flex z-10 relative ml-3">
            <button class="text-gray-600 transition-colors duration-200 focus:outline-none dark:text-gray-200 dark:hover:text-blue-400 hover:text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />   
                </svg>
            </button>
            <!-- Tooltip -->
            <span class="group-hover:opacity-100 transition-opacity duration-300 bg-gray-700 text-white text-1xl font-mono italic font-medium rounded-lg px-3 py-2 shadow-lg ml-4 absolute left-1/2 -translate-x-1/2 translate-y-full opacity-0 mt-2 whitespace-nowrap">
                Extract genes from raw text, file or URL.
            </span>
        </div>
    </div>
    <div class="flex flex-row mx-2">
        <!-- BATCH INPUT | EXTRACT BUTTONS -->
        <div class="relative w-full overflow-auto h-56">
            <textarea id="message" rows="4" class="block p-2.5 pb-12 w-full h-full resize-none text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Paste your genes here..."></textarea>
                <div class="absolute bottom-2 right-4 flex space-x-2">
                    <button id="submitTextArea" class="flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white font-medium rounded-md space-x-2">
                        <svg class="w-6 h-6 text-white dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M9.586 2.586A2 2 0 0 1 11 2h2a2 2 0 0 1 2 2v.089l.473.196.063-.063a2.002 2.002 0 0 1 2.828 0l1.414 1.414a2 2 0 0 1 0 2.827l-.063.064.196.473H20a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-.089l-.196.473.063.063a2.002 2.002 0 0 1 0 2.828l-1.414 1.414a2 2 0 0 1-2.828 0l-.063-.063-.473.196V20a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-.089l-.473-.196-.063.063a2.002 2.002 0 0 1-2.828 0l-1.414-1.414a2 2 0 0 1 0-2.827l.063-.064L4.089 15H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h.09l.195-.473-.063-.063a2 2 0 0 1 0-2.828l1.414-1.414a2 2 0 0 1 2.827 0l.064.063L9 4.089V4a2 2 0 0 1 .586-1.414ZM8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clip-rule="evenodd"/>
                        </svg>
                        <span>Extract Genes</span>
                    </button>
                    <button id="clearTextArea" type="button" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md">
                        Clear
                    </button>
                </div>
        </div>
        <!-- DRAG FILE ZONE -->
        <div>
            <label for="dropzone-file" class="flex flex-col items-center justify-center h-56 mb-3 ml-3 max-w-lg text-center bg-gray-50  border-2 border-gray-300 border-dashed cursor-pointer dark:bg-gray-900 dark:border-gray-700 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-gray-500 dark:text-gray-400">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
        
                <h2 class="mt-1 font-medium tracking-wide text-gray-700 dark:text-gray-200">Drop File Here</h2>
        
                <p class="mt-2 text-xs tracking-wide text-gray-500 dark:text-gray-400">Upload or drag & drop your file TXT, CSV or XML. </p>
        
                <input id="dropzone-file" type="file" class="hidden" />
            </label>
        </div>
    </div>
</template>

<script>
export default {
name: "ExtractionModule",
};
</script>