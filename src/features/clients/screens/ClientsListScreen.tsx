// src/features/clients/screens/ClientsListScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";
import ScreenLayout from '@/layouts/ScreenLayout';
import FAB from '@/shared/components/btn/FAB';
import { clientService } from '../services/clientService';
import { ClientUI } from '../interfacesUI/clientUI';

export default function ClientsListScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [styles, COLORS] = useThemedStyles(getStyles);

  const [clients, setClients] = useState<ClientUI[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await clientService.getAllClients();
      setClients(data);
    } catch (error: any) {
      Alert.alert('Erro', error?.message || 'Não foi possível carregar as empresas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadClients();
    }, [loadClients])
  );

  const handleDelete = (client: ClientUI) => {
    Alert.alert(
      'Remover empresa',
      `Deseja remover "${client.name}" da lista de empresas contratantes?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await clientService.deleteClient(client.id);
              setClients((prev) => prev.filter((c) => c.id !== client.id));
            } catch (error: any) {
              Alert.alert('Erro', error?.message || 'Não foi possível remover a empresa.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: ClientUI }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigation.navigate('ClientForm', { clientId: item.id })}
      onLongPress={() => handleDelete(item)}
      activeOpacity={0.7}
    >
      {item.logoUri ? (
        <Image source={{ uri: item.logoUri }} style={styles.logo} />
      ) : (
        <View style={styles.logoPlaceholder}>
          <Ionicons name="business-outline" size={20} color={COLORS.textMuted} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        {item.accountLabel ? <Text style={styles.subtitle}>{item.accountLabel}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );

  return (
    <ScreenLayout
      title={t('settings.contracting_companies', 'Empresas Contratantes')}
      onBackPress={() => navigation.goBack()}
    >
      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={clients}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="briefcase-outline" size={40} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Nenhuma empresa cadastrada</Text>
                <Text style={styles.emptySubtext}>
                  Adicione as empresas para as quais você presta serviço, como Mercado Livre, DHL, etc.
                </Text>
              </View>
            }
          />
        )}

        <FAB icon="add" onPress={() => navigation.navigate('ClientForm')} />
      </View>
    </ScreenLayout>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  logo: { width: 40, height: 40, borderRadius: 8 },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  subtitle: { color: COLORS.textMuted, fontSize: 12, marginTop: 1 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 32, gap: 8 },
  emptyText: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginTop: 8 },
  emptySubtext: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 18 },
});