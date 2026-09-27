import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bus, CheckCircle2, AlertTriangle } from 'lucide-react-native';
import { useBannerStore } from '@/store/banner.store';
import type { BannerTone } from '@/store/banner.store';

const AUTO_DISMISS_MS = 4000;

const TONE_META: Record<BannerTone, { icon: React.ComponentType<any>; color: string; bg: string }> = {
  info: { icon: Bus, color: '#1B365D', bg: '#FFFFFF' },
  success: { icon: CheckCircle2, color: '#22C55E', bg: '#FFFFFF' },
  warning: { icon: AlertTriangle, color: '#F97316', bg: '#FFFFFF' },
};

export function InAppBanner() {
  const { current, dismiss } = useBannerStore();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-160)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (current) {
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 9 }).start();
      timerRef.current = setTimeout(() => {
        Animated.timing(translateY, { toValue: -160, duration: 220, useNativeDriver: true }).start(
          () => dismiss(),
        );
      }, AUTO_DISMISS_MS);
    } else {
      translateY.setValue(-160);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  if (!current) return null;

  const meta = TONE_META[current.tone];
  const Icon = meta.icon;

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.timing(translateY, { toValue: -160, duration: 200, useNativeDriver: true }).start(() =>
      dismiss(),
    );
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.container, { paddingTop: insets.top + 8, transform: [{ translateY }] }]}
    >
      <TouchableOpacity
        onPress={handleDismiss}
        activeOpacity={0.9}
        style={[styles.banner, { backgroundColor: meta.bg }]}
      >
        <View style={[styles.iconCircle, { backgroundColor: `${meta.color}1A` }]}>
          <Icon size={20} color={meta.color} />
        </View>
        <View style={styles.textCol}>
          <Text style={styles.title} numberOfLines={1}>
            {current.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {current.message}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 16,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
  },
  title: {
    color: '#1B365D',
    fontSize: 14,
    fontWeight: '700',
  },
  message: {
    color: '#6B7FA3',
    fontSize: 12,
    marginTop: 2,
  },
});
