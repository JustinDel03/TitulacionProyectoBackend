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
        r.nombre AS nombre_rol
    FROM usuarios u
        JOIN roles r ON u.id_rol = r.id_rol;




CREATE VIEW tbv_alertas AS
 SELECT a.id_alerta,
	a.id_tipo_alerta,
    b.tipo_alerta,
    b.nivel_prioridad,
    b.icono_alerta,
    c.id_usuario,
    (c.nombres::text || ' '::text) || c.apellidos::text AS usuario,
    d.nombre_sendero,
    e.nombre_estado,
    a.coordenada_longitud,
    a.coordenada_latitud,
    a.imagen_1,
    a.imagen_2,
    a.imagen_3,
    a.descripcion,
    a.fecha_creado
   FROM alertas a
     JOIN tipos_alerta b ON a.id_tipo_alerta = b.id_tipo_alerta
     JOIN usuarios c ON a.id_usuario = c.id_usuario
     JOIN senderos d ON a.id_sendero = d.id_sendero
     JOIN estados_alerta e ON a.id_estado = e.id_estado_alerta;




CREATE OR REPLACE VIEW public.tbv_observaciones
 AS
 SELECT o.id_observacion,
    o.id_especie,
    e.nombre_comun,
    e.nombre_cientifico,
    ce.nombre_categoria,
    o.id_usuario,
    (u.nombres::text || ' '::text) || u.apellidos::text AS usuario,
    o.id_sendero,
    s.nombre_sendero,
    o.descripcion,
    o.fecha_observacion,
    o.coordenada_longitud,
    o.coordenada_latitud,
    o.id_estado,
	eo.nombre_estado,
    o.imagen_1,
    o.imagen_2,
    o.imagen_3,
    o.fecha_creado,
	o.fecha_modificado
   FROM observaciones o
     LEFT JOIN especies e ON o.id_especie = e.id_especie
     LEFT JOIN usuarios u ON o.id_usuario = u.id_usuario
     LEFT JOIN senderos s ON o.id_sendero = s.id_sendero
     LEFT JOIN categorias_especies ce ON e.id_categoria_especie = ce.id_categoria_especie
	 LEFT JOIN estados_observacion eo ON o.id_estado = eo.id_estado_observacion;
ALTER TABLE public.tbv_observaciones
    OWNER TO postgres;


CREATE OR REPLACE VIEW public.tbv_last_observations
 AS
 SELECT a.id_observacion,
    a.id_especie,
    b.nombre_comun,
    b.nombre_cientifico,
    e.nombre_categoria,
    a.id_usuario,
    (c.nombres::text || ' '::text) || c.apellidos::text AS usuario,
    a.id_sendero,
    d.nombre_sendero,
    a.descripcion,
    a.fecha_observacion,
    a.coordenada_longitud,
    a.coordenada_latitud,
    a.id_estado,
	f.nombre_estado,
    a.imagen_1,
    a.imagen_2,
    a.imagen_3,
    a.fecha_creado
   FROM observaciones a
     JOIN especies b ON a.id_especie = b.id_especie
     JOIN usuarios c ON a.id_usuario = c.id_usuario
     JOIN senderos d ON a.id_sendero = d.id_sendero
     JOIN categorias_especies e ON b.id_categoria_especie = e.id_categoria_especie
	 JOIN estados_observacion f ON a.id_estado = f.id_estado_observacion
  WHERE a.id_estado = 2;

ALTER TABLE public.tbv_last_observations
    OWNER TO postgres;


CREATE VIEW tbv_tipo_alertas AS
SELECT 
	id_tipo_alerta,
	tipo_alerta,
	nivel_prioridad,
	icono_alerta
FROM 
	tipos_alerta;


CREATE VIEW tbv_sendero AS
SELECT 
	id_sendero,
	id_organización,
	nombre_sendero
FROM 
	senderos;


CREATE OR REPLACE VIEW tbv_especies
 AS
 SELECT e.id_especie,
    e.nombre_comun,
    e.nombre_cientifico,
    e.id_categoria_especie,
    c.nombre_categoria,
    e.imagen,
    e.fecha_creado,
    e.fecha_modificado
   FROM especies e
     JOIN categorias_especies c ON e.id_categoria_especie = c.id_categoria_especie;



