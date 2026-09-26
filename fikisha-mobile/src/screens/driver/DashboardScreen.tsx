import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  MapPin,
  Users,
  Play,
  ChevronRight,
  Bus,
  AlertTriangle,
  User2,
} from 'lucide-react-native';
import { driversService } from '@/services/drivers.service';
import { trackingService } from '@/services/tracking.service';
import type { DriverProfile, ActiveBusAssignment, RouteStudents } from '@/types';

interface DriverDashboardProps {
  onNavigate: (screen: string) => void;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function DriverDashboard({ onNavigate }: DriverDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [activeBus, setActiveBus] = useState<ActiveBusAssignment | null>(null);
  const [routeStudents, setRouteStudents] = useState<RouteStudents[]>([]);
  const [pickedUpToday, setPickedUpToday] = useState(0);
  const [absentToday, setAbsentToday] = useState(0);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [profileRes, busRes, studentsRes] = await Promise.all([
          driversService.getProfile(),
          driversService.getActiveBus(),
          driversService.getRouteStudents(),
        ]);
        if (!mounted) return;

        setDriver(profileRes.data);
        setActiveBus(busRes.data);
        setRouteStudents(studentsRes.data);

        if (busRes.data) {
          const today = new Date().toISOString().slice(0, 10);
          const eventsRes = await trackingService.getTransportEvents({
            busId: busRes.data.bus.id,
            date: today,
          });
          if (!mounted) return;

          const pickedUpIds = new Set(
            eventsRes.data.filter((e) => e.type === 'PICKED_UP').map((e) => e.studentId)
          );
          const absentIds = new Set(
            eventsRes.data.filter((e) => e.type === 'ABSENT').map((e) => e.studentId)
          );
          setPickedUpToday(pickedUpIds.size);
          setAbsentToday(absentIds.size);
        }
      } catch (e) {
        console.error('Failed to load driver dashboard', e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const driverName = driver?.user?.name || 'Driver';
  const bus = activeBus?.bus;
  const route = bus?.routes?.[0];
  const totalStudents = routeStudents.reduce((sum, r) => sum + r.students.length, 0);
  const pendingToday = Math.max(totalStudents - pickedUpToday - absentToday, 0);
  const pickupPercent = totalStudents > 0 ? Math.round((pickedUpToday / totalStudents) * 100) : 0;

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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.profileSection}
              onPress={() => onNavigate('driver-profile')}
              activeOpacity={0.8}
            >
              <View style={styles.avatar}>
                <User2 size={24} color="#1B365D" />
              </View>
              <View>
                <Text style={styles.greeting}>{greeting()}</Text>
                <Text style={styles.driverName}>{driverName}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onNavigate('driver-notifications')}
              style={styles.notificationButton}
              activeOpacity={0.8}
            >
              <Bell size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Bus card */}
          {bus ? (
            <View style={styles.busCard}>
              <View style={styles.busCardTop}>
                <View>
                  <Text style={styles.busLabel}>Assigned Vehicle</Text>
                  <Text style={styles.busPlate}>{bus.registrationNumber}</Text>
                </View>
              </View>
              <View style={styles.busStats}>
                {[
                  { label: 'Capacity', value: bus.capacity ? String(bus.capacity) : '—' },
                  { label: 'Students', value: String(totalStudents) },
                  { label: 'Stops', value: String(route?.stops?.length ?? 0) },
                ].map((s, i) => (
                  <View key={i} style={styles.busStat}>
                    <Text style={styles.busStatValue}>{s.value}</Text>
                    <Text style={styles.busStatLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.busCard}>
              <Text style={styles.noBusText}>
                You haven't been assigned to a bus yet. Contact your school
                administrator.
              </Text>
            </View>
          )}
        </View>

        {/* Body */}
        <View style={styles.body}>
          {route && (
            <View style={styles.routeCard}>
              <View style={styles.routeCardHeader}>
                <View>
                  <Text style={styles.routeLabel}>
                    {route.direction === 'MORNING' ? "TODAY'S MORNING ROUTE" : "TODAY'S EVENING ROUTE"}
                  </Text>
                  <Text style={styles.routeName}>{route.name}</Text>
                </View>
                <View style={styles.routeIcon}>
                  <MapPin size={20} color="#F5C542" />
                </View>
              </View>

              <View style={styles.routeGrid}>
                <View style={styles.routeGridItem}>
                  <View style={styles.routeGridIcon}>
                    <Users size={16} color="#1B365D" />
                  </View>
                  <View>
                    <Text style={styles.routeGridLabel}>Students</Text>
                    <Text style={styles.routeGridValue}>{totalStudents} assigned</Text>
                  </View>
                </View>
                <View style={styles.routeGridItem}>
                  <View style={styles.routeGridIcon}>
                    <MapPin size={16} color="#1B365D" />
                  </View>
                  <View>
                    <Text style={styles.routeGridLabel}>First Stop</Text>
                    <Text style={styles.routeGridValue}>
                      {route.stops?.[0]?.name ?? '—'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={() => onNavigate('driver-route')}
                  style={[styles.actionButton, styles.startButton]}
                  activeOpacity={0.8}
                >
                  <Play size={20} color="#1B365D" fill="#1B365D" />
                  <Text style={styles.startButtonText}>Start Route</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onNavigate('driver-pickup')}
                  style={[styles.actionButton, styles.studentsButton]}
                  activeOpacity={0.8}
                >
                  <Users size={20} color="#1B365D" />
                  <Text style={styles.studentsButtonText}>Students</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Pickup Progress */}
          {totalStudents > 0 && (
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Today's Pickup Progress</Text>
                <TouchableOpacity onPress={() => onNavigate('driver-pickup')}>
                  <Text style={styles.progressViewAll}>View all</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarLabels}>
                  <Text style={styles.progressBarText}>
                    {pickedUpToday} of {totalStudents} picked up
                  </Text>
                  <Text style={styles.progressBarPercent}>{pickupPercent}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${pickupPercent}%` }]} />
                </View>
              </View>

              <View style={styles.progressStats}>
                {[
                  { label: 'Picked Up', count: pickedUpToday, color: '#22C55E' },
                  { label: 'Pending', count: pendingToday, color: '#F5C542' },
                  { label: 'Absent', count: absentToday, color: '#EF4444' },
                ].map((s, i) => (
                  <View
                    key={i}
                    style={[styles.progressStat, { backgroundColor: `${s.color}15` }]}
                  >
                    <Text style={[styles.progressStatCount, { color: s.color }]}>
                      {s.count}
                    </Text>
                    <Text style={styles.progressStatLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Report incident */}
          <TouchableOpacity
            onPress={() => onNavigate('driver-incident')}
            style={styles.incidentButton}
            activeOpacity={0.8}
          >
            <View style={styles.incidentIcon}>
              <AlertTriangle size={20} color="#F97316" />
            </View>
            <View style={styles.incidentContent}>
              <Text style={styles.incidentTitle}>Report an Incident</Text>
              <Text style={styles.incidentSubtitle}>
                Delays, mechanical issues, emergencies
              </Text>
            </View>
            <ChevronRight size={18} color="#CBD5E1" />
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
  },
  // Header
  header: {
    backgroundColor: '#1B365D',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F5C542',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  driverName: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '700',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Bus card
  busCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  noBusText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    lineHeight: 19,
  },
  busCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  busLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
  },
  busPlate: {
    color: '#F5C542',
    fontSize: 19,
    fontWeight: '800',
  },
  busStats: {
    flexDirection: 'row',
    gap: 16,
  },
  busStat: {},
  busStatValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  busStatLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
  },
  // Body
  body: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  // Route card
  routeCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: 'rgba(27,54,93,0.06)',
  },
  routeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  routeLabel: {
    color: '#6B7FA3',
    fontSize: 12,
    fontWeight: '600',
  },
  routeName: {
    color: '#1B365D',
    fontSize: 18,
    fontWeight: '700',
  },
  routeIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  routeGridItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F7F9FC',
  },
  routeGridIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#EFF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeGridLabel: {
    color: '#6B7FA3',
    fontSize: 10,
  },
  routeGridValue: {
    color: '#1B365D',
    fontSize: 13,
    fontWeight: '600',
  },
  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  startButton: {
    backgroundColor: '#F5C542',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonText: {
    color: '#1B365D',
    fontWeight: '700',
    fontSize: 15,
  },
  studentsButton: {
    backgroundColor: '#EFF2F7',
  },
  studentsButtonText: {
    color: '#1B365D',
    fontWeight: '700',
    fontSize: 15,
  },
  // Progress card
  progressCard: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: 'rgba(27,54,93,0.06)',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressTitle: {
    color: '#1B365D',
    fontSize: 15,
    fontWeight: '700',
  },
  progressViewAll: {
    color: '#F5C542',
    fontSize: 13,
    fontWeight: '600',
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressBarText: {
    color: '#6B7FA3',
    fontSize: 12,
  },
  progressBarPercent: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EFF2F7',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#22C55E',
  },
  progressStats: {
    flexDirection: 'row',
    gap: 8,
  },
  progressStat: {
    flex: 1,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
  },
  progressStatCount: {
    fontSize: 18,
    fontWeight: '800',
  },
  progressStatLabel: {
    color: '#6B7FA3',
    fontSize: 10,
  },
  // Incident button
  incidentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: 'rgba(249,115,22,0.2)',
    marginBottom: 32,
  },
  incidentIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: 'rgba(249,115,22,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  incidentContent: {
    flex: 1,
  },
  incidentTitle: {
    color: '#1B365D',
    fontSize: 14,
    fontWeight: '700',
  },
  incidentSubtitle: {
    color: '#6B7FA3',
    fontSize: 12,
  },
});
