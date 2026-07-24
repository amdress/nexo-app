// src/features/daily/screens/DailyCreateScreen.tsx
import React, { useState } from "react";
import ScreenLayout from "@/layouts/ScreenLayout";
import BaseWizard from "@/shared/components/wizards/BaseWizard";
import { StepItem } from "@/shared/components/wizards/interfaces/wizard";
import { dailyService } from "../services/dailyService";
import { useToast } from "@/shared/context/ToastContext";
import {
  toISODate,
  toTimeString,
  formatTime,
} from "@/shared/utils/dateFormatter";
import DailyCreateConfirmModal from "../components/modals/DailyCreateConfirmModal";

import DailyStepOne from "../components/forms/create/DailyStepOne";
import DailyStepTwo from "../components/forms/create/DailyStepTwo";
import DailyStepZero from "../components/forms/create/DailyStepZero";
import { DailyCreateDto } from "../dto/DailyCreateDto";

export default function DailyCreateScreen({ navigation }: any) {
  const { showToast } = useToast();
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [pendingState, setPendingState] = useState<any>(null);

  const wizardSteps: StepItem[] = [
    { component: DailyStepZero },
    { component: DailyStepOne },
    { component: DailyStepTwo },
  ];

  const initialState = {
    date: new Date(),
    startTime: (() => {
      const d = new Date();
      d.setHours(8, 0, 0, 0);
      return d;
    })(),
    endTime: (() => {
      const d = new Date();
      d.setHours(17, 0, 0, 0);
      return d;
    })(),
    requiredStaffCount: 2,
    description: "Dia Operacional Normal",
    selectedStaffIds: [],
  };

  // El Wizard termina y le escupe los datos al padre aquí.
  const handleWizardFinish = (finalState: any) => {
    setPendingState(finalState);
    setShowConfirmModal(true); // El padre decide abrir su modal de confirmación
  };

// El padre ejecuta la lógica de negocio y consume su servicio
  const handleFinalSubmit = async () => {
    if (!pendingState) return;

    setIsSubmitting(true);
    
    // Mapeamos temporalmente desde el estado del wizard
   const payload: DailyCreateDto = {
      clientId: (pendingState as any).clientId || "",
      shiftId: (pendingState as any).shiftId || "",
      date: (pendingState as any).date || "",
      requiredStaffCount: (pendingState as any).requiredStaffCount || 0,
      selectedStaffIds: (pendingState as any).selectedStaffIds || [],
      observations: (pendingState as any).description || "",
      createdAt: new Date().toISOString(),
    };

    try {
      await dailyService.createDaily(payload);
      setIsSubmitting(false);
      setShowConfirmModal(false);
      navigation.navigate("MainTabs", { screen: "Daily" });
      showToast("Jornada criada com sucesso!", "success");
    } catch (error: any) {
      setIsSubmitting(false);
      setShowConfirmModal(false);
      showToast(error?.message || "Erro ao salvar a jornada.", "error");
    }
  };

  return (
    <ScreenLayout
      title="Nova Jornada Diária"
      onBackPress={() => navigation.goBack()}
    >
      <BaseWizard
        steps={wizardSteps}
        initialState={initialState}
        onFinish={handleWizardFinish}
        onCancel={() => navigation.goBack()}
      />

      {pendingState && (
        <DailyCreateConfirmModal
          visible={showConfirmModal}
          isIncomplete={
            pendingState.selectedStaffIds.length <
            pendingState.requiredStaffCount
          }
          isSubmitting={isSubmitting}
          date={pendingState.date}
          startTime={pendingState.startTime}
          endTime={pendingState.endTime}
          description={pendingState.description}
          totalSelected={pendingState.selectedStaffIds.length}
          requiredStaffCount={pendingState.requiredStaffCount}
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={handleFinalSubmit}
        />
      )}
    </ScreenLayout>
  );
}
