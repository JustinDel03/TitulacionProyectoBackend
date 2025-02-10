-- DROP TABLE IF EXISTS tipos_alerta;
-- CREATE TABLE tipos_alerta (
--     id_tipo_alerta BIGSERIAL PRIMARY KEY,
--     tipo_alerta VARCHAR(255) NOT NULL,
--     nivel_prioridad INT NOT NULL,
--     icono_alerta TEXT,
--     fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
--     fecha_modificado TIMESTAMP
-- );

-- DROP TABLE IF EXISTS estados_alerta; 
-- CREATE TABLE estados_alerta (
--     id_estado_alerta BIGSERIAL PRIMARY KEY,
--     nombre_estado VARCHAR(255) NOT NULL,
--     fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
--     fecha_modificado TIMESTAMP
-- );


-- DROP TABLE IF EXISTS organizaciones;
-- CREATE TABLE organizaciones (
--     id_organizacion BIGSERIAL PRIMARY KEY,
--     nombre_organizacion VARCHAR(255) NOT NULL,
--     telefono VARCHAR(15),
--     correo VARCHAR(255),
--     direccion TEXT,
--     coordenada_longitud DECIMAL(9,6),
--     coordenada_latitud DECIMAL(9,6),
--     fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
--     fecha_modificado TIMESTAMP
-- );


-- DROP TABLE IF EXISTS roles;
-- CREATE TABLE roles (
--     id_rol BIGSERIAL PRIMARY KEY,
--     nombre VARCHAR(180) NOT NULL UNIQUE,
--     fecha_creado TIMESTAMP NOT NULL DEFAULT NOW()
-- );


-- INSERT INTO roles (
-- 	nombre,
-- 	fecha_creado,
-- 	fecha_modificado
-- )
-- VALUES(
-- 	'ADMINISTRADOR',
-- 	'2021-05-22',
-- 	'2021-05-22'
-- );

-- INSERT INTO roles (
-- 	nombre,
-- 	fecha_creado,
-- 	fecha_modificado
-- )

-- VALUES(
-- 	'USUARIO',
-- 	'2021-05-22',
-- 	'2021-05-22'
-- );


-- DROP TABLE IF EXISTS usuarios;
-- CREATE TABLE usuarios (
--     id_usuario BIGSERIAL PRIMARY KEY,
--     id_rol BIGINT NOT NULL REFERENCES roles(id_rol),
--     nombres VARCHAR(255) NOT NULL,
--     apellidos VARCHAR(255) NOT NULL,
--     correo VARCHAR(255) UNIQUE NOT NULL,
--     telefono VARCHAR(10),
--     imagen TEXT,
--     password TEXT,
--     bloqueado BOOLEAN,
--     session_token TEXT,
--     fecha_creado TI MESTAMP DEFAULT NOW(),
--     fecha_modificado TIMESTAMP
-- );

-- DROP TABLE IF EXISTS alertas;
-- CREATE TABLE alertas (
--     id_alerta BIGSERIAL PRIMARY KEY,
--     id_tipo_alerta BIGINT NOT NULL REFERENCES tipos_alerta(id_tipo_alerta),
--     id_usuario BIGINT NOT NULL REFERENCES usuarios(id_usuario),
--     id_estado BIGINT REFERENCES estados_alerta(id_estado_alerta),
--     coordenada_longitud DECIMAL(9,6),
--     coordenada_latitud DECIMAL(9,6),
--     imagen_1 TEXT,
--     imagen_2 TEXT,
--     imagen_3 TEXT,
--     descripcion TEXT,
--     fecha_creado TIMESTAMP NOT NULL DEFAULT NOW()
-- );


-- DROP TABLE IF EXISTS tipos_sesion;
-- CREATE TABLE tipos_sesion (
--     id_tipo_sesion BIGSERIAL PRIMARY KEY,
--     tipo_sesion VARCHAR(20),
--     fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
--     fecha_modificado TIMESTAMP NOT NULL DEFAULT NOW()
-- );


-- DROP TABLE IF EXISTS menus;
-- CREATE TABLE menus (
--     id_menu BIGSERIAL PRIMARY KEY,
--     nombre VARCHAR(255) NOT NULL,
--     icono VARCHAR(255),
--     url VARCHAR(255) NOT NULL,
--     disponible BOOLEAN,
--     id_tipo_sesion BIGINT NOT NULL REFERENCES tipos_sesion(id_tipo_sesion),
--     fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
--     fecha_modificado TIMESTAMP NOT NULL DEFAULT NOW()
-- );


