import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StaffUI } from '../../interacesUI/staffUI';
import { useThemedStyles } from '@/shared/hooks/useThemedStyles';

interface Props {
  staff: StaffUI;
  selectable?: boolean;
  selected?: boolean;
  onPress?: () => void;
}

export default function StaffCardSelectable({
  staff,
  selectable = false,
  selected = false,
  onPress,
}: Props) {
  const [styles, COLORS] = useThemedStyles(getStyles);
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.container,
        selected && styles.selectedContainer,
      ]}
    >
      {staff.avatarUri ? (
        <Image
          source={{ uri: staff.avatarUri }}
          style={styles.avatar}
        />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {staff.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.name}>
          {staff.name}
        </Text>

        <Text style={styles.role}>
          {staff.role}
        </Text>

        <View
          style={[
            styles.status,
            staff.status === 'active'
              ? styles.active
              : styles.inactive,
          ]}
        >
          <Text style={styles.statusText}>
            {staff.status === 'active'
              ? 'Ativo'
              : 'Inativo'}
          </Text>
        </View>
      </View>

      {selectable && (
        <Ionicons
          name={
            selected
              ? 'checkmark-circle'
              : 'ellipse-outline'
          }
          size={28}
          color={
            selected
              ? COLORS.success
              : COLORS.textMuted
          }
        />
      )}
    </TouchableOpacity>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
  },

  selectedContainer: {
    borderColor: COLORS.success,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },

  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: COLORS.text,
    fontWeight: '700',
  },

  info: {
    flex: 1,
    marginHorizontal: 12,
  },

  name: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 15,
  },

  role: {
    color: COLORS.textMuted,
    marginTop: 2,
    fontSize: 13,
  },

  status: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  active: {
    backgroundColor: '#17351F',
  },

  inactive: {
    backgroundColor: '#402020',
  },

  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});