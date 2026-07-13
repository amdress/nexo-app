import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface StaffListProps {
  items: StaffMember[];
  selectedIds?: string[];
  rightActionIcon?: React.ComponentProps<typeof Ionicons>['name'];
  onActionPress?: (id: string) => void;
  actionIconColor?: string;
}

export default function StaffList({
  items,
  selectedIds = [],
  rightActionIcon = 'checkmark-circle',
  onActionPress,
  actionIconColor, // 1. Lo dejas limpio aquí en los argumentos
}: StaffListProps) {
  
  // 2. Ejecutas el hook dentro del componente
  const [styles, COLORS] = useThemedStyles(getStyles);

  // 3. Resuelves el valor por defecto dinámicamente
  const finalIconColor = actionIconColor || COLORS.primary;

  return (
    <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
      {items.map((member) => {
        const isSelected = selectedIds.includes(member.id);
        
        return (
          <View 
            key={member.id} 
            style={[
              styles.staffRow, 
              isSelected && { 
                borderColor: COLORS.success,
                // Usamos el color de éxito con opacidad para que se adapte al modo oscuro
                backgroundColor: `${COLORS.success}14` 
              }
            ]}
          >
            <View style={styles.staffLeft}>
              {member.avatar ? (
                <Image source={{ uri: member.avatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{member.name.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View>
                <Text style={styles.staffName}>{member.name}</Text>
                <Text style={styles.staffRole}>{member.role}</Text>
              </View>
            </View>
            
            {onActionPress && (
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => onActionPress(member.id)} 
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
                  size={24} 
                  color={isSelected ? COLORS.success : COLORS.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
  staffRow: {
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  staffLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  avatarText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  staffName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  staffRole: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  actionButton: {
    padding: 4,
  },
});