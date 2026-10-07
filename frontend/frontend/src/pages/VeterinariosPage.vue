<template>
  <q-page class="q-pa-md q-pa-lg-lg">
    <!-- Encabezado de Página -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 page-title text-weight-bolder text-primary">
          Cuerpo Médico Veterinario
        </div>
        <div class="text-caption text-grey-7">
          Registro de profesionales veterinarios y sus especialidades
        </div>
      </div>
      <div>
        <q-btn
          v-if="authStore.esAdmin"
          color="primary"
          icon="person_add"
          label="Nuevo Veterinario"
          @click="abrirDialogoCrear"
        />
      </div>
    </div>

    <!-- Filtros y Búsqueda -->
    <q-card class="vet-card q-pa-sm q-mb-md bg-white">
      <div class="row items-center q-gutter-sm">
        <div class="col-12 col-sm-6 col-md-4">
          <q-input
            v-model="busqueda"
            outlined
            dense
            clearable
            placeholder="Buscar por nombre, documento o especialidad..."
            @update:model-value="filtrarVeterinarios"
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
            :loading="veterinarioStore.loading"
          >
            <q-tooltip>Actualizar listado</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card>

    <!-- Tabla de Veterinarios -->
    <q-card class="vet-card">
      <q-table
        :rows="veterinarioStore.veterinarios"
        :columns="columnas"
        row-key="_id"
        :loading="veterinarioStore.loading"
        no-data-label="No se encontraron veterinarios registrados"
        class="vet-table"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template v-slot:body-cell-veterinario="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-avatar size="36px" color="teal-1" text-color="primary" class="q-mr-sm">
                <q-icon name="medical_services" size="20px" />
              </q-avatar>
              <div>
                <div class="text-weight-bold text-body2">{{ props.row.nombre }}</div>
                <div class="text-caption text-grey-6">Doc: {{ props.row.documento }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-especialidad="props">
          <q-td :props="props">
            <q-badge color="teal-8" class="text-body2 text-weight-medium">
              {{ props.row.especialidad || 'Medicina General' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-contacto="props">
          <q-td :props="props">
            <div><q-icon name="phone" size="14px" class="q-mr-xs text-grey-7" />{{ props.row.telefono }}</div>
            <div class="text-caption text-grey-7">
              <q-icon name="email" size="14px" class="q-mr-xs" />{{ props.row.correo }}
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-badge :color="props.row.activo ? 'positive' : 'grey-6'">
              {{ props.row.activo ? 'Activo' : 'Inactivo' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="text-right">
            <q-btn
              v-if="authStore.esAdmin"
              flat
              round
              dense
              color="primary"
              icon="edit"
              @click="abrirDialogoEditar(props.row)"
            >
              <q-tooltip>Editar veterinario</q-tooltip>
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
              <q-tooltip>Eliminar veterinario</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Diálogo Crear/Editar Veterinario -->
    <q-dialog v-model="dialogoFormulario" persistent>
      <q-card style="min-width: 480px; max-width: 90vw;" class="vet-dialog">
        <q-card-section class="bg-primary text-white row items-center">
          <q-icon :name="esEdicion ? 'edit' : 'badge'" size="24px" class="q-mr-sm" />
          <div class="text-h6">{{ esEdicion ? 'Editar Veterinario' : 'Registrar Veterinario' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="guardarVeterinario" class="q-gutter-md">
            <q-input
              v-model="formulario.nombre"
              label="Nombre Completo con Título *"
              placeholder="Ej. Dr. Carlos Mendoza"
              outlined
              dense
              :rules="[val => !!val || 'El nombre es obligatorio']"
            >
              <template v-slot:prepend><q-icon name="person" /></template>
            </q-input>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="formulario.documento"
                  label="Documento / Registro Profesional *"
                  outlined
                  dense
                  :rules="[val => !!val || 'El documento es obligatorio']"
                >
                  <template v-slot:prepend><q-icon name="badge" /></template>
                </q-input>
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model="formulario.telefono"
                  label="Teléfono de Contacto *"
                  outlined
                  dense
                  :rules="[val => !!val || 'El teléfono es obligatorio']"
                >
                  <template v-slot:prepend><q-icon name="phone" /></template>
                </q-input>
              </div>
            </div>

            <q-input
              v-model="formulario.correo"
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
              v-model="formulario.especialidad"
              label="Especialidad Médica"
              placeholder="Ej. Cirugía, Dermatología, Felinos, Medicina General"
              outlined
              dense
            >
              <template v-slot:prepend><q-icon name="school" /></template>
            </q-input>

            <div v-if="esEdicion" class="q-mt-sm">
              <q-toggle
                v-model="formulario.activo"
                label="Veterinario activo en clínica"
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
          ¿Está seguro de eliminar al veterinario <strong>{{ veterinarioAEliminar?.nombre }}</strong>?
          <div class="text-caption text-grey-7 q-mt-sm">
            Si el veterinario tiene atenciones registradas, se desactivará lógicamente para preservar el historial clínico.
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
import { useVeterinarioStore } from '../stores/veterinario.js';
import { useAuthStore } from '../stores/auth.js';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const veterinarioStore = useVeterinarioStore();
const authStore = useAuthStore();

const busqueda = ref('');
const guardando = ref(false);
const eliminando = ref(false);

const dialogoFormulario = ref(false);
const esEdicion = ref(false);
const veterinarioEditandoId = ref(null);

const dialogoEliminar = ref(false);
const veterinarioAEliminar = ref(null);

const formulario = ref({
  nombre: '',
  documento: '',
  telefono: '',
  correo: '',
  especialidad: 'Medicina General',
  activo: true
});

const columnas = [
  { name: 'veterinario', label: 'Veterinario', field: 'nombre', align: 'left', sortable: true },
  { name: 'especialidad', label: 'Especialidad', field: 'especialidad', align: 'left', sortable: true },
  { name: 'contacto', label: 'Contacto', field: 'telefono', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'right' }
];

const cargarDatos = async () => {
  try {
    await veterinarioStore.cargarVeterinarios();
  } catch (error) {
    // Interceptor notifica
  }
};

let debounceTimer = null;
const filtrarVeterinarios = (val) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    veterinarioStore.cargarVeterinarios({ busqueda: val || '' });
  }, 350);
};

const abrirDialogoCrear = () => {
  esEdicion.value = false;
  veterinarioEditandoId.value = null;
  formulario.value = {
    nombre: '',
    documento: '',
    telefono: '',
    correo: '',
    especialidad: 'Medicina General',
    activo: true
  };
  dialogoFormulario.value = true;
};

const abrirDialogoEditar = (veterinario) => {
  esEdicion.value = true;
  veterinarioEditandoId.value = veterinario._id;
  formulario.value = {
    nombre: veterinario.nombre,
    documento: veterinario.documento,
    telefono: veterinario.telefono,
    correo: veterinario.correo,
    especialidad: veterinario.especialidad || 'Medicina General',
    activo: veterinario.activo
  };
  dialogoFormulario.value = true;
};

const guardarVeterinario = async () => {
  guardando.value = true;
  try {
    if (esEdicion.value) {
      const res = await veterinarioStore.actualizarVeterinario(veterinarioEditandoId.value, formulario.value);
      $q.notify({
        type: 'positive',
        message: res.mensaje || 'Veterinario actualizado exitosamente',
        icon: 'check_circle'
      });
    } else {
      const res = await veterinarioStore.crearVeterinario(formulario.value);
      $q.notify({
        type: 'positive',
        message: res.mensaje || 'Veterinario registrado exitosamente',
        icon: 'badge'
      });
    }
    dialogoFormulario.value = false;
  } catch (error) {
    // Interceptor notifica
  } finally {
    guardando.value = false;
  }
};

const confirmarEliminar = (veterinario) => {
  veterinarioAEliminar.value = veterinario;
  dialogoEliminar.value = true;
};

const ejecutarEliminar = async () => {
  eliminando.value = true;
  try {
    const res = await veterinarioStore.eliminarVeterinario(veterinarioAEliminar.value._id);
    $q.notify({
      type: 'positive',
      message: res.mensaje || 'Veterinario eliminado correctamente',
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
