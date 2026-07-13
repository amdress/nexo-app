// src/features/daily/components/lists/StaffListControl.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";
import { StaffAttendance } from "../../interfacesUI/daily";
import BaseDatePicker from "@/shared/components/pickers/BaseDatePicker";
import FormTextInput from "@/shared/components/form/FormTextInput";
import ToastNotification from "@/shared/components/alerts/ToastNotification";
import FAB from "@/shared/components/btn/FAB";
import StaffOptionsModal from "../modals/StaffOptionsModal";
import EmergencyStaffModal from "../modals/EmergencyStaffModal";
import { dailyService } from "../../services/dailyService";
import { toTimeString } from "@/shared/utils/dateFormatter";

export type AttendancePointType =
  | "check_in"
  | "break_start"
  | "break_end"
  | "check_out";

const FIELD_MAP: Record<AttendancePointType, 'checkIn' | 'breakStart' | 'breakEnd' | 'checkOut'> = {
  check_in: "checkIn",
  break_start: "breakStart",
  break_end: "breakEnd",
  check_out: "checkOut",
};

const FIELD_LABEL: Record<AttendancePointType, string> = {
  check_in: "Entrada",
  break_start: "Início do intervalo",
  break_end: "Retorno do intervalo",
  check_out: "Saída",
};

interface StaffListControlProps {
  dailyId: string;
  staffList: StaffAttendance[];
  isDailyInProgress: boolean;
  requiredStaffCount: number;
  onStaffListChange?: (updated: StaffAttendance[]) => void;
}

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
}

interface AvailableStaffItem {
  id: string;
  name: string;
  role: string;
  status: string;
  avatar_uri?: string | null;
}

function timeStringToDate(time: string | null): Date | null {
  if (!time || !time.includes(":")) return null;
  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date;
}

// Después — función pura, recibe COLORS como argumento:
function getStatusBadge(status: StaffAttendance["status"], COLORS: any) {
  switch (status) {
    case "confirmed":
      return { label: "Confirmado", color: COLORS.textMuted, bg: COLORS.border };
    case "present":
      return { label: "Presente", color: COLORS.success, bg: "#1A2A1A" };
    case "no_show":
      return { label: "Não veio", color: "#FF8888", bg: "#3A1A1A" };
    case "dropped":
      return { label: "Desistiu", color: "#E6AD12", bg: "#2A2415" };
  }
}

