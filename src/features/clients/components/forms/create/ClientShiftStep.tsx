// src/features/clients/components/forms/create/ClientShiftStep.tsx
import React, { useState, useEffect } from "react";
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
import { parseTimeString, toTimeString } from "@/shared/utils/dateFormatter";
import { ClientShiftDraft } from "../../../dto/ClientCreateDto";

export default function ClientShiftStep({
  state,
  updateState,
  onValidate,
}: WizardStepChildProps) {
  // Los turnos son opcionales en la creación, el paso siempre es válido
  useEffect(() => {
    onValidate(true);
  }, [onValidate]);

  const [styles, COLORS] = useThemedStyles(getStyles);

  // Estados locales para el borrador del turno actual
  const [shiftName, setShiftName] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("08:00");
  const [endTime, setEndTime] = useState<string>("17:48");
  const [breakDuration, setBreakDuration] = useState<string>("1h");
  const [demandInfo, setDemandInfo] = useState<string>("");

  // Agrega el turno al arreglo del Wizard y reinicia el formulario local
  const handleAddShift = () => {
    if (!shiftName.trim() || !demandInfo.trim()) return;

    const newShift: ClientShiftDraft = {
      name: shiftName.trim(),
      startTime,
      endTime,
      breakDuration: breakDuration.trim() || "1h",
      demandInfo: demandInfo.trim(),
      defaultStaffCount: 1, // Valor por defecto técnico
    };

    const currentShifts = state.shifts || [];
    updateState("shifts", [...currentShifts, newShift]);

    // Limpieza de campos para permitir agregar múltiples turnos
    setShiftName("");
    setDemandInfo("");
    setStartTime("08:00");
    setEndTime("17:48");
    setBreakDuration("1h");
  };

  const handleRemoveShift = (index: number) => {
    const currentShifts = [...(state.shifts || [])];
    currentShifts.splice(index, 1);
    updateState("shifts", currentShifts);
  };

  return (
    <View style={styles.content}>
      {/* 1. Lista de Turnos Acumulados */}
      {state.shifts && state.shifts.length > 0 && (
        <View style={styles.shiftsListContainer}>
          <Text style={styles.sectionTitle}>
            Turnos Cadastrados ({state.shifts.length})
          </Text>
          {state.shifts.map((shift: ClientShiftDraft, index: number) => (
            <View key={index} style={styles.shiftCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.shiftTitle}>{shift.name}</Text>
                <Text style={styles.shiftSubtitle}>
                  {shift.startTime} - {shift.endTime} | {shift.demandInfo}
                </Text>
                <Text style={styles.shiftMeta}>
                  Intervalo: {shift.breakDuration}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveShift(index)}
                style={styles.deleteBtn}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={COLORS.danger || "#EF4444"}
                />
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.divider} />
        </View>
      )}

      {/* 2. Formulario para Adición de Nuevo Turno */}
      <Text style={styles.sectionTitle}>Adicionar Turno para esta Empresa</Text>

      {/* Nome do Turno */}
      <TextInput
        style={styles.input}
        value={shiftName}
        onChangeText={setShiftName}
        placeholder="Ex: Turno 1 - Diurno"
        placeholderTextColor={COLORS.textMuted}
      />

      <View style={{ height: 12 }} />

      {/* Horários de Início e Término */}
      <View style={styles.timeRow}>
        <View style={{ flex: 1 }}>
          <BaseDatePicker
            value={parseTimeString(startTime)}
            onChange={(selectedDate: Date) =>
              setStartTime(toTimeString(selectedDate))
            }
            mode="time"
            label="Início"
            icon="time-outline"
          />
        </View>
        <View style={{ flex: 1 }}>
          <BaseDatePicker
            value={parseTimeString(endTime)}
            onChange={(selectedDate: Date) =>
              setEndTime(toTimeString(selectedDate))
            }
            mode="time"
            label="Término"
            icon="time-outline"
          />
        </View>
      </View>

      <View style={{ height: 12 }} />

      {/* Duração do Intervalo */}
      <TextInput
        style={styles.input}
        value={breakDuration}
        onChangeText={setBreakDuration}
        placeholder="Duração Intervalo (Ex: 1h)"
        placeholderTextColor={COLORS.textMuted}
      />

      <View style={{ height: 12 }} />

      {/* Dias de Demanda / Escala */}
      <TextInput
        style={styles.input}
        value={demandInfo}
        onChangeText={setDemandInfo}
        placeholder="Escala / Demanda (Ex: SEG A SEX E DOM)"
        placeholderTextColor={COLORS.textMuted}
      />

      <View style={{ height: 16 }} />

      {/* Botão de Acumular Turno */}
      <TouchableOpacity
        style={[
          styles.addShiftBtn,
          (!shiftName.trim() || !demandInfo.trim()) && styles.disabledBtn,
        ]}
        onPress={handleAddShift}
        disabled={!shiftName.trim() || !demandInfo.trim()}
      >
        <Ionicons name="add-circle-outline" size={20} color="#FFF" />
        <Text style={styles.addShiftBtnText}>Adicionar Turno à Lista</Text>
      </TouchableOpacity>
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
    timeRow: { flexDirection: "row", gap: 12 },
    input: {
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 15,
      color: COLORS.text,
    },
    addShiftBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: COLORS.primary || "#2563EB",
      padding: 12,
      borderRadius: 8,
    },
    disabledBtn: { opacity: 0.5 },
    addShiftBtnText: {
      color: "#FFFFFF",
      fontWeight: "600",
      fontSize: 14,
    },
    shiftsListContainer: { marginBottom: 16 },
    shiftCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
    },
    shiftTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: COLORS.text,
    },
    shiftSubtitle: {
      fontSize: 13,
      color: COLORS.textMuted,
      marginTop: 2,
    },
    shiftMeta: {
      fontSize: 12,
      color: COLORS.textMuted,
      marginTop: 2,
    },
    deleteBtn: { padding: 8 },
    divider: {
      height: 1,
      backgroundColor: COLORS.border,
      marginVertical: 12,
    },
  });