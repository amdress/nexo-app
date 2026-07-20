// src/features/daily/components/receipts/IndividualReceiptCard.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";

interface IndividualReceiptCardProps {
  companyLogoUri: string | null;
  clientLabel: string; // ex: "Mercado Livre - DHL Curitiba"
  staffPhotoUri: string | null;
  staffName: string;
  staffRole: string;
  dateLabel: string;
  checkIn: string | null;
  breakStart: string | null;
  breakEnd: string | null;
  checkOut: string | null;
  signatureUri: string | null;
}

export default function IndividualReceiptCard({
  companyLogoUri,
  clientLabel,
  staffPhotoUri,
  staffName,
  staffRole,
  dateLabel,
  checkIn,
  breakStart,
  breakEnd,
  checkOut,
  signatureUri,
}: IndividualReceiptCardProps) {
  
  const [styles, COLORS] = useThemedStyles(getStyles);

  const hasBreak = !!breakStart && !!breakEnd;

  return (
    <View style={styles.card} collapsable={false}>
      {/* Header */}
      <View style={styles.header}>
        {companyLogoUri ? (
          <Image source={{ uri: companyLogoUri }} style={styles.companyLogo} />
        ) : null}
        <Text style={styles.title}>COMPROVANTE DE PRESENÇA</Text>
        <Text style={styles.clientLabel}>{clientLabel}</Text>
      </View>

      <View style={styles.divider} />

      {/* Staff info */}
      <View style={styles.staffSection}>
        {staffPhotoUri ? (
          <Image source={{ uri: staffPhotoUri }} style={styles.staffPhoto} />
        ) : (
          <View style={styles.staffPhotoPlaceholder}>
            <Text style={styles.staffPhotoPlaceholderText}>{staffName.charAt(0)}</Text>
          </View>
        )}
        <Text style={styles.staffName}>{staffName}</Text>
        <Text style={styles.staffRole}>{staffRole}</Text>
        <Text style={styles.dateLabel}>{dateLabel}</Text>
      </View>

      <View style={styles.divider} />

      {/* Horários */}
      <View style={styles.scheduleSection}>
        <View style={styles.scheduleRow}>
          <Text style={styles.scheduleLabel}>Entrada</Text>
          <Text style={styles.scheduleValue}>{checkIn || '--:--'}</Text>
        </View>
        {hasBreak && (
          <View style={styles.scheduleRow}>
            <Text style={styles.scheduleLabel}>Intervalo</Text>
            <Text style={styles.scheduleValue}>{breakStart} - {breakEnd}</Text>
          </View>
        )}
        <View style={styles.scheduleRow}>
          <Text style={styles.scheduleLabel}>Saída</Text>
          <Text style={styles.scheduleValue}>{checkOut || '--:--'}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Assinatura */}
      <View style={styles.signatureSection}>
        {signatureUri ? (
          <Image source={{ uri: signatureUri }} style={styles.signatureImage} resizeMode="contain" />
        ) : (
          <View style={styles.signatureEmptyBox} />
        )}
        <View style={styles.signatureLine} />
        <Text style={styles.signatureCaption}>Assinatura do colaborador</Text>
      </View>
    </View>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  card: {
    width: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  header: { alignItems: 'center', gap: 4 },
  companyLogo: { width: 40, height: 40, borderRadius: 8, marginBottom: 6 },
  title: { fontSize: 13, fontWeight: '800', color: '#1A1A1A', letterSpacing: 0.5 },
  clientLabel: { fontSize: 11, color: '#666666', fontWeight: '500' },
  divider: { width: '100%', height: 1, backgroundColor: '#E0E0E0', marginVertical: 14 },
  staffSection: { alignItems: 'center', gap: 2 },
  staffPhoto: { width: 90, height: 90, borderRadius: 45, marginBottom: 8, borderWidth: 2, borderColor: '#E0E0E0' },
  staffPhotoPlaceholder: {
    width: 90, height: 90, borderRadius: 45, marginBottom: 8,
    backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center',
  },
  staffPhotoPlaceholderText: { fontSize: 32, fontWeight: '700', color: '#999999' },
  staffName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  staffRole: { fontSize: 12, color: '#666666' },
  dateLabel: { fontSize: 12, color: '#999999', marginTop: 4 },
  scheduleSection: { width: '100%', gap: 8 },
  scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scheduleLabel: { fontSize: 12, color: '#666666', fontWeight: '600' },
  scheduleValue: { fontSize: 13, color: '#1A1A1A', fontWeight: '700' },
  signatureSection: { width: '100%', alignItems: 'center' },
  signatureImage: { width: 180, height: 60 },
  signatureEmptyBox: { width: 180, height: 60 },
  signatureLine: { width: 180, height: 1, backgroundColor: '#1A1A1A', marginTop: 2 },
  signatureCaption: { fontSize: 10, color: '#999999', marginTop: 4 },
});