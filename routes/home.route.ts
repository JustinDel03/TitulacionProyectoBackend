import { Router } from "express";
import { validaTokenJwt } from "../middlewares/jwt";
import { Home } from "../controllers/application/application.controller";


const router: Router = Router();


router.get('/home', validaTokenJwt, Home );


export default router;