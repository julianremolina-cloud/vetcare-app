import api from './api.js';

export const dashboardService = {
  async obtenerResumen() {
    const { data } = await api.get('/dashboard/resumen');
    return data;
  }
};

export default dashboardService;
