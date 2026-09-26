import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { parentsService } from '@/services/parents.service';
import { schoolsService, School } from '@/services/schools.service';
import { useTracking } from '@/hooks/useTracking';
import { useAuthStore } from '@/store/auth.store';
import { trackingService } from '@/services/tracking.service';
import {
  Bell,
  Clock,
  CheckCircle2,
  Navigation,
  ChevronRight,
  Bus,
  User2,
  AlertCircle,
} from 'lucide-react-native';
import type { Student, TransportEvent } from '@/types';

interface ParentDashboardProps {
  onNavigate: (screen: string) => void;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString();
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function eventLabel(event: TransportEvent): string {
  const name = event.student ? event.student.firstName : 'Your child';
  if (event.type === 'PICKED_UP') return `${name} was picked up`;
  if (event.type === 'DROPPED_OFF') return `${name} was dropped off`;
  return `${name} was marked absent`;
}

export function ParentDashboard({ onNavigate }: ParentDashboardProps) {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [parentName, setParentName] = useState('');
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);
  const [busId, setBusId] = useState<string | null>(null);
  const [busRegistration, setBusRegistration] = useState<string | null>(null);
  const [recentEvents, setRecentEvents] = useState<TransportEvent[]>([]);
  const [school, setSchool] = useState<School | null>(null);

  const { liveLocation, dbLocation, isLive } = useTracking(busId);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [profileRes, studentsRes, eventsRes] = await Promise.all([
          parentsService.getProfile(),
          parentsService.getStudents(),
          trackingService.getTransportEvents({ limit: 5 }),
        ]);
        if (!mounted) return;

        setParentName(profileRes.data.user?.name || '');
        setRecentEvents(eventsRes.data);

        const first = studentsRes.data[0]?.student ?? null;
        setSelectedChild(first);

        if (first) {
          const routeBus = first.routes?.[0]?.route?.bus;
          if (routeBus) {
            setBusId(routeBus.id);
            setBusRegistration(routeBus.registrationNumber);
          } else {
            const busRes = await parentsService.getStudentBus(first.id);
            if (!mounted) return;
            setBusId(busRes.data.bus?.id ?? null);
            setBusRegistration(busRes.data.bus?.registrationNumber ?? null);
          }
        }

