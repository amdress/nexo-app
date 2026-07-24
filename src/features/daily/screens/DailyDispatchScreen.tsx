// src/features/daily/components/steps/dispatch/DispatchTicketsStep.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";
import { WizardStepChildProps } from "@/shared/components/wizards/interfaces/wizard";
import { DailyWithStaffUI, StaffAttendance } from "../interfacesUI/daily";
import IndividualReceiptCard from "../components/receipts/IndividualReceiptCard";

export default function DispatchTicketsStep({
  state,
  onValidate,
}: WizardStepChildProps) {
  const [styles, COLORS] = useThemedStyles(getStyles);
  const [sharingStaffId, setSharingStaffId] = useState<string | null>(null);
  const receiptRefs = useRef<Record<string, any>>({});

  // Este passo é só de envio, não coleta dado novo — sempre válido para avançar.
  useEffect(() => {
    onValidate(true);
  }, [onValidate]);

  const data: DailyWithStaffUI | null = state.data || null;

  // Considera "trabalhado" quem está presente e já tem assinatura capturada —
  // evita depender exclusivamente de checkIn, que pode ficar null se o campo
  // de Entrada não foi tocado manualmente durante o controle da jornada.
  const workedStaff: StaffAttendance[] = (data?.staff || []).filter(
    (s) => s.status === "present" && !!s.signatureUri,
  );

  const handleShareTicket = async (staffId: string) => {
    const ref = receiptRefs.current[staffId];
    if (!ref) return;

    setSharingStaffId(staffId);
    try {
      const uri = await captureRef(ref, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          "Indisponível",
          "O compartilhamento não está disponível neste dispositivo.",
        );
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Compartilhar comprovante",
      });
    } catch (error) {
      console.error(
        "[DISPATCH_TICKETS_STEP] Erro ao compartilhar ticket:",
        error,
      );
      Alert.alert("Erro", "Não foi possível gerar o comprovante.");
    } finally {
      setSharingStaffId(null);
    }
  };

  if (!data) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Jornada não encontrada.</Text>
      </View>
    );
  }

  const clientLabel = data.daily.clientName || "Cliente não informado";

  return (
    <View style={styles.content}>
      <Text style={styles.sectionTitle}>
        {workedStaff.length} comprovante(s) prontos para envio
      </Text>

      {workedStaff.map((staff) => (
        <View key={staff.id} style={styles.ticketWrapper}>
          <View
            ref={(el) => {
              receiptRefs.current[staff.id] = el;
            }}
            collapsable={false}
          >
            <IndividualReceiptCard
              clientLabel={clientLabel}
              dateLabel={data.daily.dateLabel || ""}
              dayName={data.daily.dayName || ""}
              staffPhotoUri={staff.photoUri || null}
              staffName={staff.name}
              staffRole={staff.role}
              checkIn={staff.checkIn}
              breakStart={staff.breakStart}
              breakEnd={staff.breakEnd}
              checkOut={staff.checkOut}
              signatureUri={staff.signatureUri || null}
              receiptId={staff.id}
            />
          </View>

          <TouchableOpacity
            style={styles.shareFab}
            onPress={() => handleShareTicket(staff.id)}
            disabled={sharingStaffId === staff.id}
            activeOpacity={0.8}
          >
            {sharingStaffId === staff.id ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="logo-whatsapp" size={24} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      ))}

      {workedStaff.length === 0 && (
        <Text style={styles.emptyText}>
          Nenhum funcionário trabalhou nesta jornada.
        </Text>
      )}
    </View>
  );
}

const getStyles = (COLORS: any) =>
  StyleSheet.create({
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    content: { padding: 16, alignItems: "center", gap: 32, paddingBottom: 40 },
    sectionTitle: {
      color: COLORS.textMuted,
      fontSize: 13,
      fontWeight: "600",
      alignSelf: "flex-start",
    },
    // position: relative no wrapper permite que o FAB flutue ancorado à borda do card,
    // em vez de empurrar um botão largo para baixo dele.
    ticketWrapper: { position: "relative" },
    shareFab: {
      position: "absolute",
      top: "50%",
      right: -18,
      marginTop: -22,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "#25D366",
      justifyContent: "center",
      alignItems: "center",
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: "center" },
  });
