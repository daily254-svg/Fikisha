import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User2, Phone, Mail, LogOut, Bus } from 'lucide-react-native';
import { parentsService } from '@/services/parents.service';
import { schoolsService, School } from '@/services/schools.service';
import { useAuthStore } from '@/store/auth.store';
import type { ParentProfile } from '@/types';

interface ProfileScreenProps {
  onBack: () => void;
  onLogout: () => void;
}

export function ParentProfileScreen({ onBack, onLogout }: ProfileScreenProps) {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [school, setSchool] = useState<School | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const profileRes = await parentsService.getProfile();
        setProfile(profileRes.data);
        if (user?.schoolId) {
          const schoolRes = await schoolsService.getSchool(user.schoolId);
          setSchool(schoolRes.data);
        }
      } catch (e) {
        console.error('Failed to load parent profile', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleCall = (phone: string) => {
    const url = Platform.OS === 'android' ? `tel:${phone}` : `telprompt:${phone}`;
    Linking.openURL(url);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator color="#1B365D" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1B365D" translucent />

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.8}>
          <ArrowLeft size={18} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.headerProfile}>
          <View style={styles.avatar}>
            <User2 size={40} color="#1B365D" />
          </View>
          <Text style={styles.profileName}>{profile?.user.name ?? 'Parent'}</Text>
          <Text style={styles.profileRole}>
            Parent{school ? ` · ${school.name}` : ''}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              {profile?.students.length === 1 ? 'Child' : 'Children'}
            </Text>
            {(!profile || profile.students.length === 0) && (
              <Text style={styles.emptyText}>No children linked to your account yet.</Text>
            )}
            {profile?.students.map((link) => {
              const bus = link.student.routes?.[0]?.route?.bus;
              return (
                <View key={link.student.id} style={styles.childCard}>
                  <View style={styles.childAvatar}>
                    <User2 size={22} color="#1B365D" />
                  </View>
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>
                      {link.student.firstName} {link.student.lastName}
                    </Text>
                    <Text style={styles.childDetail}>
                      {link.student.grade ? `${link.student.grade} · ` : ''}
                      Admission #{link.student.admissionNo}
                    </Text>
                  </View>
                  {bus && (
                    <View style={styles.childBus}>
                      <Bus size={14} color="#F5C542" />
                      <Text style={styles.childBusText}>{bus.registrationNumber}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

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
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 24,
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
  emptyText: {
    color: '#6B7FA3',
    fontSize: 13,
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
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#F7F9FC',
    marginBottom: 8,
  },
  childAvatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#F5C542',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    color: '#1B365D',
    fontSize: 14,
    fontWeight: '700',
  },
  childDetail: {
    color: '#6B7FA3',
    fontSize: 12,
  },
  childBus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  childBusText: {
    color: '#1B365D',
    fontSize: 12,
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
