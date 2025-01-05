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
router.post('/crear', CrearUsuario);
router.post('/subirImagen', validaTokenJwt, upload.single('imagen'), SubirImagenUsuario);
//router.post('/recuperContrasena', RecuperarSesion);
//router.post('/cambioContrasena', validarTokenJwt, cambioContraseña);


export default router;
