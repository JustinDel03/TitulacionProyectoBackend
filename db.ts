import { Pool } from 'pg';
import * as config from './config.json';

export let poolLocalS: Pool;

export async function initDbConnections(): Promise<void> {
  poolLocalS = new Pool(config.conexionLocalS);

  try {
    await poolLocalS.connect();
    console.log('Conectado a la base de datos LocalS.');
  } catch (err) {
    console.error('Error al conectar a la base de datos LocalS:', err);
    throw err; // Lanza el error para que pueda ser manejado por quien llama a esta función
  }
}
