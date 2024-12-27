"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuario_controller_1 = require("../controllers/users/usuario.controller");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");
const jwt_1 = require("../middlewares/jwt");
const router = (0, express_1.Router)();
//-------------------------------------- GET -------------------------------------//
router.get('/ListaUsuarios', jwt_1.validaTokenJwt, usuario_controller_1.ListaUsuario);
router.get('/ListaRoles', jwt_1.validaTokenJwt, usuario_controller_1.ListaRoles);
//-------------------------------------- POST -------------------------------------//
router.post('/IniciarSesion', usuario_controller_1.IniciarSesion);
router.post('/crear', jwt_1.validaTokenJwt, usuario_controller_1.CrearUsuario);
router.post('/subirImagen', jwt_1.validaTokenJwt, uploadMiddleware_1.upload.single('imagen'), usuario_controller_1.SubirImagenUsuario);
exports.default = router;
