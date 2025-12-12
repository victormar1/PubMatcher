<template>
  <div id="app" class="flex flex-col min-h-screen font-noto dark:bg-gray-600">
    <AppHeader class="z-50" />
    <MaintenanceBanner :message="maintenanceMessage" />
    <!-- <PatchNote /> -->
    <main class="flex-grow flex flex-col">
      <router-view></router-view>
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import PatchNote from './components/PatchNote.vue';
import Announcement from './components/Announcement.vue';
import MastodonFeed from './components/MastodonFeed.vue';
import MaintenanceBanner from './components/MaintenanceBanner.vue';
import { useMastodonStore } from './stores/mastodonStore';

const mastodonStore = useMastodonStore();
const maintenanceMessage = computed(() => mastodonStore.maintenanceMessage);

onMounted(() => {
  applyDarkModePreference();
});

const applyDarkModePreference = () => {
  const storedTheme = localStorage.getItem('color-theme');

  if (storedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
</script>
