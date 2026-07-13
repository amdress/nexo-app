import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";

interface AvatarPickerProps {
  avatarUri: string | null;
  onChange: (uri: string | null) => void;
  disabled?: boolean;
}

export default function AvatarPicker({ avatarUri, onChange, disabled }: AvatarPickerProps) {
  const [styles, COLORS] = useThemedStyles(getStyles);
  const handleTakeWithCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        'Permissão Negada',
        'É necessário conceder permissão para acessar a câmera nas configurações do dispositivo.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      onChange(result.assets[0].uri);
    }
  };

  const handlePickFromGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        'Permissão Negada',
        'É necessário conceder permissão para acessar a galeria de fotos.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      onChange(result.assets[0].uri);
    }
  };

  const handleAvatarPress = () => {
    Alert.alert(
      'Foto do Funcionário',
      'Escolha de onde deseja importar a imagem do colaborador:',
      [
        { text: 'Tirar Foto (Câmera)', onPress: handleTakeWithCamera },
        { text: 'Escolher da Galeria', onPress: handlePickFromGallery },
        avatarUri ? { text: 'Remover Foto', onPress: () => onChange(null), style: 'destructive' } : null,
        { text: 'Cancelar', style: 'cancel' },
      ].filter(Boolean) as any
    );
  };

  return (
    <View style={styles.avatarSection}>
      <TouchableOpacity
        style={styles.avatarWrapper}
        onPress={handleAvatarPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person-outline" size={40} color={COLORS.textMuted} />
          </View>
        )}
        <View style={styles.cameraBadge}>
          <Ionicons name="camera" size={16} color={COLORS.textDark} />
        </View>
      </TouchableOpacity>
      <Text style={styles.avatarHelpText}>Toque para adicionar foto</Text>
    </View>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  avatarWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  avatarHelpText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 8,
  },
});