// src/shared/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, UserProfile, UserRole } from '@/features/auth/interfaces/auth';
import { AuthService } from '@/features/auth/services/authService';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 💡 Middleware Inicial de Restauração de Sessão
  useEffect(() => {
    async function checkSession() {
      try {
        const token = await AuthService.getStoredToken();
        if (token) {
          const [storedUser, storedRole] = await Promise.all([
            AuthService.getStoredUser(),
            AuthService.getStoredRole()
          ]);
          setUser(storedUser);
          setUserRole(storedRole);
        }
      } catch (error) {
        console.error('[AuthContext] Erro ao restaurar sessão inicial:', error);
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      const session = await AuthService.login(email, password, role);
      if (session) {
        setUser(session.user);
        setUserRole(session.role);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[AuthContext] Erro na ação de login:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      setUserRole(null);
    } catch (error) {
      console.error('[AuthContext] Erro ao deslogar:', error);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);