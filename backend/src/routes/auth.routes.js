// Rutas de autenticación: registro, inicio y cierre de sesión
import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { verificarToken } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/registro
router.post('/registro', async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body;
    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    const hash = await bcrypt.hash(contrasena, 10);
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, correo, contrasena, rol)
       VALUES ($1, $2, $3, 'visitante')
       RETURNING id, nombre, correo, rol`,
      [nombre, correo.toLowerCase(), hash]
    );
    await pool.query(
      'INSERT INTO logs (usuario_id, accion, detalle) VALUES ($1, $2, $3)',
      [rows[0].id, 'registro_usuario', `Nueva cuenta: ${rows[0].correo}`]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'El correo ya está registrado' });
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE correo = $1 AND activo = TRUE',
      [String(correo).toLowerCase()]
    );
    const usuario = rows[0];
    if (!usuario || !(await bcrypt.compare(contrasena, usuario.contrasena))) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '8h' }
    );
    await pool.query(
      'INSERT INTO logs (usuario_id, accion) VALUES ($1, $2)',
      [usuario.id, 'inicio_sesion']
    );
    res.json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
    });
  } catch {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// POST /api/auth/logout -> registra el cierre de sesión en la bitácora
router.post('/logout', verificarToken, async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO logs (usuario_id, accion) VALUES ($1, $2)',
      [req.usuario.id, 'cierre_sesion']
    );
    res.json({ mensaje: 'Sesión cerrada' });
  } catch {
    res.status(500).json({ error: 'Error al registrar el cierre de sesión' });
  }
});

export default router;
