import { Request, Response } from 'express';
import { dbPool } from '../../db';

import { subirImagen  } from '../../helpers/firebase.helpers';
import { responseService } from '../../helpers/methods.helpers';
import { messageResponse } from '../../helpers/message.helpers';
import { DatosJwt } from '../../models/jwt.interface';



export async function ListaObservaciones(req: Request, res: Response){
    try {
        const result = await dbPool.query('SELECT * FROM tbv_observaciones');
        const data = {
            observaciones: result.rows
        }

        return responseService(200, data, messageResponse["200"], false, res);
    } catch (error) {        
    console.error('Error:', error);
    responseService(500,null, messageResponse["500"], false, res)
    }
}