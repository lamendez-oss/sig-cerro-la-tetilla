// Panel de administración: usuarios, roles, sesiones y logs
import { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Paper, Table, TableHead, TableRow, TableCell,
  TableBody, Select, MenuItem, Switch, Tabs, Tab, Chip,
} from '@mui/material';
import { api } from '../services/api';
import type { Rol } from '../types';

interface UsuarioAdmin {
  id: number; nombre: string; correo: string; rol: Rol; activo: boolean;
}
interface Log {
  id: number; usuario: string | null; accion: string; detalle: string | null; fecha: string;
}
interface Sesion {
  id: number; usuario: string | null; correo: string | null; rol: Rol | null;
  accion: string; fecha: string;
}

// Etiqueta y color legibles para cada tipo de evento de sesión
const ETIQUETAS_SESION: Record<string, { texto: string; color: 'success' | 'default' | 'info' }> = {
  inicio_sesion: { texto: 'Inicio de sesión', color: 'success' },
  cierre_sesion: { texto: 'Cierre de sesión', color: 'default' },
  registro_usuario: { texto: 'Cuenta creada', color: 'info' },
};

export default function Admin() {
  const [pestana, setPestana] = useState(0);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);

  async function cargar() {
    const [u, s, l] = await Promise.all([
      api.get<UsuarioAdmin[]>('/admin/usuarios'),
      api.get<Sesion[]>('/admin/sesiones'),
      api.get<Log[]>('/admin/logs'),
    ]);
    setUsuarios(u.data);
    setSesiones(s.data);
    setLogs(l.data);
  }
  useEffect(() => { cargar(); }, []);

  async function actualizarUsuario(id: number, cambios: Partial<UsuarioAdmin>) {
    await api.put(`/admin/usuarios/${id}`, cambios);
    cargar();
  }

  return (
    <Box sx={{ overflowY: 'auto', height: '100%' }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Administración</Typography>
        <Tabs value={pestana} onChange={(_, v) => setPestana(v)} sx={{ mb: 2 }}>
          <Tab label="Usuarios" />
          <Tab label="Sesiones" />
          <Tab label="Logs" />
        </Tabs>

        {pestana === 0 && (
          <Paper sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell><TableCell>Correo</TableCell>
                  <TableCell>Rol</TableCell><TableCell>Activo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.nombre}</TableCell>
                    <TableCell>{u.correo}</TableCell>
                    <TableCell>
                      <Select size="small" value={u.rol}
                        onChange={(e) => actualizarUsuario(u.id, { rol: e.target.value as Rol })}>
                        <MenuItem value="administrador">Administrador</MenuItem>
                        <MenuItem value="investigador">Investigador</MenuItem>
                        <MenuItem value="visitante">Visitante</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Switch checked={u.activo}
                        onChange={(_, v) => actualizarUsuario(u.id, { activo: v })} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}

        {pestana === 1 && (
          <Paper sx={{ overflowX: 'auto' }}>
            <Typography variant="body2" color="text.secondary" sx={{ p: 2, pb: 0 }}>
              Registro de sesión de cualquier usuario: inicios, cierres y cuentas nuevas.
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha y hora</TableCell><TableCell>Usuario</TableCell>
                  <TableCell>Correo</TableCell><TableCell>Rol</TableCell>
                  <TableCell>Evento</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sesiones.map((s) => {
                  const etiqueta = ETIQUETAS_SESION[s.accion] ?? { texto: s.accion, color: 'default' as const };
                  return (
                    <TableRow key={s.id}>
                      <TableCell>{new Date(s.fecha).toLocaleString('es-CO')}</TableCell>
                      <TableCell>{s.usuario ?? '—'}</TableCell>
                      <TableCell>{s.correo ?? '—'}</TableCell>
                      <TableCell>{s.rol ?? '—'}</TableCell>
                      <TableCell>
                        <Chip size="small" label={etiqueta.texto} color={etiqueta.color} />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {sesiones.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                        Aún no hay eventos de sesión registrados.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        )}

        {pestana === 2 && (
          <Paper sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell><TableCell>Usuario</TableCell>
                  <TableCell>Acción</TableCell><TableCell>Detalle</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{new Date(l.fecha).toLocaleString('es-CO')}</TableCell>
                    <TableCell>{l.usuario ?? '—'}</TableCell>
                    <TableCell>{l.accion}</TableCell>
                    <TableCell>{l.detalle ?? ''}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
