<template>
  <q-page class="q-pa-md q-pa-lg-lg">
    <!-- Encabezado del Dashboard -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 page-title text-weight-bolder text-primary">
          Panel de Control
        </div>
        <div class="text-caption text-grey-7">
          Resumen operativo y clínico de VetCare
        </div>
      </div>
      <div>
        <q-btn
          color="primary"
          outline
          icon="refresh"
          label="Actualizar"
          :loading="cargando"
          @click="cargarDashboard"
          class="q-mr-sm"
        />
        <q-btn
          color="primary"
          icon="add_circle"
          label="Nueva Atención"
          to="/atenciones"
        />
      </div>
    </div>

    <!-- Indicador de Carga -->
    <q-inner-loading :showing="cargando">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>

    <!-- Tarjetas de Métricas Estadísticas -->
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- Mascotas Registradas -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="vet-card stat-card q-pa-md bg-white">
          <div class="row items-center justify-between">
            <div>
              <div class="text-caption text-uppercase text-weight-bold text-grey-7">Mascotas Activas</div>
              <div class="text-h4 text-weight-bolder text-primary q-mt-xs">
                {{ stats.totalMascotas || 0 }}
              </div>
            </div>
            <q-avatar size="48px" color="teal-1" text-color="primary">
              <q-icon name="pets" size="28px" />
            </q-avatar>
          </div>
          <div class="q-mt-sm">
            <q-btn flat dense no-caps size="sm" color="primary" label="Ver catálogo de mascotas →" to="/mascotas" />
          </div>
        </q-card>
      </div>

      <!-- Propietarios -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="vet-card stat-card q-pa-md bg-white" style="border-left-color: #0284c7;">
          <div class="row items-center justify-between">
            <div>
              <div class="text-caption text-uppercase text-weight-bold text-grey-7">Propietarios</div>
              <div class="text-h4 text-weight-bolder text-secondary q-mt-xs">
                {{ stats.totalPropietarios || 0 }}
              </div>
            </div>
            <q-avatar size="48px" color="sky-1" text-color="secondary">
              <q-icon name="people" size="28px" />
            </q-avatar>
          </div>
          <div class="q-mt-sm">
            <q-btn flat dense no-caps size="sm" color="secondary" label="Ver propietarios →" to="/propietarios" />
          </div>
        </q-card>
      </div>

      <!-- Veterinarios -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="vet-card stat-card q-pa-md bg-white" style="border-left-color: #8b5cf6;">
          <div class="row items-center justify-between">
            <div>
              <div class="text-caption text-uppercase text-weight-bold text-grey-7">Veterinarios</div>
              <div class="text-h4 text-weight-bolder text-purple q-mt-xs">
                {{ stats.totalVeterinarios || 0 }}
              </div>
            </div>
            <q-avatar size="48px" color="purple-1" text-color="purple">
              <q-icon name="badge" size="28px" />
            </q-avatar>
          </div>
          <div class="q-mt-sm">
            <q-btn flat dense no-caps size="sm" color="purple" label="Ver personal médico →" to="/veterinarios" />
          </div>
        </q-card>
      </div>

      <!-- Atenciones Hoy / Totales -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="vet-card stat-card q-pa-md bg-white" style="border-left-color: #f97316;">
          <div class="row items-center justify-between">
            <div>
              <div class="text-caption text-uppercase text-weight-bold text-grey-7">Atenciones Totales</div>
              <div class="text-h4 text-weight-bolder text-accent q-mt-xs">
                {{ stats.totalAtenciones || 0 }}
              </div>
            </div>
            <q-avatar size="48px" color="orange-1" text-color="accent">
              <q-icon name="medical_services" size="28px" />
            </q-avatar>
          </div>
          <div class="q-mt-sm row items-center justify-between">
            <span class="text-caption text-grey-8">Hoy: <strong>{{ stats.atencionesHoy || 0 }}</strong></span>
            <q-btn flat dense no-caps size="sm" color="accent" label="Ver atenciones →" to="/atenciones" />
          </div>
        </q-card>
      </div>
    </div>

    <!-- Estados de Atenciones y Próximas Citas -->
    <div class="row q-col-gutter-md">
      <!-- Desglose de Estados de Atenciones -->
      <div class="col-12 col-md-4">
        <q-card class="vet-card bg-white q-pa-md full-height">
          <div class="text-h6 text-weight-bold q-mb-md row items-center">
            <q-icon name="pie_chart" color="primary" class="q-mr-sm" />
            Estado de Atenciones
          </div>
          <q-separator class="q-mb-md" />

          <div class="q-gutter-y-md">
            <div class="row items-center justify-between q-pa-sm bg-amber-1 rounded-borders">
              <div class="row items-center">
                <q-icon name="schedule" color="warning" size="24px" class="q-mr-sm" />
                <span class="text-weight-medium">Programadas</span>
              </div>
              <q-badge color="warning" text-color="dark" class="text-body2 text-weight-bold q-px-sm">
                {{ estados.programadas || 0 }}
              </q-badge>
            </div>

            <div class="row items-center justify-between q-pa-sm bg-light-blue-1 rounded-borders">
              <div class="row items-center">
                <q-icon name="pending" color="info" size="24px" class="q-mr-sm" />
                <span class="text-weight-medium">En curso (Consulta)</span>
              </div>
              <q-badge color="info" text-color="white" class="text-body2 text-weight-bold q-px-sm">
                {{ estados.enCurso || 0 }}
              </q-badge>
            </div>

            <div class="row items-center justify-between q-pa-sm bg-green-1 rounded-borders">
              <div class="row items-center">
                <q-icon name="check_circle" color="positive" size="24px" class="q-mr-sm" />
                <span class="text-weight-medium">Finalizadas</span>
              </div>
              <q-badge color="positive" text-color="white" class="text-body2 text-weight-bold q-px-sm">
                {{ estados.finalizadas || 0 }}
              </q-badge>
            </div>
          </div>

          <div class="q-mt-lg text-center">
            <q-btn
              outline
              color="primary"
              label="Gestionar Todas las Atenciones"
              icon="calendar_today"
              to="/atenciones"
              class="full-width"
            />
          </div>
        </q-card>
      </div>

      <!-- Próximas Atenciones -->
      <div class="col-12 col-md-8">
        <q-card class="vet-card bg-white q-pa-md full-height">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6 text-weight-bold row items-center">
              <q-icon name="event_note" color="primary" class="q-mr-sm" />
              Próximas Atenciones Médicas
            </div>
            <q-badge color="primary" outline>Pendientes</q-badge>
          </div>
          <q-separator class="q-mb-md" />

          <!-- Lista de atenciones -->
          <div v-if="proximasAtenciones.length === 0" class="text-center q-pa-lg text-grey-6">
            <q-icon name="event_busy" size="48px" class="q-mb-sm" />
            <div>No hay atenciones programadas o en curso para los próximos días.</div>
          </div>

          <q-list v-else separator>
            <q-item v-for="atencion in proximasAtenciones" :key="atencion._id" class="q-py-md">
              <q-item-section avatar>
                <q-avatar color="teal-1" text-color="primary" icon="pets" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold text-body1">
                  {{ atencion.mascota?.nombre || 'Mascota' }}
                  <span class="text-caption text-grey-7 font-weight-normal">
                    ({{ atencion.mascota?.especie }} - {{ atencion.mascota?.raza || 'Mestizo' }})
                  </span>
                </q-item-label>
                <q-item-label caption class="text-grey-8">
                  <strong>Propietario:</strong> {{ atencion.mascota?.propietario?.nombre || 'No asignado' }}
                  <span v-if="atencion.mascota?.propietario?.telefono">• Tel: {{ atencion.mascota?.propietario?.telefono }}</span>
                </q-item-label>
                <q-item-label caption class="text-teal-9">
                  <strong>Motivo:</strong> {{ atencion.motivoConsulta }}
                </q-item-label>
              </q-item-section>

              <q-item-section side top class="text-right">
                <div class="text-weight-bold text-body2 text-primary">
                  {{ formatearFecha(atencion.fecha) }} • {{ atencion.hora }}
                </div>
                <div class="q-mt-xs">
                  <q-badge
                    :color="atencion.estado === 'En curso' ? 'info' : 'warning'"
                    :text-color="atencion.estado === 'En curso' ? 'white' : 'dark'"
                  >
                    {{ atencion.estado }}
                  </q-badge>
                </div>
                <div class="text-caption text-grey-7 q-mt-xs">
                  Dr(a). {{ atencion.veterinario?.nombre || 'Asignado' }}
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import dashboardService from '../services/dashboardService.js';

const cargando = ref(false);
const stats = ref({});
const estados = ref({});
const proximasAtenciones = ref([]);

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '';
  const d = new Date(fechaStr);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const cargarDashboard = async () => {
  cargando.value = true;
  try {
    const res = await dashboardService.obtenerResumen();
    stats.value = res.estadisticas || {};
    estados.value = res.estadisticas?.estadosAtencion || {};
    proximasAtenciones.value = res.proximasAtenciones || [];
  } catch (error) {
    // Interceptor notifica
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  cargarDashboard();
});
</script>
