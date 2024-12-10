<template>
   <div class="flex flex-grow">
      <!-- Sidebar -->
      <Sidebar class="w-1/6 bg-gray-800  shadow-lg overflow-y-auto" />

      <!-- Content -->
      <div class="w-5/6 p-4 overflow-y-auto">
         <div class="h-full ">
            <router-view />
         </div>
      </div>
   </div>
</template>



<script>
import Sidebar from "./AboutSideBar.vue";

export default {
   name: "AboutPage",
   components: {
      Sidebar,
   },
};
</script>

<style></style>