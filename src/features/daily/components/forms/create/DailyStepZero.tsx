// src/features/daily/components/steps/DailyStepTwo.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";
import FAB from '@/shared/components/btn/FAB'; 
import { WizardStepChildProps } from '@/shared/components/wizards/interfaces/wizard';
import { clientService } from '@/features/clients/services/clientService'; 
import { useToast } from '@/shared/context/ToastContext';
import { ClientUI } from '@/features/clients/interfacesUI/clientUI'; 

export default function DailyStepTwo({ state, updateState, onValidate }: WizardStepChildProps) {
  const navigation = useNavigation<any>();
  const { showToast } = useToast();
  const [clientList, setClientList] = useState<ClientUI[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState<boolean>(false);
  const [styles, COLORS] = useThemedStyles(getStyles);

  useEffect(() => {
    async function fetchClients() {
      setIsLoadingClients(true);
      try {
        const data = await clientService.getAllClients();
        setClientList(data);
      } catch (error: any) {
        showToast(error?.message || "Não foi possível carregar as empresas.", "error");
      } finally {
        setIsLoadingClients(false);
      }
    }
    fetchClients();
  }, [showToast]);

  const selectedClientId = state.clientId || null;
  const isListEmpty = clientList.length === 0;
  
  useEffect(() => {
    const isValid = selectedClientId !== null && !isLoadingClients;
    onValidate(isValid);
  }, [selectedClientId, isLoadingClients, onValidate]);

  const handleClientSelect = (id: string) => {
    // Selección única tipo radio: si presiona el ya seleccionado, se podría deseleccionar o mantener
    const nextSelected = selectedClientId === id ? null : id;
    updateState('clientId', nextSelected);
  };

  const renderHeaderSummary = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.clientHeaderRow}>
        <Text style={styles.sectionTitle}>Selecionar Empresa Contratante</Text>
        <Text style={styles.clientCountBadge}>
          {selectedClientId ? "1 / 1 Selecionada" : "0 / 1 Selecionada"}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="business-outline" size={40} color={COLORS.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>Nenhuma empresa registrada</Text>
      <Text style={styles.emptySubtitle}>
        Para abrir e alocar uma jornada, é necessário cadastrar empresas contratantes no sistema primeiro utilizando o botão abaixo.
      </Text>
    </View>
  );

  if (isLoadingClients) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loaderText}>Buscando empresas disponíveis...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={clientList}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeaderSummary}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isSelected = selectedClientId === item.id;
          return (
            <TouchableOpacity 
              activeOpacity={0.7}
              style={[styles.cardContainer, isSelected && styles.cardContainerSelected]}
              onPress={() => handleClientSelect(item.id)}
            >
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Ionicons 
                    name="business" 
                    size={20} 
                    color={isSelected ? COLORS.primary : COLORS.textMuted} 
                    style={styles.businessIcon} 
                  />
                  <Text style={[styles.clientName, isSelected && styles.textSelected]}>
                    {item.name}
                  </Text>
                </View>
              </View>
              
              {/* Radio Button UI Component */}
              <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* {isListEmpty && ( */}
        <FAB 
          icon="add" 
          onPress={() => navigation.navigate('ClientForm')} 
        />
      {/* )} */}
    </View>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: 24,
  },
  summaryContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  clientHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clientCountBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loaderText: {
    marginTop: 12,
    color: COLORS.textMuted,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  /* Card con Estilos de Radio Selección */
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  cardContainerSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceSelected || COLORS.surface, 
  },
  cardContent: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessIcon: {
    marginRight: 12,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  textSelected: {
    color: COLORS.text,
    fontWeight: '700',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.borderMuted || COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
});