import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Map, Bell, Clock, User2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface BottomNavProps {
  active: string;
  onNavigate: (screen: string) => void;
}

const tabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'tracking', icon: Map, label: 'Track' },
  { id: 'notifications', icon: Bell, label: 'Alerts' },
  { id: 'history', icon: Clock, label: 'History' },
  { id: 'profile', icon: User2, label: 'Profile' },
];

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onNavigate(tab.id)}
            style={[
              styles.tab,
              { backgroundColor: isActive ? '#FFF8E1' : 'transparent' },
            ]}
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
                {
                  color: isActive ? '#1B365D' : '#6B7FA3',
                  fontWeight: isActive ? '700' : '400',
                },
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
    paddingVertical: 8,
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