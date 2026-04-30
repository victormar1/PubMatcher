<template>
  <div class="relative mx-auto mb-6 max-w-4xl overflow-hidden rounded-lg border border-amber-200 bg-amber-50 shadow-sm dark:border-amber-700 dark:bg-amber-900/20">

    <!-- Left accent border -->
    <div class="absolute inset-y-0 left-0 w-1 bg-amber-500"></div>

    <div class="flex items-start gap-3 py-3 pl-5 pr-5">

      <!-- Warning icon -->
      <div class="flex-shrink-0 mt-0.5">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-white">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.732 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="inline-flex items-center rounded-md bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
            Degraded service
          </span>
        </div>

        <h3 class="text-sm font-semibold leading-snug text-gray-900 dark:text-white">
          Searches are currently slower than usual
        </h3>

        <p class="mt-1 text-xs text-gray-600 dark:text-gray-300">
          Due to upstream API rate limits, fetching publications may take a few seconds longer than usual.
          Results remain accurate. We apologize for the inconvenience.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>
