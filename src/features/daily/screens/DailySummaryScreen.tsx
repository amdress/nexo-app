// src/features/daily/screens/DailySummaryScreen.tsx
import React, { useState } from "react";
import { Alert } from "react-native";
import ScreenLayout from "@/layouts/ScreenLayout";
import BaseWizard from "@/shared/components/wizards/BaseWizard";
import { StepItem } from "@/shared/components/wizards/interfaces/wizard";
import { dailyService } from "../services/dailyService";
import { useToast } from "@/shared/context/ToastContext";
import { LoaderBar } from "@/layouts/components/LoaderBar";
import { StaffAttendance } from "../interfacesUI/daily";

import EspelhoStep from "../components/steps/summary/EspelhoStep";
import SignatureQueueStep from "../components/steps/summary/SignatureQueueStepStub";

export default function DailySummaryScreen({ route, navigation }: any) {
  const { dailyId, staffData, dailyInfo } = route.params || {
    dailyId: "",
    staffData: [],
    dailyInfo: {},
  };

  const { showToast } = useToast();
  const [isSealing, setIsSealing] = useState(false);

  const isAlreadyCompleted = dailyInfo?.status === "completed";

  const wizardSteps: StepItem[] = [
    { component: EspelhoStep },
    { component: SignatureQueueStep },
  ];

  const initialState = {
    dailyId,
    dailyInfo,
    staffData,
  };

  const handleWizardFinish = async (finalState: any) => {
    try {
      const finalStaffData: StaffAttendance[] = finalState.staffData || [];

      const staffToPersist = finalStaffData.filter(
        (s) => s.status === "present" && !!s.checkIn && !!s.signatureUri && !!s.photoUri
      );

      for (const staff of staffToPersist) {
        await dailyService.saveStaffSignature(
          dailyId,
          staff.id,
          staff.photoUri!,
          staff.signatureUri!,
        );
      }

      await dailyService.updateDailyStatus(dailyId, "completed");
      setIsSealing(true);
    } catch (error: any) {
      Alert.alert(
        "Erro",
        error?.message ||
          "Não foi possível encerrar a jornada. Tente novamente.",
      );
    }
  };

  const handleSealAnimationComplete = () => {
    setIsSealing(false);
    showToast("Jornada encerrada com sucesso!", "success");
    navigation.replace("DailyDispatchScreen", { dailyId });
  };

  return (
    <ScreenLayout
      title="Resumo de Fechamento"
      onBackPress={() => navigation.goBack()}
    >
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