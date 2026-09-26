import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User2, Phone, Mail, LogOut, Bus } from 'lucide-react-native';
import { driversService } from '@/services/drivers.service';
import { schoolsService, School } from '@/services/schools.service';
import { useAuthStore } from '@/store/auth.store';
import type { DriverProfile } from '@/types';

interface ProfileScreenProps {
  onBack: () => void;
  onLogout: () => void;
}

export function DriverProfileScreen({ onBack, onLogout }: ProfileScreenProps) {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [school, setSchool] = useState<School | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const profileRes = await driversService.getProfile();
        setProfile(profileRes.data);
        if (user?.schoolId) {
          const schoolRes = await schoolsService.getSchool(user.schoolId);
          setSchool(schoolRes.data);
        }
      } catch (e) {
        console.error('Failed to load driver profile', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleCall = (phone: string) => {
    const url = Platform.OS === 'android' ? `tel:${phone}` : `telprompt:${phone}`;
    Linking.openURL(url);
  };

  const bus = profile?.busAssignments?.[0]?.bus;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator color="#1B365D" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.8}>
            <ArrowLeft size={18} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerProfile}>
            <View style={styles.avatar}>
              <User2 size={40} color="#1B365D" />
            </View>
            <Text style={styles.profileName}>{profile?.user.name ?? 'Driver'}</Text>
            <Text style={styles.profileRole}>
              Driver{school ? ` · ${school.name}` : ''}
            </Text>

            {bus && (
              <View style={styles.vehicleCard}>
                <Bus size={18} color="#F5C542" />
                <View>
                  <Text style={styles.vehiclePlate}>{bus.registrationNumber}</Text>
                  {bus.capacity && (
                    <Text style={styles.vehicleDetail}>Capacity: {bus.capacity} students</Text>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Contact Info</Text>
            <View style={[styles.contactRow, styles.contactRowBorder]}>
              <View style={styles.contactIcon}>
                <Phone size={16} color="#6B7FA3" />
              </View>
              <Text style={styles.contactLabel}>{profile?.user.phone ?? '—'}</Text>
            </View>
            <View style={styles.contactRow}>
              <View style={styles.contactIcon}>
                <Mail size={16} color="#6B7FA3" />
              </View>
              <Text style={styles.contactLabel}>{profile?.user.email ?? 'Not provided'}</Text>
            </View>
          </View>

          {(profile?.licenseNo || profile?.employeeNo) && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Credentials</Text>
              {profile?.licenseNo && (
                <View style={[styles.credentialRow, profile?.employeeNo && styles.credentialRowBorder]}>
                  <Text style={styles.credentialLabel}>License Number</Text>
                  <Text style={styles.credentialValue}>{profile.licenseNo}</Text>
                </View>
              )}
              {profile?.employeeNo && (
                <View style={styles.credentialRow}>
                  <Text style={styles.credentialLabel}>Employee ID</Text>
                  <Text style={styles.credentialValue}>{profile.employeeNo}</Text>
                </View>
              )}
            </View>
          )}

          {school?.phone && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Need help?</Text>
              <View style={styles.emergencyRow}>
                <View style={styles.emergencyInfo}>
                  <Text style={styles.emergencyName}>School transport office</Text>
                  <Text style={styles.emergencyPhone}>{school.phone}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleCall(school.phone!)}
                  style={styles.callButton}
                  activeOpacity={0.8}
                >
                  <Phone size={15} color="#1B365D" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity onPress={onLogout} style={styles.logoutButton} activeOpacity={0.8}>
            <LogOut size={18} color="#EF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
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
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    backgroundColor: '#1B365D',
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  headerProfile: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#F5C542',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  profileName: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '700',
  },
  profileRole: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginTop: 2,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  vehiclePlate: {
    color: '#F5C542',
    fontSize: 15,
    fontWeight: '700',
  },
  vehicleDetail: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  body: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  sectionCard: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: 'rgba(27,54,93,0.06)',
  },
  sectionTitle: {
    color: '#6B7FA3',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  contactRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27,54,93,0.06)',
  },
  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F7F9FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    color: '#1B365D',
    fontSize: 14,
    fontWeight: '500',
  },
  credentialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  credentialRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27,54,93,0.06)',
  },
  credentialLabel: {
    color: '#6B7FA3',
    fontSize: 13,
  },
  credentialValue: {
    color: '#1B365D',
    fontSize: 13,
    fontWeight: '600',
  },
  emergencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emergencyInfo: {},
  emergencyName: {
    color: '#1B365D',
    fontSize: 14,
    fontWeight: '600',
  },
  emergencyPhone: {
    color: '#6B7FA3',
    fontSize: 12,
  },
  callButton: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F7F9FC',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: 'rgba(239,68,68,0.15)',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
});
