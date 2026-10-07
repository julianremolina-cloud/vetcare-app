<template>
  <q-page class="q-pa-md q-pa-lg-lg">
    <!-- Encabezado de Página -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 page-title text-weight-bolder text-primary">
          Gestión de Usuarios del Sistema
        </div>
        <div class="text-caption text-grey-7">
          Administración de cuentas de acceso y asignación de roles
        </div>
      </div>
      <div>
        <q-btn
          color="primary"
          icon="person_add"
          label="Nuevo Usuario"
          @click="abrirDialogoCrear"
        />
      </div>
    </div>

    <!-- Filtros y Búsqueda -->
    <q-card class="vet-card q-pa-sm q-mb-md bg-white">
      <div class="row items-center q-gutter-sm">
        <div class="col-12 col-sm-5 col-md-4">
          <q-input
            v-model="busqueda"
            outlined
            dense
            clearable
            placeholder="Buscar por nombre o correo..."
            @update:model-value="filtrarUsuarios"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="primary" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-sm-4 col-md-3">
          <q-select
            v-model="filtroRol"
            :options="opcionesRolesFiltro"
            label="Rol de Usuario"
            outlined
            dense
            clearable
            emit-value
            map-options
            @update:model-value="filtrarUsuarios"
          />
        </div>

        <q-space />
        <div>
          <q-btn
            flat
            round
            color="primary"
            icon="refresh"
            @click="cargarDatos"
            :loading="usuarioStore.loading"
          >
            <q-tooltip>Actualizar listado</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card>

    <!-- Tabla de Usuarios -->
    <q-card class="vet-card">
      <q-table
        :rows="usuarioStore.usuarios"
        :columns="columnas"
        row-key="_id"
        :loading="usuarioStore.loading"
        no-data-label="No se encontraron usuarios registrados"
        class="vet-table"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template v-slot:body-cell-usuario="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-avatar size="36px" color="teal-1" text-color="primary" class="q-mr-sm">
                <q-icon name="account_circle" size="22px" />
              </q-avatar>
              <div>
                <div class="text-weight-bold text-body2">{{ props.row.nombre }}</div>
                <div class="text-caption text-grey-7">{{ props.row.email }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-rol="props">
          <q-td :props="props">
            <q-badge
              :color="obtenerColorRol(props.row.rol)"
              text-color="white"
              class="text-caption text-weight-bold q-px-sm text-capitalize"
            >
              {{ props.row.rol }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props" class="text-center">
            <q-badge :color="props.row.activo ? 'positive' : 'grey-6'">
              {{ props.row.activo ? 'Activo' : 'Inactivo' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="text-right">
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="edit"
              @click="abrirDialogoEditar(props.row)"
            >
              <q-tooltip>Editar usuario</q-tooltip>
            </q-btn>

            <q-btn
              v-if="props.row._id !== authStore.usuario?._id"
              flat
              round
              dense
              color="negative"
              icon="delete"
              @click="confirmarEliminar(props.row)"
            >
              <q-tooltip>Eliminar usuario</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Diálogo Crear/Editar Usuario -->
    <q-dialog v-model="dialogoFormulario" persistent>
      <q-card style="min-width: 450px; max-width: 90vw;" class="vet-dialog">
        <q-card-section class="bg-primary text-white row items-center">
          <q-icon :name="esEdicion ? 'edit' : 'person_add'" size="24px" class="q-mr-sm" />
          <div class="text-h6">{{ esEdicion ? 'Editar Usuario' : 'Registrar Nuevo Usuario' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="guardarUsuario" class="q-gutter-md">
            <q-input
              v-model="formulario.nombre"
              label="Nombre Completo *"
              outlined
              dense
              :rules="[val => !!val || 'El nombre es obligatorio']"
            >
              <template v-slot:prepend><q-icon name="person" /></template>
            </q-input>

            <q-input
              v-model="formulario.email"
              label="Correo Electrónico *"
              type="email"
              outlined
              dense
              :rules="[
                val => !!val || 'El correo es obligatorio',
                val => /^\S+@\S+\.\S+$/.test(val) || 'Correo no válido'
              ]"
            >
              <template v-slot:prepend><q-icon name="email" /></template>
            </q-input>

            <q-input
              v-model="formulario.password"
              :label="esEdicion ? 'Contraseña (Dejar en blanco para conservar actual)' : 'Contraseña *'"
              type="password"
              outlined
              dense
              :rules="esEdicion ? [] : [
                val => !!val || 'La contraseña es obligatoria',
                val => val.length >= 6 || 'Mínimo 6 caracteres'
              ]"
            >
              <template v-slot:prepend><q-icon name="lock" /></template>
            </q-input>

            <q-select
              v-model="formulario.rol"
              :options="[
                { label: 'Administrador (Acceso Total)', value: 'administrador' },
                { label: 'Administrativo (Recepción / Citas)', value: 'administrativo' },
                { label: 'Veterinario (Consultas y Diagnósticos)', value: 'veterinario' }
              ]"
              label="Rol en el Sistema *"
              emit-value
              map-options
              outlined
              dense
              :rules="[val => !!val || 'Seleccione un rol']"
            >
              <template v-slot:prepend><q-icon name="shield" /></template>
            </q-select>

            <div v-if="esEdicion" class="q-mt-sm">
              <q-toggle
                v-model="formulario.activo"
                label="Usuario activo"
                color="positive"
              />
            </div>

            <div class="row justify-end q-gutter-sm q-mt-lg">
              <q-btn label="Cancelar" flat color="grey-7" v-close-popup />
              <q-btn
                :label="esEdicion ? 'Guardar Cambios' : 'Registrar'"
                type="submit"
                color="primary"
                :loading="guardando"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Diálogo Confirmación de Eliminación -->
    <q-dialog v-model="dialogoEliminar" persistent>
      <q-card class="vet-dialog" style="min-width: 350px">
        <q-card-section class="bg-negative text-white row items-center">
          <q-icon name="warning" size="24px" class="q-mr-sm" />
          <div class="text-h6">Confirmar Eliminación</div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          ¿Está seguro de eliminar al usuario <strong>{{ usuarioAEliminar?.nombre }}</strong>?
          <div class="text-caption text-grey-7 q-mt-sm">
            Esta acción eliminará el acceso de esta persona a VetCare.
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            label="Eliminar"
            color="negative"
            :loading="eliminando"
            @click="ejecutarEliminar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUsuarioStore } from '../stores/usuario.js';
import { useAuthStore } from '../stores/auth.js';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const usuarioStore = useUsuarioStore();
const authStore = useAuthStore();

const busqueda = ref('');
const filtroRol = ref(null);
const guardando = ref(false);
const eliminando = ref(false);

const dialogoFormulario = ref(false);
const esEdicion = ref(false);
const usuarioEditandoId = ref(null);

const dialogoEliminar = ref(false);
const usuarioAEliminar = ref(null);

const opcionesRolesFiltro = [
  { label: 'Todos los roles', value: null },
  { label: 'Administrador', value: 'administrador' },
  { label: 'Administrativo', value: 'administrativo' },
  { label: 'Veterinario', value: 'veterinario' }
];

const formulario = ref({
  nombre: '',
  email: '',
  password: '',
  rol: 'administrativo',
  activo: true
});

const columnas = [
  { name: 'usuario', label: 'Usuario', field: 'nombre', align: 'left', sortable: true },
  { name: 'rol', label: 'Rol Asignado', field: 'rol', align: 'left', sortable: true },
  { name: 'estado', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'right' }
];

const obtenerColorRol = (rol) => {
  switch (rol) {
    case 'administrador': return 'purple-8';
    case 'veterinario': return 'teal-7';
    case 'administrativo': return 'blue-8';
    default: return 'grey-7';
  }
};

const cargarDatos = async () => {
  try {
    const params = {};
    if (busqueda.value) params.busqueda = busqueda.value;
    if (filtroRol.value) params.rol = filtroRol.value;
    await usuarioStore.cargarUsuarios(params);
  } catch (error) {
    // Interceptor notifica
  }
};

let debounceTimer = null;
const filtrarUsuarios = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    cargarDatos();
  }, 350);
};

