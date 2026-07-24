// src/features/daily/components/DailyCard.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
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

  const badge = useMemo(() => {
    return getStatusBadgeStyles(daily.status || "scheduled", COLORS);
  }, [daily.status, COLORS]);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      
      {/* Fila principal de contenido */}
      <View style={styles.mainRow}>
        
        {/* Columna Izquierda: Identidad y Tiempos */}
        <View style={styles.infoColumn}>
          
          {/* Bloque Cliente */}
          <View style={styles.clientRow}>
            {daily.clientLogo ? (
              <Image 
                source={{ uri: daily.clientLogo }} 
                style={styles.clientAvatar} 
                resizeMode="cover"
              />
            ) : (
              <View style={styles.clientAvatarPlaceholder}>
                <Ionicons name="business" size={14} color={COLORS.primary} />
              </View>
            )}
            <Text style={styles.clientNameText} numberOfLines={1}>
              {daily.clientName || "Empresa Não Informada"}
            </Text>
          </View>

          {/* Bloque Fecha y Horas */}
          <View style={styles.metaDataGroup}>
            <View style={styles.infoMeta}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
              <Text style={styles.dateText}>
                {daily.dayName}, <Text style={styles.dateLabelHighlight}>{daily.dateLabel}</Text>
              </Text>
            </View>

            <View style={styles.infoMeta}>
              <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{daily.timeRange}</Text>
            </View>
          </View>

        </View>

        {/* Columna Derecha: Estados y Contadores */}
        <View style={styles.sideColumn}>
          {/* Status Badge */}
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

          {/* Contador de Staff Compacto */}
          <View style={styles.staffCounterBadge}>
            <Ionicons name="people" size={15} color={COLORS.success} />
            <Text style={styles.staffCountText}>
              {daily.confirmedStaffCount}
              <Text style={styles.staffCountTotal}>/{daily.requiredStaffCount}</Text>
            </Text>
          </View>
        </View>

      </View>

      {/* Footer: Descripción Opcional */}
      {daily.description ? (
        <View style={styles.descriptionWrapper}>
          <Text style={styles.descriptionText} numberOfLines={2}>
            {daily.description}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  mainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
    gap: 12,
  },
  infoColumn: {
    flex: 1,
    justifyContent: "space-between",
    gap: 12,
  },
  clientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  clientAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  clientAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  clientNameText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  metaDataGroup: {
    gap: 6,
  },
  infoMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  dateLabelHighlight: {
    color: COLORS.text,
    fontWeight: "600",
  },
  metaText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  sideColumn: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    minWidth: 85,
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  staffCounterBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  staffCountText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  staffCountTotal: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  descriptionWrapper: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight || COLORS.border,
    paddingTop: 10,
    marginTop: 12,
  },
  descriptionText: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
});