import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { ChangePasswordScreen } from '../screens/auth/ChangePasswordScreen';

interface AuthNavigationProps {
  screen: string;
  userPhone: string;
  role: 'parent' | 'driver';
  onNavigate: (screen: string) => void;
  onLogin: (role: 'parent' | 'driver', phone: string, password: string) => void;
  onPasswordChanged: () => void;
  onResetSent: () => void;
}

export function AuthNavigation({
  screen,
  userPhone,
  role,
  onNavigate,
  onLogin,
  onPasswordChanged,
  onResetSent,
}: AuthNavigationProps) {
  return (
    <View style={styles.container}>
      {screen === 'splash' && (
        <SplashScreen onContinue={() => onNavigate('login')} />
      )}
      {screen === 'login' && (
        <LoginScreen
          onLogin={onLogin}
          onForgotPassword={() => onNavigate('forgot-password')}
        />
      )}
      {screen === 'forgot-password' && (
        <ForgotPasswordScreen
          onBack={() => onNavigate('login')}
          onResetSent={onResetSent}
        />
      )}
      {screen === 'change-password' && (
        <ChangePasswordScreen
          onPasswordChanged={onPasswordChanged}
          phoneNumber={userPhone}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});