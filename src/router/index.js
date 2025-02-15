import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
// Импортируем ваш middleware

const routes = [
  {
    path: '/',
    redirect: '/auth',
  },
  {
    path: '/tasks',
    component: () => import('../components/Tasks.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/auth',
    component: () => import('../views/Auth.vue'),
  },
  {
    path: '/tasks/:id',
    component: () => import('../components/Task.vue'),
    meta: { requiresAuth: true },
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Глобальный навигационный хук
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Если маршрут требует авторизации
  if (to.meta.requiresAuth) {
    // Проверяем, есть ли токен в localStorage
    const token = localStorage.getItem('token');

    if (token) {
      // Если пользователь не загружен, загружаем его данные
      if (!authStore.user) {
        try {
          await authStore.authMe(); // Загружаем данные пользователя
        } catch (error) {
          console.error('Ошибка загрузки пользователя:', error);
          localStorage.removeItem('token'); // Удаляем токен при ошибке
          return next('/auth'); // Перенаправляем на страницу авторизации
        }
      }
      // Если пользователь загружен, продолжаем навигацию
      return next();
    } else {
      // Если токена нет, перенаправляем на страницу авторизации
      return next('/auth');
    }
  }

  // Если маршрут не требует авторизации, продолжаем навигацию
  next();
});

export default router;
