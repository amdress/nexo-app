// src/features/staff/components/StaffCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StaffUI } from '../../interacesUI/staffUI';
import { useThemedStyles } from '@/shared/hooks/useThemedStyles';

interface StaffCardProps {
  staff: StaffUI;
  onPress: () => void;
}

export default function StaffCard({ staff, onPress }: StaffCardProps) {
  const isActive = staff.status === 'active';
  const [styles, COLORS] = useThemedStyles(getStyles);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          {staff.avatarUri ? (
            <Image source={{ uri: staff.avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{staff.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}

          <View style={styles.metaContainer}>
            <Text style={styles.staffName} numberOfLines={1}>{staff.name}</Text>
            <Text style={styles.staffRole}>{staff.role}</Text>
          </View>

          <View style={[styles.statusBadge, isActive ? styles.badgeActive : styles.badgeInactive]}>
            <Text style={[styles.statusText, isActive ? styles.statusTextActive : styles.statusTextInactive]}>
              {isActive ? 'Ativo' : 'Inativo'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
const getStyles = (COLORS: any) => StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  avatarText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '400',
  },
  metaContainer: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  staffName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  staffRole: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeActive: {
    backgroundColor: '#1A2A1A',
  },
  badgeInactive: {
    backgroundColor: '#3A1A1A',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusTextActive: {
    color: COLORS.success,
  },
  statusTextInactive: {
    color: '#FF8888',
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  editButton: {
    padding: 4,
  },
});