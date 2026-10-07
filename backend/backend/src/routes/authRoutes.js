import { Router } from 'express';
import {
  login,
  registro,
  obtenerPerfil,
  cambiarPassword
} from '../controllers/authController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = Router();

// Rutas públicas
router.post('/login', login);
router.post('/registro', registro);

// Rutas protegidas
router.get('/perfil', verificarToken, obtenerPerfil);
router.put('/cambiar-password', verificarToken, cambiarPassword);

export default router;
