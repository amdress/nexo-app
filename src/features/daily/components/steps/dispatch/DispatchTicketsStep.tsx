// src/features/daily/components/steps/dispatch/DispatchTicketsStep.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useThemedStyles } from '@/shared/hooks/useThemedStyles';
import { WizardStepChildProps } from '@/shared/components/wizards/interfaces/wizard';
import { DailyWithStaffUI, StaffAttendance } from '../../../interfacesUI/daily';
import IndividualReceiptCard from '../../receipts/IndividualReceiptCard';

export default function DispatchTicketsStep({ state, onValidate }: WizardStepChildProps) {
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
    (s) => s.status === 'present' && !!s.signatureUri
  );

  const handleShareTicket = async (staffId: string) => {
    const ref = receiptRefs.current[staffId];
    if (!ref) return;

    setSharingStaffId(staffId);
    try {
      const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Indisponível', 'O compartilhamento não está disponível neste dispositivo.');
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Compartilhar comprovante',
      });
    } catch (error) {
      console.error('[DISPATCH_TICKETS_STEP] Erro ao compartilhar ticket:', error);
      Alert.alert('Erro', 'Não foi possível gerar o comprovante.');
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

  const clientLabel = data.daily.clientName || 'Cliente não informado';

  return (
    <View style={styles.content}>
      <Text style={styles.sectionTitle}>
        {workedStaff.length} comprovante(s) prontos para envio
      </Text>

      {workedStaff.map((staff) => (
        <View key={staff.id} style={styles.ticketWrapper}>
          <View
            ref={(el) => { receiptRefs.current[staff.id] = el; }}
            collapsable={false}
          >
            <IndividualReceiptCard
              clientLabel={clientLabel}
              dateLabel={data.daily.dateLabel}
              dayName={data.daily.dayName}
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
            style={styles.shareBtn}
            onPress={() => handleShareTicket(staff.id)}
            disabled={sharingStaffId === staff.id}
            activeOpacity={0.8}
          >
            {sharingStaffId === staff.id ? (
              <ActivityIndicator size="small" color={COLORS.textDark} />
            ) : (
              <>
                <Ionicons name="share-social-outline" size={18} color={COLORS.textDark} />
                <Text style={styles.shareBtnText}>Enviar por WhatsApp</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ))}

      {workedStaff.length === 0 && (
        <Text style={styles.emptyText}>Nenhum funcionário trabalhou nesta jornada.</Text>
      )}
    </View>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  content: { padding: 16, alignItems: 'center', gap: 24, paddingBottom: 40 },
  sectionTitle: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600', alignSelf: 'flex-start' },
  ticketWrapper: { alignItems: 'center', gap: 12 },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  shareBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center' },
});