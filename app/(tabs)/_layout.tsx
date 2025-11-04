import { Tabs } from 'expo-router';

import { theme } from '@/styles/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        headerShown: false,
        tabBarButton: () => null,
        tabBarStyle: {
          display: 'none',
        },
        tabBarLabelStyle: {
          display: 'none',
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
        }}
      />
      <Tabs.Screen
        name="my-detours"
        options={{
          title: 'My Detours',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}