-- DROP TABLE IF EXISTS menu_roles;
-- CREATE TABLE menu_roles (
--     id_menu_rol BIGSERIAL PRIMARY KEY,
--     id_menu BIGINT NOT NULL REFERENCES menus(id_menu),
--     id_rol BIGINT NOT NULL REFERENCES roles(id_rol),
--     disponible BOOLEAN,
--     fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
--     fecha_modificado TIMESTAMP NOT NULL DEFAULT NOW()
-- );


-- DROP TABLE IF EXISTS familias_especies;
-- CREATE TABLE familias_especies (
--     id_familia_especie BIGSERIAL PRIMARY KEY,
--     nombre_cientifico VARCHAR(255) NOT NULL,
--     descripcion TEXT,
--     fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
--     fecha_modificado TIMESTAMP NOT NULL DEFAULT NOW()
-- );


-- DROP TABLE IF EXISTS especies;
-- CREATE TABLE especies (
--     id_especie BIGSERIAL PRIMARY KEY,
--     nombre VARCHAR(255) NOT NULL,
--     categoría VARCHAR(50) NOT NULL,
--     id_familia_especie BIGINT NOT NULL REFERENCES familias_especies(id_familia_especie),
--     imagen TEXT,
--     fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
--     fecha_modificado TIMESTAMP NOT NULL DEFAULT NOW()
-- );

-- DROP TABLE IF EXISTS observacion;
-- CREATE TABLE observacion (
--     id_observacion BIGSERIAL PRIMARY KEY,
--     id_especie BIGINT NOT NULL REFERENCES especies(id_especie),
--     descripción TEXT,
--     fecha_observacion TIMESTAMP NOT NULL,
--     coordenada_longitud DECIMAL(9,6),
--     coordenada_latitud DECIMAL(9,6),
--     estado BOOLEAN,
--     fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
--     fecha_modificado TIMESTAMP NOT NULL DEFAULT NOW()
-- );

-- DROP TABLE IF EXISTS senderos;
-- CREATE TABLE senderos (
--     id_sendero BIGSERIAL PRIMARY KEY,
--     nombre_sendero TEXT,
--     fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
--     fecha_modificado TIMESTAMP NOT NULL DEFAULT NOW()
-- );

-- INSERT INTO senderos (
-- 	nombre_sendero
-- )
-- VALUES(
-- 	'nombre_sendero',
-- 	'Sendero Buena Vista',
-- 	'Sendero Higuerón',
-- 	'Sendero Canoa'
-- );


