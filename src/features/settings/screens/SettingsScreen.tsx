// src/features/settings/screens/SettingsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [styles, COLORS] = useThemedStyles(getStyles);

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>

        {/* Opción 1: Preferências (Idioma, Tema, etc.) */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('GeneralPreferences')}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="options-outline" size={22} color={COLORS.primary} />
            <Text style={styles.menuItemText}>{t('settings.general_config')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Opción 2: Minha Empresa (branding da contratista, ex: MMG) */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('CompanyProfile')}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="business-outline" size={22} color={COLORS.primary} />
            <Text style={styles.menuItemText}>{t('settings.my_company')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Opción 3: Empresas Contratantes (catálogo de clientes) */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('ClientsList')}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="briefcase-outline" size={22} color={COLORS.primary} />
            <Text style={styles.menuItemText}>{t('settings.contracting_companies')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Próximos enlaces abajo */}

      </View>
    </View>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 16,
  },
  listContainer: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
  },
});