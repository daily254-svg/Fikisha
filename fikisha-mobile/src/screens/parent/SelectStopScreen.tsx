import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Check, Bus, Navigation } from 'lucide-react-native';
import { parentsService } from '@/services/parents.service';
import { routesService } from '@/services/routes.service';
import { useLocation } from '@/hooks/useLocation';
import type { ParentRoute, ParentStudentLink, RouteStop } from '@/types';

interface SelectStopScreenProps {
  onBack: () => void;
}

type Direction = 'MORNING' | 'EVENING';

interface StopOption {
  stop: RouteStop;
  routeId: string;
  routeName: string;
  busRegistration?: string;
  distanceKm: number | null;
}

function haversineKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

export function SelectStopScreen({ onBack }: SelectStopScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [links, setLinks] = useState<ParentStudentLink[]>([]);
  const [routes, setRoutes] = useState<ParentRoute[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [direction, setDirection] = useState<Direction>('MORNING');
  const [savingStopId, setSavingStopId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation(false);

  const load = async () => {
    try {
      const [studentsRes, routesRes] = await Promise.all([
        parentsService.getStudents(),
        routesService.getRoutes(),
      ]);
      setLinks(studentsRes.data);
      setRoutes(routesRes.data);
      setSelectedStudentId((prev) => prev ?? studentsRes.data[0]?.student.id ?? null);
    } catch (e) {
      console.error('Failed to load routes/students', e);
      setError('Could not load routes. Pull to refresh.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectedStudent = links.find((l) => l.student.id === selectedStudentId)?.student ?? null;

  const currentSelection = useMemo(() => {
    const activeRoute = selectedStudent?.routes?.find(
      (r) => r.active && r.route?.direction === direction,
    );
    return {
      routeId: activeRoute?.routeId ?? null,
      stopId: direction === 'MORNING' ? activeRoute?.pickupStopId : activeRoute?.dropoffStopId,
    };
  }, [selectedStudent, direction]);

  const stopOptions: StopOption[] = useMemo(() => {
    const options: StopOption[] = [];
    for (const route of routes) {
      if (route.direction !== direction) continue;
      for (const stop of route.stops) {
        options.push({
          stop,
          routeId: route.id,
          routeName: route.name,
          busRegistration: route.bus?.registrationNumber,
          distanceKm:
            location.latitude != null && location.longitude != null
              ? haversineKm(location.latitude, location.longitude, stop.latitude, stop.longitude)
              : null,
        });
      }
    }
    return options.sort((a, b) => {
      if (a.distanceKm == null && b.distanceKm == null) return a.stop.name.localeCompare(b.stop.name);
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });
  }, [routes, direction, location.latitude, location.longitude]);

  const handleSelectStop = async (option: StopOption) => {
    if (!selectedStudent) return;
    setSavingStopId(option.stop.id);
    setError(null);
    try {
      await routesService.selectRoute(selectedStudent.id, {
        routeId: option.routeId,
        ...(direction === 'MORNING'
          ? { pickupStopId: option.stop.id }
          : { dropoffStopId: option.stop.id }),
      });
      await load();
    } catch (e) {
      console.error('Failed to select stop', e);
      setError('Could not save your selection. Try again.');
    } finally {
      setSavingStopId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1B365D" translucent />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.8}>
            <ArrowLeft size={18} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose a Stop</Text>
        </View>

        {links.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childRow}>
            {links.map((link) => {
              const isActive = link.student.id === selectedStudentId;
              return (
                <TouchableOpacity
                  key={link.student.id}
                  onPress={() => setSelectedStudentId(link.student.id)}
                  style={[styles.childChip, isActive && styles.childChipActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.childChipText, isActive && styles.childChipTextActive]}>
                    {link.student.firstName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.directionRow}>
          {(['MORNING', 'EVENING'] as Direction[]).map((d) => {
            const isActive = direction === d;
            return (
              <TouchableOpacity
                key={d}
                onPress={() => setDirection(d)}
                style={[styles.directionTab, isActive && styles.directionTabActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.directionTabText, isActive && styles.directionTabTextActive]}>
                  {d === 'MORNING' ? 'Morning pickup' : 'Afternoon drop-off'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#1B365D" size="large" />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!selectedStudent && (
            <Text style={styles.emptyText}>No child linked to your account yet.</Text>
          )}

          {selectedStudent && location.error && (
            <View style={styles.hintCard}>
              <Navigation size={14} color="#F97316" />
              <Text style={styles.hintText}>
                Enable location to sort stops by distance — showing all stops for now.
              </Text>
            </View>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}

          {selectedStudent && stopOptions.length === 0 && (
            <Text style={styles.emptyText}>
              No {direction === 'MORNING' ? 'morning' : 'afternoon'} routes have been set up yet.
            </Text>
          )}

          {selectedStudent &&
            stopOptions.map((option) => {
              const isSelected =
                option.routeId === currentSelection.routeId &&
                option.stop.id === currentSelection.stopId;
              const isSaving = savingStopId === option.stop.id;
              return (
                <TouchableOpacity
                  key={option.stop.id}
                  onPress={() => handleSelectStop(option)}
                  disabled={isSaving}
                  style={[styles.stopCard, isSelected && styles.stopCardSelected]}
                  activeOpacity={0.8}
                >
                  <View style={[styles.stopIcon, isSelected && styles.stopIconSelected]}>
                    {isSaving ? (
                      <ActivityIndicator size="small" color={isSelected ? '#1B365D' : '#6B7FA3'} />
                    ) : isSelected ? (
                      <Check size={16} color="#1B365D" />
                    ) : (
                      <MapPin size={16} color="#6B7FA3" />
                    )}
                  </View>
                  <View style={styles.stopInfo}>
                    <Text style={styles.stopName}>{option.stop.name}</Text>
                    <View style={styles.stopMetaRow}>
                      <Text style={styles.stopMeta}>{option.routeName}</Text>
                      {option.busRegistration && (
                        <View style={styles.stopBusRow}>
                          <Bus size={11} color="#6B7FA3" />
                          <Text style={styles.stopMeta}>{option.busRegistration}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {option.distanceKm != null && (
                    <Text style={styles.stopDistance}>
                      {option.distanceKm < 1
                        ? `${Math.round(option.distanceKm * 1000)} m`
                        : `${option.distanceKm.toFixed(1)} km`}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    backgroundColor: '#1B365D',
    paddingTop: 20,
    paddingBottom: 16,
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
    fontSize: 20,
    fontWeight: '700',
  },
  childRow: {
    marginBottom: 12,
  },
  childChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 8,
  },
  childChipActive: {
    backgroundColor: '#F5C542',
  },
  childChipText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  childChipTextActive: {
    color: '#1B365D',
  },
  directionRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 4,
  },
  directionTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  directionTabActive: {
    backgroundColor: '#ffffff',
  },
  directionTabText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  directionTabTextActive: {
    color: '#1B365D',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  emptyText: {
    color: '#6B7FA3',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.2)',
    marginBottom: 12,
  },
  hintText: {
    flex: 1,
    color: '#9A3412',
    fontSize: 12,
    lineHeight: 16,
  },
  stopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: 'rgba(27,54,93,0.06)',
    marginBottom: 10,
  },
  stopCardSelected: {
    borderColor: '#F5C542',
    backgroundColor: '#FFFBEB',
  },
  stopIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F7F9FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopIconSelected: {
    backgroundColor: '#FFF3C4',
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    color: '#1B365D',
    fontSize: 14,
    fontWeight: '700',
  },
  stopMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  stopBusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stopMeta: {
    color: '#6B7FA3',
    fontSize: 11,
  },
  stopDistance: {
    color: '#1B365D',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 24,
  },
});
