
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Usuario from '../models/Usuario.js';
import Propietario from '../models/Propietario.js';
import Mascota from '../models/Mascota.js';
import Veterinario from '../models/Veterinario.js';
import Atencion from '../models/Atencion.js';

dotenv.config();

// Busca un registro existente. Si no existe, lo crea.
// Nunca elimina ni modifica los registros encontrados.
async function obtenerOCrear(Modelo, filtro, datos) {
  const existente = await Modelo.findOne(filtro);

  if (existente) {
    console.log(`Ya existe: ${Modelo.modelName} - ${existente._id}`);
    return existente;
  }

  const nuevo = await Modelo.create(datos);
  console.log(`Creado: ${Modelo.modelName} - ${nuevo._id}`);
  return nuevo;
}

async function ejecutarSeed() {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGODB_URI no está definido en .env');
    }

    console.log('Conectando a MongoDB...');
    await mongoose.connect(uri);
    console.log('Conexión establecida.');

    // 1. Usuarios: el modelo cifra las contraseñas automáticamente.
    const admin = await obtenerOCrear(
      Usuario,
      { email: 'admin@vetcare.com' },
      {
        nombre: 'Administrador General',
        email: 'admin@vetcare.com',
        password: 'Admin123!',
        rol: 'administrador',
        activo: true
      }
    );

    await obtenerOCrear(
      Usuario,
      { email: 'recepcion@vetcare.com' },
      {
        nombre: 'Laura Recepción',
        email: 'recepcion@vetcare.com',
        password: 'Recepcion123!',
        rol: 'administrativo',
        activo: true
      }
    );

    const usuarioVet = await obtenerOCrear(
      Usuario,
      { email: 'dr.mendoza@vetcare.com' },
      {
        nombre: 'Dr. Carlos Mendoza',
        email: 'dr.mendoza@vetcare.com',
        password: 'Vet123!',
        rol: 'veterinario',
        activo: true
      }
    );

    // 2. Veterinarios
    const vet1 = await obtenerOCrear(
      Veterinario,
      { documento: 'VET-1001' },
      {
        nombre: 'Dr. Carlos Mendoza',
        documento: 'VET-1001',
        telefono: '+57 300 123 4567',
        correo: 'dr.mendoza@vetcare.com',
        especialidad: 'Cirugía y Traumatología',
        usuario: usuarioVet._id,
        activo: true
      }
    );

    const vet2 = await obtenerOCrear(
      Veterinario,
      { documento: 'VET-1002' },
      {
        nombre: 'Dra. Sofía Ramírez',
        documento: 'VET-1002',
        telefono: '+57 311 987 6543',
        correo: 'dra.ramirez@vetcare.com',
        especialidad: 'Dermatología y Medicina Felina',
        usuario: null,
        activo: true
      }
    );

    // 3. Propietarios
    const prop1 = await obtenerOCrear(
      Propietario,
      { documento: '10172001' },
      {
        nombre: 'Juan Camilo Pérez',
        documento: '10172001',
        telefono: '3012223344',
        correo: 'juan.perez@email.com',
        direccion: 'Calle 45 # 12-34, Bogotá'
      }
    );

    const prop2 = await obtenerOCrear(
      Propietario,
      { documento: '10172002' },
      {
        nombre: 'María Camila Rodríguez',
        documento: '10172002',
        telefono: '3158889900',
        correo: 'maria.rodriguez@email.com',
        direccion: 'Carrera 7 # 85-20, Bogotá'
      }
    );

    const prop3 = await obtenerOCrear(
      Propietario,
      { documento: '10172003' },
      {
        nombre: 'Andrés Felipe Castro',
        documento: '10172003',
        telefono: '3205556677',
        correo: 'andres.castro@email.com',
        direccion: 'Avenida 68 # 24-50, Bogotá'
      }
    );

    // 4. Mascotas: se identifican por nombre y propietario.
    const mascota1 = await obtenerOCrear(
      Mascota,
      { nombre: 'Max', propietario: prop1._id },
      {
        nombre: 'Max',
        especie: 'Canino',
        raza: 'Golden Retriever',
        sexo: 'Macho',
        fechaNacimiento: new Date('2021-04-15'),
        color: 'Dorado',
        propietario: prop1._id,
        activo: true
      }
    );

    const mascota2 = await obtenerOCrear(
      Mascota,
      { nombre: 'Luna', propietario: prop2._id },
      {
        nombre: 'Luna',
        especie: 'Felino',
        raza: 'Siamés',
        sexo: 'Hembra',
        fechaNacimiento: new Date('2022-08-10'),
        color: 'Blanco con marrón',
        propietario: prop2._id,
        activo: true
      }
    );

    const mascota3 = await obtenerOCrear(
      Mascota,
      { nombre: 'Rocky', propietario: prop3._id },
      {
        nombre: 'Rocky',
        especie: 'Canino',
        raza: 'Bulldog Francés',
        sexo: 'Macho',
        fechaNacimiento: new Date('2023-01-20'),
        color: 'Atigrado',
        propietario: prop3._id,
        activo: true
      }
    );

    const mascota4 = await obtenerOCrear(
      Mascota,
      { nombre: 'Milo', propietario: prop1._id },
      {
        nombre: 'Milo',
        especie: 'Felino',
        raza: 'Angora',
        sexo: 'Macho',
        fechaNacimiento: new Date('2022-11-05'),
        color: 'Gris plata',
        propietario: prop1._id,
        activo: true
      }
    );

    // 5. Atenciones: se evita repetir la combinación de mascota,
    // veterinario, hora y motivo, aunque cambie la fecha del seed.
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fecha = (dias) => {
      const resultado = new Date(hoy);
      resultado.setDate(resultado.getDate() + dias);
      return resultado;
    };

    const atenciones = [
      {
        mascota: mascota1._id,
        veterinario: vet1._id,
        fecha: fecha(-1),
        hora: '09:00',
        motivoConsulta: 'Control general y chequeo preventivo anual',
        sintomas: 'Leve enrojecimiento en encías superiores',
        diagnostico: 'Gingivitis leve grado 1',
        tratamiento: 'Limpieza dental diaria y revisión en 3 meses',
        observaciones: 'Peso actual: 31.5 kg',
        estado: 'Finalizada'
      },
      {
        mascota: mascota2._id,
        veterinario: vet2._id,
        fecha: fecha(-3),
        hora: '11:30',
        motivoConsulta: 'Prurito constante y rascado en las orejas',
        sintomas: 'Sacudidas de cabeza y secreción oscura',
        diagnostico: 'Otitis externa parasitaria',
        tratamiento: 'Limpieza ótica y tratamiento veterinario',
        observaciones: 'Control programado en 2 semanas',
        estado: 'Finalizada'
      },
      {
        mascota: mascota3._id,
        veterinario: vet1._id,
        fecha: fecha(0),
        hora: '10:00',
        motivoConsulta: 'Dificultad respiratoria leve y estornudos frecuentes',
        sintomas: 'Respiración ruidosa y secreción nasal',
        diagnostico: 'Rinitis alérgica en evaluación',
        tratamiento: 'Evaluación y manejo veterinario',
        observaciones: 'Paciente en observación clínica',
        estado: 'En curso'
      },
      {
        mascota: mascota4._id,
        veterinario: vet2._id,
        fecha: fecha(1),
        hora: '15:00',
        motivoConsulta: 'Refuerzo de vacuna triple felina y desparasitación',
        sintomas: '',
        diagnostico: '',
        tratamiento: '',
        observaciones: 'Traer carnet de vacunación',
        estado: 'Programada'
      },
      {
        mascota: mascota1._id,
        veterinario: vet1._id,
        fecha: fecha(-7),
        hora: '14:00',
        motivoConsulta: 'Corte de uñas y baño estético medicado',
        sintomas: '',
        diagnostico: '',
        tratamiento: '',
        observaciones: 'Cancelada por el propietario',
        estado: 'Cancelada'
      }
    ];

    for (const atencion of atenciones) {
      await obtenerOCrear(
        Atencion,
        {
          mascota: atencion.mascota,
          veterinario: atencion.veterinario,
          hora: atencion.hora,
          motivoConsulta: atencion.motivoConsulta
        },
        atencion
      );
    }

    console.log('\nSeed terminado.');
    console.log('No se eliminaron registros existentes.');
    console.log('Usuarios de prueba configurados en el seed:');
    console.log('Administrador: admin@vetcare.com / Admin123!');
    console.log('Administrativo: recepcion@vetcare.com / Recepcion123!');
    console.log('Veterinario: dr.mendoza@vetcare.com / Vet123!');
    console.log(
      'Si una cuenta ya existía, su contraseña y rol no fueron modificados.'
    );
  } catch (error) {
    console.error('Error durante el seed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

ejecutarSeed();
