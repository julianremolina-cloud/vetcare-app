import { Router } from 'express';
import {
  obtenerAtenciones,
  obtenerAtencionPorId,
  crearAtencion,
  actualizarAtencion,
  cambiarEstadoAtencion,
  finalizarAtencion,
  eliminarAtencion
} from '../controllers/atencionController.js';
import { verificarToken } from '../middleware/authMiddleware.js';
import { permitirRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(verificarToken);

router.route('/')
  .get(obtenerAtenciones)
  .post(crearAtencion);

router.route('/:id')
  .get(obtenerAtencionPorId)
  .put(actualizarAtencion)
  .delete(permitirRoles('administrador'), eliminarAtencion);

// Endpoints especializados para el ciclo de vida de una atención
router.patch('/:id/estado', cambiarEstadoAtencion);
router.patch('/:id/finalizar', permitirRoles('veterinario', 'administrador'), finalizarAtencion);

export default router;
