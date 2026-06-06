import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Platform,
  StatusBar,
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
  Plus,
  Bus,
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

export function ParentProfileScreen({ onBack, onLogout }: ProfileScreenProps) {
  const handleCall = (phone: string) => {
    const url = Platform.OS === 'android' ? `tel:${phone}` : `telprompt:${phone}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1B365D" translucent />

      {/* Header - fixed outside the ScrollView so body scrolls independently */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.8}>
          <ArrowLeft size={18} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.headerProfile}>
          <View style={styles.avatar}>
            <User2 size={40} color="#1B365D" />
          </View>
          <Text style={styles.profileName}>Benny Omondi</Text>
          <Text style={styles.profileRole}>Parent · Nairobi Academy</Text>

          <View style={styles.statsRow}>
            {[
              { label: 'Children', value: '1' },
              { label: 'Trips', value: '48' },
              { label: 'On Time', value: '91%' },
            ].map((s, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.body}>
          {/* Contact info */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Contact Info</Text>
            {[
              { icon: Phone, label: '+254 722 123 456' },
              { icon: Mail, label: 'benny.omondi@gmail.com' },
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

          {/* Children */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Children</Text>
              <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
                <Plus size={13} color="#F5C542" />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.childCard}>
              <View style={styles.childAvatar}>
                <User2 size={22} color="#1B365D" />
              </View>
              <View style={styles.childInfo}>
                <Text style={styles.childName}>Amani Omondi</Text>
                <Text style={styles.childDetail}>
                  Grade 5 · Admission #NA2025-118
                </Text>
              </View>
              <View style={styles.childBus}>
                <Bus size={14} color="#F5C542" />
                <Text style={styles.childBusText}>KCA 345G</Text>
              </View>
            </View>
          </View>

          {/* Emergency contacts */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            {[
              { name: 'Jane Omondi (Spouse)', phone: '+254 733 456 789' },
              { name: 'Transport Office', phone: '+254 20 123 4567' },
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
    paddingTop: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 24,
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
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  // Children
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFF8E1',
  },
  addButtonText: {
    color: '#1B365D',
    fontSize: 11,
    fontWeight: '600',
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#F7F9FC',
  },
  childAvatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#F5C542',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    color: '#1B365D',
    fontSize: 14,
    fontWeight: '700',
  },
  childDetail: {
    color: '#6B7FA3',
    fontSize: 12,
  },
  childBus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  childBusText: {
    color: '#1B365D',
    fontSize: 12,
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