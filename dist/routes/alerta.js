"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const alerta_controller_1 = require("../controllers/alertas/alerta.controller");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");
const jwt_1 = require("../middlewares/jwt");
const router = (0, express_1.Router)();
//-------------------------------------- GET -------------------------------------//
router.get('/ListaAlertas', jwt_1.validaTokenJwt, alerta_controller_1.ListaAlertas);
router.get('/ListaAlertasCompleta', jwt_1.validaTokenJwt, alerta_controller_1.ListaAlertasCompleta);
router.get('/TipoAlertas', alerta_controller_1.TipoAlertas);
//-------------------------------------- POST -------------------------------------//
router.post('/CrearAlerta', jwt_1.validaTokenJwt, uploadMiddleware_1.upload.array('imagenes', 3), alerta_controller_1.CrearAlerta);
//-------------------------------------- DELETE ----------------------------------//
router.delete('/EliminarAlerta/:id_alerta', jwt_1.validaTokenJwt, alerta_controller_1.EliminarAlerta);
//-------------------------------------- PUT -------------------------------------//
router.put('/CambiarEstadoAlerta/:id_alerta/:id_estado', jwt_1.validaTokenJwt, alerta_controller_1.CambiarEstadoAlerta);
exports.default = router;
