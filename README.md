# Plataforma SIG — Monitoreo Ambiental del Cerro La Tetilla

Aplicación web para registrar, visualizar, comparar y analizar de forma multitemporal
los impactos ambientales del Cerro La Tetilla (vereda La Tetilla, corregimiento de
Santa Rosa, municipio de Popayán, Cauca, Colombia).

## Tecnologías

| Capa | Tecnologías |
|---|---|
| Frontend | React 19, Vite, TypeScript, Material UI, React Router, React Leaflet, Leaflet Draw, Turf.js, Chart.js, Axios |
| Backend | Node.js, Express, JWT, Multer, API REST |
| Base de datos | PostgreSQL + PostGIS |

## Estructura del proyecto

```
cerro-tetilla-sig/
├── database/schema.sql      # Base de datos completa (tablas, índices, vista)
├── backend/                 # API REST (Express + PostGIS)
│   └── src/
│       ├── index.js         # Servidor principal
│       ├── config/db.js     # Conexión PostgreSQL
│       ├── middleware/      # JWT (roles) y Multer (fotos)
│       ├── routes/          # auth, impactos, capas, proyectos, artículos,
│       │                    # estadísticas, reportes, admin
│       └── utils/           # Script para crear el administrador
└── frontend/                # Aplicación React
    └── src/
        ├── components/      # layout, mapa (visor, dibujo, capas), impactos
        ├── pages/           # Inicio, MapaSIG, RegistroImpactos, Comparación,
        │                    # Dashboard, Proyecto, Artículo, Reportes, Admin, Login
        ├── services/        # Cliente Axios y servicios de la API
        ├── context/         # Autenticación (JWT)
        ├── hooks/           # useImpactos
        ├── types/           # Tipos TypeScript
        └── utils/           # Constantes (tipos de impacto, colores, centro del mapa)
```

## Requisitos previos

1. **Node.js 20+** — https://nodejs.org
2. **PostgreSQL 15+ con PostGIS 3+** — https://www.postgresql.org y https://postgis.net
3. **Visual Studio Code** (recomendado) con extensiones ESLint y Prettier
4. **Git**

## Instalación paso a paso

### 1. Crear la base de datos

Abrir una terminal (o pgAdmin) y ejecutar:

```bash
# Crear la base de datos
psql -U postgres -c "CREATE DATABASE tetilla_sig;"

# Crear tablas, índices, vista y datos iniciales
psql -U postgres -d tetilla_sig -f database/schema.sql
```

### 2. Configurar y ejecutar el backend

```bash
cd backend
npm install

# Crear el archivo de configuración
cp .env.example .env
# Editar .env: contraseña de PostgreSQL y JWT_SECRET propio

# Crear el usuario administrador inicial
npm run crear-admin
# -> correo: admin@tetilla.co | contraseña: Admin2026*
# (cambiar la contraseña después del primer inicio de sesión)

# Iniciar la API (http://localhost:4000)
npm run dev
```

### 3. Ejecutar el frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abrir **http://localhost:5173** en el navegador. El proxy de Vite redirige
automáticamente `/api` y `/uploads` hacia el backend.

### 4. Compilar para producción

```bash
cd frontend
npm run build     # genera frontend/dist/
```

Servir `dist/` con cualquier servidor estático (Nginx, Apache) y mantener la API
en ejecución con `npm start` (o PM2) en el backend.

## Roles y permisos

| Rol | Permisos |
|---|---|
| Visitante | Consultar mapa, dashboard, comparación, proyecto, artículo y reportes |
| Investigador | Todo lo anterior + registrar y editar impactos, importar capas |
| Administrador | Todo lo anterior + gestión de usuarios, roles, logs y eliminación de datos |

## Endpoints principales de la API

| Método | Ruta | Descripción |
|---|---|---|
| POST | /api/auth/registro | Registro de usuario (rol visitante) |
| POST | /api/auth/login | Inicio de sesión (devuelve JWT) |
| GET | /api/impactos | FeatureCollection GeoJSON (filtros: tipo, estado, desde, hasta) |
| POST | /api/impactos | Crear impacto (multipart: campos + geometría GeoJSON + fotos) |
| PUT/DELETE | /api/impactos/:id | Actualizar / eliminar impacto |
| GET | /api/estadisticas/resumen | Indicadores del dashboard |
| GET | /api/estadisticas/comparacion | Comparación entre dos fechas |
| GET | /api/capas | Capas SIG temáticas |
| GET | /api/reportes/geojson · /csv | Exportación de datos |
| GET | /api/admin/usuarios · /logs | Administración (solo administrador) |

## Exportación a Shapefile / KML

La plataforma exporta GeoJSON y CSV directamente. Para Shapefile o KML:

1. Descargar el GeoJSON desde **Reportes**.
2. Abrirlo en QGIS (arrastrar el archivo al lienzo).
3. Clic derecho sobre la capa → *Exportar* → *Guardar objetos como…* →
   formato **ESRI Shapefile** o **KML**.

También puede usarse GDAL desde la terminal:

```bash
ogr2ogr -f "ESRI Shapefile" impactos.shp impactos_tetilla.geojson
```

## Notas técnicas

- Las geometrías se almacenan en **SRID 4326 (WGS 84)**, compatible con GPS,
  Survey123, QGIS y ArcGIS Pro.
- Las áreas y longitudes se calculan sobre el tipo `geography` de PostGIS
  (metros reales, no grados).
- Las fotografías se guardan en `backend/uploads/` y se sirven como archivos
  estáticos; en producción se recomienda respaldar esta carpeta junto con la
  base de datos (`pg_dump tetilla_sig > respaldo.sql`).
- El diseño es *mobile first*: menú hamburguesa, panel de capas en cajón lateral
  y mapa a pantalla completa en teléfonos.
