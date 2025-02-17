import { Request, Response } from 'express';
import { dbPool } from '../../db';
import { subirImagen } from '../../helpers/firebase.helpers';
import { responseService } from '../../helpers/methods.helpers';
import { DatosJwt } from '../../models/jwt.interface';


export async function ListaObservacionesCompleta(req: Request, res: Response) {
  try {

    // Consulta las alertas desde la base de datos
    const result = await dbPool.query('SELECT * FROM tbv_observaciones');
    const observaciones = result.rows;


    return responseService(200, observaciones, "Lista de las observaciones obtenida", false, res);
  } catch (err) {
    console.error('Error:', err);
    responseService(500, null, "Error al obtener las observaciones", false, res)
  }
}


export async function HistorialObservacionesModificadas(req: Request, res: Response) {
  try {

    // Consulta las alertas desde la base de datos
    const result = await dbPool.query('SELECT * FROM tbv_historial_observaciones_modificadas');
    const observaciones = result.rows;


    return responseService(200, observaciones, "Lista del historial de observaciones modificadas obtenida", false, res);
  } catch (err) {
    console.error('Error:', err);
    responseService(500, null, "Error al obtener el historial de observaciones modificadas", false, res)
  }
}




export async function ListaSenderos(req: Request, res: Response) {
  try {

    // Consulta las alertas desde la base de datos
    const result = await dbPool.query('SELECT * FROM tbv_sendero');
    const senderos = result.rows;


    return responseService(200, senderos, "Lista senderos obtenida", false, res);
  } catch (err) {
    console.error('Error:', err);
    responseService(500, null, "Error al obtener la lista de senderos", false, res)
  }
}

export async function ListaEstadosObservacion(req: Request, res: Response) {
  try {

    // Consulta las alertas desde la base de datos
    const result = await dbPool.query('SELECT * FROM estados_observacion');
    const senderos = result.rows;


    return responseService(200, senderos, "Lista estados obtenida", false, res);
  } catch (err) {
    console.error('Error:', err);
    responseService(500, null, "Error al obtener la lista de estados", false, res)
  }
}


export async function ListaObservaciones(req: Request, res: Response) {
  try {

    const { estado, id_usuario } = req.query;

    const id_estado = estado !== undefined ? estado: null;

    // Consulta las alertas desde la base de datos
    const result = await dbPool.query('SELECT * FROM buscar_observaciones_estado($1,$2)', [id_estado, id_usuario || null]);
    const observaciones = result.rows;
    const data = {
      observaciones: observaciones
    }
    return responseService(200, data, "Lista de observaciones obtenida", false, res);

  } catch (err) {
    console.error('Error:', err);
    responseService(500, null, "Error al obtener la lista de observaciones", false, res)
  }
}

export async function CrearObservacion(req: Request, res: Response) {

  const observacion = JSON.parse(req.body.observacion);
  const datos = JSON.parse((req.headers.datos) as string) as DatosJwt;

  observacion.id_usuario = datos.id_usuario;

  if (!observacion || !observacion.coordenada_longitud || !observacion.coordenada_latitud) {
    return responseService(400, null, "Error, datos faltantes para crear la observacion", true, res);
  }

  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return responseService(400, null, "Error, no se ha enviado ninguna imagen", true, res);
  }

  try {
    const imageUrls: string[] = await Promise.all(
      req.files.map((file: Express.Multer.File) =>
        subirImagen('observaciones', file.originalname, file.buffer, file.mimetype)
      )
    );

    observacion.imagen_1 = imageUrls[0] || null;
    observacion.imagen_2 = imageUrls[1] || null;
    observacion.imagen_3 = imageUrls[2] || null;

    const insertResult = await dbPool.query('CALL sp_crear_observacion($1::JSON, $2)', [observacion, null]);
    const id_observacion = insertResult.rows[0].new_id;

    const result = await dbPool.query(
      'SELECT * FROM tbv_observaciones WHERE id_observacion = $1',
      [id_observacion]
    );

    if (result.rowCount === 0) {
      return responseService(500, null, "Error al crear la observacion", true, res);
    }

    const observacionActualizada = result.rows[0];

    // 📢 Emitimos la nueva alerta a todos los clientes conectados
    const io = req.app.get("socketio");
    io.emit("actualizarObservacion", observacionActualizada);

    return responseService(200, null, "Observacion creada correctamente, un administrador validara la informacion", false, res);


  } catch (err) {
    console.error('Error al crear la observacion:', err);
    responseService(500, null, "Error al crear la observacion", true, res);
  }
}

