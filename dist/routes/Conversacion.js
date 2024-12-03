"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reporteConversacionesController_1 = require("../controllers/reporteConversacionesController");
const router = (0, express_1.Router)();
//-------------------------------------- GET -------------------------------------//
router.get('/ListaConversaciones', reporteConversacionesController_1.ListaConversaciones);
router.get('/ListaDivisionesPorMinuto', reporteConversacionesController_1.ListaDivisionesPorMinuto);
//-------------------------------------- POST -------------------------------------//
router.post('/ExecuteQuery', reporteConversacionesController_1.ExecuteQuery);
exports.default = router;
