<template>
  <div class="mt-40 about py-10 text-center ">
    <p class="text-gray-700 text-lg mb-5">
      PubMatcher is an automated genomic search tool that integrates biological
      databases and APIs to facilitate genetic interpretation.
    </p>
    <p class="text-gray-800 text-xl font-semibold mb-2">It allows users to:</p>
    <div class="features flex flex-wrap justify-center mb-12">
      <div class="feature-item w-64 m-4 text-center" v-for="feature in features" :key="feature.title">
        <i :class="feature.icon" class="text-5xl text-blue-600 mb-2"></i>
        <h3 class="text-gray-800 text-xl font-semibold mb-2">
          {{ feature.title }}
        </h3>
        <p class="text-gray-600">{{ feature.description }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutPage',
  data() {
    return {
      features: [
        {
          title: 'Gene Constraint Verification',
          icon: 'fas fa-dna',
        },
        {
          title: 'Search for Scientific Publications',
          icon: 'fas fa-book',
        },
        {
          title: 'Extraction of Protein Functions',
          icon: 'fas fa-flask',
        },
        {
          title: 'Mouse Phenotype Verification',
          icon: 'fas fa-mouse',
        },
        {
          title: 'Access to GenCC and PanelApp',
          icon: 'fas fa-database',
        },
      ],
    };
  },
};
</script>

<style scoped>
@import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
</style>
