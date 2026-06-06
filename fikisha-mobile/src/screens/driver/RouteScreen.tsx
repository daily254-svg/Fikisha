import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Circle, Path } from 'react-native-svg';
import {
  ArrowLeft,
  CheckCircle2,
  Circle as CircleIcon,
  Navigation,
  MapPin,
  Bus,
  Square,
} from 'lucide-react-native';

interface DriverRouteScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

interface Stop {
  name: string;
  students: number;
  time: string;
  status: 'done' | 'active' | 'pending' | 'school';
}

const stops: Stop[] = [
  { name: 'Westlands Stop A', students: 4, time: '6:50 AM', status: 'done' },
  { name: 'Parklands Rd Stop', students: 3, time: '7:00 AM', status: 'done' },
  { name: 'Karen Estate Stop A', students: 5, time: '7:12 AM', status: 'done' },
  { name: 'Karen Estate Stop B', students: 3, time: '7:18 AM', status: 'active' },
  { name: "Lang'ata Road Stop", students: 4, time: '7:28 AM', status: 'pending' },
  { name: 'South C Stop', students: 2, time: '7:36 AM', status: 'pending' },
  { name: 'Nairobi Academy Gate', students: 0, time: '7:48 AM', status: 'school' },
];

export function DriverRouteScreen({ onBack, onNavigate }: DriverRouteScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Map area */}
      <View style={styles.mapContainer}>
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 390 208"
          preserveAspectRatio="xMidYMid slice"
          style={StyleSheet.absoluteFill}
        >
          <Rect width="390" height="208" fill="#E8F4FD" />
          {/* Grid lines */}
          {[40, 100, 160].map((y, i) => (
            <Rect key={`h${i}`} x="0" y={y} width="390" height="1" fill="rgba(255,255,255,0.7)" />
          ))}
          {[60, 130, 200, 270, 340].map((x, i) => (
            <Rect key={`v${i}`} x={x} y="0" width="1" height="208" fill="rgba(255,255,255,0.7)" />
          ))}
          {/* Blocks */}
          <Rect x="62" y="42" width="67" height="57" rx="4" fill="rgba(200,220,240,0.5)" />
          <Rect x="132" y="42" width="67" height="57" rx="4" fill="rgba(200,220,240,0.5)" />
          <Rect x="202" y="42" width="67" height="57" rx="4" fill="rgba(200,220,240,0.5)" />
          <Rect x="62" y="102" width="67" height="57" rx="4" fill="rgba(200,220,240,0.4)" />
          <Rect x="202" y="102" width="67" height="57" rx="4" fill="rgba(200,220,240,0.4)" />
          <Rect x="272" y="42" width="67" height="117" rx="4" fill="rgba(200,220,240,0.45)" />
          {/* Route line - pending */}
          <Path
            d="M30 180 L130 180 L130 100 L200 100 L200 40 L360 40"
            stroke="#F5C542"
            strokeWidth="4"
            fill="none"
            strokeDasharray="10 5"
            strokeLinecap="round"
          />
          {/* Route line - completed */}
          <Path
            d="M30 180 L130 180 L130 100"
            stroke="#22C55E"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          {/* Done stops */}
          <Circle cx="30" cy="180" r="7" fill="#22C55E" />
          <Circle cx="130" cy="180" r="7" fill="#22C55E" />
          <Circle cx="130" cy="100" r="7" fill="#22C55E" />
          {/* Active */}
          <Circle cx="200" cy="100" r="9" fill="#F5C542" />
          <Circle cx="200" cy="100" r="4" fill="#1B365D" />
          {/* Pending */}
          <Circle cx="200" cy="40" r="6" fill="#CBD5E1" />
          <Circle cx="280" cy="40" r="6" fill="#CBD5E1" />
          {/* School */}
          <Circle cx="360" cy="40" r="10" fill="#1B365D" />
          <Path
            d="M360 32L353 37v10h4v-5h6v5h4V37L360 32z"
            fill="#F5C542"
          />
        </Svg>

        {/* Bus marker */}
        <View style={styles.busMarker}>
          <Bus size={18} color="#F5C542" />
        </View>

        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.topBarButton}
            activeOpacity={0.8}
          >
            <ArrowLeft size={20} color="#1B365D" />
          </TouchableOpacity>
          <View style={styles.routeActiveBadge}>
            <Navigation size={14} color="#22C55E" />
            <Text style={styles.routeActiveText}>Route Active</Text>
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

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>Stop 4 of 7</Text>
          <Text style={styles.progressPercent}>43% complete</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '43%' }]} />
        </View>
      </View>

      {/* Stop list */}
      <ScrollView
        style={styles.stopListContainer}
        contentContainerStyle={styles.stopListContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.stopListTitle}>Route Stops</Text>
        {stops.map((stop, i) => (
          <View
            key={i}
            style={[
              styles.stopCard,
              {
                backgroundColor: stop.status === 'active' ? '#FFF8E1' : '#ffffff',
                borderColor:
                  stop.status === 'active'
                    ? 'rgba(245,197,66,0.4)'
                    : 'rgba(27,54,93,0.06)',
              },
            ]}
          >
            {/* Status icon */}
            <View
              style={[
                styles.stopIcon,
                {
                  backgroundColor:
                    stop.status === 'done'
                      ? 'rgba(34,197,94,0.12)'
                      : stop.status === 'active'
                        ? '#F5C542'
                        : stop.status === 'school'
                          ? '#1B365D'
                          : '#EFF2F7',
                },
              ]}
            >
              {stop.status === 'done' ? (
                <CheckCircle2 size={18} color="#22C55E" />
              ) : stop.status === 'active' ? (
                <Navigation size={18} color="#1B365D" />
              ) : stop.status === 'school' ? (
                <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <Path d="M8 1L1 5v10h4V9h6v6h4V5L8 1z" fill="#F5C542" />
                </Svg>
              ) : (
                <CircleIcon size={16} color="#CBD5E1" />
              )}
            </View>

            <View style={styles.stopInfo}>
              <Text
                style={[
                  styles.stopName,
                  {
                    color:
                      stop.status === 'pending' || stop.status === 'school'
                        ? '#6B7FA3'
                        : '#1B365D',
                    fontWeight: stop.status === 'active' ? '700' : '500',
                  },
                ]}
              >
                {stop.name}
              </Text>
              {stop.students > 0 && (
                <Text style={styles.stopStudents}>
                  {stop.students} student{stop.students !== 1 ? 's' : ''}
                </Text>
              )}
            </View>

            <View style={styles.stopTimeContainer}>
              <Text
                style={[
                  styles.stopTime,
                  {
                    color: stop.status === 'active' ? '#1B365D' : '#6B7FA3',
                    fontWeight: stop.status === 'active' ? '700' : '400',
                  },
                ]}
              >
                {stop.time}
              </Text>
              {stop.status === 'done' && (
                <Text style={styles.stopDoneText}>Done</Text>
              )}
              {stop.status === 'active' && (
                <Text style={styles.stopNextText}>Next</Text>
              )}
            </View>
          </View>
        ))}

        {/* End route button */}
        <TouchableOpacity
          onPress={onBack}
          style={styles.endRouteButton}
          activeOpacity={0.8}
        >
          <Square size={18} color="#EF4444" fill="#EF4444" />
          <Text style={styles.endRouteText}>End Route</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  // Map
  mapContainer: {
    height: 208,
    backgroundColor: '#DBEAFE',
    overflow: 'hidden',
  },
  busMarker: {
    position: 'absolute',
    top: 78,
    left: 183,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1B365D',
    borderWidth: 3,
    borderColor: '#F5C542',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  topBar: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
  // Progress
  progressContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27,54,93,0.06)',
  },
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
  },
  stopListContent: {
    padding: 20,
    gap: 8,
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
  stopTimeContainer: {
    alignItems: 'flex-end',
  },
  stopTime: {
    fontSize: 12,
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
  // End route
  endRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 24,
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