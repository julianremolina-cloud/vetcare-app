const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../pages/LoginPage.vue'),
    meta: { requiereAuth: false }
  },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiereAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('../pages/DashboardPage.vue')
      },
      {
        path: 'propietarios',
        name: 'propietarios',
        component: () => import('../pages/PropietariosPage.vue')
      },
      {
        path: 'mascotas',
        name: 'mascotas',
        component: () => import('../pages/MascotasPage.vue')
      },
      {
        path: 'mascotas/:id/historial',
        name: 'historial-mascota',
        component: () => import('../pages/HistorialMascotaPage.vue')
      },
      {
        path: 'veterinarios',
        name: 'veterinarios',
        component: () => import('../pages/VeterinariosPage.vue')
      },
      {
        path: 'atenciones',
        name: 'atenciones',
        component: () => import('../pages/AtencionesPage.vue')
      },
      {
        path: 'usuarios',
        name: 'usuarios',
        component: () => import('../pages/UsuariosPage.vue'),
        meta: { requiereAdmin: true }
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    redirect: '/dashboard'
  }
];

export default routes;
