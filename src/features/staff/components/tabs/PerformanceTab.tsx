// src/features/staff/components/PerformanceTab.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { staffService } from '../../services/staffService';
import { StaffPerformance } from '../../interacesUI/staffUI';
import { useThemedStyles } from '@/shared/hooks/useThemedStyles';

interface PerformanceTabProps {
  staffId: string;
}

export function PerformanceTab({ staffId }: PerformanceTabProps) {
  const [metrics, setMetrics] = useState<StaffPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [styles, COLORS] = useThemedStyles(getStyles);

  useEffect(() => {
    // const fetchPerformance = async () => {
    //   try {
    //     const data = await staffService.getStaffPerformance(staffId);
    //     setMetrics(data);
    //   } catch (error) {
    //     Alert.alert('Erro', 'Não foi possível carregar as métricas de performance.');
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // fetchPerformance();
  }, [staffId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#4CAF50" size="small" />
        <Text style={styles.loadingText}>Carregando métricas...</Text>
      </View>
    );
  }

  const ProgressBar = ({ percentage, color }: { percentage: number; color: string }) => (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: color }]} />
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Avaliação Geral</Text>
        <Text style={styles.scoreValue}>
          {metrics ? metrics.evaluationScore.toFixed(1) : '0.0'}{' '}
          <Text style={styles.scoreMax}>/ 5.0</Text>
        </Text>
        <Text style={styles.scoreSubtext}>Desempenho sincronizado a partir do banco de dados</Text>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricTitle}>Presença</Text>
            <Text style={[styles.metricPercentage, { color: '#4CAF50' }]}>
              {metrics ? `${metrics.attendanceRate}%` : '--'}
            </Text>
          </View>
          <ProgressBar percentage={metrics?.attendanceRate || 0} color="#4CAF50" />
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricTitle}>Pontualidade</Text>
            <Text style={[styles.metricPercentage, { color: '#FFC107' }]}>
              {metrics ? `${metrics.punctualityRate}%` : '--'}
            </Text>
          </View>
          <ProgressBar percentage={metrics?.punctualityRate || 0} color="#FFC107" />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Eficiência de Tarefas</Text>
        <View style={styles.tasksRow}>
          <View style={styles.taskStat}>
            <Text style={styles.taskStatValue}>{metrics?.completedTasks ?? 0}</Text>
            <Text style={styles.taskStatLabel}>Concluídas</Text>
          </View>

          <View style={styles.taskDivider} />

          <View style={styles.taskStat}>
            <Text style={styles.taskStatValue}>{metrics?.totalTasks ?? 0}</Text>
            <Text style={styles.taskStatLabel}>Atribuídas</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', height: 200, gap: 10 },
  loadingText: { color: '#8E8E93', fontSize: 14 },
  scoreCard: {
    backgroundColor: COLORS.surface || '#1E1E1E',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  scoreValue: { fontSize: 38, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  scoreMax: { fontSize: 18, color: '#555', fontWeight: '500' },
  scoreSubtext: { fontSize: 12, color: '#8E8E93', textAlign: 'center' },
  metricsGrid: { flexDirection: 'column', gap: 12, marginBottom: 16 },
  metricCard: {
    backgroundColor: COLORS.surface || '#1E1E1E',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  metricPercentage: { fontSize: 16, fontWeight: '700' },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  card: {
    backgroundColor: COLORS.surface || '#1E1E1E',
    borderRadius: 20,
    padding: 22,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 },
  tasksRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  taskStat: { alignItems: 'center' },
  taskStatValue: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  taskStatLabel: { fontSize: 12, color: '#8E8E93', marginTop: 4 },
  taskDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.1)' },
});