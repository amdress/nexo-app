// src/features/clients/screens/ClientProfileScreen.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ScreenLayout from "@/layouts/ScreenLayout";
import FAB from "@/shared/components/btn/FAB";
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";
import { useToast } from "@/shared/context/ToastContext";
import { clientService } from "../services/clientService";
import { ClientUI, ClientShiftUI } from "../interfacesUI/clientUI";
import { ClientShiftDraft } from "../dto/ClientCreateDto";
import ClientShiftModal from "../components/modals/ClientShiftModal";

export default function ClientProfileScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { showToast } = useToast();
  const [styles, COLORS] = useThemedStyles(getStyles);

  const { clientId } = route.params || { clientId: "" };

  const [client, setClient] = useState<ClientUI | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Estados do Modal
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedShift, setSelectedShift] = useState<ClientShiftUI | null>(null);

  const loadClientData = useCallback(async () => {
    if (!clientId) {
      showToast("ID do cliente inválido.", "error");
      setLoading(false);
      navigation.goBack();
      return;
    }

    try {
      setLoading(true);
      const data = await clientService.getClientById(clientId);
      if (!data) {
        showToast("Empresa não encontrada.", "error");
        navigation.goBack();
        return;
      }
      setClient(data);
    } catch (error: any) {
      showToast(error?.message || "Erro ao carregar perfil da empresa.", "error");
    } finally {
      setLoading(false);
    }
  }, [clientId, navigation, showToast]);

  useFocusEffect(
    useCallback(() => {
      loadClientData();
    }, [loadClientData])
  );

  const handleDeleteClient = () => {
    if (!client) return;
    Alert.alert(
      "Excluir Empresa",
      `Tem certeza que deseja excluir "${client.name}" e todos os seus turnos?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await clientService.deleteClient(client.id);
              showToast("Empresa removida com sucesso!", "success");
              navigation.navigate("MainTabs", { screen: "Clients" });
            } catch (error: any) {
              showToast(error?.message || "Erro ao remover empresa.", "error");
            }
          },
        },
      ]
    );
  };

  const handleOpenAddModal = () => {
    setSelectedShift(null);
    setModalVisible(true);
  };

  const handleOpenEditModal = (shift: ClientShiftUI) => {
    setSelectedShift(shift);
    setModalVisible(true);
  };

  const handleDeleteShift = (shift: ClientShiftUI) => {
    Alert.alert(
      "Excluir Turno",
      `Deseja remover o turno "${shift.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await clientService.deleteShift(shift.id);
              showToast("Turno removido com sucesso!", "success");
              loadClientData();
            } catch (error: any) {
              showToast(error?.message || "Erro ao remover turno.", "error");
            }
          },
        },
      ]
    );
  };

  const handleSaveShift = async (shiftData: ClientShiftDraft) => {
    if (!client) return;
    try {
      if (selectedShift) {
        await clientService.updateShift(selectedShift.id, shiftData);
        showToast("Turno atualizado com sucesso!", "success");
      } else {
        await clientService.createShift(client.id, shiftData);
        showToast("Turno cadastrado com sucesso!", "success");
      }
      loadClientData();
    } catch (error: any) {
      showToast(error?.message || "Erro ao salvar turno.", "error");
      throw error;
    }
  };

  return (
    <ScreenLayout 
      title={client?.name || "Perfil da Empresa"} 
      onBackPress={() => navigation.goBack()}
    >
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary || "#2563EB"} />
        </View>
      ) : client ? (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container}>
            {/* Informações Gerais */}
            <View style={styles.infoCard}>
              <View style={styles.headerRow}>
                <Text style={styles.clientName}>{client.name}</Text>
                <TouchableOpacity onPress={handleDeleteClient} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={20} color={COLORS.danger || "#EF4444"} />
                </TouchableOpacity>
              </View>

              {client.accountLabel ? (
                <Text style={styles.accountBadge}>{client.accountLabel}</Text>
              ) : null}

              <View style={styles.divider} />

              <View style={styles.metaRow}>
                <Ionicons name="business-outline" size={16} color={COLORS.textMuted} />
                <Text style={styles.metaText}>
                  <Text style={styles.metaLabel}>Site / Unidade: </Text>
                  {client.site || "Não informado"}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={16} color={COLORS.textMuted} />
                <Text style={styles.metaText}>
                  <Text style={styles.metaLabel}>Endereço: </Text>
                  {client.address || "Não informado"}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Ionicons name="map-outline" size={16} color={COLORS.textMuted} />
                <Text style={styles.metaText}>
                  <Text style={styles.metaLabel}>Cidade/UF: </Text>
                  {client.cityState || "Não informado"}
                </Text>
              </View>
            </View>

            {/* Turnos */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Turnos Cadastrados ({client.shifts?.length || 0})
              </Text>
            </View>

            {client.shifts && client.shifts.length > 0 ? (
              client.shifts.map((shift: ClientShiftUI) => (
                <TouchableOpacity
                  key={shift.id}
                  style={styles.shiftCard}
                  onPress={() => handleOpenEditModal(shift)}
                  activeOpacity={0.7}
                >
                  <View style={styles.shiftHeader}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                      <Ionicons name="time-outline" size={20} color={COLORS.primary || "#2563EB"} />
                      <Text style={styles.shiftName}>{shift.name}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteShift(shift)}
                      style={{ padding: 4 }}
                    >
                      <Ionicons name="trash-outline" size={18} color={COLORS.danger || "#EF4444"} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.shiftBody}>
                    <Text style={styles.shiftDetailText}>
                      <Text style={styles.boldText}>Horário: </Text>
                      {shift.startTime} - {shift.endTime} (Intervalo: {shift.breakDuration})
                    </Text>

                    <Text style={styles.shiftDetailText}>
                      <Text style={styles.boldText}>Escala / Demanda: </Text>
                      {shift.demandInfo}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyShiftsBox}>
                <Ionicons name="alarm-outline" size={32} color={COLORS.textMuted} />
                <Text style={styles.emptyShiftsText}>
                  Nenhum turno cadastrado para esta empresa.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* FAB para Adicionar Novo Turno */}
          <FAB icon="add" onPress={handleOpenAddModal} />

          {/* Modal de Criar/Editar Turno */}
          <ClientShiftModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onSave={handleSaveShift}
            initialData={selectedShift}
          />
        </View>
      ) : null}
    </ScreenLayout>
  );
}

