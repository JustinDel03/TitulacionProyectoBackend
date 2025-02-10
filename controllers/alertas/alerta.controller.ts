import { Request, Response } from 'express';
import { dbPool } from '../../db';
import { subirImagen } from '../../helpers/firebase.helpers';
import { responseService } from '../../helpers/methods.helpers';
import { DatosJwt } from '../../models/jwt.interface';


export async function ListaAlertasCompleta(req: Request, res: Response) {

  try {

    // Consulta las alertas desde la base de datos
    const result = await dbPool.query('SELECT * FROM tbv_alertas');
    const alertas = result.rows;


    return responseService(200, alertas, "Lista de alertas obtenida correctamente", false, res);
  } catch (err) {
    console.error('Error:', err);
    responseService(500, null, "Erro al obtener la lista de las alertas", false, res)
  }
}

export async function ListaEstadosAlerta(req: Request, res: Response) {

  try {

    // Consulta las alertas desde la base de datos
    const result = await dbPool.query('SELECT * FROM estados_alerta');
    const alertas = result.rows;


    return responseService(200, alertas, "Lista de estados alerta obtenida correctamente", false, res);
  } catch (err) {
    console.error('Error:', err);
    responseService(500, null, "Erro al obtener la lista de los estados de la alerta", false, res)
  }
}



export async function ListaAlertas(req: Request, res: Response) {

  try {
    const { id_usuario, id_estado } = req.query;

    // Consulta las alertas desde la base de datos
    const result = await dbPool.query('SELECT * FROM buscar_alertas($1, $2)',
      [id_usuario || null, id_estado || null]);
    const data = {

      alertas: result.rows

    }

    return responseService(200, data, "Alertas Obtenidas", false, res);

  } catch (err) {
    console.error('Error:', err);
    responseService(500, null, "Error al obtener las alertas", false, res)
  }
}

export async function CrearAlerta(req: Request, res: Response) {

  const alerta = JSON.parse(req.body.alerta);
  const datos = JSON.parse((req.headers.datos) as string) as DatosJwt;
  alerta.id_usuario = datos.id_usuario;

  if (!alerta || !alerta.id_usuario || !alerta.id_tipo_alerta) {
    return responseService(400, null, "Faltan datos para crear la alerta", true, res);
  }

 
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return responseService(400, null, "Error, no se envio ninguna imagen", true, res);

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
      return responseService(500, null, "Error al crear la alerta", true, res);
    }

    const alertaCompleta = result.rows[0];


    // 📢 Emitimos la nueva alerta a todos los clientes conectados
    const io = req.app.get("socketio");
    io.emit("actualizarAlerta", alertaCompleta);

    return responseService(200, null, 'Alerta creada correctamente, un administrador validara la informacion', false, res);


  } catch (err) {
    console.error('Error al crear la alerta:', err);
    responseService(500, null, "Error al crear la alerta", true, res);
  }
}


export async function CambiarEstadoAlerta(req: Request, res: Response) {
  try {
    const { id_alerta, id_estado, } = req.body;
    if (!id_alerta || !id_estado) {
      return responseService(400, null, "Error, no se enviaron los parametros necesarios", true, res);
    }

    const result = await dbPool.query(
      'UPDATE alertas SET id_estado = $1 WHERE id_alerta = $2 RETURNING *',
      [id_estado, id_alerta]
    );

    if (result.rowCount === 0) {
      return responseService(404, null, "Error al editar la alerta", true, res);
    }

    const alertaActualizada = result.rows[0];

    // 📢 Emitimos la actualización de estado a los clientes conectados
    const io = req.app.get("socketio");
    io.emit("actualizarAlerta", alertaActualizada);

    return responseService(200, alertaActualizada, "El estado de la alerta cambio", false, res);

  } catch (error) {
    console.error("Error al cambiar el estado de la alerta:", error);
    responseService(500, null, "Error al cambiar el estado de la alerta", true, res);
  }
}
/*
export async function EliminarAlerta(req: Request, res: Response) {
  try {
    const { id_alerta } = req.params;
    if (!id_alerta) {
      return responseService(400, null, "Error no se envio el ID de la alerta a eliminar", true, res);
    }

    const result = await dbPool.query(
      'DELETE FROM alertas WHERE id_alerta = $1 RETURNING *',
      [id_alerta]
    );

    // 📢 Emitimos evento de eliminación a todos los clientes conectados
    const io = req.app.get("socketio");
    io.emit("actualizarAlerta", { id_alerta, eliminada: true });

    return responseService(200, null, "La alerta fue eliminada correctamente", false, res);

  } catch (error) {
    console.error("Error al eliminar la alerta:", error);
    responseService(500, null, "Error al eliminar la alerta", true, res);
  }
}
*/

export async function TipoAlertas(req: Request, res: Response) {
  try {
    const result = await dbPool.query('SELECT * FROM tbv_tipo_alertas');
    const sendero = await dbPool.query('SELECT * FROM tbv_sendero');
    // const tipo_alertas = result.rows;
    const data = {
      tipos_alertas: result.rows,
      senderos: sendero.rows
    }
    return responseService(200, data, "Lista de los tipos de alerta obtenida", false, res);

  } catch (err) {
    console.error('Error:', err);
    responseService(500, null, "Error al obtener la lista de tipos de alertas", false, res)

  }
}