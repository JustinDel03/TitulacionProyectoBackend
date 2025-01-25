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
router.get('/ListaObservacionesAlertasXUsuario', jwt_1.validaTokenJwt, usuario_controller_1.ListaObservacionesAlertasXUsuario);
//-------------------------------------- POST -------------------------------------//
router.post('/IniciarSesion', usuario_controller_1.IniciarSesion);
router.post('/crear', usuario_controller_1.CrearUsuario);
router.post('/subirImagen', jwt_1.validaTokenJwt, uploadMiddleware_1.upload.single('imagen'), usuario_controller_1.SubirImagenUsuario);
//-------------------------------------- PUT -------------------------------------//
router.put('/EditarUsuario', jwt_1.validaTokenJwt, usuario_controller_1.EditarUsuario);
router.post('/EditUserData', jwt_1.validaTokenJwt, usuario_controller_1.EditarUsuarioApp);
//-------------------------------------- DELETE -------------------------------------//
router.delete('/EliminarUsuario/:id_usuario', jwt_1.validaTokenJwt, usuario_controller_1.EliminarUsuario);
router.post('/cambiarContrasena', jwt_1.validaTokenJwt, usuario_controller_1.cambiarContrasena);
//router.post('/recuperContrasena', RecuperarSesion);
//router.post('/cambioContrasena', validarTokenJwt, cambioContraseña);
exports.default = router;
