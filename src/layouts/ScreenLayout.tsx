// src/shared/components/layouts/ScreenLayout.tsx
import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";

interface ScreenLayoutProps {
  children: ReactNode;
  title: string;
  onBackPress?: () => void;
}

export default function ScreenLayout({ children, title, onBackPress }: ScreenLayoutProps) {
  const [styles, COLORS] = useThemedStyles(getStyles);
  return (
    // Controla a zona segura do topo de forma única e limpa para telas do Stack
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Padronizado e Profissional */}
      <View style={styles.header}>
        {onBackPress ? (
          <TouchableOpacity style={styles.backButton} onPress={onBackPress} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}
        
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        
        <View style={styles.spacer} />
      </View>

      {/* Conteúdo da Tela */}
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface, // Mantém a cor do topo idêntica ao AppLayout das abas
  },
  header: {
    height: 64,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
    minWidth: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    flex: 1,
  },
  spacer: {
    width: 32,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background, // O corpo da tela volta para o background escuro/padrão
  },
});