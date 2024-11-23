<template>
  <div class="about">
    <p>
      PubMatcher 2.0 is an automated genomic search tool that integrates
      biological databases and APIs to facilitate genetic interpretation. It allows users to:
    </p>
    <div class="features">
      <div class="feature-item" v-for="feature in features" :key="feature.title">
        <i :class="feature.icon"></i>
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.description }}</p>
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
.about {
  padding: 20px;
  font-family: Arial, sans-serif;
  text-align: center;
}

.about h2 {
  color: #333;
  margin-bottom: 30px;
}

.about p {
  color: #555;
  font-size: 1.1em;
  margin-bottom: 20px;
}

.features {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 50px;
}

.feature-item {
  width: 250px;
  margin: 15px;
  text-align: center;
}

.feature-item i {
  font-size: 3em;
  color: #0077b5;
  margin-bottom: 10px;
}

.feature-item h3 {
  color: #333;
  margin-bottom: 10px;
}

.feature-item p {
  color: #555;
}
</style>
