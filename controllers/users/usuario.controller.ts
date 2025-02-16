import { Request, Response } from 'express';
import { dbPool } from '../../db';
import bcrypt from 'bcrypt';
import { bucket } from '../../config/firebase';import { createJwt, responseService } from '../../helpers/methods.helpers';
import { DatosJwt } from '../../models/jwt.interface';


export async function ListaUsuario(req: Request, res: Response) {
  try {
    const result = await dbPool.query('SELECT * FROM tbv_usuarios');

    const usuarios = result.rows


    return responseService(200, usuarios, "Lista de usuarios obtenida", false, res );

  } catch (err) {
    console.error('Error:', err);
    responseService(500,null, "Error al obtener la lista de usuarios", false, res);
  }
}

export async function ListaObservacionesAlertasXUsuario(req: Request, res: Response) {
  try {
    const result = await dbPool.query('SELECT * FROM tbv_observaciones_alertas_usuarios');

    const observacionesAlertasXUsuario = result.rows

    return responseService(200, observacionesAlertasXUsuario, "Lista Observaciones por usuario obtenida", false, res);

  } catch (err) {
    console.error('Error:', err);
    responseService(500, null, "Error al obtener la lista de observaciones por usuario", false, res);

  }
}

export async function IniciarSesion(req: Request, res: Response) {
  const { correo, password, tipo_sesion } = req.body;

  if (!correo || !password) {
    return responseService(400, null, "Erro al iniciar sesion", true, res);
  }

  try {
    const result = await dbPool.query('SELECT * FROM tbv_usuarios WHERE correo = $1', [correo]);

    if (result.rowCount === 0) {
      return responseService(400, null, 'Usuario no Existe', true, res);
    }

    const usuario = result.rows[0];
    const isPassword_valid = await bcrypt.compare(password, usuario.password);

    if (!isPassword_valid) {
      return responseService(400, null, "Correo y/o Contraseña incorrecta", true, res);
    }

    const sessionToken = createJwt({
      id_usuario : usuario.id_usuario,
      name: usuario.nombres,
      rol: usuario.nombre_rol,
      surname: usuario.apellidos,
      email: usuario.correo,
      phone: usuario.telefono
    }) 
    
    await dbPool.query(
      'UPDATE usuarios SET session_token = $1 WHERE correo = $2',
      [sessionToken, correo]
    );

    const resultMenu = await dbPool.query('SELECT * FROM tbv_usuario_menu WHERE correo = $1 AND tipo_sesion = $2 order by nombre_menu', [correo, tipo_sesion]);
    const menu = resultMenu.rows;

    const datos = {
      id_user: usuario.id_usuario,
      name : usuario.nombres,
      lastName: usuario.apellidos,
      nombre_rol: usuario.nombre_rol,
      email:  usuario.correo,
      phone: usuario.telefono,
      photo: usuario.imagen, 
      token: sessionToken,
      menu
    }

    console.log(usuario);
    return responseService(200, datos, "inicio exitoso", false, res );
  } catch (error) {
    console.error('Error en el login:', error);
    responseService(500,null, "Error al iniciar sesion", false, res)
  }
}


