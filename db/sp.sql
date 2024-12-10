CREATE OR REPLACE PROCEDURE insertar_alerta(IN data_alerta JSON)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO alertas (
        id_tipo_alerta,
        id_usuario,
        id_organizacion,
        id_estado,
        coordenada_longitud,
        coordenada_latitud,
        imagen,
        descripcion,
        fecha_creado
    ) VALUES (
        (data_alerta->>'idTipoAlerta')::BIGINT,
        (data_alerta->>'idUsuario')::BIGINT,
        (data_alerta->>'idOrganizacion')::BIGINT,
        (data_alerta->>'idEstado')::BIGINT,
        (data_alerta->>'coordenadaLongitud')::DECIMAL,
        (data_alerta->>'coordenadaLatitud')::DECIMAL,
        data_alerta->>'imagen',
        data_alerta->>'descripcion',
        NOW()
    );
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