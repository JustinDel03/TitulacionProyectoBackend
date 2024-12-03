CREATE VIEW tbv_usuario_menu AS
    SELECT b.id_menu,
        c.nombre AS nombre_menu,
        d.nombre AS nombre_rol,
        c.icono,
        c.url,
        a.correo
    FROM usuarios a
        JOIN menu_roles b ON a.id_rol = b.id_rol
        JOIN menus c ON b.id_menu = c.id_menu
        JOIN roles d ON a.id_rol = d.id_rol;



CREATE VIEW tbv_usuarios AS
    SELECT u.id_usuario,
        u.id_rol,
        u.nombre,
        u.correo,
        u.password,
        u.telefono,
        u.imagen,
        u.session_token,
        u.refresh_token,
        u.fecha_creado,
        u.fecha_modificado,
        r.nombre AS nombre_rol
    FROM usuarios u
        JOIN roles r ON u.id_rol = r.id_rol;