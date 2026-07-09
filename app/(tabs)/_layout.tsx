import { Tabs, Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isAuthenticated } from '@/lib/storage';

export default function TabLayout() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const insets = useSafeAreaInsets();
  const [rerenderKey, setRerenderKey] = useState(0);

  // On web PWA, useSafeAreaInsets may return 0, so use a fallback
  const safeAreaBottom = insets.bottom || (Platform.OS === 'web' ? 20 : 0);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const t = setTimeout(() => setRerenderKey((k) => k + 1), 50);
    return () => clearTimeout(t);
  }, []);

  async function checkAuth() {
    const auth = await isAuthenticated();
    setIsAuth(auth);
  }

  if (isAuth === null) {
    return null;
  }

  if (!isAuth) {
    return <Redirect href="/(auth)/pin" />;
  }

  return (
    <Tabs
      key={rerenderKey}
      screenOptions={{
        tabBarActiveTintColor: '#58a6ff',
        tabBarInactiveTintColor: '#8b949e',
        tabBarStyle: {
          backgroundColor: '#161b22',
          borderTopColor: '#30363d',
          borderTopWidth: 1,
          paddingBottom: 8 + safeAreaBottom,
          paddingTop: 8,
          height: 60 + safeAreaBottom,
        },
        headerStyle: {
          backgroundColor: '#0d1117',
        },
        headerTintColor: '#e6edf3',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>🏠</span>,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarLabel: 'Schedule',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>📅</span>,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}></span>,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Exercise Library',
          tabBarLabel: 'Library',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>📚</span>,
        }}
      />
    </Tabs>
  );
}
