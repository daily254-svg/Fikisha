import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DriverDashboard } from '../screens/driver/DashboardScreen';
import { DriverRouteScreen } from '../screens/driver/RouteScreen';
import { DriverPickupScreen } from '../screens/driver/PickupScreen';
import { DriverIncidentScreen } from '../screens/driver/IncidentScreen';
import { DriverProfileScreen } from '../screens/driver/ProfileScreen';
import { DriverNotificationsScreen } from '../screens/driver/NotificationsScreen';

interface DriverNavigationProps {
  screen: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export function DriverNavigation({
  screen,
  onNavigate,
  onLogout,
}: DriverNavigationProps) {
  return (
    <View style={styles.container}>
      {screen === 'driver-home' && (
        <DriverDashboard onNavigate={onNavigate} />
      )}
      {screen === 'driver-route' && (
        <DriverRouteScreen
          onBack={() => onNavigate('driver-home')}
          onNavigate={onNavigate}
        />
      )}
      {screen === 'driver-pickup' && (
        <DriverPickupScreen onBack={() => onNavigate('driver-home')} />
      )}
      {screen === 'driver-incident' && (
        <DriverIncidentScreen onBack={() => onNavigate('driver-home')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});