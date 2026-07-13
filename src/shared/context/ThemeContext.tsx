// src/shared/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT_COLORS, DARK_COLORS, DESIGN_TOKENS, ACCENT_VARIANTS, AccentKey } from '@/constants/theme';

export type ThemeMode = 'light' | 'dark' | 'system';

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
  const systemColorScheme = useColorScheme();
  
  const [themeMode, _setThemeMode] = useState<ThemeMode>('dark');
  const [accentMode, _setAccentMode] = useState<AccentKey>('gold');

  useEffect(() => {
    async function loadStoredTheme() {
      try {
        const [storedMode, storedAccent] = await Promise.all([
          AsyncStorage.getItem(THEME_MODE_KEY),
          AsyncStorage.getItem(THEME_ACCENT_KEY),
        ]);
        if (storedMode) _setThemeMode(storedMode as ThemeMode);
        if (storedAccent && Object.keys(ACCENT_VARIANTS).includes(storedAccent)) {
          _setAccentMode(storedAccent as AccentKey);
        }
      } catch (error) {
        console.error('[Theme] Erro ao carregar preferências de tema:', error);
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

  // 1. Determinar si el modo actual es oscuro (calculado de forma reactiva)
  const isDarkMode = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';
  const baseColors = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

  // 2. Alternador directo para el Switch de la interfaz
  const toggleTheme = async () => {
    const nextMode: ThemeMode = isDarkMode ? 'light' : 'dark';
    await setThemeMode(nextMode);
  };

  // 3. Inyectar la acentuación de color dinámica seleccionada
  const activeColors = {
    ...baseColors,
    primary: ACCENT_VARIANTS[accentMode].primary,
    primaryDark: ACCENT_VARIANTS[accentMode].primaryDark,
  };

  const theme = {
    colors: activeColors,
    radius: DESIGN_TOKENS.radius,
  };

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