const abrirDialogoCrear = () => {
  esEdicion.value = false;
  usuarioEditandoId.value = null;
  formulario.value = {
    nombre: '',
    email: '',
    password: '',
    rol: 'administrativo',
    activo: true
  };
  dialogoFormulario.value = true;
};

const abrirDialogoEditar = (usuario) => {
  esEdicion.value = true;
  usuarioEditandoId.value = usuario._id;
  formulario.value = {
    nombre: usuario.nombre,
    email: usuario.email,
    password: '', // Opcional en edición
    rol: usuario.rol,
    activo: usuario.activo
  };
  dialogoFormulario.value = true;
};

const guardarUsuario = async () => {
  guardando.value = true;
  try {
    const datosEnvio = { ...formulario.value };
    if (esEdicion.value && !datosEnvio.password) {
      delete datosEnvio.password;
    }

    if (esEdicion.value) {
      const res = await usuarioStore.actualizarUsuario(usuarioEditandoId.value, datosEnvio);
      $q.notify({
        type: 'positive',
        message: res.mensaje || 'Usuario actualizado exitosamente',
        icon: 'check_circle'
      });
    } else {
      const res = await usuarioStore.crearUsuario(datosEnvio);
      $q.notify({
        type: 'positive',
        message: res.mensaje || 'Usuario registrado exitosamente',
        icon: 'person_add'
      });
    }
    dialogoFormulario.value = false;
  } catch (error) {
    // Interceptor notifica
  } finally {
    guardando.value = false;
  }
};

const confirmarEliminar = (usuario) => {
  usuarioAEliminar.value = usuario;
  dialogoEliminar.value = true;
};

const ejecutarEliminar = async () => {
  eliminando.value = true;
  try {
    const res = await usuarioStore.eliminarUsuario(usuarioAEliminar.value._id);
    $q.notify({
      type: 'positive',
      message: res.mensaje || 'Usuario eliminado correctamente',
      icon: 'delete'
    });
    dialogoEliminar.value = false;
  } catch (error) {
    // Interceptor notifica
  } finally {
    eliminando.value = false;
  }
};

onMounted(() => {
  cargarDatos();
});
</script>
