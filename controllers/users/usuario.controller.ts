import { Request, Response } from 'express';
import { dbPool } from '../../db';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { bucket } from '../../config/firebase';import { createJwt, responseService } from '../../helpers/methods.helpers';
import { messageRespone } from '../../helpers/message.helpers';


export async function ListaUsuario(req: Request, res: Response) {
  try {
    const result = await dbPool.query('SELECT * FROM tbv_usuarios');

    const usuarios = result.rows


    return responseService(200, usuarios, messageRespone["200"], false, res );

  } catch (err) {
    console.error('Error:', err);
    responseService(500,null, messageRespone["500"], false, res);

  }
}
/*
export async function ListaUsuarioMenu(req: Request, res: Response) {
  const { correo } = req.body;
  const { tipo_sesion } = req.headers;

  if (!correo) {
    return res.status(400).json({
      error: true,
      message: 'id_usuario es requerido'
    });
  }

  try {
    const result = await dbPool.query('SELECT * FROM tbv_usuario_menu WHERE correo = $1 AND tipo_sesion = $2', [correo, tipo_sesion]);


    const menu = result.rows;

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
*/
export async function IniciarSesion(req: Request, res: Response) {
  const { correo, password, tipo_sesion } = req.body;

  if (!correo || !password) {
    return responseService(400, null, "Los campos no pueden estar vacios", true, res );
  }

  try {
    const result = await dbPool.query('SELECT * FROM tbv_usuarios WHERE correo = $1', [correo]);

    if (result.rowCount === 0) {
      return responseService(400, null, "Usuario no registrado", true, res);
    }

    const usuario = result.rows[0];
    const isPassword_valid = await bcrypt.compare(password, usuario.password);

    if (!isPassword_valid) {
      return responseService(400, null, "Correo y/o contraseña no validos", true, res);
    }

    // Generar un nuevo token de sesión
    const sessionToken = createJwt({
      id_usuario : usuario.id_usuario,
      name: usuario.nombres,
      rol: usuario.nombre_rol,
      surname: usuario.apellidos,
      email: usuario.correo,
      phone: usuario.phone
    })
    
    await dbPool.query(
      'UPDATE usuarios SET session_token = $1 WHERE correo = $2',
      [sessionToken, correo]
    );

    const resultMenu = await dbPool.query('SELECT * FROM tbv_usuario_menu WHERE correo = $1 AND tipo_sesion = $2', [correo, tipo_sesion]);
    const menu = resultMenu.rows;

    const data = {
        menu,
        sessionToken
    };
    return responseService(200, data, messageRespone["200"], false, res );

  } catch (error) {
    console.error('Error en el login:', error);
    responseService(500,null, messageRespone["500"], false, res)
  }
}

export async function CrearUsuario(req: Request, res: Response) {
  const data = req.body;

  if (!data.id_rol || !data.nombres || !data.apellidos || !data.correo || !data.password) {
    return responseService(400, null, 'Faltan datos requeridos', true, res);
  }

  const parsedIdRol = parseInt(data.id_rol);
  if (isNaN(parsedIdRol)) {
    return responseService(400, null, 'El rol proporcionado no es válido', true, res);
  }

  try {
    // Verificar si el usuario ya existe
    const userExist = await dbPool.query(
      'SELECT * FROM tbv_usuarios WHERE correo = $1',
      [data.correo]
    );

    if (userExist.rowCount !== 0) {
      return responseService(400, null, 'El correo ya se encuentra registrado', true, res);
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Crear objeto de usuario para enviar al procedimiento almacenado
    const usuario = {
      data,
      id_rol: parsedIdRol,
      password: hashedPassword,
    };

    // Llamar al procedimiento almacenado
    const query = `CALL sp_crear_usuario($1);`;
    const values = [JSON.stringify(usuario)];

    await dbPool.query(query, values);

    // Responder al cliente
    return responseService(201, null, 'Usuario creado exitosamente', false, res);

  } catch (err) {
    return responseService(500, null, 'Error interno del servidor', true, res);
  }
}


export async function SubirImagenUsuario(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({
      error: true,
      message: 'No se ha proporcionado ninguna imagen',
    });
  }

  const { originalname, buffer } = req.file;

  try {
    const blob = bucket.file(`usuarios/${Date.now()}-${originalname}`);
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

    blobStream.on('finish', async () => {
      const public_url = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      res.status(200).json({
        error: false,
        message: 'Imagen subida exitosamente',
        image_url: public_url,
      });
    });

    blobStream.end(buffer);
  } catch (err) {
    console.error('Error interno al subir la imagen:', err);
    res.status(500).json({
      error: true,
      message: 'Error interno al subir la imagen',
    });
  }
}


export async function ListaRoles(req: Request, res: Response) {
  try {
    const result = await dbPool.query('SELECT * FROM roles');

    const roles = result.rows

    res.status(200).json({
      error: false,
      message: 'Roles obtenidos',
      data: roles
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
    });
  }
}