import mongoose from 'mongoose';

const veterinarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del veterinario es obligatorio'],
      trim: true
    },
    documento: {
      type: String,
      required: [true, 'El documento de identidad es obligatorio'],
      unique: true,
      trim: true
    },
    telefono: {
      type: String,
      required: [true, 'El teléfono es obligatorio'],
      trim: true
    },
    correo: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'El correo electrónico no tiene un formato válido']
    },
    especialidad: {
      type: String,
      trim: true,
      default: 'Medicina General'
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null
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

const Veterinario = mongoose.model('Veterinario', veterinarioSchema);

export default Veterinario;
