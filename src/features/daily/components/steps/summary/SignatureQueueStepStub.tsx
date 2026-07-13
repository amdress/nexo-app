// src/features/daily/components/steps/summary/SignatureQueueStep.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StaffAttendance } from '../../../interfacesUI/daily';
import { WizardStepChildProps } from '@/shared/components/wizards/interfaces/wizard';
import StaffSignatureCaptureModal from '../../modals/SignatureCaptureModal';
import { useThemedStyles } from '@/shared/hooks/useThemedStyles';

export default function SignatureQueueStep({ state, updateState, onValidate }: WizardStepChildProps) {
  const staffData: StaffAttendance[] = state.staffData || [];
  const [activeStaffId, setActiveStaffId] = useState<string | null>(null);
  const [styles, COLORS] = useThemedStyles(getStyles);

  // Só quem realmente trabalhou precisa assinar
  const pendingSignature = useMemo(
    () => staffData.filter((s) => s.status === 'present' && !!s.checkIn && !s.signatureUri),
    [staffData]
  );
  const signedStaff = useMemo(
    () => staffData.filter((s) => s.status === 'present' && !!s.checkIn && !!s.signatureUri),
    [staffData]
  );
  const activeStaff = useMemo(
    () => staffData.filter((s) => s.status === 'present' && !!s.checkIn),
    [staffData]
  );

  // Libera "Concluir" só quando todos que trabalharam já assinaram
  React.useEffect(() => {
    onValidate(activeStaff.length === 0 || pendingSignature.length === 0);
  }, [pendingSignature.length, activeStaff.length, onValidate]);

  const activeStaffMember = staffData.find((s) => s.id === activeStaffId);

  const handleOpenCapture = (staffId: string) => {
    setActiveStaffId(staffId);
  };

  const handleCaptureComplete = ({ photoUri, signatureBase64 }: { photoUri: string; signatureBase64: string }) => {
    const updated = staffData.map((s) => {
      if (s.id !== activeStaffId) return s;
      return {
        ...s,
        photoUri,
        signatureUri: signatureBase64, // será convertido em arquivo persistente no sellado final
        signedAt: new Date().toISOString(),
      };
    });
    updateState('staffData', updated);
    setActiveStaffId(null);
  };

  const renderRow = ({ item }: { item: StaffAttendance }) => {
    const isSigned = !!item.signatureUri;

    return (
      <TouchableOpacity
        style={[styles.row, isSigned && styles.rowSigned]}
        onPress={() => !isSigned && handleOpenCapture(item.id)}
        disabled={isSigned}
        activeOpacity={0.7}
      >
        <View style={styles.rowLeft}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
          )}
          <View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.role}>{item.role}</Text>
          </View>
        </View>

        {isSigned ? (
          <View style={styles.doneBadge}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.doneText}>Assinado</Text>
          </View>
        ) : (
          <View style={styles.pendingBadge}>
            <Ionicons name="camera-outline" size={18} color={COLORS.textDark} />
            <Text style={styles.pendingText}>Capturar</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fila de Assinaturas</Text>
        <Text style={styles.headerSubtitle}>
          {signedStaff.length} de {activeStaff.length} funcionários assinaram
        </Text>
      </View>

      <FlatList
        data={staffData.filter((s) => s.status === 'present' && !!s.checkIn)}
        keyExtractor={(item) => item.id}
        renderItem={renderRow}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum funcionário presente para assinar.</Text>
        }
      />

      {activeStaffMember && (
        <StaffSignatureCaptureModal
          visible={!!activeStaffId}
          staffName={activeStaffMember.name}
          onComplete={handleCaptureComplete}
          onCancel={() => setActiveStaffId(null)}
        />
      )}
    </View>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  header: { padding: 16, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  headerSubtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  listContent: { padding: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  rowSigned: { opacity: 0.6 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 38, height: 38, borderRadius: 19 },
  avatarPlaceholder: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: COLORS.text, fontSize: 14, fontWeight: 'bold' },
  name: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  role: { color: COLORS.textMuted, fontSize: 12 },
  doneBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  doneText: { color: COLORS.success, fontSize: 12, fontWeight: '700' },
  pendingBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  pendingText: { color: COLORS.textDark, fontSize: 12, fontWeight: '700' },
  emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', marginTop: 40 },
});