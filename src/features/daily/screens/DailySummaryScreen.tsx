// src/features/daily/screens/DailySummaryScreen.tsx
import React, { useState } from 'react';
import { Alert } from 'react-native';
import ScreenLayout from '@/layouts/ScreenLayout';
import BaseWizard from '@/shared/components/wizards/BaseWizard';
import { StepItem } from '@/shared/components/wizards/interfaces/wizard';
import { dailyService } from '../services/dailyService';
import { useToast } from '@/shared/context/ToastContext';
import { LoaderBar } from '@/layouts/components/LoaderBar';

import EspelhoStep from '../components/steps/summary/EspelhoStep';
import SignatureQueueStepStub from '../components/steps/summary/SignatureQueueStepStub';

export default function DailySummaryScreen({ route, navigation }: any) {
  const { dailyId, staffData, dailyInfo } = route.params || {
    dailyId: '',
    staffData: [],
    dailyInfo: {},
  };

  const { showToast } = useToast();
  const [isSealing, setIsSealing] = useState(false);

  const isAlreadyCompleted = dailyInfo?.status === 'completed';
  console.log(staffData)

  const wizardSteps: StepItem[] = [
    { component: EspelhoStep },
    { component: SignatureQueueStepStub },
  ];

  const initialState = {
    dailyId,
    dailyInfo,
    staffData,
  };

  // O wizard termina (todos os passos válidos, "Concluir" tocado) → aqui selamos de verdade.
  const handleWizardFinish = async (finalState: any) => {
    try {
      // TODO (Paso 4b): loop salvando foto/assinatura de cada staff antes de selar,
      // usando finalState.staffData (já enriquecido pela fila real de assinaturas).

      await dailyService.updateDailyStatus(dailyId, 'completed');
      setIsSealing(true); 
    } catch (error: any) {
      Alert.alert('Erro', error?.message || 'Não foi possível encerrar a jornada. Tente novamente.');
    }
  };

  const handleSealAnimationComplete = () => {
    setIsSealing(false);
    showToast('Jornada encerrada com sucesso!', 'success');
    navigation.popToTop();
    // TODO (Paso 5): trocar por navigation.navigate('DailyDispatchScreen', { dailyId })
    // quando essa tela existir.
  };

  return (
    <ScreenLayout title="Resumo de Fechamento" onBackPress={() => navigation.goBack()}>
      {isAlreadyCompleted ? (
        <EspelhoStep
          state={initialState}
          updateState={() => {}}
          onValidate={() => {}}
        />
      ) : (
        <BaseWizard
          steps={wizardSteps}
          initialState={initialState}
          onFinish={handleWizardFinish}
          onCancel={() => navigation.goBack()}
        />
      )}

      <LoaderBar
        visible={isSealing}
        message="Selando jornada..."
        onAnimationComplete={handleSealAnimationComplete}
      />
    </ScreenLayout>
  );
}