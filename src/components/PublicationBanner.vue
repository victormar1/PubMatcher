<template>
  <transition name="fade">
    <div v-if="visible"
      class="relative mx-auto mb-6 max-w-4xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">

      <!-- Left accent border -->
      <div class="absolute inset-y-0 left-0 w-1 bg-blue-500"></div>

      <div class="flex items-start gap-3 py-3 pl-5 pr-10">

        <!-- Icon -->
        <div class="flex-shrink-0 mt-0.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 text-white">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-flex items-center rounded-md bg-blue-500 px-2 py-0.5 text-xs font-bold text-white">
              New Publication
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              European Journal of Human Genetics · Nature
            </span>
          </div>

          <h3 class="text-sm font-semibold leading-snug text-gray-900 dark:text-white">
            PubMatcher: a web app to support genomic data interpretation through simplified bibliographic research
          </h3>

          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span class="font-medium text-gray-600 dark:text-gray-300">Marin V</span>,
            Lannes H, Dumont V, Thevenon J, Baux D, Roux AF, Lasseaux E, Pennamen P, Lebreton L
            <span class="mx-1">·</span>
            March 2026
          </p>

          <div class="mt-2 flex items-center gap-3">
            <a href="https://www.nature.com/articles/s41431-026-02068-z" target="_blank" rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 rounded-md bg-gray-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-600 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600">
              Read the paper
              <svg class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
            <span class="text-xs text-gray-400 dark:text-gray-500 select-all">
              DOI: 10.1038/s41431-026-02068-z
            </span>
          </div>
        </div>
      </div>

      <!-- Dismiss button -->
      <button @click="dismiss"
        class="absolute right-2 top-2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
        aria-label="Dismiss">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const STORAGE_KEY = 'pubmatcher-paper-dismissed'
const visible = ref(false)

onMounted(() => {
  visible.value = localStorage.getItem(STORAGE_KEY) !== 'true'
})

function dismiss() {
  visible.value = false
  localStorage.setItem(STORAGE_KEY, 'true')
}
</script>

<style scoped>
.fade-enter-active {
  transition: opacity 0.3s ease;
}
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
