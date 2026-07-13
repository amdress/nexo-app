// src/features/staff/components/HistoryTab.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, StyleSheet, Text, ScrollView, Alert,
  ActivityIndicator, TouchableOpacity, TextInput, Share, Linking,
} from 'react-native';
import { staffService } from '../../services/staffService';
import { StaffHistoryEvent, StaffHistoryFilter } from '../../interacesUI/staffUI';
import { STATUS_STYLES, STATUS_LABELS, formatDate, formatTime, toISODate, buildReceiptText } from '../../utils/staffHistoryFormatter';
import { useThemedStyles } from '@/shared/hooks/useThemedStyles';

interface HistoryTabProps {
  staffId: string;
  staffName?: string;
  staffPhone?: string;
  staffEmail?: string;
}

type PresetKey = 'all' | '7d' | '30d' | 'month' | 'custom';

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: '7d', label: '7 dias' },
  { key: '30d', label: '30 dias' },
  { key: 'month', label: 'Este mês' },
  { key: 'custom', label: 'Personalizado' },
];

function resolvePreset(preset: PresetKey, from: string, to: string): StaffHistoryFilter {
  const today = new Date();
  switch (preset) {
    case '7d': {
      const f = new Date(today); f.setDate(f.getDate() - 7);
      return { startDate: toISODate(f), endDate: toISODate(today) };
    }
    case '30d': {
      const f = new Date(today); f.setDate(f.getDate() - 30);
      return { startDate: toISODate(f), endDate: toISODate(today) };
    }
    case 'month': {
      const f = new Date(today.getFullYear(), today.getMonth(), 1);
      return { startDate: toISODate(f), endDate: toISODate(today) };
    }
    case 'custom':
      return { startDate: from || undefined, endDate: to || undefined };
    default:
      return {};
  }
}

