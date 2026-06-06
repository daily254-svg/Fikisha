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
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react-native';

interface ChangePasswordScreenProps {
  onPasswordChanged: () => void;
  phoneNumber: string;
}

export function ChangePasswordScreen({
  onPasswordChanged,
  phoneNumber,
}: ChangePasswordScreenProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChangePassword = () => {
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
    setTimeout(() => {
      setIsLoading(false);
      onPasswordChanged();
    }, 1500);
  };

  const passwordStrength =
    newPassword.length >= 8
      ? 'Strong'
      : newPassword.length >= 6
        ? 'Medium'
        : newPassword.length > 0
          ? 'Weak'
          : '';

  const strengthColor =
    passwordStrength === 'Strong'
      ? '#22C55E'
      : passwordStrength === 'Medium'
        ? '#F97316'
        : '#EF4444';

  const strengthWidth =
    passwordStrength === 'Weak'
      ? '33%'
      : passwordStrength === 'Medium'
        ? '66%'
        : '100%';

  return (
    <SafeAreaView style={styles.container}>
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
          <View style={styles.background}>
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Lock size={32} color="#1B365D" />
                </View>
              </View>

              <Text style={styles.title}>Change Password</Text>
              <Text style={styles.subtitle}>
                For security, please change your default password
              </Text>

              <View style={styles.form}>
                {/* Current Password */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Current Password</Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={20} color="rgba(27,54,93,0.6)" />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter current password"
                      placeholderTextColor="#A0B0C8"
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      secureTextEntry={!showCurrent}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowCurrent(!showCurrent)}
                    >
                      {showCurrent ? (
                        <EyeOff size={20} color="#1B365D" />
                      ) : (
                        <Eye size={20} color="#1B365D" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* New Password */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={20} color="rgba(27,54,93,0.6)" />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter new password"
                      placeholderTextColor="#A0B0C8"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNew}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                      {showNew ? (
                        <EyeOff size={20} color="#1B365D" />
                      ) : (
                        <Eye size={20} color="#1B365D" />
                      )}
                    </TouchableOpacity>
                  </View>
                  {passwordStrength !== '' && (
                    <View style={styles.strengthContainer}>
                      <View style={styles.strengthBarBg}>
                        <View
                          style={[
                            styles.strengthBarFill,
                            {
                              width: strengthWidth as any,
                              backgroundColor: strengthColor,
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[styles.strengthText, { color: strengthColor }]}
                      >
                        {passwordStrength}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Confirm Password */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Confirm New Password</Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={20} color="rgba(27,54,93,0.6)" />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm new password"
                      placeholderTextColor="#A0B0C8"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirm}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? (
                        <EyeOff size={20} color="#1B365D" />
                      ) : (
                        <Eye size={20} color="#1B365D" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Error Message */}
                {error !== '' && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                {/* Change Password Button */}
                <TouchableOpacity
                  onPress={handleChangePassword}
                  disabled={
                    isLoading ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                  style={[
                    styles.changeButton,
                    (!currentPassword || !newPassword || !confirmPassword || isLoading) &&
                      styles.changeButtonDisabled,
                  ]}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#1B365D" size="small" />
                  ) : (
                    <Text style={styles.changeButtonText}>Change Password</Text>
                  )}
                </TouchableOpacity>

                {/* Info */}
                <View style={styles.infoContainer}>
                  <CheckCircle size={16} color="#F5C542" style={styles.infoIcon} />
                  <Text style={styles.infoText}>
                    Your password must be at least 6 characters long and
                    different from your phone number
                  </Text>
                </View>
              </View>
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
    backgroundColor: '#1B365D',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  background: {
    flex: 1,
    backgroundColor: '#1B365D',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 80,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5C542',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  form: {
    gap: 16,
  },
  fieldContainer: {
    gap: 8,
  },
  label: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
    height: 56,
  },
  input: {
    flex: 1,
    color: '#1B365D',
    fontSize: 15,
  },
  // Password strength
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  strengthBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  // Error
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 14,
  },
  // Change button
  changeButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F5C542',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  changeButtonDisabled: {
    opacity: 0.5,
  },
  changeButtonText: {
    color: '#1B365D',
    fontSize: 16,
    fontWeight: '600',
  },
  // Info
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 16,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
});