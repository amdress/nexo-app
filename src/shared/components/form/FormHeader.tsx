// src/shared/components/form/FormHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";

interface FormHeaderProps {
  title: string;
  onClose: () => void;
  disabled?: boolean;
}

export default function FormHeader({ title, onClose, disabled }: FormHeaderProps) {
  const [styles, COLORS] = useThemedStyles(getStyles);
  return (
    <View style={styles.navHeader}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onClose}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={24} color={COLORS.text} />
      </TouchableOpacity>
      <Text style={styles.navTitle}>{title}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

const getStyles = (COLORS: any) =>  StyleSheet.create({
  navHeader: {
    height: 56,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  navTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 32,
  },
});