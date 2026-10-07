<template>
  <q-page class="q-pa-md q-pa-lg-lg">
    <!-- Encabezado de Página -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 page-title text-weight-bolder text-primary">
          Gestión de Mascotas
        </div>
        <div class="text-caption text-grey-7">
          Registro de pacientes animales y asignación a sus propietarios
        </div>
      </div>
      <div>
        <q-btn
          v-if="authStore.esAdmin || authStore.esAdministrativo"
          color="primary"
          icon="add"
          label="Nueva Mascota"
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
            placeholder="Buscar por nombre o raza..."
            @update:model-value="filtrarMascotas"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="primary" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-sm-4 col-md-3">
          <q-select
            v-model="filtroEspecie"
            :options="opcionesEspeciesFiltro"
            label="Especie"
            outlined
            dense
            clearable
            emit-value
            map-options
            @update:model-value="filtrarMascotas"
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
            :loading="mascotaStore.loading"
          >
            <q-tooltip>Actualizar listado</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card>

    <!-- Tabla de Mascotas -->
    <q-card class="vet-card">
      <q-table
        :rows="mascotaStore.mascotas"
        :columns="columnas"
        row-key="_id"
        :loading="mascotaStore.loading"
        no-data-label="No se encontraron mascotas registradas"
        class="vet-table"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template v-slot:body-cell-mascota="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-avatar size="36px" color="teal-1" text-color="primary" class="q-mr-sm">
                <q-icon :name="props.row.especie === 'Felino' ? 'cruelty_free' : 'pets'" size="20px" />
              </q-avatar>
              <div>
                <div class="text-weight-bold text-body2">{{ props.row.nombre }}</div>
                <div class="text-caption text-grey-7">
                  <q-badge color="teal-7" outline class="q-mr-xs">{{ props.row.especie }}</q-badge>
                  {{ props.row.raza || 'Mestizo' }}
                </div>
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-propietario="props">
          <q-td :props="props">
            <div v-if="props.row.propietario">
              <div class="text-weight-medium">{{ props.row.propietario.nombre }}</div>
              <div class="text-caption text-grey-7">
                Doc: {{ props.row.propietario.documento }} • Tel: {{ props.row.propietario.telefono }}
              </div>
            </div>
            <span v-else class="text-grey-5">No asignado</span>
          </q-td>
        </template>

        <template v-slot:body-cell-detalles="props">
          <q-td :props="props">
            <div class="text-caption">
              <div><strong>Sexo:</strong> {{ props.row.sexo || 'No especificado' }}</div>
              <div><strong>Color:</strong> {{ props.row.color || 'No especificado' }}</div>
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
              color="primary"
              dense
              unelevated
              size="sm"
              icon="medical_information"
              label="Historial"
              :to="`/mascotas/${props.row._id}/historial`"
              class="q-mr-xs"
            >
              <q-tooltip>Consultar Historial Clínico</q-tooltip>
            </q-btn>

            <q-btn
              v-if="authStore.esAdmin || authStore.esAdministrativo || authStore.esVeterinario"
              flat
              round
              dense
              color="secondary"
              icon="edit"
              @click="abrirDialogoEditar(props.row)"
            >
              <q-tooltip>Editar Mascota</q-tooltip>
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
              <q-tooltip>Eliminar Mascota</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Diálogo Crear/Editar Mascota -->
    <q-dialog v-model="dialogoFormulario" persistent>
      <q-card style="min-width: 500px; max-width: 90vw;" class="vet-dialog">
        <q-card-section class="bg-primary text-white row items-center">
          <q-icon :name="esEdicion ? 'edit' : 'pets'" size="24px" class="q-mr-sm" />
          <div class="text-h6">{{ esEdicion ? 'Editar Mascota' : 'Registrar Mascota' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="guardarMascota" class="q-gutter-md">
            <!-- Propietario -->
            <q-select
              v-model="formulario.propietario"
              :options="opcionesPropietarios"
              option-value="_id"
              option-label="etiqueta"
              emit-value
              map-options
              label="Propietario *"
              outlined
              dense
              use-input
              input-debounce="300"
              @filter="filtrarPropietarios"
              :rules="[val => !!val || 'Seleccione un propietario']"
            >
              <template v-slot:prepend><q-icon name="person" /></template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">No se encontraron propietarios</q-item-section>
                </q-item>
              </template>
            </q-select>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="formulario.nombre"
                  label="Nombre de la Mascota *"
                  outlined
                  dense
                  :rules="[val => !!val || 'El nombre es obligatorio']"
                >
                  <template v-slot:prepend><q-icon name="pets" /></template>
                </q-input>
              </div>

              <div class="col-12 col-sm-6">
                <q-select
                  v-model="formulario.especie"
                  :options="['Canino', 'Felino', 'Ave', 'Roedor', 'Reptil', 'Otro']"
                  label="Especie *"
                  outlined
                  dense
                  :rules="[val => !!val || 'La especie es obligatoria']"
                />
              </div>
            </div>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="formulario.raza"
                  label="Raza"
                  placeholder="Ej. Mestizo, Golden, Siamés"
                  outlined
                  dense
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-select
                  v-model="formulario.sexo"
                  :options="['Macho', 'Hembra']"
                  label="Sexo"
                  outlined
                  dense
                  clearable
                />
              </div>
            </div>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="formulario.fechaNacimiento"
                  label="Fecha de Nacimiento"
                  outlined
                  dense
                  placeholder="YYYY-MM-DD"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="formulario.fechaNacimiento" mask="YYYY-MM-DD">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Cerrar" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model="formulario.color"
                  label="Color / Señas particulares"
                  outlined
                  dense
                />
              </div>
            </div>

            <div v-if="esEdicion" class="q-mt-sm">
              <q-toggle
                v-model="formulario.activo"
                label="Mascota activa en clínica"
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
          ¿Está seguro de eliminar a la mascota <strong>{{ mascotaAEliminar?.nombre }}</strong>?
          <div class="text-caption text-grey-7 q-mt-sm">
            Si la mascota cuenta con atenciones médicas previas, será desactivada lógicamente para preservar su historial clínico.
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
import { useMascotaStore } from '../stores/mascota.js';
import { useAuthStore } from '../stores/auth.js';
import { useQuasar } from 'quasar';
import propietarioService from '../services/propietarioService.js';

const $q = useQuasar();
const mascotaStore = useMascotaStore();
const authStore = useAuthStore();

const busqueda = ref('');
const filtroEspecie = ref(null);
const guardando = ref(false);
const eliminando = ref(false);

const dialogoFormulario = ref(false);
const esEdicion = ref(false);
const mascotaEditandoId = ref(null);

const dialogoEliminar = ref(false);
const mascotaAEliminar = ref(null);

const todosLosPropietarios = ref([]);
const opcionesPropietarios = ref([]);

const opcionesEspeciesFiltro = [
  { label: 'Todas las especies', value: null },
  { label: 'Canino', value: 'Canino' },
  { label: 'Felino', value: 'Felino' },
  { label: 'Ave', value: 'Ave' },
  { label: 'Roedor', value: 'Roedor' },
  { label: 'Otro', value: 'Otro' }
];

const formulario = ref({
  nombre: '',
  especie: 'Canino',
  raza: '',
  sexo: '',
  fechaNacimiento: '',
  color: '',
  propietario: null,
  activo: true
});

const columnas = [
  { name: 'mascota', label: 'Mascota', field: 'nombre', align: 'left', sortable: true },
  { name: 'propietario', label: 'Propietario', field: row => row.propietario?.nombre, align: 'left' },
  { name: 'detalles', label: 'Características', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'right' }
];

const cargarDatos = async () => {
  try {
    await mascotaStore.cargarMascotas();
    const dataProps = await propietarioService.obtenerPropietarios();
    todosLosPropietarios.value = (dataProps.propietarios || []).map(p => ({
      ...p,
      etiqueta: `${p.nombre} (Doc: ${p.documento})`
    }));
    opcionesPropietarios.value = [...todosLosPropietarios.value];
  } catch (error) {
    // Interceptor notifica
  }
};

let debounceTimer = null;
const filtrarMascotas = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const params = {};
    if (busqueda.value) params.busqueda = busqueda.value;
    if (filtroEspecie.value) params.especie = filtroEspecie.value;
    mascotaStore.cargarMascotas(params);
  }, 300);
};

