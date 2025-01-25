import { Router } from 'express';
import { ListaSenderos, CrearSendero, EliminarSendero, EditarSendero  } from '../controllers/senderos/sendero.controller';
import { upload } from '../middlewares/uploadMiddleware';
import { validaTokenJwt } from '../middlewares/jwt';
const router: Router = Router();

//-------------------------------------- GET -------------------------------------//

router.get('/ListaSenderos', validaTokenJwt, ListaSenderos);

//-------------------------------------- POST -------------------------------------//
router.post('/CrearSendero', validaTokenJwt, CrearSendero);
//-------------------------------------- DELETE ----------------------------------//

router.delete('/EliminarSendero/:id_sendero', validaTokenJwt, EliminarSendero);

//-------------------------------------- PUT -------------------------------------//
router.put('/EditarSendero', validaTokenJwt, EditarSendero);


export default router;
