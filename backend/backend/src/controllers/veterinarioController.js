import Veterinario from '../models/Veterinario.js';
import Usuario from '../models/Usuario.js';
import Atencion from '../models/Atencion.js';

/**
 * @desc    Obtener lista de veterinarios (con filtros y búsqueda)
 * @route   GET /api/veterinarios
 * @access  Privado
 */
export const obtenerVeterinarios = async (req, res, next) => {
  try {
    const { especialidad, activo, busqueda } = req.query;
    const filtro = {};

    if (especialidad) {
      filtro.especialidad = { $regex: especialidad, $options: 'i' };
    }

    if (activo !== undefined) {
      filtro.activo = activo === 'true';
    }

    if (busqueda) {
      filtro.$or = [
        { nombre: { $regex: busqueda, $options: 'i' } },
        { documento: { $regex: busqueda, $options: 'i' } },
        { especialidad: { $regex: busqueda, $options: 'i' } },
        { correo: { $regex: busqueda, $options: 'i' } }
      ];
    }

    const veterinarios = await Veterinario.find(filtro)
      .populate('usuario', 'nombre email rol activo')
      .sort({ nombre: 1 });

    res.json({
      success: true,
      total: veterinarios.length,
      veterinarios
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener un veterinario por ID
 * @route   GET /api/veterinarios/:id
 * @access  Privado
 */
export const obtenerVeterinarioPorId = async (req, res, next) => {
  try {
    const veterinario = await Veterinario.findById(req.params.id).populate(
      'usuario',
      'nombre email rol activo'
    );

    if (!veterinario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Veterinario no encontrado'
      });
    }

    res.json({
      success: true,
      veterinario
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Registrar un nuevo veterinario
 * @route   POST /api/veterinarios
 * @access  Privado (administrador)
 */
export const crearVeterinario = async (req, res, next) => {
  try {
    const { nombre, documento, telefono, correo, especialidad, usuario, activo } = req.body;

    // Verificar documento único
    const existeDoc = await Veterinario.findOne({ documento: documento?.trim() });
    if (existeDoc) {
      return res.status(400).json({
        success: false,
        mensaje: `Ya existe un veterinario registrado con el documento ${documento}`
      });
    }

    // Si se vincula un usuario, verificar que exista
    if (usuario) {
      const usuarioExiste = await Usuario.findById(usuario);
      if (!usuarioExiste) {
        return res.status(400).json({
          success: false,
          mensaje: 'El usuario especificado para vincular no existe'
        });
      }
    }

    const nuevoVeterinario = await Veterinario.create({
      nombre,
      documento,
      telefono,
      correo,
      especialidad: especialidad || 'Medicina General',
      usuario: usuario || null,
      activo: activo !== undefined ? activo : true
    });

    const veterinarioPopulado = await Veterinario.findById(nuevoVeterinario._id).populate(
      'usuario',
      'nombre email rol activo'
    );

    res.status(201).json({
      success: true,
      mensaje: 'Veterinario registrado exitosamente',
      veterinario: veterinarioPopulado
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar información de un veterinario
 * @route   PUT /api/veterinarios/:id
 * @access  Privado (administrador)
 */
export const actualizarVeterinario = async (req, res, next) => {
  try {
    const { nombre, documento, telefono, correo, especialidad, usuario, activo } = req.body;

    const veterinario = await Veterinario.findById(req.params.id);
    if (!veterinario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Veterinario no encontrado'
      });
    }

    // Validar si el documento se cambia y ya está ocupado
    if (documento && documento.trim() !== veterinario.documento) {
      const existeDoc = await Veterinario.findOne({
        documento: documento.trim(),
        _id: { $ne: req.params.id }
      });
      if (existeDoc) {
        return res.status(400).json({
          success: false,
          mensaje: 'El documento de identidad ya está registrado para otro veterinario'
        });
      }
      veterinario.documento = documento.trim();
    }

    if (usuario && usuario !== (veterinario.usuario?.toString() || '')) {
      const usuarioExiste = await Usuario.findById(usuario);
      if (!usuarioExiste) {
        return res.status(400).json({
          success: false,
          mensaje: 'El usuario especificado para vincular no existe'
        });
      }
      veterinario.usuario = usuario;
    } else if (usuario === null) {
      veterinario.usuario = null;
    }

    if (nombre) veterinario.nombre = nombre;
    if (telefono) veterinario.telefono = telefono;
    if (correo) veterinario.correo = correo;
    if (especialidad !== undefined) veterinario.especialidad = especialidad;
    if (activo !== undefined) veterinario.activo = activo;

    await veterinario.save();

    const veterinarioActualizado = await Veterinario.findById(veterinario._id).populate(
      'usuario',
      'nombre email rol activo'
    );

    res.json({
      success: true,
      mensaje: 'Veterinario actualizado exitosamente',
      veterinario: veterinarioActualizado
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar o desactivar un veterinario
 * @route   DELETE /api/veterinarios/:id
 * @access  Privado (administrador)
 */
export const eliminarVeterinario = async (req, res, next) => {
  try {
    const veterinario = await Veterinario.findById(req.params.id);

    if (!veterinario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Veterinario no encontrado'
      });
    }

    // Verificar si tiene atenciones programadas o realizadas
    const atencionesCount = await Atencion.countDocuments({ veterinario: veterinario._id });

    if (atencionesCount > 0) {
      // Desactivación lógica para preservar el registro histórico de atenciones
      veterinario.activo = false;
      await veterinario.save();

      return res.json({
        success: true,
        mensaje: `El veterinario cuenta con ${atencionesCount} atenciones vinculadas. Se ha desactivado lógicamente para preservar los registros`,
        veterinario
      });
    }

    await Veterinario.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      mensaje: 'Veterinario eliminado permanentemente'
    });
  } catch (error) {
    next(error);
  }
};
