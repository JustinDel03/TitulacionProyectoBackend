CREATE OR REPLACE PROCEDURE sp_crear_alerta(IN data_alerta, OUT new_id INTEGER JSON)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO alertas (
        id_tipo_alerta,
        id_usuario,
        id_sendero,
        id_estado,
        coordenada_longitud,
        coordenada_latitud,
        imagen_1,
        imagen_2,
        imagen_3,
        descripcion,
        fecha_creado
    ) VALUES (
        (data_alerta->>'id_tipo_alerta')::BIGINT,
        (data_alerta->>'id_usuario')::BIGINT,
        (data_alerta->>'id_sendero')::BIGINT,
        (data_alerta->>'id_estado')::BIGINT,
        (data_alerta->>'coordenada_longitud')::DECIMAL,
        (data_alerta->>'coordenada_latitud')::DECIMAL,
        data_alerta->>'imagen_1',
        data_alerta->>'imagen_2',
        data_alerta->>'imagen_3',
        data_alerta->>'descripcion',
        NOW()
    )
    RETURNING id_alerta INTO new_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_crear_usuario(
    p_datos JSONB
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO usuarios (
        id_rol,
        nombres,
        apellidos,
        correo,
        password,
        telefono,
        imagen,
		bloqueado,
        fecha_creado,
        fecha_modificado
    )
    VALUES (
        (p_datos->>'id_rol')::INTEGER,
        p_datos->>'nombres',
        p_datos->>'apellidos',
        p_datos->>'correo',
        p_datos->>'password',
        NULLIF(p_datos->>'telefono', ''),
        NULLIF(p_datos->>'imagen', ''),
		(p_datos->>'bloqueado')::BOOLEAN,
        NOW(),
        NOW()
    );
END;
$$;

CREATE OR REPLACE PROCEDURE sp_editar_usuario(IN p_datos JSONB)
LANGUAGE plpgsql
AS $$
DECLARE
	p_id_usuario BIGINT;
    v_password_actual TEXT;
BEGIN
	p_id_usuario := (p_datos->>'id_usuario')::BIGINT;
    -- Obtener la contraseña actual solo si no se envía en el JSONB
    IF NOT p_datos ? 'password' OR p_datos->>'password' IS NULL OR TRIM(p_datos->>'password') = '' THEN
        SELECT password INTO v_password_actual FROM usuarios WHERE id_usuario = p_id_usuario;
    ELSE
        v_password_actual := p_datos->>'password';
    END IF;

    UPDATE usuarios
    SET 
        id_rol = COALESCE(NULLIF(p_datos->>'id_rol', '')::BIGINT, id_rol),
        nombres = COALESCE(NULLIF(p_datos->>'nombres', ''), nombres),
        apellidos = COALESCE(NULLIF(p_datos->>'apellidos', ''), apellidos),
        correo = COALESCE(NULLIF(p_datos->>'correo', ''), correo),
        password = v_password_actual,
        bloqueado = COALESCE(NULLIF(p_datos->>'bloqueado', '')::BOOLEAN, bloqueado),
        fecha_modificado = NOW()
    WHERE id_usuario = p_id_usuario;
END;
$$;
 

CREATE OR REPLACE PROCEDURE sp_editar_usuario_app(IN p_datos JSONB)
LANGUAGE plpgsql
AS $$
DECLARE
    p_id_usuario BIGINT;
BEGIN
    p_id_usuario := (p_datos->>'id_usuario')::BIGINT;

    UPDATE usuarios
    SET 
        nombres = COALESCE(NULLIF(p_datos->>'nombres', ''), nombres),
        apellidos = COALESCE(NULLIF(p_datos->>'apellidos', ''), apellidos),
        telefono = COALESCE(NULLIF(p_datos->>'telefono', ''), telefono),
        fecha_modificado = NOW()
    WHERE id_usuario = p_id_usuario;
END;
$$;


CREATE OR REPLACE PROCEDURE sp_cambiar_contrasena(
    user_email TEXT, -- Puede ser correo o id_usuario
    new_password TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
    -- Actualizar la contraseña directamente
    UPDATE usuarios
    SET 
        password = new_password, -- La contraseña ya viene cifrada
        fecha_modificado = NOW() -- Actualiza la fecha de modificación
    WHERE 
        correo = user_email;

    -- Verificar si se actualizó al menos un registro
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuario no encontrado.';
    END IF;
END;
$$;
CREATE OR REPLACE PROCEDURE public.sp_crear_alerta(
	IN data_alerta json,
	OUT new_id integer)
LANGUAGE 'plpgsql'
AS $$
BEGIN
    INSERT INTO alertas (
        id_tipo_alerta,
        id_usuario,
        id_sendero,
        id_estado,
        coordenada_longitud,
        coordenada_latitud,
        imagen_1,
        imagen_2,
        imagen_3,
        descripcion,
        fecha_creado
    ) VALUES (
        (data_alerta->>'id_tipo_alerta')::BIGINT,
        (data_alerta->>'id_usuario')::BIGINT,
        (data_alerta->>'id_sendero')::BIGINT,
        (data_alerta->>'id_estado')::BIGINT,
        (data_alerta->>'coordenada_longitud')::DECIMAL,
        (data_alerta->>'coordenada_latitud')::DECIMAL,
        data_alerta->>'imagen_1',
        data_alerta->>'imagen_2',
        data_alerta->>'imagen_3',
        data_alerta->>'descripcion',
        (data_alerta->>'fecha_creado')::TIMESTAMP
    )
    RETURNING id_alerta INTO new_id;
END;
$$



CREATE OR REPLACE PROCEDURE sp_buscar_observaciones(
    IN busqueda TEXT,
    OUT resultado JSON
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Consulta para buscar coincidencias en nombre_comun o nombre_cientifico
    SELECT json_agg(t)
    INTO resultado
    FROM (
        SELECT 
            o.id_observacion,
            o.estado,
            e.nombre_comun,
            e.nombre_cientifico,
            o.nombre_sendero,
            (u.nombres || ' ' || u.apellidos) AS usuario,
            o.fecha_observacion,
            o.coordenada_longitud,
            o.coodernada_latitud,
            o.descripcion
        FROM observacion o
        JOIN especies e ON o.id_especie = e.id_especie
        JOIN usuarios u ON o.id_usuario = u.id_usuario
        WHERE 
            e.nombre_comun ILIKE '%' || busqueda || '%' 
            OR e.nombre_cientifico ILIKE '%' || busqueda || '%'
    ) t;

    -- Si no hay resultados, retornar un mensaje vacío
    IF resultado IS NULL THEN
        resultado := '[]'::JSON;
    END IF;
END;
$$;
 

CREATE OR REPLACE PROCEDURE sp_crear_observacion(
	IN data_observacion json,
	OUT new_id integer)
LANGUAGE 'plpgsql'
AS $$
BEGIN
    INSERT INTO observaciones (
        id_especie,
        id_usuario,
        id_sendero,
	    descripcion,
		fecha_observacion,
        coordenada_longitud,
        coordenada_latitud,
		estado,
        imagen_1,
		imagen_2,
		imagen_3,
        fecha_creado,
		fecha_modificado
    ) VALUES (
        (data_observacion->>'id_especie')::BIGINT,
        (data_observacion->>'id_usuario')::BIGINT,
        (data_observacion->>'id_sendero')::BIGINT,
        (data_observacion->>'descripcion'),
        (data_observacion->>'fecha_observacion')::TIMESTAMP,
        (data_observacion->>'coordenada_longitud')::DECIMAL,
        (data_observacion->>'coordenada_latitud')::DECIMAL,
		(data_observacion->>'estado')::BOOLEAN,
		(data_observacion->>'imagen_1'),
	    NOW(),
		NOW()
    )
    RETURNING id_observacion INTO new_id;
END;
$$;


CREATE OR REPLACE FUNCTION buscar_alertas(
    p_id_usuario INTEGER,
    p_id_estado INTEGER DEFAULT NULL
)
RETURNS TABLE(
    id_alerta BIGINT,
    tipo_alerta VARCHAR,
    nivel_prioridad INTEGER,
    icono_alerta TEXT,
    usuario VARCHAR,  -- Aseguramos que sea VARCHAR
    nombre_sendero VARCHAR,
    nombre_estado VARCHAR,
    coordenada_longitud NUMERIC,
    coordenada_latitud NUMERIC,
    imagen_1 TEXT,
    imagen_2 TEXT,
    imagen_3 TEXT,
    descripcion TEXT,
    fecha_creado TIMESTAMP,
    id_estado BIGINT
)
AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id_alerta,
        b.tipo_alerta,
        b.nivel_prioridad,
        b.icono_alerta,
        (c.nombres || ' ' || c.apellidos)::VARCHAR AS usuario,  -- Convertimos explícitamente a VARCHAR
        d.nombre_sendero,
        e.nombre_estado,
        a.coordenada_longitud,
        a.coordenada_latitud,
        a.imagen_1,
        a.imagen_2,
        a.imagen_3,
        a.descripcion,
        a.fecha_creado,
        a.id_estado
    FROM
        alertas a
    JOIN tipos_alerta b ON a.id_tipo_alerta = b.id_tipo_alerta
    JOIN usuarios c ON a.id_usuario = c.id_usuario
    JOIN senderos d ON a.id_sendero = d.id_sendero
    JOIN estados_alerta e ON a.id_estado = e.id_estado_alerta
    WHERE
        (p_id_usuario IS NULL OR a.id_usuario = p_id_usuario)
        AND (p_id_estado IS NULL OR a.id_estado <> p_id_estado);
END;
$$ LANGUAGE plpgsql;


-- FUNCTION: public.buscar_observaciones_estado(boolean, integer)

-- DROP FUNCTION IF EXISTS public.buscar_observaciones_estado(boolean, integer);

CREATE OR REPLACE FUNCTION public.buscar_observaciones_estado(
	p_estado boolean DEFAULT NULL::boolean,
	p_id_usuario integer DEFAULT NULL::integer)
    RETURNS TABLE(id_observacion bigint, id_especie bigint, nombre_comun character varying, nombre_cientifico character varying, nombre_categoria character varying, id_usuario bigint, usuario text, id_sendero bigint, nombre_sendero character varying, descripcion text, fecha_observacion timestamp without time zone, coordenada_longitud numeric, coordenada_latitud numeric, estado boolean, imagen_1 text, imagen_2 text, imagen_3 text, fecha_creado timestamp without time zone) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
    RETURN QUERY
    SELECT 
        a.id_observacion,
        a.id_especie,
        b.nombre_comun,
        b.nombre_cientifico,
        e.nombre_categoria,
        a.id_usuario,
        (c.nombres || ' ' || c.apellidos) AS usuario,
        a.id_sendero,
        d.nombre_sendero,
        a.descripcion,
        a.fecha_observacion, -- Aquí sigue siendo TIMESTAMP
        a.coordenada_longitud,
        a.coordenada_latitud,
        a.estado,
        a.imagen_1,
        a.imagen_2,
        a.imagen_3,
        a.fecha_creado
    FROM observaciones a
    JOIN especies b ON a.id_especie = b.id_especie
    JOIN usuarios c ON a.id_usuario = c.id_usuario
    JOIN senderos d ON a.id_sendero = d.id_sendero
    JOIN categorias_especies e ON b.id_categoria_especie = e.id_categoria_especie
    WHERE (p_estado IS NULL OR a.estado = p_estado)
      AND (p_id_usuario IS NULL OR a.id_usuario = p_id_usuario);
END;
$BODY$;

ALTER FUNCTION public.buscar_observaciones_estado(boolean, integer)
    OWNER TO postgres;



CREATE OR REPLACE FUNCTION fn_buscar_observaciones(busqueda TEXT)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    resultado JSON;
BEGIN
    -- Consulta para buscar coincidencias
    SELECT json_agg(t)
    INTO resultado
    FROM (
        SELECT 
            o.id_observacion,
            o.estado,
            e.nombre_comun,
            e.nombre_cientifico,
            s.nombre_sendero,
            (u.nombres || ' ' || u.apellidos) AS usuario,
            o.fecha_observacion,
            o.coordenada_longitud,
            o.coordenada_latitud,
            o.descripcion
        FROM observaciones o
		JOIN senderos s ON o.id_sendero = s.id_sendero
        JOIN especies e ON o.id_especie = e.id_especie
        JOIN usuarios u ON o.id_usuario = u.id_usuario
		
        WHERE 
            e.nombre_comun ILIKE '%' || busqueda || '%' 
            OR e.nombre_cientifico ILIKE '%' || busqueda || '%'
    ) t;

    -- Si no hay resultados, retornar un mensaje vacío
    IF resultado IS NULL THEN
        RETURN '[]'::JSON;
    END IF;

    RETURN resultado;
END;
$$;
