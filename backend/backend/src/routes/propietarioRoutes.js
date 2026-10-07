import { Router } from 'express';
import {
  obtenerPropietarios,
  obtenerPropietarioPorId,
  crearPropietario,
  actualizarPropietario,
  eliminarPropietario
} from '../controllers/propietarioController.js';
import { verificarToken } from '../middleware/authMiddleware.js';
import { permitirRoles } from '../middleware/roleMiddleware.js';

const router = Router();

// Todas las rutas requieren estar autenticado
router.use(verificarToken);

router.route('/')
  .get(obtenerPropietarios)
  .post(permitirRoles('administrador', 'administrativo'), crearPropietario);

router.route('/:id')
  .get(obtenerPropietarioPorId)
  .put(permitirRoles('administrador', 'administrativo'), actualizarPropietario)
  .delete(permitirRoles('administrador'), eliminarPropietario);

export default router;
