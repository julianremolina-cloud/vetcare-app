<template>
  <q-page class="q-pa-md q-pa-lg-lg">
    <!-- Botón Volver y Título -->
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center">
        <q-btn flat round icon="arrow_back" color="primary" to="/mascotas" class="q-mr-sm">
          <q-tooltip>Regresar a mascotas</q-tooltip>
        </q-btn>
        <div>
          <div class="text-h5 page-title text-weight-bolder text-primary">
            Historial Clínico Veterinario
          </div>
          <div class="text-caption text-grey-7">
            Registro cronológico de consultas y atenciones médicas
          </div>
        </div>
      </div>
      <div>
        <q-btn
          color="primary"
          icon="add_circle"
          label="Nueva Atención"
          @click="irANuevaAtencion"
        />
      </div>
    </div>

    <!-- Indicador de Carga -->
    <q-inner-loading :showing="cargando">
      <q-spinner-dots size="50px" color="primary" />
    </q-inner-loading>

    <!-- Tarjeta de Ficha de la Mascota y Propietario -->
    <q-card v-if="mascota" class="vet-card q-pa-md q-mb-lg bg-white">
      <div class="row items-center q-col-gutter-md">
        <div class="col-auto">
          <q-avatar size="64px" color="teal-1" text-color="primary" class="shadow-1">
            <q-icon :name="mascota.especie === 'Felino' ? 'cruelty_free' : 'pets'" size="36px" />
          </q-avatar>
        </div>

        <div class="col-12 col-sm-6 col-md-4">
          <div class="text-h6 text-weight-bold text-primary">{{ mascota.nombre }}</div>
          <div class="text-body2 text-grey-8">
            <q-badge color="teal-7" class="q-mr-xs">{{ mascota.especie }}</q-badge>
            <span>{{ mascota.raza || 'Mestizo' }}</span> • <span>{{ mascota.sexo || 'Sexo N/A' }}</span>
          </div>
          <div class="text-caption text-grey-6 q-mt-xs">
            Color: {{ mascota.color || 'No especificado' }}
          </div>
        </div>

        <q-separator vertical class="gt-xs q-mx-md" />

        <div class="col-12 col-sm-5 col-md-4">
          <div class="text-caption text-uppercase text-weight-bold text-grey-7">Propietario Responsable</div>
          <div class="text-body1 text-weight-medium">{{ mascota.propietario?.nombre || 'No asignado' }}</div>
          <div class="text-caption text-grey-8">
            <q-icon name="badge" size="14px" class="q-mr-xs" />Doc: {{ mascota.propietario?.documento || 'N/A' }}
            <br />
            <q-icon name="phone" size="14px" class="q-mr-xs" />Tel: {{ mascota.propietario?.telefono || 'N/A' }}
          </div>
        </div>

        <q-space />

        <div class="col-auto text-right">
          <q-badge color="secondary" outline class="text-body2 q-pa-sm">
            Total Atenciones: {{ atenciones.length }}
          </q-badge>
        </div>
      </div>
    </q-card>

    <!-- Sección de Atenciones / Historial Clínico -->
    <div class="text-h6 text-weight-bold q-mb-md row items-center text-grey-9">
      <q-icon name="history" color="primary" class="q-mr-sm" size="24px" />
      Atenciones Registradas
    </div>

    <!-- Estado Vacío -->
    <q-card v-if="!cargando && atenciones.length === 0" class="vet-card q-pa-xl text-center text-grey-7 bg-white">
      <q-avatar size="64px" color="grey-2" text-color="grey-6" class="q-mb-md">
        <q-icon name="medical_services" size="36px" />
      </q-avatar>
      <div class="text-h6 text-weight-bold">Sin registros clínicos</div>
      <div class="text-body2 q-mt-xs text-grey-6">
        Esta mascota aún no cuenta con atenciones o consultas veterinarias registradas.
      </div>
      <div class="q-mt-md">
        <q-btn
          color="primary"
          icon="add_circle"
          label="Crear Primera Atención"
          @click="irANuevaAtencion"
        />
      </div>
    </q-card>

    <!-- Lista de Fichas de Atención -->
    <div v-else class="q-gutter-y-md">
      <q-card
        v-for="atencion in atenciones"
        :key="atencion._id"
        class="vet-card bg-white q-pa-md"
        :style="obtenerBordePorEstado(atencion.estado)"
      >
        <!-- Encabezado de la Atención -->
        <div class="row items-center justify-between q-mb-sm">
          <div class="row items-center q-gutter-sm">
            <q-badge :color="obtenerColorEstado(atencion.estado)" class="text-body2 text-weight-bold q-px-sm">
              {{ atencion.estado }}
            </q-badge>
            <div class="text-body1 text-weight-bold text-primary">
              <q-icon name="calendar_today" size="16px" class="q-mr-xs" />
              {{ formatearFecha(atencion.fecha) }} • {{ atencion.hora }}
            </div>
          </div>

          <div class="text-caption text-grey-8">
            <q-icon name="person" size="14px" class="q-mr-xs text-primary" />
            Atendido por: <strong>{{ atencion.veterinario?.nombre || 'Veterinario' }}</strong>
            <span v-if="atencion.veterinario?.especialidad"> ({{ atencion.veterinario.especialidad }})</span>
          </div>
        </div>

        <q-separator class="q-my-sm" />

        <!-- Contenido Clínico -->
        <div class="row q-col-gutter-md q-pt-xs">
          <!-- Motivo de Consulta -->
          <div class="col-12">
            <div class="text-caption text-weight-bold text-uppercase text-grey-7">Motivo de Consulta:</div>
            <div class="text-body2 text-weight-medium text-grey-9">{{ atencion.motivoConsulta }}</div>
          </div>

          <!-- Síntomas -->
          <div v-if="atencion.sintomas" class="col-12 col-md-6">
            <div class="text-caption text-weight-bold text-uppercase text-amber-9">
              <q-icon name="coronavirus" size="14px" class="q-mr-xs" />Síntomas / Cuadro Clínico:
            </div>
            <div class="text-body2 text-grey-8 bg-amber-1 q-pa-xs rounded-borders">
              {{ atencion.sintomas }}
            </div>
          </div>

          <!-- Diagnóstico -->
          <div v-if="atencion.diagnostico" class="col-12 col-md-6">
            <div class="text-caption text-weight-bold text-uppercase text-teal-9">
              <q-icon name="verified" size="14px" class="q-mr-xs" />Diagnóstico:
            </div>
            <div class="text-body2 text-weight-bold text-teal-10 bg-teal-1 q-pa-xs rounded-borders">
              {{ atencion.diagnostico }}
            </div>
          </div>

          <!-- Tratamiento -->
          <div v-if="atencion.tratamiento" class="col-12">
            <div class="text-caption text-weight-bold text-uppercase text-light-blue-9">
              <q-icon name="medication" size="14px" class="q-mr-xs" />Tratamiento e Indicaciones:
            </div>
            <div class="text-body2 text-grey-9 bg-light-blue-1 q-pa-xs rounded-borders">
              {{ atencion.tratamiento }}
            </div>
          </div>

          <!-- Observaciones -->
          <div v-if="atencion.observaciones" class="col-12">
            <div class="text-caption text-weight-bold text-uppercase text-grey-6">Observaciones:</div>
            <div class="text-caption text-grey-8">{{ atencion.observaciones }}</div>
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMascotaStore } from '../stores/mascota.js';

