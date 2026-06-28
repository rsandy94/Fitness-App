import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider, Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-native-reanimated';
import '../global.css';
import { isAuthenticated } from '@/lib/storage';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
  },
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      checkAuth();
    }
  }, [loaded]);

  async function checkAuth() {
    const auth = await isAuthenticated();
    setIsAuth(auth);
  }

  if (!loaded || isAuth === null) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={DarkTheme}>
        <Stack>
          <Stack.Screen name="(auth)/pin" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="workout/[templateId]" options={{ headerShown: true, title: 'Workout' }} />
          <Stack.Screen name="exercise/[exerciseId]" options={{ headerShown: true, title: 'Exercise' }} />
          <Stack.Screen name="session/[sessionId]" options={{ headerShown: true, title: 'Session' }} />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