export async function EditarObservacion(req: Request, res: Response) {
  try {
    const observacion = JSON.parse(req.body.observacion)
    const imagenesInfo = JSON.parse(req.body.imagenes)
    console.log(observacion);
    if (!observacion.id_observacion) {
      return responseService(400, null, "Error, no se envio el ID de la observacion a editar", true, res)
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
    await dbPool.query(`CALL sp_editar_observacion($1::JSONB)`, [JSON.stringify(observacion)])

    const result = await dbPool.query(`SELECT * FROM tbv_observaciones WHERE id_observacion = $1`, [
      observacion.id_observacion,
    ])

    if (result.rowCount === 0) {
      return responseService(404, null, "Observacion editada no encontrada", true, res)
    }

    const observacionActualizada = result.rows[0]

    const io = req.app.get("socketio")
    io.emit("actualizarObservacion", observacionActualizada)

    return responseService(200, observacionActualizada, "Observacion editada correctamente", false, res)
  } catch (error) {
    console.error("Error al actualizar la observación:", error)
    return responseService(500, null, "Error al editar la observacion", true, res)
  }
}

export async function ActualizarEstadoObservacion(req: Request, res: Response) {
  try {
    const { id_observacion, id_estado, } = req.body;
    if (!id_observacion || !id_estado) {
      return responseService(400, null, "Error, no se enviaron los parametros necesarios", true, res);
    }

    const result = await dbPool.query(
      'UPDATE observaciones SET id_estado = $1 WHERE id_observacion = $2 RETURNING *',
      [id_estado, id_observacion]
    );

    if (result.rowCount === 0) {
      return responseService(404, null, "Error al editar la observacion", true, res);
    }

    const observacionActualizada = result.rows[0];

    // 📢 Emitimos la actualización de estado a los clientes conectados
    const io = req.app.get("socketio");
    io.emit("actualizarObservacion", observacionActualizada);

    return responseService(200, observacionActualizada, "El estado de la observacion cambio", false, res);

  } catch (error) {
    console.error("Error al cambiar el estado de la observacion:", error);
    responseService(500, null, "Error al cambiar el estado de la observacion", true, res);
  }
}

/*
export async function EliminarObservacion(req: Request, res: Response) {
  try {
    const { id_observacion } = req.params;
    if (!id_observacion) {
      return responseService(400, null, "Error, no se envio el ID de la observacion a editar", true, res);
    }

    await dbPool.query(
      'DELETE FROM observaciones WHERE id_observacion = $1 RETURNING *',
      [id_observacion]
    );

    // 📢 Emitimos evento de eliminación a todos los clientes conectados
    const io = req.app.get("socketio");
    io.emit("actualizarObservacion", { id_observacion, eliminada: true });

    return responseService(200, null, "Observacion eliminada correctamente", false, res);

  } catch (error) {
    console.error("Error al eliminar la alerta:", error);
    responseService(500, null, "Error al eliminar la observacion", true, res);
  }
}
*/

export async function buscarObservacion(req: Request, res: Response) {
  try {
    const { especie } = req.body;
    if (!especie) {
      return responseService(400, null, "Error, no se enviaron los parametros", true, res);
    }
    const searchTerm = `%${especie}%`// Término de búsqueda, asegúrate de agregar los comodines '%' para LIKE.
    const query = `SELECT * FROM vw_buscar_observaciones WHERE nombre_comun ILIKE $1 OR nombre_cientifico ILIKE $1`;


    const result = await dbPool.query(query, [searchTerm]);
    if (result.rowCount === 0) {
      return responseService(404, null, 'No se encontraron observaciones', true, res);
    }


    const observaciones = result.rows;
    const data = {
      observaciones: observaciones
    }
    console.log(data);
    return responseService(200, data, "Observacion encontrada", false, res);
  } catch (error) {
    console.log(error);
    return responseService(500, null, "Erro al buscar la observacion", true, res);
  }
}