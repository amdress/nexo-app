// src/features/daily/components/steps/summary/EspelhoStep.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";
import { StaffAttendance } from '../../../interfacesUI/daily';
import { WizardStepChildProps } from '@/shared/components/wizards/interfaces/wizard';

export default function EspelhoStep({ state, onValidate }: WizardStepChildProps) {
  const staffData: StaffAttendance[] = state.staffData || [];
  const [styles, COLORS] = useThemedStyles(getStyles);

  const activeStaff = staffData.filter(
    (s) => s.status === 'present' && !!s.checkIn
  );
  const absentStaff = staffData.filter(
    (s) => s.status === 'no_show' || s.status === 'dropped'
  );

  // Este passo é só leitura — sempre válido, libera o "Avançar" imediatamente.
  useEffect(() => {
    onValidate(true);
  }, [onValidate]);

  const getAbsentLabel = (status: StaffAttendance['status']) => {
    if (status === 'no_show') return { label: 'Não veio', color: '#FF8888' };
    if (status === 'dropped') return { label: 'Desistiu', color: '#E6AD12' };
    return { label: '', color: COLORS.textMuted };
  };

  const renderSummaryRow = ({ item }: { item: StaffAttendance }) => (
    <View style={styles.summaryItemRow}>
      <View style={styles.employeeMeta}>
        <Text style={styles.employeeName}>{item.name}</Text>
        <Text style={styles.employeeRole}>{item.role}</Text>
      </View>
      <View style={styles.hoursGrid}>
        <View style={styles.hourCell}>
          <Text style={styles.cellLabel}>ENT</Text>
          <Text style={styles.cellValue}>{item.checkIn || '--:--'}</Text>
        </View>
        <View style={styles.hourCell}>
          <Text style={styles.cellLabel}>INT</Text>
          <Text style={styles.cellValue}>{item.breakStart || '--:--'}</Text>
        </View>
        <View style={styles.hourCell}>
          <Text style={styles.cellLabel}>RET</Text>
          <Text style={styles.cellValue}>{item.breakEnd || '--:--'}</Text>
        </View>
        <View style={styles.hourCell}>
          <Text style={styles.cellLabel}>SAI</Text>
          <Text style={styles.cellValue}>{item.checkOut || '--:--'}</Text>
        </View>
      </View>
    </View>
  );

  const renderAbsentRow = ({ item }: { item: StaffAttendance }) => {
    const { label, color } = getAbsentLabel(item.status);
    return (
      <View style={styles.absentRow}>
        <View style={styles.employeeMeta}>
          <Text style={styles.employeeName}>{item.name}</Text>
          <Text style={styles.employeeRole}>{item.role}</Text>
        </View>
        <View style={[styles.absentBadge, { borderColor: color }]}>
          <Text style={[styles.absentBadgeText, { color }]}>{label}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.infoBanner}>
        <Text style={styles.bannerDate}>{state.dailyInfo?.dayName} — {state.dailyInfo?.dateLabel}</Text>
        <Text style={styles.bannerTime}>Horário: {state.dailyInfo?.timeRange}</Text>
        <View style={styles.bannerStats}>
          <Text style={styles.bannerStatItem}>
            <Text style={{ color: COLORS.success }}>● </Text>
            {activeStaff.length} trabalharam
          </Text>
          {absentStaff.length > 0 && (
            <Text style={styles.bannerStatItem}>
              <Text style={{ color: '#FF8888' }}>● </Text>
              {absentStaff.length} ausentes
            </Text>
          )}
        </View>
      </View>

      <FlatList
        data={activeStaff}
        keyExtractor={(item) => item.id}
        renderItem={renderSummaryRow}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Espelho de Ponto</Text>}
        ListFooterComponent={
          absentStaff.length > 0 ? (
            <View>
              <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Ausências</Text>
              {absentStaff.map((item) => (
                <View key={item.id}>{renderAbsentRow({ item })}</View>
              ))}
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum registro de ponto computado hoje.</Text>
          </View>
        }
      />
    </View>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  infoBanner: { padding: 16, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  bannerDate: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  bannerTime: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  bannerStats: { flexDirection: 'row', gap: 16, marginTop: 8 },
  bannerStatItem: { color: COLORS.textMuted, fontSize: 12, fontWeight: '500' },
  sectionTitle: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', paddingBottom: 8, letterSpacing: 0.5 },
  listContent: { padding: 16, paddingBottom: 24 },
  summaryItemRow: { backgroundColor: COLORS.surface, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  employeeMeta: { flex: 1, paddingRight: 8 },
  employeeName: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  employeeRole: { color: COLORS.textMuted, fontSize: 12, marginTop: 1 },
  hoursGrid: { flexDirection: 'row', gap: 6 },
  hourCell: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, width: 46, paddingVertical: 6, alignItems: 'center' },
  cellLabel: { color: COLORS.textMuted, fontSize: 8, fontWeight: '700' },
  cellValue: { color: COLORS.primary, fontSize: 11, fontWeight: '600', marginTop: 2 },
  absentRow: { backgroundColor: COLORS.surface, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  absentBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  absentBadgeText: { fontSize: 12, fontWeight: '700' },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
});