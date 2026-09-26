import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AuthNavigation } from '../navigation/AuthNavigator';
import { ParentNavigation } from '../navigation/ParentNavigator';
import { DriverNavigation } from '../navigation/DriverNavigator';
import { BottomNav } from './BottomNav';
import type { Screen } from './types';

const AUTH_SCREENS: Screen[] = ['splash', 'login', 'forgot-password', 'change-password'];
const PARENT_SCREENS: Screen[] = ['home', 'tracking', 'notifications', 'history', 'profile'];
const DRIVER_SCREENS: Screen[] = [
  'driver-home',
  'driver-route',
  'driver-pickup',
  'driver-incident',
  'driver-notifications',
  'driver-profile',
];
const TAB_SCREENS: Screen[] = ['home', 'tracking', 'notifications', 'history', 'profile'];

interface RootNavigationProps {
  screen: Screen;
  role: 'parent' | 'driver';
  userPhone: string;
  onNavigate: (screen: string) => void;
  onLogin: (phone: string, password: string) => Promise<void>;
  onPasswordChanged: () => void;
  onLogout: () => void;
}

export function RootNavigation({
  screen,
  role,
  userPhone,
  onNavigate,
  onLogin,
  onPasswordChanged,
  onLogout,
}: RootNavigationProps) {
  const isAuth = AUTH_SCREENS.includes(screen);
  const isParent = role === 'parent' && PARENT_SCREENS.includes(screen);
  const isDriver = role === 'driver' && DRIVER_SCREENS.includes(screen);
  const showBottomNav = isParent && TAB_SCREENS.includes(screen);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {isAuth && (
          <AuthNavigation
            screen={screen}
            userPhone={userPhone}
            onNavigate={onNavigate}
            onLogin={onLogin}
            onPasswordChanged={onPasswordChanged}
          />
        )}

        {isParent && (
          <ParentNavigation
            screen={screen}
            onNavigate={onNavigate}
            onLogout={onLogout}
          />
        )}

        {isDriver && (
          <DriverNavigation
            screen={screen}
            onNavigate={onNavigate}
            onLogout={onLogout}
          />
        )}
      </View>

      {showBottomNav && (
        <BottomNav active={screen} onNavigate={onNavigate} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  content: {
    flex: 1,
  },
});