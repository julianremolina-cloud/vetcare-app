import api from './api.js';

export const propietarioService = {
  async obtenerPropietarios(params = {}) {
    const { data } = await api.get('/propietarios', { params });
    return data;
  },

  async obtenerPropietarioPorId(id) {
    const { data } = await api.get(`/propietarios/${id}`);
    return data;
  },

  async crearPropietario(propietario) {
    const { data } = await api.post('/propietarios', propietario);
    return data;
  },

  async actualizarPropietario(id, propietario) {
    const { data } = await api.put(`/propietarios/${id}`, propietario);
    return data;
  },

  async eliminarPropietario(id) {
    const { data } = await api.delete(`/propietarios/${id}`);
    return data;
  }
};

export default propietarioService;
