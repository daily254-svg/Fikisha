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
  ArrowLeft,
  Bell,
  Users,
  AlertTriangle,
  MapPin,
  Clock,
  CheckCircle2,
} from 'lucide-react-native';

interface NotificationsScreenProps {
  onBack: () => void;
}

interface Notification {
  id: number;
  type: string;
  icon: React.ComponentType<any>;
  color: string;
  bg: string;
  title: string;
  body: string;
  time: string;
  date: string;
  read: boolean;
}

const notifications: Notification[] = [
  {
    id: 1,
    type: 'route',
    icon: MapPin,
    color: '#F5C542',
    bg: '#FFF8E1',
    title: 'Route assigned',
    body: 'You have been assigned to Morning Route A for today',
    time: '6:30 AM',
    date: 'Today',
    read: false,
  },
  {
    id: 2,
    type: 'alert',
    icon: AlertTriangle,
    color: '#F97316',
    bg: '#FFF7ED',
    title: 'Traffic alert on your route',
    body: 'Heavy traffic reported on Ngong Road. Expect 10-15 min delay',
    time: '6:45 AM',
    date: 'Today',
    read: false,
  },
  {
    id: 3,
    type: 'pickup',
    icon: CheckCircle2,
    color: '#22C55E',
    bg: '#F0FDF4',
    title: 'All students picked up',
    body: '22 of 22 students boarded for Morning Route A',
    time: '7:25 AM',
    date: 'Today',
    read: true,
  },
  {
    id: 4,
    type: 'system',
    icon: Bell,
    color: '#6B7FA3',
    bg: '#F7F9FC',
    title: 'Vehicle check reminder',
    body: 'Please complete your pre-trip vehicle inspection checklist',
    time: '6:00 AM',
    date: 'Today',
    read: true,
  },
  {
    id: 5,
    type: 'route',
    icon: MapPin,
    color: '#22C55E',
    bg: '#F0FDF4',
    title: 'Afternoon route completed',
    body: 'All 22 students dropped off safely. Bus KCA 345G is back at depot',
    time: '5:30 PM',
    date: 'Yesterday',
    read: true,
  },
  {
    id: 6,
    type: 'students',
    icon: Users,
    color: '#1B365D',
    bg: '#EFF2F7',
    title: 'Student list updated',
    body: '2 new students added to your afternoon route',
    time: '3:00 PM',
    date: 'Yesterday',
    read: true,
  },
];

function groupByDate(items: Notification[]): Record<string, Notification[]> {
  const groups: Record<string, Notification[]> = {};
  items.forEach((n) => {
    if (!groups[n.date]) groups[n.date] = [];
    groups[n.date].push(n);
  });
  return groups;
}

export function DriverNotificationsScreen({ onBack }: NotificationsScreenProps) {
  const grouped = groupByDate(notifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <ArrowLeft size={18} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerRight}>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unreadCount} new</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(grouped).map(([date, items]) => (
          <View key={date} style={styles.dateSection}>
            <Text style={styles.dateLabel}>{date}</Text>
            {items.map((n, index) => {
              const Icon = n.icon;
              const isLast = index === items.length - 1;
              return (
                <View
                  key={n.id}
                  style={[
                    styles.notificationCard,
                    {
                      borderColor: n.read
                        ? 'rgba(27,54,93,0.06)'
                        : 'rgba(245,197,66,0.3)',
                    },
                  ]}
                >
                  <View style={styles.iconColumn}>
                    <View style={[styles.iconSquare, { backgroundColor: n.bg }]}>
                      <Icon size={18} color={n.color} />
                    </View>
                    {!isLast && <View style={styles.connector} />}
                  </View>

                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <Text
                        style={[
                          styles.notificationTitle,
                          { fontWeight: n.read ? '500' : '700' },
                        ]}
                        numberOfLines={2}
                      >
                        {n.title}
                      </Text>
                      {!n.read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notificationBody} numberOfLines={2}>
                      {n.body}
                    </Text>
                    <Text style={styles.notificationTime}>{n.time}</Text>
                  </View>
                </View>
              );
            })}
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
  header: {
    backgroundColor: '#1B365D',
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    flex: 1,
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  headerRight: {},
  unreadBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    backgroundColor: '#F5C542',
  },
  unreadText: {
    color: '#1B365D',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  dateSection: {
    marginBottom: 20,
  },
  dateLabel: {
    color: '#6B7FA3',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  notificationCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    marginBottom: 8,
  },
  iconColumn: {
    alignItems: 'center',
    marginRight: 12,
  },
  iconSquare: {
    width: 36,
    height: 36,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connector: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(27,54,93,0.08)',
    marginTop: 8,
    minHeight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  notificationTitle: {
    color: '#1B365D',
    fontSize: 14,
    lineHeight: 18,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F5C542',
    marginTop: 4,
  },
  notificationBody: {
    color: '#6B7FA3',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 6,
  },
  notificationTime: {
    color: '#6B7FA3',
    fontSize: 11,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 16,
  },
});