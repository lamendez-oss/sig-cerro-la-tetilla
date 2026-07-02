// Dashboard de indicadores con gráficos dinámicos (Chart.js)
import { useEffect, useState } from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart, CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Legend, Tooltip,
} from 'chart.js';
import { obtenerResumen } from '../services/impactos.service';
import type { ResumenEstadisticas } from '../types';
import { ETIQUETAS_TIPO, COLORES_TIPO } from '../utils/constantes';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Legend, Tooltip);

function Indicador({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <Paper sx={{ p: 3, textAlign: 'center', borderTop: '4px solid', borderColor: 'secondary.main' }}>
      <Typography variant="h3">{valor}</Typography>
      <Typography color="text.secondary">{titulo}</Typography>
    </Paper>
  );
}

export default function Dashboard() {
  const [resumen, setResumen] = useState<ResumenEstadisticas | null>(null);

  useEffect(() => {
    obtenerResumen().then(setResumen).catch(() => setResumen(null));
  }, []);

  if (!resumen) {
    return (
      <Container sx={{ py: 6 }}>
        <Typography>Cargando indicadores…</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ overflowY: 'auto', height: '100%' }}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>Dashboard de monitoreo</Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <Indicador titulo="Impactos totales" valor={String(resumen.total)} />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Indicador titulo="Área afectada (ha)"
              valor={(resumen.area_total_m2 / 10000).toFixed(2)} />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Indicador titulo="Tipos registrados" valor={String(resumen.por_tipo.length)} />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <Indicador titulo="Años con registros" valor={String(resumen.por_anio.length)} />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Impactos por año</Typography>
              <Line data={{
                labels: resumen.por_anio.map((a) => a.anio),
                datasets: [{
                  label: 'Impactos', data: resumen.por_anio.map((a) => a.cantidad),
                  borderColor: '#1E4D3B', backgroundColor: 'rgba(30,77,59,0.15)',
                  fill: true, tension: 0.3,
                }],
              }} />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Impactos por tipo</Typography>
              <Doughnut data={{
                labels: resumen.por_tipo.map((t) => ETIQUETAS_TIPO[t.tipo]),
                datasets: [{
                  data: resumen.por_tipo.map((t) => t.cantidad),
                  backgroundColor: resumen.por_tipo.map((t) => COLORES_TIPO[t.tipo]),
                }],
              }} />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Impactos por nivel de gravedad</Typography>
              <Bar data={{
                labels: resumen.por_gravedad.map((g) => g.gravedad),
                datasets: [{
                  label: 'Cantidad',
                  data: resumen.por_gravedad.map((g) => g.cantidad),
                  backgroundColor: ['#3E7C59', '#C9A22D', '#C97B2D', '#B4402F'],
                }],
              }} options={{ indexAxis: 'y' as const }} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
