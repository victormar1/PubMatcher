<template>
  <div class="contact">
    <p>
      Pour toute question, veuillez nous contacter à l'adresse suivante :
      <a href="mailto:Lnan@Fromage.fr">victor.marin@chu-bordeaux.fr</a>
    </p>


    <p>The team :</p>
    <div class="team-members">
      <div class="team-member" v-for="member in teamMembers" :key="member.name">
        <h3>{{ member.name }}</h3>
        <div class="social-links">
          <a :href="member.linkedin" target="_blank" v-if="member.linkedin">
            <i class="fab fa-linkedin"></i>
          </a>
          <a :href="member.github" target="_blank" v-if="member.github">
            <i class="fab fa-github"></i>
          </a>
          <!-- Ajoutez d'autres liens si nécessaire -->
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
          linkedin: 'https://www.linkedin.com/in/membre2/',
          github: 'https://github.com/membre2',
        },
        {
          name: 'Hugo Lannes',
          linkedin: 'https://www.linkedin.com/in/hugo-lannes/',
          github: 'https://github.com/HugoLannes',
        },
        {
          name: 'Victor Dumont',
          linkedin: 'https://www.linkedin.com/in/membre3/',
          github: 'https://github.com/membre3',
        },
        {
          name: 'Louis Lebreton',
          linkedin: 'https://www.linkedin.com/in/membre4/',
          github: 'https://github.com/membre4',
        },
      ],
    };
  },
};
</script>

<style scoped>
.contact {
  padding: 20px;
  font-family: Arial, sans-serif;
  text-align: center;
}

.contact h2 {
  color: #333;
}

.contact p {
  color: #555;
}

.contact a {
  color: #0077b5;
  text-decoration: none;
}

.contact a:hover {
  text-decoration: underline;
}

.team-members {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 2px;
}

.team-member {
  margin: 20px;
  text-align: center;
}

.team-member h3 {
  color: #333;
  margin-bottom: 10px;
}

.social-links {
  margin-top: 10px;
}

.social-links a {
  margin: 0 10px;
  color: #555;
  font-size: 2em;
  transition: color 0.3s;
}

.social-links a:hover {
  color: #0077b5;
}
</style>
