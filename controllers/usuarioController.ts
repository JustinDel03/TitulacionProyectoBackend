import { Request, Response } from 'express';
import { dbPool } from '../db';
import bcrypt from 'bcrypt';


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

  if (!correo) {
    return res.status(400).json({
      error: true,
      message: 'idUsuario es requerido'
    });
  }

  try {
    const result = await dbPool.query('SELECT * FROM tbv_usuario_menu WHERE correo = $1', [correo]);

    
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

  console.log('correo y clave', correo, password);

  if (!correo || !password) {
    return res.status(400).json({
      error: true,
      message: 'nombreUsuario y clave son requeridos',
    });
  }

  try {
    const result = await dbPool.query('SELECT * FROM tbv_usuarios WHERE correo = $1', [correo]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: true,
        message: 'Credenciales inválidas',
      });
    }

    const usuario = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, usuario.password);

    if (isPasswordValid) {
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
          sessionToken: usuario.session_token,
          refreshToken: usuario.refresh_token
        }
      });
    } else {
      res.status(401).json({
        error: true,
        message: 'Credenciales inválidas',
      });
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      error: true,
      message: 'Error interno del servidor',
    });
  }
}

export async function CrearUsuario(req: Request, res: Response) {
  const { id_rol, nombres, apellidos, correo, password, telefono, imagen } = req.body;

  if (!id_rol || !nombres || !apellidos || !correo || !password) {
    return res.status(400).json({
      error: true,
      message: 'Faltan datos requeridos',
    });
  }

  try {
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO usuarios (id_rol, nombres, apellidos, correo, password, telefono, imagen, fecha_creado, fecha_modificado)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id_usuario;
    `;

    const values = [id_rol, nombres, apellidos, correo, hashedPassword, telefono, imagen];

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
