import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, Sun, Moon } from 'lucide-react-native';
import { trackingService } from '@/services/tracking.service';
import type { TransportEvent } from '@/types';

interface HistoryScreenProps {
  onBack: () => void;
}

type Bucket = 'Morning' | 'Afternoon';

interface Trip {
  bucket: Bucket;
  pickup?: TransportEvent;
  dropoff?: TransportEvent;
  absent?: TransportEvent;
  busRegistration?: string;
}

interface DayGroup {
  dateKey: string;
  dateLabel: string;
  trips: Trip[];
}

function bucketFor(iso: string): Bucket {
  return new Date(iso).getHours() < 13 ? 'Morning' : 'Afternoon';
}

function dateKeyFor(iso: string): string {
  return new Date(iso).toDateString();
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatDateLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function groupIntoDays(events: TransportEvent[]): DayGroup[] {
  const byDate = new Map<string, TransportEvent[]>();
  for (const e of events) {
    const key = dateKeyFor(e.createdAt);
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(e);
  }

  const days: DayGroup[] = [];
  for (const [dateKey, dayEvents] of byDate.entries()) {
    const byBucket = new Map<Bucket, Trip>();
    for (const e of dayEvents) {
      const bucket = bucketFor(e.createdAt);
      const trip = byBucket.get(bucket) ?? { bucket };
      if (e.type === 'PICKED_UP') trip.pickup = e;
      else if (e.type === 'DROPPED_OFF') trip.dropoff = e;
      else if (e.type === 'ABSENT') trip.absent = e;
      trip.busRegistration = e.bus?.registrationNumber ?? trip.busRegistration;
      byBucket.set(bucket, trip);
    }
    const trips = Array.from(byBucket.values()).sort((a, b) =>
      a.bucket === b.bucket ? 0 : a.bucket === 'Morning' ? -1 : 1,
    );
    days.push({ dateKey, dateLabel: formatDateLabel(dayEvents[0].createdAt), trips });
  }

  return days.sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1));
}

function tripStatus(trip: Trip): { label: string; color: string } {
  if (trip.absent) return { label: 'Absent', color: '#EF4444' };
  if (trip.pickup && trip.dropoff) return { label: 'Completed', color: '#22C55E' };
  if (trip.pickup) return { label: 'In Progress', color: '#F5C542' };
  return { label: 'Completed', color: '#22C55E' };
}

