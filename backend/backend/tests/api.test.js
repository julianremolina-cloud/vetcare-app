import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'clave_secreta_para_tests_vetcare_2026';
process.env.JWT_EXPIRES_IN = '1d';

let mongod;
let app;
let tokenAdmin;
let tokenVeterinario;
let adminId;
let propietarioId;
let mascotaId;
let veterinarioId;
let atencionId;

before(async () => {
  // Iniciar servidor en memoria MongoDB
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;

  await mongoose.connect(uri);

  // Importar app después de configurar MONGODB_URI
  const appModule = await import('../src/app.js');
  app = appModule.default;
});

after(async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
});

test('1. Verificación de salud de la API', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.equal(res.body.mensaje, 'VetCare API funcionando correctamente');
});

test('2. Registro de Usuario Administrador inicial', async () => {
  const res = await request(app)
    .post('/api/auth/registro')
    .send({
      nombre: 'Administrador Test',
      email: 'admin.test@vetcare.com',
      password: 'Password123!',
      rol: 'administrador'
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.ok(res.body.token);
  assert.equal(res.body.usuario.email, 'admin.test@vetcare.com');
  assert.equal(res.body.usuario.rol, 'administrador');
  assert.equal(res.body.usuario.password, undefined); // La contraseña NO debe ser devuelta

  tokenAdmin = res.body.token;
  adminId = res.body.usuario._id;
});

test('3. Login con credenciales correctas', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin.test@vetcare.com',
      password: 'Password123!'
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.token);
  assert.equal(res.body.usuario.password, undefined);
});

test('4. Login con credenciales incorrectas (debe fallar con 401)', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin.test@vetcare.com',
      password: 'ClaveIncorrecta'
    });

  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

test('5. Acceso al perfil con token JWT', async () => {
  const res = await request(app)
    .get('/api/auth/perfil')
    .set('Authorization', `Bearer ${tokenAdmin}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.usuario.email, 'admin.test@vetcare.com');
});

test('6. Acceso no autorizado sin token (debe fallar con 401)', async () => {
  const res = await request(app).get('/api/auth/perfil');
  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

test('7. Creación de usuario con rol veterinario', async () => {
  const res = await request(app)
    .post('/api/usuarios')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({
      nombre: 'Dr. Roberto Gómez',
      email: 'dr.roberto@vetcare.com',
      password: 'VetPassword123!',
      rol: 'veterinario'
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.usuario.rol, 'veterinario');

  // Obtener token para el veterinario
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'dr.roberto@vetcare.com',
      password: 'VetPassword123!'
    });
  tokenVeterinario = loginRes.body.token;
});

test('8. CRUD Propietario: Crear propietario', async () => {
  const res = await request(app)
    .post('/api/propietarios')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({
      nombre: 'Carlos Santana',
      documento: 'CC-98765432',
      telefono: '3104567890',
      correo: 'carlos.santana@email.com',
      direccion: 'Carrera 15 # 100-20'
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.propietario.nombre, 'Carlos Santana');
  assert.equal(res.body.propietario.documento, 'CC-98765432');
  propietarioId = res.body.propietario._id;
});

test('9. Validación Propietario: Rechazar documento duplicado (código 400)', async () => {
  const res = await request(app)
    .post('/api/propietarios')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({
      nombre: 'Otro Propietario',
      documento: 'CC-98765432', // Mismo documento
      telefono: '3201112233'
    });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});

test('10. CRUD Veterinario: Crear veterinario', async () => {
  const res = await request(app)
    .post('/api/veterinarios')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({
      nombre: 'Dr. Roberto Gómez',
      documento: 'VET-2005',
      telefono: '3123456789',
      correo: 'dr.roberto@vetcare.com',
      especialidad: 'Cirugía General'
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.veterinario.documento, 'VET-2005');
  veterinarioId = res.body.veterinario._id;
});

test('11. CRUD Mascota: Registrar mascota vinculada a propietario', async () => {
  const res = await request(app)
    .post('/api/mascotas')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({
      nombre: 'Toby',
      especie: 'Canino',
      raza: 'Labrador Retriever',
      sexo: 'Macho',
      fechaNacimiento: '2022-03-10',
      color: 'Chocolate',
      propietario: propietarioId
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.mascota.nombre, 'Toby');
  assert.equal(res.body.mascota.propietario.nombre, 'Carlos Santana');
  mascotaId = res.body.mascota._id;
});

test('12. Flujo Atencion (Paso 1): Crear atención programada', async () => {
  const res = await request(app)
    .post('/api/atenciones')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({
      mascota: mascotaId,
      veterinario: veterinarioId,
      fecha: new Date().toISOString(),
      hora: '14:30',
      motivoConsulta: 'Dolor en pata delantera izquierda tras paseo'
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.atencion.estado, 'Programada');
  assert.equal(res.body.atencion.motivoConsulta, 'Dolor en pata delantera izquierda tras paseo');
  atencionId = res.body.atencion._id;
});

test('13. Flujo Atencion (Paso 2): Consultar la atención por ID con populates', async () => {
  const res = await request(app)
    .get(`/api/atenciones/${atencionId}`)
    .set('Authorization', `Bearer ${tokenAdmin}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.atencion.mascota.nombre, 'Toby');
  assert.equal(res.body.atencion.veterinario.nombre, 'Dr. Roberto Gómez');
});

