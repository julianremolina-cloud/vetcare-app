<template>
  <div class="login-wrapper row justify-center items-center">
    <div class="col-11 col-sm-8 col-md-5 col-lg-4">
      <q-card class="vet-card q-pa-md-lg q-pa-sm-md">
        <!-- Encabezado con Identidad de Marca -->
        <div class="text-center q-mb-lg">
          <q-avatar size="72px" color="teal-1" text-color="primary" class="q-mb-sm shadow-1">
            <q-icon name="pets" size="40px" />
          </q-avatar>
          <div class="text-h4 text-weight-bolder text-primary">VetCare</div>
          <div class="text-subtitle2 text-grey-7">Gestión Integral de Veterinaria</div>
        </div>

        <q-separator class="q-mb-md" />

        <!-- Formulario de Acceso -->
        <q-form @submit="iniciarSesion" class="q-gutter-md">
          <q-input
            v-model="credenciales.email"
            label="Correo Electrónico"
            type="email"
            outlined
            dense
            autocomplete="email"
            :rules="[
              val => !!val || 'El correo electrónico es obligatorio',
              val => /^\S+@\S+\.\S+$/.test(val) || 'Ingrese un correo electrónico válido'
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="mail" color="primary" />
            </template>
          </q-input>

          <q-input
            v-model="credenciales.password"
            label="Contraseña"
            :type="verPassword ? 'text' : 'password'"
            outlined
            dense
            autocomplete="current-password"
            :rules="[
              val => !!val || 'La contraseña es obligatoria',
              val => val.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="primary" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="verPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="verPassword = !verPassword"
              />
            </template>
          </q-input>

          <div class="q-mt-lg">
            <q-btn
              label="Ingresar al Sistema"
              type="submit"
              color="primary"
              size="large"
              class="full-width text-weight-bold"
              :loading="cargando"
              icon-right="login"
            />
          </div>
        </q-form>

        <!-- Accesos directos de demostración -->
        <div class="q-mt-lg">
          <div class="text-caption text-grey-7 text-center q-mb-xs">Cuentas de prueba del sistema:</div>
          <div class="row q-gutter-xs justify-center">
            <q-btn
              size="xs"
              outline
              color="purple-8"
              label="Admin"
              @click="rellenarCredenciales('admin@vetcare.com', 'Admin123!')"
            />
            <q-btn
              size="xs"
              outline
              color="blue-8"
              label="Recepción"
              @click="rellenarCredenciales('recepcion@vetcare.com', 'Recepcion123!')"
            />
            <q-btn
              size="xs"
              outline
              color="teal-8"
              label="Veterinario"
              @click="rellenarCredenciales('dr.mendoza@vetcare.com', 'Vet123!')"
            />
          </div>
        </div>

        <div class="text-center text-caption text-grey-5 q-mt-md">
          Conexión segura vía API REST &amp; MongoDB Atlas
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const credenciales = ref({
  email: '',
  password: ''
});

const verPassword = ref(false);
const cargando = ref(false);

const rellenarCredenciales = (email, password) => {
  credenciales.value.email = email;
  credenciales.value.password = password;
};

const iniciarSesion = async () => {
  cargando.value = true;
  try {
    const respuesta = await authStore.login(credenciales.value);
    $q.notify({
      type: 'positive',
      message: `¡Bienvenido, ${respuesta.usuario.nombre}!`,
      caption: `Rol: ${respuesta.usuario.rol}`,
      icon: 'verified',
      position: 'top-right'
    });

    const destino = route.query.redirect || '/dashboard';
    router.push(destino);
  } catch (error) {
    // Los errores son notificados automáticamente por el interceptor de Axios
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #0d9488 0%, #0f172a 100%);
  padding: 16px;
}
</style>
