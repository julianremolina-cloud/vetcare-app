import { Router } from 'express';
import {
  obtenerVeterinarios,
  obtenerVeterinarioPorId,
  crearVeterinario,
  actualizarVeterinario,
  eliminarVeterinario
} from '../controllers/veterinarioController.js';
import { verificarToken } from '../middleware/authMiddleware.js';
import { permitirRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(verificarToken);

router.route('/')
  .get(obtenerVeterinarios)
  .post(permitirRoles('administrador'), crearVeterinario);

router.route('/:id')
  .get(obtenerVeterinarioPorId)
  .put(permitirRoles('administrador'), actualizarVeterinario)
  .delete(permitirRoles('administrador'), eliminarVeterinario);

export default router;
