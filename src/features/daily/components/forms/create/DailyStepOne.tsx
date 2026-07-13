// src/features/daily/components/steps/DailyStepOne.tsx
import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BaseDatePicker from "@/shared/components/pickers/BaseDatePicker";
import { WizardStepChildProps } from "@/shared/components/wizards/interfaces/wizard";
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";

export default function DailyStepOne({
  state,
  updateState,
  onValidate,
}: WizardStepChildProps) {
  // Regla de validación: La descripción no puede estar vacía y debe haber al menos 1 staff solicitado
  useEffect(() => {
    const hasDescription = state.description?.trim().length > 0;
    const hasValidStaffCount = state.requiredStaffCount >= 1;
    onValidate(hasDescription && hasValidStaffCount);
  }, [state.description, state.requiredStaffCount, onValidate]);

  const currentCount = state.requiredStaffCount || 2;
  const [styles, COLORS] = useThemedStyles(getStyles);

  return (
    <View style={styles.content}>
      {/* 1. Selección de Fecha */}
      <Text style={styles.sectionTitle}>Selecionar Data</Text>
      <BaseDatePicker
        value={state.date}
        onChange={(val) => updateState("date", val)}
        mode="date"
        label="Data da Jornada"
        icon="calendar-outline"
      />

      <View style={{ height: 16 }} />

      {/* 2. Rango de Horas */}
      <Text style={styles.sectionTitle}>Horário do Turno</Text>
      <View style={styles.timeRow}>
        <View style={{ flex: 1 }}>
          <BaseDatePicker
            value={state.startTime}
            onChange={(val) => updateState("startTime", val)}
            mode="time"
            label="Início"
            icon="time-outline"
          />
        </View>
        <View style={{ flex: 1 }}>
          <BaseDatePicker
            value={state.endTime}
            onChange={(val) => updateState("endTime", val)}
            mode="time"
            label="Término"
            icon="time-outline"
          />
        </View>
      </View>

      <View style={{ height: 16 }} />

      {/* 3. Cantidad de Funcionarios Solicitados */}
      <Text style={styles.sectionTitle}>Quantidade de Staff Solicitada</Text>
      <View style={styles.counterRow}>
        <TouchableOpacity
          style={styles.counterBtn}
          onPress={() =>
            updateState("requiredStaffCount", Math.max(1, currentCount - 1))
          }
        >
          <Ionicons name="remove" size={20} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.counterValue}>{currentCount}</Text>

        <TouchableOpacity
          style={styles.counterBtn}
          onPress={() => updateState("requiredStaffCount", currentCount + 1)}
        >
          <Ionicons name="add" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* 4. Descripción del Turno */}
      <Text style={styles.sectionTitle}>Descrição da Jornada</Text>
      <TextInput
        style={styles.input}
        value={state.description}
        onChangeText={(val) => updateState("description", val)}
        placeholder="Ex: Evento Especial..."
        placeholderTextColor={COLORS.textMuted}
      />
    </View>
  );
}
const getStyles = (COLORS: any) => StyleSheet.create({
  content: { padding: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timeRow: { flexDirection: "row", gap: 12 },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  counterBtn: { paddingHorizontal: 16, paddingVertical: 12 },
  counterValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    minWidth: 40,
    textAlign: "center",
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
