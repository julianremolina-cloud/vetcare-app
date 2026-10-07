import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes.js';
import { useAuthStore } from '../stores/auth.js';
import { Notify } from 'quasar';
import { setRouter } from '../boot/axios.js';

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 })
});

// Registrar la instancia del router en el interceptor de Axios
setRouter(router);

// Navigation Guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiereAuth = to.matched.some((record) => record.meta.requiereAuth !== false);
  const requiereAdmin = to.matched.some((record) => record.meta.requiereAdmin);

  // 1. Si va a una ruta protegida y no está autenticado -> /login
  if (requiereAuth && !authStore.estaAutenticado) {
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }

  // 2. Si ya está autenticado e intenta ir a login -> /dashboard
  if (to.name === 'login' && authStore.estaAutenticado) {
    return next({ name: 'dashboard' });
  }

  // 3. Si la ruta requiere admin y el rol no es administrador -> advertir y redirigir
  if (requiereAdmin && !authStore.esAdmin) {
    Notify.create({
      type: 'warning',
      message: 'Acceso restringido: Se requieren permisos de Administrador para esta sección',
      icon: 'admin_panel_settings',
      position: 'top-right'
    });
    return next({ name: 'dashboard' });
  }

  next();
});

export default router;
