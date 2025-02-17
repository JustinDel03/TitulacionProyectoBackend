import { Router } from 'express';
import { ListaCategoriasEspecie, searchSpecies, ListarEspecies, CrearEspecie, EliminarEspecie, EditarEspecie } from '../controllers/especies/especie.controller';
import { upload } from '../middlewares/uploadMiddleware';
import { validaTokenJwt } from '../middlewares/jwt';
const router: Router = Router();

//-------------------------------------- GET -------------------------------------//
router.get('/ListarEspecies', validaTokenJwt, ListarEspecies);
router.get('/ListaCategoriasEspecie', validaTokenJwt, ListaCategoriasEspecie)

//-------------------------------------- POST ------------------------------------//
router.post('/CrearEspecie', validaTokenJwt, upload.single('imagen'), CrearEspecie);
router.post('/searchEspecies', validaTokenJwt, searchSpecies)
//-------------------------------------- DELETE ----------------------------------//

router.delete('/EliminarEspecie/:id_especie', validaTokenJwt, EliminarEspecie);

//-------------------------------------- PUT -------------------------------------//
router.put('/EditarEspecie', validaTokenJwt, upload.single('imagen'), EditarEspecie);


export default router;
