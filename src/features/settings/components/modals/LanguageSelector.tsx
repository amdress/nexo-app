// src/features/settings/components/LanguageSelector.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";

interface LanguageOption {
  code: string;
  label: string;
}

interface LanguageSelectorProps {
  onSelect: (code: string) => void;
}

// 🌟 Tipamos explícitamente los argumentos con la interfaz LanguageSelectorProps
export default function LanguageSelector({ onSelect }: LanguageSelectorProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const [styles, COLORS] = useThemedStyles(getStyles);

  const languages: LanguageOption[] = [
    { code: 'pt', label: 'Português (BR)' },
    { code: 'es', label: 'Español' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.modalTitle}>{t('preferences.select_language')}</Text>
      
      <FlatList
        data={languages}
        keyExtractor={(item) => item.code}
        scrollEnabled={false}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const isSelected = i18n.language === item.code;
          return (
            <TouchableOpacity
              style={styles.langItem}
              onPress={() => onSelect(item.code)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.langText,
                  isSelected && { color: COLORS.primary, fontWeight: '700' },
                ]}
              >
                {item.label}
              </Text>
              {isSelected && (
                <Ionicons name="checkmark" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
const getStyles = (COLORS: any) =>  StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  listContainer: {
    gap: 4,
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#121214',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1f1f23',
  },
  langText: {
    color: '#ffffff',
    fontSize: 15,
  },
});