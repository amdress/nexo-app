// src/shared/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType } from './interfaces/auth';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'staff' | null>(null);

  // 💡 Middleware Inicial: Aquí podrías leer un token de SecureStore o verificar la DB SQLite al arrancar
  useEffect(() => {
    async function checkSession() {
      // Ex: const token = await SecureStore.getItemAsync('user_token');
      // Si existe, actualizas los estados.
    }
    checkSession();
  }, []);

  const login = (role: 'admin' | 'staff') => {
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);