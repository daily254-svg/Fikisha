import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Route as RouteIcon, Bell, User2 } from 'lucide-react-native';

interface DriverBottomNavProps {
  active: string;
  onNavigate: (screen: string) => void;
}

const tabs = [
  { id: 'driver-home', icon: Home, label: 'Home' },
  { id: 'driver-route', icon: RouteIcon, label: 'Route' },
  { id: 'driver-notifications', icon: Bell, label: 'Alerts' },
  { id: 'driver-profile', icon: User2, label: 'Profile' },
];

export function DriverBottomNav({ active, onNavigate }: DriverBottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onNavigate(tab.id)}
            style={[styles.tab, { backgroundColor: isActive ? '#FFF8E1' : 'transparent' }]}
            activeOpacity={0.7}
          >
            <Icon
              size={20}
              color={isActive ? '#F5C542' : '#6B7FA3'}
              strokeWidth={isActive ? 2.5 : 1.8}
            />
            <Text
              style={[
                styles.label,
                { color: isActive ? '#1B365D' : '#6B7FA3', fontWeight: isActive ? '700' : '400' },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(27,54,93,0.06)',
    shadowColor: '#1B365D',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: 16,
  },
  label: {
    fontSize: 10,
  },
});