export function HistoryScreen({ onBack }: HistoryScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [events, setEvents] = useState<TransportEvent[]>([]);

  const load = async () => {
    try {
      const res = await trackingService.getTransportEvents({ limit: 200 });
      setEvents(res.data);
    } catch (e) {
      console.error('Failed to load transport history', e);
    }
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await load();
      setIsLoading(false);
    })();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  };

  const days = useMemo(() => groupIntoDays(events), [events]);

  const stats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentTrips = days
      .filter((d) => new Date(d.dateKey).getTime() >= weekAgo)
      .flatMap((d) => d.trips);

    const morningPickups = events.filter(
      (e) => e.type === 'PICKED_UP' && bucketFor(e.createdAt) === 'Morning',
    );
    let avgPickup = '—';
    if (morningPickups.length > 0) {
      const avgMinutes =
        morningPickups.reduce((sum, e) => {
          const d = new Date(e.createdAt);
          return sum + d.getHours() * 60 + d.getMinutes();
        }, 0) / morningPickups.length;
      const h = Math.floor(avgMinutes / 60);
      const m = Math.round(avgMinutes % 60);
      const period = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 === 0 ? 12 : h % 12;
      avgPickup = `${h12}:${String(m).padStart(2, '0')} ${period}`;
    }

    return {
      weekTrips: recentTrips.length,
      avgPickup,
    };
  }, [days, events]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1B365D" translucent />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.8}>
            <ArrowLeft size={18} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transport History</Text>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: 'This week', value: String(stats.weekTrips), sub: 'trips' },
            { label: 'Avg pickup', value: stats.avgPickup, sub: '' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statDetail}>{s.sub ? `${s.label} · ${s.sub}` : s.label}</Text>
            </View>
          ))}
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
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        >
          {days.length === 0 && (
            <Text style={styles.emptyText}>No transport history yet.</Text>
          )}
          {days.map((day) => (
            <View key={day.dateKey} style={styles.daySection}>
              <Text style={styles.dateLabel}>{day.dateLabel}</Text>
              {day.trips.map((trip, ti) => {
                const status = tripStatus(trip);
                return (
                  <View key={ti} style={styles.tripCard}>
                    <View style={styles.tripHeader}>
                      <View style={styles.tripTypeRow}>
                        <View
                          style={[
                            styles.tripTypeIcon,
                            { backgroundColor: trip.bucket === 'Morning' ? '#FFF8E1' : '#EFF2F7' },
                          ]}
                        >
                          {trip.bucket === 'Morning' ? (
                            <Sun size={14} color="#F5C542" />
                          ) : (
                            <Moon size={14} color="#6B7FA3" />
                          )}
                        </View>
                        <Text style={styles.tripTypeText}>{trip.bucket} Route</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: `${status.color}20` }]}>
                        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                      </View>
                    </View>

                    <View style={styles.timeline}>
                      <View style={styles.timelineLine} />
                      {trip.absent ? (
                        <View style={styles.timelineItem}>
                          <View style={[styles.timelineDot, { backgroundColor: '#EF4444' }]}>
                            <AlertTriangle size={13} color="#ffffff" />
                          </View>
                          <View style={styles.timelineContent}>
                            <Text style={styles.timelineLabel}>Marked absent</Text>
                            <Text style={styles.timelineTime}>{formatTime(trip.absent.createdAt)}</Text>
                          </View>
                        </View>
                      ) : (
                        <>
                          {trip.pickup && (
                            <View style={styles.timelineItem}>
                              <View style={[styles.timelineDot, { backgroundColor: '#22C55E' }]}>
                                <CheckCircle2 size={13} color="#ffffff" />
                              </View>
                              <View style={styles.timelineContent}>
                                <Text style={styles.timelineLabel}>Picked up</Text>
                                <Text style={styles.timelineTime}>{formatTime(trip.pickup.createdAt)}</Text>
                              </View>
                            </View>
                          )}
                          {trip.dropoff && (
                            <View style={styles.timelineItem}>
                              <View style={[styles.timelineDot, { backgroundColor: '#22C55E' }]}>
                                <CheckCircle2 size={13} color="#ffffff" />
                              </View>
                              <View style={styles.timelineContent}>
                                <Text style={styles.timelineLabel}>Dropped off</Text>
                                <Text style={styles.timelineTime}>{formatTime(trip.dropoff.createdAt)}</Text>
                              </View>
                            </View>
                          )}
                        </>
                      )}
                    </View>

                    {trip.busRegistration && (
                      <View style={styles.durationRow}>
                        <Clock size={13} color="#6B7FA3" />
                        <Text style={styles.durationText}>Bus {trip.busRegistration}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
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
    fontSize: 20,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  statValue: {
    color: '#F5C542',
    fontSize: 19,
    fontWeight: '800',
  },
  statDetail: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
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
  daySection: {
    marginBottom: 20,
  },
  dateLabel: {
    color: '#6B7FA3',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  tripCard: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: 'rgba(27,54,93,0.06)',
    marginBottom: 12,
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tripTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tripTypeIcon: {
    width: 28,
    height: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripTypeText: {
    color: '#1B365D',
    fontSize: 14,
    fontWeight: '700',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timeline: {
    position: 'relative',
    gap: 12,
    marginLeft: 4,
  },
  timelineLine: {
    position: 'absolute',
    left: 12,
    top: 16,
    bottom: 16,
    width: 2,
    backgroundColor: 'rgba(27,54,93,0.08)',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineLabel: {
    color: '#1B365D',
    fontSize: 13,
    fontWeight: '500',
  },
  timelineTime: {
    color: '#1B365D',
    fontSize: 13,
    fontWeight: '700',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(27,54,93,0.06)',
  },
  durationText: {
    color: '#6B7FA3',
    fontSize: 12,
  },
  bottomSpacer: {
    height: 24,
  },
});
