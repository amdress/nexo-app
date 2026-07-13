// src/shared/components/pickers/BaseDatePicker.tsx
import React, { useState } from 'react';
import { ComponentProps } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";
import { toISODate, toTimeString, formatDate, formatTime } from '../../utils/dateFormatter';

interface BaseDatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  mode: 'date' | 'time';
  label: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
  disabled?: boolean;
  /** Texto exibido enquanto value for null. Padrão: '--:--' para time, '--/--/----' para date */
  placeholder?: string;
  /** 'compact' remove o label e reduz o tamanho, para caber vários lado a lado */
  variant?: 'default' | 'compact';
}

export default function BaseDatePicker({
  value,
  onChange,
  mode,
  label,
  icon,
  disabled = false,
  placeholder,
  variant = 'default',
}: BaseDatePickerProps) {
  const [show, setShow] = useState(false);
  const [styles, COLORS] = useThemedStyles(getStyles);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const renderText = () => {
    if (!value) {
      return placeholder ?? (mode === 'time' ? '--:--' : '--/--/----');
    }
    if (mode === 'date') {
      const isoDate = toISODate(value);
      return formatDate(isoDate, 'pt-BR');
    }
    const timeStr = toTimeString(value);
    return formatTime(timeStr, 'pt-BR');
  };

  const isCompact = variant === 'compact';

  return (
    <View style={isCompact ? styles.compactContainer : styles.container}>
      <TouchableOpacity
        style={[
          isCompact ? styles.compactWrapper : styles.selectorWrapper,
          disabled && styles.selectorDisabled,
        ]}
        onPress={() => !disabled && setShow(true)}
        disabled={disabled}
      >
        {isCompact ? (
          <>
            {icon && <Ionicons name={icon} size={14} color={value ? COLORS.text : COLORS.textMuted} />}
            <Text style={[styles.compactText, !value && styles.compactTextEmpty]}>{renderText()}</Text>
          </>
        ) : (
          <>
            <View style={styles.selectorLeft}>
              {icon && <Ionicons name={icon} size={20} color={COLORS.textMuted} />}
              <View>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.selectorText}>{renderText()}</Text>
              </View>
            </View>
            <Ionicons name="chevron-down" size={18} color={COLORS.textMuted} />
          </>
        )}
      </TouchableOpacity>

      {show && (
        <>
          <DateTimePicker
            value={value ?? new Date()}
            mode={mode}
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleChange}
            minimumDate={mode === 'date' ? new Date() : undefined}
          />

          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.iosCloseButton} onPress={() => setShow(false)}>
              <Text style={styles.iosCloseButtonText}>Confirmar</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  container: { width: '100%' },
  label: { fontSize: 11, color: COLORS.textMuted, marginBottom: 2, textTransform: 'uppercase' },
  selectorWrapper: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorDisabled: { opacity: 0.4 },
  selectorLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  selectorText: { fontSize: 15, color: COLORS.text, fontWeight: '500' },
  iosCloseButton: { backgroundColor: COLORS.border, padding: 8, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  iosCloseButtonText: { color: COLORS.text, fontWeight: '600', fontSize: 13 },

  // ── Variante compacta ──
  compactContainer: { flex: 1 },
  compactWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingVertical: 6,
    height:50
  },
  compactText: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  compactTextEmpty: { color: COLORS.textMuted, fontWeight: '500' },
});