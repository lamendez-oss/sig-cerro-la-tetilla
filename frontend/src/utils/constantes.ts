// Constantes de la plataforma
import type { TipoImpacto, Gravedad } from '../types';

// Centro aproximado del Cerro La Tetilla (Popayán, Cauca)
export const CENTRO_CERRO: [number, number] = [2.515, -76.687];
export const ZOOM_INICIAL = 14;

export const ETIQUETAS_TIPO: Record<TipoImpacto, string> = {
  tala: 'Tala',
  incendio: 'Incendio',
  basura: 'Basura',
  erosion: 'Erosión',
  construccion: 'Construcción',
  contaminacion: 'Contaminación',
  mineria: 'Minería',
  especies_invasoras: 'Especies invasoras',
  vertimientos: 'Vertimientos',
  otro: 'Otro',
};

// Colores de cada tipo de impacto (leyenda del visor)
export const COLORES_TIPO: Record<TipoImpacto, string> = {
  tala: '#7B4B27',
  incendio: '#C1361F',
  basura: '#6B6B6B',
  erosion: '#B08430',
  construccion: '#4A4E69',
  contaminacion: '#5B2A86',
  mineria: '#2F2F2F',
  especies_invasoras: '#4E8D3A',
  vertimientos: '#2B6C8F',
  otro: '#9A8C98',
};

export const ETIQUETAS_GRAVEDAD: Record<Gravedad, string> = {
  baja: 'Baja', media: 'Media', alta: 'Alta', critica: 'Crítica',
};

export const ETIQUETAS_ESTADO: Record<string, string> = {
  activo: 'Activo',
  en_seguimiento: 'En seguimiento',
  mitigado: 'Mitigado',
  resuelto: 'Resuelto',
};
