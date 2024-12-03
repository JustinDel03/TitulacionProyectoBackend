"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuarioController_1 = require("../controllers/usuarioController");
const router = (0, express_1.Router)();
//-------------------------------------- GET -------------------------------------//
router.get('/ListaUsuarios', usuarioController_1.ListaUsuario);
router.get('/ListaUsuarioMenu', usuarioController_1.ListaUsuarioMenu);
//-------------------------------------- POST -------------------------------------//
router.post('/IniciarSesion', usuarioController_1.IniciarSesion);
router.post('/crear', usuarioController_1.CrearUsuario);
exports.default = router;
