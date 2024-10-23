
CREATE TABLE roles(
	id_rol BIGSERIAL PRIMARY KEY,
	nombre VARCHAR(180) NOT NULL UNIQUE,
	imagen VARCHAR(255) NULL, 
	fecha_creado TIMESTAMP(0) NOT NULL,
	fecha_modificado TIMESTAMP(0) NOT NULL
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
	'CLIENTE',
	'2021-05-22',
	'2021-05-22'
);


CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
	id_rol INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    imagen TEXT,
	password TEXT,
    session_token TEXT,
    refresh_token TEXT,
	fecha_creado timestamp without time zone,
	fecha_modificado timestamp without time zone
);


CREATE TABLE menus(
	id_menu BIGSERIAL PRIMARY KEY,
	nombre VARCHAR(255) NOT NULL,
	icono VARCHAR(255) NULL,
	url VARCHAR(255) NOT NULL,
	disponible BOOLEAN NULL,
	fecha_creado TIMESTAMP(0) NOT NULL,
	fecha_moficado TIMESTAMP(0) NOT NULL
);

CREATE TABLE menu_roles(
	id_menu_rol BIGSERIAL PRIMARY KEY,
    id_menu BIGINT NOT NULL,
	id_rol BIGINT NOT NULL,
	disponible BOOLEAN NULL,
	fecha_creado TIMESTAMP(0) NOT NULL,
	fecha_modificado TIMESTAMP(0) NOT NULL,
    FOREIGN KEY(id_menu) REFERENCES menus(id_menu) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY(id_rol) REFERENCES roles(id_rol) ON UPDATE CASCADE ON DELETE CASCADE
);

