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
exports.IniciarSesion = IniciarSesion;
exports.CrearUsuario = CrearUsuario;
exports.EditarUsuario = EditarUsuario;
exports.EliminarUsuario = EliminarUsuario;
exports.SubirImagenUsuario = SubirImagenUsuario;
exports.ListaRoles = ListaRoles;
exports.cambiarContrasena = cambiarContrasena;
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
            return (0, methods_helpers_1.responseService)(400, null, message_helpers_1.messageResponse["400"], true, res);
        }
        try {
            const result = yield db_1.dbPool.query('SELECT * FROM tbv_usuarios WHERE correo = $1', [correo]);
            if (result.rowCount === 0) {
                return (0, methods_helpers_1.responseService)(400, null, message_helpers_1.messageResponse["400"], true, res);
            }
            const usuario = result.rows[0];
            const isPassword_valid = yield bcrypt_1.default.compare(password, usuario.password);
            if (!isPassword_valid) {
                return (0, methods_helpers_1.responseService)(400, null, message_helpers_1.messageResponse["400"], true, res);
            }
            const sessionToken = (0, methods_helpers_1.createJwt)({
                id_usuario: usuario.id_usuario,
                name: usuario.nombres,
                lastname: usuario.apellidos,
                email: usuario.correo,
                phone: usuario.telefono
            });
            yield db_1.dbPool.query('UPDATE usuarios SET session_token = $1 WHERE correo = $2', [sessionToken, correo]);
            // const resultMenu = await dbPool.query('SELECT * FROM tbv_usuario_menu WHERE correo = $1 AND tipo_sesion = $2', [correo, tipo_sesion]);
            // const menu = result.rows.map(row => {
            //   return {
            //     menuId: row.id_menu,
            //     nombreMenu: row.nombre_menu,
            //     nombreRol: row.nombre_rol,
            //     icono: row.icono,
            //     url: row.url,
            //     correo: row.correo
            //   };
            // });
            // console.log(menu);
            const datos = {
                id_user: usuario.id_usuario,
                name: usuario.nombres,
                lastName: usuario.apellidos,
                email: usuario.correo,
                phone: usuario.telefono,
                photo: usuario.imagen,
                token: usuario.session_token
            };
            console.log(usuario);
            return (0, methods_helpers_1.responseService)(200, datos, message_helpers_1.messageResponse["200"], false, res);
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
        // const { id_rol, nombres, apellidos, correo, password, telefono, imagen } = req.body;
        const data = req.body;
        const id_rol = parseInt(data.id_rol);
        const nombres = data.nombres;
        const apellidos = data.apellidos;
        const correo = data.correo;
        const password = data.password;
        console.log(data.nombre);
        if (!data.id_rol || !data.nombres || !data.apellidos || !data.correo || !data.password) {
            return (0, methods_helpers_1.responseService)(400, null, message_helpers_1.messageResponse["400"], true, res);
        }
        const parsedIdRol = parseInt(data.id_rol);
        if (isNaN(parsedIdRol)) {
            return (0, methods_helpers_1.responseService)(400, null, message_helpers_1.messageResponse["400"], true, res);
        }
        try {
            const userExist = yield db_1.dbPool.query('SELECT * FROM tbv_usuarios WHERE correo = $1', [data.correo]);
            if (userExist.rowCount !== 0) {
                return (0, methods_helpers_1.responseService)(400, null, message_helpers_1.messageResponse["400"], true, res);
            }
            const hashedPassword = yield bcrypt_1.default.hash(data.password, 10);
            data.password = hashedPassword;
            data.id_rol = parsedIdRol;
            data.imagen = '';
            console.log('Usuario:', data);
            const query = `CALL sp_crear_usuario($1);`;
            const values = [JSON.stringify(data)];
            yield db_1.dbPool.query(query, values);
            return (0, methods_helpers_1.responseService)(201, null, message_helpers_1.messageResponse["201"], false, res);
        }
        catch (err) {
            console.error('Error al crear el usuario:', err);
            (0, methods_helpers_1.responseService)(500, null, message_helpers_1.messageResponse["500"], true, res);
        }
    });
}
function EditarUsuario(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = req.body;
        if (!data.id_rol || !data.nombres || !data.apellidos || !data.correo) {
            return (0, methods_helpers_1.responseService)(400, null, message_helpers_1.messageResponse["400"], true, res);
        }
        const parsedIdRol = parseInt(data.id_rol);
        if (isNaN(parsedIdRol)) {
            return (0, methods_helpers_1.responseService)(400, null, message_helpers_1.messageResponse["400"], true, res);
        }
        try {
            if (data.password !== '') {
                const hashedPassword = yield bcrypt_1.default.hash(data.password, 10);
                data.password = hashedPassword;
            }
            data.id_rol = parsedIdRol;
            // Llamar al procedimiento almacenado
            const query = `CALL sp_editar_usuario($1);`;
            const values = [JSON.stringify(data)];
            yield db_1.dbPool.query(query, values);
            // Responder al cliente
            return (0, methods_helpers_1.responseService)(201, null, message_helpers_1.messageResponse["200"], false, res);
        }
        catch (err) {
            console.error('Error al editar el usuario:', err);
            return (0, methods_helpers_1.responseService)(500, null, message_helpers_1.messageResponse["500"], true, res);
        }
    });
}
function EliminarUsuario(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id_usuario } = req.params;
        if (!id_usuario) {
            return (0, methods_helpers_1.responseService)(400, null, message_helpers_1.messageResponse["400"], true, res);
        }
        try {
            yield db_1.dbPool.query('DELETE FROM usuarios WHERE id_usuario = $1', [id_usuario]);
            return (0, methods_helpers_1.responseService)(200, null, message_helpers_1.messageResponse["200"], false, res);
        }
        catch (err) {
            console.error('Error al eliminar el usuario:', err);
            return (0, methods_helpers_1.responseService)(500, null, message_helpers_1.messageResponse["500"], true, res);
        }
    });
}
function SubirImagenUsuario(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.file) {
            return (0, methods_helpers_1.responseService)(400, null, message_helpers_1.messageResponse["400"], true, res);
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
                return (0, methods_helpers_1.responseService)(500, null, message_helpers_1.messageResponse["500"], true, res);
            });
            blobStream.on('finish', () => __awaiter(this, void 0, void 0, function* () {
                const public_url = `https://storage.googleapis.com/${firebase_1.bucket.name}/${blob.name}`;
                return (0, methods_helpers_1.responseService)(200, { image_url: public_url }, message_helpers_1.messageResponse["200"], false, res);
            }));
            blobStream.end(buffer);
        }
        catch (err) {
            console.error('Error interno al subir la imagen:', err);
            (0, methods_helpers_1.responseService)(500, null, message_helpers_1.messageResponse["500"], true, res);
        }
    });
}
function ListaRoles(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield db_1.dbPool.query('SELECT * FROM roles');
            const roles = result.rows;
            return (0, methods_helpers_1.responseService)(200, roles, message_helpers_1.messageResponse["200"], false, res);
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
function cambiarContrasena(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = req.body;
        const datos = JSON.parse((req.headers.datos));
        try {
            const oldPassword = body.oldPassword;
            const newPassword = body.newPassword;
            const result = yield db_1.dbPool.query('SELECT * FROM tbv_usuarios WHERE correo = $1', [datos.email]);
            const usuario = result.rows[0];
            const isPassword_valid = yield bcrypt_1.default.compare(oldPassword, usuario.password);
            if (!isPassword_valid) {
                return (0, methods_helpers_1.responseService)(400, null, "La contraseña no es correcta", true, res);
            }
            usuario.password = yield bcrypt_1.default.hash(newPassword, 10);
            const query = `CALL sp_cambiar_contrasena($1, $2);`;
            const values = [datos.email, usuario.password];
            yield db_1.dbPool.query(query, values);
            return (0, methods_helpers_1.responseService)(200, null, 'Contraseña cambiada exitosamente', false, res);
        }
        catch (error) {
            console.error('Error al cambiar contraseña:', error);
            // res.status(500).json({
            //   error: true,
            //   message: 'Error interno del servidor',
            // });
            return (0, methods_helpers_1.responseService)(500, null, 'Ocurrio un error en el servidor', true, res);
        }
    });
}
// export async function recuperContrasena(req: Request, res: Response) {
//   const {correo} = req.body;
//   try {
//     const userExist = await dbPool.query('SELECT * FROM tbv_usuarios WHERE correo = $1', [correo]);
//     if (userExist.rowCount === 0) {
//       return responseService(400, null, "Usuario no registrado", true, res);
//     }
//     const token = jwt.sign({ correo }, process.env.KEY_JWT!, {
//             expiresIn: process.env.DURATION, // Usa un valor predeterminado si HORAS_JWT no está definido
//         });
//   } catch (error) {
//   }
// }
