// src/features/settings/screens/GeneralPreferencesScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native'; // 🌟 Corregido el nombre del paquete oficial
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";
import { useTheme } from "@/shared/context/ThemeContext";
import ScreenLayout from '@/layouts/ScreenLayout';
import BaseModal from '@/shared/components/modals/BaseModal';
import LanguageSelector from '../components/modals/LanguageSelector';
import { changeLanguage, SupportedLanguages } from '../../../shared/config/i18n'; 

export default function GeneralPreferencesScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation(); 
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const { isDarkMode, toggleTheme } = useTheme();
  const [styles, COLORS] = useThemedStyles(getStyles);

  const languages = [
    { code: 'pt', label: 'Português (BR)' },
    { code: 'es', label: 'Español' },
  ];

  const currentLanguageLabel =
    languages.find((lang) => lang.code === i18n.language)?.label || 'Português (BR)';

  const handleLanguageChange = async (langCode: string) => {
    await changeLanguage(langCode as SupportedLanguages);
    setIsModalVisible(false);
  };

  return (
    <ScreenLayout 
      title={t('settings.general_config', 'Configurações Gerais')} 
      onBackPress={() => navigation.goBack()} // 🌟 Retorno nativo por historial
    >
      <View style={styles.listContainer}>
        {/* SELEÇÃO DE IDIOMA */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="language-outline" size={22} color={COLORS.primary} />
            <View style={styles.textContainer}>
              <Text style={styles.menuItemText}>{t('preferences.language_label', 'Idioma do App')}</Text>
              <Text style={styles.menuItemSubtext}>{currentLanguageLabel}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* INTERRUPTOR MODO OSCURO */}
        <View style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons 
              name={isDarkMode ? "moon-outline" : "sunny-outline"} 
              size={22} 
              color={COLORS.primary} 
            />
            <View style={styles.textContainer}>
              <Text style={styles.menuItemText}>{t('preferences.dark_mode_label', 'Modo Escuro')}</Text>
              <Text style={styles.menuItemSubtext}>
                {isDarkMode ? t('preferences.dark_mode_on', 'Ativado') : t('preferences.dark_mode_off', 'Desativado')}
              </Text>
            </View>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={isDarkMode ? COLORS.background : '#f4f3f4'}
            ios_backgroundColor={COLORS.border}
          />
        </View>
      </View>

      <BaseModal visible={isModalVisible} onClose={() => setIsModalVisible(false)}>
        <LanguageSelector onSelect={handleLanguageChange} />
      </BaseModal>
    </ScreenLayout>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  listContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 14,
  },
  menuItemText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
  },
  menuItemSubtext: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});