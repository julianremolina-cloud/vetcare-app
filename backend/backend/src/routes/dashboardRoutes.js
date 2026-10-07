import { Router } from 'express';
import { obtenerResumenDashboard } from '../controllers/dashboardController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(verificarToken);

// Soporta tanto /resumen como /stats para máxima compatibilidad
router.get('/resumen', obtenerResumenDashboard);
router.get('/stats', obtenerResumenDashboard);

export default router;
