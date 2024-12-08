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