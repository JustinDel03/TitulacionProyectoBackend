import { Router } from 'express';
import { ListaUsuario, ListaObservacionesAlertasXUsuario, IniciarSesion, CrearUsuario, SubirImagenUsuario, ListaRoles, cambiarContrasena, EditarUsuario, EliminarUsuario, EditarUsuarioApp} from '../controllers/users/usuario.controller'
import { upload } from '../middlewares/uploadMiddleware';
import { validaTokenJwt } from '../middlewares/jwt';

const router: Router = Router();

//-------------------------------------- GET -------------------------------------//
router.get('/ListaUsuarios', validaTokenJwt, ListaUsuario);
router.get('/ListaRoles', validaTokenJwt, ListaRoles);
router.get('/ListaObservacionesAlertasXUsuario', validaTokenJwt, ListaObservacionesAlertasXUsuario)

//-------------------------------------- POST -------------------------------------//
router.post('/IniciarSesion', IniciarSesion);
router.post('/crear', CrearUsuario);
router.post('/subirImagen', validaTokenJwt, upload.single('imagen'), SubirImagenUsuario);

//-------------------------------------- PUT -------------------------------------//

router.put('/EditarUsuario', validaTokenJwt, EditarUsuario);
router.post('/EditUserData', validaTokenJwt, EditarUsuarioApp);

//-------------------------------------- DELETE -------------------------------------//

router.delete('/EliminarUsuario/:id_usuario', validaTokenJwt, EliminarUsuario);

router.post('/cambiarContrasena', validaTokenJwt, cambiarContrasena);
//router.post('/recuperContrasena', RecuperarSesion);
//router.post('/cambioContrasena', validarTokenJwt, cambioContraseña);


export default router;
