<template>
  <div class="contact-page">
    <!-- Contact Information -->
    <div class="contact py-10 px-6 text-center">
      <p class="text-lg text-gray-700 mb-10">
        For inquiries, please contact us at:
        <a href="mailto:admin@pubmatcher.fr" class="text-blue-600 hover:underline font-semibold">
          admin@pubmatcher.fr
        </a>
      </p>

      <!-- GitHub Section -->
      <div class="team-members flex justify-center mt-10">
        <div class="team-member bg-white shadow-lg rounded-lg p-6 w-64 text-center">
          <div class="flex justify-center mb-4">
            <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub Logo"
              class="h-16 w-16" />
          </div>
          <p class="text-sm text-gray-700 mb-4">
            Explore and contribute to the PubMatcher project on GitHub.
          </p>
          <a href="https://github.com/victormar1/PubMatcher" target="_blank"
            class="text-white bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg font-medium text-lg transition duration-200">
            Visit GitHub
          </a>
        </div>
      </div>

      <!-- Team Section -->
      <p class="text-2xl font-bold text-gray-800 mt-12 mb-6">The Team</p>
      <div class="team-members flex flex-wrap justify-center gap-8">
        <div class="team-member bg-white shadow-lg rounded-lg p-6 w-64 text-center" v-for="member in teamMembers"
          :key="member.name">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            {{ member.name }}
          </h3>
          <div class="social-links flex justify-center space-x-4 mt-4">
            <a :href="member.linkedin" target="_blank" class="text-gray-500 hover:text-blue-600" v-if="member.linkedin">
              <i class="fab fa-linkedin fa-2x"></i>
            </a>
            <a :href="member.github" target="_blank" class="text-gray-500 hover:text-black" v-if="member.github">
              <i class="fab fa-github fa-2x"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContactPage',
  data() {
    return {
      teamMembers: [
        {
          name: 'Victor Marin',
          linkedin: 'https://www.linkedin.com/in/victor-marin-033a29257/',
          github: 'https://github.com/victormar1',
        },
        {
          name: 'Hugo Lannes',
          linkedin: 'https://www.linkedin.com/in/hugo-lannes/',
          github: 'https://github.com/HugoLannes',
        },
        {
          name: 'Victor Dumont',
          linkedin: 'https://www.linkedin.com/in/victor-dumont-108183165/',
          github: 'https://github.com/victorDumont',
        },
        {
          name: 'Louis Lebreton',
          linkedin: 'https://www.linkedin.com/in/louis-lebreton-749839197/',
        },
      ],
    };
  },
};
</script>

<style scoped>
.contact-page {
  font-family: 'Arial', sans-serif;
}

.team-member {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.team-member:hover {
  transform: translateY(-5px);
  box-shadow: 0px 10px 15px rgba(0, 0, 0, 0.1);
}
</style>
