<template>
  <div class="home">
    <SearchModule />
  </div>
</template>

<script>
import SearchModule from './SearchModule.vue';

export default {
  name: 'HomePage',
  components: {
    SearchModule,
  },
};
</script>

<style scoped>
.home {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.home h2 {
  color: #333;
}

.home p {
  color: #555;
}
</style>
