import { Request, Response } from 'express';
import { dbPool } from '../db';
import { bucket } from '../config/firebase';


export async function ListaAlertas(req: Request, res: Response) {
  try {
    const result = await dbPool.query('SELECT * FROM tbv_alertas');

    const usuarios = result.rows[0]

    res.status(200).json({
      error: false,
      message: 'Usuarios obtenidos',
      data: usuarios
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
    });
  }
}

export async function CrearAlerta(req: Request, res: Response) {
  console.log('Body recibido:', req.body.alerta);

  const alerta = JSON.parse(req.body.alerta);

  if (!alerta || !alerta.id_usuario || !alerta.id_tipo_alerta || !alerta.descripcion) {
    return res.status(400).json({
      error: true,
      message: 'Datos incompletos: id_usuario, id_tipo_alerta y descripcion son requeridos',
    });
  }

  if (!req.file) {
    return res.status(400).json({
      error: true,
      message: 'No se ha proporcionado ninguna imagen',
    });
  }

  const { originalname, buffer } = req.file;

  try {
    // Subir la imagen a Firebase Storage
    const blob = bucket.file(`alertas/${Date.now()}-${originalname}`);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    blobStream.on('error', (err) => {
      console.error('Error al subir la imagen:', err);
      res.status(500).json({
        error: true,
        message: 'Error al subir la imagen',
      });
    });

    blobStream.on('finish', async () => {
      const public_url = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

      // Agregar la URL al objeto alerta
      alerta.imagen = public_url;

      // Llamar al procedimiento almacenado para guardar la alerta
      try {        

        // Llamar al procedimiento almacenado
        await dbPool.query("CALL insertar_alerta($1::JSON)", [alerta]);

        res.status(200).json({
          error: false,
          message: 'Alerta creada exitosamente',
          data: {
            image_url: public_url,
          },
        });
      } catch (dbError) {
        console.error('Error al guardar la alerta en la base de datos:', dbError);
        res.status(500).json({
          error: true,
          message: 'Error al guardar la alerta en la base de datos',
        });
      }
    });

    blobStream.end(buffer);
  } catch (err) {
    console.error('Error interno al crear la alerta:', err);
    res.status(500).json({
      error: true,
      message: 'Error interno al crear la alerta',
    });
  }
}