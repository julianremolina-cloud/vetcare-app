import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

/**
 * Middleware para verificar token JWT en las solicitudes protegidas
 */
export const verificarToken = async (req, res, next) => {
  try {
    let token;

    // Verificar cabecera Authorization (Bearer <token>)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        mensaje: 'Acceso no autorizado: No se proporcionó un token de autenticación'
      });
    }

    // Verificar validez del token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vetcare_jwt_secret_key_2026_super_segura');

    // Buscar al usuario en la base de datos
    const usuario = await Usuario.findById(decoded.id).select('-password');

    if (!usuario) {
      return res.status(401).json({
        success: false,
        mensaje: 'Acceso no autorizado: El usuario asociado al token no existe'
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        success: false,
        mensaje: 'Acceso denegado: La cuenta de usuario se encuentra inactiva'
      });
    }

    // Guardar usuario en la solicitud
    req.usuario = usuario;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        mensaje: 'La sesión ha expirado. Por favor inicia sesión nuevamente'
      });
    }

    return res.status(401).json({
      success: false,
      mensaje: 'Token de autenticación no válido'
    });
  }
};
