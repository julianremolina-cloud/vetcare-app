import api from './api.js';

export const veterinarioService = {
  async obtenerVeterinarios(params = {}) {
    const { data } = await api.get('/veterinarios', { params });
    return data;
  },

  async obtenerVeterinarioPorId(id) {
    const { data } = await api.get(`/veterinarios/${id}`);
    return data;
  },

  async crearVeterinario(veterinario) {
    const { data } = await api.post('/veterinarios', veterinario);
    return data;
  },

  async actualizarVeterinario(id, veterinario) {
    const { data } = await api.put(`/veterinarios/${id}`, veterinario);
    return data;
  },

  async eliminarVeterinario(id) {
    const { data } = await api.delete(`/veterinarios/${id}`);
    return data;
  }
};

export default veterinarioService;
