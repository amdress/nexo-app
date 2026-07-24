// src/features/clients/screens/ClientCreateScreen.tsx
import React, { useState } from "react";
import ScreenLayout from "@/layouts/ScreenLayout";
import BaseWizard from "@/shared/components/wizards/BaseWizard";
import { StepItem } from "@/shared/components/wizards/interfaces/wizard";
import { clientService } from "../services/clientService";
import { useToast } from "@/shared/context/ToastContext";
import { ClientCreateDto, ClientShiftDraft } from "../dto/ClientCreateDto";

import ClientDataStep from "../components/forms/create/ClientDataStep";
import ClientShiftStep from "../components/forms/create/ClientShiftStep";

// Orden corregido: Primero datos de la empresa, luego turnos
const wizardSteps: StepItem[] = [
  { component: ClientDataStep },
  { component: ClientShiftStep },
];

// Estado interno do wizard — camelCase, formato "de rascunho" que os steps preenchem
interface ClientWizardState {
  name: string;
  logoUri: string | null;
  accountLabel: string;
  site: string;
  address: string;
  cityState: string;
  shifts: ClientShiftDraft[];
}

const initialState: ClientWizardState = {
  name: "",
  logoUri: null,
  accountLabel: "",
  site: "",
  address: "",
  cityState: "",
  shifts: [], // pode ficar vazio — turnos são opcionais na criação, adicionáveis depois
};

export default function ClientCreateScreen({ navigation }: any) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sem modal de confirmação: o próprio wizard termina e já dispara a persistência.
  // O feedback pro usuário é só o toast (sucesso/erro).
  const handleWizardFinish = async (finalState: ClientWizardState) => {
    setIsSubmitting(true);

    const payload: ClientCreateDto = {
      name: finalState.name.trim(),
      logoUri: finalState.logoUri || null,
      accountLabel: finalState.accountLabel.trim() || null,
      site: finalState.site.trim() || null,
      address: finalState.address.trim() || null,
      cityState: finalState.cityState.trim() || null,
      shifts: finalState.shifts,
      createdAt: new Date().toISOString(),
    };

    try {
      await clientService.createClient(payload);
      setIsSubmitting(false);
      navigation.navigate("ClientsList");
      showToast("Cliente cadastrado com sucesso!", "success");
    } catch (error: any) {
      setIsSubmitting(false);
      showToast(error?.message || "Erro ao salvar o cliente.", "error");
    }
  };

  return (
    <ScreenLayout title="Novo Cliente" onBackPress={() => navigation.goBack()}>
      <BaseWizard
        steps={wizardSteps}
        initialState={initialState}
        onFinish={handleWizardFinish}
        onCancel={() => navigation.goBack()}
      />
    </ScreenLayout>
  );
}