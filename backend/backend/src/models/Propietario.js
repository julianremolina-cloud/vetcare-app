import mongoose from 'mongoose';

const propietarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del propietario es obligatorio'],
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
      trim: true,
      lowercase: true,
      default: ''
    },
    direccion: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Propietario = mongoose.model('Propietario', propietarioSchema);

export default Propietario;
