import { Request, Response } from 'express';
import { dbPool } from '../../db';
import { subirImagen  } from '../../helpers/firebase.helpers';
import { responseService } from '../../helpers/methods.helpers';
import { messageResponse } from '../../helpers/message.helpers';
import { DatosJwt } from '../../models/jwt.interface';


export async function ListaObservaciones(req: Request, res: Response) {
  try {

    const {estado, id_usuario} = req.query;

    const estadoBoolean = estado !== undefined ? estado === 'true' : null;

    console.log(typeof(estadoBoolean));
    // Consulta las alertas desde la base de datos
    const result = await dbPool.query('SELECT * FROM buscar_observaciones_estado($1,$2)', [estadoBoolean, id_usuario || null]);
    const observaciones = result.rows;
    const data = {
      observaciones : observaciones
    }
    return responseService(200, data, messageResponse["200"], false, res );

  } catch (err) {
    console.error('Error:', err);
    responseService(500,null, messageResponse["500"], false, res)
  }
}

export async function CrearObservacion(req: Request, res: Response) {

  const observacion = JSON.parse(req.body.observacion);
  const datos = JSON.parse((req.headers.datos) as string ) as DatosJwt;
  observacion.id_usuario = datos.id_usuario;
  console.log('body: ', observacion);
  // Validar que los campos requeridos estén presentes
  if (!observacion || !observacion.id_especie || !observacion.descripcion || !observacion.coordenada_longitud || !observacion.coordenada_latitud || !observacion.estado) {
    return responseService(400, null, messageResponse["400"], true, res);
  }

  // Validar que se haya enviado un archivo
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return responseService(400, null, messageResponse["400"], true, res);
  }

  try {
    // Subir las imágenes a Firebase Storage y obtener las URLs firmadas
    const imageUrls: string[] = await Promise.all(
      req.files.map((file: Express.Multer.File) => 
        subirImagen('observaciones', file.originalname, file.buffer, file.mimetype)
      )
    );

    // Agregar las URLs de las imágenes directamente al objeto alerta
    observacion.imagen_1 = imageUrls[0] || null;
    observacion.imagen_2 = imageUrls[1] || null;
    observacion.imagen_3 = imageUrls[2] || null;
    observacion.estado = false;
    // Llamar al procedimiento almacenado para guardar la alerta
    const insertResult = await dbPool.query('CALL sp_crear_observacion($1::JSON, $2)', [observacion, null]);
    const id_observacion = insertResult.rows[0].new_id;

    const result = await dbPool.query(
      'SELECT * FROM tbv_observaciones WHERE id_observacion = $1',
      [id_observacion]
    );

    if (result.rowCount === 0) {
      return responseService(500, null, messageResponse["500"], true, res);
    }

    const observacionActualizada = result.rows[0];


    // 📢 Emitimos la nueva alerta a todos los clientes conectados
    const io = req.app.get("socketio");
    io.emit("actualizarAlerta", observacionActualizada);

    return responseService(201, null, messageResponse["201"], false, res);

   
  } catch (err) {
    console.error('Error al crear la observacion:', err);
    responseService(500, null, messageResponse["500"], true, res);
  }
}


export async function CambiarEstadoObservacion(req: Request, res: Response) {
  try {
    const { id_observacion, estado } = req.body;
    if (!id_observacion || !estado) {
      return responseService(400, null, messageResponse["400"], true, res);

    }

    const result = await dbPool.query(
      'UPDATE observaciones SET estado = $1 WHERE id_observacion = $2 RETURNING *',
      [estado, id_observacion]
    );

    if (result.rowCount === 0) {
      return responseService(404, null, messageResponse["404"], true, res);
    }

    const observacionActualizada = result.rows[0];

    // 📢 Emitimos la actualización de estado a los clientes conectados
    const io = req.app.get("socketio");
    io.emit("actualizarAlerta", observacionActualizada);

    return responseService(200, observacionActualizada,messageResponse["200"], false, res);

  } catch (error) {
    console.error("Error al cambiar el estado de la alerta:", error);
    responseService(500, null, messageResponse["500"], true, res);
  }
}

export async function EliminarObservacion(req: Request, res: Response) {
  try {
    const { id_observacion } = req.params;
    if (!id_observacion) {
      return responseService(400, null, messageResponse["400"], true, res);
    }

    const result = await dbPool.query(
      'DELETE FROM observaciones WHERE id_observacion = $1 RETURNING *',
      [id_observacion]
    );

    if (result.rowCount === 0) {
      return responseService(404, null, messageResponse["404"], true, res);
    }

    // 📢 Emitimos evento de eliminación a todos los clientes conectados
    const io = req.app.get("socketio");
    io.emit("actualizarAlerta", { id_observacion, eliminada: true });

    return responseService(200, null, messageResponse["200"], false, res);

  } catch (error) {
    console.error("Error al eliminar la alerta:", error);
    responseService(500, null, messageResponse["500"], true, res);
  }
}