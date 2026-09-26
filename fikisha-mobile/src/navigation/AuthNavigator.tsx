import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { ChangePasswordScreen } from '../screens/auth/ChangePasswordScreen';

interface AuthNavigationProps {
  screen: string;
  userPhone: string;
  onNavigate: (screen: string) => void;
  onLogin: (phone: string, password: string) => Promise<void>;
  onPasswordChanged: () => void;
}

export function AuthNavigation({
  screen,
  userPhone,
  onNavigate,
  onLogin,
  onPasswordChanged,
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
        <ForgotPasswordScreen onBack={() => onNavigate('login')} />
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
