// src/features/staff/screens/StaffProfileScreen.tsx
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert, StatusBar, Image, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PersonalDataTab } from "../components/tabs/PersonalDataTab";
import { PerformanceTab } from "../components/tabs/PerformanceTab";
import { HistoryTab } from "../components/tabs/HistoryTab";
import { staffService } from "../services/staffService";
import { StaffHeaderData } from "../interacesUI/staffProfile";
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";

interface StaffProfileScreenProps {
  route: {
    params: {
      staffId: string;
    };
  };
}


export default function StaffProfileScreen({ route }: StaffProfileScreenProps) {
  const { staffId } = route.params;
  const [styles, COLORS] = useThemedStyles(getStyles);

  const [activeTab, setActiveTab] = useState<"data" | "performance" | "history">("data");
  const [staff, setStaff] = useState<StaffHeaderData | null>(null);
  

  useEffect(() => {
    const loadStaffHeader = async () => {
      try {
        const data = await staffService.getStaffById(staffId);
        setStaff({
          name: data.name,
          role: data.role,
          avatarUrl: data.avatarUri,
          phone: data.phone ?? null,
          email: data.email ?? null,
        });
      } catch (error) {
        Alert.alert("Erro", "Não foi possível carregar o cabeçalho do funcionário.");
      }
    };
    loadStaffHeader();
  }, [staffId]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.surface || "#1E1E1E"} />

      <View style={styles.headerFixed}>
        <View style={styles.avatarContainer}>
          {staff?.avatarUrl ? (
            <Image source={{ uri: staff.avatarUrl }} style={styles.avatarImage} resizeMode="cover" />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{staff ? staff.name.charAt(0).toUpperCase() : "?"}</Text>
            </View>
          )}
        </View>

        <Text style={styles.staffName}>{staff ? staff.name : "Carregando..."}</Text>
        <Text style={styles.staffRole}>{staff ? staff.role : "..."}</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "data" && styles.activeTabButton]}
          onPress={() => setActiveTab("data")}
        >
          <Text style={[styles.tabLabel, activeTab === "data" && styles.activeTabLabel]}>Dados</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "performance" && styles.activeTabButton]}
          onPress={() => setActiveTab("performance")}
        >
          <Text style={[styles.tabLabel, activeTab === "performance" && styles.activeTabLabel]}>
            Performance
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "history" && styles.activeTabButton]}
          onPress={() => setActiveTab("history")}
        >
          <Text style={[styles.tabLabel, activeTab === "history" && styles.activeTabLabel]}>
            Histórico
          </Text>
        </TouchableOpacity>
      </View>

      {/* key={activeTab} fuerza remount al cambiar de tab: cada tab hace su propio
          fetch al montarse, así solo se pide la data cuando el usuario la abre */}
      <View style={styles.contentContainer} key={activeTab}>
        {activeTab === "data" && <PersonalDataTab staffId={staffId} />}
        {activeTab === "performance" && <PerformanceTab staffId={staffId} />}
        {activeTab === "history" && (
          <HistoryTab
            staffId={staffId}
            staffName={staff?.name}
            staffPhone={staff?.phone ?? undefined}
            staffEmail={staff?.email ?? undefined}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || "#121212",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0,
  },
  headerFixed: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 24,
    backgroundColor: COLORS.surface || "#1E1E1E",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "rgba(76, 175, 80, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 36, fontWeight: "bold", color: "#FFFFFF" },
  staffName: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text || "#FFFFFF",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  staffRole: {
    fontSize: 14,
    color: COLORS.textMuted || "#8E8E93",
    fontWeight: "600",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.03)",
    marginHorizontal: 16,
    marginTop: 5,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 10 },
  activeTabButton: {
    backgroundColor: COLORS.surface || "#1E1E1E",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tabLabel: { fontSize: 13, fontWeight: "600", color: COLORS.textMuted || "#8E8E93" },
  activeTabLabel: { color: "#4CAF50", fontWeight: "700" },
  contentContainer: { flex: 1, paddingHorizontal: 16, marginTop: 20 },
});