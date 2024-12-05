import { Router } from 'express';
import { ListaUsuario, IniciarSesion, ListaUsuarioMenu, CrearUsuario } from '../controllers/usuarioController';
import { validarSessionToken } from '../middlewares/sessionMiddleware';

const router: Router = Router();

//-------------------------------------- GET -------------------------------------//
router.get('/ListaUsuarios', validarSessionToken, ListaUsuario);
router.get('/ListaUsuarioMenu',validarSessionToken, ListaUsuarioMenu);

//-------------------------------------- POST -------------------------------------//
router.post('/IniciarSesion', IniciarSesion);
router.post('/crear',validarSessionToken, CrearUsuario);

export default router;
