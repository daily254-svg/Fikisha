import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  Wrench,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react-native';
import { driversService } from '@/services/drivers.service';
import { incidentsService } from '@/services/incidents.service';
import { useLocation } from '@/hooks/useLocation';
import type { ActiveBusAssignment, IncidentType } from '@/types';

interface DriverIncidentScreenProps {
  onBack: () => void;
}

const incidentTypes: { id: IncidentType; icon: any; label: string; color: string; bg: string }[] = [
  { id: 'DELAY', icon: Clock, label: 'Traffic Delay', color: '#F97316', bg: '#FFF7ED' },
  { id: 'HAZARD', icon: AlertTriangle, label: 'Road Hazard', color: '#F5C542', bg: '#FFF8E1' },
  { id: 'MECHANICAL', icon: Wrench, label: 'Mechanical Issue', color: '#6B7FA3', bg: '#F7F9FC' },
  { id: 'EMERGENCY', icon: ShieldAlert, label: 'Emergency', color: '#EF4444', bg: '#FEF2F2' },
];

export function DriverIncidentScreen({ onBack }: DriverIncidentScreenProps) {
  const [selected, setSelected] = useState<IncidentType | null>(null);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeBus, setActiveBus] = useState<ActiveBusAssignment | null>(null);
  const location = useLocation(false);

  useEffect(() => {
    driversService
      .getActiveBus()
      .then((res) => setActiveBus(res.data))
      .catch((e) => console.error('Failed to load bus', e));
  }, []);

  const handleSubmit = async () => {
    if (!selected || !description.trim()) return;

    setIsSubmitting(true);
    setError('');
    try {
      await incidentsService.create({
        type: selected,
        description: description.trim(),
        latitude: location.latitude ?? undefined,
        longitude: location.longitude ?? undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.message ?? 'Failed to submit report'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmergencyCall = () => {
    const phoneNumber = Platform.OS === 'android' ? 'tel:999' : 'telprompt:999';
    Linking.openURL(phoneNumber);
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <CheckCircle2 size={40} color="#ffffff" />
          </View>
          <Text style={styles.successTitle}>Report Submitted</Text>
          <Text style={styles.successMessage}>
            The school office and parents on this route have been notified.
          </Text>
          <TouchableOpacity
            onPress={() => {
              setSubmitted(false);
              setSelected(null);
              setDescription('');
              onBack();
            }}
            style={styles.successButton}
            activeOpacity={0.8}
          >
            <Text style={styles.successButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.8}>
              <ArrowLeft size={18} color="#ffffff" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Report Incident</Text>
              <Text style={styles.headerSubtitle}>
                {activeBus ? activeBus.bus.registrationNumber : 'No bus assigned'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.sectionTitle}>What type of incident?</Text>
          <View style={styles.incidentGrid}>
            {incidentTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selected === type.id;
              return (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => setSelected(type.id)}
                  style={[
                    styles.incidentCard,
                    {
                      backgroundColor: isSelected ? type.color : '#ffffff',
                      borderColor: isSelected ? type.color : 'rgba(27,54,93,0.08)',
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.incidentIcon,
                      { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : type.bg },
                    ]}
                  >
                    <Icon size={24} color={isSelected ? '#ffffff' : type.color} />
                  </View>
                  <Text
                    style={[styles.incidentLabel, { color: isSelected ? '#ffffff' : '#1B365D' }]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Additional details</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the situation briefly... (e.g., heavy traffic on Ngong Road, estimated 15min delay)"
            placeholderTextColor="#A0B0C8"
            multiline
            numberOfLines={4}
            style={styles.textArea}
            textAlignVertical="top"
          />

          <View style={styles.infoBox}>
            <AlertTriangle size={16} color="#F97316" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              {location.latitude != null
                ? 'Your current GPS location will be included with this report. Parents and the school office will be notified immediately.'
                : 'Parents and the school office will be notified immediately.'}
            </Text>
          </View>

          {selected === 'EMERGENCY' && (
            <View style={styles.emergencyBox}>
              <View style={styles.emergencyContent}>
                <ShieldAlert size={22} color="#EF4444" />
                <View style={styles.emergencyTextContainer}>
                  <Text style={styles.emergencyTitle}>Emergency detected</Text>
                  <Text style={styles.emergencySubtitle}>
                    If anyone is in danger, call emergency services directly
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleEmergencyCall}
                style={styles.emergencyCallButton}
                activeOpacity={0.8}
              >
                <Text style={styles.emergencyCallText}>Call 999</Text>
              </TouchableOpacity>
            </View>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!selected || !description.trim() || isSubmitting}
            style={[
              styles.submitButton,
              { backgroundColor: selected && description.trim() ? '#F5C542' : '#EFF2F7' },
            ]}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#1B365D" size="small" />
            ) : (
              <Text
                style={[
                  styles.submitButtonText,
                  { color: selected && description.trim() ? '#1B365D' : '#CBD5E1' },
                ]}
              >
                Submit Report
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#1B365D',
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
  },
  body: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    color: '#1B365D',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  incidentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  incidentCard: {
    width: '47%',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
  },
  incidentIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incidentLabel: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  textArea: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(27,54,93,0.1)',
    color: '#1B365D',
    fontSize: 14,
    lineHeight: 21,
    minHeight: 100,
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#EFF2F7',
    marginBottom: 16,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    color: '#6B7FA3',
    fontSize: 12,
    lineHeight: 18,
  },
  emergencyBox: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: 'rgba(239,68,68,0.3)',
    marginBottom: 20,
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  emergencyTextContainer: {
    flex: 1,
  },
  emergencyTitle: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  emergencySubtitle: {
    color: '#6B7FA3',
    fontSize: 12,
  },
  emergencyCallButton: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#EF4444',
    alignSelf: 'flex-start',
  },
  emergencyCallText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  submitButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  submitButtonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#F7F9FC',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  successTitle: {
    color: '#1B365D',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  successMessage: {
    color: '#6B7FA3',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 32,
  },
  successButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#F5C542',
    alignItems: 'center',
  },
  successButtonText: {
    color: '#1B365D',
    fontWeight: '700',
    fontSize: 16,
  },
});
