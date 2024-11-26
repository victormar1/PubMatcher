<template>
  <section class="bg-white dark:bg-gray-900">
    <div class="container flex items-center px-6 py-12 mt-24 mx-auto">
      <div class="flex flex-col items-center max-w-sm mx-auto text-center">
        <img class="imgLogo" src="/pmlogo.svg" alt="" />


        <h1 class="mt-3 text-2xl font-semibold text-gray-800 dark:text-white md:text-3xl">
          Page not found
        </h1>
        <p class="mt-4 text-gray-500 dark:text-gray-400">
          The page you are looking for doesn't exist. Here are some helpful
          links:
        </p>

        <div class="flex items-center w-full mt-6 gap-x-3 shrink-0 sm:w-auto">
          <button @click="goHome"
            class="flex items-center justify-center w-1/2 px-5 py-2 text-sm text-gray-700 transition-colors duration-200 bg-white border rounded-lg gap-x-2 sm:w-auto dark:hover:bg-gray-800 dark:bg-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:border-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="w-5 h-5 rtl:rotate-180">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
            </svg>

            <span>Go back Home</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'PageNotFound',
  methods: {
    goHome() {
      this.$router.push({ path: '/' }); // Replace 'Home' with your route name
    },
  },
};
</script>


<style>
.imgLogo {
  filter: invert(83.4%) saturate(429.69%) hue-rotate(-145.5deg);
}
</style>
