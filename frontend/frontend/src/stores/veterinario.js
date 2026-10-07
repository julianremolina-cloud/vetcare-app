import { defineStore } from 'pinia';
import veterinarioService from '../services/veterinarioService.js';

export const useVeterinarioStore = defineStore('veterinario', {
  state: () => ({
    veterinarios: [],
    veterinarioActual: null,
    loading: false,
    total: 0
  }),

  actions: {
    async cargarVeterinarios(params = {}) {
      this.loading = true;
      try {
        const data = await veterinarioService.obtenerVeterinarios(params);
        this.veterinarios = data.veterinarios || [];
        this.total = data.total || 0;
        return data;
      } finally {
        this.loading = false;
      }
    },

    async cargarVeterinarioPorId(id) {
      this.loading = true;
      try {
        const data = await veterinarioService.obtenerVeterinarioPorId(id);
        this.veterinarioActual = data.veterinario;
        return data.veterinario;
      } finally {
        this.loading = false;
      }
    },

    async crearVeterinario(datos) {
      this.loading = true;
      try {
        const res = await veterinarioService.crearVeterinario(datos);
        await this.cargarVeterinarios();
        return res;
      } finally {
        this.loading = false;
      }
    },

    async actualizarVeterinario(id, datos) {
      this.loading = true;
      try {
        const res = await veterinarioService.actualizarVeterinario(id, datos);
        await this.cargarVeterinarios();
        return res;
      } finally {
        this.loading = false;
      }
    },

    async eliminarVeterinario(id) {
      this.loading = true;
      try {
        const res = await veterinarioService.eliminarVeterinario(id);
        await this.cargarVeterinarios();
        return res;
      } finally {
        this.loading = false;
      }
    }
  }
});
