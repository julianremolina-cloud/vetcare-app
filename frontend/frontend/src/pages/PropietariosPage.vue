<template>
  <q-page class="q-pa-md q-pa-lg-lg">
    <!-- Encabezado de Página -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 page-title text-weight-bolder text-primary">
          Gestión de Propietarios
        </div>
        <div class="text-caption text-grey-7">
          Registro y administración de dueños de mascotas
        </div>
      </div>
      <div>
        <q-btn
          v-if="authStore.esAdmin || authStore.esAdministrativo"
          color="primary"
          icon="person_add"
          label="Nuevo Propietario"
          @click="abrirDialogoCrear"
        />
      </div>
    </div>

    <!-- Barra de Búsqueda y Filtros -->
    <q-card class="vet-card q-pa-sm q-mb-md bg-white">
      <div class="row items-center q-gutter-sm">
        <div class="col-12 col-sm-6 col-md-4">
          <q-input
            v-model="busqueda"
            outlined
            dense
            clearable
            placeholder="Buscar por nombre, documento o teléfono..."
            @update:model-value="buscarPropietarios"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="primary" />
            </template>
          </q-input>
        </div>
        <q-space />
        <div>
          <q-btn
            flat
            round
            color="primary"
            icon="refresh"
            @click="cargarDatos"
            :loading="propietarioStore.loading"
          >
            <q-tooltip>Actualizar listado</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card>

    <!-- Tabla de Propietarios -->
    <q-card class="vet-card">
      <q-table
        :rows="propietarioStore.propietarios"
        :columns="columnas"
        row-key="_id"
        :loading="propietarioStore.loading"
        no-data-label="No se encontraron propietarios registrados"
        class="vet-table"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template v-slot:body-cell-nombre="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-avatar size="32px" color="teal-1" text-color="primary" class="q-mr-sm">
                <q-icon name="person" size="18px" />
              </q-avatar>
              <div>
                <div class="text-weight-bold text-body2">{{ props.row.nombre }}</div>
                <div class="text-caption text-grey-6">{{ props.row.direccion || 'Sin dirección' }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-documento="props">
          <q-td :props="props">
            <q-badge color="grey-3" text-color="dark" class="text-body2 text-weight-medium">
              {{ props.row.documento }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-contacto="props">
          <q-td :props="props">
            <div><q-icon name="phone" size="14px" class="q-mr-xs text-grey-7" />{{ props.row.telefono }}</div>
            <div v-if="props.row.correo" class="text-caption text-grey-7">
              <q-icon name="email" size="14px" class="q-mr-xs" />{{ props.row.correo }}
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="text-right">
            <q-btn
              flat
              round
              dense
              color="info"
              icon="visibility"
              @click="verDetallePropietario(props.row)"
            >
              <q-tooltip>Ver detalle y mascotas</q-tooltip>
            </q-btn>
            <q-btn
              v-if="authStore.esAdmin || authStore.esAdministrativo"
              flat
              round
              dense
              color="primary"
              icon="edit"
              @click="abrirDialogoEditar(props.row)"
            >
              <q-tooltip>Editar propietario</q-tooltip>
            </q-btn>
            <q-btn
              v-if="authStore.esAdmin"
              flat
              round
              dense
              color="negative"
              icon="delete"
              @click="confirmarEliminar(props.row)"
            >
              <q-tooltip>Eliminar propietario</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Diálogo Crear/Editar Propietario -->
    <q-dialog v-model="dialogoFormulario" persistent>
      <q-card style="min-width: 450px; max-width: 90vw;" class="vet-dialog">
        <q-card-section class="bg-primary text-white row items-center">
          <q-icon :name="esEdicion ? 'edit' : 'person_add'" size="24px" class="q-mr-sm" />
          <div class="text-h6">{{ esEdicion ? 'Editar Propietario' : 'Registrar Nuevo Propietario' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="guardarPropietario" class="q-gutter-md">
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
              v-model="formulario.documento"
              label="Documento de Identidad *"
              outlined
              dense
              :rules="[val => !!val || 'El documento es obligatorio']"
            >
              <template v-slot:prepend><q-icon name="badge" /></template>
            </q-input>

            <q-input
              v-model="formulario.telefono"
              label="Teléfono de Contacto *"
              outlined
              dense
              :rules="[val => !!val || 'El teléfono es obligatorio']"
            >
              <template v-slot:prepend><q-icon name="phone" /></template>
            </q-input>

            <q-input
              v-model="formulario.correo"
              label="Correo Electrónico"
              type="email"
              outlined
              dense
              :rules="[val => !val || /^\S+@\S+\.\S+$/.test(val) || 'Correo no válido']"
            >
              <template v-slot:prepend><q-icon name="email" /></template>
            </q-input>

            <q-input
              v-model="formulario.direccion"
              label="Dirección de Residencia"
              outlined
              dense
            >
              <template v-slot:prepend><q-icon name="home" /></template>
            </q-input>

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

    <!-- Diálogo Ver Detalle y Mascotas del Propietario -->
    <q-dialog v-model="dialogoDetalle">
      <q-card style="min-width: 500px; max-width: 90vw;" class="vet-dialog">
        <q-card-section class="bg-secondary text-white row items-center">
          <q-icon name="badge" size="24px" class="q-mr-sm" />
          <div class="text-h6">Detalles del Propietario</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="propietarioSeleccionado">
          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">Nombre:</div>
              <div class="text-body1 text-weight-bold">{{ propietarioSeleccionado.nombre }}</div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">Documento:</div>
              <div class="text-body1">{{ propietarioSeleccionado.documento }}</div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">Teléfono:</div>
              <div class="text-body1">{{ propietarioSeleccionado.telefono }}</div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">Correo:</div>
              <div class="text-body1">{{ propietarioSeleccionado.correo || 'No registrado' }}</div>
            </div>
            <div class="col-12">
              <div class="text-caption text-grey-7">Dirección:</div>
              <div class="text-body1">{{ propietarioSeleccionado.direccion || 'No registrada' }}</div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- Mascotas Registradas a su Nombre -->
          <div class="text-subtitle1 text-weight-bold text-primary q-mb-sm row items-center">
            <q-icon name="pets" class="q-mr-xs" />
            Mascotas Vinculadas ({{ mascotasPropietario.length }})
          </div>

          <div v-if="mascotasPropietario.length === 0" class="text-caption text-grey-6 text-center q-pa-sm">
            Este propietario aún no tiene mascotas registradas.
          </div>

          <q-list v-else bordered separator class="rounded-borders">
            <q-item v-for="mascota in mascotasPropietario" :key="mascota._id">
              <q-item-section avatar>
                <q-avatar color="teal-1" text-color="primary" icon="pets" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ mascota.nombre }}</q-item-label>
                <q-item-label caption>
                  {{ mascota.especie }} • {{ mascota.raza || 'Mestizo' }} • Sexo: {{ mascota.sexo || 'N/A' }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  size="sm"
                  color="primary"
                  outline
                  label="Historial Clínico"
                  :to="`/mascotas/${mascota._id}/historial`"
                  v-close-popup
                />
              </q-item-section>
            </q-item>
          </q-list>
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
          ¿Está seguro de eliminar al propietario <strong>{{ propietarioAEliminar?.nombre }}</strong>?
          <div class="text-caption text-grey-7 q-mt-sm">
            Esta acción no se puede deshacer. No se permitirá eliminar si el propietario tiene mascotas activas registradas.
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
import { usePropietarioStore } from '../stores/propietario.js';
import { useAuthStore } from '../stores/auth.js';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const propietarioStore = usePropietarioStore();
const authStore = useAuthStore();

const busqueda = ref('');
const guardando = ref(false);
const eliminando = ref(false);

const dialogoFormulario = ref(false);
const esEdicion = ref(false);
const propietarioEditandoId = ref(null);

const dialogoDetalle = ref(false);
const propietarioSeleccionado = ref(null);
const mascotasPropietario = ref([]);

const dialogoEliminar = ref(false);
const propietarioAEliminar = ref(null);

const formulario = ref({
  nombre: '',
  documento: '',
  telefono: '',
  correo: '',
  direccion: ''
});

const columnas = [
  { name: 'nombre', label: 'Propietario', field: 'nombre', align: 'left', sortable: true },
  { name: 'documento', label: 'Documento', field: 'documento', align: 'left', sortable: true },
  { name: 'contacto', label: 'Contacto', field: 'telefono', align: 'left' },
  { name: 'acciones', label: 'Acciones', align: 'right' }
];

const cargarDatos = async () => {
  try {
    await propietarioStore.cargarPropietarios();
  } catch (error) {
    // Interceptor notifica
  }
};

let debounceTimer = null;
const buscarPropietarios = (val) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    propietarioStore.cargarPropietarios({ busqueda: val || '' });
  }, 350);
};

