import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Linking,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Circle, Path } from 'react-native-svg';
import {
  ArrowLeft,
  Phone,
  Bus,
  MapPin,
  Clock,
  Gauge,
  RefreshCw,
  ChevronUp,
  ChevronDown,
} from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LiveTrackingScreenProps {
  onBack: () => void;
}

export function LiveTrackingScreen({ onBack }: LiveTrackingScreenProps) {
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const sheetHeight = useRef(new Animated.Value(220)).current;

  const toggleSheet = () => {
    const toValue = sheetExpanded ? 220 : 360;
    Animated.spring(sheetHeight, {
      toValue,
      useNativeDriver: false,
      friction: 8,
    }).start();
    setSheetExpanded(!sheetExpanded);
  };

  const handleCallSchool = () => {
    Linking.openURL(
      Platform.OS === 'android' ? 'tel:+254700000000' : 'telprompt:+254700000000',
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F4FD" translucent />
      <View style={styles.container}>
        {/* Map background */}
        <View style={styles.mapContainer}>
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 390 700"
            preserveAspectRatio="xMidYMid slice"
            style={StyleSheet.absoluteFill}
          >
            {/* Background */}
            <Rect width="390" height="700" fill="#E8F4FD" />

            {/* Grid streets */}
            {[50, 120, 200, 280, 360, 440, 520, 600].map((y, i) => (
              <Rect key={`h${i}`} x="0" y={y} width="390" height="1.5" fill="rgba(255,255,255,0.8)" />
            ))}
            {[50, 110, 175, 240, 310, 370].map((x, i) => (
              <Rect key={`v${i}`} x={x} y="0" width="1.5" height="700" fill="rgba(255,255,255,0.8)" />
            ))}

            {/* Block fills */}
            <Rect x="52" y="122" width="57" height="77" rx="4" fill="rgba(200,220,240,0.5)" />
            <Rect x="112" y="52" width="62" height="67" rx="4" fill="rgba(200,220,240,0.5)" />
            <Rect x="177" y="122" width="62" height="77" rx="4" fill="rgba(200,220,240,0.5)" />
            <Rect x="242" y="52" width="67" height="67" rx="4" fill="rgba(200,220,240,0.5)" />
            <Rect x="52" y="202" width="57" height="77" rx="4" fill="rgba(200,220,240,0.5)" />
            <Rect x="177" y="202" width="62" height="77" rx="4" fill="rgba(200,220,240,0.5)" />
            <Rect x="242" y="202" width="67" height="77" rx="4" fill="rgba(200,220,240,0.4)" />
            <Rect x="312" y="122" width="77" height="77" rx="4" fill="rgba(180,210,235,0.5)" />
            <Rect x="52" y="282" width="57" height="77" rx="4" fill="rgba(200,220,240,0.5)" />
            <Rect x="112" y="282" width="62" height="77" rx="4" fill="rgba(200,220,240,0.4)" />
            <Rect x="242" y="282" width="67" height="77" rx="4" fill="rgba(200,220,240,0.5)" />
            <Rect x="312" y="202" width="77" height="77" rx="4" fill="rgba(200,220,240,0.5)" />

            {/* Route path */}
            <Path
              d="M60 500 L60 360 L175 360 L175 280 L240 280 L240 200 L310 200 L310 130 L370 130"
              stroke="#F5C542"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="12 6"
            />
            <Path
              d="M60 500 L60 360 L175 360 L175 280"
              stroke="#22C55E"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Stop markers */}
            <Circle cx="60" cy="500" r="10" fill="#22C55E" />
            <Circle cx="60" cy="500" r="5" fill="#ffffff" />
            {/* Text isn't easily centered in RN SVG, skip label or use Text component */}

            <Circle cx="175" cy="280" r="10" fill="#F5C542" />
            <Circle cx="175" cy="280" r="5" fill="#1B365D" />

            <Circle cx="240" cy="200" r="8" fill="#CBD5E1" />
            <Circle cx="240" cy="200" r="4" fill="#ffffff" />

            <Circle cx="310" cy="130" r="8" fill="#CBD5E1" />
            <Circle cx="310" cy="130" r="4" fill="#ffffff" />

            {/* School marker */}
            <Circle cx="370" cy="130" r="14" fill="#1B365D" />
            <Path d="M370 120L360 126v18h6v-7h8v7h6V126L370 120z" fill="#F5C542" />
          </Svg>

          {/* Bus marker */}
          <View style={styles.busMarker}>
            <Bus size={20} color="#F5C542" />
          </View>

          {/* Bus pulse */}
          <View style={styles.busPulse} />
        </View>

        {/* Top overlay */}
        <View style={styles.topOverlay}>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={onBack}
              style={styles.topBarButton}
              activeOpacity={0.8}
            >
              <ArrowLeft size={20} color="#1B365D" />
            </TouchableOpacity>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>LIVE TRACKING</Text>
            </View>
            <TouchableOpacity style={styles.topBarButton} activeOpacity={0.8}>
              <RefreshCw size={18} color="#1B365D" />
            </TouchableOpacity>
          </View>

          {/* ETA card */}
          <View style={styles.etaCard}>
            <View style={styles.etaCardContainer}>
              <View style={styles.etaIcon}>
                <Clock size={22} color="#F5C542" />
              </View>
              <View style={styles.etaInfo}>
                <Text style={styles.etaLabel}>Estimated arrival at school</Text>
                <Text style={styles.etaTime}>7:45 AM</Text>
              </View>
              <View style={styles.etaCountdown}>
                <Text style={styles.etaCountdownLabel}>In</Text>
                <Text style={styles.etaCountdownValue}>33 min</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom sheet */}
        <Animated.View style={[styles.bottomSheet, { height: sheetHeight }]}>
          {/* Sheet handle */}
          <TouchableOpacity
            onPress={toggleSheet}
            style={styles.sheetHandle}
            activeOpacity={0.8}
          >
            <View style={styles.sheetHandleBar} />
            {sheetExpanded ? (
              <ChevronDown size={16} color="#6B7FA3" />
            ) : (
              <ChevronUp size={16} color="#6B7FA3" />
            )}
          </TouchableOpacity>

          <View style={styles.sheetContent}>
            {/* Bus info */}
            <View style={styles.busInfoRow}>
              <View>
                <Text style={styles.busPlate}>Bus KCA 345G</Text>
                <Text style={styles.busDriver}>Driver: James Mwangi</Text>
              </View>
              <View style={styles.stopsBadge}>
                <MapPin size={14} color="#F5C542" />
                <Text style={styles.stopsBadgeText}>4 stops away</Text>
              </View>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              {[
                { label: 'Speed', value: '28 km/h', Icon: Gauge, color: '#1B365D' },
                { label: 'Students', value: '18 / 22', Icon: Bus, color: '#1B365D' },
                { label: 'Updated', value: 'Just now', Icon: RefreshCw, color: '#22C55E' },
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

            {/* Upcoming stops + contact button (expanded) */}
            {sheetExpanded && (
              <>
                <View style={styles.upcomingStops}>
                  <Text style={styles.upcomingStopsTitle}>Upcoming Stops</Text>
                  {[
                    { name: 'Karen Estate Stop B', eta: '7:22 AM', status: 'next' },
                    { name: "Lang'ata Road Stop", eta: '7:31 AM', status: 'upcoming' },
                    { name: 'Nairobi Academy Gate', eta: '7:45 AM', status: 'school' },
                  ].map((stop, i) => (
                    <View key={i} style={styles.stopItem}>
                      <View
                        style={[
                          styles.stopDot,
                          {
                            backgroundColor:
                              stop.status === 'next'
                                ? '#F5C542'
                                : stop.status === 'school'
                                  ? '#1B365D'
                                  : '#CBD5E1',
                          },
                        ]}
                      />
                      <Text style={styles.stopName}>{stop.name}</Text>
                      <Text style={styles.stopEta}>{stop.eta}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={handleCallSchool}
                  style={styles.contactButton}
                  activeOpacity={0.8}
                >
                  <Phone size={18} color="#1B365D" />
                  <Text style={styles.contactButtonText}>Contact School</Text>
                </TouchableOpacity>
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
  // Map
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  busMarker: {
    position: 'absolute',
    top: 280 - 24,
    left: 175 - 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1B365D',
    borderWidth: 4,
    borderColor: '#F5C542',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  busPulse: {
    position: 'absolute',
    top: 280 - 30,
    left: 175 - 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(245,197,66,0.2)',
  },
  // Top overlay
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
    backgroundColor: '#22C55E',
  },
  liveBadgeText: {
    color: '#1B365D',
    fontSize: 13,
    fontWeight: '700',
  },
  // ETA card
  etaCard: {
    paddingHorizontal: 20,
    marginTop: 12,
  },
  etaCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#1B365D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  etaIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(245,197,66,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaInfo: {
    flex: 1,
  },
  etaLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  etaTime: {
    color: '#F5C542',
    fontSize: 21,
    fontWeight: '800',
  },
  etaCountdown: {
    alignItems: 'flex-end',
  },
  etaCountdownLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
  },
  etaCountdownValue: {
    color: '#ffffff',
    fontSize: 18,
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
    elevation: 10,
    zIndex: 20,
  },
  sheetHandle: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  sheetHandleBar: {
    width: 40,
    height: 8,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 8,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    flex: 1,
    paddingBottom: 80,  // <-- ADD THIS: clears the BottomNav (~65px) + extra breathing room
  },
  busInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  stopsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFF8E1',
  },
  stopsBadgeText: {
    color: '#1B365D',
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
  // Upcoming stops
  upcomingStops: {
    marginBottom: 12,
  },
  upcomingStopsTitle: {
    color: '#1B365D',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
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
  },
  stopName: {
    flex: 1,
    color: '#1B365D',
    fontSize: 13,
    fontWeight: '500',
  },
  stopEta: {
    color: '#6B7FA3',
    fontSize: 12,
    fontWeight: '600',
  },
  // Contact button
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