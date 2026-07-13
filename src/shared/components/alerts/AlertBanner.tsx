import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles } from '@/shared/hooks/useThemedStyles';

interface AlertBannerProps {
  message: string;
  type?: 'warning' | 'error' | 'success' | 'info';
}

export default function AlertBanner({ message, type = 'warning' }: AlertBannerProps) {
  const [styles, COLORS] = useThemedStyles(getStyless);
  
  const getStyles = () => {
    switch (type) {
      case 'error':
        return { bg: '#2A1A1A', border: '#5A2020', text: '#FF8888', icon: 'alert-circle-outline' as const };
      case 'success':
        return { bg: '#1A2A1A', border: '#205A20', text: '#88FF88', icon: 'checkmark-circle-outline' as const };
      case 'info':
        return { bg: '#1A242A', border: '#203E5A', text: '#88D8FF', icon: 'information-circle-outline' as const };
      default: // warning
        return { bg: '#2A261A', border: '#5A4C20', text: '#FFE388', icon: 'warning-outline' as const };
    }
  };

  const config = getStyles();

  return (
    <View style={[styles.container, { backgroundColor: config.bg, borderColor: config.border }]}>
      <Ionicons name={config.icon} size={20} color={config.text} style={styles.icon} />
      <Text style={[styles.text, { color: config.text }]}>{message}</Text>
    </View>
  );
}

const getStyless = (COLORS: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 10,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
});