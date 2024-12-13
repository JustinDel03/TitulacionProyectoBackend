"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuarioController_1 = require("../controllers/usuarioController");
const sessionMiddleware_1 = require("../middlewares/sessionMiddleware");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");
const router = (0, express_1.Router)();
//-------------------------------------- GET -------------------------------------//
router.get('/ListaUsuarios', sessionMiddleware_1.validarSessionToken, usuarioController_1.ListaUsuario);
router.get('/ListaUsuarioMenu', sessionMiddleware_1.validarSessionToken, usuarioController_1.ListaUsuarioMenu);
router.get('/ListaRoles', sessionMiddleware_1.validarSessionToken, usuarioController_1.ListaRoles);
//-------------------------------------- POST -------------------------------------//
router.post('/IniciarSesion', usuarioController_1.IniciarSesion);
router.post('/crear', usuarioController_1.CrearUsuario);
router.post('/subirImagen', uploadMiddleware_1.upload.single('imagen'), usuarioController_1.SubirImagenUsuario);
exports.default = router;
