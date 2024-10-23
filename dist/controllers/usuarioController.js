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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrearUsuario = exports.IniciarSesion = exports.ListaUsuarioMenu = exports.ListaUsuario = void 0;
const db_1 = require("../db");
const bcrypt_1 = __importDefault(require("bcrypt"));
function ListaUsuario(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield db_1.poolLocalS.query('SELECT * FROM tbv_usuario_menu');
            const usuarios = result.rows;
            res.status(200).json({
                status: true,
                msg: 'Usuarios obtenidos',
                value: usuarios
            });
        }
        catch (err) {
            console.error('Error:', err);
            res.status(500).json({
                status: false,
                msg: 'Error interno del servidor',
            });
        }
    });
}
exports.ListaUsuario = ListaUsuario;
function ListaUsuarioMenu(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { correo } = req.query;
        if (!correo) {
            return res.status(400).json({
                status: false,
                msg: 'idUsuario es requerido',
                value: null
            });
        }
        try {
            const result = yield db_1.poolLocalS.query('SELECT * FROM tbv_usuario_menu WHERE correo = $1', [correo]);
            const menu = result.rows.map(row => {
                return {
                    menuId: row.id_menu,
                    nombreMenu: row.nombre_menu,
                    icono: row.icono,
                    url: row.url,
                    correo: row.correo
                };
            });
            res.status(200).json({
                status: true,
                msg: 'Lista de Menús obtenida',
                value: menu
            });
        }
        catch (err) {
            console.error('Error:', err);
            res.status(500).json({
                status: false,
                msg: 'Error interno del servidor',
            });
        }
    });
}
exports.ListaUsuarioMenu = ListaUsuarioMenu;
function IniciarSesion(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { correo, password } = req.body;
        console.log('correo y clave', correo, password);
        if (!correo || !password) {
            return res.status(400).json({
                status: false,
                msg: 'nombreUsuario y clave son requeridos',
            });
        }
        try {
            const result = yield db_1.poolLocalS.query('SELECT * FROM tbv_usuarios WHERE correo = $1', [correo]);
            if (result.rows.length === 0) {
                return res.status(401).json({
                    status: false,
                    msg: 'Credenciales inválidas',
                });
            }
            const usuario = result.rows[0];
            // Comparar la contraseña encriptada usando bcrypt
            const isPasswordValid = yield bcrypt_1.default.compare(password, usuario.password);
            if (isPasswordValid) {
                res.status(200).json({
                    status: true,
                    msg: 'Usuario autenticado exitosamente',
                    value: usuario
                });
            }
            else {
                res.status(401).json({
                    status: false,
                    msg: 'Credenciales inválidas',
                });
            }
        }
        catch (err) {
            console.error('Error:', err);
            res.status(500).json({
                status: false,
                msg: 'Error interno del servidor',
            });
        }
    });
}
exports.IniciarSesion = IniciarSesion;
function CrearUsuario(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id_rol, nombre, correo, password, telefono, imagen } = req.body;
        if (!id_rol || !nombre || !correo || !password) {
            return res.status(400).json({
                status: false,
                msg: 'Faltan datos requeridos',
            });
        }
        try {
            // Encriptar la contraseña
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            const query = `
      INSERT INTO usuarios (id_rol, nombre, correo, password, telefono, imagen, fecha_creado, fecha_modificado)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id_usuario;
    `;
            const values = [id_rol, nombre, correo, hashedPassword, telefono, imagen];
            const result = yield db_1.poolLocalS.query(query, values);
            const newUserId = result.rows[0].id_usuario;
            res.status(201).json({
                status: true,
                msg: 'Usuario creado exitosamente',
                value: {
                    id_usuario: newUserId,
                    id_rol,
                    nombre,
                    correo,
                    telefono,
                    imagen,
                    creado: new Date(),
                    modificado: new Date()
                }
            });
        }
        catch (err) {
            console.error('Error al crear usuario:', err);
            res.status(500).json({
                status: false,
                msg: 'Error interno del servidor',
            });
        }
    });
}
exports.CrearUsuario = CrearUsuario;
