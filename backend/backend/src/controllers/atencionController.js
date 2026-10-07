import Atencion from '../models/Atencion.js';
import Mascota from '../models/Mascota.js';
import Veterinario from '../models/Veterinario.js';

/**
 * @desc    Obtener todas las atenciones (con filtros por fecha, estado, veterinario, mascota)
 * @route   GET /api/atenciones
 * @access  Privado
 */
export const obtenerAtenciones = async (req, res, next) => {
  try {
    const { estado, veterinario, mascota, fecha, desde, hasta } = req.query;
    const filtro = {};

    if (estado) {
      filtro.estado = estado;
    }

    if (veterinario) {
      filtro.veterinario = veterinario;
    }

    if (mascota) {
      filtro.mascota = mascota;
    }

    // Filtro por fecha específica
    if (fecha) {
      const fechaInicio = new Date(fecha);
      fechaInicio.setUTCHours(0, 0, 0, 0);
      const fechaFin = new Date(fecha);
      fechaFin.setUTCHours(23, 59, 59, 999);
      filtro.fecha = { $gte: fechaInicio, $lte: fechaFin };
    } else if (desde || hasta) {
      filtro.fecha = {};
      if (desde) filtro.fecha.$gte = new Date(desde);
      if (hasta) {
        const hastaDate = new Date(hasta);
        hastaDate.setUTCHours(23, 59, 59, 999);
        filtro.fecha.$lte = hastaDate;
      }
    }

    const atenciones = await Atencion.find(filtro)
      .populate({
        path: 'mascota',
        select: 'nombre especie raza sexo color activo propietario',
        populate: {
          path: 'propietario',
          select: 'nombre documento telefono correo'
        }
      })
      .populate('veterinario', 'nombre especialidad telefono correo')
      .sort({ fecha: -1, hora: -1 });

    res.json({
      success: true,
      total: atenciones.length,
      atenciones
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Obtener una atención por ID con todos sus detalles clínicos
 * @route   GET /api/atenciones/:id
 * @access  Privado
 */
export const obtenerAtencionPorId = async (req, res, next) => {
  try {
    const atencion = await Atencion.findById(req.params.id)
      .populate({
        path: 'mascota',
        populate: {
          path: 'propietario',
          select: 'nombre documento telefono correo direccion'
        }
      })
      .populate('veterinario', 'nombre especialidad telefono correo');

    if (!atencion) {
      return res.status(404).json({
        success: false,
        mensaje: 'Atención no encontrada'
      });
    }

    res.json({
      success: true,
      atencion
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crear una nueva atención (cita programada o atención inmediata)
 * @route   POST /api/atenciones
 * @access  Privado
 */
export const crearAtencion = async (req, res, next) => {
  try {
    const {
      mascota,
      veterinario,
      fecha,
      hora,
      motivoConsulta,
      sintomas,
      diagnostico,
      tratamiento,
      observaciones,
      estado
    } = req.body;

    // Verificar existencia de la mascota
    const existeMascota = await Mascota.findById(mascota);
    if (!existeMascota) {
      return res.status(400).json({
        success: false,
        mensaje: 'La mascota especificada no existe'
      });
    }

    // Verificar existencia del veterinario
    const existeVeterinario = await Veterinario.findById(veterinario);
    if (!existeVeterinario) {
      return res.status(400).json({
        success: false,
        mensaje: 'El veterinario especificado no existe'
      });
    }

    const nuevaAtencion = await Atencion.create({
      mascota,
      veterinario,
      fecha: new Date(fecha),
      hora,
      motivoConsulta,
      sintomas: sintomas || '',
      diagnostico: diagnostico || '',
      tratamiento: tratamiento || '',
      observaciones: observaciones || '',
      estado: estado || 'Programada'
    });

    const atencionPopulada = await Atencion.findById(nuevaAtencion._id)
      .populate({
        path: 'mascota',
        populate: { path: 'propietario', select: 'nombre documento telefono' }
      })
      .populate('veterinario', 'nombre especialidad');

    res.status(201).json({
      success: true,
      mensaje: 'Atención registrada exitosamente',
      atencion: atencionPopulada
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Actualizar datos generales o clínicos de la atención (síntomas, diagnóstico, tratamiento, observaciones)
 * @route   PUT /api/atenciones/:id
 * @access  Privado
 */
export const actualizarAtencion = async (req, res, next) => {
  try {
    const {
      mascota,
      veterinario,
      fecha,
      hora,
      motivoConsulta,
      sintomas,
      diagnostico,
      tratamiento,
      observaciones,
      estado
    } = req.body;

    const atencion = await Atencion.findById(req.params.id);
    if (!atencion) {
      return res.status(404).json({
        success: false,
        mensaje: 'Atención no encontrada'
      });
    }

    if (mascota) {
      const existeMascota = await Mascota.findById(mascota);
      if (!existeMascota) {
        return res.status(400).json({ success: false, mensaje: 'La mascota especificada no existe' });
      }
      atencion.mascota = mascota;
    }

    if (veterinario) {
      const existeVet = await Veterinario.findById(veterinario);
      if (!existeVet) {
        return res.status(400).json({ success: false, mensaje: 'El veterinario especificado no existe' });
      }
      atencion.veterinario = veterinario;
    }

    if (fecha) atencion.fecha = new Date(fecha);
    if (hora) atencion.hora = hora;
    if (motivoConsulta) atencion.motivoConsulta = motivoConsulta;
    if (sintomas !== undefined) atencion.sintomas = sintomas;
    if (diagnostico !== undefined) atencion.diagnostico = diagnostico;
    if (tratamiento !== undefined) atencion.tratamiento = tratamiento;
    if (observaciones !== undefined) atencion.observaciones = observaciones;
    if (estado) atencion.estado = estado;

    await atencion.save();

    const atencionActualizada = await Atencion.findById(atencion._id)
      .populate({
        path: 'mascota',
        populate: { path: 'propietario', select: 'nombre documento telefono' }
      })
      .populate('veterinario', 'nombre especialidad');

    res.json({
      success: true,
      mensaje: 'Atención actualizada correctamente',
      atencion: atencionActualizada
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cambiar el estado de una atención (Programada, En curso, Finalizada, Cancelada)
 * @route   PATCH /api/atenciones/:id/estado
 * @access  Privado
 */
export const cambiarEstadoAtencion = async (req, res, next) => {
  try {
    const { estado } = req.body;
    const estadosPermitidos = ['Programada', 'En curso', 'Finalizada', 'Cancelada'];

    if (!estado || !estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        mensaje: `Estado no válido. Debe ser uno de los siguientes: ${estadosPermitidos.join(', ')}`
      });
    }

    const atencion = await Atencion.findById(req.params.id);
    if (!atencion) {
      return res.status(404).json({
        success: false,
        mensaje: 'Atención no encontrada'
      });
    }

    atencion.estado = estado;
    await atencion.save();

    const atencionActualizada = await Atencion.findById(atencion._id)
      .populate({
        path: 'mascota',
        populate: { path: 'propietario', select: 'nombre documento' }
      })
      .populate('veterinario', 'nombre especialidad');

    res.json({
      success: true,
      mensaje: `Estado de la atención actualizado a '${estado}'`,
      atencion: atencionActualizada
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Finalizar atención médica (asigna estado Finalizada y registra la información clínica)
 * @route   PATCH /api/atenciones/:id/finalizar
 * @access  Privado (veterinario o administrador)
 */
export const finalizarAtencion = async (req, res, next) => {
  try {
    const { sintomas, diagnostico, tratamiento, observaciones } = req.body;

    const atencion = await Atencion.findById(req.params.id);
    if (!atencion) {
      return res.status(404).json({
        success: false,
        mensaje: 'Atención no encontrada'
      });
    }

    if (!diagnostico) {
      return res.status(400).json({
        success: false,
        mensaje: 'Debe ingresar un diagnóstico para poder finalizar la atención médica'
      });
    }

    atencion.estado = 'Finalizada';
    if (sintomas !== undefined) atencion.sintomas = sintomas;
    if (diagnostico !== undefined) atencion.diagnostico = diagnostico;
    if (tratamiento !== undefined) atencion.tratamiento = tratamiento;
    if (observaciones !== undefined) atencion.observaciones = observaciones;

    await atencion.save();

    const atencionFinalizada = await Atencion.findById(atencion._id)
      .populate({
        path: 'mascota',
        populate: { path: 'propietario', select: 'nombre documento telefono' }
      })
      .populate('veterinario', 'nombre especialidad');

    res.json({
      success: true,
      mensaje: 'Atención médica finalizada con éxito',
      atencion: atencionFinalizada
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Eliminar o cancelar una atención
 * @route   DELETE /api/atenciones/:id
 * @access  Privado
 */
export const eliminarAtencion = async (req, res, next) => {
  try {
    const atencion = await Atencion.findById(req.params.id);

    if (!atencion) {
      return res.status(404).json({
        success: false,
        mensaje: 'Atención no encontrada'
      });
    }

    await Atencion.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      mensaje: 'Atención eliminada correctamente'
    });
  } catch (error) {
    next(error);
  }
};
