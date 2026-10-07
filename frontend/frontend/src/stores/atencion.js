import { defineStore } from 'pinia';
import atencionService from '../services/atencionService.js';

export const useAtencionStore = defineStore('atencion', {
  state: () => ({
    atenciones: [],
    atencionActual: null,
    loading: false,
    total: 0
  }),

  actions: {
    async cargarAtenciones(params = {}) {
      this.loading = true;
      try {
        const data = await atencionService.obtenerAtenciones(params);
        this.atenciones = data.atenciones || [];
        this.total = data.total || 0;
        return data;
      } finally {
        this.loading = false;
      }
    },

    async cargarAtencionPorId(id) {
      this.loading = true;
      try {
        const data = await atencionService.obtenerAtencionPorId(id);
        this.atencionActual = data.atencion;
        return data.atencion;
      } finally {
        this.loading = false;
      }
    },

    async crearAtencion(datos) {
      this.loading = true;
      try {
        const res = await atencionService.crearAtencion(datos);
        await this.cargarAtenciones();
        return res;
      } finally {
        this.loading = false;
      }
    },

    async actualizarAtencion(id, datos) {
      this.loading = true;
      try {
        const res = await atencionService.actualizarAtencion(id, datos);
        await this.cargarAtenciones();
        return res;
      } finally {
        this.loading = false;
      }
    },

    async cambiarEstado(id, estado) {
      this.loading = true;
      try {
        const res = await atencionService.cambiarEstado(id, estado);
        await this.cargarAtenciones();
        return res;
      } finally {
        this.loading = false;
      }
    },

    async finalizarAtencion(id, datosClinicos) {
      this.loading = true;
      try {
        const res = await atencionService.finalizarAtencion(id, datosClinicos);
        await this.cargarAtenciones();
        return res;
      } finally {
        this.loading = false;
      }
    },

    async eliminarAtencion(id) {
      this.loading = true;
      try {
        const res = await atencionService.eliminarAtencion(id);
        this.atenciones = this.atenciones.filter((a) => a._id !== id);
        return res;
      } finally {
        this.loading = false;
      }
    }
  }
});
