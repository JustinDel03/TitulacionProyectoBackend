import { NextFunction, Request, Response } from "express";
import { responseService, validateJwt } from "../helpers/methods.helpers";
import { messageResponse } from "../helpers/message.helpers";



export const validaTokenJwt = async(req: Request, res: Response, next: NextFunction)=>{
    const token = req.headers['authorization'];
    if(token){
        const tokenValidate = validateJwt(token);
        if(tokenValidate){
            req.headers['datos'] = JSON.stringify(tokenValidate) as string;
            next();
        }else{
            return responseService(401, null, messageResponse["tokenExpire"], true, res);
        }
    }else{
        return responseService(401, null, messageResponse["401"], true,res);
    }
}

