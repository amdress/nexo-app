export interface AuthContextType {
  isAuthenticated: boolean;
  userRole: 'admin' | 'staff' | null;
  login: (role: 'admin' | 'staff') => void;
  logout: () => void;
}