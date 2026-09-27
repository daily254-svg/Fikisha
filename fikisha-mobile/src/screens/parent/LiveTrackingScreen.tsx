import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Linking,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Phone,
  Bus,
  Gauge,
  RefreshCw,
  ChevronUp,
  ChevronDown,
} from 'lucide-react-native';
import { parentsService } from '@/services/parents.service';
import { schoolsService, School } from '@/services/schools.service';
import { useTracking } from '@/hooks/useTracking';
import { useAuthStore } from '@/store/auth.store';
import { RouteMap } from '@/components/RouteMap';
import type { Student } from '@/types';

interface LiveTrackingScreenProps {
  onBack: () => void;
}

function timeAgo(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.round(mins / 60)}h ago`;
}

export function LiveTrackingScreen({ onBack }: LiveTrackingScreenProps) {
  const { user } = useAuthStore();
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const sheetHeight = useRef(new Animated.Value(220)).current;

  const [isLoading, setIsLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [busId, setBusId] = useState<string | null>(null);
  const [busRegistration, setBusRegistration] = useState<string | null>(null);
  const [school, setSchool] = useState<School | null>(null);

  const { liveLocation, dbLocation, isLive } = useTracking(busId);

  const load = async () => {
    try {
      const [studentsRes] = await Promise.all([parentsService.getStudents()]);
      const first = studentsRes.data[0]?.student ?? null;
      setStudent(first);

      if (first) {
        const routeBus = first.routes?.[0]?.route?.bus;
        if (routeBus) {
          setBusId(routeBus.id);
          setBusRegistration(routeBus.registrationNumber);
        } else {
          const busRes = await parentsService.getStudentBus(first.id);
          setBusId(busRes.data.bus?.id ?? null);
          setBusRegistration(busRes.data.bus?.registrationNumber ?? null);
        }
      }

      if (user?.schoolId) {
        const schoolRes = await schoolsService.getSchool(user.schoolId);
        setSchool(schoolRes.data);
      }
    } catch (e) {
      console.error('Failed to load live tracking', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleSheet = () => {
    const toValue = sheetExpanded ? 220 : 380;
    Animated.spring(sheetHeight, { toValue, useNativeDriver: false, friction: 8 }).start();
    setSheetExpanded(!sheetExpanded);
  };

  const handleCallSchool = () => {
    if (school?.phone) Linking.openURL(`tel:${school.phone}`);
  };

  const stops = student?.routes?.[0]?.route?.stops ?? [];
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
      <StatusBar barStyle="dark-content" backgroundColor="#E8F4FD" translucent />
      <View style={styles.container}>
        <View style={styles.mapContainer}>
          <RouteMap
            stops={stops.map((s) => ({
              id: s.id,
              name: s.name,
              latitude: s.latitude,
              longitude: s.longitude,
              sequence: s.sequence,
            }))}
            busLocation={
              location ? { lat: location.lat, lng: location.lng, heading: location.heading } : null
            }
          />
        </View>

        <View style={styles.topOverlay}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onBack} style={styles.topBarButton} activeOpacity={0.8}>
              <ArrowLeft size={20} color="#1B365D" />
            </TouchableOpacity>
            <View style={styles.liveBadge}>
              <View style={[styles.liveDot, { backgroundColor: isLive ? '#22C55E' : '#CBD5E1' }]} />
              <Text style={styles.liveBadgeText}>{isLive ? 'LIVE TRACKING' : 'LAST KNOWN LOCATION'}</Text>
            </View>
            <TouchableOpacity onPress={load} style={styles.topBarButton} activeOpacity={0.8}>
              <RefreshCw size={18} color="#1B365D" />
            </TouchableOpacity>
          </View>
        </View>

        <Animated.View style={[styles.bottomSheet, { height: sheetHeight }]}>
          <TouchableOpacity onPress={toggleSheet} style={styles.sheetHandle} activeOpacity={0.8}>
            <View style={styles.sheetHandleBar} />
            {sheetExpanded ? (
              <ChevronDown size={16} color="#6B7FA3" />
            ) : (
              <ChevronUp size={16} color="#6B7FA3" />
            )}
          </TouchableOpacity>

          <View style={styles.sheetContent}>
            <View style={styles.busInfoRow}>
              <View>
                <Text style={styles.busPlate}>{busRegistration ?? 'No bus assigned'}</Text>
                {student && (
                  <Text style={styles.busDriver}>
                    {student.firstName} {student.lastName}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.statsRow}>
              {[
                {
                  label: 'Speed',
                  value: isLive && liveLocation ? `${Math.round(liveLocation.speed)} km/h` : '—',
                  Icon: Gauge,
                  color: '#1B365D',
                },
                {
                  label: 'Status',
                  value: isLive ? 'Live' : 'Idle',
                  Icon: Bus,
                  color: isLive ? '#22C55E' : '#6B7FA3',
                },
                {
                  label: 'Updated',
                  value: location ? timeAgo(location.updatedAt) : 'No data',
                  Icon: RefreshCw,
                  color: '#22C55E',
                },
              ].map((stat, i) => {
                const Icon = stat.Icon;
                return (
                  <View key={i} style={styles.statCard}>
                    <Icon size={16} color={stat.color} />
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                );
              })}
            </View>

            {sheetExpanded && (
              <>
                <View style={styles.upcomingStops}>
                  <Text style={styles.upcomingStopsTitle}>Route Stops</Text>
                  {stops.length === 0 && (
                    <Text style={styles.noStopsText}>No stops configured for this route.</Text>
                  )}
                  {[...stops]
                    .sort((a, b) => a.sequence - b.sequence)
                    .map((stop) => (
                      <View key={stop.id} style={styles.stopItem}>
                        <View style={styles.stopDot} />
                        <Text style={styles.stopName}>{stop.name}</Text>
                      </View>
                    ))}
                </View>

                {school?.phone && (
                  <TouchableOpacity
                    onPress={handleCallSchool}
                    style={styles.contactButton}
                    activeOpacity={0.8}
                  >
                    <Phone size={18} color="#1B365D" />
                    <Text style={styles.contactButtonText}>Contact School</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4FD',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    flex: 1,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  topBarButton: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveBadgeText: {
    color: '#1B365D',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 30,
    zIndex: 20,
  },
  sheetHandle: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  sheetHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 8,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 2,
    flex: 1,
    paddingBottom: 16,
  },
  busInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  busPlate: {
    color: '#1B365D',
    fontSize: 18,
    fontWeight: '700',
  },
  busDriver: {
    color: '#6B7FA3',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#F7F9FC',
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
  upcomingStops: {
    marginBottom: 9,
  },
  upcomingStopsTitle: {
    color: '#1B365D',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  noStopsText: {
    color: '#6B7FA3',
    fontSize: 13,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  stopDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F5C542',
  },
  stopName: {
    flex: 1,
    color: '#1B365D',
    fontSize: 13,
    fontWeight: '500',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F5C542',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  contactButtonText: {
    color: '#1B365D',
    fontWeight: '700',
    fontSize: 15,
  },
});