        if (user?.schoolId) {
          const schoolRes = await schoolsService.getSchool(user.schoolId);
          if (mounted) setSchool(schoolRes.data);
        }
      } catch (e) {
        console.error('Failed to load parent dashboard', e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleCallSchool = () => {
    if (!school?.phone) return;
    Linking.openURL(`tel:${school.phone}`);
  };

  const childEventsToday = recentEvents.filter((e) => {
    if (e.studentId !== selectedChild?.id) return false;
    const eventDate = new Date(e.createdAt);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  });
  const pickedUpEvent = childEventsToday.find((e) => e.type === 'PICKED_UP');
  const droppedOffEvent = childEventsToday.find((e) => e.type === 'DROPPED_OFF');

  const location = liveLocation ?? dbLocation;

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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome back</Text>
              <Text style={styles.parentName}>{parentName || 'Parent'}</Text>
            </View>
            <TouchableOpacity
              onPress={() => onNavigate('notifications')}
              style={styles.notificationButton}
              activeOpacity={0.8}
            >
              <Bell size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Child card */}
          <View style={styles.childCard}>
            <View style={styles.childAvatar}>
              <User2 size={24} color="#1B365D" />
            </View>
            <View style={styles.childInfo}>
              <Text style={styles.childName}>
                {selectedChild ? `${selectedChild.firstName} ${selectedChild.lastName}` : 'No student linked'}
              </Text>
              <Text style={styles.childDetail}>{selectedChild?.grade ?? ''}</Text>
            </View>
            <View style={styles.childBusInfo}>
              <Text style={styles.childBusPlate}>{busRegistration ?? 'No bus assigned'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* Live tracking card */}
          {busId ? (
            <TouchableOpacity
              onPress={() => onNavigate('tracking')}
              style={styles.trackingCard}
              activeOpacity={0.9}
            >
              <View style={styles.trackingInfo}>
                <View style={styles.trackingHeader}>
                  <View style={styles.trackingHeaderLeft}>
                    <View style={styles.busIconCircle}>
                      <Bus size={18} color="#1B365D" />
                    </View>
                    <View>
                      <Text style={styles.trackingBus}>{busRegistration ?? 'Bus'}</Text>
                      <Text style={styles.trackingDetail}>
                        {isLive && liveLocation
                          ? `Live · ${Math.round(liveLocation.speed)} km/h`
                          : location
                            ? `Last seen ${timeAgo(location.updatedAt)}`
                            : 'No location reported yet'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.trackLiveRow}>
                    <Text style={styles.trackLiveText}>Track live</Text>
                    <ChevronRight size={16} color="#1B365D" />
                  </View>
                </View>

                {/* Status steps */}
                <View style={styles.statusSteps}>
                  {[
                    { label: 'Picked up', done: !!pickedUpEvent, time: pickedUpEvent ? formatTime(pickedUpEvent.createdAt) : '—' },
                    { label: 'En route', done: isLive, time: isLive ? 'Now' : '—' },
                    { label: 'At school', done: !!droppedOffEvent, time: droppedOffEvent ? formatTime(droppedOffEvent.createdAt) : '—' },
                  ].map((step, i) => (
                    <View key={i} style={styles.statusStep}>
                      <View
                        style={[
                          styles.statusStepIcon,
                          { backgroundColor: step.done ? '#22C55E' : '#EFF2F7' },
                        ]}
                      >
                        {step.done ? (
                          <CheckCircle2 size={14} color="#ffffff" />
                        ) : (
                          <View style={styles.pendingDot} />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.statusStepLabel,
                          { color: step.done ? '#1B365D' : '#6B7FA3' },
                        ]}
                      >
                        {step.label}
                      </Text>
                      <Text style={styles.statusStepTime}>{step.time}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.trackingCard}>
              <View style={styles.trackingInfo}>
                <Text style={styles.noBusText}>
                  {selectedChild
                    ? "Your child isn't assigned to a route yet."
                    : 'Contact your school to link a student to your account.'}
                </Text>
              </View>
            </View>
          )}

          {/* Recent alerts */}
          <View style={styles.alertsSection}>
            <View style={styles.alertsHeader}>
              <Text style={styles.alertsTitle}>Recent Alerts</Text>
              <TouchableOpacity onPress={() => onNavigate('notifications')}>
                <Text style={styles.alertsViewAll}>View all</Text>
              </TouchableOpacity>
            </View>
            {recentEvents.length === 0 && (
              <Text style={styles.noAlertsText}>No activity yet.</Text>
            )}
            {recentEvents.slice(0, 3).map((event) => (
              <View key={event.id} style={styles.alertCard}>
                <View
                  style={[
                    styles.alertIcon,
                    {
                      backgroundColor:
                        event.type === 'PICKED_UP'
                          ? '#F5C54220'
                          : event.type === 'DROPPED_OFF'
                            ? '#22C55E20'
                            : '#EF444420',
                    },
                  ]}
                >
                  {event.type === 'DROPPED_OFF' ? (
                    <CheckCircle2 size={18} color="#22C55E" />
                  ) : (
                    <Bus size={18} color={event.type === 'PICKED_UP' ? '#F5C542' : '#EF4444'} />
                  )}
                </View>
                <Text style={styles.alertText}>{eventLabel(event)}</Text>
                <Text style={styles.alertTime}>{timeAgo(event.createdAt)}</Text>
              </View>
            ))}
          </View>

          {/* Emergency contact */}
          <View style={styles.emergencyCard}>
            <AlertCircle size={22} color="#F97316" />
            <View style={styles.emergencyInfo}>
              <Text style={styles.emergencyTitle}>Need help?</Text>
              <Text style={styles.emergencySubtitle}>
                {school?.phone ? 'Contact school transport office' : 'No contact number on file'}
              </Text>
            </View>
            {school?.phone && (
              <TouchableOpacity
                onPress={handleCallSchool}
                style={styles.emergencyCallButton}
                activeOpacity={0.8}
              >
                <Text style={styles.emergencyCallText}>Call</Text>
              </TouchableOpacity>
            )}
          </View>
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
  },
  // Header
  header: {
    backgroundColor: '#1B365D',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greeting: {
    color: 'rgba(245,197,66,0.9)',
    fontSize: 13,
    fontWeight: '500',
  },
  parentName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Child card
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  childAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F5C542',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  childDetail: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  childBusInfo: {
    alignItems: 'flex-end',
  },
  childBusPlate: {
    color: '#F5C542',
    fontSize: 12,
    fontWeight: '600',
  },
  // Body
  body: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  // Tracking card
  trackingCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: 'rgba(27,54,93,0.06)',
    overflow: 'hidden',
  },
  noBusText: {
    color: '#6B7FA3',
    fontSize: 13,
    lineHeight: 19,
  },
  trackingInfo: {
    padding: 16,
  },
  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  trackingHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  busIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackingBus: {
    color: '#1B365D',
    fontSize: 16,
    fontWeight: '700',
  },
  trackingDetail: {
    color: '#6B7FA3',
    fontSize: 12,
    marginTop: 2,
  },
  trackLiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trackLiveText: {
    color: '#1B365D',
    fontSize: 13,
    fontWeight: '600',
  },
  // Status steps
  statusSteps: {
    flexDirection: 'row',
    gap: 8,
  },
  statusStep: {
    flex: 1,
    alignItems: 'center',
  },
  statusStepIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  statusStepLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  statusStepTime: {
    color: '#6B7FA3',
    fontSize: 10,
  },
  // Alerts
  alertsSection: {
    gap: 8,
  },
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertsTitle: {
    color: '#1B365D',
    fontSize: 15,
    fontWeight: '700',
  },
  alertsViewAll: {
    color: '#F5C542',
    fontSize: 13,
    fontWeight: '600',
  },
  noAlertsText: {
    color: '#6B7FA3',
    fontSize: 13,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: 'rgba(27,54,93,0.06)',
  },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertText: {
    flex: 1,
    color: '#1B365D',
    fontSize: 13,
    fontWeight: '500',
  },
  alertTime: {
    color: '#6B7FA3',
    fontSize: 11,
  },
  // Emergency
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFF8E1',
    borderWidth: 1.5,
    borderColor: 'rgba(245,197,66,0.3)',
    marginBottom: 32,
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyTitle: {
    color: '#1B365D',
    fontSize: 14,
    fontWeight: '600',
  },
  emergencySubtitle: {
    color: '#6B7FA3',
    fontSize: 12,
  },
  emergencyCallButton: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1B365D',
  },
  emergencyCallText: {
    color: '#F5C542',
    fontSize: 12,
    fontWeight: '600',
  },
});
