import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  MapPin,
  Users,
  Clock,
  Play,
  ChevronRight,
  Bus,
  AlertTriangle,
} from 'lucide-react-native';

interface DriverDashboardProps {
  onNavigate: (screen: string) => void;
}

export function DriverDashboard({ onNavigate }: DriverDashboardProps) {
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
            <View style={styles.profileSection}>
              <View style={styles.avatar}>
                <Bus size={26} color="#1B365D" />
              </View>
              <View>
                <Text style={styles.greeting}>Good Morning</Text>
                <Text style={styles.driverName}>James Mwangi</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => onNavigate('driver-incident')}
              style={styles.notificationButton}
              activeOpacity={0.8}
            >
              <Bell size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Bus card */}
          <View style={styles.busCard}>
            <View style={styles.busCardTop}>
              <View>
                <Text style={styles.busLabel}>Assigned Vehicle</Text>
                <Text style={styles.busPlate}>KCA 345G</Text>
              </View>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Ready</Text>
              </View>
            </View>
            <View style={styles.busStats}>
              {[
                { label: 'Capacity', value: '28' },
                { label: 'Students', value: '22' },
                { label: 'Stops', value: '8' },
              ].map((s, i) => (
                <View key={i} style={styles.busStat}>
                  <Text style={styles.busStatValue}>{s.value}</Text>
                  <Text style={styles.busStatLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Today's route card */}
          <View style={styles.routeCard}>
            <View style={styles.routeCardHeader}>
              <View>
                <Text style={styles.routeLabel}>TODAY'S ROUTE</Text>
                <Text style={styles.routeName}>Morning Route A</Text>
              </View>
              <View style={styles.routeIcon}>
                <MapPin size={20} color="#F5C542" />
              </View>
            </View>

            <View style={styles.routeGrid}>
              {[
                { icon: <Users size={16} color="#1B365D" />, label: 'Students', value: '22 assigned' },
                { icon: <Clock size={16} color="#1B365D" />, label: 'Start Time', value: '6:45 AM' },
                { icon: <MapPin size={16} color="#1B365D" />, label: 'First Stop', value: 'Westlands A' },
                { icon: <Clock size={16} color="#1B365D" />, label: 'School ETA', value: '7:50 AM' },
              ].map((item, i) => (
                <View key={i} style={styles.routeGridItem}>
                  <View style={styles.routeGridIcon}>
                    {item.icon}
                  </View>
                  <View>
                    <Text style={styles.routeGridLabel}>{item.label}</Text>
                    <Text style={styles.routeGridValue}>{item.value}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Action buttons */}
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

          {/* Pickup Progress */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Pickup Progress</Text>
              <TouchableOpacity onPress={() => onNavigate('driver-pickup')}>
                <Text style={styles.progressViewAll}>View all</Text>
              </TouchableOpacity>
            </View>

            {/* Progress bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarLabels}>
                <Text style={styles.progressBarText}>18 of 22 picked up</Text>
                <Text style={styles.progressBarPercent}>82%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '82%' }]} />
              </View>
            </View>

            <View style={styles.progressStats}>
              {[
                { label: 'Picked Up', count: 18, color: '#22C55E' },
                { label: 'Pending', count: 3, color: '#F5C542' },
                { label: 'Absent', count: 1, color: '#EF4444' },
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(34,197,94,0.2)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  statusText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '700',
  },
  busStats: {
    flexDirection: 'row',
    gap: 16,
  },
  busStat: {
    // flex children
  },
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