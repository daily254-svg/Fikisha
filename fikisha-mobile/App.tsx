import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigation } from './src/navigation/RootNavigator';
import { useAuth } from './src/hooks/useAuth';
import { useAuthStore } from './src/store/auth.store';
import { useWebSocket } from './src/hooks/useWebSocket';
import { SCHOOL_ID } from './src/constants/api';
import type { Screen } from './src/navigation/types';
import type { UserRole } from './src/types';

function roleToApp(role?: UserRole): 'parent' | 'driver' | null {
  if (role === 'PARENT') return 'parent';
  if (role === 'DRIVER') return 'driver';
  return null;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [userPhone, setUserPhone] = useState('');
  const { login, logout, isFirstLogin, isAuthenticated, isLoading, user } = useAuth();

  useWebSocket(isAuthenticated);

  const role = roleToApp(user?.role) ?? 'parent';

  // Resume an existing session once it's finished loading from storage,
  // instead of always bouncing back to the splash/login screens.
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    if (isFirstLogin) {
      setScreen('change-password');
    } else {
      const appRole = roleToApp(user?.role);
      setScreen(appRole === 'driver' ? 'driver-home' : 'home');
    }
  }, [isLoading, isAuthenticated]);

  const navigate = (s: string) => setScreen(s as Screen);

  const handleLogin = async (phone: string, password: string) => {
    setUserPhone(phone);
    await login({ phone, password, schoolId: SCHOOL_ID });

    const state = useAuthStore.getState();
    const appRole = roleToApp(state.user?.role);

    if (!appRole) {
      await logout();
      throw new Error(
        'This account type is not supported in the app. Please contact your school.',
      );
    }

    if (state.isFirstLogin) {
      setScreen('change-password');
    } else {
      setScreen(appRole === 'driver' ? 'driver-home' : 'home');
    }
  };

  const handlePasswordChanged = () => {
    setScreen(role === 'driver' ? 'driver-home' : 'home');
  };

  const handleLogout = async () => {
    await logout();
    setScreen('login');
  };

  return (
    <SafeAreaProvider>
      <RootNavigation
        screen={screen}
        role={role}
        userPhone={userPhone}
        onNavigate={navigate}
        onLogin={handleLogin}
        onPasswordChanged={handlePasswordChanged}
        onLogout={handleLogout}
      />
    </SafeAreaProvider>
  );
}
