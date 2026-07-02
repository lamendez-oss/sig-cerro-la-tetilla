// Tema institucional de la plataforma
// Paleta inspirada en el paisaje del cerro: verde montano, niebla y ocre volcánico
import { createTheme } from '@mui/material/styles';

export const colores = {
  verdeMontano: '#1E4D3B', // color principal: bosque andino
  verdeClaro: '#3E7C59',
  ocre: '#C97B2D',         // acento: suelos y caminos veredales
  niebla: '#EEF1EC',       // fondo general
  carbon: '#22302A',       // texto principal
  rojoAlerta: '#B4402F',   // impactos de gravedad alta/crítica
};

export const tema = createTheme({
  palette: {
    primary: { main: colores.verdeMontano, light: colores.verdeClaro },
    secondary: { main: colores.ocre },
    error: { main: colores.rojoAlerta },
    background: { default: colores.niebla, paper: '#FFFFFF' },
    text: { primary: colores.carbon },
  },
  typography: {
    fontFamily: '"Source Sans 3", system-ui, sans-serif',
    h1: { fontFamily: 'Archivo, sans-serif', fontWeight: 700 },
    h2: { fontFamily: 'Archivo, sans-serif', fontWeight: 700 },
    h3: { fontFamily: 'Archivo, sans-serif', fontWeight: 700 },
    h4: { fontFamily: 'Archivo, sans-serif', fontWeight: 700 },
    h5: { fontFamily: 'Archivo, sans-serif', fontWeight: 600 },
    h6: { fontFamily: 'Archivo, sans-serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  },
});
