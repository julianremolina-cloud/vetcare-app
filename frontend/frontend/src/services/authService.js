import api from './api.js';

export const authService = {
  async login(credenciales) {
    const { data } = await api.post('/auth/login', credenciales);
    return data;
  },

  async registro(datosUsuario) {
    const { data } = await api.post('/auth/registro', datosUsuario);
    return data;
  },

  async obtenerPerfil() {
    const { data } = await api.get('/auth/perfil');
    return data;
  },

  async cambiarPassword(datosPassword) {
    const { data } = await api.put('/auth/cambiar-password', datosPassword);
    return data;
  }
};

export default authService;