-- 1. Roles
CREATE TABLE roles (
    id_rol BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(180) NOT NULL UNIQUE,
    fecha_creado TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Tipos de sesión
CREATE TABLE tipos_sesion (
    id_tipo_sesion BIGSERIAL PRIMARY KEY,
    tipo_sesion VARCHAR(20),
    fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_modificado TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. Menús
CREATE TABLE menus (
    id_menu BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    icono VARCHAR(255),
    url VARCHAR(255) NOT NULL,
    disponible BOOLEAN,
    id_tipo_sesion BIGINT NOT NULL REFERENCES tipos_sesion(id_tipo_sesion),
    fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_modificado TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Menú por Roles
CREATE TABLE menu_roles (
    id_menu_rol BIGSERIAL PRIMARY KEY,
    id_menu BIGINT NOT NULL REFERENCES menus(id_menu),
    id_rol BIGINT NOT NULL REFERENCES roles(id_rol),
    disponible BOOLEAN,
    fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_modificado TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. Organizaciones
CREATE TABLE organizaciones (
    id_organizacion BIGSERIAL PRIMARY KEY,
    nombre_organizacion VARCHAR(255) NOT NULL,
    telefono VARCHAR(15),
    correo VARCHAR(255),
    direccion TEXT,
    coordenada_longitud DECIMAL(9,6),
    coordenada_latitud DECIMAL(9,6),
    fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_modificado TIMESTAMP
);

-- 6. Senderos
CREATE TABLE senderos (
    id_sendero BIGSERIAL PRIMARY KEY,
    id_organizacion BIGINT NOT NULL REFERENCES organizaciones(id_organizacion),
    nombre_sendero VARCHAR(255) NOT NULL,
    distancia_km DECIMAL(5,2),
    tiempo_sendero TIMESTAMP,
    dificultad VARCHAR(15),
    guia BOOLEAN,
    fecha_creado TIMESTAMP DEFAULT NOW(),
    fecha_modificado TIMESTAMP
);

-- 7. Usuarios
CREATE TABLE usuarios (
    id_usuario BIGSERIAL PRIMARY KEY,
    id_rol BIGINT NOT NULL REFERENCES roles(id_rol),
    nombres VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(10),
    imagen TEXT,
    password TEXT,
    bloqueado BOOLEAN,
    session_token TEXT,
    fecha_creado TIMESTAMP DEFAULT NOW(),
    fecha_modificado TIMESTAMP
);

DROP TABLE IF EXISTS senderos
CREATE TABLE senderos (
    id_sendero BIGSERIAL PRIMARY KEY,
    id_organizacion BIGINT NOT NULL REFERENCES organizaciones(id_organizacion),
    nombre_sendero VARCHAR(255) NOT NULL,
    distancia_km DECIMAL(5,2),
    tiempo_sendero INTERVAL,
    dificultad VARCHAR(15),
    guia BOOLEAN,
    fecha_creado TIMESTAMP DEFAULT NOW(),
    fecha_modificado TIMESTAMP
);



DROP TABLE IF EXISTS alertas;
CREATE TABLE alertas (
    id_alerta BIGSERIAL PRIMARY KEY,
    id_tipo_alerta BIGINT NOT NULL REFERENCES tipos_alerta(id_tipo_alerta),
    id_usuario BIGINT NOT NULL REFERENCES usuarios(id_usuario),
    id_sendero BIGINT REFERENCES senderos(id_sendero),
    id_estado BIGINT REFERENCES estados_alerta(id_estado_alerta),
    coordenada_longitud DECIMAL(9,6),
    coordenada_latitud DECIMAL(9,6),
    imagen_1 TEXT,
    imagen_2 TEXT,
    imagen_3 TEXT,
    descripcion TEXT,
    fecha_creado TIME NOT NULL DEFAULT NOW()
);

-- 11. Categorías de especies
CREATE TABLE categorias_especies (
    id_categoria_especie BIGSERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(255) NOT NULL,
    fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_modificado TIMESTAMP NOT NULL DEFAULT NOW()
);


DROP TABLE IF EXISTS menus;
CREATE TABLE menus (
    id_menu BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    icono VARCHAR(255),
    url VARCHAR(255) NOT NULL,
    disponible BOOLEAN,
    id_tipo_sesion BIGINT NOT NULL REFERENCES tipos_sesion(id_tipo_sesion),
    fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_modificado TIMESTAMP NOT NULL DEFAULT NOW()
);


DROP TABLE IF EXISTS menu_roles;
CREATE TABLE menu_roles (
    id_menu_rol BIGSERIAL PRIMARY KEY,
    id_menu BIGINT NOT NULL REFERENCES menus(id_menu),
    id_rol BIGINT NOT NULL REFERENCES roles(id_rol),
    disponible BOOLEAN,
    fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_modificado TIMESTAMP NOT NULL DEFAULT NOW()
);


DROP TABLE IF EXISTS categorias_especies;
CREATE TABLE categorias_especies (
    id_categoria_especie BIGSERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(255) NOT NULL,
    fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_modificado TIMESTAMP NOT NULL DEFAULT NOW()
);


DROP TABLE IF EXISTS especies;
CREATE TABLE especies (
    id_especie BIGSERIAL PRIMARY KEY,
    nombre_comun VARCHAR(255) NOT NULL,
    nombre_cientifico VARCHAR(255) NOT NULL,
    id_categoria_especie BIGINT NOT NULL REFERENCES categorias_especies(id_categoria_especie),
    imagen TEXT,
    fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_modificado TIMESTAMP NOT NULL DEFAULT NOW()
);


DROP TABLE IF EXISTS observaciones;
CREATE TABLE IF NOT EXISTS observaciones (
    id_observacion BIGSERIAL PRIMARY KEY,
    id_especie BIGINT NOT NULL REFERENCES especies(id_especie),
    id_usuario BIGINT NOT NULL REFERENCES usuarios(id_usuario),
    id_sendero BIGINT NOT NULL REFERENCES senderos(id_sendero),
    id_estado BIGINT NOT NULL REFERENCES estados_observacion(id_estado_observacion),
	descripcion TEXT,
    fecha_observacion TIMESTAMP NOT NULL,
    coordenada_longitud DECIMAL(9,6),
    coordenada_latitud DECIMAL(9,6),
    imagen_1 TEXT,
	imagen_2 TEXT,
    imagen_3 TEXT,
    id_usario_modifica BIGINT REFERENCES usuarios(id_usuario),
	fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_modificado TIMESTAMP NOT NULL DEFAULT NOW()
);
