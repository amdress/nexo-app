// src/features/clients/components/modals/CreateClientModal.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";
import BaseModal from '@/shared/components/modals/BaseModal';
import FormTextInput from '@/shared/components/form/FormTextInput';
import { clientService } from '../../services/clientService';
import { ClientUI } from '../../interfacesUI/clientUI';
import { saveClientLogo } from '@/shared/utils/fileStorage';

interface CreateClientModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: (client: ClientUI) => void;
}

export default function CreateClientModal({ visible, onClose, onCreated }: CreateClientModalProps) {
  const [styles, COLORS] = useThemedStyles(getStyles);
  const [name, setName] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetAndClose = () => {
    setName('');
    setLogoUri(null);
    onClose();
  };

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

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Nome obrigatório', 'Informe o nome da empresa contratante.');
      return;
    }

    setIsSubmitting(true);
    try {
      let persistedLogoUri: string | null = null;
      if (logoUri) {
        persistedLogoUri = await saveClientLogo(trimmedName, logoUri);
      }

      const newClient = await clientService.createClient(trimmedName, persistedLogoUri);
      onCreated(newClient);
      resetAndClose();
    } catch (error: any) {
      Alert.alert('Erro', error?.message || 'Não foi possível criar a empresa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal visible={visible} onClose={resetAndClose} dismissible={!isSubmitting}>
      <Text style={styles.title}>Nova Empresa Contratante</Text>
      <Text style={styles.subtitle}>Ex: Mercado Livre, DHL, TSI...</Text>

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
        placeholder="Ex: Mercado Livre"
        value={name}
        onChangeText={setName}
      />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={resetAndClose} disabled={isSubmitting}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.confirmBtn, isSubmitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={COLORS.textDark} />
          ) : (
            <Text style={styles.confirmBtnText}>Criar</Text>
          )}
        </TouchableOpacity>
      </View>
    </BaseModal>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  title: { fontSize: 16, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  subtitle: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginTop: 2, marginBottom: 16 },
  logoPicker: { alignSelf: 'center', marginBottom: 16 },
  logoImage: { width: 80, height: 80, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  logoPlaceholderText: { color: COLORS.textMuted, fontSize: 9, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { color: COLORS.textMuted, fontWeight: '600', fontSize: 14 },
  confirmBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  confirmBtnText: { color: COLORS.textDark, fontWeight: '700', fontSize: 14 },
});