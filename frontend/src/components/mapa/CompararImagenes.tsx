// Slider "antes / después" para comparar dos imágenes superpuestas arrastrando
import { useRef, useState, useCallback, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';

interface Props {
  imagenAntes: string;
  imagenDespues: string;
  etiquetaAntes: string;
  etiquetaDespues: string;
  alt: string;
}

export default function CompararImagenes({
  imagenAntes, imagenDespues, etiquetaAntes, etiquetaDespues, alt,
}: Props) {
  const [posicion, setPosicion] = useState(50); // porcentaje, 0-100
  const [ancho, setAncho] = useState(0);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const arrastrando = useRef(false);

  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;
    const observador = new ResizeObserver((entradas) => {
      setAncho(entradas[0].contentRect.width);
    });
    observador.observe(contenedor);
    return () => observador.disconnect();
  }, []);

  const actualizarPosicion = useCallback((clienteX: number) => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;
    const rect = contenedor.getBoundingClientRect();
    const porcentaje = ((clienteX - rect.left) / rect.width) * 100;
    setPosicion(Math.min(100, Math.max(0, porcentaje)));
  }, []);

  const alMoverMouse = useCallback((e: React.MouseEvent) => {
    if (arrastrando.current) actualizarPosicion(e.clientX);
  }, [actualizarPosicion]);

  const alMoverToque = useCallback((e: React.TouchEvent) => {
    actualizarPosicion(e.touches[0].clientX);
  }, [actualizarPosicion]);

  return (
    <Box>
      <Box
        ref={contenedorRef}
        onMouseDown={(e) => { arrastrando.current = true; actualizarPosicion(e.clientX); }}
        onMouseMove={alMoverMouse}
        onMouseUp={() => { arrastrando.current = false; }}
        onMouseLeave={() => { arrastrando.current = false; }}
        onTouchStart={alMoverToque}
        onTouchMove={alMoverToque}
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1.414',
          overflow: 'hidden',
          borderRadius: 2,
          cursor: 'ew-resize',
          userSelect: 'none',
          boxShadow: 2,
          bgcolor: '#eee',
        }}
      >
        {/* Capa "después": ocupa todo el ancho */}
        <Box sx={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${imagenDespues})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />

        {/* Capa "antes": recortada al porcentaje del slider, con la imagen a tamaño completo del contenedor */}
        <Box sx={{
          position: 'absolute', inset: 0,
          width: `${posicion}%`, overflow: 'hidden',
        }}>
          <Box sx={{
            width: ancho, height: '100%',
            backgroundImage: `url(${imagenAntes})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }} />
        </Box>

        {/* Etiquetas de año */}
        <Typography sx={{
          position: 'absolute', top: 8, left: 8, px: 1, py: 0.3, borderRadius: 1,
          bgcolor: 'rgba(30,77,59,0.85)', color: '#fff', fontSize: 13, fontWeight: 600,
          pointerEvents: 'none',
        }}>
          {etiquetaAntes}
        </Typography>
        <Typography sx={{
          position: 'absolute', top: 8, right: 8, px: 1, py: 0.3, borderRadius: 1,
          bgcolor: 'rgba(201,123,45,0.9)', color: '#fff', fontSize: 13, fontWeight: 600,
          pointerEvents: 'none',
        }}>
          {etiquetaDespues}
        </Typography>

        {/* Línea divisoria y manija */}
        <Box sx={{
          position: 'absolute', top: 0, bottom: 0, left: `${posicion}%`,
          width: '3px', bgcolor: '#fff', boxShadow: '0 0 6px rgba(0,0,0,0.5)',
          transform: 'translateX(-50%)', pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', top: '50%', left: `${posicion}%`,
          width: 36, height: 36, borderRadius: '50%', bgcolor: '#fff',
          transform: 'translate(-50%, -50%)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', boxShadow: 3,
          pointerEvents: 'none', color: 'primary.main',
        }}>
          <UnfoldMoreIcon sx={{ transform: 'rotate(90deg)' }} />
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: 'center' }}>
        Arrastra la línea para comparar {etiquetaAntes} y {etiquetaDespues}. Imagen: {alt}
      </Typography>
    </Box>
  );
}
