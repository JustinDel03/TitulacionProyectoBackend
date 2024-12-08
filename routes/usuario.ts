import { Router } from 'express';
import { ListaUsuario, IniciarSesion, ListaUsuarioMenu, CrearUsuario, SubirImagenUsuario, ListaRoles  } from '../controllers/usuarioController';
import { validarSessionToken } from '../middlewares/sessionMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router: Router = Router();

//-------------------------------------- GET -------------------------------------//
router.get('/ListaUsuarios', validarSessionToken, ListaUsuario);
router.get('/ListaUsuarioMenu',validarSessionToken, ListaUsuarioMenu);
router.get('/ListaRoles',validarSessionToken, ListaRoles);

//-------------------------------------- POST -------------------------------------//
router.post('/IniciarSesion', IniciarSesion);
router.post('/crear',validarSessionToken, CrearUsuario);
router.post('/subirImagen', upload.single('imagen'), SubirImagenUsuario);


export default router;
