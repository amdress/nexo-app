import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles } from '@/shared/hooks/useThemedStyles';

interface ToastNotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export default function ToastNotification({ message, type = 'success', onClose }: ToastNotificationProps) {
  const opacity = new Animated.Value(0);
  const [styles, COLORS] = useThemedStyles(getStyless);

  useEffect(() => {
    // Animación de entrada (Fade In)
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Temporizador para auto-cerrarse en 3.5 segundos
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => onClose());
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const getStyles = () => {
    switch (type) {
      case 'error':
        return { bg: '#2A1A1A', border: '#5A2020', text: '#FF8888', icon: 'alert-circle' as const };
      case 'info':
        return { bg: '#1A242A', border: '#203E5A', text: '#88D8FF', icon: 'information-circle' as const };
      default: // success
        return { bg: '#1A2A1A', border: '#205A20', text: '#88FF88', icon: 'checkmark-circle' as const };
    }
  };

  const config = getStyles();

  return (
    <Animated.View style={[styles.toastContainer, { opacity, backgroundColor: config.bg, borderColor: config.border }]}>
      <Ionicons name={config.icon} size={20} color={config.text} />
      <Text style={[styles.toastText, { color: config.text }]}>{message}</Text>
    </Animated.View>
  );
}

const getStyless = (COLORS: any) => StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});