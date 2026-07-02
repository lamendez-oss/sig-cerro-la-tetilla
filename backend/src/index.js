// Punto de entrada de la API REST - Plataforma SIG Cerro La Tetilla
import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import impactosRoutes from './routes/impactos.routes.js';
import capasRoutes from './routes/capas.routes.js';
import proyectosRoutes from './routes/proyectos.routes.js';
import articulosRoutes from './routes/articulos.routes.js';
import estadisticasRoutes from './routes/estadisticas.routes.js';
import reportesRoutes from './routes/reportes.routes.js';
import adminRoutes from './routes/admin.routes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Fotografías y PDF servidos de forma estática
app.use('/uploads', express.static(path.resolve('uploads')));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/impactos', impactosRoutes);
app.use('/api/capas', capasRoutes);
app.use('/api/proyectos', proyectosRoutes);
app.use('/api/articulos', articulosRoutes);
app.use('/api/estadisticas', estadisticasRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/admin', adminRoutes);

// Salud del servicio
app.get('/api/salud', (_req, res) => res.json({ estado: 'ok', fecha: new Date() }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✔ API disponible en http://localhost:${PORT}`));
