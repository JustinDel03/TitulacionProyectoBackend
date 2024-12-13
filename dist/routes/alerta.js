"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const alertaController_1 = require("../controllers/alertaController");
const uploadMiddleware_1 = require("../middlewares/uploadMiddleware");
const router = (0, express_1.Router)();
//-------------------------------------- GET -------------------------------------//
router.get('/ListaAlertas', alertaController_1.ListaAlertas);
//-------------------------------------- POST -------------------------------------//
router.post('/CrearAlerta', uploadMiddleware_1.upload.single('imagen'), alertaController_1.CrearAlerta);
exports.default = router;
