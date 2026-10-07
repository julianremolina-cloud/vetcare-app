import { Router } from 'express';
import {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} from '../controllers/usuarioController.js';
import { verificarToken } from '../middleware/authMiddleware.js';
import { permitirRoles } from '../middleware/roleMiddleware.js';

const router = Router();

// Todas las rutas de usuarios requieren autenticación y rol de administrador
router.use(verificarToken);
router.use(permitirRoles('administrador'));

router.route('/')
  .get(obtenerUsuarios)
  .post(crearUsuario);

router.route('/:id')
  .get(obtenerUsuarioPorId)
  .put(actualizarUsuario)
  .delete(eliminarUsuario);

export default router;