const route = useRoute();
const router = useRouter();
const mascotaStore = useMascotaStore();

const cargando = ref(false);
const mascota = ref(null);
const atenciones = ref([]);

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '';
  const d = new Date(fechaStr);
  return d.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const obtenerColorEstado = (estado) => {
  switch (estado) {
    case 'Programada':
      return 'warning';
    case 'En curso':
      return 'info';
    case 'Finalizada':
      return 'positive';
    case 'Cancelada':
      return 'negative';
    default:
      return 'grey-7';
  }
};

const obtenerBordePorEstado = (estado) => {
  const color = obtenerColorEstado(estado);
  const coloresHex = {
    warning: '#f59e0b',
    info: '#0284c7',
    positive: '#10b981',
    negative: '#ef4444',
    'grey-7': '#9e9e9e'
  };
  return {
    borderLeft: `5px solid ${coloresHex[color] || '#0d9488'}`
  };
};

const cargarHistorial = async () => {
  cargando.value = true;
  try {
    const data = await mascotaStore.cargarHistorialMascota(route.params.id);
    mascota.value = data.mascota;
    atenciones.value = data.atenciones || [];
  } catch (error) {
    // Interceptor notifica
  } finally {
    cargando.value = false;
  }
};

const irANuevaAtencion = () => {
  router.push({
    path: '/atenciones',
    query: { mascotaId: route.params.id }
  });
};

onMounted(() => {
  cargarHistorial();
});
</script>
