import { Request, response, Response } from 'express';
import { dbPool } from '../../db';
import bcrypt from 'bcrypt';
import { bucket } from '../../config/firebase'
;import { createJwt, responseService } from '../../helpers/methods.helpers';
import { messageRespone } from '../../helpers/message.helpers';
import { measureMemory } from 'vm';


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

export async function IniciarSesion(req: Request, res: Response) {
  const { correo, password } = req.body;
  const {tipo_sesion} = req.headers;

  if (!correo || !password) {
    return responseService(400, null, messageRespone["400"], true, res);
  }

  try {
    const result = await dbPool.query('SELECT * FROM tbv_usuarios WHERE correo = $1', [correo]);

    if (result.rowCount === 0) {
      return responseService(400, null, messageRespone["400"], true, res);
    }

    const usuario = result.rows[0];
    const isPassword_valid = await bcrypt.compare(password, usuario.password);

    if (!isPassword_valid) {
      return responseService(400, null, messageRespone["400"], true, res);
    }

    const sessionToken = createJwt({
      id_usuario : usuario.id_usuario,
      name: usuario.nombres,
      lastname: usuario.apellidos,
      rol: usuario.rol,
      email: usuario.correo,
      phone: usuario.phone
    }) 
    
    await dbPool.query(
      'UPDATE usuarios SET session_token = $1 WHERE correo = $2',
      [sessionToken, correo]
    );
    const resultMenu = await dbPool.query('SELECT * FROM tbv_usuario_menu WHERE correo = $1 AND tipo_sesion = $2', [correo, tipo_sesion]);

    
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


    console.log(menu);

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



  const usuario = req.body;
  const id_rol = parseInt(usuario.id_rol);
  const nombres = usuario.nombres;
  const apellidos = usuario.apellidos;
  const correo = usuario.correo;
  const password = usuario.password;
  
  console.log(usuario.nombre)



  if (!data.id_rol || !data.nombres || !data.apellidos || !data.correo || !data.password) {
    return responseService(400, null, messageRespone["400"], true, res);
  }

  const parsedIdRol = parseInt(data.id_rol);
  if (isNaN(parsedIdRol)) {
    return responseService(400, null, messageRespone["400"], true, res);
  }

  try {
    const userExist = await dbPool.query(
      'SELECT * FROM tbv_usuarios WHERE correo = $1',
      [data.correo]
    );

    if (userExist.rowCount !== 0) {
      return responseService(400, null, messageRespone["400"], true, res);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    data.password = hashedPassword;
    data.id_rol = parsedIdRol;
    data.imagen = '';


    console.log('Usuario:', data);


    const query = `CALL sp_crear_usuario($1);`;
    const values = [JSON.stringify(data)];

    await dbPool.query(query, values);

    return responseService(201, null, messageRespone["201"], false, res);

  } catch (err) {
    console.error('Error al crear el usuario:', err);

    responseService(500, null, messageRespone["500"], true, res);
  }
}

export async function EditarUsuario(req: Request, res: Response) {
  const data = req.body;

  if (!data.id_rol || !data.nombres || !data.apellidos || !data.correo) {
    return responseService(400, null, messageRespone["400"], true, res);
  }

  const parsedIdRol = parseInt(data.id_rol);
  if (isNaN(parsedIdRol)) {
    return responseService(400, null, messageRespone["400"], true, res);
  }

  try {
    
    if (data.password !== '') {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      data.password = hashedPassword;
    }

    data.id_rol = parsedIdRol;

    // Llamar al procedimiento almacenado
    const query = `CALL sp_editar_usuario($1);`;
    const values = [JSON.stringify(data)];

    await dbPool.query(query, values);

    // Responder al cliente

    return responseService(201, null, messageRespone["200"], false, res);

  } catch (err) {
    console.error('Error al editar el usuario:', err);
    return responseService(500, null, messageRespone["500"], true, res);
  }
}


export async function EliminarUsuario(req: Request, res: Response) {

  const { id_usuario } = req.params;

  if (!id_usuario) {
    return responseService(400, null, messageRespone["400"], true, res);
  }

  try {
    await dbPool.query('DELETE FROM usuarios WHERE id_usuario = $1', [id_usuario]);

    return responseService(200, null, messageRespone["200"], false, res);

  } catch (err) {
    console.error('Error al eliminar el usuario:', err);
    return responseService(500, null, messageRespone["500"], true, res);
  
  }
}





export async function SubirImagenUsuario(req: Request, res: Response) {
  if (!req.file) {
    return responseService(400, null, messageRespone["400"], true, res);
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
      
      return responseService(500, null, messageRespone["500"], true, res);
      
    });

    blobStream.on('finish', async () => {
      const public_url = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

      return responseService(200, { image_url: public_url }, messageRespone["200"], false, res);

    });

    blobStream.end(buffer);
  } catch (err) {
    console.error('Error interno al subir la imagen:', err);

    responseService(500, null, messageRespone["500"], true, res);
    
  }
}


export async function ListaRoles(req: Request, res: Response) {
  try {
    const result = await dbPool.query('SELECT * FROM roles');

    const roles = result.rows
    return responseService(200, roles, messageRespone["200"], false, res );

  } catch (err) {
    return responseService(500, null, messageRespone["500"], false, res );

  }
}