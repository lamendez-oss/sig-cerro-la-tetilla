// Inicio de sesión
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Paper, Typography, TextField, Button, Alert, Stack, Link } from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const { iniciarSesion } = useAuth();
  const navegar = useNavigate();

  async function entrar() {
    try {
      await iniciarSesion(correo, contrasena);
      navegar('/');
    } catch {
      setError('Credenciales incorrectas. Verifique el correo y la contraseña.');
    }
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="xs">
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>Iniciar sesión</Typography>
          <Stack spacing={2}>
            <TextField label="Correo" type="email" value={correo}
              onChange={(e) => setCorreo(e.target.value)} autoComplete="email" />
            <TextField label="Contraseña" type="password" value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && entrar()}
              autoComplete="current-password" />
            {error && <Alert severity="error">{error}</Alert>}
            <Button variant="contained" size="large" onClick={entrar}>Entrar</Button>
            <Typography variant="body2" textAlign="center">
              ¿No tiene una cuenta?{' '}
              <Link component={RouterLink} to="/registro">Regístrese aquí</Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
