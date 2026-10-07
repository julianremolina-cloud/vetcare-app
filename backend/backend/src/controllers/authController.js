import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

/**
 * Genera un token JWT para un ID de usuario
 */
const generarToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'vetcare_jwt_secret_key_2026_super_segura',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    }
  );
};

/**
 * @desc    Iniciar sesión
 * @route   POST /api/auth/login
 * @access  Público
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        mensaje: 'Por favor proporcione el correo electrónico y la contraseña'
      });
    }

    // Buscar usuario incluyendo el password (select: '+password')
    const usuario = await Usuario.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!usuario) {
      return res.status(401).json({
        success: false,
        mensaje: 'Credenciales inválidas: Correo o contraseña incorrectos'
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        success: false,
        mensaje: 'Acceso denegado: El usuario se encuentra inactivo. Comuníquese con la administración'
      });
    }

    // Verificar contraseña con bcrypt
    const passwordCorrecto = await usuario.compararPassword(password);
    if (!passwordCorrecto) {
      return res.status(401).json({
        success: false,
        mensaje: 'Credenciales inválidas: Correo o contraseña incorrectos'
      });
    }

    const token = generarToken(usuario._id);

    res.json({
      success: true,
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        activo: usuario.activo,
        createdAt: usuario.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Registrar un nuevo usuario
 * @route   POST /api/auth/registro
 * @access  Público / Administrativo
 */
export const registro = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({
        success: false,
        mensaje: 'Todos los campos son obligatorios (nombre, email, password, rol)'
      });
    }

    const existeUsuario = await Usuario.findOne({ email: email.toLowerCase().trim() });
    if (existeUsuario) {
      return res.status(400).json({
        success: false,
        mensaje: 'Ya existe un usuario registrado con este correo electrónico'
      });
    }

    const usuario = await Usuario.create({
      nombre,
      email,
      password,
      rol
    });

    const token = generarToken(usuario._id);

    res.status(201).json({
      success: true,
      mensaje: 'Usuario registrado exitosamente',
      token,
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        activo: usuario.activo,
        createdAt: usuario.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener perfil del usuario autenticado
 * @route   GET /api/auth/perfil
 * @access  Privado
 */
export const obtenerPerfil = async (req, res) => {
  res.json({
    success: true,
    usuario: req.usuario
  });
};

/**
 * @desc    Cambiar contraseña del usuario autenticado
 * @route   PUT /api/auth/cambiar-password
 * @access  Privado
 */
export const cambiarPassword = async (req, res, next) => {
  try {
    const { passwordActual, nuevoPassword } = req.body;

    if (!passwordActual || !nuevoPassword) {
      return res.status(400).json({
        success: false,
        mensaje: 'Debe ingresar la contraseña actual y la nueva contraseña'
      });
    }

    if (nuevoPassword.length < 6) {
      return res.status(400).json({
        success: false,
        mensaje: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    const usuario = await Usuario.findById(req.usuario._id).select('+password');

    const coincide = await usuario.compararPassword(passwordActual);
    if (!coincide) {
      return res.status(400).json({
        success: false,
        mensaje: 'La contraseña actual no es correcta'
      });
    }

    usuario.password = nuevoPassword;
    await usuario.save();

    res.json({
      success: true,
      mensaje: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    next(error);
  }
};
