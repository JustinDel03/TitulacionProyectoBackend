import { Request, Response, NextFunction } from 'express';
import { dbPool } from '../db';

export const validarSessionToken = async (req: Request, res: Response, next: NextFunction) => {
    const { correo } = req.query; // El correo se envía como parte de la solicitud

    console.log('Validando sesión para correo:', correo);

  
    if (!correo) {
      return res.status(400).json({
        error: true,
        message: 'Correo no proporcionado',
      });
    }
  
    try {
      const result = await dbPool.query(
        'SELECT session_token, fecha_token FROM usuarios WHERE correo = $1',
        [correo]
      );
  
      if (result.rowCount === 0) {
        return res.status(401).json({
          error: true,
          message: 'Usuario no encontrado',
        });
      }
  
      const { session_token, fecha_token } = result.rows[0];
      const expirationTime = 60 * 30 * 1000; // 30 minutos en milisegundos
  
     
  
      // Verificar si el token ha expirado
      const tokenAge = Date.now() - new Date(fecha_token).getTime();
      if (tokenAge > expirationTime) {
        // Invalidar el token si ha expirado
        await dbPool.query('UPDATE usuarios SET session_token = NULL, fecha_token = NULL WHERE correo = $1', [correo]);
        return res.status(401).json({
          error: true,
          message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        });

      }
  
      // Continuar con la solicitud
      next();
    } catch (error) {
      console.error('Error al validar el token:', error);
      res.status(500).json({
        error: true,
        message: 'Error interno del servidor',
      });
    }
  };
