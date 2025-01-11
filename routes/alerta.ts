import { Router } from 'express';
import { ListaAlertas, CrearAlerta, EliminarAlerta, CambiarEstadoAlerta  } from '../controllers/alertas/alerta.controller';
import { upload } from '../middlewares/uploadMiddleware';
import { validaTokenJwt } from '../middlewares/jwt';
const router: Router = Router();

//-------------------------------------- GET -------------------------------------//
router.get('/ListaAlertas', validaTokenJwt, ListaAlertas);

//-------------------------------------- POST -------------------------------------//
router.post('/CrearAlerta', upload.array('imagenes', 3), CrearAlerta);


//-------------------------------------- DELETE ----------------------------------//

router.delete('/EliminarAlerta/:id_alerta',validaTokenJwt, EliminarAlerta);


//-------------------------------------- PUT -------------------------------------//
router.put('/CambiarEstadoAlerta/:id_alerta/:id_estado', validaTokenJwt, CambiarEstadoAlerta);




export default router;
