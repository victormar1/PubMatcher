<template>
    <div v-if="bannerVisible" id="sticky-banner" tabindex="-1"
        class="z-50 flex justify-between w-full p-1  bg-red-500  dark:bg-gray-700 dark:border-gray-600">
        <div class="flex items-center mx-auto">
            <p class="flex items-center text-sm font-normal text-white dark:text-gray-400">
                <span
                    class="inline-flex p-1 me-3 bg-white rounded-full dark:bg-gray-600 w-6 h-6 items-center justify-center flex-shrink-0">
                    <svg class="w-3 h-3 text-red-500 dark:text-gray-400" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 19">
                        <path
                            d="M15 1.943v12.114a1 1 0 0 1-1.581.814L8 11V5l5.419-3.871A1 1 0 0 1 15 1.943ZM7 4H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2v5a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V4ZM4 17v-5h1v5H4ZM16 5.183v5.634a2.984 2.984 0 0 0 0-5.634Z" />
                    </svg>
                    <span class="sr-only">Light bulb</span>
                </span>
                <span>{{ bannerMessage }}</span>

            </p>
        </div>
        <div class="flex items-center">
            <button @click="closeBanner" type="button"
                class="flex-shrink-0 inline-flex justify-center w-7 h-7 items-center text-white hover:bg-gray-200 hover:text-gray-900 rounded-full text-sm p-1.5 dark:hover:bg-gray-600 dark:hover:text-white">
                <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 14 14">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span class="sr-only">Close banner</span>
            </button>
        </div>
    </div>
</template>



<script>
export default {
    data() {
        return {
            bannerVisible: true,
            bannerMessage: "Scheduled Maintenance: 10/11/2023 from 23:00 to 00:00. Services may be temporarily unavailable. Thank you for your understanding." // ! Change in nano to display the banner DONT FORGET TO UPDATE THE MESSAGE
        }
    },
    mounted() {
        if (localStorage.getItem('bannerClosed') === this.bannerMessage) {
            this.bannerVisible = false;
        } else {
            this.bannerVisible = true;
        }
    },
    methods: {
        closeBanner() {
            localStorage.setItem('bannerClosed', this.bannerMessage);
            this.bannerVisible = false;
        },
    }
}

</script>