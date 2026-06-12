// src/navigation/index.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';

import { useAppStore } from '../store';
import { COLORS, TYPOGRAPHY } from '../constants';

import { HomeScreen } from '../screens/HomeScreen';
import { QuizSetupScreen } from '../screens/QuizSetupScreen';
import { QuizActiveScreen } from '../screens/QuizActiveScreen';
import { QuizResultScreen } from '../screens/QuizResultScreen';
import { NotesScreen, SpotNoteEditInner } from '../screens/NotesScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { AdminDashboardScreen, AdminQuestionEditScreen } from '../screens/AdminScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabIcon = ({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) => (
  <View style={ti.container}>
    <Text style={ti.emoji}>{emoji}</Text>
    <Text style={[ti.label, focused && ti.labelActive]}>{label}</Text>
  </View>
);

const ti = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 20 },
  label: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  labelActive: { color: COLORS.primary, fontWeight: '700' },
});

const MainTabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.cardBorder,
        height: 70,
        paddingBottom: 12,
      },
      tabBarShowLabel: false,
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Ana Sayfa" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="QuizTab"
      component={QuizSetupScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon emoji="📝" label="Quiz" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Notes"
      component={NotesScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon emoji="📌" label="Notlar" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Stats"
      component={StatsScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon emoji="📊" label="İstatistik" focused={focused} />,
      }}
    />
  </Tab.Navigator>
);

export const AppNavigator: React.FC = () => {
  const { isOnboarded } = useAppStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isOnboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="QuizSetup" component={QuizSetupScreen} />
            <Stack.Screen
              name="QuizActive"
              component={QuizActiveScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="QuizResult" component={QuizResultScreen} />
            <Stack.Screen name="SpotNoteEdit" component={SpotNoteEditInner} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="AdminQuestionEdit" component={AdminQuestionEditScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
