// src/navigation/index.tsx
import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "@/shared/context/AuthContext";
import AppNavigation from "./AppNavigation";
import LoginScreen from "@/features/auth/screens/LoginScreen";

export default function NavigationProvider() {
  const { isAuthenticated, isLoading } = useAuth(); 

  // Apresenta um indicador de carregamento enquanto o AuthProvider valida se existe sessão salva
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFC107" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <LoginScreen />
      ) : (
        <AppNavigation />

      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121214", // Fundo padrão escuro do ecossistema KUBIX
  },
});