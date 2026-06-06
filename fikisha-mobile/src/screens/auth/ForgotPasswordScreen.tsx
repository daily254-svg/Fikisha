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
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Phone, Mail } from 'lucide-react-native';

interface ForgotPasswordScreenProps {
  onBack: () => void;
  onResetSent: () => void;
}

export function ForgotPasswordScreen({ onBack, onResetSent }: ForgotPasswordScreenProps) {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendReset = () => {
    if (!phone.trim()) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onResetSent();
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B365D" translucent />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.background}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onBack}
              style={styles.backButton}
              activeOpacity={0.8}
            >
              <ArrowLeft size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Mail size={32} color="#1B365D" />
              </View>
            </View>

            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your phone number and we'll send you a reset code
            </Text>

            <View style={styles.form}>
              {/* Phone Input */}
              <View>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputWrapper}>
                  <Phone size={20} color="rgba(27,54,93,0.6)" />
                  <TextInput
                    style={styles.input}
                    placeholder="+254 712 345 678"
                    placeholderTextColor="#A0B0C8"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Send Button */}
              <TouchableOpacity
                onPress={handleSendReset}
                disabled={isLoading || !phone.trim()}
                style={[
                  styles.sendButton,
                  (!phone.trim() || isLoading) && styles.sendButtonDisabled,
                ]}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#1B365D" size="small" />
                ) : (
                  <Text style={styles.sendButtonText}>Send Reset Code</Text>
                )}
              </TouchableOpacity>

              {/* Back to Login */}
              <TouchableOpacity onPress={onBack} style={styles.backToLoginButton}>
                <Text style={styles.backToLoginText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  background: {
    flex: 1,
    backgroundColor: '#1B365D',
  },
  // Header
  header: {
    paddingTop: 16,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Content
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
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
    marginBottom: 40,
  },
  form: {
    gap: 16,
  },
  label: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 8,
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
  sendButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F5C542',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#1B365D',
    fontSize: 16,
    fontWeight: '600',
  },
  backToLoginButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backToLoginText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
});