const getStyles = (COLORS: any) =>
  StyleSheet.create({
    centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", minHeight: 300 },
    container: { padding: 16, gap: 16, paddingBottom: 80 },
    infoCard: {
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 12,
      padding: 16,
    },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    deleteBtn: { padding: 4 },
    clientName: { fontSize: 20, fontWeight: "700", color: COLORS.text, flex: 1 },
    accountBadge: {
      fontSize: 13,
      fontWeight: "600",
      color: COLORS.primary || "#2563EB",
      marginTop: 2,
    },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    metaLabel: { fontWeight: "600", color: COLORS.text },
    metaText: { fontSize: 14, color: COLORS.textMuted, flex: 1 },
    sectionHeader: { marginTop: 8 },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: COLORS.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    shiftCard: {
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 10,
      padding: 14,
      marginBottom: 8,
    },
    shiftHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
    shiftName: { fontSize: 16, fontWeight: "600", color: COLORS.text },
    shiftBody: { gap: 4 },
    shiftDetailText: { fontSize: 13, color: COLORS.textMuted },
    boldText: { color: COLORS.text, fontWeight: "600" },
    emptyShiftsBox: {
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 10,
      gap: 8,
    },
    emptyShiftsText: { fontSize: 14, color: COLORS.textMuted, textAlign: "center" },
  });