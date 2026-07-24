// src/features/clients/components/modals/ClientShiftModal.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import BaseModal from "@/shared/components/modals/BaseModal"; // Ajusta la ruta a tu BaseModal
import BaseDatePicker from "@/shared/components/pickers/BaseDatePicker";
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";
import { parseTimeString, toTimeString } from "@/shared/utils/dateFormatter";
import { ClientShiftUI } from "../../interfacesUI/clientUI";
import { ClientShiftDraft } from "../../dto/ClientCreateDto";

interface ClientShiftModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: ClientShiftDraft) => Promise<void>;
  initialData?: ClientShiftUI | null;
}

export default function ClientShiftModal({
  visible,
  onClose,
  onSave,
  initialData,
}: ClientShiftModalProps) {
  const [styles, COLORS] = useThemedStyles(getStyles);

  const [shiftName, setShiftName] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("08:00");
  const [endTime, setEndTime] = useState<string>("17:48");
  const [breakDuration, setBreakDuration] = useState<string>("1h");
  const [demandInfo, setDemandInfo] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (initialData) {
      setShiftName(initialData.name);
      setStartTime(initialData.startTime);
      setEndTime(initialData.endTime);
      setBreakDuration(initialData.breakDuration);
      setDemandInfo(initialData.demandInfo);
    } else {
      setShiftName("");
      setStartTime("08:00");
      setEndTime("17:48");
      setBreakDuration("1h");
      setDemandInfo("");
    }
  }, [initialData, visible]);

  const handleSave = async () => {
    if (!shiftName.trim() || !demandInfo.trim()) return;

    try {
      setSubmitting(true);
      await onSave({
        name: shiftName.trim(),
        startTime,
        endTime,
        breakDuration: breakDuration.trim() || "1h",
        demandInfo: demandInfo.trim(),
        defaultStaffCount: 1,
      });
      onClose();
    } catch (error) {
      // Error manejado en la pantalla principal
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BaseModal visible={visible} onClose={onClose}>
      <Text style={styles.title}>
        {initialData ? "Editar Turno" : "Novo Turno"}
      </Text>

      <TextInput
        style={styles.input}
        value={shiftName}
        onChangeText={setShiftName}
        placeholder="Ex: Turno 1 - Diurno"
        placeholderTextColor={COLORS.textMuted}
      />

      <View style={{ height: 12 }} />

      <View style={styles.timeRow}>
        <View style={{ flex: 1 }}>
          <BaseDatePicker
            value={parseTimeString(startTime)}
            onChange={(selectedDate: Date) => setStartTime(toTimeString(selectedDate))}
            mode="time"
            label="Início"
            icon="time-outline"
          />
        </View>
        <View style={{ flex: 1 }}>
          <BaseDatePicker
            value={parseTimeString(endTime)}
            onChange={(selectedDate: Date) => setEndTime(toTimeString(selectedDate))}
            mode="time"
            label="Término"
            icon="time-outline"
          />
        </View>
      </View>

      <View style={{ height: 12 }} />

      <TextInput
        style={styles.input}
        value={breakDuration}
        onChangeText={setBreakDuration}
        placeholder="Duração Intervalo (Ex: 1h)"
        placeholderTextColor={COLORS.textMuted}
      />

      <View style={{ height: 12 }} />

      <TextInput
        style={styles.input}
        value={demandInfo}
        onChangeText={setDemandInfo}
        placeholder="Escala / Demanda (Ex: SEG A SEX E DOM)"
        placeholderTextColor={COLORS.textMuted}
      />

      <View style={{ height: 20 }} />

      <TouchableOpacity
        style={[
          styles.saveBtn,
          (!shiftName.trim() || !demandInfo.trim() || submitting) && styles.disabledBtn,
        ]}
        onPress={handleSave}
        disabled={!shiftName.trim() || !demandInfo.trim() || submitting}
      >
        <Text style={styles.saveBtnText}>
          {submitting ? "Salvando..." : "Salvar Turno"}
        </Text>
      </TouchableOpacity>
    </BaseModal>
  );
}

const getStyles = (COLORS: any) =>
  StyleSheet.create({
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: COLORS.text,
      marginBottom: 16,
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
    saveBtn: {
      backgroundColor: COLORS.primary || "#2563EB",
      padding: 14,
      borderRadius: 8,
      alignItems: "center",
    },
    disabledBtn: { opacity: 0.5 },
    saveBtnText: {
      color: "#FFFFFF",
      fontWeight: "600",
      fontSize: 15,
    },
  });