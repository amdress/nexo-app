// src/features/daily/components/DailyCard.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";
import { getStatusBadgeStyles } from "../../utils/dailyFormatter";
import { DailyItem } from "../../interfacesUI/daily";

interface DailyCardProps {
  daily: DailyItem;
  onPress: () => void;
}

export default function DailyCard({ daily, onPress }: DailyCardProps) {
  const [styles, COLORS] = useThemedStyles(getStyles);

  // Memorizamos el Badge para evitar recalcular innecesariamente y cumplir con el ciclo de vida
  const badge = useMemo(() => {
    return getStatusBadgeStyles(daily.status, COLORS);
  }, [daily.status, COLORS]);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.statusWrapper}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: badge.bg, borderColor: badge.border },
          ]}
        >
          <Text style={[styles.statusText, { color: badge.text }]}>
            {badge.label}
          </Text>
        </View>
      </View>

      <View style={styles.mainContentRow}>
        <View style={styles.dateTimeColumn}>
          <View style={styles.infoMeta}>
            <Ionicons
              name="calendar-outline"
              size={15}
              color={COLORS.primary}
            />
            <View style={styles.dateContainer}>
              <Text style={styles.dayNameText}>{daily.dayName}</Text>
              <Text style={styles.dateText}>{daily.dateLabel}</Text>
            </View>
          </View>

          <View style={styles.infoMeta}>
            <Ionicons name="time-outline" size={15} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{daily.timeRange}</Text>
          </View>
        </View>

        <View style={styles.staffColumn}>
          <View style={styles.staffHighlightMeta}>
            <Ionicons name="people" size={18} color={COLORS.success} />
            <Text style={styles.staffHighlightText}>
              {`${daily.confirmedStaffCount}/${daily.requiredStaffCount}`}
              <Text style={styles.staffLabelText}> Req.</Text>
            </Text>
          </View>
        </View>
      </View>

      {daily.description ? (
        <View style={styles.descriptionWrapper}>
          <Text style={styles.descriptionText}>{`"${daily.description}"`}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  statusWrapper: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  mainContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 16,
  },
  staffColumn: {
    flex: 1, 
    justifyContent: 'center',
  },
  staffHighlightMeta: {
    flexDirection: 'row',      
    alignItems: 'center',      
    justifyContent: 'space-evenly',    
    backgroundColor: COLORS.background, 
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 15,
    gap: 10,                     
    width: '100%',
    height: 80,
  },
  staffHighlightText: {
    color: COLORS.success,
    fontSize: 25,               
    fontWeight: '700',
  },
  staffLabelText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '400',          
  },
  dateTimeColumn: {
    flex: 1.2,
    flexDirection: "column",
    gap: 12,
  },
  dateContainer: {
    flexDirection: "column",
  },
  dayNameText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  infoMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  descriptionWrapper: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    marginTop: 4,
  },
  descriptionText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontStyle: "italic",
  },
});