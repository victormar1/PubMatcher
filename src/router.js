
import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './components/HomePage.vue';
import AboutPage from './components/AboutPage.vue';
import ContactPage from './components/ContactPage.vue';

const routes = [
  { path: '/', component: HomePage },
  { path: '/about', component: AboutPage },
  { path: '/contact', component: ContactPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
