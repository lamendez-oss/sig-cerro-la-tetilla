// Formulario asociado al dibujo de un nuevo impacto ambiental
import { useState } from 'react';
import {
  Paper, Typography, TextField, MenuItem, Button, Stack, Alert, Chip,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { crearImpacto } from '../../services/impactos.service';
import { ETIQUETAS_TIPO, ETIQUETAS_GRAVEDAD, ETIQUETAS_ESTADO } from '../../utils/constantes';

interface Props {
  geometria: GeoJSON.Geometry | null;
  alGuardar: () => void;
}

export default function FormularioImpacto({ geometria, alGuardar }: Props) {
  const hoy = new Date().toISOString().slice(0, 10);
  const [fecha, setFecha] = useState(hoy);
  const [hora, setHora] = useState('');
  const [tipo, setTipo] = useState('tala');
  const [descripcion, setDescripcion] = useState('');
  const [gravedad, setGravedad] = useState('media');
  const [estado, setEstado] = useState('activo');
  const [observaciones, setObservaciones] = useState('');
  const [fotos, setFotos] = useState<File[]>([]);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    if (!geometria) {
      setMensaje({ tipo: 'error', texto: 'Dibuje primero la geometría del impacto en el mapa.' });
      return;
    }
    if (!descripcion.trim()) {
      setMensaje({ tipo: 'error', texto: 'La descripción es obligatoria.' });
      return;
    }
    setGuardando(true);
    try {
      const fd = new FormData();
      fd.append('fecha', fecha);
      if (hora) fd.append('hora', hora);
      fd.append('tipo', tipo);
      fd.append('descripcion', descripcion);
      fd.append('gravedad', gravedad);
      fd.append('estado', estado);
      fd.append('observaciones', observaciones);
      fd.append('geometria', JSON.stringify(geometria));
      fotos.forEach((f) => fd.append('fotos', f));
      await crearImpacto(fd);
      setMensaje({ tipo: 'success', texto: 'Impacto registrado correctamente.' });
      setDescripcion(''); setObservaciones(''); setFotos([]);
      alGuardar();
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al guardar. Verifique su sesión y la conexión.' });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Paper sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
      <Typography variant="h6" gutterBottom>Nuevo impacto ambiental</Typography>
      <Stack spacing={2}>
        <Chip
          label={geometria ? `Geometría: ${geometria.type}` : 'Dibuje en el mapa (punto, línea o polígono)'}
          color={geometria ? 'success' : 'default'}
          variant={geometria ? 'filled' : 'outlined'}
        />
        <TextField label="Fecha" type="date" value={fecha}
          onChange={(e) => setFecha(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="Hora" type="time" value={hora}
          onChange={(e) => setHora(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField select label="Tipo de impacto" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {Object.entries(ETIQUETAS_TIPO).map(([v, t]) => (
            <MenuItem key={v} value={v}>{t}</MenuItem>
          ))}
        </TextField>
        <TextField label="Descripción" required multiline minRows={3}
          value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        <TextField select label="Nivel de gravedad" value={gravedad}
          onChange={(e) => setGravedad(e.target.value)}>
          {Object.entries(ETIQUETAS_GRAVEDAD).map(([v, t]) => (
            <MenuItem key={v} value={v}>{t}</MenuItem>
          ))}
        </TextField>
        <TextField select label="Estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
          {Object.entries(ETIQUETAS_ESTADO).map(([v, t]) => (
            <MenuItem key={v} value={v}>{t}</MenuItem>
          ))}
        </TextField>
        <TextField label="Observaciones" multiline minRows={2}
          value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
        <Button component="label" variant="outlined" startIcon={<PhotoCameraIcon />}>
          Agregar fotografías ({fotos.length})
          <input type="file" hidden multiple accept="image/*"
            onChange={(e) => setFotos(Array.from(e.target.files ?? []))} />
        </Button>
        {mensaje && <Alert severity={mensaje.tipo}>{mensaje.texto}</Alert>}
        <Button variant="contained" size="large" onClick={guardar} disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar impacto'}
        </Button>
      </Stack>
    </Paper>
  );
}