const abrirDialogoCrear = () => {
  esEdicion.value = false;
  propietarioEditandoId.value = null;
  formulario.value = {
    nombre: '',
    documento: '',
    telefono: '',
    correo: '',
    direccion: ''
  };
  dialogoFormulario.value = true;
};

const abrirDialogoEditar = (propietario) => {
  esEdicion.value = true;
  propietarioEditandoId.value = propietario._id;
  formulario.value = {
    nombre: propietario.nombre,
    documento: propietario.documento,
    telefono: propietario.telefono,
    correo: propietario.correo || '',
    direccion: propietario.direccion || ''
  };
  dialogoFormulario.value = true;
};

const verDetallePropietario = async (propietario) => {
  try {
    const data = await propietarioStore.cargarPropietarioPorId(propietario._id);
    propietarioSeleccionado.value = data.propietario;
    mascotasPropietario.value = data.mascotas || [];
    dialogoDetalle.value = true;
  } catch (error) {
    // Interceptor notifica
  }
};

const guardarPropietario = async () => {
  guardando.value = true;
  try {
    if (esEdicion.value) {
      const res = await propietarioStore.actualizarPropietario(propietarioEditandoId.value, formulario.value);
      $q.notify({
        type: 'positive',
        message: res.mensaje || 'Propietario actualizado exitosamente',
        icon: 'check_circle'
      });
    } else {
      const res = await propietarioStore.crearPropietario(formulario.value);
      $q.notify({
        type: 'positive',
        message: res.mensaje || 'Propietario registrado exitosamente',
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

const confirmarEliminar = (propietario) => {
  propietarioAEliminar.value = propietario;
  dialogoEliminar.value = true;
};

const ejecutarEliminar = async () => {
  eliminando.value = true;
  try {
    const res = await propietarioStore.eliminarPropietario(propietarioAEliminar.value._id);
    $q.notify({
      type: 'positive',
      message: res.mensaje || 'Propietario eliminado correctamente',
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
