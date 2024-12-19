"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");
const alerts_controller_1 = require("../controllers/alert/alerts.controller");
const jwt_1 = require("../middlewares/jwt");
const router = (0, express_1.Router)();
//-------------------------------------- GET -------------------------------------//
router.get('/ListaAlertas', jwt_1.validaTokenJwt, alerts_controller_1.ListaAlertas);
//-------------------------------------- POST -------------------------------------//
router.post('/CrearAlerta', jwt_1.validaTokenJwt, uploadMiddleware_1.upload.single('imagen'), alerts_controller_1.CrearAlerta);
exports.default = router;