export function HistoryTab({ staffId, staffName, staffPhone, staffEmail }: HistoryTabProps) {
  const [events, setEvents] = useState<StaffHistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState<PresetKey>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [styles, COLORS] = useThemedStyles(getStyles);

  const fetchHistory = useCallback(async (filter: StaffHistoryFilter) => {

    setLoading(true);
    // try {
    //   const data = await staffService.getStaffHistory(staffId, filter);
    //   setEvents(data);
    // } catch {
    //   Alert.alert('Erro', 'Não foi possível carregar o histórico de presenças.');
    // } finally {
    //   setLoading(false);
    // }
  }, [staffId]);

  useEffect(() => {
    if (preset === 'custom') return;
    fetchHistory(resolvePreset(preset, customFrom, customTo));
  }, [preset, fetchHistory]);

  const applyCustomRange = () => {
    const isValid = (v: string) => v === '' || /^\d{4}-\d{2}-\d{2}$/.test(v);
    if (!isValid(customFrom) || !isValid(customTo)) {
      Alert.alert('Data inválida', 'Use o formato AAAA-MM-DD, ex: 2026-07-01.');
      return;
    }
    fetchHistory(resolvePreset('custom', customFrom, customTo));
  };

  const shareViaWhatsApp = async (event: StaffHistoryEvent) => {
    const text = buildReceiptText(event, staffName);
    const encoded = encodeURIComponent(text);
    const phone = staffPhone ? staffPhone.replace(/\D/g, '') : '';
    const url = phone
      ? `https://wa.me/${phone}?text=${encoded}`
      : `whatsapp://send?text=${encoded}`;

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      await Share.share({ message: text });
    }
  };

  const shareViaEmail = async (event: StaffHistoryEvent) => {
    const subject = encodeURIComponent(
      `Comprovante de Presença Nº ${event.id.slice(0, 8).toUpperCase()} – ${formatDate(event.date)}`
    );
    const body = encodeURIComponent(buildReceiptText(event, staffName));
    const to = staffEmail ?? '';
    const url = `mailto:${to}?subject=${subject}&body=${body}`;

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      await Share.share({ message: buildReceiptText(event, staffName) });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {PRESETS.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[styles.chip, preset === p.key && styles.chipActive]}
            onPress={() => setPreset(p.key)}
          >
            <Text style={[styles.chipText, preset === p.key && styles.chipTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {preset === 'custom' && (
        <View style={styles.customRow}>
          <TextInput
            style={styles.customInput}
            placeholder="De (AAAA-MM-DD)"
            placeholderTextColor="#6B6B6B"
            value={customFrom}
            onChangeText={setCustomFrom}
            keyboardType="numbers-and-punctuation"
          />
          <TextInput
            style={styles.customInput}
            placeholder="Até (AAAA-MM-DD)"
            placeholderTextColor="#6B6B6B"
            value={customTo}
            onChangeText={setCustomTo}
            keyboardType="numbers-and-punctuation"
          />
          <TouchableOpacity style={styles.applyButton} onPress={applyCustomRange}>
            <Text style={styles.applyButtonText}>Aplicar</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#4CAF50" size="small" />
          <Text style={styles.loadingText}>Carregando histórico...</Text>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            Nenhum registro de presença encontrado neste período.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {events.map((event) => {
            const statusStyle = STATUS_STYLES[event.status];
            const hasBreak = event.breakStart !== null || event.breakEnd !== null;

            return (
              <View key={event.id} style={styles.ticketCard}>
                <View style={[styles.sideStripe, { backgroundColor: statusStyle.color }]} />

                <View style={styles.ticketBody}>
                  <View style={styles.ticketHeader}>
                    <Text style={styles.ticketDate}>{formatDate(event.date)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusStyle.color }]}>
                        {STATUS_LABELS[event.status]}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.ticketTimesRow}>
                    <View style={styles.timeBlock}>
                      <Text style={styles.timeLabel}>Entrada</Text>
                      <Text style={styles.timeValue}>{formatTime(event.checkIn)}</Text>
                    </View>

                    <View style={styles.timeDivider} />

                    <View style={styles.timeBlock}>
                      <Text style={styles.timeLabel}>Intervalo</Text>
                      <Text style={styles.timeValue}>
                        {hasBreak ? `${formatTime(event.breakStart)} – ${formatTime(event.breakEnd)}` : '--:--'}
                      </Text>
                    </View>

                    <View style={styles.timeDivider} />

                    <View style={styles.timeBlock}>
                      <Text style={styles.timeLabel}>Saída</Text>
                      <Text style={styles.timeValue}>{formatTime(event.checkOut)}</Text>
                    </View>
                  </View>

                  <View style={styles.ticketFooter}>
                    <Text style={styles.comprovanteLabel}>
                      Comprovante Nº {event.id.slice(0, 8).toUpperCase()}
                    </Text>

                    <View style={styles.shareRow}>
                      <TouchableOpacity
                        style={styles.shareButton}
                        onPress={() => shareViaWhatsApp(event)}
                        accessibilityLabel="Enviar comprovante por WhatsApp"
                      >
                        <Text style={[styles.shareIcon, { color: '#25D366' }]}>●WA</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.shareButton}
                        onPress={() => shareViaEmail(event)}
                        accessibilityLabel="Enviar comprovante por Email"
                      >
                        <Text style={[styles.shareIcon, { color: '#7B8CDE' }]}>● ✉</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  container: { flex: 1 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  chipActive: { backgroundColor: 'rgba(76, 175, 80, 0.16)', borderColor: '#4CAF50' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#8E8E93' },
  chipTextActive: { color: '#4CAF50' },
  customRow: { flexDirection: 'row', gap: 8, marginBottom: 16, alignItems: 'center' },
  customInput: {
    flex: 1,
    backgroundColor: COLORS.surface || '#1E1E1E',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  applyButton: { backgroundColor: '#4CAF50', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  applyButtonText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  list: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', height: 200, gap: 10 },
  loadingText: { color: '#8E8E93', fontSize: 14 },
  emptyText: { color: '#8E8E93', fontSize: 14, textAlign: 'center', paddingHorizontal: 24 },
  ticketCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface || '#1E1E1E',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  sideStripe: { width: 5 },
  ticketBody: { flex: 1, padding: 16 },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  ticketDate: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  ticketTimesRow: { flexDirection: 'row', alignItems: 'center' },
  timeBlock: { flex: 1 },
  timeLabel: { fontSize: 10, color: '#8E8E93', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.3 },
  timeValue: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  timeDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 10 },
  ticketFooter: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comprovanteLabel: { fontSize: 10, color: '#5C5C5C', letterSpacing: 0.4 },
  shareRow: { flexDirection: 'row', gap: 8 },
  shareButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  shareIcon: { fontSize: 11, fontWeight: '700' },
});