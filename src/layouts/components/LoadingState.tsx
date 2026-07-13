// src/shared/components/feedback/LoadingState.tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useThemedStyles } from '@/shared/hooks/useThemedStyles';

export default function LoadingState() {
  const [styles, COLORS] = useThemedStyles(getStyles);
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}
const getStyles = (COLORS: any) => StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
});