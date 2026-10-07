import { defineStore } from 'pinia';
import usuarioService from '../services/usuarioService.js';

export const useUsuarioStore = defineStore('usuario', {
  state: () => ({
    usuarios: [],
    usuarioActual: null,
    loading: false,
    total: 0
  }),

  actions: {
    async cargarUsuarios(params = {}) {
      this.loading = true;
      try {
        const data = await usuarioService.obtenerUsuarios(params);
        this.usuarios = data.usuarios || [];
        this.total = data.total || 0;
        return data;
      } finally {
        this.loading = false;
      }
    },

    async cargarUsuarioPorId(id) {
      this.loading = true;
      try {
        const data = await usuarioService.obtenerUsuarioPorId(id);
        this.usuarioActual = data.usuario;
        return data.usuario;
      } finally {
        this.loading = false;
      }
    },

    async crearUsuario(datos) {
      this.loading = true;
      try {
        const res = await usuarioService.crearUsuario(datos);
        await this.cargarUsuarios();
        return res;
      } finally {
        this.loading = false;
      }
    },

    async actualizarUsuario(id, datos) {
      this.loading = true;
      try {
        const res = await usuarioService.actualizarUsuario(id, datos);
        await this.cargarUsuarios();
        return res;
      } finally {
        this.loading = false;
      }
    },

    async eliminarUsuario(id) {
      this.loading = true;
      try {
        const res = await usuarioService.eliminarUsuario(id);
        this.usuarios = this.usuarios.filter((u) => u._id !== id);
        return res;
      } finally {
        this.loading = false;
      }
    }
  }
});
