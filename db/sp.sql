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