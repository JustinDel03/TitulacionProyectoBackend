"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuario_controller_1 = require("../controllers/users/usuario.controller");
const sessionMiddleware_1 = require("../middlewares/sessionMiddleware");
const router = (0, express_1.Router)();
//-------------------------------------- GET -------------------------------------//
router.get('/ListaUsuarios', sessionMiddleware_1.validarSessionToken, usuario_controller_1.ListaUsuario);
router.get('/ListaUsuarioMenu', sessionMiddleware_1.validarSessionToken, usuario_controller_1.ListaUsuarioMenu);
//-------------------------------------- POST -------------------------------------//
router.post('/IniciarSesion', usuario_controller_1.IniciarSesion);
router.post('/crear', usuario_controller_1.CrearUsuario);
exports.default = router;
