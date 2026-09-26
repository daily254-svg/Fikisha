import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Bus,
  CheckCircle2,
  MapPin,
  AlertTriangle,
  ShieldAlert,
  Clock,
} from 'lucide-react-native';
import { notificationsService } from '@/services/notifications.service';
import { useNotificationsStore } from '@/store/notifications.store';
import type { NotificationItem, NotificationType } from '@/types';

interface NotificationsListProps {
  onBack: () => void;
}

const TYPE_META: Record<
  NotificationType,
  { icon: React.ComponentType<any>; color: string; bg: string }
> = {
  BUS_APPROACHING: { icon: Bus, color: '#F5C542', bg: '#FFF8E1' },
  PICKED_UP: { icon: CheckCircle2, color: '#22C55E', bg: '#F0FDF4' },
  DROPPED_OFF: { icon: MapPin, color: '#22C55E', bg: '#F0FDF4' },
  ABSENT: { icon: AlertTriangle, color: '#EF4444', bg: '#FEF2F2' },
  EMERGENCY: { icon: ShieldAlert, color: '#EF4444', bg: '#FEF2F2' },
  DELAY: { icon: Clock, color: '#F97316', bg: '#FFF7ED' },
};

function dateLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function groupByDate(items: NotificationItem[]): [string, NotificationItem[]][] {
  const groups = new Map<string, NotificationItem[]>();
  for (const item of items) {
    const label = dateLabel(item.createdAt);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(item);
  }
  return Array.from(groups.entries());
}

export function NotificationsList({ onBack }: NotificationsListProps) {
  const { notifications, setNotifications, markAllRead } = useNotificationsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await notificationsService.getMine();
      setNotifications(res.data);
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  }, [setNotifications]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await load();
      setIsLoading(false);
    })();
  }, [load]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  };

  const handleMarkAllRead = async () => {
    markAllRead();
    try {
      await notificationsService.markAllRead();
    } catch (e) {
      console.error('Failed to mark notifications read', e);
    }
  };

  const grouped = groupByDate(notifications);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.8}>
            <ArrowLeft size={18} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead}>
              <Text style={styles.markReadText}>Mark all read</Text>
            </TouchableOpacity>
          )}
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
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        >
          {grouped.length === 0 && (
            <Text style={styles.emptyText}>No notifications yet.</Text>
          )}
          {grouped.map(([date, items]) => (
            <View key={date} style={styles.dateSection}>
              <Text style={styles.dateLabel}>{date}</Text>
              {items.map((n, index) => {
                const meta = TYPE_META[n.type] ?? TYPE_META.BUS_APPROACHING;
                const Icon = meta.icon;
                const isLast = index === items.length - 1;
                return (
                  <View
                    key={n.id}
                    style={[
                      styles.notificationCard,
                      { borderColor: n.isRead ? 'rgba(27,54,93,0.06)' : 'rgba(245,197,66,0.3)' },
                    ]}
                  >
                    <View style={styles.iconColumn}>
                      <View style={[styles.iconSquare, { backgroundColor: meta.bg }]}>
                        <Icon size={18} color={meta.color} />
                      </View>
                      {!isLast && <View style={styles.connector} />}
                    </View>

                    <View style={styles.notificationContent}>
                      <View style={styles.notificationHeader}>
                        <Text
                          style={[styles.notificationTitle, { fontWeight: n.isRead ? '500' : '700' }]}
                          numberOfLines={2}
                        >
                          {n.title}
                        </Text>
                        {!n.isRead && <View style={styles.unreadDot} />}
                      </View>
                      <Text style={styles.notificationBody} numberOfLines={2}>
                        {n.message}
                      </Text>
                      <Text style={styles.notificationTime}>{timeLabel(n.createdAt)}</Text>
                    </View>
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
  markReadText: {
    color: '#F5C542',
    fontSize: 12,
    fontWeight: '600',
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
    height: 24,
  },
});
