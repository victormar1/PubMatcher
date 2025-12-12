import { createApp } from 'vue'
import App from './app.vue'
import router from './router'
import './assets/tailwind.css'
import '@fortawesome/fontawesome-free/css/all.css'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'
import VueGtag from 'vue-gtag'
import 'flowbite'
import { createPinia } from 'pinia'

const app = createApp(App)
  .use(router)
  .use(createPinia())
  .use(FloatingVue)

const gaTrackingId = process.env.VUE_APP_GA_TRACKING_ID
if (gaTrackingId) {
  app.use(
    VueGtag,
    {
      config: { id: gaTrackingId },
      debug_mode: process.env.NODE_ENV !== 'production'
    },
    router
  )
  console.log('Google Analytics enabled')
} else {
  console.log('Google Analytics disabled (VUE_APP_GA_TRACKING_ID not set)')
}

app.mount('#app')
