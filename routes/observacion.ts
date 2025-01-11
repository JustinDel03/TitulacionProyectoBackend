import { Router } from 'express';
import { ListaObservaciones, CrearObservacion, EliminarObservacion, CambiarEstadoObservacion  } from '../controllers/observaciones/observacion.controller';
import { upload } from '../middlewares/uploadMiddleware';
import { validaTokenJwt } from '../middlewares/jwt';
const router: Router = Router();

//-------------------------------------- GET -------------------------------------//
router.get('/ListaObservaciones', validaTokenJwt, ListaObservaciones);

//-------------------------------------- POST -------------------------------------//
router.post('/CrearObservacion', upload.array('imagenes', 3), CrearObservacion);

//-------------------------------------- DELETE ----------------------------------//

router.delete('/EliminarObservacion/:id_observacion',validaTokenJwt, EliminarObservacion);

//-------------------------------------- PUT -------------------------------------//
router.put('/CambiarEstadoObservacion/:id_observacion/:estado', validaTokenJwt, CambiarEstadoObservacion);


export default router;
