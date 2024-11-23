<template>
  <header class="bg-gray-800 py-4">
    <div class="flex justify-between px-4 items-center">
      <div class="flex items-center">
        <img
          class="max-h-12 w-auto object-cover"
          src="/PM4.svg"
          alt="Clinic Logo"
        />
        <!-- Titre principal -->
        <div class="flex items-baseline space-x-1">
          <h1 class="text-5xl font-bold text-white">PubMatcher</h1>
          <h1 class="text-sm font-bold text-white">2.0</h1>
        </div>
      </div>
      <nav>
        <router-link to="/" class="text-white hover:text-blue-200 mx-2">Home</router-link>
        <router-link to="/about" class="text-white hover:text-blue-200 mx-2">About</router-link>
        <router-link to="/contact" class="text-white hover:text-blue-200 mx-2">Contact</router-link>
      </nav>
    </div>
  </header>
</template>
