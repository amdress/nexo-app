// src/features/clients/components/forms/create/ClientDataStep.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { WizardStepChildProps } from "@/shared/components/wizards/interfaces/wizard";
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";

export default function ClientDataStep({
  state,
  updateState,
  onValidate,
}: WizardStepChildProps) {
  // Regla de validación: El nombre del cliente es obligatorio
  useEffect(() => {
    const hasName = state.name?.trim().length > 0;
    onValidate(hasName);
  }, [state.name, onValidate]);

  const [styles, COLORS] = useThemedStyles(getStyles);

  return (
    <View style={styles.content}>
      {/* 1. Nome do Cliente */}
      <Text style={styles.sectionTitle}>Nome do Cliente / Empresa *</Text>
      <TextInput
        style={styles.input}
        value={state.name}
        onChangeText={(val) => updateState("name", val)}
        placeholder="Ex: DHL"
        placeholderTextColor={COLORS.textMuted}
      />

      <View style={{ height: 16 }} />

      {/* 2. Conta / Rótulo da Conta */}
      <Text style={styles.sectionTitle}>Conta (Rótulo)</Text>
      <TextInput
        style={styles.input}
        value={state.accountLabel}
        onChangeText={(val) => updateState("accountLabel", val)}
        placeholder="Ex: MELI - DHL"
        placeholderTextColor={COLORS.textMuted}
      />

      <View style={{ height: 16 }} />

      {/* 3. Unidade / Site */}
      <Text style={styles.sectionTitle}>Unidade / Site</Text>
      <TextInput
        style={styles.input}
        value={state.site}
        onChangeText={(val) => updateState("site", val)}
        placeholder="Ex: CURITIBA - SVC"
        placeholderTextColor={COLORS.textMuted}
      />

      <View style={{ height: 16 }} />

      {/* 4. Endereço Completo */}
      <Text style={styles.sectionTitle}>Endereço Completo</Text>
      <TextInput
        style={styles.input}
        value={state.address}
        onChangeText={(val) => updateState("address", val)}
        placeholder="Ex: RUA SÃO BENTO 2143"
        placeholderTextColor={COLORS.textMuted}
      />

      <View style={{ height: 16 }} />

      {/* 5. Cidade / Estado */}
      <Text style={styles.sectionTitle}>Cidade / UF</Text>
      <TextInput
        style={styles.input}
        value={state.cityState}
        onChangeText={(val) => updateState("cityState", val)}
        placeholder="Ex: CURITIBA / PR"
        placeholderTextColor={COLORS.textMuted}
      />
    </View>
  );
}

const getStyles = (COLORS: any) =>
  StyleSheet.create({
    content: { padding: 16 },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: COLORS.textMuted,
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    input: {
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 15,
      color: COLORS.text,
    },
  });