import { Request, Response } from 'express';
import { dbPool } from '../../db';
import { subirImagen } from '../../helpers/firebase.helpers';
import { responseService } from '../../helpers/methods.helpers';
import { messageResponse } from '../../helpers/message.helpers';
import { DatosJwt } from '../../models/jwt.interface';

export async function ListaCategoriasEspecie(req: Request, res: Response) {
    try {

        // Consulta las alertas desde la base de datos
        const result = await dbPool.query('SELECT * FROM categorias_especies');
        const categorias_especie = result.rows;

        return responseService(200, categorias_especie, messageResponse["200"], false, res);
    } catch (err) {
        console.error('Error:', err);
        responseService(500, null, messageResponse["500"], false, res)
    }
}


export async function ListarEspecies(req: Request, res: Response) {
    try {
        const result = await dbPool.query("SELECT * FROM  tbv_especies");
        if (result.rowCount === 0) {
            return responseService(404, null, messageResponse["404"], true, res);
        }

        const especies = result.rows;
        
        return responseService(200, especies, messageResponse["200"], false, res);
    } catch (error) {
        return responseService(500, null, messageResponse["500"], true, res);
    }
}


export async function CrearEspecie(req: Request, res: Response) {

    const especie = JSON.parse(req.body.especie);

    // Validar que los campos requeridos estén presentes
    if (!especie || !especie.nombre_comun || !especie.nombre_cientifico || !especie.id_categoria_especie) {
        return responseService(400, null, messageResponse["400"], true, res);
    }

    // Validar que se haya enviado un archivo
    if (!req.file) {
        return responseService(400, null, messageResponse["400"], true, res);
    }

    try {

        if (!req.file) {
            return responseService(400, null, messageResponse["400"], true, res);
        }


        const file = req.file;
        const imageUrl: string = await subirImagen(
            'especies',
            file.originalname,
            file.buffer,
            file.mimetype
        );

        


        // Agregar las URLs de las imágenes directamente al objeto alerta
        especie.imagen = imageUrl || null;
        // Llamar al procedimiento almacenado para guardar la alerta
        const insertResult = await dbPool.query('CALL sp_crear_especie($1::JSON, $2)', [especie, null]);
        const id_especie = insertResult.rows[0].new_id;

        const result = await dbPool.query(
            'SELECT * FROM especies WHERE id_especie = $1',
            [id_especie]
        );

        if (result.rowCount === 0) {
            return responseService(500, null, messageResponse["500"], true, res);
        }

        const especieActualizada = result.rows[0];


        // 📢 Emitimos la nueva alerta a todos los clientes conectados
        const io = req.app.get("socketio");
        io.emit("actualizarEspecie", especieActualizada);

        return responseService(201, null, messageResponse["201"], false, res);


    } catch (err) {
        console.error('Error al crear la observacion:', err);
        responseService(500, null, messageResponse["500"], true, res);
    }
}


export async function EditarEspecie(req: Request, res: Response) {
    try {
        const especie = JSON.parse(req.body.especie);
        console.log('Data del Frontend', especie);

        if (!especie.id_especie) {
            return responseService(400, null, messageResponse["400"], true, res);
        }

        let nuevaUrlImagen = null;

        // Verificar si el usuario subió una nueva imagen
        if (req.file) {
            const file = req.file;

            // Subir la nueva imagen a Firebase
            nuevaUrlImagen = await subirImagen(
                'especies',
                file.originalname,
                file.buffer,
                file.mimetype
            );
        }

        // Actualizar el objeto especie con la nueva URL de imagen si fue cambiada
        if (nuevaUrlImagen) {
            especie.imagen = nuevaUrlImagen;
        }

        // Llamar al procedimiento almacenado con el JSON completo
        await dbPool.query(
            "CALL sp_editar_especie($1::JSONB)",
            [JSON.stringify(especie)] // Enviar el JSON directamente al procedimiento
        );

        // Consultar la vista para obtener los datos actualizados
        const result = await dbPool.query(
            "SELECT * FROM tbv_especies WHERE id_especie = $1",
            [especie.id_especie]
        );

        if (result.rowCount === 0) {
            return responseService(404, null, messageResponse["404"], true, res);
        }

        const especieActualizada = result.rows[0];

        // Emitir la actualización al frontend mediante socket
        const io = req.app.get("socketio");
        io.emit("actualizarEspecie", especieActualizada);

        return responseService(200, especieActualizada, messageResponse["200"], false, res);
    } catch (error) {
        console.error("Error al actualizar la especie:", error);
        return responseService(500, null, messageResponse["500"], true, res);
    }
}



export async function EliminarEspecie(req: Request, res: Response) {
    try {
        const { id_especie } = req.params;
        if (!id_especie) {
            return responseService(400, null, messageResponse["400"], true, res);
        }

        const result = await dbPool.query(
            'DELETE FROM especies WHERE id_especie = $1 RETURNING *',
            [id_especie]
        );

        if (result.rowCount === 0) {
            return responseService(404, null, messageResponse["404"], true, res);
        }

        // 📢 Emitimos evento de eliminación a todos los clientes conectados
        const io = req.app.get("socketio");
        io.emit("actualizarEspecie", { id_especie, eliminada: true });

        return responseService(200, null, messageResponse["200"], false, res);

    } catch (error) {
        console.error("Error al eliminar la alerta:", error);
        responseService(500, null, messageResponse["500"], true, res);
    }
}


export async function searchSpecies(req: Request, res: Response) {

    try {
        const { especie } = req.body;
        const response = await dbPool.query('CALL sp_buscar_especies($1, $2)', [especie, null]);

        console.log(response.rows[0])
        const especies = response.rows[0];


        return responseService(200, especies, messageResponse["200"], false, res);

    } catch (error) {
        console.log(`Error: ${ error }`)
        return responseService(400, null, messageResponse["400"], true, res);
    }

}