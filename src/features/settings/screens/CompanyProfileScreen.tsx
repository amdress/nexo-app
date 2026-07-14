// src/features/settings/screens/CompanyProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";
import ScreenLayout from '@/layouts/ScreenLayout';
import FormTextInput from '@/shared/components/form/FormTextInput';
import { saveCompanyLogo } from '@/shared/utils/fileStorage';

const COMPANY_NAME_KEY = '@company_profile_name';
const COMPANY_LOGO_KEY = '@company_profile_logo_uri';

export default function CompanyProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [styles, COLORS] = useThemedStyles(getStyles);

  const [name, setName] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const [storedName, storedLogo] = await Promise.all([
          AsyncStorage.getItem(COMPANY_NAME_KEY),
          AsyncStorage.getItem(COMPANY_LOGO_KEY),
        ]);
        if (storedName) setName(storedName);
        if (storedLogo) setLogoUri(storedLogo);
      } catch (error) {
        console.error('[COMPANY_PROFILE] Erro ao carregar perfil:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

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
      Alert.alert('Nome obrigatório', 'Informe o nome da sua empresa.');
      return;
    }

    setIsSaving(true);
    try {
      let persistedLogoUri = logoUri;

      // Só copia para o filesystem persistente se for uma URI temporária nova
      // (não recopia se já é a URI salva anteriormente)
      const storedLogo = await AsyncStorage.getItem(COMPANY_LOGO_KEY);
      if (logoUri && logoUri !== storedLogo) {
        persistedLogoUri = await saveCompanyLogo(logoUri);
      }

      await AsyncStorage.setItem(COMPANY_NAME_KEY, trimmedName);
      if (persistedLogoUri) {
        await AsyncStorage.setItem(COMPANY_LOGO_KEY, persistedLogoUri);
      }

      Alert.alert('Sucesso', 'Perfil da empresa atualizado.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Erro', error?.message || 'Não foi possível salvar o perfil da empresa.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ScreenLayout title={t('settings.my_company')} onBackPress={() => navigation.goBack()}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title={t('settings.my_company')} onBackPress={() => navigation.goBack()}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.logoPicker} onPress={handlePickLogo} activeOpacity={0.7}>
          {logoUri ? (
            <Image source={{ uri: logoUri }} style={styles.logoImage} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Ionicons name="image-outline" size={32} color={COLORS.textMuted} />
              <Text style={styles.logoPlaceholderText}>{t('company.profile_logo')}</Text>
            </View>
          )}
        </TouchableOpacity>

        <FormTextInput
          label={t('company.name')}
          placeholder="Ex: MMG Terceirizações"
          value={name}
          onChangeText={setName}
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
            <Text style={styles.saveBtnText}>{t('common.save')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, gap: 20 },
  logoPicker: { alignSelf: 'center' },
  logoImage: { width: 100, height: 100, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  logoPlaceholderText: { color: COLORS.textMuted, fontSize: 11, textAlign: 'center' },
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