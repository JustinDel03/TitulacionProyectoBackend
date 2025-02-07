import { Request, Response } from 'express';
import { dbPool } from '../../db';
import { responseService } from '../../helpers/methods.helpers';
import { messageResponse } from '../../helpers/message.helpers';


export async function ListaSenderos(req: Request, res: Response) {
  try {

    const result = await dbPool.query('SELECT * FROM senderos');
    const senderos = result.rows;
    
    return responseService(200, senderos, "Lista de senderos obtenida", false, res);
  } catch (err) {
    console.error('Error:', err);
    responseService(500, null, "Error al obtener la lista de senderos", false, res)
  }
}


export async function CrearSendero(req: Request, res: Response) {
  try {
    const sendero = req.body;


    const insertResult = await dbPool.query('CALL sp_crear_sendero($1::JSONB, $2)', [sendero, null]);
    const id_sendero = insertResult.rows[0].new_id;

    const result = await dbPool.query(
      'SELECT * FROM senderos WHERE id_sendero = $1',
      [id_sendero]
    );

    if (result.rowCount === 0) {
      return responseService(500, null, "Error, no se encontro el sendero creado", true, res);
    }

    const senderoActualizado = result.rows[0];


    const io = req.app.get("socketio");
    io.emit("actualizarSendero", senderoActualizado);

    return responseService(200, null, "El sendero fue creado correctamente", false, res);


  } catch (err) {
    console.error('Error al crear la observacion:', err);
    responseService(500, null, "Error al crear el sendero", true, res);
  }
}

export async function EditarSendero(req: Request, res: Response) {

  try {
    // Verifica que el cuerpo de la solicitud sea válido
    if (!req.body) {
      return responseService(400, null, "El cuerpo de la solicitud está vacío.", true, res);
    }

    const sendero = req.body;

    // Validar que se proporcione el ID del sendero
    if (!sendero.id_sendero) {
      return responseService(400, null, "Error no se proporciono el ID del sendero", true, res);
    }

    // Invoca el procedimiento almacenado para editar el sendero
    await dbPool.query(`CALL sp_editar_sendero($1::JSONB)`, [JSON.stringify(sendero)]);

    // Consulta el sendero actualizado
    const result = await dbPool.query(`SELECT * FROM senderos WHERE id_sendero = $1`, [
      sendero.id_sendero,
    ]);

    // Verifica si el registro fue encontrado
    if (result.rowCount === 0) {
      return responseService(404, null, "Error al encontrar el sendero editado", true, res);
    }

    const senderoActualizado = result.rows[0];

    // Emitir actualización a los clientes conectados
    const io = req.app.get("socketio");
    io.emit("actualizarSendero", senderoActualizado);

    // Retornar el sendero actualizado al cliente
    return responseService(200, senderoActualizado, "Sendero editado correctamente", false, res);
  } catch (error) {
    console.error("Error al actualizar el sendero:", error);

    // Manejo de errores específicos para depuración
    const errorMessage = error instanceof Error ? error.message : "Error desconocido.";
    return responseService(500, null, "Error al editar el sendero", true, res);
  }
}


export async function EliminarSendero(req: Request, res: Response) {
  try {
    const { id_sendero } = req.params;
    if (!id_sendero) {
      return responseService(400, null, messageResponse["400"], true, res);
    }

    const result = await dbPool.query(
      'DELETE FROM senderos WHERE id_sendero = $1 RETURNING *',
      [id_sendero]
    );

    // 📢 Emitimos evento de eliminación a todos los clientes conectados
    const io = req.app.get("socketio");
    io.emit("actualizarSendero", { id_sendero, eliminada: true });

    return responseService(200, null, "Sendero eliminado correctamente", false, res);

  } catch (error) {
    console.error("Error al eliminar la alerta:", error);
    responseService(500, null, "Error al eliminar el sendero", true, res);
  }
}
