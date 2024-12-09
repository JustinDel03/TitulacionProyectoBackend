import { Request, Response } from 'express';
import { dbPool } from '../../db';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { createJwt, responseService } from '../../helpers/methods.helpers';
import { messageRespone } from '../../helpers/message.helpers';


export async function ListaUsuario(req: Request, res: Response) {
  try {
    const result = await dbPool.query('SELECT * FROM tbv_usuarios');

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
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
    });
  }
}

export async function ListaUsuarioMenu(req: Request, res: Response) {
  const { correo } = req.query;
  const {tipoSesion } =req.query;

  if (!correo) {
    return res.status(400).json({
      error: true,
      message: 'idUsuario es requerido'
    });
  }

  try {
    const result = await dbPool.query('SELECT * FROM tbv_usuario_menu WHERE correo = $1 AND tipo_sesion = $2', [correo, tipoSesion]);

    
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
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
    });
  }
}

export async function IniciarSesion(req: Request, res: Response) {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return responseService(400, null, "Los campos no pueden estar vacios", true, res );
  }

  try {
    const result = await dbPool.query('SELECT * FROM tbv_usuarios WHERE correo = $1', [correo]);

    if (result.rowCount === 0) {
      return responseService(400, null, "Usuario no registrado", true, res);
    }

    const usuario = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, usuario.password);

    if (!isPasswordValid) {
      return responseService(400, null, "Correo y/o contraseña no validos", true, res);
    }

    // Generar un nuevo token de sesión
    const sessionToken = createJwt({
      id_usuario : usuario.id_usuario,
      name: usuario.nombres,
      surname: usuario.apellidos,
      email: usuario.correo,
      phone: usuario.phone
    })





    // const sessionToken = crypto.randomBytes(32).toString('hex');
    await dbPool.query(
      'UPDATE usuarios SET session_token = $1 WHERE correo = $2',
      [sessionToken, correo]
    );


    const datos = {
      usuario,
      sessionToken
    }
    return responseService(200, datos, messageRespone["200"], false, res );
    console.log(usuario);
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
    });
  }
}


export async function CrearUsuario(req: Request, res: Response) {
  // const { id_rol, nombres, apellidos, correo, password, telefono, imagen } = req.body;

  const datos = req.body;
  const id_rol = parseInt(datos.id_rol);
  const nombres = datos.nombres;
  const apellidos = datos.apellidos;
  const correo = datos.correo;
  const password = datos.password;
  const telefono = datos.password;
  const imagen = datos.imagen;

  console.log(datos.nombre)



  if (!id_rol || !nombres || !apellidos || !correo || !password) {
    return res.status(400).json({
      error: true,
      message: 'Faltan datos requeridos',
    });
  }

  const userExist = await dbPool.query('SELECT * FROM tbv_usuarios WHERE correo = $1', [correo]);

  if(userExist.rowCount !== 0){
    return responseService(400, null, "El correo ya se encuentra registrado", true, res);
  }


  try {
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO usuarios (id_rol, nombres, apellidos, correo, password, telefono, imagen, fecha_creado, fecha_modificado)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id_usuario;
    `;

    const values = [2, nombres, apellidos, correo, hashedPassword, telefono, imagen];

    await dbPool.query(query, values);

    res.status(201).json({
      error: false,
      message: 'Usuario creado exitosamente',
      
    });
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
    });
  }
}
