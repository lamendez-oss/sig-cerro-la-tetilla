// Renderiza los impactos ambientales como capa GeoJSON con simbología por tipo
import { GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import type { PropiedadesImpacto, TipoImpacto } from '../../types';
import { COLORES_TIPO, ETIQUETAS_TIPO, ETIQUETAS_GRAVEDAD, ETIQUETAS_ESTADO } from '../../utils/constantes';

interface Props {
  datos: GeoJSON.FeatureCollection;
  opacidad?: number;
}

export default function CapaImpactos({ datos, opacidad = 0.85 }: Props) {
  return (
    <GeoJSON
      key={JSON.stringify(datos.features.map((f) => (f.properties as PropiedadesImpacto).id)) + opacidad}
      data={datos}
      style={(feature) => {
        const tipo = feature?.properties?.tipo as TipoImpacto;
        return {
          color: COLORES_TIPO[tipo] ?? '#333',
          weight: 3,
          fillOpacity: 0.35 * opacidad,
          opacity: opacidad,
        };
      }}
      pointToLayer={(feature, latlng) =>
        L.circleMarker(latlng, {
          radius: 8,
          color: '#fff',
          weight: 1.5,
          fillColor: COLORES_TIPO[feature.properties.tipo as TipoImpacto] ?? '#333',
          fillOpacity: opacidad,
        })
      }
      onEachFeature={(feature, layer) => {
        const p = feature.properties as PropiedadesImpacto;
        const medida = p.tipo_geometria === 'POLYGON'
          ? `Área: ${(p.area_m2 / 10000).toFixed(3)} ha`
          : p.tipo_geometria === 'LINESTRING'
            ? `Longitud: ${p.longitud_m.toFixed(1)} m`
            : '';
        layer.bindPopup(`
          <strong>${ETIQUETAS_TIPO[p.tipo]}</strong><br/>
          Fecha: ${String(p.fecha).slice(0, 10)}<br/>
          Gravedad: ${ETIQUETAS_GRAVEDAD[p.gravedad]}<br/>
          Estado: ${ETIQUETAS_ESTADO[p.estado]}<br/>
          ${p.descripcion}<br/>
          ${medida ? medida + '<br/>' : ''}
          <em>Responsable: ${p.responsable}</em>
        `);
      }}
    />
  );
}
