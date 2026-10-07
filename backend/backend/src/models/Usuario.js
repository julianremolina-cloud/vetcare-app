import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'El correo electrónico no tiene un formato válido']
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
      select: false // No incluir por defecto en consultas find
    },
    rol: {
      type: String,
      required: [true, 'El rol es obligatorio'],
      enum: {
        values: ['administrador', 'administrativo', 'veterinario'],
        message: '{VALUE} no es un rol válido (permitidos: administrador, administrativo, veterinario)'
      }
    },
    activo: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      }
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      }
    }
  }
);

// Hash de la contraseña antes de guardar el usuario
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para verificar contraseña
usuarioSchema.methods.compararPassword = async function (passwordCandidato) {
  return await bcrypt.compare(passwordCandidato, this.password);
};

const Usuario = mongoose.model('Usuario', usuarioSchema);

export default Usuario;
