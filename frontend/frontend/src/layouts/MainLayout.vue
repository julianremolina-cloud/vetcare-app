<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header Principal -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title class="row items-center q-gutter-sm">
          <q-icon name="pets" size="28px" />
          <span class="text-weight-bold">VetCare</span>
          <span class="text-caption text-teal-1 q-ml-sm gt-xs">Sistema de Gestión Veterinaria</span>
        </q-toolbar-title>

        <!-- Menú de Usuario -->
        <div class="row items-center q-gutter-sm">
          <q-btn flat no-caps class="q-px-sm">
            <div class="row items-center no-wrap">
              <q-avatar size="32px" color="teal-8" text-color="white">
                <q-icon name="person" size="20px" />
              </q-avatar>
              <div class="text-left q-ml-sm gt-xs">
                <div class="text-weight-medium text-body2">{{ authStore.nombreUsuario }}</div>
                <q-badge
                  :color="rolBadgeColor"
                  text-color="white"
                  class="text-capitalize"
                >
                  {{ authStore.rolUsuario }}
                </q-badge>
              </div>
              <q-icon name="arrow_drop_down" size="20px" />
            </div>

            <q-menu anchor="bottom right" self="top right">
              <q-list style="min-width: 220px">
                <q-item-label header class="text-weight-bold">Cuenta de Usuario</q-item-label>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="account_circle" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ authStore.usuario?.nombre }}</q-item-label>
                    <q-item-label caption>{{ authStore.usuario?.email }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item clickable v-close-popup @click="abrirDialogoPassword">
                  <q-item-section avatar>
                    <q-icon name="lock_reset" color="secondary" />
                  </q-item-section>
                  <q-item-section>Cambiar Contraseña</q-item-section>
                </q-item>

                <q-separator />

                <q-item clickable v-close-popup @click="cerrarSesion" class="text-negative">
                  <q-item-section avatar>
                    <q-icon name="logout" color="negative" />
                  </q-item-section>
                  <q-item-section class="text-weight-bold">Cerrar Sesión</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <!-- Barra Lateral (Drawer) -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-grey-1"
    >
      <div class="q-pa-md bg-teal-9 text-white text-center">
        <q-icon name="local_hospital" size="48px" class="q-mb-xs" />
        <div class="text-h6 text-weight-bold">VetCare Clínica</div>
        <div class="text-caption text-teal-2">Atención y Consulta Médica</div>
      </div>

      <q-list padding class="text-grey-9">
        <q-item-label header class="text-weight-bold text-uppercase text-grey-7">
          Menú Principal
        </q-item-label>

        <q-item clickable v-ripple to="/dashboard" active-class="bg-teal-1 text-primary text-weight-bold">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/atenciones" active-class="bg-teal-1 text-primary text-weight-bold">
          <q-item-section avatar>
            <q-icon name="medical_services" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Atenciones</q-item-label>
            <q-item-label caption>Citas y Consultas</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/mascotas" active-class="bg-teal-1 text-primary text-weight-bold">
          <q-item-section avatar>
            <q-icon name="pets" />
          </q-item-section>
          <q-item-section>Mascotas</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/propietarios" active-class="bg-teal-1 text-primary text-weight-bold">
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>
          <q-item-section>Propietarios</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/veterinarios" active-class="bg-teal-1 text-primary text-weight-bold">
          <q-item-section avatar>
            <q-icon name="badge" />
          </q-item-section>
          <q-item-section>Veterinarios</q-item-section>
        </q-item>

        <!-- Sección de Administración (Solo Administrador) -->
        <template v-if="authStore.esAdmin">
          <q-separator class="q-my-sm" />
          <q-item-label header class="text-weight-bold text-uppercase text-grey-7">
            Administración
          </q-item-label>

          <q-item clickable v-ripple to="/usuarios" active-class="bg-teal-1 text-primary text-weight-bold">
            <q-item-section avatar>
              <q-icon name="manage_accounts" />
            </q-item-section>
            <q-item-section>Usuarios del Sistema</q-item-section>
          </q-item>
        </template>
      </q-list>

      <div class="absolute-bottom q-pa-md text-center text-caption text-grey-6 border-top">
        VetCare v1.0 • Vue 3 + Quasar
      </div>
    </q-drawer>

    <!-- Contenido de las Páginas -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Diálogo para cambiar contraseña -->
    <q-dialog v-model="dialogoPassword" persistent>
      <q-card style="min-width: 380px" class="vet-dialog">
        <q-card-section class="bg-primary text-white row items-center">
          <q-icon name="lock_reset" size="24px" class="q-mr-sm" />
          <div class="text-h6">Cambiar Contraseña</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="guardarNuevoPassword" class="q-gutter-md">
            <q-input
              v-model="passwordForm.passwordActual"
              label="Contraseña Actual"
              type="password"
              outlined
              dense
              :rules="[val => !!val || 'Ingrese su contraseña actual']"
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
            </q-input>

            <q-input
              v-model="passwordForm.nuevoPassword"
              label="Nueva Contraseña"
              type="password"
              outlined
              dense
              :rules="[
                val => !!val || 'Ingrese la nueva contraseña',
                val => val.length >= 6 || 'Debe tener al menos 6 caracteres'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="vpn_key" />
              </template>
            </q-input>

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn label="Cancelar" flat color="grey-7" v-close-popup />
              <q-btn
                label="Actualizar"
                type="submit"
                color="primary"
                :loading="guardandoPassword"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import { useQuasar } from 'quasar';
import authService from '../services/authService.js';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const leftDrawerOpen = ref(false);
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const rolBadgeColor = computed(() => {
  switch (authStore.rolUsuario) {
    case 'administrador':
      return 'purple-8';
    case 'veterinario':
      return 'teal-7';
    case 'administrativo':
      return 'blue-8';
    default:
      return 'grey-7';
  }
});

// Cerrar sesión
const cerrarSesion = () => {
  authStore.logout();
  $q.notify({
    type: 'info',
    message: 'Sesión cerrada correctamente',
    icon: 'exit_to_app'
  });
  router.push('/login');
};

// Cambio de contraseña
const dialogoPassword = ref(false);
const guardandoPassword = ref(false);
const passwordForm = ref({
  passwordActual: '',
  nuevoPassword: ''
});

const abrirDialogoPassword = () => {
  passwordForm.value = { passwordActual: '', nuevoPassword: '' };
  dialogoPassword.value = true;
};

const guardarNuevoPassword = async () => {
  guardandoPassword.value = true;
  try {
    const res = await authService.cambiarPassword(passwordForm.value);
    $q.notify({
      type: 'positive',
      message: res.mensaje || 'Contraseña actualizada correctamente',
      icon: 'check_circle'
    });
    dialogoPassword.value = false;
  } catch (error) {
    // Manejado por interceptor de Axios
  } finally {
    guardandoPassword.value = false;
  }
};
</script>

<style scoped>
.border-top {
  border-top: 1px solid #e2e8f0;
}
</style>