export default function StaffListControl({
  dailyId,
  staffList,
  isDailyInProgress,
  requiredStaffCount,
  onStaffListChange,
}: StaffListControlProps) {
  const [localStaffList, setLocalStaffList] = useState<StaffAttendance[]>(staffList);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [showStaffOptionsModal, setShowStaffOptionsModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffAttendance | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [availableStaff, setAvailableStaff] = useState<AvailableStaffItem[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [styles, COLORS] = useThemedStyles(getStyles);

  useEffect(() => {
    setLocalStaffList(staffList);
  }, [staffList]);

  const filteredStaffList = useMemo(() => {
    if (!searchQuery.trim()) return localStaffList;
    const query = searchQuery.trim().toLowerCase();
    return localStaffList.filter((s) => s.name.toLowerCase().includes(query));
  }, [localStaffList, searchQuery]);

  const isCardInteractable = (staff: StaffAttendance) =>
    isDailyInProgress && staff.status === "present";

  // 🔧 FIX: recibe la lista ya calculada, no un updater. Evita setState-durante-render del padre.
  const updateList = useCallback(
    (newList: StaffAttendance[]) => {
      setLocalStaffList(newList);
      onStaffListChange?.(newList);
    },
    [onStaffListChange],
  );

  // ─── Control de Horarios Unificado com o novo Service ───
  const handleAttendanceChange = useCallback(
    async (staffId: string, type: AttendancePointType, date: Date) => {
      const timeString = toTimeString(date);
      const field = FIELD_MAP[type];
      const uiStaff = localStaffList.find((s) => s.id === staffId);
      if (!uiStaff) return;

      try {
        await dailyService.updateStaffStatus(dailyId, staffId, type, timeString);

        const updated = localStaffList.map((s) => {
          if (s.id !== staffId) return s;
          return {
            ...s,
            [field]: timeString,
            status: type === "check_in" ? "present" : s.status,
          };
        });
        updateList(updated);

        setToast({
          message: `${FIELD_LABEL[type]} registrada`,
          type: "success",
        });
      } catch (error: any) {
        setToast({ message: error.message, type: "error" });
      }
    },
    [dailyId, localStaffList, updateList],
  );

  // ─── Control de Estados Generales Unificado ───
  const handleStaffStatusChange = async (
    newStatus: "present" | "no_show" | "dropped",
  ) => {
    if (!selectedStaff) return;
    setShowStaffOptionsModal(false);
    const staffId = selectedStaff.id;

    try {
      await dailyService.updateStaffStatus(dailyId, staffId, "status", newStatus);

      const now = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const updated = localStaffList.map((s) => {
        if (s.id !== staffId) return s;
        return {
          ...s,
          status: newStatus as any,
          checkIn: newStatus === "present" ? now : s.checkIn,
        };
      });
      updateList(updated);

      setToast({ message: `Status atualizado com sucesso`, type: "success" });
    } catch (error: any) {
      setToast({ message: error.message, type: "error" });
    }
    setSelectedStaff(null);
  };

  const handleRemoveStaff = async () => {
    if (!selectedStaff) return;
    setShowStaffOptionsModal(false);
    const staffId = selectedStaff.id;
    const staffName = selectedStaff.name;
    setSelectedStaff(null);

    try {
      await dailyService.removeStaffFromDaily(dailyId, staffId);
      updateList(localStaffList.filter((s) => s.id !== staffId));
      setToast({ message: `${staffName} removido da jornada.`, type: "info" });
    } catch (error) {
      console.error("[STAFF_LIST_CONTROL] Falha ao remover staff:", error);
      setToast({
        message: `Não foi possível remover ${staffName}.`,
        type: "error",
      });
    }
  };

  const handleLongPressStaff = (staff: StaffAttendance) => {
    if (!isDailyInProgress) return;
    setSelectedStaff(staff);
    setShowStaffOptionsModal(true);
  };

  const getStaffOptions = (staff: StaffAttendance) => {
    switch (staff.status) {
      case "confirmed":
        return [
          {
            label: "Confirmar presença",
            icon: "checkmark-circle-outline" as const,
            color: COLORS.success,
            action: () => handleStaffStatusChange("present"),
          },
          {
            label: "Não se apresentou",
            icon: "close-circle-outline" as const,
            color: "#FF8888",
            action: () => handleStaffStatusChange("no_show"),
          },
          {
            label: "Remover da jornada",
            icon: "trash-outline" as const,
            color: COLORS.textMuted,
            action: handleRemoveStaff,
          },
        ];
      case "present":
        return [
          {
            label: "Desistiu / foi embora",
            icon: "exit-outline" as const,
            color: "#E6AD12",
            action: () => handleStaffStatusChange("dropped"),
          },
          {
            label: "Remover da jornada",
            icon: "trash-outline" as const,
            color: COLORS.textMuted,
            action: handleRemoveStaff,
          },
        ];
      default:
        return [
          {
            label: "Remover da jornada",
            icon: "trash-outline" as const,
            color: COLORS.textMuted,
            action: handleRemoveStaff,
          },
        ];
    }
  };

  const handleOpenEmergencyModal = async () => {
    setShowEmergencyModal(true);
    setLoadingAvailable(true);
    try {
      const data = await dailyService.getAvailableStaff(dailyId);
      setAvailableStaff(data);
    } catch (error) {
      console.error(
        "[STAFF_LIST_CONTROL] Falha ao buscar staff disponível:",
        error,
      );
      setToast({
        message: "Não foi possível carregar staff disponível.",
        type: "error",
      });
    } finally {
      setLoadingAvailable(false);
    }
  };

  const handleAddEmergencyStaff = async (staffId: string) => {
    const currentCount = localStaffList.length;

    const doAdd = async () => {
      const staffData = availableStaff.find((s) => s.id === staffId);
      try {
        await dailyService.addEmergencyStaff(dailyId, staffId);
        setShowEmergencyModal(false);

        if (staffData) {
          const newEntry: StaffAttendance = {
            id: staffData.id,
            name: staffData.name,
            role: staffData.role,
            avatar: staffData.avatar_uri || null,
            status: "confirmed",
            checkIn: null,
            breakStart: null,
            breakEnd: null,
            checkOut: null,
          };
          updateList([...localStaffList, newEntry]);
        }

        setToast({
          message: `${staffData?.name ?? "Funcionário"} adicionado à jornada.`,
          type: "success",
        });
      } catch (error) {
        console.error(
          "[STAFF_LIST_CONTROL] Falha ao adicionar staff de emergência:",
          error,
        );
        setToast({
          message: "Não foi possível adicionar o funcionário.",
          type: "error",
        });
      }
    };

    if (currentCount >= requiredStaffCount) {
      Alert.alert(
        "Limite atingido",
        `Já existem ${currentCount} funcionários, o limite é ${requiredStaffCount}. Deseja adicionar mesmo assim?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Adicionar", onPress: doAdd },
        ],
      );
      return;
    }
    await doAdd();
  };

  const renderStaffControlCard = ({ item }: { item: StaffAttendance }) => {
    const badge = getStatusBadge(item.status, COLORS);
    const isFrozen = item.status === "no_show" || item.status === "dropped";
    const interactable = isCardInteractable(item);

    return (
      <TouchableOpacity
        style={[styles.staffCard, isFrozen && styles.staffCardFrozen]}
        onLongPress={() => handleLongPressStaff(item)}
        activeOpacity={0.8}
      >
        <View style={styles.staffMetaRow}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.staffName}>{item.name}</Text>
            <Text style={styles.staffRole}>{item.role}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.statusBadgeText, { color: badge.color }]}>
              {badge.label}
            </Text>
          </View>
        </View>

        {(item.status === "present" || item.checkIn) && (
          <View style={[styles.timelineRow, !interactable && { opacity: 0.5 }]}>
            <BaseDatePicker
              variant="compact"
              value={timeStringToDate(item.checkIn)}
              onChange={(date) =>
                handleAttendanceChange(item.id, "check_in", date)
              }
              mode="time"
              label="Entrada"
              icon="log-in-outline"
              disabled={!interactable}
            />
            <BaseDatePicker
              variant="compact"
              value={timeStringToDate(item.breakStart)}
              onChange={(date) =>
                handleAttendanceChange(item.id, "break_start", date)
              }
              mode="time"
              label="Intervalo"
              icon="cafe-outline"
              disabled={!interactable || !item.checkIn}
            />
            <BaseDatePicker
              variant="compact"
              value={timeStringToDate(item.breakEnd)}
              onChange={(date) =>
                handleAttendanceChange(item.id, "break_end", date)
              }
              mode="time"
              label="Retorno"
              icon="play-outline"
              disabled={!interactable || !item.breakStart}
            />
            <BaseDatePicker
              variant="compact"
              value={timeStringToDate(item.checkOut)}
              onChange={(date) =>
                handleAttendanceChange(item.id, "check_out", date)
              }
              mode="time"
              label="Saída"
              icon="log-out-outline"
              disabled={
                !interactable ||
                !item.checkIn ||
                (!!item.breakStart && !item.breakEnd)
              }
            />
          </View>
        )}

        {isDailyInProgress && item.status === "confirmed" && (
          <Text style={styles.hintText}>
            Pressione e segure para registrar presença
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.searchWrapper}>
        <FormTextInput
          label=""
          placeholder="Buscar funcionário..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredStaffList}
        keyExtractor={(item) => item.id}
        renderItem={renderStaffControlCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum funcionário encontrado</Text>
        }
      />

      {isDailyInProgress && (
        <FAB icon="person-add-outline" onPress={handleOpenEmergencyModal} />
      )}

      <StaffOptionsModal
        visible={showStaffOptionsModal}
        onClose={() => setShowStaffOptionsModal(false)}
        staff={selectedStaff}
        options={selectedStaff ? getStaffOptions(selectedStaff) : []}
      />

      <EmergencyStaffModal
        visible={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        loading={loadingAvailable}
        availableStaff={availableStaff}
        onSelectStaff={handleAddEmergencyStaff}
      />

      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </View>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  searchWrapper: { paddingHorizontal: 16, paddingTop: 12 },
  listContent: { padding: 16, paddingBottom: 100 },
  staffCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 14,
  },
  staffCardFrozen: { opacity: 0.6, borderColor: COLORS.border },
  staffMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  avatarText: { color: COLORS.text, fontSize: 14, fontWeight: "bold" },
  staffName: { color: COLORS.text, fontSize: 14, fontWeight: "600" },
  staffRole: { color: COLORS.textMuted, fontSize: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusBadgeText: { fontSize: 11, fontWeight: "700" },
  hintText: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  timelineRow: { flexDirection: "row", gap: 6 },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
});