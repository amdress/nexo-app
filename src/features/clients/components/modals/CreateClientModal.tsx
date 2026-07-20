// src/features/clients/screens/ClientFormScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";
import ScreenLayout from '@/layouts/ScreenLayout';
import FormTextInput from '@/shared/components/form/FormTextInput';
import { clientService } from '../../services/clientService';
import { saveClientLogo } from '@/shared/utils/fileStorage';

export default function ClientFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const clientId: string | undefined = route.params?.clientId;
  const isEditMode = !!clientId;

  const [styles, COLORS] = useThemedStyles(getStyles);

  const [name, setName] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [accountLabel, setAccountLabel] = useState('');
  const [site, setSite] = useState('');
  const [address, setAddress] = useState('');
  const [cityState, setCityState] = useState('');

  const [loading, setLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;

    async function loadClient() {
      try {
        const clients = await clientService.getAllClients();
        const existing = clients.find((c) => c.id === clientId);
        if (existing) {
          setName(existing.name);
          setLogoUri(existing.logoUri);
          setAccountLabel(existing.accountLabel || '');
          setSite(existing.site || '');
          setAddress(existing.address || '');
          setCityState(existing.cityState || '');
        }
      } catch (error: any) {
        Alert.alert('Erro', error?.message || 'Não foi possível carregar a empresa.');
      } finally {
        setLoading(false);
      }
    }
    loadClient();
  }, [clientId, isEditMode]);

  const handlePickLogo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão Negada', 'É necessário acesso à galeria para selecionar o logo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setLogoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Nome obrigatório', 'Informe o nome da empresa contratante.');
      return;
    }

    setIsSaving(true);
    try {
      let persistedLogoUri = logoUri;

      // Só copia para o filesystem se for uma URI temporária nova (começa com file:// de cache)
      const isNewLocalUri = logoUri && !logoUri.includes('/clients/');
      if (logoUri && isNewLocalUri) {
        persistedLogoUri = await saveClientLogo(trimmedName, logoUri);
      }

      const formData = {
        name: trimmedName,
        logoUri: persistedLogoUri,
        accountLabel: accountLabel.trim(),
        site: site.trim(),
        address: address.trim(),
        cityState: cityState.trim(),
      };

      if (isEditMode) {
        await clientService.updateClient(clientId!, formData);
      } else {
        await clientService.createClient(formData);
      }

      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erro', error?.message || 'Não foi possível salvar a empresa.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenLayout title="Empresa Contratante" onBackPress={() => navigation.goBack()}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      title={isEditMode ? 'Editar Empresa' : 'Nova Empresa'}
      onBackPress={() => navigation.goBack()}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.logoPicker} onPress={handlePickLogo} activeOpacity={0.7}>
          {logoUri ? (
            <Image source={{ uri: logoUri }} style={styles.logoImage} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Ionicons name="image-outline" size={28} color={COLORS.textMuted} />
              <Text style={styles.logoPlaceholderText}>Logo (opcional)</Text>
            </View>
          )}
        </TouchableOpacity>

        <FormTextInput
          label="Nome da Empresa"
          placeholder="Ex: DHL"
          value={name}
          onChangeText={setName}
        />

        <FormTextInput
          label="Conta / Referência"
          placeholder="Ex: MELI - DHL"
          value={accountLabel}
          onChangeText={setAccountLabel}
        />

        <FormTextInput
          label="Site / Unidade"
          placeholder="Ex: CURITIBA - SVC"
          value={site}
          onChangeText={setSite}
        />

        <FormTextInput
          label="Endereço"
          placeholder="Ex: RUA SÃO BENTO 2143"
          value={address}
          onChangeText={setAddress}
        />

        <FormTextInput
          label="Cidade / UF"
          placeholder="Ex: CURITIBA"
          value={cityState}
          onChangeText={setCityState}
        />

        <TouchableOpacity
          style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={COLORS.textDark} />
          ) : (
            <Text style={styles.saveBtnText}>{isEditMode ? 'Salvar Alterações' : 'Criar Empresa'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, gap: 16 },
  logoPicker: { alignSelf: 'center', marginBottom: 4 },
  logoImage: { width: 90, height: 90, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  logoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  logoPlaceholderText: { color: COLORS.textMuted, fontSize: 10, textAlign: 'center' },
  saveBtn: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { color: COLORS.textDark, fontWeight: '700', fontSize: 15 },
});