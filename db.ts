import { Pool } from 'pg';
import config from './config/config';

export let dbPool: Pool;

// Inicializa las conexiones a la base de datos
export async function initDbConnections(): Promise<void> {
  dbPool = new Pool(config.database);

  console.log(config.database);

  try {
    await dbPool.connect();
    console.log('Conexión a la base de datos establecida.');
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
    throw err; // Lanza el error para ser manejado por el servidor
  }
}

// Finaliza las conexiones (útil al cerrar la aplicación)
export async function closeDbConnections(): Promise<void> {
  if (dbPool) {
    await dbPool.end();
    console.log('Conexiones a la base de datos cerradas.');
  }
}
