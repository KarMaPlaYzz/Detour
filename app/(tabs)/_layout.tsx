import { Tabs, useRouter, useSegments } from 'expo-router';

import { theme } from '@/styles/theme';

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();
  const activeRoute = segments[segments.length - 1];

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
        name="index"
        options={{
          title: 'Explore',
        }}
      />
      <Tabs.Screen
        name="my-detours"
        options={{
          title: 'My Detours',
        }}
      />
    </Tabs>
  );
}
