import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import conectarDB from './config/database.js';

// Importación de rutas
import authRoutes from './routes/authRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import propietarioRoutes from './routes/propietarioRoutes.js';
import mascotaRoutes from './routes/mascotaRoutes.js';
import veterinarioRoutes from './routes/veterinarioRoutes.js';
import atencionRoutes from './routes/atencionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Middlewares
import { rutaNoEncontrada, manejadorErrores } from './middleware/errorHandler.js';

// Cargar variables de entorno
dotenv.config();

const app = express();

// Configuración de CORS para permitir conexiones desde Axios y clientes web
const clientUrl = process.env.CLIENT_URL || 'http://localhost:9000';
app.use(
  cors({
    origin: (origin, callback) => {
      // Permite peticiones sin origen (como Postman o curl) o desde CLIENT_URL
      if (!origin || origin === clientUrl || origin === 'http://localhost:3000' || origin === 'http://localhost:5173') {
        callback(null, true);
      } else {
        callback(null, true); // En desarrollo permitir orígenes para pruebas
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Parsers para el cuerpo de las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta base y verificación de salud de la API
app.get('/', (req, res) => {
  res.json({
    nombre: 'VetCare API',
    descripcion: 'API REST para la gestión integral de veterinarias',
    version: '1.0.0',
    estado: 'Servidor en línea',
    documentacion: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      propietarios: '/api/propietarios',
      mascotas: '/api/mascotas',
      veterinarios: '/api/veterinarios',
      atenciones: '/api/atenciones',
      dashboard: '/api/dashboard'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mensaje: 'VetCare API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Montaje de rutas de la API REST
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/propietarios', propietarioRoutes);
app.use('/api/mascotas', mascotaRoutes);
app.use('/api/veterinarios', veterinarioRoutes);
app.use('/api/atenciones', atencionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Manejo de errores y 404
app.use(rutaNoEncontrada);
app.use(manejadorErrores);

// Iniciar servidor solo si no estamos ejecutando tests con supertest
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  conectarDB().then(() => {
    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` VetCare Backend escuchando en el puerto ${PORT}`);
      console.log(` Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(` URL Base: http://localhost:${PORT}`);
      console.log(`===============================================`);
    });
  });
}

export default app;
