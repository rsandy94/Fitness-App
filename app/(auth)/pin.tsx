import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getStoredPin, setPin, setAuthenticated } from '@/lib/storage';

export default function PinScreen() {
  const router = useRouter();
  const [pin, setPinState] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [confirmPin, setConfirmPin] = useState('');
  const [storedPin, setStoredPinState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPin();
  }, []);

  async function loadPin() {
    const saved = await getStoredPin();
    setStoredPinState(saved);
    setIsSettingPin(!saved);
    setLoading(false);
  }

  function handleDigit(digit: string) {
    if (pin.length >= 4) return;
    
    const newPin = pin + digit;
    setPinState(newPin);

    if (newPin.length === 4) {
      setTimeout(() => processPin(newPin), 100);
    }
  }

  function handleDelete() {
    setPinState(pin.slice(0, -1));
  }

  async function processPin(enteredPin: string) {
    if (isSettingPin && !storedPin && !confirmPin) {
      // First entry when setting new PIN
      setConfirmPin(enteredPin);
      setPinState('');
      return;
    }

    if (isSettingPin && confirmPin) {
      // Confirming the PIN
      if (enteredPin === confirmPin) {
        await setPin(enteredPin);
        await setAuthenticated(true);
        router.replace('/(tabs)');
      } else {
        Alert.alert('PINs do not match', 'Please try again.');
        setConfirmPin('');
        setPinState('');
      }
      return;
    }

    // Verifying existing PIN
    if (enteredPin === storedPin) {
      await setAuthenticated(true);
      router.replace('/(tabs)');
    } else {
      Alert.alert('Incorrect PIN', 'Please try again.');
      setPinState('');
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  const title = isSettingPin && !confirmPin ? 'Create PIN' : confirmPin ? 'Confirm PIN' : 'Enter PIN';
  const subtitle = isSettingPin && !confirmPin
    ? 'Choose a 4-digit PIN'
    : confirmPin
    ? 'Re-enter your PIN'
    : 'Enter your 4-digit PIN';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={StyleSheet.flatten([styles.dot, pin.length > i && styles.dotFilled])}
          />
        ))}
      </View>

      <View style={styles.keypad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((key, i) => (
          <Pressable
            key={i}
            style={StyleSheet.flatten([styles.key, key === null && styles.keyEmpty])}
            onPress={() => {
              if (key === 'del') {
                handleDelete();
              } else if (key !== null) {
                handleDigit(key.toString());
              }
            }}
          >
            <Text style={styles.keyText}>
              {key === 'del' ? '⌫' : key === null ? '' : key}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e6edf3',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8b949e',
    marginBottom: 40,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#58a6ff',
  },
  dotFilled: {
    backgroundColor: '#58a6ff',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 300,
    gap: 20,
  },
  key: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#161b22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyEmpty: {
    backgroundColor: 'transparent',
  },
  keyText: {
    fontSize: 24,
    color: '#e6edf3',
    fontWeight: '600',
  },
});
