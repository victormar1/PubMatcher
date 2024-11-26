<template>
  <div id="app" class="flex flex-col min-h-screen">
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
  };
</script>

<style>
  /* Vos styles globaux */
</style>