test('14. Flujo Atencion (Paso 3): Cambiar estado a "En curso"', async () => {
  const res = await request(app)
    .patch(`/api/atenciones/${atencionId}/estado`)
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({ estado: 'En curso' });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.atencion.estado, 'En curso');
});

test('15. Flujo Atencion (Paso 4): Agregar síntomas y observaciones clínicas', async () => {
  const res = await request(app)
    .put(`/api/atenciones/${atencionId}`)
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({
      sintomas: 'Claudicación moderada miembro anterior izquierdo. Sensibilidad a la palpación del carpo',
      observaciones: 'Sin inflamación visible. Reflejos normales'
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.atencion.sintomas, 'Claudicación moderada miembro anterior izquierdo. Sensibilidad a la palpación del carpo');
});

test('16. Flujo Atencion (Paso 5): Finalizar la atención con diagnóstico y tratamiento', async () => {
  const res = await request(app)
    .patch(`/api/atenciones/${atencionId}/finalizar`)
    .set('Authorization', `Bearer ${tokenVeterinario}`)
    .send({
      diagnostico: 'Esguince leve carpal por trauma leve',
      tratamiento: 'Meloxicam 0.1 mg/kg cada 24 horas por 5 días. Reposo estricto.',
      observaciones: 'Revisión en 7 días si persiste dolor.'
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.atencion.estado, 'Finalizada');
  assert.equal(res.body.atencion.diagnostico, 'Esguince leve carpal por trauma leve');
  assert.ok(res.body.atencion.tratamiento.includes('Meloxicam'));
});

test('17. Historial clínico de Mascota: Consultar atenciones realizadas', async () => {
  const res = await request(app)
    .get(`/api/mascotas/${mascotaId}/historial`)
    .set('Authorization', `Bearer ${tokenAdmin}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.totalAtenciones, 1);
  assert.equal(res.body.atenciones[0].estado, 'Finalizada');
  assert.equal(res.body.atenciones[0].diagnostico, 'Esguince leve carpal por trauma leve');
});

test('18. Dashboard: Métricas y resumen general', async () => {
  const res = await request(app)
    .get('/api/dashboard/resumen')
    .set('Authorization', `Bearer ${tokenAdmin}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.estadisticas.totalMascotas, 1);
  assert.equal(res.body.estadisticas.totalPropietarios, 1);
  assert.equal(res.body.estadisticas.totalVeterinarios, 1);
  assert.equal(res.body.estadisticas.estadosAtencion.finalizadas, 1);
});
