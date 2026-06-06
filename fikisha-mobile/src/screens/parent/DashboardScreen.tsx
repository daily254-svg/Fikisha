import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { parentsService } from '@/services/parents.service';
import { useTracking } from '@/hooks/useTracking';
import {
  Bell,
  MapPin,
  Clock,
  CheckCircle2,
  Navigation,
  ChevronRight,
  Bus,
  User2,
  AlertCircle,
} from 'lucide-react-native';

interface ParentDashboardProps {
  onNavigate: (screen: string) => void;
}

const statusSteps = [
  { label: 'Pickup', status: 'done' as const, time: '7:12 AM' },
  { label: 'En Route', status: 'active' as const, time: 'Now' },
  { label: 'School', status: 'pending' as const, time: '~7:45 AM' },
];

const notifications = [
  {
    icon: 'bus' as const,
    text: 'Bus KCA 345G is 4 stops away',
    time: '2m ago',
    color: '#F5C542',
  },
  {
    icon: 'check' as const,
    text: 'Amani was picked up safely',
    time: '18m ago',
    color: '#22C55E',
  },
];

export function ParentDashboard({ onNavigate }: ParentDashboardProps) {
  const [parentName, setParentName] = useState('');
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any | null>(null);
  const [busId, setBusId] = useState<string | null>(null);

  const { liveLocation, dbLocation, isLive, isLoading } = useTracking(busId);

  useEffect(() => {
    (async () => {
      try {
        const profile = await parentsService.getProfile();
        setParentName(profile.data?.name || '');
      } catch (e) {
        // ignore
      }

      try {
        const res = await parentsService.getStudents();
        const list = res.data || [];
        setChildren(list);
        const first = list[0] ?? null;
        setSelectedChild(first);
        if (first) {
          const bus = first.routes?.[0]?.route?.bus;
          if (bus?.id) setBusId(bus.id);
          else {
            try {
              const busRes = await parentsService.getStudentBus(first.id);
              setBusId(busRes.data?.id ?? null);
            } catch (err) {
              // ignore
            }
          }
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const handleCallSchool = () => {
    Linking.openURL(Platform.OS === 'android' ? 'tel:+254700000000' : 'telprompt:+254700000000');
  };

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
              <Text style={styles.greeting}>Good Morning ☀️</Text>
              <Text style={styles.parentName}>{parentName || 'Parent'}</Text>
            </View>
            <TouchableOpacity
              onPress={() => onNavigate('notifications')}
              style={styles.notificationButton}
              activeOpacity={0.8}
            >
              <Bell size={20} color="#ffffff" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>

          {/* Child card */}
          <View style={styles.childCard}>
            <View style={styles.childAvatar}>
              <User2 size={24} color="#1B365D" />
            </View>
            <View style={styles.childInfo}>
              <Text style={styles.childName}>{selectedChild ? `${selectedChild.firstName} ${selectedChild.lastName}` : '—'}</Text>
              <Text style={styles.childDetail}>{selectedChild ? `${selectedChild.grade || ''} · ${selectedChild.schoolName || ''}` : ''}</Text>
            </View>
            <View style={styles.childBusInfo}>
              <Text style={styles.childBusPlate}>{selectedChild?.routes?.[0]?.route?.bus?.registrationNumber ?? 'No bus assigned'}</Text>
              <Text style={styles.childDriver}>{selectedChild?.routes?.[0]?.route ? `Driver: ${selectedChild?.routes?.[0]?.route?.driverName ?? 'N/A'}` : ''}</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* Live tracking card */}
          <TouchableOpacity
            onPress={() => onNavigate('tracking')}
            style={styles.trackingCard}
            activeOpacity={0.9}
          >
            {/* Map preview */}
            <View style={styles.mapPreview}>
              {/* Grid lines */}
              {[0, 1, 2, 3].map((i) => (
                <View
                  key={`h${i}`}
                  style={[
                    styles.mapGridH,
                    { top: `${i * 25}%` },
                  ]}
                />
              ))}
              {[0, 1, 2, 3, 4].map((i) => (
                <View
                  key={`v${i}`}
                  style={[
                    styles.mapGridV,
                    { left: `${i * 25}%` },
                  ]}
                />
              ))}

              {/* Route line */}
              <Svg
                style={StyleSheet.absoluteFill}
                viewBox="0 0 300 144"
                preserveAspectRatio="none"
              >
                <Path
                  d="M20 120 Q80 100 120 80 Q160 60 200 50 Q240 40 280 30"
                  stroke="#F5C542"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="6 4"
                />
              </Svg>

              {/* Bus marker */}
              <View style={styles.busMarker}>
                <Bus size={16} color="#F5C542" />
              </View>

              {/* School marker */}
              <View style={styles.schoolMarker}>
                <Svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <Path d="M6 1L1 4v7h3V8h4v3h3V4L6 1z" fill="#ffffff" />
                </Svg>
              </View>

              {/* ETA badge */}
              <View style={styles.etaBadge}>
                <Clock size={12} color="#F5C542" />
                <Text style={styles.etaText}>ETA 7:45 AM</Text>
              </View>

              {/* LIVE badge */}
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>

            <View style={styles.trackingInfo}>
              <View style={styles.trackingHeader}>
                <View>
                  <Text style={styles.trackingBus}>Bus KCA 345G</Text>
                  <Text style={styles.trackingDetail}>4 stops away · 28 km/h</Text>
                </View>
                <View style={styles.trackLiveRow}>
                  <Text style={styles.trackLiveText}>Track live</Text>
                  <ChevronRight size={16} color="#1B365D" />
                </View>
              </View>

              {/* Status steps */}
              <View style={styles.statusSteps}>
                {statusSteps.map((step, i) => (
                  <View key={i} style={styles.statusStep}>
                    <View style={styles.statusStepIconRow}>
                      <View
                        style={[
                          styles.statusStepIcon,
                          {
                            backgroundColor:
                              step.status === 'done'
                                ? '#22C55E'
                                : step.status === 'active'
                                  ? '#F5C542'
                                  : '#EFF2F7',
                            borderWidth: step.status === 'active' ? 2 : 0,
                            borderColor: '#E8A900',
                          },
                        ]}
                      >
                        {step.status === 'done' ? (
                          <CheckCircle2 size={14} color="#ffffff" />
                        ) : step.status === 'active' ? (
                          <Navigation size={12} color="#1B365D" />
                        ) : (
                          <View style={styles.pendingDot} />
                        )}
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.statusStepLabel,
                        {
                          color:
                            step.status === 'done'
                              ? '#22C55E'
                              : step.status === 'active'
                                ? '#1B365D'
                                : '#6B7FA3',
                          fontWeight: step.status === 'active' ? '700' : '500',
                        },
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

          {/* Quick stats */}
          <View style={styles.statsRow}>
            {[
              {
                label: 'Pickup',
                value: '7:12 AM',
                color: '#22C55E',
                Icon: CheckCircle2,
              },
              {
                label: 'En Route',
                value: 'Active',
                color: '#F5C542',
                Icon: Navigation,
              },
              {
                label: 'Arrival',
                value: '7:45 AM',
                color: '#6B7FA3',
                Icon: Clock,
              },
            ].map((stat, i) => {
              const Icon = stat.Icon;
              return (
                <View key={i} style={styles.statCard}>
                  <Icon size={18} color={stat.color} />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              );
            })}
          </View>

          {/* Recent alerts */}
          <View style={styles.alertsSection}>
            <View style={styles.alertsHeader}>
              <Text style={styles.alertsTitle}>Recent Alerts</Text>
              <TouchableOpacity onPress={() => onNavigate('notifications')}>
                <Text style={styles.alertsViewAll}>View all</Text>
              </TouchableOpacity>
            </View>
            {notifications.map((n, i) => (
              <View key={i} style={styles.alertCard}>
                <View
                  style={[
                    styles.alertIcon,
                    { backgroundColor: `${n.color}20` },
                  ]}
                >
                  {n.icon === 'bus' ? (
                    <Bus size={18} color={n.color} />
                  ) : (
                    <CheckCircle2 size={18} color={n.color} />
                  )}
                </View>
                <Text style={styles.alertText}>{n.text}</Text>
                <Text style={styles.alertTime}>{n.time}</Text>
              </View>
            ))}
          </View>

          {/* Emergency contact */}
          <View style={styles.emergencyCard}>
            <AlertCircle size={22} color="#F97316" />
            <View style={styles.emergencyInfo}>
              <Text style={styles.emergencyTitle}>Need help?</Text>
              <Text style={styles.emergencySubtitle}>
                Contact school transport office
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleCallSchool}
              style={styles.emergencyCallButton}
              activeOpacity={0.8}
            >
              <Text style={styles.emergencyCallText}>Call</Text>
            </TouchableOpacity>
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
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F5C542',
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
  childDriver: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mapPreview: {
    height: 144,
    backgroundColor: '#E8F4FD',
  },
  mapGridH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(27,54,93,0.07)',
  },
  mapGridV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(27,54,93,0.07)',
  },
  busMarker: {
    position: 'absolute',
    bottom: 36,
    left: '42%',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1B365D',
    borderWidth: 3,
    borderColor: '#F5C542',
    alignItems: 'center',
    justifyContent: 'center',
  },
  schoolMarker: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#22C55E',
    borderWidth: 3,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#1B365D',
  },
  etaText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#22C55E',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
  },
  liveText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  trackingInfo: {
    padding: 16,
  },
  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  trackingBus: {
    color: '#1B365D',
    fontSize: 16,
    fontWeight: '700',
  },
  trackingDetail: {
    color: '#6B7FA3',
    fontSize: 12,
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
  statusStepIconRow: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusStepIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  statusStepLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  statusStepTime: {
    color: '#6B7FA3',
    fontSize: 10,
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: 'rgba(27,54,93,0.06)',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: '#1B365D',
    fontSize: 13,
    fontWeight: '700',
  },
  statLabel: {
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