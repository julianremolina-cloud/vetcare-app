import { Router } from 'express';
import {
  obtenerMascotas,
  obtenerMascotaPorId,
  obtenerHistorialMascota,
  crearMascota,
  actualizarMascota,
  eliminarMascota
} from '../controllers/mascotaController.js';
import { verificarToken } from '../middleware/authMiddleware.js';
import { permitirRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(verificarToken);

router.route('/')
  .get(obtenerMascotas)
  .post(permitirRoles('administrador', 'administrativo'), crearMascota);

router.route('/:id')
  .get(obtenerMascotaPorId)
  .put(permitirRoles('administrador', 'administrativo', 'veterinario'), actualizarMascota)
  .delete(permitirRoles('administrador'), eliminarMascota);

router.get('/:id/historial', obtenerHistorialMascota);

export default router;
