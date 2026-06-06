import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ChevronRight,
  User2,
  Phone,
  Mail,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  Bus,
  Clock,
  MapPin,
} from 'lucide-react-native';

interface ProfileScreenProps {
  onBack: () => void;
  onLogout: () => void;
}

const menuItems = [
  { icon: Bell, label: 'Notification Settings', sub: 'Alerts & reminders' },
  { icon: Shield, label: 'Privacy & Security', sub: 'PIN, biometrics' },
  { icon: HelpCircle, label: 'Help & Support', sub: 'FAQs, contact us' },
];

export function DriverProfileScreen({ onBack, onLogout }: ProfileScreenProps) {
  const handleCall = (phone: string) => {
    const url = Platform.OS === 'android' ? `tel:${phone}` : `telprompt:${phone}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <ArrowLeft size={18} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.headerProfile}>
            <View style={styles.avatar}>
              <User2 size={40} color="#1B365D" />
            </View>
            <Text style={styles.profileName}>James Mwangi</Text>
            <Text style={styles.profileRole}>Driver · Nairobi Academy</Text>

            {/* Assigned vehicle */}
            <View style={styles.vehicleCard}>
              <Bus size={18} color="#F5C542" />
              <View>
                <Text style={styles.vehiclePlate}>KCA 345G</Text>
                <Text style={styles.vehicleDetail}>Capacity: 28 students</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              {[
                { label: 'Trips', value: '156', icon: MapPin },
                { label: 'On Time', value: '94%', icon: Clock },
                { label: 'Students', value: '28', icon: User2 },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <View key={i} style={styles.statItem}>
                    <Icon size={16} color="#F5C542" />
                    <Text style={styles.statValue}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* Contact info */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Contact Info</Text>
            {[
              { icon: Phone, label: '+254 722 987 654' },
              { icon: Mail, label: 'james.mwangi@gmail.com' },
            ].map((item, i) => (
              <View
                key={i}
                style={[
                  styles.contactRow,
                  i === 0 && styles.contactRowBorder,
                ]}
              >
                <View style={styles.contactIcon}>
                  <item.icon size={16} color="#6B7FA3" />
                </View>
                <Text style={styles.contactLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          {/* License & Employment */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Credentials</Text>
            {[
              { label: 'License Number', value: 'DL-KE-2021-084572' },
              { label: 'Employee ID', value: 'NA-DRV-042' },
              { label: 'Years of Service', value: '3 years' },
            ].map((c, i) => (
              <View
                key={i}
                style={[
                  styles.credentialRow,
                  i < 2 && styles.credentialRowBorder,
                ]}
              >
                <Text style={styles.credentialLabel}>{c.label}</Text>
                <Text style={styles.credentialValue}>{c.value}</Text>
              </View>
            ))}
          </View>

          {/* Emergency contacts */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            {[
              { name: 'Transport Office', phone: '+254 20 123 4567' },
              { name: 'School Admin', phone: '+254 733 111 222' },
            ].map((c, i) => (
              <View
                key={i}
                style={[
                  styles.emergencyRow,
                  i === 0 && styles.emergencyRowBorder,
                ]}
              >
                <View style={styles.emergencyInfo}>
                  <Text style={styles.emergencyName}>{c.name}</Text>
                  <Text style={styles.emergencyPhone}>{c.phone}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleCall(c.phone)}
                  style={styles.callButton}
                  activeOpacity={0.8}
                >
                  <Phone size={15} color="#1B365D" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Settings */}
          <View style={styles.sectionCard}>
            {menuItems.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.menuItem,
                  i < menuItems.length - 1 && styles.menuItemBorder,
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.menuIcon}>
                  <item.icon size={17} color="#6B7FA3" />
                </View>
                <View style={styles.menuInfo}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuSub}>{item.sub}</Text>
                </View>
                <ChevronRight size={16} color="#CBD5E1" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity
            onPress={onLogout}
            style={styles.logoutButton}
            activeOpacity={0.8}
          >
            <LogOut size={18} color="#EF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
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
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  headerProfile: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#F5C542',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  profileName: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '700',
  },
  profileRole: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginTop: 2,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  vehiclePlate: {
    color: '#F5C542',
    fontSize: 15,
    fontWeight: '700',
  },
  vehicleDetail: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: '#F5C542',
    fontSize: 19,
    fontWeight: '800',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
  },
  // Body
  body: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  sectionCard: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: 'rgba(27,54,93,0.06)',
  },
  sectionTitle: {
    color: '#6B7FA3',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  // Contact
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  contactRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27,54,93,0.06)',
  },
  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F7F9FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    color: '#1B365D',
    fontSize: 14,
    fontWeight: '500',
  },
  // Credentials
  credentialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  credentialRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27,54,93,0.06)',
  },
  credentialLabel: {
    color: '#6B7FA3',
    fontSize: 13,
  },
  credentialValue: {
    color: '#1B365D',
    fontSize: 13,
    fontWeight: '600',
  },
  // Emergency
  emergencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  emergencyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27,54,93,0.06)',
  },
  emergencyInfo: {},
  emergencyName: {
    color: '#1B365D',
    fontSize: 14,
    fontWeight: '600',
  },
  emergencyPhone: {
    color: '#6B7FA3',
    fontSize: 12,
  },
  callButton: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F7F9FC',
  },
  // Menu
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27,54,93,0.06)',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F7F9FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuInfo: {
    flex: 1,
  },
  menuLabel: {
    color: '#1B365D',
    fontSize: 14,
    fontWeight: '600',
  },
  menuSub: {
    color: '#6B7FA3',
    fontSize: 11,
  },
  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: 'rgba(239,68,68,0.15)',
    marginBottom: 24,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
});