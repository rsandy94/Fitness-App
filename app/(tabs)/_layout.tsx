import { Tabs, Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isAuthenticated } from '@/lib/storage';

export default function TabLayout() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    checkAuth();
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
      screenOptions={{
        tabBarActiveTintColor: '#58a6ff',
        tabBarInactiveTintColor: '#8b949e',
        tabBarStyle: {
          backgroundColor: '#161b22',
          borderTopColor: '#30363d',
          borderTopWidth: 1,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
          height: 60 + insets.bottom,
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
