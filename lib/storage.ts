import AsyncStorage from '@react-native-async-storage/async-storage';

const PIN_KEY = 'fitness_app_pin';
const AUTH_KEY = 'fitness_app_authenticated';

export async function getStoredPin(): Promise<string | null> {
  return await AsyncStorage.getItem(PIN_KEY);
}

export async function setPin(pin: string): Promise<void> {
  await AsyncStorage.setItem(PIN_KEY, pin);
}

export async function isAuthenticated(): Promise<boolean> {
  return (await AsyncStorage.getItem(AUTH_KEY)) === 'true';
}

export async function setAuthenticated(value: boolean): Promise<void> {
  await AsyncStorage.setItem(AUTH_KEY, value ? 'true' : 'false');
}

export async function clearAuth(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_KEY);
}
