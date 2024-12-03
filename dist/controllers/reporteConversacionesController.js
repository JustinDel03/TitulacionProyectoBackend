"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecuteQuery = exports.ListaDivisionesPorMinuto = exports.ListaConversaciones = void 0;
const db_1 = require("../db");
function ListaConversaciones(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield db_1.dbPool.query('SELECT * FROM conversations limit 10');
            if (result.rows.length === 0) {
                return res.status(404).json({
                    status: false,
                    msg: 'No se encontraron conversaciones',
                    value: null
                });
            }
            res.status(200).json({
                status: true,
                msg: 'Conversaciones obtenidas',
                value: result.rows
            });
        }
        catch (err) {
            console.error('Error al obtener las conversaciones:', err);
            res.status(500).json({
                status: false,
                msg: 'Error interno del servidor',
            });
        }
    });
}
exports.ListaConversaciones = ListaConversaciones;
function ListaDivisionesPorMinuto(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Obtener el rango de fechas desde req.query
            const { rangoFecha } = req.query;
            if (!rangoFecha) {
                return res.status(400).json({
                    status: false,
                    msg: 'El rango de fechas es obligatorio',
                });
            }
            // Dividir el rango de fechas en inicio y fin
            const [startDate, endDate] = rangoFecha.split(' - ');
            if (!startDate || !endDate) {
                return res.status(400).json({
                    status: false,
                    msg: 'El rango de fechas debe estar en el formato "YYYY-MM-DD - YYYY-MM-DD"',
                });
            }
            console.log('Fechas enviadas a la base de datos:', { startDate, endDate });
            // Consultar la base de datos con las fechas
            const result = yield db_1.dbPool.query(`SELECT * FROM func_minutos_totales_por_agente($1, $2)`, [startDate.trim(), endDate.trim()]);
            if (result.rows.length === 0) {
                // Respuesta sin datos, pero con éxito
                return res.status(200).json({
                    status: true,
                    msg: `No se encontraron registros para el rango ${startDate} a ${endDate}`,
                    value: [],
                });
            }
            // Respuesta exitosa con los datos obtenidos
            res.status(200).json({
                status: true,
                msg: 'Divisiones obtenidas exitosamente',
                value: result.rows,
            });
        }
        catch (err) {
            console.error('Error al obtener las divisiones por minuto:', err);
            res.status(500).json({
                status: false,
                msg: 'Error interno del servidor',
            });
        }
    });
}
exports.ListaDivisionesPorMinuto = ListaDivisionesPorMinuto;
function ExecuteQuery(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { query } = req.body;
        // Verificar que se envió una consulta
        if (!query) {
            return res.status(400).json({
                status: false,
                msg: 'Se requiere un query en la solicitud',
            });
        }
        try {
            // Ejecutar la consulta SQL que viene desde el frontend
            const result = yield db_1.dbPool.query(query);
            // Devolver los resultados de la consulta
            res.status(200).json({
                status: true,
                msg: 'Consulta ejecutada con éxito',
                value: result.rows,
            });
        }
        catch (err) {
            console.error('Error al ejecutar la consulta:', err);
            // Devolver error al cliente si la consulta falla
            res.status(500).json({
                status: false,
                msg: 'Error al ejecutar la consulta',
            });
        }
    });
}
exports.ExecuteQuery = ExecuteQuery;
