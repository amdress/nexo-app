// App.tsx completo y corregido
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AnimatedSplash from "@/layouts/AnimatedSplash";
import NavigationProvider from "@/navigation"; 
import { ToastProvider } from "@/shared/context/ToastContext";
import { ThemeProvider } from "@/shared/context/ThemeContext"; 
import { runMigrations } from "@/database/migrations";
import { initializeLanguage } from "@/shared/config/i18n";

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

  // Modificado: Envolvemos el estado de carga en el ThemeProvider
  // para evitar que cualquier inicialización temprana rompa el contexto.
  if (!isSystemReady || !isAnimationDone) {
    return (
      <ThemeProvider>
        <AnimatedSplash onAnimationComplete={() => setIsAnimationDone(true)} />
        <StatusBar style="dark" /> 
      </ThemeProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          <NavigationProvider />
          <StatusBar style="auto" />
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}