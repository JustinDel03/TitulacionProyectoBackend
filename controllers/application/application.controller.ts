import { Request, Response } from "express";
import { dbPool } from "../../db";
import { responseService } from "../../helpers/methods.helpers";
import { messageResponse } from "../../helpers/message.helpers";
import { DatosJwt } from "../../models/jwt.interface";


export async function Home(req: Request, res: Response) {

    
    try{
        const [
            resultObservation,
            countObservations,
            countAlerts,
            countUsers
        ] = await Promise.all([
            dbPool.query('select * from tbv_last_observations LIMIT 5;'),
            dbPool.query('SELECT COUNT(id_observacion) AS total FROM observaciones'),
            dbPool.query('SELECT COUNT(id_alerta) AS total FROM alertas'),
            dbPool.query('SELECT COUNT(id_usuario) AS total FROM usuarios WHERE id_rol = 2')
        ]);
        const datos = {
            observations : resultObservation.rows,
            totalObservation: countObservations.rows[0].total, // Número total
            totalAlerts: countAlerts.rows[0].total, // Número total
            totalUsers: countUsers.rows[0].total 
        };

        return responseService(200, datos, messageResponse[200], false, res);
    }catch (e){
        console.log(e);
        return responseService(500, null, messageResponse[500], true, res);
    }
}