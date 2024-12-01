<template>
  <div id="app" class="flex flex-col min-h-screen dark:bg-gray-600">
    <AppHeader />
    <PatchNote />
    <main class="flex-grow">
      <router-view></router-view>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import PatchNote from './components/PatchNote.vue';

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter,
    PatchNote,
  },
  mounted() {
    this.applyDarkModePreference();
  },
  methods: {
    applyDarkModePreference() {
      const storedTheme = localStorage.getItem('color-theme');

      if (storedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
  }
};



</script>
