import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";

interface FABProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  backgroundColor?: string;
  iconColor?: string;
  style?: ViewStyle;
}

export default function FAB({ 
  icon, 
  onPress, 
  backgroundColor, 
  iconColor, 
  style 
}: FABProps) {
  
  // 2. Ejecutas el hook dentro del componente (donde pertenece)
  const [styles, COLORS] = useThemedStyles(getStyles);

  // 3. Aplicas los valores por defecto dinámicos usando cortocircuito (|| o ??)
  const finalBgColor = backgroundColor || COLORS.primary;
  const finalIconColor = iconColor || COLORS.textDark;
   
  return (
    <TouchableOpacity 
      style={[styles.fab, { backgroundColor: finalBgColor }, style]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={26} color={finalIconColor} />
    </TouchableOpacity>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

