import { Request, Response } from 'express';
import { dbPool } from '../../db';
import { subirImagen } from '../../helpers/firebase.helpers';
import { responseService } from '../../helpers/methods.helpers';
import { messageResponse } from '../../helpers/message.helpers';
import { DatosJwt } from '../../models/jwt.interface';
import { Console } from 'console';


export async function ListaObservacionesCompleta(req: Request, res: Response) {
  try {

    // Consulta las alertas desde la base de datos
    const result = await dbPool.query('SELECT * FROM tbv_observaciones');
    const observaciones = result.rows;


    return responseService(200, observaciones, messageResponse["200"], false, res);
  } catch (err) {
    console.error('Error:', err);
    responseService(500, null, messageResponse["500"], false, res)
  }
}


export async function ListaSenderos(req: Request, res: Response) {
  try {

    // Consulta las alertas desde la base de datos
    const result = await dbPool.query('SELECT * FROM tbv_sendero');
    const senderos = result.rows;


    return responseService(200, senderos, messageResponse["200"], false, res);
  } catch (err) {
    console.error('Error:', err);
    responseService(500, null, messageResponse["500"], false, res)
  }
}



export async function ListaObservaciones(req: Request, res: Response) {
  try {

    const { estado, id_usuario } = req.query;

    const estadoBoolean = estado !== undefined ? estado === 'true' : null;

    console.log(typeof (estadoBoolean));
    // Consulta las alertas desde la base de datos
    const result = await dbPool.query('SELECT * FROM buscar_observaciones_estado($1,$2)', [estadoBoolean, id_usuario || null]);
    const observaciones = result.rows;
    const data = {
      observaciones: observaciones
    }
    return responseService(200, data, messageResponse["200"], false, res);

  } catch (err) {
    console.error('Error:', err);
    responseService(500, null, messageResponse["500"], false, res)
  }
}

export async function CrearObservacion(req: Request, res: Response) {

  const observacion = JSON.parse(req.body.observacion);
  const datos = JSON.parse((req.headers.datos) as string) as DatosJwt;
  
  observacion.id_usuario = datos.id_usuario;
  console.log('body: ', observacion);
  // Validar que los campos requeridos estén presentes
  if (!observacion || !observacion.descripcion || !observacion.coordenada_longitud || !observacion.coordenada_latitud) {
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

    return responseService(200, null, messageResponse["200"], false, res);


  } catch (err) {
    console.error('Error al crear la observacion:', err);
    responseService(500, null, messageResponse["500"], true, res);
  }
}

export async function EditarObservacion(req: Request, res: Response) {
  try {
    const observacion = JSON.parse(req.body.observacion)
    const imagenesInfo = JSON.parse(req.body.imagenes)

    if (!observacion.id_observacion) {
      return responseService(400, null, messageResponse["400"], true, res)
    }

    // Manejar imágenes
    const files = req.files as Express.Multer.File[]
    let fileIndex = 0

    for (let i = 0; i < 3; i++) {
      const imageField = `imagen_${i + 1}` as "imagen_1" | "imagen_2" | "imagen_3"
      const imagenInfo = imagenesInfo[i]

      if (imagenInfo === "DELETED") {
        // Imagen eliminada
        observacion[imageField] = null
      } else if (imagenInfo === "NEW" && files[fileIndex]) {
        // Nueva imagen subida
        const file = files[fileIndex]
        const nuevaUrlImagen = await subirImagen("observaciones", file.originalname, file.buffer, file.mimetype)
        observacion[imageField] = nuevaUrlImagen
        fileIndex++
      } else if (typeof imagenInfo === "string" && imagenInfo !== "DELETED" && imagenInfo !== "NEW") {
        // Imagen no cambiada
        observacion[imageField] = imagenInfo
      }
    }
    console.log('Data enviada al backend: ', observacion);
    // Llamar al procedimiento almacenado para actualizar la observación
    await dbPool.query(`CALL sp_editar_observacion($1::JSONB)`, [JSON.stringify(observacion)])

    // Consultar la base de datos para obtener la observación actualizada
    const result = await dbPool.query(`SELECT * FROM tbv_observaciones WHERE id_observacion = $1`, [
      observacion.id_observacion,
    ])

    if (result.rowCount === 0) {
      return responseService(404, null, messageResponse["404"], true, res)
    }

    const observacionActualizada = result.rows[0]

    // Emitir actualización a los clientes conectados
    const io = req.app.get("socketio")
    io.emit("actualizarObservacion", observacionActualizada)

    return responseService(200, observacionActualizada, messageResponse["200"], false, res)
  } catch (error) {
    console.error("Error al actualizar la observación:", error)
    return responseService(500, null, messageResponse["500"], true, res)
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


export async function buscarObservacion(req: Request, res: Response) {
  try {
    const { especie }: { especie?: string } = req.body; 

    console.log(req.body);

    if (!especie) {
      return responseService(400, null, messageResponse["400"], true, res);
    }

    const searchTerm = `%${especie}%`;

    const query = `
      SELECT *
      FROM vw_buscar_observaciones
      WHERE nombre_comun ILIKE $1
         OR nombre_cientifico ILIKE $1
    `;

    const result = await dbPool.query(query, [searchTerm]);

    if (result.rowCount === 0) {
      return responseService(404, null, messageResponse["404"], true, res);
    }

    const observaciones = result.rows;
    const data = {
      observaciones,
    };

    console.log(data);
    return responseService(200, data, messageResponse["200"], false, res);
  } catch (error) {
    console.error("Error en buscarObservacion:", error);
    return responseService(500, null, messageResponse["500"], true, res);
  }
}