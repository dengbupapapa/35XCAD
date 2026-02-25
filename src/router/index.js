import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/editor' },
    {
      path: '/editor',
      component: () => import('@/view/editor/editor.vue'),
    },
  ],
})

export default router
