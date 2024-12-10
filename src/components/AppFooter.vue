<template>
  <div class="bg-gray-800 shadow-md ">
    <footer class="flex flex-row text-white justify-between h-16 py-4 mx-4 ">
      <!-- Left Section: Logo -->
      <div>
        <img class="h-full w-auto max-w-xs md:max-w-sm pr-4" src="/images/logoCHU.jpg" alt="Clinic Logo" />

      </div>

      <!-- Dark Mode Toggle 
      <div class="flex items-center ">
        <button
          @click="toggleDarkMode"
          class="p-2 rounded-full "
          aria-label="Toggle Dark Mode">
          <template v-if="isDarkMode">
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 0 1-.5-17.986V3c-.354.966-.5 1.911-.5 3a9 9 0 0 0 9 9c.239 0 .254.018.488 0A9.004 9.004 0 0 1 12 21Z"/>
            </svg>
          </template>
<template v-else>
            <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" d="M13 3a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0V3ZM6.343 4.929A1 1 0 0 0 4.93 6.343l1.414 1.414a1 1 0 0 0 1.414-1.414L6.343 4.929Zm12.728 1.414a1 1 0 0 0-1.414-1.414l-1.414 1.414a1 1 0 0 0 1.414 1.414l1.414-1.414ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm-9 4a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2H3Zm16 0a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2ZM7.757 17.657a1 1 0 1 0-1.414-1.414l-1.414 1.414a1 1 0 1 0 1.414 1.414l1.414-1.414Zm9.9-1.414a1 1 0 0 0-1.414 1.414l1.414 1.414a1 1 0 0 0 1.414-1.414l-1.414-1.414ZM13 19a1 1 0 1 0-2 0v2a1 1 0 1 0 2 0v-2Z" clip-rule="evenodd"/>
            </svg>
          </template>
</button>
<div class="ml-10 font-medium absolute flex items-center text-nowrap">
  <template v-if="isDarkMode">
            <p>Dark mode</p>
          </template>
  <template v-else>
            <p>Light mode</p>
          </template>
</div>
</div> -->


      <!-- Center Section: SVG and Rights -->
      <div class="flex items-center">
        <svg version="1.0" xmlns="http://www.w3.org/2000/svg" class="h-full w-auto max-w-xs md:max-w-sm"
          style="fill: currentColor; color: white" viewBox="0 0 198.000000 167.000000"
          preserveAspectRatio="xMidYMid meet">
          <g transform="translate(0.000000,167.000000) scale(0.050000,-0.050000)" fill="currentColor" stroke="none">
            <path d="..." />
          </g>
        </svg>
      </div>

      <!-- Center Section: Text -->
      <div class="container flex flex-col mx-auto text-center justify-center">
        <p>&copy; 2024 PubMatcher. All rights reserved.</p>
        <p class="text-sm">Made by Victor Marin</p>
      </div>



      <!-- Right Section: Report Bug Button -->
      <div class="flex items-center ">
        <button class="bg-red-500 rounded-md px-4 py-2 text-nowrap font-bold" @click="openModal">
          REPORT A BUG
        </button>
      </div>
    </footer>

    <!-- Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center">
      <div class="bg-white p-6 rounded-md w-96">
        <h2 class="text-lg font-bold mb-4">Report a Bug</h2>
        <label class="block mb-2">
          Your email:
          <input v-model="bugReport.name" type="text" class="border p-2 w-full rounded" />
        </label>
        <label class="block mb-4">
          Description:
          <textarea v-model="bugReport.description" class="border p-2 w-full rounded"></textarea>
        </label>
        <div class="flex justify-end space-x-4">
          <button @click="closeModal" class="bg-gray-500 text-white rounded-md px-4 py-2">
            Cancel
          </button>
          <button @click="submitBugReport" class="bg-blue-500 text-white rounded-md px-4 py-2">
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      isModalOpen: false,
      bugReport: {
        name: "",
        description: "",
      },
      isDarkMode: false,
    };
  },
  mounted() {
    this.isDarkMode =
      localStorage.getItem("color-theme") === "dark" ||
      (!("color-theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
  },
  methods: {
    openModal() {
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
    },
    async submitBugReport() {
      try {
        const response = await axios.post("api/reportbug", this.bugReport);
        alert("Bug report submitted successfully!");
        this.closeModal();
        this.bugReport = { name: "", description: "" };
      } catch (error) {
        console.error("Error submitting bug report:", error);
        alert("Failed to submit the bug report.");
      }
    },
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;

      if (this.isDarkMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("color-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("color-theme", "light");
      }
    },
  },
};
</script>
