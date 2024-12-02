<template>
    <div v-if="bannerVisible" id="sticky-banner" tabindex="-1"
        class="z-50 flex justify-between w-full p-1  bg-red-500  dark:bg-gray-700 dark:border-gray-600">
        <div class="flex items-center mx-auto">
            <p class="flex items-center text-sm font-normal text-white dark:text-gray-400">
                <span
                    class="inline-flex p-1 me-3 bg-white rounded-full dark:bg-gray-600 size-4 items-center justify-center flex-shrink-0">
                    <svg class="w-3 h-3 text-red-500 dark:text-gray-400" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 19">
                        <path
                            d="M15 1.943v12.114a1 1 0 0 1-1.581.814L8 11V5l5.419-3.871A1 1 0 0 1 15 1.943ZM7 4H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2v5a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V4ZM4 17v-5h1v5H4ZM16 5.183v5.634a2.984 2.984 0 0 0 0-5.634Z" />
                    </svg>
                    <span class="sr-only">Light bulb</span>
                </span>
                <span>Scheduled Maintenance: <a class="font-semibold">Monday, December 2</a> from <a
                        class="font-semibold">23:00</a>
                    to <a class="font-semibold">00:00</a>. Services
                    may be
                    temporarily
                    unavailable
                    during this time. Thank you for your understanding.</span>

            </p>
        </div>

    </div>
</template>



<script>
export default {
    data() {
        return {
            bannerVisible: true, // ACTIVATE BANNER 
        };
    },
}

</script>