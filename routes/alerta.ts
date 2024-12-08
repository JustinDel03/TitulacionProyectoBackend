import { Router } from 'express';
import { ListaAlertas, CrearAlerta  } from '../controllers/alertaController';
import { validarSessionToken } from '../middlewares/sessionMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router: Router = Router();

//-------------------------------------- GET -------------------------------------//
router.get('/ListaAlertas', validarSessionToken, ListaAlertas);

//-------------------------------------- POST -------------------------------------//
router.post('/CrearAlerta', upload.single('imagen'), CrearAlerta);

export default router;
