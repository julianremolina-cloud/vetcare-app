import { defineStore } from 'pinia';
import mascotaService from '../services/mascotaService.js';

export const useMascotaStore = defineStore('mascota', {
  state: () => ({
    mascotas: [],
    mascotaActual: null,
    historialAtenciones: [],
    loading: false,
    total: 0
  }),

  actions: {
    async cargarMascotas(params = {}) {
      this.loading = true;
      try {
        const data = await mascotaService.obtenerMascotas(params);
        this.mascotas = data.mascotas || [];
        this.total = data.total || 0;
        return data;
      } finally {
        this.loading = false;
      }
    },

    async cargarMascotaPorId(id) {
      this.loading = true;
      try {
        const data = await mascotaService.obtenerMascotaPorId(id);
        this.mascotaActual = data.mascota;
        return data.mascota;
      } finally {
        this.loading = false;
      }
    },

    async cargarHistorialMascota(id) {
      this.loading = true;
      try {
        const data = await mascotaService.obtenerHistorialMascota(id);
        this.mascotaActual = data.mascota;
        this.historialAtenciones = data.atenciones || [];
        return data;
      } finally {
        this.loading = false;
      }
    },

    async crearMascota(datos) {
      this.loading = true;
      try {
        const res = await mascotaService.crearMascota(datos);
        await this.cargarMascotas();
        return res;
      } finally {
        this.loading = false;
      }
    },

    async actualizarMascota(id, datos) {
      this.loading = true;
      try {
        const res = await mascotaService.actualizarMascota(id, datos);
        await this.cargarMascotas();
        return res;
      } finally {
        this.loading = false;
      }
    },

    async eliminarMascota(id) {
      this.loading = true;
      try {
        const res = await mascotaService.eliminarMascota(id);
        await this.cargarMascotas();
        return res;
      } finally {
        this.loading = false;
      }
    }
  }
});
