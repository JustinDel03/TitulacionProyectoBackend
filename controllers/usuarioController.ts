import { Request, Response } from 'express';
import { dbPool } from '../db';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { bucket } from '../config/firebase';

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
  const { correo } = req.query;
  const { tipo_sesion } = req.query;

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

  if (!correo || !password) {
    return res.status(400).json({
      error: true,
      message: 'Correo y contraseña son requeridos',
    });
  }

  try {
    const result = await dbPool.query('SELECT * FROM tbv_usuarios WHERE correo = $1', [correo]);

    if (result.rowCount === 0) {
      return res.status(401).json({
        error: true,
        message: 'Credenciales inválidas',
      });
    }

    const usuario = result.rows[0];
    const isPassword_valid = await bcrypt.compare(password, usuario.password);

    if (!isPassword_valid) {
      return res.status(401).json({
        error: true,
        message: 'Credenciales inválidas',
      });
    }

    // Generar un nuevo token de sesión
    const session_token = crypto.randomBytes(32).toString('hex');
    await dbPool.query(
      'UPDATE usuarios SET session_token = $1, fecha_token = NOW() WHERE correo = $2',
      [session_token, correo]
    );

    res.status(200).json({
      error: false,
      message: 'Usuario autenticado exitosamente',
      data: usuario

    });
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