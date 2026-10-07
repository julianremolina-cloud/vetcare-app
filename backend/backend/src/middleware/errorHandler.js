/**
 * Middleware para rutas no encontradas (404)
 */
export const rutaNoEncontrada = (req, res, next) => {
  res.status(404).json({
    success: false,
    mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
};

/**
 * Middleware central de manejo de errores
 */
export const manejadorErrores = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let mensaje = err.message || 'Error interno del servidor';
  let errores = null;

  // Error de Cast Mongoose (ObjectId malformado)
  if (err.name === 'CastError') {
    statusCode = 400;
    mensaje = `Recurso no encontrado: Identificador no válido para el campo '${err.path}'`;
  }

  // Error de clave duplicada en Mongo (código 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const campo = Object.keys(err.keyValue || {})[0] || 'campo';
    const valor = err.keyValue ? err.keyValue[campo] : '';
    mensaje = `El valor '${valor}' para el campo '${campo}' ya se encuentra registrado`;
  }

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errores = Object.values(err.errors).map((e) => e.message);
    mensaje = 'Error de validación en los datos enviados';
  }

  // Error de JWT inválido
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    mensaje = 'Token de autenticación no válido';
  }

  // Error de JWT expirado
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    mensaje = 'El token de autenticación ha expirado';
  }

  res.status(statusCode).json({
    success: false,
    mensaje,
    ...(errores && { errores }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
