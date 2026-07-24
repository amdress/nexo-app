// src/navigation/AppNavigation.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Layouts
import AppLayout from "../layouts/AppLayout";
// Telas
import DailyCreateScreen from "../features/daily/screens/DailyCreateScreen";
import DailyControlScreen from "../features/daily/screens/DailyControlScreen";
import DailySummaryScreen from "../features/daily/screens/DailySummaryScreen";
import StaffCreateScreen from "../features/staff/screens/StaffCreateScreen";
import StaffProfileScreen from "../features/staff/screens/StaffProfileScreen";
import GeneralPreferencesScreen from "../features/settings/screens/GeneralPreferencesScreen";
import CompanyProfileScreen from "../features/settings/screens/CompanyProfileScreen";
import ClientsListScreen from "../features/clients/screens/ClientsListScreen";
import { useThemedStyles } from "@/shared/hooks/useThemedStyles";
import ClientCreateScreen from "@/features/clients/screens/ClientCreateScreen";
import DailyDispatchScreen from "@/features/daily/screens/DailyDispatchScreen";
import ClientProfileScreen from "@/features/clients/screens/ClientProfileScreen"

// Se registran todas las rutas de la app en un solo lugar, para tener un control centralizado y evitar duplicaciones.
export type RootStackParamList = {
  MainTabs: undefined;
  // Daily
  DailyControl: { dailyId: string };
  DailyCreate: undefined;
  DailySummary: undefined;
  DailyDispatchScreen: { dailyId: string };

  //Staff
  StaffCreate: undefined;
  StaffProfile: { staffId: string };

  //Settings
  GeneralPreferences: undefined;

  //company
  CompanyProfile: undefined;

  //Clients
  ClientCreate: undefined;
  ClientsList: undefined;
  ClientProfile: { clientId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigation() {
    const [styles, COLORS] = useThemedStyles(getStyles);
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: "slide_from_right",
      }}
    >
      {/* Contêiner das abas inferiores fixas */}
      <Stack.Screen name="MainTabs" component={AppLayout} />

      {/* Telas focadas (Stack superior) */}
      <Stack.Screen name="DailyControl" component={DailyControlScreen} />
      <Stack.Screen name="DailyCreate" component={DailyCreateScreen} />
      <Stack.Screen name="DailySummary" component={DailySummaryScreen} />
      <Stack.Screen name="StaffCreate" component={StaffCreateScreen} />
      <Stack.Screen name="StaffProfile" component={StaffProfileScreen} />
      <Stack.Screen name="GeneralPreferences" component={GeneralPreferencesScreen} />
      <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen} />
      <Stack.Screen name="ClientsList" component={ClientsListScreen} />
      <Stack.Screen name="ClientCreate" component={ClientCreateScreen} />
      <Stack.Screen name="ClientProfile" component={ClientProfileScreen} />

    <Stack.Screen 
  name="DailyDispatchScreen" 
  component={(props: any) => (
    <DailyDispatchScreen 
      {...props} 
      state={{} as any} 
      updateState={() => {}} 
      onValidate={async () => true} 
    />
  )} 
/>
    </Stack.Navigator>
  );
}

const getStyles = (COLORS: any) => {}