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
      path: '/game',
      name: 'game',
      component: () => import('@/pages/game/index.vue'),
    },
    {
      path: '/showcase',
      name: 'showcase',
      component: () => import('@/pages/showcase/index.vue'),
    },
  ],
})

export default router
