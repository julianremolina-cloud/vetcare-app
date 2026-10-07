import { defineStore } from 'pinia';
import propietarioService from '../services/propietarioService.js';

export const usePropietarioStore = defineStore('propietario', {
  state: () => ({
    propietarios: [],
    propietarioActual: null,
    mascotasPropietario: [],
    loading: false,
    total: 0
  }),

  actions: {
    async cargarPropietarios(params = {}) {
      this.loading = true;
      try {
        const data = await propietarioService.obtenerPropietarios(params);
        this.propietarios = data.propietarios || [];
        this.total = data.total || 0;
        return data;
      } finally {
        this.loading = false;
      }
    },

    async cargarPropietarioPorId(id) {
      this.loading = true;
      try {
        const data = await propietarioService.obtenerPropietarioPorId(id);
        this.propietarioActual = data.propietario;
        this.mascotasPropietario = data.mascotas || [];
        return data;
      } finally {
        this.loading = false;
      }
    },

    async crearPropietario(datos) {
      this.loading = true;
      try {
        const res = await propietarioService.crearPropietario(datos);
        await this.cargarPropietarios();
        return res;
      } finally {
        this.loading = false;
      }
    },

    async actualizarPropietario(id, datos) {
      this.loading = true;
      try {
        const res = await propietarioService.actualizarPropietario(id, datos);
        await this.cargarPropietarios();
        return res;
      } finally {
        this.loading = false;
      }
    },

    async eliminarPropietario(id) {
      this.loading = true;
      try {
        const res = await propietarioService.eliminarPropietario(id);
        this.propietarios = this.propietarios.filter((p) => p._id !== id);
        return res;
      } finally {
        this.loading = false;
      }
    }
  }
});
