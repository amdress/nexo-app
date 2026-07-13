// src/shared/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT_COLORS, DARK_COLORS, DESIGN_TOKENS, ACCENT_VARIANTS, AccentKey } from '@/constants/theme';

export type ThemeMode = 'light' | 'dark'; // 🌟 Simplificado a binario puro conforme a la regla de negocio

interface ThemeContextType {
  themeMode: ThemeMode;
  accentMode: AccentKey;
  isDarkMode: boolean; 
  theme: {
    colors: typeof DARK_COLORS;
    radius: typeof DESIGN_TOKENS.radius;
  };
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setAccentMode: (accent: AccentKey) => Promise<void>;
  toggleTheme: () => Promise<void>; 
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_MODE_KEY = '@user_theme_mode';
const THEME_ACCENT_KEY = '@user_theme_accent';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 🌟 Inicializamos con un valor seguro, pero controlamos la preparación con un flag dedicado
  const [themeMode, _setThemeMode] = useState<ThemeMode>('dark');
  const [accentMode, _setAccentMode] = useState<AccentKey>('gold');
  const [isThemeThemeReady, setIsThemeThemeReady] = useState(false); // 🌟 Bloquea renderizados ciegos

  useEffect(() => {
    async function loadStoredTheme() {
      try {
        const [storedMode, storedAccent] = await Promise.all([
          AsyncStorage.getItem(THEME_MODE_KEY),
          AsyncStorage.getItem(THEME_ACCENT_KEY),
        ]);
        
        if (storedMode === 'light' || storedMode === 'dark') {
          _setThemeMode(storedMode);
        }
        
        if (storedAccent && Object.keys(ACCENT_VARIANTS).includes(storedAccent)) {
          _setAccentMode(storedAccent as AccentKey);
        }
      } catch (error) {
        console.error('[Theme] Erro ao carregar preferências de tema:', error);
      } finally {
        setIsThemeThemeReady(true); // 🌟 Liberamos el contexto con los datos reales leídos
      }
    }
    loadStoredTheme();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_MODE_KEY, mode);
      _setThemeMode(mode);
    } catch (error) {
      console.error('[Theme] Erro ao salvar modo de tema:', error);
    }
  };

  const setAccentMode = async (accent: AccentKey) => {
    try {
      await AsyncStorage.setItem(THEME_ACCENT_KEY, accent);
      _setAccentMode(accent);
    } catch (error) {
      console.error('[Theme] Erro ao salvar acentuação:', error);
    }
  };

  // Determinación limpia del modo binario activo
  const isDarkMode = themeMode === 'dark';
  const baseColors = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

  const toggleTheme = async () => {
    const nextMode: ThemeMode = isDarkMode ? 'light' : 'dark';
    await setThemeMode(nextMode);
  };

  const activeColors = {
    ...baseColors,
    primary: ACCENT_VARIANTS[accentMode].primary,
    primaryDark: ACCENT_VARIANTS[accentMode].primaryDark,
  };

  const theme = {
    colors: activeColors,
    radius: DESIGN_TOKENS.radius,
  };

  // 🌟 Evita el parpadeo y la renderización de componentes antes de leer AsyncStorage
  if (!isThemeThemeReady) {
    return null; 
  }

  return (
    <ThemeContext.Provider value={{ themeMode, accentMode, isDarkMode, theme, setThemeMode, setAccentMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  return context;
}