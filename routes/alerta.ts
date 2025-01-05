import { Router } from 'express';
import { ListaAlertas, CrearAlerta, tipos_alertas  } from '../controllers/alertas/alerta.controller';
import { upload } from '../middlewares/uploadMiddleware';
import { validaTokenJwt } from '../middlewares/jwt';
const router: Router = Router();

//-------------------------------------- GET -------------------------------------//
router.get('/ListaAlertas', validaTokenJwt, ListaAlertas);
router.get('/tipo_alertas', tipos_alertas )

//-------------------------------------- POST -------------------------------------//
router.post('/CrearAlerta', validaTokenJwt,upload.single('imagen'), CrearAlerta);

export default router;