CREATE OR REPLACE VIEW public.tbv_observaciones_alertas_usuarios
 AS
 SELECT u.id_usuario,
    (u.nombres::text || ' '::text) || u.apellidos::text AS nombre_completo,
    u.correo,
    u.telefono,
    COALESCE(json_agg(json_build_object('id_observacion', o.id_observacion, 'especie', json_build_object('id_especie', e.id_especie, 'nombre_comun', e.nombre_comun, 'nombre_cientifico', e.nombre_cientifico), 'sendero', json_build_object('id_sendero', s.id_sendero, 'nombre_sendero', s.nombre_sendero), 'descripcion', o.descripcion, 'coordenadas', json_build_object('longitud', o.coordenada_longitud, 'latitud', o.coordenada_latitud), 'nombre_estado_observacion', eo.nombre_estado, 'imagenes', ARRAY[o.imagen_1, o.imagen_2, o.imagen_3], 'fecha_observacion', o.fecha_observacion)) FILTER (WHERE o.id_observacion IS NOT NULL), '[]'::json) AS observaciones,
    COALESCE(json_agg(json_build_object('id_alerta', a.id_alerta, 'tipo_alerta', json_build_object('id_tipo_alerta', ta.id_tipo_alerta, 'tipo_alerta', ta.tipo_alerta, 'nivel_prioridad', ta.nivel_prioridad),'nombre_estado_alerta', ea.nombre_estado, 'sendero', json_build_object('id_sendero', s2.id_sendero, 'nombre_sendero', s2.nombre_sendero), 'coordenadas', json_build_object('longitud', a.coordenada_longitud, 'latitud', a.coordenada_latitud), 'imagenes', ARRAY[a.imagen_1, a.imagen_2, a.imagen_3], 'descripcion', a.descripcion, 'fecha_creado', a.fecha_creado)) FILTER (WHERE a.id_alerta IS NOT NULL), '[]'::json) AS alertas
   FROM usuarios u
     LEFT JOIN observaciones o ON u.id_usuario = o.id_usuario
     LEFT JOIN especies e ON o.id_especie = e.id_especie
     LEFT JOIN senderos s ON o.id_sendero = s.id_sendero
     LEFT JOIN alertas a ON u.id_usuario = a.id_usuario
     LEFT JOIN tipos_alerta ta ON a.id_tipo_alerta = ta.id_tipo_alerta
     LEFT JOIN senderos s2 ON a.id_sendero = s2.id_sendero
	 LEFT JOIN estados_observacion eo ON a.id_estado = eo.id_estado_observacion 
	 LEFT JOIN estados_alerta ea ON a.id_estado = ea.id_estado_alerta 
  GROUP BY u.id_usuario, u.nombres, u.apellidos, u.correo, u.telefono;

ALTER TABLE public.tbv_observaciones_alertas_usuarios
    OWNER TO postgres;


CREATE OR REPLACE VIEW public.vw_buscar_observaciones
 AS
 SELECT a.id_observacion,
    a.id_especie,
    b.nombre_comun,
    b.nombre_cientifico,
    e.nombre_categoria,
    a.id_usuario,
    (c.nombres::text || ' '::text) || c.apellidos::text AS usuario,
    a.id_sendero,
    d.nombre_sendero,
    a.descripcion,
    a.fecha_observacion,
    a.coordenada_longitud,
    a.coordenada_latitud,
    a.id_estado,
	eo.nombre_estado,
    a.imagen_1,
    a.imagen_2,
    a.imagen_3,
    a.fecha_creado
   FROM observaciones a
     JOIN especies b ON a.id_especie = b.id_especie
     JOIN usuarios c ON a.id_usuario = c.id_usuario
     JOIN senderos d ON a.id_sendero = d.id_sendero
     JOIN categorias_especies e ON b.id_categoria_especie = e.id_categoria_especie
	 JOIN estados_observacion eo ON a.id_estado = eo.id_estado_observacion;

ALTER TABLE public.vw_buscar_observaciones
    OWNER TO postgres;
