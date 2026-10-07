import api from './api.js';

export const usuarioService = {
  async obtenerUsuarios(params = {}) {
    const { data } = await api.get('/usuarios', { params });
    return data;
  },

  async obtenerUsuarioPorId(id) {
    const { data } = await api.get(`/usuarios/${id}`);
    return data;
  },

  async crearUsuario(usuario) {
    const { data } = await api.post('/usuarios', usuario);
    return data;
  },

  async actualizarUsuario(id, usuario) {
    const { data } = await api.put(`/usuarios/${id}`, usuario);
    return data;
  },

  async eliminarUsuario(id) {
    const { data } = await api.delete(`/usuarios/${id}`);
    return data;
  }
};

export default usuarioService;
