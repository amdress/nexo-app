import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ToastNotification from '../../../shared/components/alerts/ToastNotification';
import LoadingState from '../../../layouts/components/LoadingState';
import StaffCard from '../components/cards/StaffCard';
import { staffService } from '../services/staffService';
import { StaffUI } from '../interacesUI/staffUI';
import { useThemedStyles } from '@/shared/hooks/useThemedStyles';

export default function StaffListScreen({ navigation }: any) {
  const [staffList, setStaffList] = useState<StaffUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [styles, COLORS] = useThemedStyles(getStyles);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadStaffMembers() {
        try {
          setIsLoading(true);
          const data = await staffService.getAllStaff();
          if (isMounted) {
            setStaffList(data);
            if (data.length > 0) {
              setToast({ message: `${data.length} colaboradores carregados`, type: 'success' });
            }
          }
        } catch (error) {
          console.error('[StaffScreen] Erro ao carregar funcionários:', error);
          if (isMounted) setToast({ message: 'Erro ao carregar funcionários', type: 'error' });
        } finally {
          if (isMounted) setIsLoading(false);
        }
      }

      loadStaffMembers();
      return () => { isMounted = false; };
    }, [])
  );

  return (
    <View style={styles.container}>
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {isLoading ? (
        <LoadingState />
      ) : (
        <FlatList
          data={staffList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StaffCard
              staff={item}
              onPress={() => navigation.navigate('StaffProfile', { staffId: item.id })}
            />
          )}
          contentContainerStyle={staffList.length === 0 ? styles.listContentEmpty : styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>Nenhum funcionário cadastrado no momento.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('StaffCreate')}
      >
        <Ionicons name="add" size={28} color={COLORS.textDark} />
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 90 },
  listContentEmpty: { flexGrow: 1 },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});