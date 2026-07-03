// Estructura general: barra superior con navegación responsive (menú hamburguesa en móvil)
import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, Box, Button, useMediaQuery, Divider, Menu, MenuItem,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import TerrainIcon from '@mui/icons-material/Terrain';
import MapIcon from '@mui/icons-material/Map';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import CompareIcon from '@mui/icons-material/Compare';
import InsightsIcon from '@mui/icons-material/Insights';
import ScienceIcon from '@mui/icons-material/Science';
import ArticleIcon from '@mui/icons-material/Article';
import DownloadIcon from '@mui/icons-material/Download';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import HomeIcon from '@mui/icons-material/Home';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth } from '../../context/AuthContext';

// Enlaces que se muestran directamente como botones en la barra de PC
const enlacesPrincipales = [
  { ruta: '/', texto: 'Inicio', icono: <HomeIcon /> },
  { ruta: '/mapa', texto: 'Mapa SIG', icono: <MapIcon /> },
  { ruta: '/registro-impactos', texto: 'Registrar impacto', icono: <AddLocationAltIcon /> },
  { ruta: '/comparacion', texto: 'Comparación', icono: <CompareIcon /> },
  { ruta: '/dashboard', texto: 'Dashboard', icono: <InsightsIcon /> },
];

// Enlaces adicionales: en PC quedan agrupados en el menú "Más", en móvil van sueltos
const enlacesSecundarios = [
  { ruta: '/proyecto', texto: 'Proyecto', icono: <ScienceIcon /> },
  { ruta: '/articulo', texto: 'Artículo', icono: <ArticleIcon /> },
  { ruta: '/reportes', texto: 'Reportes', icono: <DownloadIcon /> },
];

const enlaces = [...enlacesPrincipales, ...enlacesSecundarios];

export default function Layout() {
  const [abierto, setAbierto] = useState(false);
  const [anclaMas, setAnclaMas] = useState<null | HTMLElement>(null);
  const tema = useTheme();
  const esMovil = useMediaQuery(tema.breakpoints.down('md'));
  const { usuario, cerrarSesion, esAdministrador } = useAuth();
  const navegar = useNavigate();

  const menu = (
    <List sx={{ width: 260 }}>
      {enlaces.map((e) => (
        <ListItemButton
          key={e.ruta}
          component={NavLink}
          to={e.ruta}
          onClick={() => setAbierto(false)}
          sx={{ '&.active': { bgcolor: 'primary.main', color: '#fff',
                '& .MuiListItemIcon-root': { color: '#fff' } } }}
        >
          <ListItemIcon>{e.icono}</ListItemIcon>
          <ListItemText primary={e.texto} />
        </ListItemButton>
      ))}
      {esAdministrador && (
        <>
          <Divider />
          <ListItemButton component={NavLink} to="/admin" onClick={() => setAbierto(false)}>
            <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
            <ListItemText primary="Administración" />
          </ListItemButton>
        </>
      )}
      {!usuario && (
        <>
          <Divider />
          <ListItemButton component={NavLink} to="/registro" onClick={() => setAbierto(false)}>
            <ListItemIcon><PersonAddIcon /></ListItemIcon>
            <ListItemText primary="Crear cuenta" />
          </ListItemButton>
        </>
      )}
    </List>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ gap: 1 }}>
          {esMovil && (
            <IconButton color="inherit" edge="start" aria-label="Abrir menú"
              onClick={() => setAbierto(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <TerrainIcon />
          <Typography variant="h6" sx={{ flexGrow: 1, letterSpacing: 0.3 }}>
            SIG Cerro La Tetilla
          </Typography>
          {!esMovil && enlacesPrincipales.map((e) => (
            <Button key={e.ruta} color="inherit" component={NavLink} to={e.ruta}
              sx={{ '&.active': { borderBottom: '2px solid', borderRadius: 0 } }}>
              {e.texto}
            </Button>
          ))}
          {!esMovil && (
            <>
              <Button color="inherit" endIcon={<ExpandMoreIcon />}
                onClick={(ev) => setAnclaMas(ev.currentTarget)}>
                Más
              </Button>
              <Menu anchorEl={anclaMas} open={Boolean(anclaMas)} onClose={() => setAnclaMas(null)}>
                {enlacesSecundarios.map((e) => (
                  <MenuItem key={e.ruta} component={NavLink} to={e.ruta}
                    onClick={() => setAnclaMas(null)}>
                    <ListItemIcon>{e.icono}</ListItemIcon>
                    {e.texto}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
          {usuario ? (
            <>
              {esAdministrador && !esMovil && (
                <Button
                  component={NavLink}
                  to="/admin"
                  startIcon={<AdminPanelSettingsIcon />}
                  sx={{
                    color: '#fff',
                    bgcolor: 'secondary.main',
                    '&:hover': { bgcolor: 'secondary.dark' },
                    '&.active': { bgcolor: 'secondary.dark' },
                  }}
                >
                  Administración
                </Button>
              )}
              <Button color="inherit" onClick={() => { cerrarSesion(); navegar('/'); }}>
                Cerrar sesión ({usuario.nombre.split(' ')[0]})
              </Button>
            </>
          ) : (
            <>
              {!esMovil && (
                <Button color="inherit" component={NavLink} to="/registro">
                  Crear cuenta
                </Button>
              )}
              <Button color="inherit" variant="outlined" component={NavLink} to="/login"
                sx={{ borderColor: 'rgba(255,255,255,0.5)' }}>
                Iniciar sesión
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Drawer open={abierto} onClose={() => setAbierto(false)}>{menu}</Drawer>

      <Box component="main" sx={{ flexGrow: 1, minHeight: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
