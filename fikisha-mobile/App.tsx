import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigation } from './src/navigation/RootNavigator';
import { useAuth } from './src/hooks/useAuth';
import { useWebSocket } from './src/hooks/useWebSocket';
import { SCHOOL_ID } from './src/constants/api';

type Screen =
  | 'splash'
  | 'login'
  | 'forgot-password'
  | 'change-password'
  | 'home'
  | 'tracking'
  | 'notifications'
  | 'history'
  | 'profile'
  | 'driver-home'
  | 'driver-route'
  | 'driver-pickup'
  | 'driver-incident';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [role, setRole] = useState<'parent' | 'driver'>('parent');
  const [userPhone, setUserPhone] = useState('');

  useWebSocket();
  const { login, isFirstLogin } = useAuth();

  const navigate = (s: string) => setScreen(s as Screen);

  const handleLogin = async (r: 'parent' | 'driver', phone: string, password: string) => {
    setRole(r);
    setUserPhone(phone);

    const isFirst = password === phone;
    try {
      await login({ phone, password, schoolId: SCHOOL_ID });
    } catch (err) {
      console.error('Login failed', err);
    }

    if (isFirst) {
      setScreen('change-password');
    } else {
      setScreen(r === 'parent' ? 'home' : 'driver-home');
    }
  };

  const handlePasswordChanged = () => {
    setScreen(role === 'parent' ? 'home' : 'driver-home');
  };

  const handleResetSent = () => {
    setScreen('login');
  };

  const handleLogout = () => setScreen('login');

  return (
    <SafeAreaProvider>
      <RootNavigation
        screen={screen}
        role={role}
        userPhone={userPhone}
        onNavigate={navigate}
        onLogin={handleLogin}
        onPasswordChanged={handlePasswordChanged}
        onResetSent={handleResetSent}
        onLogout={handleLogout}
      />
    </SafeAreaProvider>
  );
}