
import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './components/HomePage.vue';
import AboutPage from './components/AboutPage.vue';
import ContactPage from './components/ContactPage.vue';
import SearchModule from './components/SearchModule.vue';
import PageNotFound from './components/PageNotFound.vue';


const routes = [
  { path: '/', component: HomePage },
  { path: '/about', component: AboutPage },
  { path: '/contact', component: ContactPage },
  {
    path: '/search',
    component: SearchModule, //enfer
    props: route => ({
        genes: route.query.genes ? route.query.genes.split(',') : [],
        phenotypes: route.query.phenotypes ? route.query.phenotypes.split(',') : [],
    }),
    
},

//Route de secours
{
  path: '/:pathMatch(.*)*',
  component: PageNotFound,
},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
