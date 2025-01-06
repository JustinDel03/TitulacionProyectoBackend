import { Router } from 'express';
import { ListaAlertas, CrearAlerta  } from '../controllers/alertas/alerta.controller';
import { upload } from '../middlewares/uploadMiddleware';
import { validaTokenJwt } from '../middlewares/jwt';
const router: Router = Router();

//-------------------------------------- GET -------------------------------------//
router.get('/ListaAlertas', validaTokenJwt, ListaAlertas);

//-------------------------------------- POST -------------------------------------//
router.post('/CrearAlerta', upload.array('imagenes', 3), CrearAlerta);

export default router;
