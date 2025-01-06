import { Router } from 'express';
import { ListaUsuario, IniciarSesion, CrearUsuario, SubirImagenUsuario, ListaRoles, EditarUsuario, EliminarUsuario} from '../controllers/users/usuario.controller'
import { upload } from '../middlewares/uploadMiddleware';
import { validaTokenJwt } from '../middlewares/jwt';

const router: Router = Router();

//-------------------------------------- GET -------------------------------------//
router.get('/ListaUsuarios', validaTokenJwt, ListaUsuario);
router.get('/ListaRoles', validaTokenJwt, ListaRoles);

//-------------------------------------- POST -------------------------------------//
router.post('/IniciarSesion', IniciarSesion);
router.post('/CrearUsuario', validaTokenJwt, CrearUsuario);
router.post('/subirImagen', validaTokenJwt, upload.single('imagen'), SubirImagenUsuario);

//-------------------------------------- PUT -------------------------------------//

router.put('/EditarUsuario', validaTokenJwt, EditarUsuario);


//-------------------------------------- DELETE -------------------------------------//

router.delete('/EliminarUsuario/:id_usuario', validaTokenJwt, EliminarUsuario);



export default router;
