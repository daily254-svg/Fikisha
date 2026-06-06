import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
} from 'lucide-react-native';

interface HistoryScreenProps {
  onBack: () => void;
}

interface Trip {
  type: string;
  pickup: string | null;
  arrival: string | null;
  dropoff: string | null;
  status: string;
  statusColor: string;
}

interface DayData {
  date: string;
  trips: Trip[];
}

const historyData: DayData[] = [
  {
    date: 'Wed, 4 Jun 2025',
    trips: [
      {
        type: 'Morning',
        pickup: '7:12 AM',
        arrival: '7:48 AM',
        dropoff: null,
        status: 'In Progress',
        statusColor: '#F5C542',
      },
    ],
  },
  {
    date: 'Tue, 3 Jun 2025',
    trips: [
      {
        type: 'Morning',
        pickup: '7:08 AM',
        arrival: '7:44 AM',
        dropoff: null,
        status: 'Completed',
        statusColor: '#22C55E',
      },
      {
        type: 'Afternoon',
        pickup: '4:15 PM',
        arrival: null,
        dropoff: '4:52 PM',
        status: 'Completed',
        statusColor: '#22C55E',
      },
    ],
  },
  {
    date: 'Mon, 2 Jun 2025',
    trips: [
      {
        type: 'Morning',
        pickup: '7:15 AM',
        arrival: '7:53 AM',
        dropoff: null,
        status: 'Completed',
        statusColor: '#22C55E',
      },
      {
        type: 'Afternoon',
        pickup: '4:18 PM',
        arrival: null,
        dropoff: '4:58 PM',
        status: 'Delayed',
        statusColor: '#F97316',
      },
    ],
  },
  {
    date: 'Fri, 30 May 2025',
    trips: [
      {
        type: 'Morning',
        pickup: '7:10 AM',
        arrival: '7:46 AM',
        dropoff: null,
        status: 'Completed',
        statusColor: '#22C55E',
      },
      {
        type: 'Afternoon',
        pickup: '4:12 PM',
        arrival: null,
        dropoff: '4:48 PM',
        status: 'Completed',
        statusColor: '#22C55E',
      },
    ],
  },
];

export function HistoryScreen({ onBack }: HistoryScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1B365D" translucent />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <ArrowLeft size={18} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transport History</Text>
        </View>

        {/* Stats summary */}
        <View style={styles.statsRow}>
          {[
            { label: 'This Week', value: '8', sub: 'trips' },
            { label: 'On Time', value: '87%', sub: 'rate' },
            { label: 'Avg Pickup', value: '7:11', sub: 'AM' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statDetail}>
                {s.label} · {s.sub}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* History list */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {historyData.map((day, di) => (
          <View key={di} style={styles.daySection}>
            <Text style={styles.dateLabel}>{day.date}</Text>
            {day.trips.map((trip, ti) => (
              <View key={ti} style={styles.tripCard}>
                {/* Trip header */}
                <View style={styles.tripHeader}>
                  <View style={styles.tripTypeRow}>
                    <View
                      style={[
                        styles.tripTypeIcon,
                        {
                          backgroundColor:
                            trip.type === 'Morning' ? '#FFF8E1' : '#EFF2F7',
                        },
                      ]}
                    >
                      {trip.type === 'Morning' ? (
                        <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <Circle cx="7" cy="7" r="3.5" fill="#F5C542" />
                          <Line x1="7" y1="1" x2="7" y2="3" stroke="#F5C542" strokeWidth="1.5" strokeLinecap="round" />
                          <Line x1="7" y1="11" x2="7" y2="13" stroke="#F5C542" strokeWidth="1.5" strokeLinecap="round" />
                          <Line x1="1" y1="7" x2="3" y2="7" stroke="#F5C542" strokeWidth="1.5" strokeLinecap="round" />
                          <Line x1="11" y1="7" x2="13" y2="7" stroke="#F5C542" strokeWidth="1.5" strokeLinecap="round" />
                        </Svg>
                      ) : (
                        <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <Path d="M7 2a5 5 0 0 0 0 10A5 5 0 0 0 7 2zM3 7a4 4 0 0 1 7.5-2" stroke="#6B7FA3" strokeWidth="1.5" fill="none" />
                        </Svg>
                      )}
                    </View>
                    <Text style={styles.tripTypeText}>{trip.type} Route</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${trip.statusColor}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: trip.statusColor },
                      ]}
                    >
                      {trip.status}
                    </Text>
                  </View>
                </View>

                {/* Timeline */}
                <View style={styles.timeline}>
                  <View style={styles.timelineLine} />
                  {trip.pickup && (
                    <View style={styles.timelineItem}>
                      <View style={[styles.timelineDot, { backgroundColor: '#22C55E' }]}>
                        <CheckCircle2 size={13} color="#ffffff" />
                      </View>
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineLabel}>Picked up</Text>
                        <Text style={styles.timelineTime}>{trip.pickup}</Text>
                      </View>
                    </View>
                  )}
                  {trip.arrival && (
                    <View style={styles.timelineItem}>
                      <View style={[styles.timelineDot, { backgroundColor: '#1B365D' }]}>
                        <MapPin size={12} color="#F5C542" />
                      </View>
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineLabel}>School arrival</Text>
                        <Text style={styles.timelineTime}>{trip.arrival}</Text>
                      </View>
                    </View>
                  )}
                  {trip.dropoff && (
                    <View style={styles.timelineItem}>
                      <View style={[styles.timelineDot, { backgroundColor: '#22C55E' }]}>
                        <CheckCircle2 size={13} color="#ffffff" />
                      </View>
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineLabel}>Dropped off home</Text>
                        <Text style={styles.timelineTime}>{trip.dropoff}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Duration */}
                <View style={styles.durationRow}>
                  <Clock size={13} color="#6B7FA3" />
                  <Text style={styles.durationText}>
                    Duration: {trip.type === 'Morning' ? '36 min' : '37 min'} · Bus KCA 345G
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ))}
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
  // Header
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
  // List
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
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
  // Trip card
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
  // Timeline
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
  // Duration
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