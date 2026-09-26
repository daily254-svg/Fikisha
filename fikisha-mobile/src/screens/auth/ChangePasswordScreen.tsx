import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, Eye, EyeOff } from 'lucide-react-native';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/hooks/useAuth';

interface ChangePasswordScreenProps {
  onPasswordChanged: () => void;
  phoneNumber: string;
}

export function ChangePasswordScreen({
  onPasswordChanged,
  phoneNumber,
}: ChangePasswordScreenProps) {
  const { setFirstLoginDone } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChangePassword = async () => {
    setError('');

    if (currentPassword !== phoneNumber) {
      setError('Current password is incorrect');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword === phoneNumber) {
      setError('New password cannot be the same as your phone number');
      return;
    }

    setIsLoading(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      setFirstLoginDone();
      onPasswordChanged();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? 'Failed to change password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength =
    newPassword.length >= 8 ? 'Strong' : newPassword.length >= 6 ? 'Medium' : newPassword.length > 0 ? 'Weak' : '';

  const strengthColor =
    passwordStrength === 'Strong' ? '#16A34A' : passwordStrength === 'Medium' ? '#D97706' : '#DC2626';

  const strengthWidth = passwordStrength === 'Weak' ? '33%' : passwordStrength === 'Medium' ? '66%' : '100%';

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
          <View style={styles.content}>
            <View style={styles.iconCircle}>
              <Lock size={28} color="#1B365D" />
            </View>

            <Text style={styles.title}>Set a new password</Text>
            <Text style={styles.subtitle}>
              For security, please change your default password before continuing
            </Text>

            <View style={styles.form}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Current Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color="#6B7FA3" />
                  <TextInput
                    style={styles.input}
                    placeholder="Your phone number"
                    placeholderTextColor="#A0B0C8"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry={!showCurrent}
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                  <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                    {showCurrent ? (
                      <EyeOff size={18} color="#6B7FA3" />
                    ) : (
                      <Eye size={18} color="#6B7FA3" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color="#6B7FA3" />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    placeholderTextColor="#A0B0C8"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNew}
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                  <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                    {showNew ? (
                      <EyeOff size={18} color="#6B7FA3" />
                    ) : (
                      <Eye size={18} color="#6B7FA3" />
                    )}
                  </TouchableOpacity>
                </View>
                {passwordStrength !== '' && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBarBg}>
                      <View
                        style={[
                          styles.strengthBarFill,
                          { width: strengthWidth as any, backgroundColor: strengthColor },
                        ]}
                      />
                    </View>
                    <Text style={[styles.strengthText, { color: strengthColor }]}>
                      {passwordStrength}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Confirm New Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color="#6B7FA3" />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor="#A0B0C8"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirm}
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? (
                      <EyeOff size={18} color="#6B7FA3" />
                    ) : (
                      <Eye size={18} color="#6B7FA3" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {error !== '' && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                style={[
                  styles.changeButton,
                  (!currentPassword || !newPassword || !confirmPassword || isLoading) &&
                    styles.changeButtonDisabled,
                ]}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.changeButtonText}>Change Password</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.infoText}>
                Must be at least 6 characters and different from your phone number.
              </Text>
            </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 48,
  },
  iconCircle: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1B365D',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7FA3',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  fieldContainer: {
    gap: 8,
  },
  label: {
    color: '#1B365D',
    fontSize: 14,
    fontWeight: '600',
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
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  strengthBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(27,54,93,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  changeButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#1B365D',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  changeButtonDisabled: {
    opacity: 0.6,
  },
  changeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    textAlign: 'center',
    color: '#6B7FA3',
    fontSize: 12,
    marginTop: 4,
  },
});
