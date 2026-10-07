<template>
  <q-page class="q-pa-md q-pa-lg-lg">
    <!-- Encabezado de Página -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 page-title text-weight-bolder text-primary">
          Gestión de Atenciones Médicas
        </div>
        <div class="text-caption text-grey-7">
          Programación de citas y registro clínico de consultas veterinarias
        </div>
      </div>
      <div>
        <q-btn
          color="primary"
          icon="add_circle"
          label="Programar / Nueva Atención"
          @click="abrirDialogoCrear"
        />
      </div>
    </div>

    <!-- Barra de Filtros -->
    <q-card class="vet-card q-pa-sm q-mb-md bg-white">
      <div class="row items-center q-gutter-sm">
        <div class="col-12 col-sm-4 col-md-3">
          <q-select
            v-model="filtroEstado"
            :options="opcionesEstadosFiltro"
            label="Estado"
            outlined
            dense
            clearable
            emit-value
            map-options
            @update:model-value="filtrarAtenciones"
          />
        </div>

        <div class="col-12 col-sm-4 col-md-3">
          <q-select
            v-model="filtroVeterinario"
            :options="opcionesVeterinariosFiltro"
            label="Veterinario"
            outlined
            dense
            clearable
            emit-value
            map-options
            @update:model-value="filtrarAtenciones"
          />
        </div>

        <div class="col-12 col-sm-3 col-md-3">
          <q-input
            v-model="filtroFecha"
            label="Fecha"
            outlined
            dense
            clearable
            placeholder="YYYY-MM-DD"
            @update:model-value="filtrarAtenciones"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="filtroFecha" mask="YYYY-MM-DD" @update:model-value="filtrarAtenciones">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Cerrar" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
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
            :loading="atencionStore.loading"
          >
            <q-tooltip>Actualizar lista</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card>

    <!-- Tabla de Atenciones -->
    <q-card class="vet-card">
      <q-table
        :rows="atencionStore.atenciones"
        :columns="columnas"
        row-key="_id"
        :loading="atencionStore.loading"
        no-data-label="No se encontraron atenciones registradas con los filtros actuales"
        class="vet-table"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template v-slot:body-cell-fecha="props">
          <q-td :props="props">
            <div class="text-weight-bold text-body2 text-primary">
              {{ formatearFecha(props.row.fecha) }}
            </div>
            <div class="text-caption text-grey-8">
              <q-icon name="schedule" size="14px" class="q-mr-xs" />{{ props.row.hora }}
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-mascota="props">
          <q-td :props="props">
            <div class="row items-center no-wrap">
              <q-avatar size="32px" color="teal-1" text-color="primary" class="q-mr-sm">
                <q-icon :name="props.row.mascota?.especie === 'Felino' ? 'cruelty_free' : 'pets'" size="18px" />
              </q-avatar>
              <div>
                <div class="text-weight-bold text-body2">{{ props.row.mascota?.nombre || 'Mascota' }}</div>
                <div class="text-caption text-grey-6">
                  {{ props.row.mascota?.especie }} ({{ props.row.mascota?.raza || 'Mestizo' }})
                  <span v-if="props.row.mascota?.propietario">
                    • Prop: {{ props.row.mascota.propietario.nombre }}
                  </span>
                </div>
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-veterinario="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.veterinario?.nombre || 'No asignado' }}</div>
            <div class="text-caption text-grey-6">{{ props.row.veterinario?.especialidad || 'General' }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-motivo="props">
          <q-td :props="props">
            <div class="text-body2 text-weight-medium ellipsis" style="max-width: 250px;">
              {{ props.row.motivoConsulta }}
            </div>
            <div v-if="props.row.diagnostico" class="text-caption text-teal-9 text-weight-bold ellipsis" style="max-width: 250px;">
              Dx: {{ props.row.diagnostico }}
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-estado="props">
          <q-td :props="props" class="text-center">
            <q-badge
              :color="obtenerColorEstado(props.row.estado)"
              class="text-caption text-weight-bold q-px-sm"
            >
              {{ props.row.estado }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="text-right">
            <!-- Ver Detalle Clínico -->
            <q-btn
              flat
              round
              dense
              color="info"
              icon="visibility"
              @click="verDetalleAtencion(props.row)"
            >
              <q-tooltip>Ver detalle clínico</q-tooltip>
            </q-btn>

            <!-- Cambiar a 'En curso' si está 'Programada' -->
            <q-btn
              v-if="props.row.estado === 'Programada'"
              flat
              round
              dense
              color="secondary"
              icon="play_arrow"
              @click="cambiarEstadoDirecto(props.row._id, 'En curso')"
            >
              <q-tooltip>Iniciar Consulta (Pasar a 'En curso')</q-tooltip>
            </q-btn>

            <!-- Finalizar Consulta Médica -->
            <q-btn
              v-if="props.row.estado === 'En curso' || props.row.estado === 'Programada'"
              flat
              round
              dense
              color="positive"
              icon="task_alt"
              @click="abrirDialogoFinalizar(props.row)"
            >
              <q-tooltip>Finalizar Atención Médica</q-tooltip>
            </q-btn>

            <!-- Menú de Más Acciones -->
            <q-btn flat round dense icon="more_vert" color="grey-7">
              <q-menu cover auto-close>
                <q-list style="min-width: 180px">
                  <q-item clickable @click="abrirDialogoEditar(props.row)">
                    <q-item-section avatar><q-icon name="edit" color="primary" /></q-item-section>
                    <q-item-section>Editar Datos</q-item-section>
                  </q-item>

                  <q-item
                    v-if="props.row.estado !== 'Cancelada' && props.row.estado !== 'Finalizada'"
                    clickable
                    @click="cambiarEstadoDirecto(props.row._id, 'Cancelada')"
                    class="text-negative"
                  >
                    <q-item-section avatar><q-icon name="cancel" color="negative" /></q-item-section>
                    <q-item-section>Cancelar Cita</q-item-section>
                  </q-item>

                  <q-separator />

                  <q-item
                    clickable
                    :to="`/mascotas/${props.row.mascota?._id || props.row.mascota}/historial`"
                  >
                    <q-item-section avatar><q-icon name="history_edu" color="teal" /></q-item-section>
                    <q-item-section>Historial de Mascota</q-item-section>
                  </q-item>

                  <q-item
                    v-if="authStore.esAdmin"
                    clickable
                    @click="confirmarEliminar(props.row)"
                    class="text-negative"
                  >
                    <q-item-section avatar><q-icon name="delete" color="negative" /></q-item-section>
                    <q-item-section>Eliminar Registro</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Diálogo Crear/Editar Atención -->
    <q-dialog v-model="dialogoFormulario" persistent>
      <q-card style="min-width: 550px; max-width: 90vw;" class="vet-dialog">
        <q-card-section class="bg-primary text-white row items-center">
          <q-icon :name="esEdicion ? 'edit' : 'event_available'" size="24px" class="q-mr-sm" />
          <div class="text-h6">{{ esEdicion ? 'Editar Atención' : 'Programar Nueva Atención' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="guardarAtencion" class="q-gutter-md">
            <!-- Selección de Mascota -->
            <q-select
              v-model="formulario.mascota"
              :options="opcionesMascotas"
              option-value="_id"
              option-label="etiqueta"
              emit-value
              map-options
              label="Mascota *"
              outlined
              dense
              use-input
              input-debounce="300"
              @filter="filtrarMascotasSelect"
              :rules="[val => !!val || 'Seleccione la mascota']"
            >
              <template v-slot:prepend><q-icon name="pets" /></template>
            </q-select>

            <!-- Selección de Veterinario -->
            <q-select
              v-model="formulario.veterinario"
              :options="opcionesVeterinarios"
              option-value="_id"
              option-label="etiqueta"
              emit-value
              map-options
              label="Veterinario Asignado *"
              outlined
              dense
              :rules="[val => !!val || 'Seleccione el veterinario']"
            >
              <template v-slot:prepend><q-icon name="medical_services" /></template>
            </q-select>

            <!-- Fecha y Hora -->
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="formulario.fecha"
                  label="Fecha de Atención *"
                  outlined
                  dense
                  :rules="[val => !!val || 'La fecha es obligatoria']"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="formulario.fecha" mask="YYYY-MM-DD">
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
                  v-model="formulario.hora"
                  label="Hora (Ej. 10:30) *"
                  outlined
                  dense
                  :rules="[val => !!val || 'La hora es obligatoria']"
                >
                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-time v-model="formulario.hora" format24h>
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Cerrar" color="primary" flat />
                          </div>
                        </q-time>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <!-- Motivo de Consulta -->
            <q-input
              v-model="formulario.motivoConsulta"
              label="Motivo de Consulta *"
              type="textarea"
              rows="2"
              outlined
              dense
              :rules="[val => !!val || 'El motivo de consulta es obligatorio']"
            />

            <!-- Estado de la atención -->
            <q-select
              v-model="formulario.estado"
              :options="['Programada', 'En curso', 'Finalizada', 'Cancelada']"
              label="Estado"
              outlined
              dense
            />

            <!-- Campos médicos opcionales -->
            <div class="text-subtitle2 text-weight-bold text-grey-8 q-mt-md">
              Detalles Médicos (Opcional en programación):
            </div>

            <q-input
              v-model="formulario.sintomas"
              label="Síntomas observados"
              type="textarea"
              rows="2"
              outlined
              dense
            />

            <q-input
              v-model="formulario.diagnostico"
              label="Diagnóstico Médico"
              outlined
              dense
            />

            <q-input
              v-model="formulario.tratamiento"
              label="Tratamiento prescrito"
              type="textarea"
              rows="2"
              outlined
              dense
            />

            <q-input
              v-model="formulario.observaciones"
              label="Observaciones adicionales"
              outlined
              dense
            />

            <div class="row justify-end q-gutter-sm q-mt-lg">
              <q-btn label="Cancelar" flat color="grey-7" v-close-popup />
              <q-btn
                :label="esEdicion ? 'Guardar Cambios' : 'Registrar Atención'"
                type="submit"
                color="primary"
                :loading="guardando"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Diálogo Finalizar Atención Médica -->
    <q-dialog v-model="dialogoFinalizar" persistent>
      <q-card style="min-width: 500px; max-width: 90vw;" class="vet-dialog">
        <q-card-section class="bg-positive text-white row items-center">
          <q-icon name="task_alt" size="24px" class="q-mr-sm" />
          <div class="text-h6">Finalizar Consulta Médica</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="text-caption text-grey-8 q-mb-md">
            Al finalizar, la atención quedará en estado <strong>Finalizada</strong> y pasará formalmente al historial clínico de la mascota.
          </div>

          <q-form @submit="ejecutarFinalizar" class="q-gutter-md">
            <q-input
              v-model="finalizarForm.sintomas"
              label="Síntomas"
              type="textarea"
              rows="2"
              outlined
              dense
            />

            <q-input
              v-model="finalizarForm.diagnostico"
              label="Diagnóstico Médico *"
              type="textarea"
              rows="2"
              outlined
              dense
              :rules="[val => !!val || 'El diagnóstico médico es obligatorio para finalizar']"
            />

            <q-input
              v-model="finalizarForm.tratamiento"
              label="Tratamiento y Receta"
              type="textarea"
              rows="2"
              outlined
              dense
            />

            <q-input
              v-model="finalizarForm.observaciones"
              label="Observaciones / Cuidados en casa"
              outlined
              dense
            />

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn label="Cancelar" flat color="grey-7" v-close-popup />
              <q-btn
                label="Confirmar y Finalizar"
                type="submit"
                color="positive"
                :loading="finalizando"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Diálogo Detalle de la Atención -->
    <q-dialog v-model="dialogoDetalle">
      <q-card style="min-width: 520px; max-width: 90vw;" class="vet-dialog">
        <q-card-section class="bg-primary text-white row items-center">
          <q-icon name="medical_services" size="24px" class="q-mr-sm" />
          <div class="text-h6">Detalles de la Atención</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="atencionSeleccionada" class="q-pt-md">
          <div class="row items-center justify-between q-mb-md">
            <q-badge :color="obtenerColorEstado(atencionSeleccionada.estado)" class="text-body2 text-weight-bold">
              {{ atencionSeleccionada.estado }}
            </q-badge>
            <div class="text-subtitle2 text-grey-8">
              {{ formatearFecha(atencionSeleccionada.fecha) }} • {{ atencionSeleccionada.hora }}
            </div>
          </div>

          <div class="row q-col-gutter-sm q-mb-md bg-grey-1 q-pa-sm rounded-borders">
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">Mascota:</div>
              <div class="text-body1 text-weight-bold text-primary">
                {{ atencionSeleccionada.mascota?.nombre }} ({{ atencionSeleccionada.mascota?.especie }})
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey-7">Propietario:</div>
              <div class="text-body2 text-weight-medium">
                {{ atencionSeleccionada.mascota?.propietario?.nombre || 'N/A' }}
              </div>
            </div>
            <div class="col-12">
              <div class="text-caption text-grey-7">Veterinario Tratante:</div>
              <div class="text-body2">
                {{ atencionSeleccionada.veterinario?.nombre }} - {{ atencionSeleccionada.veterinario?.especialidad }}
              </div>
            </div>
          </div>

          <div class="q-gutter-y-sm">
            <div>
              <div class="text-caption text-weight-bold text-grey-7">MOTIVO DE CONSULTA:</div>
              <div class="text-body2">{{ atencionSeleccionada.motivoConsulta }}</div>
            </div>

            <div v-if="atencionSeleccionada.sintomas">
              <div class="text-caption text-weight-bold text-grey-7">SÍNTOMAS:</div>
              <div class="text-body2 bg-amber-1 q-pa-xs rounded-borders">{{ atencionSeleccionada.sintomas }}</div>
            </div>

            <div v-if="atencionSeleccionada.diagnostico">
              <div class="text-caption text-weight-bold text-grey-7">DIAGNÓSTICO:</div>
              <div class="text-body2 text-weight-bold text-teal-10 bg-teal-1 q-pa-xs rounded-borders">
                {{ atencionSeleccionada.diagnostico }}
              </div>
            </div>

            <div v-if="atencionSeleccionada.tratamiento">
              <div class="text-caption text-weight-bold text-grey-7">TRATAMIENTO:</div>
              <div class="text-body2 bg-light-blue-1 q-pa-xs rounded-borders">{{ atencionSeleccionada.tratamiento }}</div>
            </div>

            <div v-if="atencionSeleccionada.observaciones">
              <div class="text-caption text-weight-bold text-grey-7">OBSERVACIONES:</div>
              <div class="text-body2 text-grey-8">{{ atencionSeleccionada.observaciones }}</div>
            </div>
          </div>
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
          ¿Está seguro de eliminar esta atención médica?
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
import { useRoute } from 'vue-router';
import { useAtencionStore } from '../stores/atencion.js';
import { useAuthStore } from '../stores/auth.js';
import { useQuasar } from 'quasar';
import mascotaService from '../services/mascotaService.js';
import veterinarioService from '../services/veterinarioService.js';

const $q = useQuasar();
const route = useRoute();
const atencionStore = useAtencionStore();
const authStore = useAuthStore();

const guardando = ref(false);
const finalizando = ref(false);
const eliminando = ref(false);

const filtroEstado = ref(null);
const filtroVeterinario = ref(null);
const filtroFecha = ref('');

const dialogoFormulario = ref(false);
const esEdicion = ref(false);
const atencionEditandoId = ref(null);

const dialogoFinalizar = ref(false);
const atencionAFinalizarId = ref(null);
const finalizarForm = ref({
  sintomas: '',
  diagnostico: '',
  tratamiento: '',
  observaciones: ''
});

const dialogoDetalle = ref(false);
const atencionSeleccionada = ref(null);

const dialogoEliminar = ref(false);
const atencionAEliminarId = ref(null);

const todasLasMascotas = ref([]);
const opcionesMascotas = ref([]);
const todosLosVeterinarios = ref([]);
const opcionesVeterinarios = ref([]);
const opcionesVeterinariosFiltro = ref([]);

const opcionesEstadosFiltro = [
  { label: 'Todos los estados', value: null },
  { label: 'Programada', value: 'Programada' },
  { label: 'En curso', value: 'En curso' },
  { label: 'Finalizada', value: 'Finalizada' },
  { label: 'Cancelada', value: 'Cancelada' }
];

const formulario = ref({
  mascota: null,
  veterinario: null,
  fecha: new Date().toISOString().split('T')[0],
  hora: '09:00',
  motivoConsulta: '',
  sintomas: '',
  diagnostico: '',
  tratamiento: '',
  observaciones: '',
  estado: 'Programada'
});

const columnas = [
  { name: 'fecha', label: 'Fecha y Hora', field: 'fecha', align: 'left', sortable: true },
  { name: 'mascota', label: 'Mascota / Dueño', field: row => row.mascota?.nombre, align: 'left' },
  { name: 'veterinario', label: 'Veterinario', field: row => row.veterinario?.nombre, align: 'left' },
  { name: 'motivo', label: 'Motivo y Diagnóstico', field: 'motivoConsulta', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
  { name: 'acciones', label: 'Acciones', align: 'right' }
];

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '';
  const d = new Date(fechaStr);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const obtenerColorEstado = (estado) => {
  switch (estado) {
    case 'Programada': return 'warning';
    case 'En curso': return 'info';
    case 'Finalizada': return 'positive';
    case 'Cancelada': return 'negative';
    default: return 'grey-7';
  }
};

const cargarDatos = async () => {
  try {
    const params = {};
    if (filtroEstado.value) params.estado = filtroEstado.value;
    if (filtroVeterinario.value) params.veterinario = filtroVeterinario.value;
    if (filtroFecha.value) params.fecha = filtroFecha.value;

    await atencionStore.cargarAtenciones(params);

    // Cargar listas para selects
    const dataMascotas = await mascotaService.obtenerMascotas({ activo: true });
    todasLasMascotas.value = (dataMascotas.mascotas || []).map(m => ({
      ...m,
      etiqueta: `${m.nombre} (${m.especie} - Dueño: ${m.propietario?.nombre || 'N/A'})`
    }));
    opcionesMascotas.value = [...todasLasMascotas.value];

    const dataVets = await veterinarioService.obtenerVeterinarios({ activo: true });
    todosLosVeterinarios.value = (dataVets.veterinarios || []).map(v => ({
      ...v,
      etiqueta: `${v.nombre} (${v.especialidad})`
    }));
    opcionesVeterinarios.value = [...todosLosVeterinarios.value];
    opcionesVeterinariosFiltro.value = [
      { label: 'Todos los veterinarios', value: null },
      ...todosLosVeterinarios.value.map(v => ({ label: v.nombre, value: v._id }))
    ];

    // Si viene mascotaId en query, abrir diálogo de creación con esa mascota
    if (route.query.mascotaId) {
      abrirDialogoCrear();
      formulario.value.mascota = route.query.mascotaId;
    }
  } catch (error) {
    // Interceptor notifica
  }
};

const filtrarAtenciones = () => {
  const params = {};
  if (filtroEstado.value) params.estado = filtroEstado.value;
  if (filtroVeterinario.value) params.veterinario = filtroVeterinario.value;
  if (filtroFecha.value) params.fecha = filtroFecha.value;
  atencionStore.cargarAtenciones(params);
};

const filtrarMascotasSelect = (val, update) => {
  update(() => {
    if (!val) {
      opcionesMascotas.value = [...todasLasMascotas.value];
    } else {
      const term = val.toLowerCase();
      opcionesMascotas.value = todasLasMascotas.value.filter(
        m => m.etiqueta.toLowerCase().includes(term)
      );
    }
  });
};

const abrirDialogoCrear = () => {
  esEdicion.value = false;
  atencionEditandoId.value = null;
  formulario.value = {
    mascota: null,
    veterinario: null,
    fecha: new Date().toISOString().split('T')[0],
    hora: '09:00',
    motivoConsulta: '',
    sintomas: '',
    diagnostico: '',
    tratamiento: '',
    observaciones: '',
    estado: 'Programada'
  };
  dialogoFormulario.value = true;
};

const abrirDialogoEditar = (atencion) => {
  esEdicion.value = true;
  atencionEditandoId.value = atencion._id;
  formulario.value = {
    mascota: atencion.mascota?._id || atencion.mascota,
    veterinario: atencion.veterinario?._id || atencion.veterinario,
    fecha: atencion.fecha ? atencion.fecha.split('T')[0] : '',
    hora: atencion.hora || '',
    motivoConsulta: atencion.motivoConsulta || '',
    sintomas: atencion.sintomas || '',
    diagnostico: atencion.diagnostico || '',
    tratamiento: atencion.tratamiento || '',
    observaciones: atencion.observaciones || '',
    estado: atencion.estado
  };
  dialogoFormulario.value = true;
};

const verDetalleAtencion = (atencion) => {
  atencionSeleccionada.value = atencion;
  dialogoDetalle.value = true;
};

const cambiarEstadoDirecto = async (id, nuevoEstado) => {
  try {
    const res = await atencionStore.cambiarEstado(id, nuevoEstado);
    $q.notify({
      type: 'positive',
      message: res.mensaje || `Estado cambiado a ${nuevoEstado}`,
      icon: 'check_circle'
    });
  } catch (error) {
    // Interceptor notifica
  }
};

const abrirDialogoFinalizar = (atencion) => {
  atencionAFinalizarId.value = atencion._id;
  finalizarForm.value = {
    sintomas: atencion.sintomas || '',
    diagnostico: atencion.diagnostico || '',
    tratamiento: atencion.tratamiento || '',
    observaciones: atencion.observaciones || ''
  };
  dialogoFinalizar.value = true;
};

const ejecutarFinalizar = async () => {
  finalizando.value = true;
  try {
    const res = await atencionStore.finalizarAtencion(atencionAFinalizarId.value, finalizarForm.value);
    $q.notify({
      type: 'positive',
      message: res.mensaje || 'Atención médica finalizada exitosamente',
      icon: 'verified'
    });
    dialogoFinalizar.value = false;
  } catch (error) {
    // Interceptor notifica
  } finally {
    finalizando.value = false;
  }
};

const guardarAtencion = async () => {
  guardando.value = true;
  try {
    if (esEdicion.value) {
      const res = await atencionStore.actualizarAtencion(atencionEditandoId.value, formulario.value);
      $q.notify({
        type: 'positive',
        message: res.mensaje || 'Atención actualizada correctamente',
        icon: 'check_circle'
      });
    } else {
      const res = await atencionStore.crearAtencion(formulario.value);
      $q.notify({
        type: 'positive',
        message: res.mensaje || 'Atención registrada exitosamente',
        icon: 'event_available'
      });
    }
    dialogoFormulario.value = false;
  } catch (error) {
    // Interceptor notifica
  } finally {
    guardando.value = false;
  }
};

const confirmarEliminar = (atencion) => {
  atencionAEliminarId.value = atencion._id;
  dialogoEliminar.value = true;
};

const ejecutarEliminar = async () => {
  eliminando.value = true;
  try {
    const res = await atencionStore.eliminarAtencion(atencionAEliminarId.value);
    $q.notify({
      type: 'positive',
      message: res.mensaje || 'Atención eliminada correctamente',
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
