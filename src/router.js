import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './components/HomePage.vue'
import AboutPage from './components/AboutPage.vue'
import ContactPage from './components/ContactPage.vue'
import SearchModule from './components/SearchModule.vue'
import PageNotFound from './components/PageNotFound.vue'
import LoginPage from './components/LoginPage.vue'
import RegisterPage from './components/RegisterPage.vue'
import AccountPage from './components/AccountPage.vue'
import ForgotPasswordPage from './components/ForgotPasswordPage.vue'
import ResetPasswordPage from './components/ResetPasswordPage.vue'
import ChangelogPage from './components/ChangelogPage.vue'
import AboutGeneralPage from './components/AboutGeneralPage.vue'
import HowToUsePage from './components/HowToUsePage.vue'
import DisclaimerPage from './components/DisclaimerPage.vue'
import LegalMentionsPage from './components/LegalMentionsPage.vue'

function isAuthenticated() {
  const token = localStorage.getItem('token')
  return !!token
}

const routes = [
  { path: '/', component: HomePage },
  {
    path: '/about',
    component: AboutPage,
    children: [
      { path: 'general', component: AboutGeneralPage },
      { path: 'howto', component: HowToUsePage },
      { path: 'changelog', component: ChangelogPage },
      { path: 'disclaimer', component: DisclaimerPage },
      { path: 'legals', component: LegalMentionsPage },
      { path: 'contact', component: ContactPage }
    ]
  },

  {
    path: '/search',
    component: SearchModule, //enfer
    props: (route) => ({
      genes: route.query.genes ? route.query.genes.split(',') : [],
      phenotypes: route.query.phenotypes ? route.query.phenotypes.split(',') : []
    })
  },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
  {
    path: '/account',
    component: AccountPage,
    meta: { requiresAuth: true }
  },

  //Route de secours
  {
    path: '/:pathMatch(.*)*',
    component: PageNotFound
  },
  {
    path: '/forgot-password',
    component: ForgotPasswordPage
  },
  {
    path: '/reset-password:token',
    component: ResetPasswordPage,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    // If route requires auth and user is not authenticated, redirect to login
    return next('/login')
  }
  next() // Otherwise, allow access
})

export default router
