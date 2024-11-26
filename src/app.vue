<template>
  <div id="app" class="flex flex-col min-h-screen dark:bg-gray-600">
    <AppHeader />
    <main class="flex-grow">
      <router-view></router-view>
    </main>
    <AppFooter />
  </div>
</template>

<script>
  import AppHeader from './components/AppHeader.vue';
  import AppFooter from './components/AppFooter.vue';

  export default {
    name: 'App',
    components: {
      AppHeader,
      AppFooter,
    },
    mounted() {
      this.applyDarkModePreference();
    },
    methods: {
      applyDarkModePreference() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; //os theme remove if conflicting
        const storedTheme = localStorage.getItem('color-theme');

        if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }
  };


  
</script>

<style>
  /* Vos styles globaux */
</style>
