import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, UserRole } from '../interfaces/auth';

export interface UserSession {
  token: string;
  user: UserProfile;
  role: UserRole;
}

const AUTH_TOKEN_KEY = '@user_auth_token';
const USER_DATA_KEY = '@user_profile_data';
const USER_ROLE_KEY = '@user_role_data';

export const AuthService = {
  /**
   * Realiza o login e persiste localmente o token, dados do perfil e o papel de acesso.
   */
  async login(email: string, password: string, role: UserRole): Promise<UserSession | null> {
    try {
      // Validação básica temporária
      if (email.includes('@') && password.length >= 4) {
        const mockSession: UserSession = {
          token: 'mock-jwt-token-kubix-sys-2026',
          user: {
            id: 'usr_100293',
            email: email,
            name: email.split('@')[0],
          },
          role: role
        };

        // Gravação atómica no AsyncStorage
        await Promise.all([
          AsyncStorage.setItem(AUTH_TOKEN_KEY, mockSession.token),
          AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(mockSession.user)),
          AsyncStorage.setItem(USER_ROLE_KEY, mockSession.role),
        ]);

        return mockSession;
      }
      
      return null;
    } catch (error) {
      console.error('[AuthService] Erro ao processar login:', error);
      throw error;
    }
  },

  /**
   * Remove todos os dados de sessão armazenados.
   */
  async logout(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(AUTH_TOKEN_KEY),
        AsyncStorage.removeItem(USER_DATA_KEY),
        AsyncStorage.removeItem(USER_ROLE_KEY),
      ]);
    } catch (error) {
      console.error('[AuthService] Erro ao limpar dados de sessão:', error);
      throw error;
    }
  },

  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  },

  async getStoredUser(): Promise<UserProfile | null> {
    const data = await AsyncStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  },

  async getStoredRole(): Promise<UserRole | null> {
    const role = await AsyncStorage.getItem(USER_ROLE_KEY);
    return role as UserRole | null;
  }
};