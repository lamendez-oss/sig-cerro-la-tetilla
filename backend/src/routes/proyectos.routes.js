// Información del proyecto de investigación
import { Router } from 'express';
import { pool } from '../config/db.js';

const router = Router();

router.get('/', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM proyectos ORDER BY id');
  res.json(rows);
});

export default router;
