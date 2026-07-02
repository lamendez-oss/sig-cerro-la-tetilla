// Contexto global de autenticación (JWT)
import { createContext, useContext, useState, type ReactNode } from 'react';
import { api } from '../services/api';
import type { Usuario } from '../types';

interface ContextoAuth {
  usuario: Usuario | null;
  iniciarSesion: (correo: string, contrasena: string) => Promise<void>;
  registrarse: (nombre: string, correo: string, contrasena: string) => Promise<void>;
  cerrarSesion: () => void;
  puedeEditar: boolean;
  esAdministrador: boolean;
}

const AuthContext = createContext<ContextoAuth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const guardado = sessionStorage.getItem('usuario');
    return guardado ? JSON.parse(guardado) : null;
  });

  async function iniciarSesion(correo: string, contrasena: string) {
    const { data } = await api.post('/auth/login', { correo, contrasena });
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
  }

  // Registro público: crea la cuenta (rol visitante) y de inmediato inicia sesión
  async function registrarse(nombre: string, correo: string, contrasena: string) {
    await api.post('/auth/registro', { nombre, correo, contrasena });
    await iniciarSesion(correo, contrasena);
  }

  function cerrarSesion() {
    // Se notifica al backend para dejar constancia del cierre de sesión en la bitácora
    api.post('/auth/logout').catch(() => {});
    sessionStorage.clear();
    setUsuario(null);
  }

  const valor: ContextoAuth = {
    usuario,
    iniciarSesion,
    registrarse,
    cerrarSesion,
    puedeEditar: usuario?.rol === 'investigador' || usuario?.rol === 'administrador',
    esAdministrador: usuario?.rol === 'administrador',
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
