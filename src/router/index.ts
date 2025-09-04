import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/index.vue'),
    },
    {
      path: '/funky-rocket-demo',
      name: 'funky-rocket-demo',
      component: () => import('@/pages/funky-rocket-demo/index.vue'),
    },
    {
      path: '/funky-rocket-showcase',
      name: 'funky-rocket-showcase',
      component: () => import('@/pages/funky-rocket-showcase/index.vue'),
    },
  ],
})

export default router
