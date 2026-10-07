import Usuario from '../models/Usuario.js';

/**
 * @desc    Obtener todos los usuarios (con filtros opcionales)
 * @route   GET /api/usuarios
 * @access  Privado (administrador)
 */
export const obtenerUsuarios = async (req, res, next) => {
  try {
    const { rol, activo, busqueda } = req.query;
    const filtro = {};

    if (rol) {
      filtro.rol = rol;
    }

    if (activo !== undefined) {
      filtro.activo = activo === 'true';
    }

    if (busqueda) {
      filtro.$or = [
        { nombre: { $regex: busqueda, $options: 'i' } },
        { email: { $regex: busqueda, $options: 'i' } }
      ];
    }

    const usuarios = await Usuario.find(filtro).sort({ createdAt: -1 });

    res.json({
      success: true,
      total: usuarios.length,
      usuarios
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener un usuario por ID
 * @route   GET /api/usuarios/:id
 * @access  Privado (administrador)
 */
export const obtenerUsuarioPorId = async (req, res, next) => {
  try {
    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      usuario
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crear un nuevo usuario
 * @route   POST /api/usuarios
 * @access  Privado (administrador)
 */
export const crearUsuario = async (req, res, next) => {
  try {
    const { nombre, email, password, rol, activo } = req.body;

    const existe = await Usuario.findOne({ email: email?.toLowerCase().trim() });
    if (existe) {
      return res.status(400).json({
        success: false,
        mensaje: 'Ya existe un usuario registrado con este correo electrónico'
      });
    }

    const usuario = await Usuario.create({
      nombre,
      email,
      password,
      rol,
      activo: activo !== undefined ? activo : true
    });

    res.status(201).json({
      success: true,
      mensaje: 'Usuario creado exitosamente',
      usuario
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar un usuario
 * @route   PUT /api/usuarios/:id
 * @access  Privado (administrador)
 */
export const actualizarUsuario = async (req, res, next) => {
  try {
    const { nombre, email, rol, activo, password } = req.body;

    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    // Verificar si el nuevo correo ya pertenece a otro usuario
    if (email && email.toLowerCase().trim() !== usuario.email) {
      const emailExistente = await Usuario.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: req.params.id }
      });
      if (emailExistente) {
        return res.status(400).json({
          success: false,
          mensaje: 'El correo electrónico ya está registrado por otro usuario'
        });
      }
      usuario.email = email.toLowerCase().trim();
    }

    if (nombre) usuario.nombre = nombre;
    if (rol) usuario.rol = rol;
    if (activo !== undefined) usuario.activo = activo;
    if (password) usuario.password = password; // Se hasheará por el hook pre-save

    await usuario.save();

    res.json({
      success: true,
      mensaje: 'Usuario actualizado exitosamente',
      usuario
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar usuario o desactivar
 * @route   DELETE /api/usuarios/:id
 * @access  Privado (administrador)
 */
export const eliminarUsuario = async (req, res, next) => {
  try {
    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    // Evitar que el administrador se elimine a sí mismo
    if (req.usuario && req.usuario._id.toString() === usuario._id.toString()) {
      return res.status(400).json({
        success: false,
        mensaje: 'No puedes eliminar tu propia cuenta de usuario'
      });
    }

    await Usuario.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      mensaje: 'Usuario eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};
