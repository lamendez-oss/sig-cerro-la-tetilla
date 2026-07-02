// Integra Leaflet Draw para dibujar punto, línea o polígono
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';

interface Props {
  alDibujar: (geometria: GeoJSON.Geometry) => void;
}

export default function ControlDibujo({ alDibujar }: Props) {
  const mapa = useMap();

  useEffect(() => {
    const grupo = new L.FeatureGroup();
    mapa.addLayer(grupo);

    const control = new L.Control.Draw({
      position: 'topleft',
      draw: {
        marker: {},
        polyline: { shapeOptions: { color: '#C97B2D', weight: 4 } },
        polygon: { shapeOptions: { color: '#C97B2D' }, allowIntersection: false },
        rectangle: false,
        circle: false,
        circlemarker: false,
      },
      edit: { featureGroup: grupo, remove: true },
    });
    mapa.addControl(control);

    const manejar = (e: L.LeafletEvent) => {
      const capa = (e as L.DrawEvents.Created).layer;
      grupo.clearLayers(); // una geometría por registro
      grupo.addLayer(capa);
      const geojson = (capa as L.Polygon | L.Polyline | L.Marker).toGeoJSON();
      alDibujar(geojson.geometry);
    };
    mapa.on(L.Draw.Event.CREATED, manejar);

    return () => {
      mapa.off(L.Draw.Event.CREATED, manejar);
      mapa.removeControl(control);
      mapa.removeLayer(grupo);
    };
  }, [mapa, alDibujar]);

  return null;
}
