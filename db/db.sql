CREATE TABLE tipos_alerta (
    id_tipo_alerta BIGSERIAL PRIMARY KEY,
    tipo_alerta VARCHAR(255) NOT NULL,
    nivel_prioridad INT NOT NULL,
    icono_alerta TEXT,
    fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_modificado TIMESTAMP
);

CREATE TABLE estados_alerta (
    id_estado_alerta BIGSERIAL PRIMARY KEY,
    nombre_estado VARCHAR(255) NOT NULL,
    fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_modificado TIMESTAMP
);

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

CREATE TABLE roles (
    id_rol BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(180) NOT NULL UNIQUE,
    fecha_creado TIMESTAMP NOT NULL DEFAULT NOW()
);


INSERT INTO roles (
	nombre,
	fecha_creado,
	fecha_modificado
)
VALUES(
	'ADMINISTRADOR',
	'2021-05-22',
	'2021-05-22'
);

INSERT INTO roles (
	nombre,
	fecha_creado,
	fecha_modificado
)

VALUES(
	'USUARIO',
	'2021-05-22',
	'2021-05-22'
);



CREATE TABLE usuarios (
    id_usuario BIGSERIAL PRIMARY KEY,
    id_rol BIGINT NOT NULL REFERENCES roles(id_rol),
    nombres VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(10),
    imagen TEXT,
    password TEXT,
    session_token TEXT,
    fecha_creado TIMESTAMP DEFAULT NOW(),
    fecha_modificado TIMESTAMP
);

CREATE TABLE alertas (
    id_alerta BIGSERIAL PRIMARY KEY,
    id_tipo_alerta BIGINT NOT NULL REFERENCES tipos_alerta(id_tipo_alerta),
    id_usuario BIGINT NOT NULL REFERENCES usuarios(id_usuario),
    id_organizacion BIGINT REFERENCES organizaciones(id_organizacion),
    id_estado BIGINT REFERENCES estados_alerta(id_estado_alerta),
    coordenada_longitud DECIMAL(9,6),
    coordenada_latitud DECIMAL(9,6),
    imagen TEXT,
    descripcion TEXT,
    fecha_creado TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE tipos_sesion (
    id_tipo_sesion BIGSERIAL PRIMARY KEY,
    tipo_sesion VARCHAR(20),
    fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_modificado TIMESTAMP NOT NULL DEFAULT NOW()
);


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


CREATE TABLE menu_roles (
    id_menu_rol BIGSERIAL PRIMARY KEY,
    id_menu BIGINT NOT NULL REFERENCES menus(id_menu),
    id_rol BIGINT NOT NULL REFERENCES roles(id_rol),
    disponible BOOLEAN,
    fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_modificado TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE familias_especies (
    id_familia_especie BIGSERIAL PRIMARY KEY,
    nombre_cientifico VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_modificado TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE especies (
    id_especie BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    categoría VARCHAR(50) NOT NULL,
    id_familia_especie BIGINT NOT NULL REFERENCES familias_especies(id_familia_especie),
    imagen TEXT,
    fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_modificado TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE observacion (
    id_observacion BIGSERIAL PRIMARY KEY,
    id_especie BIGINT NOT NULL REFERENCES especies(id_especie),
    descripción TEXT,
    fecha_observacion TIMESTAMP NOT NULL,
    coordenada_longitud DECIMAL(9,6),
    coordenada_latitud DECIMAL(9,6),
    estado BOOLEAN,
    fecha_creado TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_modificado TIMESTAMP NOT NULL DEFAULT NOW()
);



