import api from './api.js';

export const mascotaService = {
  async obtenerMascotas(params = {}) {
    const { data } = await api.get('/mascotas', { params });
    return data;
  },

  async obtenerMascotaPorId(id) {
    const { data } = await api.get(`/mascotas/${id}`);
    return data;
  },

  async obtenerHistorialMascota(id) {
    const { data } = await api.get(`/mascotas/${id}/historial`);
    return data;
  },

  async crearMascota(mascota) {
    const { data } = await api.post('/mascotas', mascota);
    return data;
  },

  async actualizarMascota(id, mascota) {
    const { data } = await api.put(`/mascotas/${id}`, mascota);
    return data;
  },

  async eliminarMascota(id) {
    const { data } = await api.delete(`/mascotas/${id}`);
    return data;
  }
};

export default mascotaService;
