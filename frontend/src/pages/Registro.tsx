// Registro de cuenta: cualquier visitante puede crear su usuario (rol visitante)
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Container, Paper, Typography, TextField, Button, Alert, Stack, Link,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { registrarse } = useAuth();
  const navegar = useNavigate();

  async function crearCuenta() {
    setError('');
    if (!nombre.trim() || !correo.trim() || !contrasena) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (contrasena !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setEnviando(true);
    try {
      await registrarse(nombre.trim(), correo.trim(), contrasena);
      navegar('/');
    } catch (e: unknown) {
      const mensaje =
        (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(mensaje ?? 'No fue posible crear la cuenta. Intente nuevamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="xs">
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>Crear una cuenta</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            El registro público asigna el rol de visitante. Para registrar impactos
            ambientales, un administrador debe asignarle el rol de investigador.
          </Typography>
          <Stack spacing={2}>
            <TextField label="Nombre completo" value={nombre}
              onChange={(e) => setNombre(e.target.value)} autoComplete="name" />
            <TextField label="Correo" type="email" value={correo}
              onChange={(e) => setCorreo(e.target.value)} autoComplete="email" />
            <TextField label="Contraseña" type="password" value={contrasena}
              onChange={(e) => setContrasena(e.target.value)} autoComplete="new-password" />
            <TextField label="Confirmar contraseña" type="password" value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && crearCuenta()}
              autoComplete="new-password" />
            {error && <Alert severity="error">{error}</Alert>}
            <Button variant="contained" size="large" onClick={crearCuenta} disabled={enviando}>
              {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
            </Button>
            <Typography variant="body2" textAlign="center">
              ¿Ya tiene una cuenta?{' '}
              <Link component={RouterLink} to="/login">Inicie sesión</Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
