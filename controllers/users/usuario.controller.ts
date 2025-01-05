import { Request, Response } from 'express';
import { dbPool } from '../../db';
import bcrypt from 'bcrypt';
// import crypto from 'crypto';
import { bucket } from '../../config/firebase'
;import { createJwt, responseService } from '../../helpers/methods.helpers';
import { messageResponse } from '../../helpers/message.helpers';


export async function ListaUsuario(req: Request, res: Response) {
  try {
    const result = await dbPool.query('SELECT * FROM tbv_usuarios');

    const usuarios = result.rows

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

export async function IniciarSesion(req: Request, res: Response) {
  const { correo, password } = req.body;
  const {tipo_sesion} = req.headers;

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
      lastname: usuario.apellidos,
      // rol: usuario.rol,
      email: usuario.correo,
      phone: usuario.phone
    }) 
    



    await dbPool.query(
      'UPDATE usuarios SET session_token = $1 WHERE correo = $2',
      [sessionToken, correo]
    );
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
      name : usuario.nombres,
      lastName: usuario.apellidos,
      email:  usuario.correo,
      phone: usuario.telefono,
      photo: usuario.imagen, 
      token: usuario.session_token
    }


    return responseService(200, datos, messageResponse["200"], false, res );
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



  const usuario = req.body;
  const id_rol = parseInt(usuario.id_rol);
  const nombres = usuario.nombres;
  const apellidos = usuario.apellidos;
  const correo = usuario.correo;
  const password = usuario.password;
  
  console.log(usuario.nombre)



  if (!id_rol || !nombres || !apellidos || !correo || !password) {
   return responseService(400, null, 'Campos imcompletos', true, res);
  }

  const userExist = await dbPool.query('SELECT * FROM tbv_usuarios WHERE correo = $1', [correo]);

  if(userExist.rowCount !== 0){
    return responseService(400, null, "El correo ya se encuentra registrado", true, res);
  }


  try {
    // Encriptar la contraseña
    usuario.password = await bcrypt.hash(password, 10);

    const query = `CALL sp_crear_usuario($1);`;
    const values = [JSON.stringify(usuario)];

    await dbPool.query(query, values);

    // Responder al cliente
    // res.status(201).json({
    //   error: false,
    //   message: 'Usuario creado exitosamente',
    // });
    return responseService(200, null, 'Cuenta creada exitosamente', false, res);
  } catch (err) {
    console.error('Error al crear usuario:', err);
    // res.status(500).json({
    //   error: true,
    //   message: 'Error interno del servidor',
    // });
    return responseService(500, null, 'Ocurrio un error en el servidor', true, res);
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