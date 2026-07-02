// Comparación multitemporal: dos fechas lado a lado + estadísticas de cambio
import { useState } from 'react';
import {
  Box, Container, Paper, Typography, TextField, Button, Stack, Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Legend, Tooltip } from 'chart.js';
import MapaBase from '../components/mapa/MapaBase';
import CapaImpactos from '../components/mapa/CapaImpactos';
import { useImpactos } from '../hooks/useImpactos';
import { compararFechas } from '../services/impactos.service';
import type { ResultadoComparacion } from '../types';

Chart.register(CategoryScale, LinearScale, BarElement, Legend, Tooltip);

export default function Comparacion() {
  const [fecha1, setFecha1] = useState('2018-12-31');
  const [fecha2, setFecha2] = useState('2024-12-31');
  const [resultado, setResultado] = useState<ResultadoComparacion | null>(null);
  const [error, setError] = useState('');

  // Impactos acumulados hasta cada fecha (visión "antes / después")
  const antes = useImpactos({ hasta: fecha1 });
  const despues = useImpactos({ hasta: fecha2 });

  async function comparar() {
    try {
      setResultado(await compararFechas(fecha1, fecha2));
      setError('');
    } catch {
      setError('No fue posible calcular la comparación. Verifique las fechas y la API.');
    }
  }

  return (
    <Box sx={{ overflowY: 'auto', height: '100%' }}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>Comparación multitemporal</Typography>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField label="Fecha 1 (antes)" type="date" value={fecha1}
              onChange={(e) => setFecha1(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Fecha 2 (después)" type="date" value={fecha2}
              onChange={(e) => setFecha2(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }} />
            <Button variant="contained" startIcon={<CompareArrowsIcon />} onClick={comparar}>
              Comparar
            </Button>
          </Stack>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Paper>

        {/* Mapas antes / después */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { titulo: `Hasta ${fecha1}`, datos: antes.datos },
            { titulo: `Hasta ${fecha2}`, datos: despues.datos },
          ].map((m) => (
            <Grid key={m.titulo} size={{ xs: 12, md: 6 }}>
              <Paper sx={{ overflow: 'hidden' }}>
                <Typography variant="subtitle1" sx={{ p: 1.5, fontWeight: 600 }}>
                  {m.titulo} · {m.datos.features.length} impactos
                </Typography>
                <Box sx={{ height: 320 }}>
                  <MapaBase><CapaImpactos datos={m.datos} /></MapaBase>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Estadísticas de cambio */}
        {resultado && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Cambios calculados</Typography>
                <Typography>
                  Impactos: {resultado.periodo1.impactos} → {resultado.periodo2.impactos}
                  {resultado.cambio_impactos_pct !== null &&
                    ` (${resultado.cambio_impactos_pct.toFixed(1)} %)`}
                </Typography>
                <Typography>
                  Área afectada: {(resultado.periodo1.area_m2 / 10000).toFixed(3)} ha →{' '}
                  {(resultado.periodo2.area_m2 / 10000).toFixed(3)} ha
                  {resultado.cambio_area_pct !== null &&
                    ` (${resultado.cambio_area_pct.toFixed(1)} %)`}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper sx={{ p: 3 }}>
                <Bar
                  data={{
                    labels: [fecha1, fecha2],
                    datasets: [
                      {
                        label: 'Número de impactos',
                        data: [resultado.periodo1.impactos, resultado.periodo2.impactos],
                        backgroundColor: '#1E4D3B',
                      },
                      {
                        label: 'Área afectada (ha)',
                        data: [resultado.periodo1.area_m2 / 10000,
                               resultado.periodo2.area_m2 / 10000],
                        backgroundColor: '#C97B2D',
                      },
                    ],
                  }}
                  options={{ responsive: true }}
                />
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
}
