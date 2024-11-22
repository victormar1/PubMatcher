
<template>
  <div class="about">
    <h2>À propos de PubMatcher</h2>
    <p>PubMatcher 2.0 est un outil automatisé de recherche génomique qui intègre des bases de données biologiques et des APIs pour faciliter l'interprétation génétique. Il permet aux utilisateurs de :</p>
    <ul>
      <li>Vérifier les contraintes des gènes.</li>
      <li>Rechercher des publications scientifiques pertinentes.</li>
      <li>Extraire des informations sur les fonctions protéiques.</li>
      <li>Vérifier les phénotypes chez la souris.</li>
      <li>Accéder aux données de GenCC et PanelApp.</li>
    </ul>
    <p>Pensé et développé par Victor Marin, Victor Dumont, Hugo Lannes et Louis Lebreton.</p>
  </div>
</template>

<script>
export default {
  name: 'AboutPage',
};
</script>

<style scoped>
.about {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.about h2 {
  color: #333;
}

.about ul {
  list-style-type: disc;
  margin-left: 20px;
}

.about p, .about li {
  color: #555;
}
</style>
