// src/features/daily/components/steps/DailyStepTwo.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";
import AlertBanner from '@/shared/components/alerts/AlertBanner';
import StaffCardSelectable from '@/features/staff/components/Lists/StaffCardSelectable'; 
import FAB from '@/shared/components/btn/FAB'; 
import { WizardStepChildProps } from '@/shared/components/wizards/interfaces/wizard';
import { dailyService } from '../../../services/dailyService';
import { useToast } from '@/shared/context/ToastContext';
import { formatDate, toISODate, formatTime, toTimeString } from '@/shared/utils/dateFormatter';
import { StaffUI } from '@/features/staff/interacesUI/staffUI';

export default function DailyStepTwo({ state, updateState, onValidate }: WizardStepChildProps) {
  const navigation = useNavigation<any>();
  const { showToast } = useToast();
  const [staffList, setStaffList] = useState<StaffUI[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState<boolean>(false);
  const [styles, COLORS] = useThemedStyles(getStyles);

useEffect(() => {
  async function fetchStaff() {
    setIsLoadingStaff(true);
    try {
      const data = await dailyService.getStaffList();
      setStaffList(data);
    } catch (error: any) {
      showToast(error?.message || "Não foi possível carregar o staff.", "error");
    } finally {
      setIsLoadingStaff(false);
    }
  }
  fetchStaff();
}, [showToast]);

  const totalSelected = state.selectedStaffIds?.length || 0;
  const requiredCount = state.requiredStaffCount || 2;

  const isExcessive = totalSelected > requiredCount;
  const isIncomplete = totalSelected < requiredCount && totalSelected > 0;
  const isListEmpty = staffList.length === 0;
  
  useEffect(() => {
    const isValid = totalSelected > 0 && !isExcessive && !isLoadingStaff;
    onValidate(isValid);
  }, [totalSelected, isExcessive, isLoadingStaff, onValidate]);

  const handleStaffToggle = (id: string) => {
    const currentSelected = state.selectedStaffIds || [];
    const isSelected = currentSelected.includes(id);
    
    const nextSelected = isSelected
      ? currentSelected.filter((item: string) => item !== id)
      : [...currentSelected, id];

    updateState('selectedStaffIds', nextSelected);
  };

  const renderHeaderSummary = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryCard}>
        <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} style={styles.summaryIcon} />
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryTitle}>{state.description || 'Dia Operacional Normal'}</Text>
          <Text style={styles.summaryDetails}>
            {formatDate(toISODate(state.date))} • {formatTime(toTimeString(state.startTime))} às {formatTime(toTimeString(state.endTime))}
          </Text>
        </View>
      </View>

      <View style={styles.staffHeaderRow}>
        <Text style={styles.sectionTitle}>Selecionar Funcionários</Text>
        <Text style={[styles.staffCountBadge, isExcessive && styles.textError]}>
          {totalSelected} / {requiredCount} Selecionados
        </Text>
      </View>

      {isExcessive && (
        <AlertBanner message="Limite excedido. Remova pessoal para prosseguir." type="error" />
      )}
      {isIncomplete && (
        <AlertBanner message="Atenção: Faltam funcionários para cumprir a meta da jornada." type="warning" />
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="people-outline" size={40} color={COLORS.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>Nenhum funcionário registrado</Text>
      <Text style={styles.emptySubtitle}>
        Para abrir e alocar uma equipe nesta jornada, é necessário cadastrar funcionários no sistema primeiro utilizando o botão abaixo.
      </Text>
    </View>
  );

  if (isLoadingStaff) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loaderText}>Buscando funcionários disponíveis...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={staffList}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeaderSummary}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <StaffCardSelectable
            staff={item}
            selectable={true}
            selected={(state.selectedStaffIds || []).includes(item.id)}
            onPress={() => handleStaffToggle(item.id)}
          />
        )}
      />

      {/* Si la lista está vacía, renderizamos tu FAB agnóstico de forma flotante en esta vista */}
      {isListEmpty && (
        <FAB 
          icon="add" 
          onPress={() => navigation.navigate('StaffCreate')} 
        />
      )}
    </View>
  );
}

const getStyles = (COLORS: any) =>  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: 24,
  },
  summaryContainer: {
    padding: 16,
    paddingBottom: 4,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  summaryIcon: {
    marginRight: 12,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  summaryDetails: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  staffHeaderRow: {
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
  staffCountBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  textError: {
    color: '#FF4D4D',
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
});