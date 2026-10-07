import api from './api.js';

export const atencionService = {
  async obtenerAtenciones(params = {}) {
    const { data } = await api.get('/atenciones', { params });
    return data;
  },

  async obtenerAtencionPorId(id) {
    const { data } = await api.get(`/atenciones/${id}`);
    return data;
  },

  async crearAtencion(atencion) {
    const { data } = await api.post('/atenciones', atencion);
    return data;
  },

  async actualizarAtencion(id, atencion) {
    const { data } = await api.put(`/atenciones/${id}`, atencion);
    return data;
  },

  async cambiarEstado(id, estado) {
    const { data } = await api.patch(`/atenciones/${id}/estado`, { estado });
    return data;
  },

  async finalizarAtencion(id, datosClinicos) {
    const { data } = await api.patch(`/atenciones/${id}/finalizar`, datosClinicos);
    return data;
  },

  async eliminarAtencion(id) {
    const { data } = await api.delete(`/atenciones/${id}`);
    return data;
  }
};

export default atencionService;
