// Descarga de reportes: GeoJSON y CSV desde la API
import { Box, Container, Typography, Paper, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import DownloadIcon from '@mui/icons-material/Download';

// En desarrollo usa el proxy de Vite ("/api"); en producción usa la URL pública del backend
const apiBase = import.meta.env.VITE_API_URL ?? '';

const reportes = [
  {
    titulo: 'GeoJSON',
    descripcion: 'Todos los impactos con su geometría, listos para QGIS o ArcGIS Pro.',
    url: `${apiBase}/api/reportes/geojson`,
  },
  {
    titulo: 'CSV',
    descripcion: 'Tabla de atributos con áreas y longitudes calculadas, compatible con Excel.',
    url: `${apiBase}/api/reportes/csv`,
  },
];

export default function Reportes() {
  return (
    <Box sx={{ overflowY: 'auto', height: '100%' }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Reportes y exportación</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Descargue la información de la plataforma en formatos abiertos. Para obtener
          Shapefile o KML, importe el GeoJSON en QGIS y expórtelo desde allí.
        </Typography>
        <Grid container spacing={2}>
          {reportes.map((r) => (
            <Grid key={r.titulo} size={{ xs: 12, sm: 6 }}>
              <Paper sx={{ p: 3, height: '100%', display: 'flex',
                           flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6">{r.titulo}</Typography>
                <Typography sx={{ flexGrow: 1 }}>{r.descripcion}</Typography>
                <Button variant="contained" startIcon={<DownloadIcon />}
                  href={r.url} download>
                  Descargar {r.titulo}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
