// src/shared/context/interfaces/auth.ts

export interface UserProfile {
  id: string;
  email: string;
  name: string;
}

export type UserRole = 'admin' | 'staff';

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  userRole: UserRole | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
}