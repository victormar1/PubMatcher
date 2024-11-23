
import { createApp } from 'vue';
import App from './app.vue';
import router from './router';
import './assets/tailwind.css';
import '@fortawesome/fontawesome-free/css/all.css';
import FloatingVue from 'floating-vue';
import 'floating-vue/dist/style.css';

createApp(App)
  .use(router)
  .use(FloatingVue)
  .mount('#app');
