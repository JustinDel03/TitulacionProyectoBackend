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
exports.SubirImagenUsuario = SubirImagenUsuario;
exports.ListaRoles = ListaRoles;
const db_1 = require("../../db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const firebase_1 = require("../../config/firebase");
const methods_helpers_1 = require("../../helpers/methods.helpers");
const message_helpers_1 = require("../../helpers/message.helpers");
function ListaUsuario(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield db_1.dbPool.query('SELECT * FROM tbv_usuarios');
            const usuarios = result.rows;
            res.status(200).json({
                error: false,
                message: 'Usuarios obtenidos',
                data: usuarios
            });
        }
        catch (err) {
            console.error('Error:', err);
            (0, methods_helpers_1.responseService)(500, null, message_helpers_1.messageRespone["500"], false, res);
        }
    });
}
function ListaUsuarioMenu(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { correo } = req.body;
        const { tipo_sesion } = req.headers;
        if (!correo) {
            return res.status(400).json({
                error: true,
                message: 'id_usuario es requerido'
            });
        }
        try {
            const result = yield db_1.dbPool.query('SELECT * FROM tbv_usuario_menu WHERE correo = $1 AND tipo_sesion = $2', [correo, tipo_sesion]);
            const menu = result.rows;
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
        const { tipo_sesion } = req.headers;
        if (!correo || !password) {
            return (0, methods_helpers_1.responseService)(400, null, "Los campos no pueden estar vacios", true, res);
        }
        try {
            const result = yield db_1.dbPool.query('SELECT * FROM tbv_usuarios WHERE correo = $1', [correo]);
            if (result.rowCount === 0) {
                return (0, methods_helpers_1.responseService)(400, null, "Usuario no registrado", true, res);
            }
            const usuario = result.rows[0];
            const isPassword_valid = yield bcrypt_1.default.compare(password, usuario.password);
            if (!isPassword_valid) {
                return (0, methods_helpers_1.responseService)(400, null, "Correo y/o contraseña no validos", true, res);
            }
            // Generar un nuevo token de sesión
            const sessionToken = (0, methods_helpers_1.createJwt)({
                id_usuario: usuario.id_usuario,
                name: usuario.nombres,
                surname: usuario.apellidos,
                email: usuario.correo,
                phone: usuario.phone
            });
            // const sessionToken = crypto.randomBytes(32).toString('hex');
            yield db_1.dbPool.query('UPDATE usuarios SET session_token = $1 WHERE correo = $2', [sessionToken, correo]);
            const resultMenu = yield db_1.dbPool.query('SELECT * FROM tbv_usuario_menu WHERE correo = $1 AND tipo_sesion = $2', [correo, tipo_sesion]);
            const menu = resultMenu.rows;
            const data = {
                menu,
                sessionToken
            };
            return (0, methods_helpers_1.responseService)(200, data, message_helpers_1.messageRespone["200"], false, res);
        }
        catch (error) {
            console.error('Error en el login:', error);
            (0, methods_helpers_1.responseService)(500, null, message_helpers_1.messageRespone["500"], false, res);
        }
    });
}
function CrearUsuario(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // const { id_rol, nombres, apellidos, correo, password, telefono, imagen } = req.body;
        const usuario = req.body;
        const id_rol = parseInt(usuario.id_rol);
        const nombres = usuario.nombres;
        const apellidos = usuario.apellidos;
        const correo = usuario.correo;
        const password = usuario.password;
        console.log(usuario.nombre);
        if (!id_rol || !nombres || !apellidos || !correo || !password) {
            return (0, methods_helpers_1.responseService)(400, null, 'Campos imcompletos', true, res);
        }
        const userExist = yield db_1.dbPool.query('SELECT * FROM tbv_usuarios WHERE correo = $1', [correo]);
        if (userExist.rowCount !== 0) {
            return (0, methods_helpers_1.responseService)(400, null, "El correo ya se encuentra registrado", true, res);
        }
        try {
            // Encriptar la contraseña
            usuario.password = yield bcrypt_1.default.hash(password, 10);
            const query = `CALL sp_crear_usuario($1);`;
            const values = [JSON.stringify(usuario)];
            yield db_1.dbPool.query(query, values);
            // Responder al cliente
            // res.status(201).json({
            //   error: false,
            //   message: 'Usuario creado exitosamente',
            // });
            return (0, methods_helpers_1.responseService)(200, null, 'Cuenta creada exitosamente', false, res);
        }
        catch (err) {
            console.error('Error al crear usuario:', err);
            // res.status(500).json({
            //   error: true,
            //   message: 'Error interno del servidor',
            // });
            return (0, methods_helpers_1.responseService)(500, null, 'Ocurrio un error en el servidor', true, res);
        }
    });
}
function SubirImagenUsuario(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.file) {
            return res.status(400).json({
                error: true,
                message: 'No se ha proporcionado ninguna imagen',
            });
        }
        const { originalname, buffer } = req.file;
        try {
            const blob = firebase_1.bucket.file(`usuarios/${Date.now()}-${originalname}`);
            const blobStream = blob.createWriteStream({
                metadata: {
                    contentType: req.file.mimetype,
                },
            });
            blobStream.on('error', (err) => {
                console.error('Error al subir la imagen:', err);
                res.status(500).json({
                    error: true,
                    message: 'Error al subir la imagen',
                });
            });
            blobStream.on('finish', () => __awaiter(this, void 0, void 0, function* () {
                const public_url = `https://storage.googleapis.com/${firebase_1.bucket.name}/${blob.name}`;
                res.status(200).json({
                    error: false,
                    message: 'Imagen subida exitosamente',
                    image_url: public_url,
                });
            }));
            blobStream.end(buffer);
        }
        catch (err) {
            console.error('Error interno al subir la imagen:', err);
            res.status(500).json({
                error: true,
                message: 'Error interno al subir la imagen',
            });
        }
    });
}
function ListaRoles(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield db_1.dbPool.query('SELECT * FROM roles');
            const roles = result.rows;
            res.status(200).json({
                error: false,
                message: 'Roles obtenidos',
                data: roles
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
