// Hook para consultar los impactos con filtros
import { useEffect, useState, useCallback } from 'react';
import { obtenerImpactos, type FiltrosImpactos } from '../services/impactos.service';

export function useImpactos(filtros: FiltrosImpactos = {}) {
  const [datos, setDatos] = useState<GeoJSON.FeatureCollection>({
    type: 'FeatureCollection', features: [],
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    try {
      setDatos(await obtenerImpactos(filtros));
      setError(null);
    } catch {
      setError('No fue posible cargar los impactos. Verifique la conexión con la API.');
    } finally {
      setCargando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filtros)]);

  useEffect(() => { recargar(); }, [recargar]);
  return { datos, cargando, error, recargar };
}
