// src/features/daily/components/control/StaffOptionsModal.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";
import BaseModal from "@/shared/components/modals/BaseModal";
import { StaffAttendance } from "../../interfacesUI/daily";

export interface StaffOption {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  action: () => void;
}

interface StaffOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  staff: StaffAttendance | null;
  options: StaffOption[];
}

export default function StaffOptionsModal({
  visible,
  onClose,
  staff,
  options,
}: StaffOptionsModalProps) {
const [styles, COLORS] = useThemedStyles(getStyles);

  return (
    <BaseModal visible={visible} onClose={onClose}>
      <Text style={styles.name}>{staff?.name}</Text>
      <Text style={styles.role}>{staff?.role}</Text>
      <View style={styles.divider} />

      {options.map((opt, i) => (
        <TouchableOpacity key={i} style={styles.row} onPress={opt.action} activeOpacity={0.7}>
          <Ionicons name={opt.icon} size={20} color={opt.color} />
          <Text style={[styles.rowLabel, { color: opt.color }]}>{opt.label}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.cancelRow} onPress={onClose}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
    </BaseModal>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  name: { color: COLORS.text, fontSize: 16, fontWeight: "700", textAlign: "center" },
  role: { color: COLORS.textMuted, fontSize: 13, textAlign: "center", marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  rowLabel: { fontSize: 15, fontWeight: "500" },
  cancelRow: { borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 8, paddingTop: 14, alignItems: "center" },
  cancelText: { color: COLORS.textMuted, fontSize: 14, fontWeight: "600" },
});