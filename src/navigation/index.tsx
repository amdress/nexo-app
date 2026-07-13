// src/navigation/index.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigation from "./AppNavigation";
// import AuthNavigation from "./AuthNavigation"; // A futuro para Login

export default function NavigationProvider() {
  // 💡 MOCK DE PERMISOS / AUTENTICACIÓN PARA EL FUTURO
  // const { user, isAuthenticated } = useAuth(); 
  const isAuthenticated = true; // Forzado por ahora para desarrollo

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <AppNavigation />
      ) : (
        /* <AuthNavigation /> */ null
      )}
    </NavigationContainer>
  );
}