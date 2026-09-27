import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  User2,
  MapPin,
  Search,
  AlertTriangle,
} from 'lucide-react-native';
import { driversService } from '@/services/drivers.service';
import { trackingService } from '@/services/tracking.service';
import { emitStudentPickup, emitStudentAbsent } from '@/lib/socket';
import { useLocation } from '@/hooks/useLocation';
import type { ActiveBusAssignment, RouteStudents, TransportEvent } from '@/types';

interface DriverPickupScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

type Status = 'picked' | 'pending' | 'absent';

const statusColors: Record<Status, { bg: string; text: string; label: string }> = {
  picked: { bg: '#F0FDF4', text: '#22C55E', label: 'Picked Up' },
  pending: { bg: '#FFF8E1', text: '#F97316', label: 'Pending' },
  absent: { bg: '#FEF2F2', text: '#EF4444', label: 'Absent' },
};

export function DriverPickupScreen({ onBack, onNavigate }: DriverPickupScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [activeBus, setActiveBus] = useState<ActiveBusAssignment | null>(null);
  const [routeStudents, setRouteStudents] = useState<RouteStudents[]>([]);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [statusError, setStatusError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [search, setSearch] = useState('');
  const location = useLocation(false);

  useEffect(() => {
    (async () => {
      try {
        const [busRes, studentsRes] = await Promise.all([
          driversService.getActiveBus(),
          driversService.getRouteStudents(),
        ]);
        setActiveBus(busRes.data);
        setRouteStudents(studentsRes.data);

        if (busRes.data) {
          const today = new Date().toISOString().slice(0, 10);
          const eventsRes = await trackingService.getTransportEvents({
            busId: busRes.data.bus.id,
            date: today,
          });
          const initial: Record<string, Status> = {};
          for (const event of eventsRes.data as TransportEvent[]) {
            if (event.type === 'PICKED_UP') initial[event.studentId] = 'picked';
            else if (event.type === 'ABSENT') initial[event.studentId] = 'absent';
          }
          setStatuses(initial);
        }
      } catch (e) {
        console.error('Failed to load pickup list', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const route = routeStudents[0]?.route;
  const students = routeStudents[0]?.students ?? [];
  const routeActive = !!activeBus?.activeTrip;
  const stopNameById = useMemo(() => {
    const map = new Map<string, string>();
    (route?.stops ?? []).forEach((s) => map.set(s.id, s.name));
    return map;
  }, [route]);

  const statusOf = (studentId: string): Status => statuses[studentId] ?? 'pending';

  const setStatus = async (studentId: string, status: Status) => {
    if (!routeActive || !activeBus) return;
    const previous = statuses[studentId];
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
    setStatusError(null);
    const lat = location.latitude ?? undefined;
    const lng = location.longitude ?? undefined;
    try {
      if (status === 'picked') {
        await emitStudentPickup(activeBus.bus.id, studentId, lat, lng);
      } else if (status === 'absent') {
        await emitStudentAbsent(activeBus.bus.id, studentId, lat, lng);
      }
    } catch (e: any) {
      console.error('Failed to update student status', e);
      setStatuses((prev) => ({ ...prev, [studentId]: previous ?? 'pending' }));
      setStatusError(e?.message ?? 'Failed to update. Try again.');
    }
  };

  const filtered = students.filter((s) => {
    const stopName = s.pickupStopId ? stopNameById.get(s.pickupStopId) ?? '' : '';
    const matchesFilter = filter === 'all' || statusOf(s.id) === filter;
    const query = search.toLowerCase();
    const matchesSearch =
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(query) ||
      stopName.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  const counts = {
    picked: students.filter((s) => statusOf(s.id) === 'picked').length,
    pending: students.filter((s) => statusOf(s.id) === 'pending').length,
    absent: students.filter((s) => statusOf(s.id) === 'absent').length,
  };

  const statusKeys: Status[] = ['picked', 'pending', 'absent'];

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator color="#1B365D" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.8}>
            <ArrowLeft size={18} color="#ffffff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Student Pickup</Text>
            <Text style={styles.headerSubtitle}>
              {route ? route.name : 'No route assigned'}
              {activeBus ? ` · ${activeBus.bus.registrationNumber}` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {statusKeys.map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => setFilter(filter === key ? 'all' : key)}
              style={[
                styles.statCard,
                {
                  backgroundColor: filter === key ? statusColors[key].text : 'rgba(255,255,255,0.1)',
                  borderWidth: filter === key ? 0 : 1,
                  borderColor: 'rgba(255,255,255,0.15)',
                },
              ]}
              activeOpacity={0.8}
            >
              <Text style={styles.statCount}>{counts[key]}</Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: filter === key ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)' },
                ]}
              >
                {statusColors[key].label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {!routeActive && (
        <View style={styles.notStartedBanner}>
          <AlertTriangle size={16} color="#F97316" />
          <Text style={styles.notStartedText}>
            Start your route before marking pickups.
          </Text>
          <TouchableOpacity
            onPress={() => onNavigate('driver-route')}
            style={styles.notStartedButton}
            activeOpacity={0.8}
          >
            <Text style={styles.notStartedButtonText}>Go to Route</Text>
          </TouchableOpacity>
        </View>
      )}

      {statusError && (
        <View style={styles.statusErrorBanner}>
          <AlertTriangle size={16} color="#EF4444" />
          <Text style={styles.statusErrorText}>{statusError}</Text>
        </View>
      )}

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={16} color="#6B7FA3" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search students or stops..."
            placeholderTextColor="#A0B0C8"
            style={styles.searchInput}
            autoCapitalize="none"
          />
        </View>
      </View>

      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {students.length === 0 && (
          <Text style={styles.emptyText}>No students assigned to your route yet.</Text>
        )}
        {filtered.map((student) => {
          const status = statusOf(student.id);
          const sc = statusColors[status];
          const stopName = student.pickupStopId ? stopNameById.get(student.pickupStopId) : undefined;
          return (
            <View
              key={student.id}
              style={[
                styles.studentCard,
                {
                  borderColor:
                    status === 'pending'
                      ? 'rgba(27,54,93,0.06)'
                      : status === 'picked'
                        ? 'rgba(34,197,94,0.2)'
                        : 'rgba(239,68,68,0.2)',
                },
              ]}
            >
              <View style={styles.studentRow}>
                <View style={[styles.avatar, { backgroundColor: sc.bg }]}>
                  <User2 size={24} color={sc.text} />
                </View>

                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>
                    {student.firstName} {student.lastName}
                  </Text>
                  {stopName && (
                    <View style={styles.studentStop}>
                      <MapPin size={12} color="#6B7FA3" />
                      <Text style={styles.studentStopText}>{stopName}</Text>
                    </View>
                  )}
                </View>

                <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
                </View>
              </View>

              {status !== 'picked' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    onPress={() => setStatus(student.id, 'picked')}
                    disabled={!routeActive}
                    style={[styles.pickupButton, !routeActive && styles.actionButtonDisabled]}
                    activeOpacity={0.8}
                  >
                    <CheckCircle2 size={18} color="#ffffff" />
                    <Text style={styles.pickupButtonText}>Picked Up</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setStatus(student.id, 'absent')}
                    disabled={!routeActive}
                    style={[styles.absentButton, !routeActive && styles.actionButtonDisabled]}
                    activeOpacity={0.8}
                  >
                    <XCircle size={18} color="#EF4444" />
                    <Text style={styles.absentButtonText}>Absent</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
        <View style={styles.bottomSpacer} />
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
  header: {
    backgroundColor: '#1B365D',
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
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
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  statCount: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
  },
  notStartedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFF7ED',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(249,115,22,0.15)',
  },
  notStartedText: {
    flex: 1,
    color: '#9A3412',
    fontSize: 12,
    fontWeight: '500',
  },
  notStartedButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F97316',
  },
  notStartedButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  statusErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FEF2F2',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239,68,68,0.15)',
  },
  statusErrorText: {
    flex: 1,
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '500',
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27,54,93,0.06)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F7F9FC',
    borderWidth: 1.5,
    borderColor: 'rgba(27,54,93,0.08)',
  },
  searchInput: {
    flex: 1,
    color: '#1B365D',
    fontSize: 14,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  emptyText: {
    color: '#6B7FA3',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  studentCard: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    color: '#1B365D',
    fontSize: 15,
    fontWeight: '700',
  },
  studentStop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  studentStopText: {
    color: '#6B7FA3',
    fontSize: 11,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pickupButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#22C55E',
  },
  pickupButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  absentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  absentButtonText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 14,
  },
  bottomSpacer: {
    height: 24,
  },
});
