import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, Phone, Lock } from 'lucide-react-native';
import Svg, { Rect, Circle } from 'react-native-svg';

interface LoginScreenProps {
  onLogin: (phone: string, password: string) => Promise<void>;
  onForgotPassword: () => void;
}

export function LoginScreen({ onLogin, onForgotPassword }: LoginScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError('');

    if (!phone.trim() || !password.trim()) {
      setError('Please enter your phone number and password');
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(phone.trim(), password);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? 'Invalid phone number or password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Svg width="26" height="26" viewBox="0 0 30 30" fill="none">
                <Rect x="2" y="10" width="22" height="13" rx="3" fill="#1B365D" />
                <Rect x="24" y="12" width="4" height="9" rx="2" fill="#1B365D" />
                <Rect x="4" y="12" width="5" height="5" rx="1.5" fill="#F5C542" />
                <Rect x="12" y="12" width="5" height="5" rx="1.5" fill="#F5C542" />
                <Circle cx="7" cy="23" r="3" fill="#1B365D" />
                <Circle cx="7" cy="23" r="1.5" fill="#F5C542" />
                <Circle cx="21" cy="23" r="3" fill="#1B365D" />
                <Circle cx="21" cy="23" r="1.5" fill="#F5C542" />
              </Svg>
            </View>
            <Text style={styles.brandName}>Fikisha</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>Welcome back</Text>
            <Text style={styles.formSubtitle}>Sign in to track your route</Text>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Phone size={18} color="#6B7FA3" />
                <TextInput
                  style={styles.input}
                  placeholder="0700 000 000"
                  placeholderTextColor="#A0B0C8"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color="#6B7FA3" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#A0B0C8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={18} color="#6B7FA3" />
                  ) : (
                    <Eye size={18} color="#6B7FA3" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity onPress={onForgotPassword} style={styles.forgotButton}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.signInText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text style={styles.footerLink}>Contact your school</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EFF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandName: {
    color: '#1B365D',
    fontSize: 18,
    fontWeight: '700',
  },
  form: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  formTitle: {
    color: '#1B365D',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  formSubtitle: {
    color: '#6B7FA3',
    fontSize: 14,
    marginBottom: 28,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    color: '#1B365D',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 16,
    gap: 12,
    height: 52,
    borderWidth: 1.5,
    borderColor: 'rgba(27,54,93,0.12)',
  },
  input: {
    flex: 1,
    color: '#1B365D',
    fontSize: 15,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 28,
  },
  forgotText: {
    color: '#1B365D',
    fontSize: 14,
    fontWeight: '600',
  },
  signInButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1B365D',
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 24,
  },
  signInButtonDisabled: {
    opacity: 0.7,
  },
  signInText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#6B7FA3',
    fontSize: 13,
  },
  footerLink: {
    color: '#1B365D',
    fontWeight: '600',
  },
});
