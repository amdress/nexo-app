// src/features/daily/screens/DailyDispatchScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";
import ScreenLayout from '@/layouts/ScreenLayout';
import { dailyService } from '../services/dailyService';
import { companyProfileService } from '@/features/settings/services/companyProfileService';
import { DailyWithStaffUI, StaffAttendance } from '../interfacesUI/daily';
import IndividualReceiptCard from '../components/receipts/IndividualReceiptCard';

export default function DailyDispatchScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { dailyId } = route.params || { dailyId: '' };
  const [styles, COLORS] = useThemedStyles(getStyles);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DailyWithStaffUI | null>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [sharingStaffId, setSharingStaffId] = useState<string | null>(null);

  const receiptRefs = useRef<Record<string, any>>({});

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [dailyData, profile] = await Promise.all([
          dailyService.getDailyWithStaff(dailyId),
          companyProfileService.getProfile(),
        ]);
        setData(dailyData);
        setCompanyLogo(profile.logoUri);
        console.log('[DAILY_DISPATCH] Dados carregados:', dailyData);
      } catch (error: any) {
        Alert.alert('Erro', error?.message || 'Não foi possível carregar a jornada.');
      } finally {
        setLoading(false);
      }
    }
    if (dailyId) load();
  }, [dailyId]);

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
      console.error('[DAILY_DISPATCH] Erro ao compartilhar ticket:', error);
      Alert.alert('Erro', 'Não foi possível gerar o comprovante.');
    } finally {
      setSharingStaffId(null);
    }
  };

  if (loading) {
    return (
      <ScreenLayout title="Comprovantes" onBackPress={() => navigation.popToTop()}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </ScreenLayout>
    );
  }

  if (!data) {
    return (
      <ScreenLayout title="Comprovantes" onBackPress={() => navigation.popToTop()}>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Jornada não encontrada.</Text>
        </View>
      </ScreenLayout>
    );
  }

  const clientLabel = [data.daily.clientName].filter(Boolean).join(' - ') || 'Cliente não informado';

  return (
    <ScreenLayout title="Comprovantes da Jornada" onBackPress={() => navigation.popToTop()}>
      <ScrollView contentContainerStyle={styles.content}>
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
                companyLogoUri={companyLogo}
                clientLabel={clientLabel}
                staffPhotoUri={staff.photoUri || null}
                staffName={staff.name}
                staffRole={staff.role}
                dateLabel={data.daily.dateLabel}
                checkIn={staff.checkIn}
                breakStart={staff.breakStart}
                breakEnd={staff.breakEnd}
                checkOut={staff.checkOut}
                signatureUri={staff.signatureUri || null}
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
      </ScrollView>
    </ScreenLayout>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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


