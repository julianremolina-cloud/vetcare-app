import Mascota from '../models/Mascota.js';
import Propietario from '../models/Propietario.js';
import Veterinario from '../models/Veterinario.js';
import Atencion from '../models/Atencion.js';
import Usuario from '../models/Usuario.js';

/**
 * @desc    Obtener métricas y resumen general para el Dashboard
 * @route   GET /api/dashboard/resumen
 * @access  Privado
 */
export const obtenerResumenDashboard = async (req, res, next) => {
  try {
    // Rango de fechas de hoy
    const hoyInicio = new Date();
    hoyInicio.setUTCHours(0, 0, 0, 0);
    const hoyFin = new Date();
    hoyFin.setUTCHours(23, 59, 59, 999);

    const [
      totalMascotas,
      totalPropietarios,
      totalVeterinarios,
      totalUsuarios,
      totalAtenciones,
      atencionesHoy,
      atencionesProgramadas,
      atencionesEnCurso,
      atencionesFinalizadas,
      proximasAtenciones
    ] = await Promise.all([
      Mascota.countDocuments({ activo: true }),
      Propietario.countDocuments(),
      Veterinario.countDocuments({ activo: true }),
      Usuario.countDocuments({ activo: true }),
      Atencion.countDocuments(),
      Atencion.countDocuments({ fecha: { $gte: hoyInicio, $lte: hoyFin } }),
      Atencion.countDocuments({ estado: 'Programada' }),
      Atencion.countDocuments({ estado: 'En curso' }),
      Atencion.countDocuments({ estado: 'Finalizada' }),
      Atencion.find({
        fecha: { $gte: hoyInicio },
        estado: { $in: ['Programada', 'En curso'] }
      })
        .populate({
          path: 'mascota',
          select: 'nombre especie raza',
          populate: { path: 'propietario', select: 'nombre telefono' }
        })
        .populate('veterinario', 'nombre especialidad')
        .sort({ fecha: 1, hora: 1 })
        .limit(5)
    ]);

    res.json({
      success: true,
      estadisticas: {
        totalMascotas,
        totalPropietarios,
        totalVeterinarios,
        totalUsuarios,
        totalAtenciones,
        atencionesHoy,
        estadosAtencion: {
          programadas: atencionesProgramadas,
          enCurso: atencionesEnCurso,
          finalizadas: atencionesFinalizadas
        }
      },
      proximasAtenciones
    });
  } catch (error) {
    next(error);
  }
};
