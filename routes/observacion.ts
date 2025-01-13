import { Router } from 'express';
import { ListaObservaciones, CrearObservacion, EliminarObservacion, CambiarEstadoObservacion, ListarEspecies  } from '../controllers/observaciones/observacion.controller';
import { upload } from '../middlewares/uploadMiddleware';
import { validaTokenJwt } from '../middlewares/jwt';
const router: Router = Router();

//-------------------------------------- GET -------------------------------------//
router.get('/ListaObservaciones', ListaObservaciones);
router.get('/ListarEspecies', ListarEspecies);

//-------------------------------------- POST -------------------------------------//
router.post('/CrearObservacion', validaTokenJwt,upload.array('imagenes', 3), CrearObservacion);

//-------------------------------------- DELETE ----------------------------------//

router.delete('/EliminarObservacion/:id_observacion',validaTokenJwt, EliminarObservacion);

//-------------------------------------- PUT -------------------------------------//
router.put('/CambiarEstadoObservacion/:id_observacion/:estado', validaTokenJwt, CambiarEstadoObservacion);


export default router;
