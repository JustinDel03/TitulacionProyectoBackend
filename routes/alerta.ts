import { Router } from 'express';

import { upload } from '../middlewares/uploadMiddleware';
import { CrearAlerta, ListaAlertas } from '../controllers/alert/alerts.controller';
import { validaTokenJwt } from '../middlewares/jwt';

const router: Router = Router();

//-------------------------------------- GET -------------------------------------//
router.get('/ListaAlertas', validaTokenJwt,ListaAlertas);

//-------------------------------------- POST -------------------------------------//
router.post('/CrearAlerta', validaTokenJwt,upload.single('imagen'), CrearAlerta);

export default router;
