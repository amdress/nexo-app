// src/features/staff/components/form/StatusToggle.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";

interface StatusToggleProps {
  status: 'active' | 'inactive';
  onChange: (status: 'active' | 'inactive') => void;
  disabled?: boolean;
}

export default function StatusToggle({ status, onChange, disabled }: StatusToggleProps) {
  const [styles, COLORS] = useThemedStyles(getStyles);
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>Status Administrativo</Text>
      <View style={styles.statusToggleContainer}>
        <TouchableOpacity
          style={[styles.statusOption, status === 'active' && styles.statusActiveSelected]}
          onPress={() => onChange('active')}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={status === 'active' ? COLORS.success : COLORS.textMuted}
          />
          <Text style={[styles.statusOptionText, status === 'active' && styles.textActive]}>Ativo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statusOption, status === 'inactive' && styles.statusInactiveSelected]}
          onPress={() => onChange('inactive')}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Ionicons
            name="close-circle"
            size={18}
            color={status === 'inactive' ? '#FF8888' : COLORS.textMuted}
          />
          <Text style={[styles.statusOptionText, status === 'inactive' && styles.textInactive]}>Inativo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  statusToggleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statusOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 44,
  },
  statusActiveSelected: {
    borderColor: '#205A20',
    backgroundColor: '#1A2A1A',
  },
  statusInactiveSelected: {
    borderColor: '#5A2020',
    backgroundColor: '#3A1A1A',
  },
  statusOptionText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  textActive: {
    color: COLORS.success,
  },
  textInactive: {
    color: '#FF8888',
  },
});