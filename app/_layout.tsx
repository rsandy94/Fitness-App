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

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const head = document.head;

    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport && !viewport.getAttribute('content')?.includes('viewport-fit=cover')) {
      viewport.setAttribute(
        'content',
        (viewport.getAttribute('content') || '') + ', viewport-fit=cover'
      );
    }

    const manifest = document.createElement('link');
    manifest.rel = 'manifest';
    manifest.href = '/manifest.json';
    head.appendChild(manifest);

    const appleTouch = document.createElement('link');
    appleTouch.rel = 'apple-touch-icon';
    appleTouch.href = '/icons/icon-180.png';
    head.appendChild(appleTouch);

    const metaTheme = document.createElement('meta');
    metaTheme.name = 'theme-color';
    metaTheme.content = '#0d1117';
    head.appendChild(metaTheme);

    const metaApple = document.createElement('meta');
    metaApple.name = 'apple-mobile-web-app-capable';
    metaApple.content = 'yes';
    head.appendChild(metaApple);

    const metaAppleStatus = document.createElement('meta');
    metaAppleStatus.name = 'apple-mobile-web-app-status-bar-style';
    metaAppleStatus.content = 'black-translucent';
    head.appendChild(metaAppleStatus);

    const metaAppleTitle = document.createElement('meta');
    metaAppleTitle.name = 'apple-mobile-web-app-title';
    metaAppleTitle.content = 'Fitness';
    head.appendChild(metaAppleTitle);

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.warn('SW registration failed:', err);
        });
      });
    }
  }, []);

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
