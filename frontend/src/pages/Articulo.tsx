// Módulo de publicación del artículo científico
import { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Button, Stack, Chip } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { api } from '../services/api';

interface Articulo {
  id: number; titulo: string; autores: string; resumen: string | null;
  palabras_clave: string | null; ruta_pdf: string | null; fecha_publicacion: string | null;
}

export default function ArticuloPagina() {
  const [articulos, setArticulos] = useState<Articulo[]>([]);

  useEffect(() => {
    api.get<Articulo[]>('/articulos').then((r) => setArticulos(r.data));
  }, []);

  return (
    <Box sx={{ overflowY: 'auto', height: '100%' }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Artículo científico</Typography>
        {articulos.length === 0 && (
          <Typography color="text.secondary">
            Aún no se ha publicado el artículo en la plataforma. El administrador puede
            cargarlo desde la API (POST /api/articulos).
          </Typography>
        )}
        <Stack spacing={2}>
          {articulos.map((a) => (
            <Paper key={a.id} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>{a.titulo}</Typography>
              <Typography color="text.secondary" gutterBottom>{a.autores}</Typography>
              {a.resumen && (
                <>
                  <Typography variant="h6" sx={{ mt: 2 }}>Resumen</Typography>
                  <Typography paragraph>{a.resumen}</Typography>
                </>
              )}
              {a.palabras_clave && (
                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                  {a.palabras_clave.split(',').map((p) => (
                    <Chip key={p} label={p.trim()} size="small" />
                  ))}
                </Stack>
              )}
              {a.ruta_pdf && (
                <Button variant="contained" startIcon={<PictureAsPdfIcon />}
                  href={a.ruta_pdf} target="_blank">
                  Descargar PDF
                </Button>
              )}
            </Paper>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
