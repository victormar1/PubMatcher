<template>
  <div id="app" class="flex flex-col min-h-screen font-noto dark:bg-gray-600">
    <AppHeader />
    <Announcement />
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
import Announcement from './components/Announcement.vue';

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter,
    PatchNote,
    Announcement,
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
