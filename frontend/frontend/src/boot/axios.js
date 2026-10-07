import axios from 'axios';
import { Notify } from 'quasar';

// Crear instancia de Axios utilizando la variable de entorno VITE_API_URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Referencia al router para redirecciones automáticas en 401
let routerInstance = null;

export const setRouter = (router) => {
  routerInstance = router;
};

// Interceptor de Solicitud: Inyectar el token JWT
api.interceptors.request.use(
  (config) => {
    // Obtener token persistido desde localStorage (guardado por Pinia)
    try {
      const authStorage = localStorage.getItem('vetcare-auth');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        if (parsed?.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      }
    } catch {
      // Si falla la lectura, se envía sin encabezado
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Respuesta: Manejo centralizado de errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (!error.response) {
      // Error de red o backend no disponible
      Notify.create({
        type: 'negative',
        message: 'No se pudo conectar con el servidor backend. Verifique que el servicio esté en ejecución.',
        icon: 'cloud_off',
        position: 'top-right'
      });
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const mensajeError = data?.mensaje || 'Ha ocurrido un error en la solicitud';

    switch (status) {
      case 401:
        Notify.create({
          type: 'warning',
          message: mensajeError || 'Sesión expirada o no autorizada. Por favor inicie sesión.',
          icon: 'lock',
          position: 'top-right'
        });

        // Limpiar sesión local y redirigir
        localStorage.removeItem('vetcare-auth');
        if (routerInstance && routerInstance.currentRoute.value.path !== '/login') {
          routerInstance.push('/login');
        }
        break;

      case 403:
        Notify.create({
          type: 'negative',
          message: mensajeError || 'Acceso denegado: No cuenta con permisos para realizar esta acción.',
          icon: 'block',
          position: 'top-right'
        });
        break;

      case 404:
        Notify.create({
          type: 'negative',
          message: mensajeError || 'Recurso no encontrado.',
          icon: 'search_off',
          position: 'top-right'
        });
        break;

      case 400:
      case 422:
        // Si hay lista de errores detallada
        if (Array.isArray(data?.errores) && data.errores.length > 0) {
          data.errores.forEach((err) => {
            Notify.create({
              type: 'negative',
              message: err,
              icon: 'warning',
              position: 'top-right'
            });
          });
        } else {
          Notify.create({
            type: 'negative',
            message: mensajeError,
            icon: 'warning',
            position: 'top-right'
          });
        }
        break;

      case 500:
        Notify.create({
          type: 'negative',
          message: 'Error interno del servidor. Intente nuevamente más tarde.',
          icon: 'error',
          position: 'top-right'
        });
        break;

      default:
        Notify.create({
          type: 'negative',
          message: mensajeError,
          icon: 'error_outline',
          position: 'top-right'
        });
    }

    return Promise.reject(error);
  }
);

export default ({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
};

export { api };
