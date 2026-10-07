import mongoose from 'mongoose';

const mascotaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la mascota es obligatorio'],
      trim: true
    },
    especie: {
      type: String,
      required: [true, 'La especie es obligatoria'],
      trim: true
    },
    raza: {
      type: String,
      trim: true,
      default: 'Mestizo'
    },
    sexo: {
      type: String,
      trim: true,
      default: ''
    },
    fechaNacimiento: {
      type: Date
    },
    color: {
      type: String,
      trim: true,
      default: ''
    },
    propietario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Propietario',
      required: [true, 'El propietario de la mascota es obligatorio']
    },
    activo: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Mascota = mongoose.model('Mascota', mascotaSchema);

export default Mascota;
