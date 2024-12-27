import { Router } from 'express';
import { ListaUsuario, IniciarSesion, CrearUsuario, SubirImagenUsuario, ListaRoles  } from '../controllers/users/usuario.controller'
import { upload } from '../middlewares/uploadMiddleware';
import { validaTokenJwt } from '../middlewares/jwt';

const router: Router = Router();

//-------------------------------------- GET -------------------------------------//
router.get('/ListaUsuarios', validaTokenJwt, ListaUsuario);
router.get('/ListaRoles', validaTokenJwt, ListaRoles);

//-------------------------------------- POST -------------------------------------//
router.post('/IniciarSesion', IniciarSesion);
router.post('/crear', validaTokenJwt, CrearUsuario);
router.post('/subirImagen', validaTokenJwt, upload.single('imagen'), SubirImagenUsuario);


export default router;
