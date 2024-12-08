import { NextFunction, Request, Response } from "express";
import { responseService, validateJwt } from "../helpers/methods.helpers";
import { messageRespone } from "../helpers/message.helpers";



export const validaTokenJwt = async(req: Request, res: Response, next: NextFunction)=>{
    const token = req.headers['authorization'];

    if(token){
        const tokenValidate = validateJwt(token);
        if(tokenValidate){
            req.headers['datos'] = JSON.stringify(tokenValidate) as string;
            next();
        }else{
            return responseService(401, null, messageRespone["tokenExpire"], true, res);
        }
    }else{
        return responseService(401, null, messageRespone["401"], true,res);
    }
}