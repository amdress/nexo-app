// src/shared/components/wizards/BaseWizard.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";
import { BaseWizardProps } from './interfaces/wizard';

const { width } = Dimensions.get('window');

export default function BaseWizard({ steps, initialState, onFinish, onCancel }: BaseWizardProps) {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formState, setFormState] = useState<any>(initialState);
  const [isStepValid, setIsStepValid] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [styles, COLORS] = useThemedStyles(getStyles);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const totalSteps = steps.length;
  const CurrentStepComponent = steps[currentStep].component;

  useEffect(() => {
    slideAnim.setValue(width * 0.15);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  const updateState = (key: string, value: any) => {
    setFormState((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleNext = async () => {
    if (!isStepValid || isSubmitting) return;

    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      setIsStepValid(false); // Reseta para o próximo passo avaliar
    } else {
      setIsSubmitting(true);
      await onFinish(formState);
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setIsStepValid(true); // Permitir voltar sem travar
    } else {
      onCancel();
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Barra de Progresso Segmentada */}
      <View style={styles.progressContainer}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressSegment,
              index <= currentStep ? styles.segmentActive : styles.segmentInactive,
            ]}
          />
        ))}
      </View>

      {/* 2. Conteúdo do Passo com Animação Isolada */}
      <Animated.View style={[styles.stepContainer, { transform: [{ translateX: slideAnim }] }]}>
        <CurrentStepComponent 
          state={formState}
          updateState={updateState}
          onValidate={setIsStepValid}
        />
      </Animated.View>

      {/* 3. Rodapé de Ações Unificado com Respeito ao Notch */}
      <View style={[
        styles.footerActions, 
        { 
          paddingBottom: insets.bottom > 0 ? insets.bottom : 16,
          height: 70 + (insets.bottom > 0 ? insets.bottom - 10 : 0)
        }
      ]}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack} disabled={isSubmitting}>
          <Text style={styles.backBtnText}>Voltar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.nextBtn, (!isStepValid || isSubmitting) && styles.btnDisabled]} 
          onPress={handleNext}
          disabled={!isStepValid || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={COLORS.textDark} />
          ) : (
            <Text style={styles.nextBtnText}>
              {currentStep === totalSteps - 1 ? 'Concluir' : 'Avançar'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  progressContainer: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingVertical: 10 },
  progressSegment: { flex: 1, height: 4, borderRadius: 2 },
  segmentActive: { backgroundColor: COLORS.primary },
  segmentInactive: { backgroundColor: COLORS.border },
  stepContainer: { flex: 1, width: '100%' },
  footerActions: { flexDirection: 'row', gap: 12, padding: 5, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.surface, alignItems: 'center', marginBottom: 2 },
  backBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { color: COLORS.textMuted, fontSize: 15, fontWeight: '700' },
  nextBtn: { flex: 2, backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  nextBtnText: { color: COLORS.textDark, fontSize: 15, fontWeight: '700', marginBottom: 1  },
  btnDisabled: { backgroundColor: COLORS.border, opacity: 0.5 },
});