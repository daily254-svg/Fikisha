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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, Phone, Lock, ArrowRight } from 'lucide-react-native';
import Svg, { Rect, Circle, Path } from 'react-native-svg';

interface LoginScreenProps {
  onLogin: (role: 'parent' | 'driver', phone: string, password: string) => void;
  onForgotPassword: () => void;
}

export function LoginScreen({ onLogin, onForgotPassword }: LoginScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'parent' | 'driver'>('parent');
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');

    if (!phone.trim() || !password.trim()) {
      setError('Please enter phone number and password');
      return;
    }

    onLogin(role, phone, password);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1B365D" translucent />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top branding area */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Svg width="30" height="30" viewBox="0 0 30 30" fill="none">
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
            <Text style={styles.brandTagline}>Safe journeys, every day</Text>
          </View>

          {/* Role tabs */}
          <View style={styles.roleTabsContainer}>
            <View style={styles.roleTabs}>
              {(['parent', 'driver'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRole(r)}
                  style={[
                    styles.roleTab,
                    role === r && styles.roleTabActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.roleTabText,
                      role === r && styles.roleTabTextActive,
                    ]}
                  >
                    {r === 'parent' ? 'Parent' : 'Driver'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Welcome back</Text>
            <Text style={styles.formSubtitle}>
              Sign in to track your {role === 'parent' ? "child's" : ''} route
            </Text>

            {/* Phone field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Phone size={18} color="#6B7FA3" />
                <TextInput
                  style={styles.input}
                  placeholder="+254 7XX XXX XXX"
                  placeholderTextColor="#A0B0C8"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password field */}
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

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Forgot password */}
            <TouchableOpacity onPress={onForgotPassword} style={styles.forgotButton}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Sign In button */}
            <TouchableOpacity
              onPress={handleLogin}
              style={styles.signInButton}
              activeOpacity={0.8}
            >
              <Text style={styles.signInText}>Sign In</Text>
              <ArrowRight size={20} color="#1B365D" />
            </TouchableOpacity>

            {/* School branding */}
            <View style={styles.schoolCard}>
              <View style={styles.schoolIcon}>
                <Svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <Path d="M11 2L3 7v13h5v-5h6v5h5V7L11 2z" fill="#F5C542" />
                </Svg>
              </View>
              <View>
                <Text style={styles.schoolName}>Nairobi Academy</Text>
                <Text style={styles.schoolPowered}>Powered by Fikisha Transport</Text>
              </View>
            </View>

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
  // Header
  header: {
    backgroundColor: '#1B365D',
    paddingTop: 48,
    paddingBottom: 40,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F5C542',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  brandName: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandTagline: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 4,
  },
  // Role tabs
  roleTabsContainer: {
    marginTop: -20,
    paddingHorizontal: 24,
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: '#EFF2F7',
    borderRadius: 16,
    padding: 4,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  roleTabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#1B365D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  roleTabText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7FA3',
  },
  roleTabTextActive: {
    fontWeight: '600',
    color: '#1B365D',
  },
  // Form
  form: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
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
    borderRadius: 16,
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
  // Error
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
  },
  // Forgot password
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotText: {
    color: '#F5C542',
    fontSize: 14,
    fontWeight: '600',
  },
  // Sign In button
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F5C542',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  signInText: {
    color: '#1B365D',
    fontSize: 16,
    fontWeight: '700',
  },
  // School card
  schoolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(27,54,93,0.08)',
  },
  schoolIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1B365D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  schoolName: {
    color: '#1B365D',
    fontSize: 14,
    fontWeight: '600',
  },
  schoolPowered: {
    color: '#6B7FA3',
    fontSize: 12,
  },
  // Footer
  footerText: {
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 32,
    color: '#6B7FA3',
    fontSize: 13,
  },
  footerLink: {
    color: '#1B365D',
    fontWeight: '600',
  },
});