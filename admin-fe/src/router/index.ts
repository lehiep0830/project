import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'UserManagement',
      component: () => import('../views/UserManagement.vue'),
      meta: {
        title: 'User Management',
      },
    },
    {
      path: '/users',
      name: 'UserManagements',
      component: () => import('../views/UserManagement.vue'),
      meta: {
        title: 'User Managements',
      },
    },
    {
      path: '/groups',
      name: 'GroupManagement',
      component: () => import('../views/GroupManagement.vue'),
      meta: {
        title: 'Group Managements',
      },
    },
    {
      path: '/permissions',
      name: 'PermissionManagement',
      component: () => import('../views/PermissionManagement.vue'),
      meta: {
        title: 'Permission Managements',
      },
    },
    {
      path: '/signin',
      name: 'Signin',
      component: () => import('../views/Auth/Signin.vue'),
      meta: {
        title: 'Signin',
      },
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/Auth/Signup.vue'),
      meta: {
        title: 'Signup',
      },
    },
  ],
})

export default router


router.beforeEach((to, from, next) => {
  document.title = `Vue.js ${to.meta.title} | TailAdmin - Vue.js Tailwind CSS Dashboard Template`
  const token = localStorage.getItem('token');
  if (!token && to.path !== '/signin' && to.path !== '/signup') {
    next({ path: '/signin' });
  } else {
    next();
  }
});
