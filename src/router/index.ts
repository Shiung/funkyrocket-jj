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

router.beforeEach(async (to, from, next) => {
  const queryFromWindow = Object.fromEntries(new URLSearchParams(window.location.search))

  const mergedQuery = { ...queryFromWindow, ...to.query }

  if (JSON.stringify(to.query) !== JSON.stringify(mergedQuery)) {
    next({
      path: to.path,
      query: mergedQuery,
      // replace: true
    })
  } else {
    next()
  }
})

export default router