export async function CrearUsuario(req: Request, res: Response) {

  const data = req.body;

  console.log(data.nombre)

  if (!data.id_rol || !data.nombres || !data.apellidos || !data.correo || !data.password) {
    return responseService(400, null, "Error, falta uno de los parametros", true, res);
  }

  const parsedIdRol = parseInt(data.id_rol);

  if (isNaN(parsedIdRol)) {
    return responseService(400, null, "Error, no tiene asignado rol", true, res);
  }

  try {
    const userExist = await dbPool.query(
      'SELECT * FROM tbv_usuarios WHERE correo = $1',
      [data.correo]
    );

    if (userExist.rowCount !== 0) {
      return responseService(400, null, "Error, el usuario ya existe", true, res);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    data.password = hashedPassword;
    data.id_rol = parsedIdRol;
    data.imagen = '';


    console.log('Usuario:', data);

    const query = `CALL sp_crear_usuario($1);`;
    const values = [JSON.stringify(data)];

    await dbPool.query(query, values);

    return responseService(200, null, "Usuario creado correctamente", false, res);

  } catch (err) {
    console.error('Error al crear el usuario:', err);

    responseService(500, null, "Error al crear el usuario", true, res);
  }
}

export async function EditarUsuario(req: Request, res: Response) {
  const data = req.body;

  if (!data.id_rol || !data.nombres || !data.apellidos || !data.correo) {
    return responseService(400, null, "Error, falta uno de los parametros", true, res);
  }

  const parsedIdRol = parseInt(data.id_rol);
  if (isNaN(parsedIdRol)) {
    return responseService(400, null, "Error no tiene rol asignado", true, res);
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

    return responseService(201, null, "El usuario fue editato correctamente", false, res);

  } catch (err) {
    console.error('Error al editar el usuario:', err);
    return responseService(500, null, "Error al editar el usuario", true, res);
  }
}


export async function EditarUsuarioApp(req:Request, res: Response) {
  const data = req.body;
  const userData = JSON.parse((req.headers.datos) as string ) as DatosJwt;
  if ( !data.nombres || !data.apellidos || !data.telefono) {
    return responseService(400, null, "Error, falta uno de los parametros", true, res);
  }

  try {
      data.id_usuario = userData.id_usuario;
// Llamar al procedimiento almacenado
      const query = `CALL sp_editar_usuario_app($1);`;
      const values = [JSON.stringify(data)];

      await dbPool.query(query, values);

      // Responder al cliente

      const result = await dbPool.query('SELECT * FROM tbv_usuarios WHERE id_usuario  = $1', [userData.id_usuario]);

      const usuario = result.rows[0];
      console.log(usuario);
      const datos = {
        id_user: usuario.id_usuario,
        name : usuario.nombres,
        lastName: usuario.apellidos,
        email:  usuario.correo,
        phone: usuario.telefono,
        photo: usuario.imagen, 
        token: usuario.session_token
      }
      
      return responseService(200,datos , "Proceso exitoso", false, res);

  } catch (error) {
    console.error('Error al editar el usuario:', error);
    return responseService(500, null, "Error al editar el usuario", true, res);
  }

}

export async function EliminarUsuario(req: Request, res: Response) {

  const { id_usuario } = req.params;

  if (!id_usuario) {
    return responseService(400, null, "Error al eliminar el usuario, no se proporciono el ID", true, res);
  }

  try {
    await dbPool.query('DELETE FROM usuarios WHERE id_usuario = $1', [id_usuario]);

    return responseService(200, null, "Usuario eliminado correctamente", false, res);

  } catch (err) {
    console.error('Error al eliminar el usuario:', err);
    return responseService(500, null, "Error al tratar de eliminar el usuario", true, res);
  
  }
}


export async function SubirImagenUsuario(req: Request, res: Response) {
  if (!req.file) {
    return responseService(400, null, "Error, no se proporciono una imagen", true, res);
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
      
      return responseService(500, null, "Error al tratar de subir la imagen", true, res);
      
    });

    blobStream.on('finish', async () => {
      const public_url = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

      return responseService(200, { image_url: public_url }, "Imagen cargada con exito", false, res);

    });

    blobStream.end(buffer);
  } catch (err) {
    console.error('Error interno al subir la imagen:', err);

    responseService(500, null, "Error interno al subir la imagen", true, res);
    
  }
}

export async function ListaRoles(req: Request, res: Response) {
  try {
    const result = await dbPool.query('SELECT * FROM roles');

    const roles = result.rows
    return responseService(200, roles, "Lista de Roles Obtenida", false, res );

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
    });
  }
}

export async function cambiarContrasena(req: Request, res: Response){
  const body = req.body;
  const datos = JSON.parse((req.headers.datos) as string ) as DatosJwt;
    
  try {
    const oldPassword = body.oldPassword;
    const newPassword = body.newPassword;
    const result = await dbPool.query('SELECT * FROM tbv_usuarios WHERE correo = $1', [datos.email]);
    const usuario = result.rows[0];
    const isPassword_valid = await bcrypt.compare(oldPassword, usuario.password);
    if (!isPassword_valid) {
      return responseService(400, null, "La contraseña no es correcta", true, res);
    }

    
    usuario.password = await bcrypt.hash(newPassword, 10);

    const query = `CALL sp_cambiar_contrasena($1, $2);`;
    const values = [datos.email, usuario.password];
    await dbPool.query(query, values);

    return responseService(200, null, 'Contraseña cambiada exitosamente', false, res);
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);

    return responseService(500, null, 'Ocurrio un error en el servidor', true, res);
  }
}