const filtrarPropietarios = (val, update) => {
  update(() => {
    if (!val) {
      opcionesPropietarios.value = [...todosLosPropietarios.value];
    } else {
      const term = val.toLowerCase();
      opcionesPropietarios.value = todosLosPropietarios.value.filter(
        p => p.etiqueta.toLowerCase().includes(term)
      );
    }
  });
};

const abrirDialogoCrear = () => {
  esEdicion.value = false;
  mascotaEditandoId.value = null;
  formulario.value = {
    nombre: '',
    especie: 'Canino',
    raza: 'Mestizo',
    sexo: 'Macho',
    fechaNacimiento: '',
    color: '',
    propietario: null,
    activo: true
  };
  dialogoFormulario.value = true;
};

const abrirDialogoEditar = (mascota) => {
  esEdicion.value = true;
  mascotaEditandoId.value = mascota._id;
  formulario.value = {
    nombre: mascota.nombre,
    especie: mascota.especie,
    raza: mascota.raza || '',
    sexo: mascota.sexo || '',
    fechaNacimiento: mascota.fechaNacimiento ? mascota.fechaNacimiento.split('T')[0] : '',
    color: mascota.color || '',
    propietario: mascota.propietario?._id || mascota.propietario,
    activo: mascota.activo
  };
  dialogoFormulario.value = true;
};

const guardarMascota = async () => {
  guardando.value = true;
  try {
    if (esEdicion.value) {
      const res = await mascotaStore.actualizarMascota(mascotaEditandoId.value, formulario.value);
      $q.notify({
        type: 'positive',
        message: res.mensaje || 'Mascota actualizada exitosamente',
        icon: 'check_circle'
      });
    } else {
      const res = await mascotaStore.crearMascota(formulario.value);
      $q.notify({
        type: 'positive',
        message: res.mensaje || 'Mascota registrada exitosamente',
        icon: 'pets'
      });
    }
    dialogoFormulario.value = false;
  } catch (error) {
    // Interceptor notifica
  } finally {
    guardando.value = false;
  }
};

const confirmarEliminar = (mascota) => {
  mascotaAEliminar.value = mascota;
  dialogoEliminar.value = true;
};

const ejecutarEliminar = async () => {
  eliminando.value = true;
  try {
    const res = await mascotaStore.eliminarMascota(mascotaAEliminar.value._id);
    $q.notify({
      type: 'positive',
      message: res.mensaje || 'Mascota eliminada correctamente',
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
