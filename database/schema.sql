-- ============================================================
-- PLATAFORMA SIG - MONITOREO AMBIENTAL DEL CERRO LA TETILLA
-- Base de datos: PostgreSQL 15+ con extensión PostGIS 3+
-- Ejecutar: psql -U postgres -d tetilla_sig -f schema.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- TABLA: usuarios | Roles: administrador, investigador, visitante
-- ============================================================
CREATE TABLE usuarios (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(120) NOT NULL,
    correo          VARCHAR(150) NOT NULL UNIQUE,
    contrasena      VARCHAR(255) NOT NULL, -- hash bcrypt
    rol             VARCHAR(20)  NOT NULL DEFAULT 'visitante'
                    CHECK (rol IN ('administrador','investigador','visitante')),
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    fecha_creacion  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: impactos_ambientales
-- Geometría flexible: POINT, LINESTRING o POLYGON (SRID 4326)
-- ============================================================
CREATE TABLE impactos_ambientales (
    id              SERIAL PRIMARY KEY,
    fecha           DATE         NOT NULL,
    hora            TIME,
    tipo            VARCHAR(50)  NOT NULL
                    CHECK (tipo IN ('tala','incendio','basura','erosion','construccion',
                                    'contaminacion','mineria','especies_invasoras',
                                    'vertimientos','otro')),
    descripcion     TEXT         NOT NULL,
    gravedad        VARCHAR(20)  NOT NULL DEFAULT 'media'
                    CHECK (gravedad IN ('baja','media','alta','critica')),
    estado          VARCHAR(20)  NOT NULL DEFAULT 'activo'
                    CHECK (estado IN ('activo','en_seguimiento','mitigado','resuelto')),
    observaciones   TEXT,
    geometria       GEOMETRY(GEOMETRY, 4326) NOT NULL,
    usuario_id      INTEGER      NOT NULL REFERENCES usuarios(id),
    fecha_creacion  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT geometria_valida
        CHECK (GeometryType(geometria) IN ('POINT','LINESTRING','POLYGON'))
);

CREATE INDEX idx_impactos_geom  ON impactos_ambientales USING GIST (geometria);
CREATE INDEX idx_impactos_fecha ON impactos_ambientales (fecha);
CREATE INDEX idx_impactos_tipo  ON impactos_ambientales (tipo);

-- ============================================================
-- TABLA: fotografias_impacto (un impacto -> varias fotos, Multer)
-- ============================================================
CREATE TABLE fotografias_impacto (
    id              SERIAL PRIMARY KEY,
    impacto_id      INTEGER NOT NULL REFERENCES impactos_ambientales(id) ON DELETE CASCADE,
    ruta_archivo    VARCHAR(255) NOT NULL,
    nombre_original VARCHAR(255),
    fecha_carga     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: capas_sig (límites, hidrografía, senderos, vegetación, cobertura)
-- ============================================================
CREATE TABLE capas_sig (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(120) NOT NULL,
    tipo            VARCHAR(50)  NOT NULL,
    fuente          VARCHAR(200),
    descripcion     TEXT,
    geometria       GEOMETRY(GEOMETRY, 4326),
    propiedades     JSONB,
    visible_defecto BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_capas_geom ON capas_sig USING GIST (geometria);

-- ============================================================
-- TABLA: proyectos
-- ============================================================
CREATE TABLE proyectos (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(200) NOT NULL,
    descripcion     TEXT,
    objetivos       TEXT,
    justificacion   TEXT,
    metodologia     TEXT,
    fecha_inicio    DATE,
    fecha_fin       DATE,
    fecha_creacion  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: articulos
-- ============================================================
CREATE TABLE articulos (
    id                SERIAL PRIMARY KEY,
    titulo            VARCHAR(300) NOT NULL,
    autores           VARCHAR(300) NOT NULL,
    resumen           TEXT,
    palabras_clave    VARCHAR(300),
    ruta_pdf          VARCHAR(255),
    fecha_publicacion DATE,
    fecha_creacion    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: logs (auditoría)
-- ============================================================
CREATE TABLE logs (
    id          SERIAL PRIMARY KEY,
    usuario_id  INTEGER REFERENCES usuarios(id),
    accion      VARCHAR(100) NOT NULL,
    detalle     TEXT,
    fecha       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DATOS INICIALES
-- ============================================================
-- El usuario administrador se crea con: npm run crear-admin (backend)

INSERT INTO proyectos (nombre, descripcion, objetivos, fecha_inicio) VALUES
('Evaluación de Impacto Ambiental del Cerro Tutelar La Tetilla',
 'Plataforma SIG para el registro, visualización y análisis multitemporal de los impactos ambientales del Cerro La Tetilla, vereda La Tetilla, corregimiento de Santa Rosa, municipio de Popayán, Cauca.',
 'Registrar y monitorear impactos ambientales; realizar análisis espacial multitemporal; fortalecer la apropiación comunitaria del territorio.',
 '2024-01-15');

INSERT INTO capas_sig (nombre, tipo, fuente, descripcion, geometria) VALUES
('Cerro La Tetilla - Punto de referencia', 'limites', 'Levantamiento propio',
 'Punto central de referencia del cerro tutelar',
 ST_SetSRID(ST_MakePoint(-76.6870, 2.5150), 4326));

-- ============================================================
-- VISTA: impactos con geometría GeoJSON, medidas y conteo de fotos
-- ============================================================
CREATE OR REPLACE VIEW v_impactos_geojson AS
SELECT
    i.id, i.fecha, i.hora, i.tipo, i.descripcion, i.gravedad,
    i.estado, i.observaciones, i.fecha_creacion,
    u.nombre AS responsable,
    GeometryType(i.geometria) AS tipo_geometria,
    ST_AsGeoJSON(i.geometria)::json AS geometria,
    ST_Area(i.geometria::geography)   AS area_m2,
    ST_Length(i.geometria::geography) AS longitud_m,
    (SELECT COUNT(*) FROM fotografias_impacto f WHERE f.impacto_id = i.id) AS num_fotos
FROM impactos_ambientales i
JOIN usuarios u ON u.id = i.usuario_id;
