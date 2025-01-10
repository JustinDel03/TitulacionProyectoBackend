import { Request, Response } from 'express';
import { dbPool } from '../../db';

import { subirImagen  } from '../../helpers/firebase.helpers';
import { responseService } from '../../helpers/methods.helpers';
import { messageResponse } from '../../helpers/message.helpers';
import { DatosJwt } from '../../models/jwt.interface';





export async function ListaAlertas(req: Request, res: Response) {
  try {
    // Consulta las alertas desde la base de datos
    const result = await dbPool.query('SELECT * FROM tbv_alertas');
    const alertas = result.rows;

    return responseService(200, alertas, messageResponse["200"], false, res );

  } catch (err) {
    console.error('Error:', err);
    responseService(500,null, messageResponse["500"], false, res)
  }
}

export async function CrearAlerta(req: Request, res: Response) {
  console.log('Body recibido:', req.body.alerta);

  const alerta = JSON.parse(req.body.alerta);
   const datos = JSON.parse((req.headers.datos) as string ) as DatosJwt;
   alerta.id_usuario = datos.id_usuario;
  //  console.log(alerta.id_usuario)
  // Validar que los campos requeridos estén presentes
  if (!alerta || !alerta.id_usuario || !alerta.id_tipo_alerta || !alerta.descripcion) {
  
    return responseService(400, null, messageResponse["400"], true, res);
    
  }

  // Validar que se haya enviado un archivo
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return res.status(400).json({
      error: true,
      message: 'No se ha proporcionado ninguna imagen',
    });
  }


  try {
    // Subir las imágenes a Firebase Storage y obtener las URLs firmadas
    const imageUrls: string[] = await Promise.all(
      req.files.map((file: Express.Multer.File) => 
        
        subirImagen('alertas', file.originalname, file.buffer, file.mimetype)
      )
    );

    // Agregar las URLs de las imágenes directamente al objeto alerta
    alerta.imagen_1 = imageUrls[0] || null;
    alerta.imagen_2 = imageUrls[1] || null;
    alerta.imagen_3 = imageUrls[2] || null;

    alerta.id_estado = 1
    // Llamar al procedimiento almacenado para guardar la alerta
    const insertResult = await dbPool.query('CALL sp_crear_alerta($1::JSON, $2)', [alerta, null]);

    const id_alerta = insertResult.rows[0].new_id;
    console.log(alerta);
    const result = await dbPool.query(
      'SELECT * FROM tbv_alertas WHERE id_alerta = $1',
      [id_alerta]
    );

    if (result.rowCount === 0) {
      return responseService(500, null, messageResponse["500"], true, res);
    }

    const alertaCompleta = result.rows[0];


    // 📢 Emitimos la nueva alerta a todos los clientes conectados
    const io = req.app.get("socketio");
    io.emit("actualizarAlerta", alertaCompleta);

    return responseService(201, null, messageResponse["201"], false, res);

   
  } catch (err) {
    console.error('Error al crear la alerta:', err);
    responseService(500, null, messageResponse["500"], true, res);
  }
}


export async function CambiarEstadoAlerta(req: Request, res: Response) {
  try {
    const { id_alerta, nuevo_estado } = req.body;
    if (!id_alerta || !nuevo_estado) {
      return responseService(400, null, messageResponse["400"], true, res);

    }

    const result = await dbPool.query(
      'UPDATE tbv_alertas SET estado = $1 WHERE id_alerta = $2 RETURNING *',
      [nuevo_estado, id_alerta]
    );

    if (result.rowCount === 0) {
      return responseService(404, null, messageResponse["404"], true, res);
    }

    const alertaActualizada = result.rows[0];

    // 📢 Emitimos la actualización de estado a los clientes conectados
    const io = req.app.get("socketio");
    io.emit("actualizarAlerta", alertaActualizada);

    return responseService(200, alertaActualizada, "Estado de alerta actualizado", false, res);

  } catch (error) {
    console.error("Error al cambiar el estado de la alerta:", error);
    responseService(500, null, messageResponse["500"], true, res);
  }
}

export async function EliminarAlerta(req: Request, res: Response) {
  try {
    const { id_alerta } = req.params;
    if (!id_alerta) {
      return responseService(400, null, messageResponse["400"], true, res);
    }

    const result = await dbPool.query(
      'DELETE FROM tbv_alertas WHERE id_alerta = $1 RETURNING *',
      [id_alerta]
    );

    if (result.rowCount === 0) {
      return responseService(404, null, messageResponse["404"], true, res);
    }

    // 📢 Emitimos evento de eliminación a todos los clientes conectados
    const io = req.app.get("socketio");
    io.emit("actualizarAlerta", { id_alerta, eliminada: true });

    return responseService(200, null, messageResponse["200"], false, res);

  } catch (error) {
    console.error("Error al eliminar la alerta:", error);
    responseService(500, null, messageResponse["500"], true, res);
  }
}


export async function tipos_alertas(req: Request, res: Response) {
  try {
    const result = await dbPool.query('SELECT * FROM tbv_tipo_alertas');
    const sendero =  await dbPool.query('SELECT * FROM tbv_sendero');
    // const tipo_alertas = result.rows;
    const data = {
      tipos_alertas : result.rows,
      senderos: sendero.rows

    }
    return responseService(200, data, messageResponse["200"], false, res );

  } catch (err) {
    console.error('Error:', err);
    responseService(500,null, messageResponse["500"], false, res)

  }
}