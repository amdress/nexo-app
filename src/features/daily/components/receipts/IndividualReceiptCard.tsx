// src/features/daily/components/receipts/IndividualReceiptCard.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface IndividualReceiptCardProps {
  clientLabel: string;   // ex: "DHL"
  dateLabel: string;     // ex: "2026-07-21"
  dayName: string;       // ex: "Terça-Feira"
  staffPhotoUri: string | null;
  staffName: string;
  staffRole: string;
  checkIn: string | null;
  breakStart: string | null;
  breakEnd: string | null;
  checkOut: string | null;
  signatureUri: string | null;
  receiptId: string;     // id do registro (daily_staff), exibido truncado no rodapé
}

/** Trunca um id longo para exibição, mantendo o começo visível (ex: para debug/rastreio). */
function truncateId(id: string, visibleChars: number = 28): string {
  if (id.length <= visibleChars) return id;
  return `${id.slice(0, visibleChars)}...`;
}

export default function IndividualReceiptCard({
  clientLabel,
  dateLabel,
  dayName,
  staffPhotoUri,
  staffName,
  staffRole,
  checkIn,
  breakStart,
  breakEnd,
  checkOut,
  signatureUri,
  receiptId,
}: IndividualReceiptCardProps) {
  const hasBreak = !!breakStart && !!breakEnd;

  return (
    <View style={styles.card} collapsable={false}>
      {/* Cabeçalho: cliente + data à esquerda, dia da semana à direita */}
      <View style={styles.headerRow}>
        <Text style={styles.headerLeft}>
          {clientLabel} • {dateLabel}
        </Text>
        <Text style={styles.headerRight}>{dayName}</Text>
      </View>

      <View style={styles.divider} />

      {/* Linha 1 do corpo: foto + nome/cargo com toda a largura disponível
          (nunca corta, independente do tamanho do nome) */}
      <View style={styles.staffRow}>
        {staffPhotoUri ? (
          <Image source={{ uri: staffPhotoUri }} style={styles.staffPhoto} />
        ) : (
          <View style={styles.staffPhotoPlaceholder}>
            <Text style={styles.staffPhotoPlaceholderText}>
              {staffName.charAt(0)}
            </Text>
          </View>
        )}
        <View style={styles.staffTextGroup}>
          <Text style={styles.staffName} numberOfLines={2}>
            {staffName}
          </Text>
          <Text style={styles.staffRole} numberOfLines={1}>
            {staffRole}
          </Text>
        </View>
      </View>

      {/* Linha 2 do corpo: horários + assinatura */}
      <View style={styles.scheduleRow}>
        <View style={styles.scheduleGroup}>
          <Text style={styles.scheduleLine}>
            ENTRADA: <Text style={styles.scheduleValue}>{checkIn || '--:--'}</Text>
          </Text>
          {hasBreak && (
            <Text style={styles.scheduleLine}>
              INTERVALOS:{' '}
              <Text style={styles.scheduleValue}>
                {breakStart}-{breakEnd}
              </Text>
            </Text>
          )}
          <Text style={styles.scheduleLine}>
            SAÍDA: <Text style={styles.scheduleValue}>{checkOut || '--:--'}</Text>
          </Text>
        </View>

        {signatureUri ? (
          <Image
            source={{ uri: signatureUri }}
            style={styles.signatureImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.signatureEmptyBox} />
        )}
      </View>

      <View style={styles.divider} />

      {/* Rodapé: marca do sistema + id do registro */}
      <View style={styles.footerRow}>
        <Text style={styles.footerLabel}>Comprovante sistema NEXO</Text>
        <Text
          style={styles.footerId}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          ID: {truncateId(receiptId)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EDEDED',
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerRight: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 14,
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  staffPhoto: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 12,
  },
  staffPhotoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  staffPhotoPlaceholderText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#999999',
  },
  staffTextGroup: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  staffRole: {
    fontSize: 12,
    color: '#8A8A8A',
    marginTop: 2,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  scheduleGroup: {
    gap: 4,
  },
  scheduleLine: {
    fontSize: 12,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  scheduleValue: {
    fontWeight: '700',
    color: '#1A1A1A',
  },
  signatureImage: {
    width: 64,
    height: 38,
    marginLeft: 12,
  },
  signatureEmptyBox: {
    width: 64,
    height: 38,
    marginLeft: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  footerLabel: {
    fontSize: 10,
    color: '#B0B0B0',
    fontWeight: '500',
  },
  footerId: {
    fontSize: 10,
    color: '#B0B0B0',
    flexShrink: 1,
    textAlign: 'right',
  },
});