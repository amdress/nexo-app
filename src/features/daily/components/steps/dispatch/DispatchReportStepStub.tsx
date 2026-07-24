// src/features/daily/components/steps/dispatch/DispatchReportStepStub.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles } from '@/shared/hooks/useThemedStyles';
import { WizardStepChildProps } from '@/shared/components/wizards/interfaces/wizard';

/**
 * Placeholder do Passo 2 do dispatch (relatório geral).
 * A geração real do PDF/imagem do relatório completo (mock físico MMG/DHL)
 * ainda não foi construída — ver pendência do README de handoff.
 */
export default function DispatchReportStepStub({ onValidate }: WizardStepChildProps) {
  const [styles, COLORS] = useThemedStyles(getStyles);

  useEffect(() => {
    onValidate(true);
  }, [onValidate]);

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="document-text-outline" size={36} color={COLORS.textMuted} />
      </View>
      <Text style={styles.title}>Relatório geral</Text>
      <Text style={styles.subtitle}>
        Em breve: geração do relatório completo em PDF, pronto para impressão.
      </Text>
    </View>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});