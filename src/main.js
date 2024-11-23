
import { createApp } from 'vue';
import App from './app.vue';
import router from './router';
import './assets/tailwind.css';
import '@fortawesome/fontawesome-free/css/all.css';

createApp(App)
  .use(router)
  .mount('#app');
