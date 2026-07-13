// src/features/daily/screens/DailysListScreen.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { dailyService } from "../services/dailyService";
import { useFocusEffect } from "@react-navigation/native";
import { DailyItem } from "../interfacesUI/daily";
import DailyCard from "../components/cards/DailyCard";
import LoadingState from "../../../layouts/components/LoadingState";
import ToastNotification from "../../../shared/components/alerts/ToastNotification";
import FAB from "@/shared/components/btn/FAB";
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";

export default function DailyListScreen({ navigation }: any) {
  const [dailies, setDailies] = useState<DailyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [styles, COLORS] = useThemedStyles(getStyles);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function load() {
        try {
          setLoading(true);
          const data = await dailyService.getActiveDailys();
          if (isMounted) {
            setDailies(data || []);
            setToast({ message: `${data.length} Jornadas Carregadas`, type: "success" });
          }
        } catch (error) {
          console.error("Erro ao buscar as jornadas diárias ativas:", error);
          if (isMounted) {
            const message = error instanceof Error ? error.message : "Erro ao carregar jornadas";
            setToast({ message, type: "error" });
            setDailies([]);
          }
        } finally {
          if (isMounted) setLoading(false);
        }
      }

      load();
      return () => {
        isMounted = false;
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <StatusBar barStyle="light-content" />

      {loading ? (
        <LoadingState />
      ) : (
        <FlatList
          data={dailies}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DailyCard
              daily={item}
              onPress={() => navigation.navigate("DailyControl", { dailyId: item.id })}
            />
          )}
          contentContainerStyle={dailies.length === 0 ? styles.listContentEmpty : styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="folder-open-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>Nenhuma jornada ou daily ativa no momento.</Text>
            </View>
          }
        />
      )}

      <FAB icon="add" onPress={() => navigation.navigate("DailyCreate")} />
    </View>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: { padding: 20, paddingTop: 12, paddingBottom: 90 },
  listContentEmpty: { flexGrow: 1 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
  },
});