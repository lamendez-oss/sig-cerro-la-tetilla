// Servicios relacionados con impactos ambientales
import { api } from './api';
import type { ResumenEstadisticas, ResultadoComparacion } from '../types';

export interface FiltrosImpactos {
  tipo?: string;
  estado?: string;
  desde?: string;
  hasta?: string;
}

export async function obtenerImpactos(filtros: FiltrosImpactos = {}) {
  const { data } = await api.get<GeoJSON.FeatureCollection>('/impactos', { params: filtros });
  return data;
}

export async function crearImpacto(formulario: FormData) {
  const { data } = await api.post('/impactos', formulario, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function obtenerFotos(impactoId: number) {
  const { data } = await api.get<{ id: number; ruta_archivo: string }[]>(
    `/impactos/${impactoId}/fotos`
  );
  return data;
}

export async function obtenerResumen() {
  const { data } = await api.get<ResumenEstadisticas>('/estadisticas/resumen');
  return data;
}

export async function compararFechas(fecha1: string, fecha2: string) {
  const { data } = await api.get<ResultadoComparacion>('/estadisticas/comparacion', {
    params: { fecha1, fecha2 },
  });
  return data;
}
