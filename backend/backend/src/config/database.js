import mongoose from 'mongoose';

/**
 * Conexión a la base de datos MongoDB (Local o MongoDB Atlas)
 * La conexión depende exclusivamente de la variable de entorno MONGODB_URI.
 */
const conectarDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      console.error('Error: La variable de entorno MONGODB_URI no está definida.');
      process.exit(1);
    }

    const conn = await mongoose.connect(uri);

    console.log(`MongoDB conectado correctamente: ${conn.connection.host} / BD: ${conn.connection.name}`);
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error.message);
    process.exit(1);
  }
};

export default conectarDB;
