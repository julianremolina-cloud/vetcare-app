import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Usuario from '../models/Usuario.js';
import Propietario from '../models/Propietario.js';
import Mascota from '../models/Mascota.js';
import Veterinario from '../models/Veterinario.js';
import Atencion from '../models/Atencion.js';

dotenv.config();

const ejecutarSeed = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('Error: MONGODB_URI no está definido en el archivo .env');
      process.exit(1);
    }

    console.log('Conectando a MongoDB para ejecutar Seed...');
    await mongoose.connect(uri);
    console.log('Conexión establecida.');

    console.log('Limpiando colecciones existentes...');
    await Promise.all([
      Usuario.deleteMany({}),
      Propietario.deleteMany({}),
      Mascota.deleteMany({}),
      Veterinario.deleteMany({}),
      Atencion.deleteMany({})
    ]);
    console.log('Colecciones limpiadas.');

    // 1. Crear Usuarios de prueba
    console.log('Creando usuarios iniciales...');
    const adminUser = await Usuario.create({
      nombre: 'Administrador General',
      email: 'admin@vetcare.com',
      password: 'Admin123!',
      rol: 'administrador',
      activo: true
    });

    const recepcionUser = await Usuario.create({
      nombre: 'Laura Recepción',
      email: 'recepcion@vetcare.com',
      password: 'Recepcion123!',
      rol: 'administrativo',
      activo: true
    });

    const vetUser = await Usuario.create({
      nombre: 'Dr. Carlos Mendoza',
      email: 'dr.mendoza@vetcare.com',
      password: 'Vet123!',
      rol: 'veterinario',
      activo: true
    });

    console.log('3 Usuarios creados exitosamente.');

    // 2. Crear Veterinarios
    console.log('Creando veterinarios...');
    const vet1 = await Veterinario.create({
      nombre: 'Dr. Carlos Mendoza',
      documento: 'VET-1001',
      telefono: '+57 300 123 4567',
      correo: 'dr.mendoza@vetcare.com',
      especialidad: 'Cirugía y Traumatología',
      usuario: vetUser._id,
      activo: true
    });

    const vet2 = await Veterinario.create({
      nombre: 'Dra. Sofía Ramírez',
      documento: 'VET-1002',
      telefono: '+57 311 987 6543',
      correo: 'dra.ramirez@vetcare.com',
      especialidad: 'Dermatología y Medicina Felina',
      usuario: null,
      activo: true
    });

    console.log('2 Veterinarios creados exitosamente.');

    // 3. Crear Propietarios
    console.log('Creando propietarios...');
    const prop1 = await Propietario.create({
      nombre: 'Juan Camilo Pérez',
      documento: '10172001',
      telefono: '3012223344',
      correo: 'juan.perez@email.com',
      direccion: 'Calle 45 # 12-34, Bogotá'
    });

    const prop2 = await Propietario.create({
      nombre: 'María Camila Rodríguez',
      documento: '10172002',
      telefono: '3158889900',
      correo: 'maria.rodriguez@email.com',
      direccion: 'Carrera 7 # 85-20, Bogotá'
    });

    const prop3 = await Propietario.create({
      nombre: 'Andrés Felipe Castro',
      documento: '10172003',
      telefono: '3205556677',
      correo: 'andres.castro@email.com',
      direccion: 'Avenida 68 # 24-50, Bogotá'
    });

    console.log('3 Propietarios creados exitosamente.');

    // 4. Crear Mascotas vinculadas a Propietarios
    console.log('Creando mascotas...');
    const mascota1 = await Mascota.create({
      nombre: 'Max',
      especie: 'Canino',
      raza: 'Golden Retriever',
      sexo: 'Macho',
      fechaNacimiento: new Date('2021-04-15'),
      color: 'Dorado',
      propietario: prop1._id,
      activo: true
    });

    const mascota2 = await Mascota.create({
      nombre: 'Luna',
      especie: 'Felino',
      raza: 'Siamés',
      sexo: 'Hembra',
      fechaNacimiento: new Date('2022-08-10'),
      color: 'Blanco con marrón',
      propietario: prop2._id,
      activo: true
    });

    const mascota3 = await Mascota.create({
      nombre: 'Rocky',
      especie: 'Canino',
      raza: 'Bulldog Francés',
      sexo: 'Macho',
      fechaNacimiento: new Date('2023-01-20'),
      color: 'Atigrado',
      propietario: prop3._id,
      activo: true
    });

    const mascota4 = await Mascota.create({
      nombre: 'Milo',
      especie: 'Felino',
      raza: 'Angora',
      sexo: 'Macho',
      fechaNacimiento: new Date('2022-11-05'),
      color: 'Gris plata',
      propietario: prop1._id,
      activo: true
    });

    console.log('4 Mascotas creadas exitosamente.');

    // 5. Crear Atenciones (Citas y Consultas unificadas)
    console.log('Creando atenciones veterinarias...');
    const fechaAyer = new Date();
    fechaAyer.setDate(fechaAyer.getDate() - 1);

    const fechaHace3Dias = new Date();
    fechaHace3Dias.setDate(fechaHace3Dias.getDate() - 3);

    const fechaHoy = new Date();

    const fechaManana = new Date();
    fechaManana.setDate(fechaManana.getDate() + 1);

    const fechaSemanaPasada = new Date();
    fechaSemanaPasada.setDate(fechaSemanaPasada.getDate() - 7);

    // Atención 1: Finalizada con historial médico completo
    await Atencion.create({
      mascota: mascota1._id,
      veterinario: vet1._id,
      fecha: fechaAyer,
      hora: '09:00',
      motivoConsulta: 'Control general y chequeo preventivo anual',
      sintomas: 'Paciente activo, presenta leve enrojecimiento en encías superiores',
      diagnostico: 'Gingivitis leve grado 1',
      tratamiento: 'Limpieza dental con pasta enzimática profiláctica diaria. Revisión en 3 meses.',
      observaciones: 'Peso actual: 31.5 kg. Vacunas al día.',
      estado: 'Finalizada'
    });

    // Atención 2: Finalizada con historial médico dermatológico
    await Atencion.create({
      mascota: mascota2._id,
      veterinario: vet2._id,
      fecha: fechaHace3Dias,
      hora: '11:30',
      motivoConsulta: 'Prurito constante y rascado en las orejas',
      sintomas: 'Sacudidas de cabeza, secreción ceruminosa oscura en canal auditivo',
      diagnostico: 'Otitis externa parasitaria por Otodectes cynotis',
      tratamiento: 'Limpieza con solución ótica y gotas acaricidas cada 12 horas por 14 días.',
      observaciones: 'Se toma muestra citológica de control. Control programado en 2 semanas.',
      estado: 'Finalizada'
    });

    // Atención 3: En curso hoy
    await Atencion.create({
      mascota: mascota3._id,
      veterinario: vet1._id,
      fecha: fechaHoy,
      hora: '10:00',
      motivoConsulta: 'Dificultad respiratoria leve y estornudos frecuentes',
      sintomas: 'Respiración ruidosa estertorosa con leve secreción nasal transparente',
      diagnostico: 'Rinitis alérgica estacional en evaluación',
      tratamiento: 'Nebulizaciones con suero fisiológico y antihistamínico vía oral',
      observaciones: 'Paciente en sala de observación clínica.',
      estado: 'En curso'
    });

    // Atención 4: Programada para mañana
    await Atencion.create({
      mascota: mascota4._id,
      veterinario: vet2._id,
      fecha: fechaManana,
      hora: '15:00',
      motivoConsulta: 'Aplicación de refuerzo de vacuna triple felina y desparasitación',
      sintomas: '',
      diagnostico: '',
      tratamiento: '',
      observaciones: 'Recordar al dueño traer carnet de vacunación.',
      estado: 'Programada'
    });

    // Atención 5: Cancelada
    await Atencion.create({
      mascota: mascota1._id,
      veterinario: vet1._id,
      fecha: fechaSemanaPasada,
      hora: '14:00',
      motivoConsulta: 'Corte de uñas y baño estético medicado',
      sintomas: '',
      diagnostico: '',
      tratamiento: '',
      observaciones: 'El propietario canceló por motivos de viaje familiar.',
      estado: 'Cancelada'
    });

    console.log('5 Atenciones veterinarias creadas exitosamente.');
    console.log('====================================================');
    console.log('¡SEED COMPLETADO CON ÉXITO!');
    console.log('Usuarios disponibles para pruebas:');
    console.log('  1. Admin:         admin@vetcare.com     / Clave: Admin123!');
    console.log('  2. Recepción:     recepcion@vetcare.com / Clave: Recepcion123!');
    console.log('  3. Veterinario:   dr.mendoza@vetcare.com / Clave: Vet123!');
    console.log('====================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error durante la ejecución del Seed:', error);
    process.exit(1);
  }
};

ejecutarSeed();
