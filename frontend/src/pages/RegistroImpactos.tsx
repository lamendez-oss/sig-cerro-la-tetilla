// Registro de impactos: dibujo sobre el mapa + formulario asociado
import { useState } from 'react';
import { Box, Alert, Container } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Link } from 'react-router-dom';
import MapaBase from '../components/mapa/MapaBase';
import ControlDibujo from '../components/mapa/ControlDibujo';
import CapaImpactos from '../components/mapa/CapaImpactos';
import FormularioImpacto from '../components/impactos/FormularioImpacto';
import { useImpactos } from '../hooks/useImpactos';
import { useAuth } from '../context/AuthContext';

export default function RegistroImpactos() {
  const [geometria, setGeometria] = useState<GeoJSON.Geometry | null>(null);
  const { datos, recargar } = useImpactos();
  const { puedeEditar } = useAuth();

  if (!puedeEditar) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="info">
          Para registrar impactos debe <Link to="/login">iniciar sesión</Link> con un
          usuario de rol investigador o administrador.
        </Alert>
      </Container>
    );
  }

  return (
    <Grid container sx={{ height: '100%' }}>
      <Grid size={{ xs: 12, md: 8 }} sx={{ height: { xs: '55%', md: '100%' } }}>
        <Box sx={{ height: '100%' }}>
          <MapaBase>
            <CapaImpactos datos={datos} />
            <ControlDibujo alDibujar={setGeometria} />
          </MapaBase>
        </Box>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }} sx={{ height: { xs: '45%', md: '100%' } }}>
        <FormularioImpacto geometria={geometria}
          alGuardar={() => { setGeometria(null); recargar(); }} />
      </Grid>
    </Grid>
  );
}
