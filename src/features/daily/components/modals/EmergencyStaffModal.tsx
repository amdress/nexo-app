// src/features/daily/components/control/EmergencyStaffModal.tsx
import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";
import BaseModal from "@/shared/components/modals/BaseModal";

interface AvailableStaffItem {
  id: string;
  name: string;
  role: string;
}

interface EmergencyStaffModalProps {
  visible: boolean;
  onClose: () => void;
  loading: boolean;
  availableStaff: AvailableStaffItem[];
  onSelectStaff: (staffId: string) => void;
}

export default function EmergencyStaffModal({
  visible,
  onClose,
  loading,
  availableStaff,
  onSelectStaff,
}: EmergencyStaffModalProps) {

    const [styles, COLORS] = useThemedStyles(getStyles);
  return (
    <BaseModal visible={visible} onClose={onClose}>
      <Text style={styles.title}>Adicionar Staff</Text>
      <Text style={styles.subtitle}>Selecione um funcionário disponível</Text>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 24 }} />
      ) : availableStaff.length === 0 ? (
        <Text style={styles.empty}>Nenhum funcionário disponível</Text>
      ) : (
        availableStaff.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={styles.row}
            onPress={() => onSelectStaff(s.id)}
            activeOpacity={0.7}
          >
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{s.name.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.name}>{s.name}</Text>
              <Text style={styles.role}>{s.role}</Text>
            </View>
            <Ionicons name="add-circle-outline" size={22} color={COLORS.primary} style={{ marginLeft: "auto" }} />
          </TouchableOpacity>
        ))
      )}
    </BaseModal>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  title: { color: COLORS.text, fontSize: 16, fontWeight: "700", marginBottom: 4 },
  subtitle: { color: COLORS.textMuted, fontSize: 13, marginBottom: 16 },
  empty: { color: COLORS.textMuted, fontSize: 14, textAlign: "center", paddingVertical: 24 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  avatarPlaceholder: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.border, justifyContent: "center", alignItems: "center" },
  avatarText: { color: COLORS.text, fontSize: 14, fontWeight: "bold" },
  name: { color: COLORS.text, fontSize: 14, fontWeight: "600" },
  role: { color: COLORS.textMuted, fontSize: 12 },
});