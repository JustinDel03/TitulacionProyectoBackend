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
exports.ListaUsuario = ListaUsuario;
exports.ListaUsuarioMenu = ListaUsuarioMenu;
exports.IniciarSesion = IniciarSesion;
exports.CrearUsuario = CrearUsuario;
const db_1 = require("../db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
function ListaUsuario(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield db_1.dbPool.query('SELECT * FROM tbv_usuarios');
            const usuarios = result.rows.map(row => {
                return {
                    idUsuario: row.id_usuario,
                    idRol: row.id_rol,
                    nombreRol: row.nombre_rol,
                    nombres: row.nombres,
                    apellidos: row.apellidos,
                    correo: row.correo,
                    telefono: row.telefono,
                    imagen: row.imagen
                };
            });
            res.status(200).json({
                error: false,
                message: 'Usuarios obtenidos',
                data: usuarios
            });
        }
        catch (err) {
            console.error('Error:', err);
            res.status(500).json({
                error: true,
                message: 'Error interno del servidor',
            });
        }
    });
}
function ListaUsuarioMenu(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { correo } = req.query;
        const { tipoSesion } = req.query;
        if (!correo) {
            return res.status(400).json({
                error: true,
                message: 'idUsuario es requerido'
            });
        }
        try {
            const result = yield db_1.dbPool.query('SELECT * FROM tbv_usuario_menu WHERE correo = $1 AND tipo_sesion = $2', [correo, tipoSesion]);
            const menu = result.rows.map(row => {
                return {
                    menuId: row.id_menu,
                    nombreMenu: row.nombre_menu,
                    nombreRol: row.nombre_rol,
                    icono: row.icono,
                    url: row.url,
                    correo: row.correo
                };
            });
            res.status(200).json({
                error: false,
                message: 'Lista de Menús obtenida',
                data: menu
            });
        }
        catch (err) {
            console.error('Error:', err);
            res.status(500).json({
                error: true,
                message: 'Error interno del servidor',
            });
        }
    });
}
function IniciarSesion(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { correo, password } = req.body;
        if (!correo || !password) {
            return res.status(400).json({
                error: true,
                message: 'Correo y contraseña son requeridos',
            });
        }
        try {
            const result = yield db_1.dbPool.query('SELECT * FROM tbv_usuarios WHERE correo = $1', [correo]);
            if (result.rowCount === 0) {
                return res.status(401).json({
                    error: true,
                    message: 'Credenciales inválidas',
                });
            }
            const usuario = result.rows[0];
            const isPasswordValid = yield bcrypt_1.default.compare(password, usuario.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    error: true,
                    message: 'Credenciales inválidas',
                });
            }
            // Generar un nuevo token de sesión
            const sessionToken = crypto_1.default.randomBytes(32).toString('hex');
            yield db_1.dbPool.query('UPDATE usuarios SET session_token = $1, fecha_token = NOW() WHERE correo = $2', [sessionToken, correo]);
            res.status(200).json({
                error: false,
                message: 'Usuario autenticado exitosamente',
                data: {
                    idUsuario: usuario.id_usuario,
                    idRol: usuario.id_rol,
                    nombreRol: usuario.nombre_rol,
                    nombres: usuario.nombres,
                    apellidos: usuario.apellidos,
                    correo: usuario.correo,
                    imagen: usuario.imagen,
                },
            });
            console.log(usuario);
        }
        catch (error) {
            console.error('Error en el login:', error);
            res.status(500).json({
                error: true,
                message: 'Error interno del servidor',
            });
        }
    });
}
function CrearUsuario(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id_rol, nombres, apellidos, correo, password, telefono, imagen } = req.body;
        if (!id_rol || !nombres || !apellidos || !correo || !password) {
            return res.status(400).json({
                error: true,
                message: 'Faltan datos requeridos',
            });
        }
        try {
            // Encriptar la contraseña
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            const query = `
      INSERT INTO usuarios (id_rol, nombres, apellidos, correo, password, telefono, imagen, fecha_creado, fecha_modificado)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id_usuario;
    `;
            const values = [2, nombres, apellidos, correo, hashedPassword, telefono, imagen];
            yield db_1.dbPool.query(query, values);
            res.status(201).json({
                error: false,
                message: 'Usuario creado exitosamente',
            });
        }
        catch (err) {
            console.error('Error al crear usuario:', err);
            res.status(500).json({
                error: true,
                message: 'Error interno del servidor',
            });
        }
    });
}
