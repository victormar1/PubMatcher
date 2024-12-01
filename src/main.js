import { createApp } from 'vue'
import App from './app.vue'
import router from './router'
import './assets/tailwind.css'
import '@fortawesome/fontawesome-free/css/all.css'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'
import VueGtag, { event } from 'vue-gtag'

createApp(App)
  .use(router)
  .use(
    VueGtag,
    {
      config: { id: 'G-PGNGTTRTN2' },
      debug_mode: true
    },
    router
  )
  .use(FloatingVue)
  .mount('#app')
