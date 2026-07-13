// src/features/daily/components/create/DailyConfirmModal.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";
import BaseModal from "../../../../shared/components/modals/BaseModal";
import {
  toISODate,
  toTimeString,
  formatDate,
  formatTimeRange,
} from "../../../../shared/utils/dateFormatter";

interface DailyConfirmModalProps {
  visible: boolean;
  isIncomplete: boolean;
  isSubmitting: boolean;
  date: Date;
  startTime: Date;
  endTime: Date;
  description: string;
  totalSelected: number;
  requiredStaffCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

const WARNING_COLOR = "#E6AD12";
const WARNING_BG = "#3A2E1A";

export default function DailyConfirmModal({
  visible,
  isIncomplete,
  isSubmitting,
  date,
  startTime,
  endTime,
  description,
  totalSelected,
  requiredStaffCount,
  onCancel,
  onConfirm,
}: DailyConfirmModalProps) {
  
  // Convertemos e formatamos usando tuas funções centralizadas
  const formattedDate = date ? formatDate(toISODate(date)) : "";
  const formattedTimeRange = (startTime && endTime) 
    ? formatTimeRange(toTimeString(startTime), toTimeString(endTime))
    : "";

  // Obtém o dia da semana por extenso em português (ex: "segunda-feira")
  const getWeekdayLabel = (targetDate: Date) => {
    if (!targetDate) return "";
    try {
      const weekday = targetDate.toLocaleDateString("pt-BR", { weekday: "long" });
      // Remove o "-feira" se existir e coloca a primeira letra em maiúscula
      const cleanName = weekday.split("-")[0];
      return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    } catch {
      return "";
    }
  };

  const weekdayLabel = getWeekdayLabel(date);
  const [styles, COLORS] = useThemedStyles(getStyles);

  return (
    <BaseModal visible={visible} onClose={onCancel} dismissible={!isSubmitting}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons
          name={isIncomplete ? "warning-outline" : "checkbox-outline"}
          size={28}
          color={isIncomplete ? WARNING_COLOR : COLORS.success}
        />
        <Text style={styles.title}>Conferir Nova Jornada</Text>
      </View>

      {/* Warning Box */}
      {isIncomplete && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            Atenção: A jornada será aberta sem atingir a meta estipulada de funcionários.
          </Text>
        </View>
      )}

      {/* Info Container */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Data Selecionada:</Text>
          {/* Exibe o dia por extenso concatenado com a data formatada */}
          <Text style={styles.infoValue}>
            {weekdayLabel ? `${weekdayLabel}, ${formattedDate}` : formattedDate}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Horário do Turno:</Text>
          <Text style={styles.infoValue}>{formattedTimeRange}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Funcionários:</Text>
          <Text
            style={[
              styles.infoValue,
              isIncomplete && { color: WARNING_COLOR, fontWeight: "bold" },
            ]}
          >
            {totalSelected} de {requiredStaffCount} Req...
          </Text>
        </View>

        {description ? (
          <View style={styles.infoRowBlock}>
            <Text style={styles.infoLabelText}>Descrição da Operação:</Text>
            <Text style={styles.infoValueDesc}>{`"${description}"`}</Text>
          </View>
        ) : null}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={onCancel}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.confirmBtn,
            { backgroundColor: isIncomplete ? WARNING_COLOR : COLORS.success },
          ]}
          onPress={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={COLORS.textDark} />
          ) : (
            <Text style={styles.confirmBtnText}>
              {isIncomplete ? "Confirmar Abertura" : "Abrir Jornada"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </BaseModal>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  warningBox: {
    backgroundColor: WARNING_BG,
    borderColor: WARNING_COLOR,
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
  },
  warningText: {
    color: WARNING_COLOR,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  infoContainer: { gap: 12, marginBottom: 24 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  infoLabel: { fontSize: 14, color: COLORS.textMuted },
  infoValue: { fontSize: 14, color: COLORS.text, fontWeight: "500" },
  infoRowBlock: { gap: 4 },
  infoLabelText: { fontSize: 14, color: COLORS.textMuted },
  infoValueDesc: {
    fontSize: 14,
    color: COLORS.text,
    fontStyle: "italic",
    backgroundColor: COLORS.background,
    padding: 8,
    borderRadius: 6,
    marginTop: 2,
  },
  actions: { flexDirection: "row", gap: 12 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelBtnText: { color: COLORS.textMuted, fontWeight: "600", fontSize: 14 },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: { color: COLORS.textDark, fontWeight: "700", fontSize: 14 },
});