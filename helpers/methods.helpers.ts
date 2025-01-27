import { Response } from "express";
import { DatosJwt } from "../models/jwt.interface";
import jwt, { JwtPayload } from "jsonwebtoken";
import '../globalconfig'


export const responseService = (codigo: number, datos: any, mensaje: string = "", error: boolean,resp: Response) => {
    resp.statusCode = codigo;
    return resp.json({
        "data": datos ? datos : null,
        "mensaje": mensaje,
        "error": error
    });
}

export const createJwt = (datos: DatosJwt) => {
    console.log(process.env.DURATION)
    return jwt.sign({ ...datos }, process.env.KEY_JWT!, {
        expiresIn: process.env.DURATION, // Usa un valor predeterminado si HORAS_JWT no está definido
    });
};

export const validateJwt = (token: string) => {
    try {
    
        const valida = jwt.verify(token, process.env.KEY_JWT!) as JwtPayload;
        return valida as DatosJwt;
    } catch (error) {
        console.error("Error al validar el token:", error);
        return null;
    }
};


