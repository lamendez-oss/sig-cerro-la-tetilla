// Sección completa del proyecto de investigación
import { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Divider } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { api } from '../services/api';

interface Proyecto {
  nombre: string; descripcion: string; objetivos: string;
  justificacion: string | null; metodologia: string | null;
  fecha_inicio: string | null; fecha_fin: string | null;
}

export default function ProyectoPagina() {
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);

  useEffect(() => {
    api.get<Proyecto[]>('/proyectos').then((r) => setProyecto(r.data[0] ?? null));
  }, []);

  const secciones = [
    { titulo: 'Descripción', texto: proyecto?.descripcion },
    { titulo: 'Objetivos', texto: proyecto?.objetivos },
    { titulo: 'Justificación', texto: proyecto?.justificacion ??
      'El cerro tutelar constituye un patrimonio natural y cultural cuyo estado ambiental requiere seguimiento sistemático con participación de la comunidad.' },
    { titulo: 'Metodología', texto: proyecto?.metodologia ??
      'Diseño mixto secuencial en tres fases: (1) procesos participativos con la comunidad, (2) análisis espacial multitemporal con imágenes satelitales y (3) educación ambiental y socialización de resultados.' },
  ];

  return (
    <Box sx={{ overflowY: 'auto', height: '100%' }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          {proyecto?.nombre ?? 'Proyecto de investigación'}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Área de estudio: Cerro La Tetilla, vereda La Tetilla, corregimiento de Santa Rosa,
          municipio de Popayán, departamento del Cauca, Colombia.
        </Typography>
        <Grid container spacing={2}>
          {secciones.map((s) => (
            <Grid key={s.titulo} size={{ xs: 12 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>{s.titulo}</Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography sx={{ whiteSpace: 'pre-line' }}>{s.texto}</Typography>
              </Paper>
            </Grid>
          ))}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Equipo e instituciones</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography component="ul" sx={{ pl: 3, m: 0 }}>
                <li>Programa de Geografía, Universidad del Cauca.</li>
                <li>Comunidad de la vereda La Tetilla e instituciones educativas participantes.</li>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
