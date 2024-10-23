import { Request, Response } from 'express';
import { poolLocalS } from '../db';
import bcrypt from 'bcrypt';

export async function ListaUsuario(req: Request, res: Response) {
  try {
    const result = await poolLocalS.query('SELECT * FROM tbv_usuario_menu');

    const usuarios = result.rows;

    res.status(200).json({
      status: true,
      msg: 'Usuarios obtenidos',
      value: usuarios
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      status: false,
      msg: 'Error interno del servidor',
    });
  }
}

export async function ListaUsuarioMenu(req: Request, res: Response) {
  const { correo } = req.query;

  if (!correo) {
    return res.status(400).json({
      status: false,
      msg: 'idUsuario es requerido',
      value: null
    });
  }

  try {
    const result = await poolLocalS.query('SELECT * FROM tbv_usuario_menu WHERE correo = $1', [correo]);

    const menu = result.rows.map(row => {
      return {
        menuId: row.id_menu,
        nombreMenu: row.nombre_menu,
        icono: row.icono,
        url: row.url,
        correo: row.correo
      };
    });


    res.status(200).json({
      status: true,
      msg: 'Lista de Menús obtenida',
      value: menu
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      status: false,
      msg: 'Error interno del servidor',
    });
  }
}

export async function IniciarSesion(req: Request, res: Response) {
  const { correo, password } = req.body;

  console.log('correo y clave', correo, password);

  if (!correo || !password) {
    return res.status(400).json({
      status: false,
      msg: 'nombreUsuario y clave son requeridos',
    });
  }

  try {
    const result = await poolLocalS.query('SELECT * FROM tbv_usuarios WHERE correo = $1', [correo]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: false,
        msg: 'Credenciales inválidas',
      });
    }

    const usuario = result.rows[0];

    // Comparar la contraseña encriptada usando bcrypt
    const isPasswordValid = await bcrypt.compare(password, usuario.password);

    if (isPasswordValid) {
      res.status(200).json({
        status: true,
        msg: 'Usuario autenticado exitosamente',
        value: usuario
      });
    } else {
      res.status(401).json({
        status: false,
        msg: 'Credenciales inválidas',
      });
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      status: false,
      msg: 'Error interno del servidor',
    });
  }
}

export async function CrearUsuario(req: Request, res: Response) {
  const { id_rol, nombre, correo, password, telefono, imagen } = req.body;

  if (!id_rol || !nombre || !correo || !password) {
    return res.status(400).json({
      status: false,
      msg: 'Faltan datos requeridos',
    });
  }

  try {
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO usuarios (id_rol, nombre, correo, password, telefono, imagen, fecha_creado, fecha_modificado)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id_usuario;
    `;

    const values = [id_rol, nombre, correo, hashedPassword, telefono, imagen];

    const result = await poolLocalS.query(query, values);

    const newUserId = result.rows[0].id_usuario;

    res.status(201).json({
      status: true,
      msg: 'Usuario creado exitosamente',
      value: {
        id_usuario: newUserId,
        id_rol,
        nombre,
        correo,
        telefono,
        imagen,
        creado: new Date(),
        modificado: new Date()
      }
    });
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).json({
      status: false,
      msg: 'Error interno del servidor',
    });
  }
}
