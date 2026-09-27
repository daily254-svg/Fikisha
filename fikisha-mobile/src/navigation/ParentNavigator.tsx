import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ParentDashboard } from '../screens/parent/DashboardScreen';
import { LiveTrackingScreen } from '../screens/parent/LiveTrackingScreen';
import { ParentNotificationsScreen } from '../screens/parent/NotificationsScreen';
import { HistoryScreen } from '../screens/parent/HistoryScreen';
import { ParentProfileScreen } from '../screens/parent/ProfileScreen';
import { SelectStopScreen } from '../screens/parent/SelectStopScreen';

interface ParentNavigationProps {
  screen: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export function ParentNavigation({
  screen,
  onNavigate,
  onLogout,
}: ParentNavigationProps) {
  return (
    <View style={styles.container}>
      {screen === 'home' && (
        <ParentDashboard onNavigate={onNavigate} />
      )}
      {screen === 'tracking' && (
        <LiveTrackingScreen onBack={() => onNavigate('home')} />
      )}
      {screen === 'notifications' && (
        <ParentNotificationsScreen onBack={() => onNavigate('home')} />
      )}
      {screen === 'history' && (
        <HistoryScreen onBack={() => onNavigate('home')} />
      )}
      {screen === 'profile' && (
        <ParentProfileScreen
          onBack={() => onNavigate('home')}
          onLogout={onLogout}
        />
      )}
      {screen === 'select-stop' && (
        <SelectStopScreen onBack={() => onNavigate('home')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});