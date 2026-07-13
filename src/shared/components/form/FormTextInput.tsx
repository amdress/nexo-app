// src/shared/components/form/FormTextInput.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";
import { applyMask, InputMask } from './inputMasks';

interface FormTextInputProps extends Omit<TextInputProps, 'onChangeText'> {
  label: string;
  required?: boolean;
  mask?: InputMask;
  onChangeText?: (text: string) => void;
  /** Ativa o modo senha: mascara o texto e mostra o ícone de olho para alternar visibilidade */
  isPassword?: boolean;
}

const MASK_MAX_LENGTH: Record<InputMask, number> = {
  cpf: 14,      // 123.456.789-00
  phone: 15,    // (41) 99999-0000
};

export default function FormTextInput({
  label,
  required,
  mask,
  onChangeText,
  keyboardType,
  maxLength,
  isPassword = false,
  secureTextEntry,
  ...inputProps
}: FormTextInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [styles, COLORS] = useThemedStyles(getStyles);

  const handleChangeText = (text: string) => {
    onChangeText?.(applyMask(mask, text));
  };

  // Se isPassword estiver ativo, o secureTextEntry é controlado pelo toggle interno
  const resolvedSecureTextEntry = isPassword ? !isPasswordVisible : secureTextEntry;

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}{required ? ' *' : ''}
      </Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.textInput, isPassword && styles.textInputWithIcon]}
          placeholderTextColor={COLORS.textMuted}
          onChangeText={handleChangeText}
          keyboardType={mask ? 'numeric' : keyboardType}
          maxLength={mask ? MASK_MAX_LENGTH[mask] : maxLength}
          secureTextEntry={resolvedSecureTextEntry}
          autoCapitalize={isPassword ? 'none' : inputProps.autoCapitalize}
          {...inputProps}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsPasswordVisible((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        )}
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
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontSize: 14,
  },
  textInputWithIcon: {
    paddingRight: 44,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    width: 28,
  },
});