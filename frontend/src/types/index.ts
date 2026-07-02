// Tipos compartidos de la plataforma

export type Rol = 'administrador' | 'investigador' | 'visitante';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: Rol;
}

export type TipoImpacto =
  | 'tala' | 'incendio' | 'basura' | 'erosion' | 'construccion'
  | 'contaminacion' | 'mineria' | 'especies_invasoras' | 'vertimientos' | 'otro';

export type Gravedad = 'baja' | 'media' | 'alta' | 'critica';
export type EstadoImpacto = 'activo' | 'en_seguimiento' | 'mitigado' | 'resuelto';

export interface PropiedadesImpacto {
  id: number;
  fecha: string;
  hora: string | null;
  tipo: TipoImpacto;
  descripcion: string;
  gravedad: Gravedad;
  estado: EstadoImpacto;
  observaciones: string | null;
  responsable: string;
  tipo_geometria: string;
  area_m2: number;
  longitud_m: number;
  num_fotos: number;
}

export interface ResumenEstadisticas {
  total: number;
  por_tipo: { tipo: TipoImpacto; cantidad: number }[];
  por_anio: { anio: number; cantidad: number }[];
  por_gravedad: { gravedad: Gravedad; cantidad: number }[];
  area_total_m2: number;
}

export interface ResultadoComparacion {
  periodo1: { fecha: string; impactos: number; area_m2: number };
  periodo2: { fecha: string; impactos: number; area_m2: number };
  cambio_impactos_pct: number | null;
  cambio_area_pct: number | null;
}

export interface CapaSIG {
  id: number;
  nombre: string;
  tipo: string;
  fuente: string | null;
  descripcion: string | null;
  geometria: GeoJSON.Geometry | null;
  visible_defecto: boolean;
}
