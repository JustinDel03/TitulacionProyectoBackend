import express from 'express';
import cors from 'cors';
import usuarioRoutes from './routes/usuario';
import { initDbConnections } from './db';

const maxRetries = 5; // Número máximo de intentos de reconexión
const retryDelay = 5000; // Tiempo de espera entre intentos en milisegundos (5 segundos)

async function startServer() {
  let connected = false;
  let attempts = 0;

  while (!connected && attempts < maxRetries) {
    try {
      await initDbConnections();
      connected = true;
      console.log('Conexiones a la base de datos inicializadas.');
    } catch (error) {
      attempts++;
      console.error(`Error al intentar conectar a la base de datos (Intento ${attempts}/${maxRetries}):`, error);
      if (attempts < maxRetries) {
        console.log(`Reintentando en ${retryDelay / 1000} segundos...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        console.error('Número máximo de intentos alcanzado. No se pudo conectar a la base de datos.');
        process.exit(1);
      }
    }
  }

  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  app.use('/api/Usuario', usuarioRoutes);


  const port = process.env.PORT || 2500;
  app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });
}

startServer();
