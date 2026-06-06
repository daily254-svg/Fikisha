import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigation } from './src/navigation/RootNavigator';

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

  const navigate = (s: string) => setScreen(s as Screen);

  const handleLogin = (r: 'parent' | 'driver', isFirstLogin: boolean, phone: string) => {
    setRole(r);
    setUserPhone(phone);

    if (isFirstLogin) {
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