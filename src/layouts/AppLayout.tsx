// src/layouts/AppLayout.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/shared/context/ThemeContext';

import DailyListScreen from '../features/daily/screens/DailysListScreen'; 
import StaffListScreen from '../features/staff/screens/StaffListScreen';
import ReportsScreen from '../features/reports/screens/ReportsScreen';
import SettingsScreen from '../features/settings/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function CustomHeader({ title }: { title: string }) {
  const { t } = useTranslation();
  const { theme } = useTheme(); 

  const getHeaderTitle = (routeName: string) => {
    if (routeName === 'Daily') return t('tabs.daily');
    if (routeName === 'Staff') return t('tabs.staff');
    if (routeName === 'Reports') return t('tabs.reports');
    if (routeName === 'Settings') return t('tabs.settings');
    return routeName;
  };

  return (
    <View style={[styles.headerContainer, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
      <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{getHeaderTitle(title)}</Text>
      <View style={[styles.logoBadge, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.logoText, { color: theme.colors.textDark }]}>Nexo</Text>
      </View>
    </View>
  );
}

export default function AppLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { theme } = useTheme(); // 🌟 Acceso a theme.colors

  return (
    <SafeAreaView style={[styles.safeAreaMain, { backgroundColor: theme.colors.surface }]} edges={['top']}>
      <Tab.Navigator
        id="Tab"
        screenOptions={({ route }) => ({
          header: () => <CustomHeader title={route.name} />,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarStyle: [
            styles.tabBar,
            {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.border,
              height: 60 + (insets.bottom > 0 ? insets.bottom - 6 : 10),
              paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
            }
          ],
          tabBarIcon: ({ focused, color }) => {
            let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'calendar-outline';

            if (route.name === 'Daily') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Staff') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Reports') {
              iconName = focused ? 'document-text' : 'document-text-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen 
          name="Daily" 
          component={DailyListScreen} 
          options={{ tabBarLabel: t('tabs.daily') }} 
        />
        <Tab.Screen 
          name="Staff" 
          component={StaffListScreen} 
          options={{ tabBarLabel: t('tabs.staff') }} 
        />
        <Tab.Screen 
          name="Reports" 
          component={ReportsScreen} 
          options={{ tabBarLabel: t('tabs.reports') }} 
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ tabBarLabel: t('tabs.settings') }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

// Estilos estructurales estáticos (los colores dinámicos se pasan inline arriba)
const styles = StyleSheet.create({
  safeAreaMain: {
    flex: 1,
  },
  headerContainer: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoBadge: {
    width: 60,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tabBar: {
    borderTopWidth: 1,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});