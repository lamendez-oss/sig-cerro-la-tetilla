// Visor SIG principal: capas de impactos con filtros, transparencia y leyenda dinámica
import { useState } from 'react';
import {
  Box, Paper, Typography, Slider, Switch, FormControlLabel, Stack,
  TextField, MenuItem, IconButton, Drawer, useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LayersIcon from '@mui/icons-material/Layers';
import MapaBase from '../components/mapa/MapaBase';
import CapaImpactos from '../components/mapa/CapaImpactos';
import { useImpactos } from '../hooks/useImpactos';
import { ETIQUETAS_TIPO, COLORES_TIPO } from '../utils/constantes';

export default function MapaSIG() {
  const [visible, setVisible] = useState(true);
  const [opacidad, setOpacidad] = useState(0.85);
  const [tipo, setTipo] = useState('');
  const [panelAbierto, setPanelAbierto] = useState(false);
  const tema = useTheme();
  const esMovil = useMediaQuery(tema.breakpoints.down('md'));
  const { datos } = useImpactos(tipo ? { tipo } : {});

  const tiposPresentes = [...new Set(datos.features.map((f) => f.properties?.tipo))];

  const panel = (
    <Paper sx={{ p: 2, width: 280 }} elevation={esMovil ? 0 : 3}>
      <Typography variant="h6" gutterBottom>Administrador de capas</Typography>
      <FormControlLabel
        control={<Switch checked={visible} onChange={(_, v) => setVisible(v)} />}
        label="Impactos ambientales"
      />
      <Typography variant="body2" sx={{ mt: 1 }}>Transparencia</Typography>
      <Slider value={opacidad} min={0.1} max={1} step={0.05}
        onChange={(_, v) => setOpacidad(v as number)}
        aria-label="Transparencia de la capa de impactos" />
      <TextField select fullWidth size="small" label="Filtrar por tipo" value={tipo}
        onChange={(e) => setTipo(e.target.value)} sx={{ mt: 1 }}>
        <MenuItem value="">Todos los tipos</MenuItem>
        {Object.entries(ETIQUETAS_TIPO).map(([v, t]) => (
          <MenuItem key={v} value={v}>{t}</MenuItem>
        ))}
      </TextField>

      <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>Leyenda</Typography>
      <Stack spacing={0.8}>
        {(tiposPresentes.length ? tiposPresentes : Object.keys(ETIQUETAS_TIPO)).map((t) => (
          <Stack key={t} direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 14, height: 14, borderRadius: '50%',
              bgcolor: COLORES_TIPO[t as keyof typeof COLORES_TIPO] }} />
            <Typography variant="body2">
              {ETIQUETAS_TIPO[t as keyof typeof ETIQUETAS_TIPO]}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );

  return (
    <Box sx={{ display: 'flex', height: '100%', position: 'relative' }}>
      {!esMovil && panel}
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        <MapaBase>{visible && <CapaImpactos datos={datos} opacidad={opacidad} />}</MapaBase>
        {esMovil && (
          <IconButton
            aria-label="Abrir administrador de capas"
            onClick={() => setPanelAbierto(true)}
            sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1000,
                  bgcolor: '#fff', boxShadow: 2, '&:hover': { bgcolor: '#fff' } }}>
            <LayersIcon />
          </IconButton>
        )}
      </Box>
      <Drawer anchor="right" open={panelAbierto} onClose={() => setPanelAbierto(false)}>
        {panel}
      </Drawer>
    </Box>
  );
}
