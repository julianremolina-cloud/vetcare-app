import Mascota from '../models/Mascota.js';
import Propietario from '../models/Propietario.js';
import Atencion from '../models/Atencion.js';

/**
 * @desc    Obtener todas las mascotas (con filtros y búsqueda)
 * @route   GET /api/mascotas
 * @access  Privado
 */
export const obtenerMascotas = async (req, res, next) => {
  try {
    const { propietario, especie, activo, busqueda } = req.query;
    const filtro = {};

    if (propietario) {
      filtro.propietario = propietario;
    }

    if (especie) {
      filtro.especie = { $regex: especie, $options: 'i' };
    }

    if (activo !== undefined) {
      filtro.activo = activo === 'true';
    }

    if (busqueda) {
      filtro.$or = [
        { nombre: { $regex: busqueda, $options: 'i' } },
        { raza: { $regex: busqueda, $options: 'i' } }
      ];
    }

    const mascotas = await Mascota.find(filtro)
      .populate('propietario', 'nombre documento telefono correo direccion')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      total: mascotas.length,
      mascotas
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener una mascota por ID
 * @route   GET /api/mascotas/:id
 * @access  Privado
 */
export const obtenerMascotaPorId = async (req, res, next) => {
  try {
    const mascota = await Mascota.findById(req.params.id).populate(
      'propietario',
      'nombre documento telefono correo direccion'
    );

    if (!mascota) {
      return res.status(404).json({
        success: false,
        mensaje: 'Mascota no encontrada'
      });
    }

    res.json({
      success: true,
      mascota
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener historial clínico de una mascota (todas sus atenciones)
 * @route   GET /api/mascotas/:id/historial
 * @access  Privado
 */
export const obtenerHistorialMascota = async (req, res, next) => {
  try {
    const mascota = await Mascota.findById(req.params.id).populate('propietario');

    if (!mascota) {
      return res.status(404).json({
        success: false,
        mensaje: 'Mascota no encontrada'
      });
    }

    // Consultar todas las atenciones asociadas a esta mascota
    const atenciones = await Atencion.find({ mascota: req.params.id })
      .populate('veterinario', 'nombre especialidad telefono correo')
      .sort({ fecha: -1, createdAt: -1 });

    res.json({
      success: true,
      mascota,
      totalAtenciones: atenciones.length,
      atenciones
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Registrar una nueva mascota
 * @route   POST /api/mascotas
 * @access  Privado
 */
export const crearMascota = async (req, res, next) => {
  try {
    const { nombre, especie, raza, sexo, fechaNacimiento, color, propietario, activo } = req.body;

    // Verificar que el propietario exista
    const propietarioExiste = await Propietario.findById(propietario);
    if (!propietarioExiste) {
      return res.status(400).json({
        success: false,
        mensaje: 'El propietario especificado no existe'
      });
    }

    const nuevaMascota = await Mascota.create({
      nombre,
      especie,
      raza: raza || 'Mestizo',
      sexo: sexo || '',
      fechaNacimiento: fechaNacimiento || null,
      color: color || '',
      propietario,
      activo: activo !== undefined ? activo : true
    });

    const mascotaPopulada = await Mascota.findById(nuevaMascota._id).populate(
      'propietario',
      'nombre documento telefono correo'
    );

    res.status(201).json({
      success: true,
      mensaje: 'Mascota registrada exitosamente',
      mascota: mascotaPopulada
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar información de una mascota
 * @route   PUT /api/mascotas/:id
 * @access  Privado
 */
export const actualizarMascota = async (req, res, next) => {
  try {
    const { nombre, especie, raza, sexo, fechaNacimiento, color, propietario, activo } = req.body;

    const mascota = await Mascota.findById(req.params.id);
    if (!mascota) {
      return res.status(404).json({
        success: false,
        mensaje: 'Mascota no encontrada'
      });
    }

    if (propietario && propietario !== mascota.propietario.toString()) {
      const propietarioExiste = await Propietario.findById(propietario);
      if (!propietarioExiste) {
        return res.status(400).json({
          success: false,
          mensaje: 'El nuevo propietario especificado no existe'
        });
      }
      mascota.propietario = propietario;
    }

    if (nombre) mascota.nombre = nombre;
    if (especie) mascota.especie = especie;
    if (raza !== undefined) mascota.raza = raza;
    if (sexo !== undefined) mascota.sexo = sexo;
    if (fechaNacimiento !== undefined) mascota.fechaNacimiento = fechaNacimiento;
    if (color !== undefined) mascota.color = color;
    if (activo !== undefined) mascota.activo = activo;

    await mascota.save();

    const mascotaActualizada = await Mascota.findById(mascota._id).populate(
      'propietario',
      'nombre documento telefono correo'
    );

    res.json({
      success: true,
      mensaje: 'Mascota actualizada exitosamente',
      mascota: mascotaActualizada
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar o desactivar una mascota
 * @route   DELETE /api/mascotas/:id
 * @access  Privado
 */
export const eliminarMascota = async (req, res, next) => {
  try {
    const mascota = await Mascota.findById(req.params.id);

    if (!mascota) {
      return res.status(404).json({
        success: false,
        mensaje: 'Mascota no encontrada'
      });
    }

    // Verificar si tiene atenciones vinculadas
    const atencionesCount = await Atencion.countDocuments({ mascota: mascota._id });

    if (atencionesCount > 0) {
      // Si tiene atenciones, realizamos una desactivación lógica para preservar el historial clínico
      mascota.activo = false;
      await mascota.save();

      return res.json({
        success: true,
        mensaje: `La mascota tiene ${atencionesCount} atenciones registradas. Se ha desactivado lógicamente para preservar el historial clínico`,
        mascota
      });
    }

    await Mascota.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      mensaje: 'Mascota eliminada permanentemente'
    });
  } catch (error) {
    next(error);
  }
};
