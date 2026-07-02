// Visor base: mapas de fondo, escala, coordenadas y localización GPS
import { type ReactNode, useState } from 'react';
import { MapContainer, TileLayer, LayersControl, ScaleControl, useMapEvents, useMap } from 'react-leaflet';
import { Box, Fab, Tooltip } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { CENTRO_CERRO, ZOOM_INICIAL } from '../../utils/constantes';

// Muestra las coordenadas del cursor / último toque
function Coordenadas() {
  const [pos, setPos] = useState<[number, number] | null>(null);
  useMapEvents({
    mousemove: (e) => setPos([e.latlng.lat, e.latlng.lng]),
    click: (e) => setPos([e.latlng.lat, e.latlng.lng]),
  });
  if (!pos) return null;
  return (
    <Box sx={{
      position: 'absolute', bottom: 8, left: 8, zIndex: 1000,
      bgcolor: 'rgba(255,255,255,0.9)', px: 1, py: 0.3, borderRadius: 1,
      fontSize: 12, fontFamily: 'monospace',
    }}>
      {pos[0].toFixed(5)}, {pos[1].toFixed(5)}
    </Box>
  );
}

// Botón de localización GPS del usuario
function BotonGPS() {
  const mapa = useMap();
  return (
    <Tooltip title="Mi ubicación">
      <Fab size="small" color="secondary" aria-label="Localizar mi posición"
        sx={{ position: 'absolute', top: 90, right: 12, zIndex: 1000 }}
        onClick={() => mapa.locate({ setView: true, maxZoom: 16 })}>
        <MyLocationIcon fontSize="small" />
      </Fab>
    </Tooltip>
  );
}

export default function MapaBase({ children }: { children?: ReactNode }) {
  return (
    <MapContainer center={CENTRO_CERRO} zoom={ZOOM_INICIAL} style={{ height: '100%' }}>
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="ESRI Satélite">
          <TileLayer
            attribution='&copy; Esri, Maxar, Earthstar Geographics'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Topográfico">
          <TileLayer
            attribution='&copy; OpenTopoMap (CC-BY-SA)'
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
      </LayersControl>
      <ScaleControl position="bottomright" metric />
      <Coordenadas />
      <BotonGPS />
      {children}
    </MapContainer>
  );
}
