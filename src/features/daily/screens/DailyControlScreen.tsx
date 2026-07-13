// src/features/daily/screens/DailyControlScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { DailyItem, StaffAttendance } from "../interfacesUI/daily";
import { dailyService } from "../services/dailyService";
import StaffListControl from "../components/lists/StaffListControl";
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";

export default function DailyControlScreen({ route, navigation }: any) {
  
  const { dailyId } = route.params || { dailyId: "" };
  const [dailyInfo, setDailyInfo] = useState<DailyItem | null>(null);
  const [staffList, setStaffList] = useState<StaffAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [styles, COLORS] = useThemedStyles(getStyles);

  const loadDailyData = async () => {
    try {
      setLoading(true);
      const data = await dailyService.getDailyWithStaff(dailyId);
      if (data) {
        setDailyInfo(data.daily);
        setStaffList(data.staff);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os dados da jornada.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dailyId) loadDailyData();
  }, [dailyId]);

  // ─── Estado da jornada e regra do footer ───

  const isDailyScheduled = dailyInfo?.status === "scheduled";
  const isDailyInProgress = dailyInfo?.status === "in_progress";
  const isDailyCompleted = dailyInfo?.status === "completed";

  const incompleteStaff = staffList.filter((s) => {
    if (s.status !== "present") return false;
    if (s.checkIn && !s.checkOut) return true;
    if (s.breakStart && !s.breakEnd) return true;
    return false;
  });

  const hasAnyPresent = staffList.some((s) => s.status === "present");
  const isReadyToClose = incompleteStaff.length === 0 && hasAnyPresent;

  const handleFooterAction = async () => {
    if (isDailyScheduled) {
      try {
        setIsSubmitting(true);
        await dailyService.updateDailyStatus(dailyId, 'in_progress');
        setDailyInfo((prev) => (prev ? { ...prev, status: "in_progress" } : prev));
      } catch {
        Alert.alert("Erro", "Não foi possível iniciar a jornada.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (isDailyInProgress) {
      if (!isReadyToClose) {
        Alert.alert(
          "Pendências Encontradas",
          `${incompleteStaff.length} funcionário(s) com horários incompletos.`,
        );
        return;
      }
      navigation.navigate("DailySummary", {
        dailyId,
        staffData: staffList,
        dailyInfo: dailyInfo!,
      });
      return;
    }

    if (isDailyCompleted) {
      navigation.navigate("DailySummary", {
        dailyId,
        staffData: staffList,
        dailyInfo: dailyInfo!,
      });
    }
  };

  const getFooterButton = () => {
    if (isDailyScheduled) {
      return { label: "Iniciar Jornada", bg: COLORS.primary, textColor: COLORS.textDark, disabled: false };
    }
    if (isDailyInProgress) {
      if (!hasAnyPresent) {
        return { label: "Confirme presenças para finalizar", bg: COLORS.background, textColor: COLORS.textMuted, disabled: true };
      }
      if (!isReadyToClose) {
        return { label: `Faltam ${incompleteStaff.length} marcações`, bg: COLORS.background, textColor: COLORS.textMuted, disabled: true };
      }

      return { label: "Finalizar Jornada", bg: "#1A3A1A", textColor: COLORS.success, disabled: false };
    }
    return { label: "Ver Resumo", bg: COLORS.border, textColor: COLORS.text, disabled: false };
  };

  const footerBtn = getFooterButton();

  // ─── Loading / not found ───

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!dailyInfo) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Jornada não encontrada</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Controle de Ponto</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryMainRow}>
          <View style={styles.dateBadge}>
            <Ionicons name="calendar" size={18} color={COLORS.primary} />
            <Text style={styles.summaryDateText}>{dailyInfo.dayName} - {dailyInfo.dateLabel}</Text>
          </View>
          <View style={styles.timeBadge}>
            <Ionicons name="time-outline" size={14} color={COLORS.text} />
            <Text style={styles.summaryTimeText}>{dailyInfo.timeRange}</Text>
          </View>
        </View>
        <Text style={styles.summaryDescText}>{`"${dailyInfo.description}"`}</Text>
      </View>

      <StaffListControl
        dailyId={dailyId}
        staffList={staffList}
        isDailyInProgress={isDailyInProgress}
        requiredStaffCount={dailyInfo.requiredStaffCount}
        onStaffListChange={setStaffList}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButton, { backgroundColor: footerBtn.bg }, footerBtn.disabled && styles.footerButtonDisabled]}
          onPress={handleFooterAction}
          disabled={footerBtn.disabled || isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={COLORS.textDark} />
          ) : (
            <Text style={[styles.footerButtonText, { color: footerBtn.textColor }]}>{footerBtn.label}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (COLORS: any) =>  StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: COLORS.textMuted, fontSize: 16 },
  navHeader: { height: 56, backgroundColor: COLORS.surface, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backButton: { padding: 4 },
  navTitle: { color: COLORS.text, fontSize: 16, fontWeight: "bold" },
  headerSpacer: { width: 32 },
  summaryCard: { backgroundColor: COLORS.surface, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  summaryMainRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  dateBadge: { flexDirection: "row", alignItems: "center", gap: 8 },
  summaryDateText: { color: COLORS.text, fontSize: 12, fontWeight: "700", textTransform: 'uppercase' },
  timeBadge: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.border, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 },
  summaryTimeText: { color: COLORS.text, fontSize: 12, fontWeight: "600" },
  summaryDescText: { color: COLORS.textMuted, fontSize: 13, fontStyle: "italic" },
  footer: { backgroundColor: COLORS.surface, paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerButton: { height: 48, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  footerButtonDisabled: { opacity: 0.5 },
  footerButtonText: { fontSize: 14, fontWeight: "700" },
});