<template>
    <div class="relative ">
        <div :class="[
            'fixed  top-24 left-0  h-96  w-96 z-30 bg-gray-800 rounded-sm text-white shadow-lg transform transition-transform duration-500 ease-in-out',
            isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        ]">
            <button @click="toggleDrawer"
                class="absolute top-1/2 -right-10 h-12 w-12 transform -translate-y-1/2 bg-gray-800 text-white rounded-md shadow-lg focus:outline-none">
                <span v-if="!isDrawerOpen" class="flex justify-center items-center h-full w-full">
                    <svg class="w-6 h-6 text-white-800 dark:text-white" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                        viewBox="0 0 24 24">
                        <path fill-rule="evenodd"
                            d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11.5c.07 0 .14-.007.207-.021.095.014.193.021.293.021h2a2 2 0 0 0 2-2V7a1 1 0 0 0-1-1h-1a1 1 0 1 0 0 2v11h-2V5a2 2 0 0 0-2-2H5Zm7 4a1 1 0 0 1 1-1h.5a1 1 0 1 1 0 2H13a1 1 0 0 1-1-1Zm0 3a1 1 0 0 1 1-1h.5a1 1 0 1 1 0 2H13a1 1 0 0 1-1-1Zm-6 4a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Zm0 3a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1ZM7 6a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H7Zm1 3V8h1v1H8Z"
                            clip-rule="evenodd" />
                    </svg>

                </span>
                <span v-else class="flex justify-center items-center h-full w-full">
                    <svg class="w-6 h-6 text-white dark:text-white" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                        viewBox="0 0 24 24">
                        <path fill-rule="evenodd"
                            d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z"
                            clip-rule="evenodd" />
                    </svg>
                </span>
            </button>


            <div class="p-4 flex flex-col items-center  justify-start  h-full">
                <div class="flex flex-row w-full px-2 justify-between ">
                    <h2 class="text-lg font-bold">ChangeLog</h2>
                    <h2 class="text-lg font-bold">2.0.1</h2>
                </div>
                <div class="h-0.5 w-full mt-1 bg-gray-100 w-fullfull">
                </div>
                <p class=" mt-10 text-xl font-medium">PubMatcher is evolving!</p>
                <ul class="mt-4 list-disc list-inside text-sm space-y-1 text-gray-200 ">
                    <li>

                        <span class="font-semibold underline ">USER ACCOUNTS:</span> Users can now <a href="/register"
                            class="font-bold underline">register</a> and
                        log
                        in to access
                        search history and upcomming features.
                    </li>
                    <li>
                        <span class="font-semibold underline ">ENHANCED DISPLAY:</span> A fresh new layout for an
                        improved user
                        experience.
                    </li>
                    <li>
                        <span class="font-semibold underline ">IMPROVED PERFORMANCE:</span> Faster load times and
                        optimized search
                        queries.
                    </li>
                    <li>
                        <span class="font-semibold underline ">BUG FIXES:</span> Tons of bug have been fixed, data is
                        now more
                        accurate.
                    </li>
                </ul>
            </div>

        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            isDrawerOpen: false,
        };
    },
    methods: {
        toggleDrawer() {
            this.isDrawerOpen = !this.isDrawerOpen;
        },
    },
};
</script>
