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



INSERT INTO categorias_especies(nombre_categoria) 
VALUES 
('Mamíferos'),
('Aves'),
('Reptiles'),
('Anfibios'),
('Insectos')
;


INSERT INTO especies (nombre_comun, nombre_cientifico, id_categoria_especies, imagen)
VALUES 
-- Mamíferos
('Jaguar', 'Panthera onca', 1, ''),
('Mono aullador', 'Alouatta palliata', 1, ''),
('Mono capuchino', 'Cebus capucinus', 1, ''),
('Saíno', 'Pecari tajacu', 1, ''),
('Venado cola blanca', 'Odocoileus virginianus', 1, ''),
('Oso hormiguero gigante', 'Myrmecophaga tridactyla', 1, ''),
('Armadillo de nueve bandas', 'Dasypus novemcinctus', 1, ''),
('Zorro cangrejero', 'Cerdocyon thous', 1, ''),
('Tigrillo', 'Leopardus pardalis', 1, ''),
('Murciélago frugívoro', 'Artibeus jamaicensis', 1, ''),
('Murciélago nectarívoro', 'Glossophaga soricina', 1, ''),

-- Aves
('Papagayo de Guayaquil', 'Ara ambiguus guayaquilensis', 2, ''),
('Gavilán dorsigrís', 'Leucopternis occidentalis', 2, ''),
('Jilguero azafranado', 'Carduelis siemiradzkii', 2, ''),
('Perico de El Oro', 'Pyrrhura orcesi', 2, ''),
('Loro cabeciazul', 'Pionus menstruus', 2, ''),
('Colibrí amazilia', 'Amazilia amazilia', 2, ''),
('Búho de anteojos', 'Pulsatrix perspicillata', 2, ''),
('Tucán del Chocó', 'Ramphastos brevis', 2, ''),
('Pájaro carpintero de Guayaquil', 'Campephilus gayaquilensis', 2, ''),
('Tangara azuleja', 'Thraupis episcopus', 2, ''),

-- Reptiles
('Iguana verde', 'Iguana iguana', 3, ''),
('Boa esmeralda', 'Corallus batesii', 3, ''),
('Lagartija de lava', 'Microlophus occipitalis', 3, ''),
('Caimán de anteojos', 'Caiman crocodilus', 3, ''),
('Tortuga mordedora', 'Chelydra acutirostris', 3, ''),
('Serpiente coral falsa', 'Lampropeltis triangulum', 3, ''),
('Gecko casero tropical', 'Hemidactylus mabouia', 3, ''),
('Anolis de cabeza azul', 'Anolis gemmosus', 3, ''),

-- Anfibios
('Rana de cristal reticulada', 'Hyalinobatrachium fleischmanni', 4, ''),
('Sapo espinoso', 'Rhinella horribilis', 4, ''),
('Rana marsupial andina', 'Gastrotheca riobambae', 4, ''),
('Rana arborícola de ojos rojos', 'Agalychnis callidryas', 4, ''),
('Salamandra ecuatoriana', 'Bolitoglossa equatoriana', 4, ''),
('Rana punta de flecha', 'Epipedobates anthonyi', 4, ''),

-- Insectos
('Mariposa morfo azul', 'Morpho peleides', 5, ''),
('Escarabajo Hércules', 'Dynastes hercules', 5, ''),
('Hormiga bala', 'Paraponera clavata', 5, ''),
('Libélula gigante', 'Megaloprepus caerulatus', 5, ''),
('Mariposa búho', 'Caligo eurilochus', 5, ''),
('Escarabajo joya', 'Chrysina gloriosa', 5, ''),
('Abeja de orquídea', 'Euglossa dilemma', 5, ''),
('Grillo de matorral', 'Gryllus assimilis', 5, '');
