<template>
  <div class="flex flex-col gap-8">
    <PMDB />
    <SearchModule />
  </div>
</template>

<script>
import SearchModule from './SearchModule.vue';
import PMDB from './PMDB.vue';

export default {
  name: 'HomePage',
  components: {
    SearchModule,
    PMDB,
  },
};
</script>
