import { Router } from 'express';
import { ListaObservaciones, ListaObservacionesCompleta, ListaSenderos, buscarObservacion, CrearObservacion, EliminarObservacion, EditarObservacion  } from '../controllers/observaciones/observacion.controller';
import { upload } from '../middlewares/uploadMiddleware';
import { validaTokenJwt } from '../middlewares/jwt';
const router: Router = Router();

//-------------------------------------- GET -------------------------------------//

router.get('/ListaObservacionesCompleta', validaTokenJwt, ListaObservacionesCompleta);
router.get('/ListaObservaciones', validaTokenJwt, ListaObservaciones);
router.get('/ListaSenderos', validaTokenJwt, ListaSenderos);

//-------------------------------------- POST -------------------------------------//
router.post('/CrearObservacion', validaTokenJwt, upload.array('imagenes', 3), CrearObservacion);
router.post('/buscarObservacion', buscarObservacion);
//-------------------------------------- DELETE ----------------------------------//

router.delete('/EliminarObservacion/:id_observacion',validaTokenJwt, EliminarObservacion);

//-------------------------------------- PUT -------------------------------------//
router.put('/EditarObservacion', validaTokenJwt, upload.array('imagenes', 3), EditarObservacion);


export default router;
