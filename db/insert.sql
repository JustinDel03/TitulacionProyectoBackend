INSERT INTO roles(nombre) Values ('Administrador');
INSERT INTO roles(nombre) Values ('Usuario');



INSERT INTO tipos_alerta(
				tipo_alerta, 
				nivel_prioridad,
				icono_alerta)
		VALUES (
				'INCENDIO',
				2,
				'ICON');
INSERT INTO tipos_alerta(
				tipo_alerta, 
				nivel_prioridad,
				icono_alerta)
		VALUES (
				'CONTAMINACION',
				0,
				'ICON');
				INSERT INTO tipos_alerta(
				tipo_alerta, 
				nivel_prioridad,
				icono_alerta)
		VALUES (
				'TALA ILEGAL',
				1,
				'ICON');


INSERT INTO organizaciones(
							nombre_organizacion,
							telefono,
							correo,
							direccion,
							coordenada_longitud,
							coordenada_latitud
							)
		VALUES(
				'CERRO BLANCO',
				'0999 919 619',
				'bosquecerroblanco@gmail.com',
				'Km: 16 de la vía Guayaquil – Salinas, frente a la Unidad Educativa John Harvard',
				-2.1822956312304975, 
				-80.01669489330831
				)


------------------------
INSERT INTO senderos
					(
					id_organizacion,
					nombre_sendero,
					distancia_km,
					tiempo_sendero,
					dificultad,
					guia
					)
	VALUES(
			1,
			'BUENA VISTA',
			1.0,
			'01:00:00',
			'BAJA',
			true
    );
INSERT INTO senderos
					(
					id_organizacion,
					nombre_sendero,
					distancia_km,
					tiempo_sendero,
					dificultad,
					guia
					)
	VALUES(
			1,
			'CANOA',
			1.2,
			'02:00:00',
			'BAJA - MEDIA',
			true
			);
INSERT INTO senderos
					(
					id_organizacion,
					nombre_sendero,
					distancia_km,
					tiempo_sendero,
					dificultad,
					guia
					)
	VALUES(
			1,
			'HIGUERÓN',
			3.0,
			'03:00:00',
			'MEDIA - ALTA',
			true
			);
INSERT INTO senderos
					(
					id_organizacion,
					nombre_sendero,
					distancia_km,
					tiempo_sendero,
					dificultad,
					guia
					)
	VALUES(
			1,
			'MONO AULLADOR',
			6.5,
			'05:00:00',
			'ALTA',
			true
			);


INSERT INTO estados_alerta(
nombre_estado
)VALUES('ENVIADA');
INSERT INTO estados_alerta(
nombre_estado
)VALUES('EN ATENCIÓN');
INSERT INTO estados_alerta(
nombre_estado
)VALUES('CERRADA');