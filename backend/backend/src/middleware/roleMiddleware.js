/**
 * Middleware para autorización basada en roles
 * @param  {...string} rolesPermitidos - Lista de roles con permiso para acceder a la ruta
 */
export const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        mensaje: 'No autenticado: Inicie sesión para continuar'
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        mensaje: `Acceso denegado: El rol '${req.usuario.rol}' no tiene permisos para realizar esta acción. Roles autorizados: [${rolesPermitidos.join(', ')}]`
      });
    }

    next();
  };
};
