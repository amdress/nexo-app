// App.tsx completo e corrigido
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AnimatedSplash from "@/layouts/AnimatedSplash";
import NavigationProvider from "@/navigation";
import { ToastProvider } from "@/shared/context/ToastContext";
import { ThemeProvider, useTheme } from "@/shared/context/ThemeContext";
import { runMigrations } from "@/database/migrations";
import { initializeLanguage } from "@/shared/config/i18n";

/** Conecta o StatusBar ao ThemeContext da própria app, em vez do tema do sistema operacional */
function ThemedStatusBar() {
  const { isDarkMode } = useTheme();
  return <StatusBar style={isDarkMode ? "light" : "dark"} />;
}

export default function App() {
  const [isSystemReady, setIsSystemReady] = useState(false);
  const [isAnimationDone, setIsAnimationDone] = useState(false);

  useEffect(() => {
    async function bootstrapApp() {
      try {
        await Promise.all([
          runMigrations(),
          initializeLanguage()
        ]);
        setIsSystemReady(true);
      } catch (error) {
        console.error("[Fatal] Falha Crítica ao inicializar os serviços essenciais:", error);
      }
    }
    bootstrapApp();
  }, []);

  if (!isSystemReady || !isAnimationDone) {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <AnimatedSplash onAnimationComplete={() => setIsAnimationDone(true)} />
          <ThemedStatusBar />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          <NavigationProvider />
          <ThemedStatusBar />
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}