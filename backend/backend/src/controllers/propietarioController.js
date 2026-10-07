import Propietario from '../models/Propietario.js';
import Mascota from '../models/Mascota.js';

/**
 * @desc    Obtener lista de propietarios con búsqueda opcional
 * @route   GET /api/propietarios
 * @access  Privado
 */
export const obtenerPropietarios = async (req, res, next) => {
  try {
    const { busqueda } = req.query;
    const filtro = {};

    if (busqueda) {
      filtro.$or = [
        { nombre: { $regex: busqueda, $options: 'i' } },
        { documento: { $regex: busqueda, $options: 'i' } },
        { telefono: { $regex: busqueda, $options: 'i' } },
        { correo: { $regex: busqueda, $options: 'i' } }
      ];
    }

    const propietarios = await Propietario.find(filtro).sort({ nombre: 1 });

    res.json({
      success: true,
      total: propietarios.length,
      propietarios
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener un propietario por ID incluyendo sus mascotas
 * @route   GET /api/propietarios/:id
 * @access  Privado
 */
export const obtenerPropietarioPorId = async (req, res, next) => {
  try {
    const propietario = await Propietario.findById(req.params.id);

    if (!propietario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Propietario no encontrado'
      });
    }

    // Obtener mascotas asociadas a este propietario
    const mascotas = await Mascota.find({ propietario: propietario._id, activo: true });

    res.json({
      success: true,
      propietario,
      mascotas
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crear un nuevo propietario
 * @route   POST /api/propietarios
 * @access  Privado
 */
export const crearPropietario = async (req, res, next) => {
  try {
    const { nombre, documento, telefono, correo, direccion } = req.body;

    // Verificar si ya existe un propietario con el mismo documento
    const existe = await Propietario.findOne({ documento: documento?.trim() });
    if (existe) {
      return res.status(400).json({
        success: false,
        mensaje: `Ya existe un propietario registrado con el documento ${documento}`
      });
    }

    const propietario = await Propietario.create({
      nombre,
      documento,
      telefono,
      correo: correo ? correo.toLowerCase().trim() : '',
      direccion: direccion || ''
    });

    res.status(201).json({
      success: true,
      mensaje: 'Propietario registrado exitosamente',
      propietario
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar un propietario
 * @route   PUT /api/propietarios/:id
 * @access  Privado
 */
export const actualizarPropietario = async (req, res, next) => {
  try {
    const { nombre, documento, telefono, correo, direccion } = req.body;

    const propietario = await Propietario.findById(req.params.id);
    if (!propietario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Propietario no encontrado'
      });
    }

    // Validar si el nuevo documento ya está ocupado por otro propietario
    if (documento && documento.trim() !== propietario.documento) {
      const documentoExistente = await Propietario.findOne({
        documento: documento.trim(),
        _id: { $ne: req.params.id }
      });
      if (documentoExistente) {
        return res.status(400).json({
          success: false,
          mensaje: 'El documento de identidad ya se encuentra registrado para otro propietario'
        });
      }
      propietario.documento = documento.trim();
    }

    if (nombre) propietario.nombre = nombre;
    if (telefono) propietario.telefono = telefono;
    if (correo !== undefined) propietario.correo = correo.toLowerCase().trim();
    if (direccion !== undefined) propietario.direccion = direccion;

    await propietario.save();

    res.json({
      success: true,
      mensaje: 'Propietario actualizado exitosamente',
      propietario
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar un propietario
 * @route   DELETE /api/propietarios/:id
 * @access  Privado
 */
export const eliminarPropietario = async (req, res, next) => {
  try {
    const propietario = await Propietario.findById(req.params.id);

    if (!propietario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Propietario no encontrado'
      });
    }

    // Verificar si tiene mascotas registradas
    const mascotasAsociadas = await Mascota.countDocuments({ propietario: propietario._id, activo: true });
    if (mascotasAsociadas > 0) {
      return res.status(400).json({
        success: false,
        mensaje: `No se puede eliminar el propietario porque tiene ${mascotasAsociadas} mascota(s) activa(s) registrada(s)`
      });
    }

    await Propietario.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      mensaje: 'Propietario eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};
