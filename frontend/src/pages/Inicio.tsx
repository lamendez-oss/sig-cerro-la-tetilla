// Página de inicio: presentación del cerro, objetivos y últimos impactos
import { Box, Container, Typography, Paper, Button, Chip, Stack } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Link } from 'react-router-dom';
import MapIcon from '@mui/icons-material/Map';
import { useImpactos } from '../hooks/useImpactos';
import { ETIQUETAS_TIPO, COLORES_TIPO } from '../utils/constantes';
import type { PropiedadesImpacto } from '../types';

export default function Inicio() {
  const { datos } = useImpactos();
  const ultimos = datos.features.slice(0, 5);

  return (
    <Box sx={{ overflowY: 'auto', height: '100%' }}>
      {/* Banner principal */}
      <Box sx={{
        color: '#fff', py: { xs: 8, md: 12 }, px: 2, textAlign: 'center',
        background: 'linear-gradient(160deg, #1E4D3B 0%, #3E7C59 70%, #C97B2D 140%)',
      }}>
        <Container maxWidth="md">
          <Typography variant="overline" sx={{ letterSpacing: 3, opacity: 0.85 }}>
            Vereda La Tetilla · Santa Rosa · Popayán, Cauca
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3.2rem' }, mb: 2 }}>
            Monitoreo ambiental del Cerro La Tetilla
          </Typography>
          <Typography sx={{ mb: 4, opacity: 0.95, fontSize: '1.1rem' }}>
            Plataforma SIG para registrar, visualizar y analizar de forma multitemporal
            los impactos ambientales del cerro tutelar.
          </Typography>
          <Button component={Link} to="/mapa" variant="contained" color="secondary"
            size="large" startIcon={<MapIcon />}>
            Explorar el mapa
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" gutterBottom>El cerro tutelar</Typography>
              <Typography paragraph>
                El Cerro La Tetilla es un referente geográfico, ecológico y cultural del
                suroccidente de Popayán. Su cobertura vegetal, sus fuentes hídricas y su
                valor simbólico para la comunidad de la vereda lo convierten en un
                territorio prioritario para el monitoreo ambiental participativo.
              </Typography>
              <Typography variant="h6" gutterBottom>Objetivos del proyecto</Typography>
              <Typography component="ul" sx={{ pl: 3, m: 0 }}>
                <li>Registrar impactos ambientales con localización precisa.</li>
                <li>Analizar los cambios del territorio de forma multitemporal.</li>
                <li>Fortalecer la apropiación comunitaria mediante información abierta.</li>
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" gutterBottom>Últimos impactos registrados</Typography>
              {ultimos.length === 0 && (
                <Typography color="text.secondary">
                  Aún no hay impactos registrados. Inicie sesión como investigador para
                  registrar el primero.
                </Typography>
              )}
              <Stack spacing={1.5}>
                {ultimos.map((f) => {
                  const p = f.properties as PropiedadesImpacto;
                  return (
                    <Stack key={p.id} direction="row" spacing={1} alignItems="center">
                      <Chip size="small" label={ETIQUETAS_TIPO[p.tipo]}
                        sx={{ bgcolor: COLORES_TIPO[p.tipo], color: '#fff' }} />
                      <Typography variant="body2" noWrap>
                        {String(p.fecha).slice(0, 10)} — {p.descripcion}
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
