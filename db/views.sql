CREATE VIEW tbv_usuario_menu AS
    SELECT b.id_menu,
        c.nombre AS nombre_menu,
        d.nombre AS nombre_rol,
        c.icono,
        c.url,
        a.correo,
		e.tipo_sesion
    FROM usuarios a
        JOIN menu_roles b ON a.id_rol = b.id_rol
        JOIN menus c ON b.id_menu = c.id_menu
        JOIN roles d ON a.id_rol = d.id_rol
		JOIN tipos_sesion e ON c.id_tipo_sesion = e.id_tipo_sesion
	WHERE c.disponible = true;


CREATE VIEW tbv_usuarios AS
    SELECT u.id_usuario,
        u.id_rol,
        u.nombres,
		u.apellidos,
        u.correo,
        u.password, 
        u.telefono,
        u.imagen,
        u.session_token,
		u.bloqueado,
        u.fecha_creado,
        u.fecha_modificado,
        r.nombre AS nombre_rol
    FROM usuarios u
        JOIN roles r ON u.id_rol = r.id_rol;




CREATE VIEW tbv_alertas AS
SELECT
	a.id_alerta,
	b.tipo_alerta,
	b.nivel_prioridad,
	b.icono_alerta,
	(c.nombres ||' '|| c. apellidos) AS usuario,
	d.nombre_organizacion,
	e.nombre_estado,
	a.coordenada_longitud,
	a.coordenada_latitud,
	a.imagen,
	a.descripcion,
	a.fecha_creado

FROM
	alertas a
JOIN tipos_alerta b ON a.id_tipo_alerta = b.id_tipo_alerta
JOIN usuarios c ON a.id_usuario = c.id_usuario
JOIN organizaciones d ON a.id_organizacion = d.id_organizacion
JOIN estados_alerta e ON a.id_estado = e.id_estado_alerta;
