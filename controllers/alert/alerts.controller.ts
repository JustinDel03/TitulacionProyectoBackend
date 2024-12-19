import { Request, Response } from 'express';
import { dbPool } from '../../db';
import { subirImagen } from '../../helpers/firebase.helpers';


export async function ListaAlertas(req: Request, res: Response) {
  try {
    // Consulta las alertas desde la base de datos
    const result = await dbPool.query('SELECT * FROM tbv_alertas');
    const alertas = result.rows;

    res.status(200).json({
      error: false,
      message: 'Usuarios obtenidos',
      data: alertas
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

  // Validar que los campos requeridos estén presentes
  if (!alerta || !alerta.id_usuario || !alerta.id_tipo_alerta || !alerta.descripcion) {
    return res.status(400).json({
      error: true,
      message: 'Datos incompletos: id_usuario, id_tipo_alerta y descripcion son requeridos',
    });
  }

  // Validar que se haya enviado un archivo
  if (!req.file) {
    return res.status(400).json({
      error: true,
      message: 'No se ha proporcionado ninguna imagen',
    });
  }

  const { originalname, buffer, mimetype } = req.file;

  try {
    // Subir la imagen a Firebase Storage y obtener la URL firmada
    const signedUrl = await subirImagen('alertas', originalname, buffer, mimetype);

    // Agregar la URL al objeto alerta
    alerta.imagen = signedUrl;

    // Llamar al procedimiento almacenado para guardar la alerta
    await dbPool.query('CALL insertar_alerta($1::JSON)', [alerta]);

    res.status(200).json({
      error: false,
      message: 'Alerta creada exitosamente',
      data: {
        image_url: signedUrl,
      },
    });
  } catch (err) {
    console.error('Error al crear la alerta:', err);
    res.status(500).json({
      error: true,
      message: 'Error al subir la imagen o guardar la alerta',
    });
  }
}