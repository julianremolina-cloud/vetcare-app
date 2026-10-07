import { defineStore } from 'pinia';
import authService from '../services/authService.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    usuario: null,
    loading: false
  }),

  getters: {
    estaAutenticado: (state) => !!state.token,
    rolUsuario: (state) => state.usuario?.rol || null,
    nombreUsuario: (state) => state.usuario?.nombre || '',
    esAdmin: (state) => state.usuario?.rol === 'administrador',
    esAdministrativo: (state) => state.usuario?.rol === 'administrativo',
    esVeterinario: (state) => state.usuario?.rol === 'veterinario'
  },

  actions: {
    async login(credenciales) {
      this.loading = true;
      try {
        const respuesta = await authService.login(credenciales);
        this.token = respuesta.token;
        this.usuario = respuesta.usuario;
        return respuesta;
      } finally {
        this.loading = false;
      }
    },

    async obtenerPerfil() {
      if (!this.token) return;
      try {
        const respuesta = await authService.obtenerPerfil();
        this.usuario = respuesta.usuario;
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    logout() {
      this.token = null;
      this.usuario = null;
    }
  },

  persist: {
    key: 'vetcare-auth',
    paths: ['token', 'usuario']
  }
});
