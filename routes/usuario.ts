import { Router } from 'express';
import { ListaUsuario, IniciarSesion, ListaUsuarioMenu, CrearUsuario } from '../controllers/usuarioController';

const router: Router = Router();

//-------------------------------------- GET -------------------------------------//
router.get('/ListaUsuarios', ListaUsuario);
router.get('/ListaUsuarioMenu', ListaUsuarioMenu);

//-------------------------------------- POST -------------------------------------//
router.post('/IniciarSesion', IniciarSesion);
router.post('/crear', CrearUsuario);

export default router;
