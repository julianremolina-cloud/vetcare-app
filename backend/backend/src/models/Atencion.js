import mongoose from 'mongoose';

const atencionSchema = new mongoose.Schema(
  {
    mascota: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mascota',
      required: [true, 'La mascota es obligatoria']
    },
    veterinario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Veterinario',
      required: [true, 'El veterinario es obligatorio']
    },
    fecha: {
      type: Date,
      required: [true, 'La fecha de la atención es obligatoria']
    },
    hora: {
      type: String,
      required: [true, 'La hora de la atención es obligatoria'],
      trim: true
    },
    motivoConsulta: {
      type: String,
      required: [true, 'El motivo de la consulta es obligatorio'],
      trim: true
    },
    sintomas: {
      type: String,
      trim: true,
      default: ''
    },
    diagnostico: {
      type: String,
      trim: true,
      default: ''
    },
    tratamiento: {
      type: String,
      trim: true,
      default: ''
    },
    observaciones: {
      type: String,
      trim: true,
      default: ''
    },
    estado: {
      type: String,
      required: [true, 'El estado de la atención es obligatorio'],
      enum: {
        values: ['Programada', 'En curso', 'Finalizada', 'Cancelada'],
        message: '{VALUE} no es un estado válido (permitidos: Programada, En curso, Finalizada, Cancelada)'
      },
      default: 'Programada'
    }
  },
  {
    timestamps: true
  }
);

const Atencion = mongoose.model('Atencion', atencionSchema);

export default Atencion;
