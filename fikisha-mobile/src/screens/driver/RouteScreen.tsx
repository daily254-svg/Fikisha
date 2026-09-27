import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  CheckCircle2,
  Circle as CircleIcon,
  Navigation,
  MapPin,
  Play,
  Square,
  ChevronUp,
  ChevronDown,
} from 'lucide-react-native';
import { driversService } from '@/services/drivers.service';
import { trackingService } from '@/services/tracking.service';
import { emitRouteStart, emitRouteEnd, emitGpsUpdate } from '@/lib/socket';
import { useLocation } from '@/hooks/useLocation';
import { RouteMap } from '@/components/RouteMap';
import type { ActiveBusAssignment, RouteStudents, TransportEvent } from '@/types';

interface DriverRouteScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

export function DriverRouteScreen({ onBack, onNavigate }: DriverRouteScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [activeBus, setActiveBus] = useState<ActiveBusAssignment | null>(null);
  const [routeStudents, setRouteStudents] = useState<RouteStudents[]>([]);
  const [pickedUpIds, setPickedUpIds] = useState<Set<string>>(new Set());
  const [routeActive, setRouteActive] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const sheetHeight = useRef(new Animated.Value(200)).current;

  const location = useLocation(routeActive);

  const load = async () => {
    try {
      const [busRes, studentsRes] = await Promise.all([
        driversService.getActiveBus(),
        driversService.getRouteStudents(),
      ]);
      setActiveBus(busRes.data);
      setRouteActive(!!busRes.data?.activeTrip);
      setRouteStudents(studentsRes.data);

      if (busRes.data) {
        const today = new Date().toISOString().slice(0, 10);
        const eventsRes = await trackingService.getTransportEvents({
          busId: busRes.data.bus.id,
          type: 'PICKED_UP',
          date: today,
        });
        setPickedUpIds(new Set(eventsRes.data.map((e: TransportEvent) => e.studentId)));
      }
    } catch (e) {
      console.error('Failed to load route', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Push GPS updates to parents while the route is active.
  useEffect(() => {
    if (!routeActive || !activeBus) return;
    if (location.latitude == null || location.longitude == null) return;

    emitGpsUpdate({
      busId: activeBus.bus.id,
      lat: location.latitude,
      lng: location.longitude,
      speed: location.speed ?? 0,
      heading: location.heading ?? 0,
      updatedAt: new Date().toISOString(),
    });
  }, [routeActive, activeBus, location.latitude, location.longitude]);

  const route = routeStudents[0]?.route ?? activeBus?.bus.routes?.[0];
  const students = routeStudents[0]?.students ?? [];
  const stops = route?.stops ?? [];

  const stopStatus = useMemo(() => {
    const sorted = [...stops].sort((a, b) => a.sequence - b.sequence);
    let foundActive = false;
    return sorted.map((stop) => {
      const stopStudents = students.filter((s) => s.pickupStopId === stop.id);
      const done = stopStudents.length > 0 && stopStudents.every((s) => pickedUpIds.has(s.id));
      let status: 'done' | 'active' | 'pending' = done ? 'done' : 'pending';
      if (!done && !foundActive) {
        status = 'active';
        foundActive = true;
      }
      return { stop, students: stopStudents, status };
    });
  }, [stops, students, pickedUpIds]);

  const doneCount = stopStatus.filter((s) => s.status === 'done').length;
  const totalStops = stopStatus.length;
  const progressPercent = totalStops > 0 ? Math.round((doneCount / totalStops) * 100) : 0;

  const toggleSheet = () => {
    const toValue = sheetExpanded ? 200 : 520;
    Animated.spring(sheetHeight, { toValue, useNativeDriver: false, friction: 8 }).start();
    setSheetExpanded(!sheetExpanded);
  };

  const handleToggleRoute = async () => {
    if (!activeBus || !route) return;
    if (routeActive) {
      await emitRouteEnd(activeBus.bus.id);
      setRouteActive(false);
      onBack();
    } else {
      await emitRouteStart(activeBus.bus.id, route.id);
      setRouteActive(true);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator color="#1B365D" size="large" />
      </SafeAreaView>
    );
  }

  if (!activeBus || !route) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top']}>
        <TouchableOpacity onPress={onBack} style={styles.emptyBackButton} activeOpacity={0.8}>
          <ArrowLeft size={18} color="#1B365D" />
        </TouchableOpacity>
        <Text style={styles.emptyText}>
          You don&apos;t have an assigned bus or route yet.
        </Text>
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
              location.latitude != null && location.longitude != null
                ? { lat: location.latitude, lng: location.longitude, heading: location.heading }
                : null
            }
          />
        </View>

        <View style={styles.topOverlay}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onBack} style={styles.topBarButton} activeOpacity={0.8}>
              <ArrowLeft size={20} color="#1B365D" />
            </TouchableOpacity>
            <View style={styles.routeActiveBadge}>
              <Navigation size={14} color={routeActive ? '#22C55E' : '#6B7FA3'} />
              <Text style={styles.routeActiveText}>
                {routeActive ? 'Route Active' : 'Not Started'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => onNavigate('driver-pickup')}
              style={styles.topBarButton}
              activeOpacity={0.8}
            >
              <MapPin size={18} color="#F5C542" />
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
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>
                {totalStops > 0 ? `${doneCount} of ${totalStops} stops` : 'No stops on this route'}
              </Text>
              <Text style={styles.progressPercent}>{progressPercent}% complete</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>

            <TouchableOpacity
              onPress={handleToggleRoute}
              style={routeActive ? styles.endRouteButton : styles.startRouteButton}
              activeOpacity={0.8}
            >
              {routeActive ? (
                <>
                  <Square size={18} color="#EF4444" fill="#EF4444" />
                  <Text style={styles.endRouteText}>End Route</Text>
                </>
              ) : (
                <>
                  <Play size={18} color="#1B365D" fill="#1B365D" />
                  <Text style={styles.startRouteText}>Start Route</Text>
                </>
              )}
            </TouchableOpacity>

            {sheetExpanded && (
              <ScrollView
                style={styles.stopListContainer}
                contentContainerStyle={styles.stopListContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.stopListTitle}>Route Stops</Text>
                {stopStatus.map(({ stop, students: stopStudents, status }) => (
                  <View
                    key={stop.id}
                    style={[
                      styles.stopCard,
                      {
                        backgroundColor: status === 'active' ? '#FFF8E1' : '#ffffff',
                        borderColor: status === 'active' ? 'rgba(245,197,66,0.4)' : 'rgba(27,54,93,0.06)',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.stopIcon,
                        {
                          backgroundColor:
                            status === 'done'
                              ? 'rgba(34,197,94,0.12)'
                              : status === 'active'
                                ? '#F5C542'
                                : '#EFF2F7',
                        },
                      ]}
                    >
                      {status === 'done' ? (
                        <CheckCircle2 size={18} color="#22C55E" />
                      ) : status === 'active' ? (
                        <Navigation size={18} color="#1B365D" />
                      ) : (
                        <CircleIcon size={16} color="#CBD5E1" />
                      )}
                    </View>

                    <View style={styles.stopInfo}>
                      <Text
                        style={[
                          styles.stopName,
                          {
                            color: status === 'pending' ? '#6B7FA3' : '#1B365D',
                            fontWeight: status === 'active' ? '700' : '500',
                          },
                        ]}
                      >
                        {stop.sequence}. {stop.name}
                      </Text>
                      {stopStudents.length > 0 && (
                        <Text style={styles.stopStudents}>
                          {stopStudents.length} student{stopStudents.length !== 1 ? 's' : ''}
                        </Text>
                      )}
                    </View>

                    {status === 'done' && <Text style={styles.stopDoneText}>Done</Text>}
                    {status === 'active' && <Text style={styles.stopNextText}>Next</Text>}
                  </View>
                ))}
              </ScrollView>
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
    gap: 16,
    paddingHorizontal: 32,
  },
  emptyBackButton: {
    position: 'absolute',
    top: 16,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: '#EFF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#6B7FA3',
    fontSize: 14,
    textAlign: 'center',
  },
  // Map
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
  routeActiveBadge: {
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
  routeActiveText: {
    color: '#1B365D',
    fontSize: 13,
    fontWeight: '700',
  },
  // Bottom sheet
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
  },
  // Progress
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#1B365D',
    fontSize: 13,
    fontWeight: '700',
  },
  progressPercent: {
    color: '#22C55E',
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EFF2F7',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  // Stop list
  stopListContainer: {
    flex: 1,
    marginTop: 16,
  },
  stopListContent: {
    gap: 8,
    paddingBottom: 24,
  },
  stopListTitle: {
    color: '#1B365D',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  stopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
  },
  stopIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    fontSize: 14,
  },
  stopStudents: {
    color: '#6B7FA3',
    fontSize: 11,
    marginTop: 2,
  },
  stopDoneText: {
    color: '#22C55E',
    fontSize: 10,
    fontWeight: '600',
  },
  stopNextText: {
    color: '#F97316',
    fontSize: 10,
    fontWeight: '600',
  },
  // Route toggle
  startRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#F5C542',
  },
  startRouteText: {
    color: '#1B365D',
    fontWeight: '700',
    fontSize: 15,
  },
  endRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  endRouteText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 15,
  },
});
