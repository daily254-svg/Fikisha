import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  User2,
  MapPin,
  Search,
} from 'lucide-react-native';

interface DriverPickupScreenProps {
  onBack: () => void;
}

interface Student {
  id: number;
  name: string;
  stop: string;
  grade: string;
  status: Status;
}

type Status = 'picked' | 'pending' | 'absent';

const students: Student[] = [
  { id: 1, name: 'Amani Omondi', stop: 'Karen Estate Stop A', grade: 'Grade 5', status: 'picked' },
  { id: 2, name: 'Baraka Kamau', stop: 'Karen Estate Stop A', grade: 'Grade 3', status: 'picked' },
  { id: 3, name: 'Cynthia Wanjiku', stop: 'Karen Estate Stop B', grade: 'Grade 6', status: 'pending' },
  { id: 4, name: 'David Njoroge', stop: 'Karen Estate Stop B', grade: 'Grade 4', status: 'pending' },
  { id: 5, name: 'Esther Akinyi', stop: 'Karen Estate Stop B', grade: 'Grade 2', status: 'pending' },
  { id: 6, name: 'Felix Otieno', stop: "Lang'ata Road Stop", grade: 'Grade 5', status: 'pending' },
  { id: 7, name: 'Grace Muthoni', stop: "Lang'ata Road Stop", grade: 'Grade 1', status: 'pending' },
  { id: 8, name: 'Hassan Ali', stop: 'Westlands Stop A', grade: 'Grade 6', status: 'picked' },
  { id: 9, name: 'Irene Chebet', stop: 'Westlands Stop A', grade: 'Grade 4', status: 'picked' },
  { id: 10, name: 'James Kariuki', stop: 'Parklands Rd Stop', grade: 'Grade 3', status: 'absent' },
];

const statusColors: Record<Status, { bg: string; text: string; label: string }> = {
  picked: { bg: '#F0FDF4', text: '#22C55E', label: 'Picked Up' },
  pending: { bg: '#FFF8E1', text: '#F97316', label: 'Pending' },
  absent: { bg: '#FEF2F2', text: '#EF4444', label: 'Absent' },
};

export function DriverPickupScreen({ onBack }: DriverPickupScreenProps) {
  const [statuses, setStatuses] = useState<Record<number, Status>>(
    Object.fromEntries(students.map((s) => [s.id, s.status]))
  );
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [search, setSearch] = useState('');

  const setStatus = (id: number, status: Status) => {
    setStatuses((prev) => ({ ...prev, [id]: status }));
  };

  const filtered = students.filter((s) => {
    const matchesFilter = filter === 'all' || statuses[s.id] === filter;
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.stop.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    picked: students.filter((s) => statuses[s.id] === 'picked').length,
    pending: students.filter((s) => statuses[s.id] === 'pending').length,
    absent: students.filter((s) => statuses[s.id] === 'absent').length,
  };

  const statusKeys: Status[] = ['picked', 'pending', 'absent'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <ArrowLeft size={18} color="#ffffff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Student Pickup</Text>
            <Text style={styles.headerSubtitle}>
              Morning Route A · Karen Estate Stop B
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {statusKeys.map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => setFilter(filter === key ? 'all' : key)}
              style={[
                styles.statCard,
                {
                  backgroundColor:
                    filter === key
                      ? statusColors[key].text
                      : 'rgba(255,255,255,0.1)',
                  borderWidth: filter === key ? 0 : 1,
                  borderColor: 'rgba(255,255,255,0.15)',
                },
              ]}
              activeOpacity={0.8}
            >
              <Text style={styles.statCount}>{counts[key]}</Text>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color:
                      filter === key
                        ? 'rgba(255,255,255,0.8)'
                        : 'rgba(255,255,255,0.5)',
                  },
                ]}
              >
                {statusColors[key].label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={16} color="#6B7FA3" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search students or stops..."
            placeholderTextColor="#A0B0C8"
            style={styles.searchInput}
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Student list */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((student) => {
          const status = statuses[student.id];
          const sc = statusColors[status];
          return (
            <View
              key={student.id}
              style={[
                styles.studentCard,
                {
                  borderColor:
                    status === 'pending'
                      ? 'rgba(27,54,93,0.06)'
                      : status === 'picked'
                        ? 'rgba(34,197,94,0.2)'
                        : 'rgba(239,68,68,0.2)',
                },
              ]}
            >
              <View style={styles.studentRow}>
                <View style={[styles.avatar, { backgroundColor: sc.bg }]}>
                  <User2 size={24} color={sc.text} />
                </View>

                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <View style={styles.studentStop}>
                    <MapPin size={12} color="#6B7FA3" />
                    <Text style={styles.studentStopText}>{student.stop}</Text>
                  </View>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.statusText, { color: sc.text }]}>
                    {sc.label}
                  </Text>
                </View>
              </View>

              {/* Action buttons */}
              {status !== 'picked' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    onPress={() => setStatus(student.id, 'picked')}
                    style={styles.pickupButton}
                    activeOpacity={0.8}
                  >
                    <CheckCircle2 size={18} color="#ffffff" />
                    <Text style={styles.pickupButtonText}>Picked Up</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setStatus(student.id, 'absent')}
                    style={styles.absentButton}
                    activeOpacity={0.8}
                  >
                    <XCircle size={18} color="#EF4444" />
                    <Text style={styles.absentButtonText}>Absent</Text>
                  </TouchableOpacity>
                </View>
              )}

              {status === 'picked' && (
                <TouchableOpacity
                  onPress={() => setStatus(student.id, 'pending')}
                  style={styles.undoButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.undoText}>Undo</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
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
  // Header
  header: {
    backgroundColor: '#1B365D',
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
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
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  statCount: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
  },
  // Search
  searchContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27,54,93,0.06)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F7F9FC',
    borderWidth: 1.5,
    borderColor: 'rgba(27,54,93,0.08)',
  },
  searchInput: {
    flex: 1,
    color: '#1B365D',
    fontSize: 14,
  },
  // List
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  studentCard: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    color: '#1B365D',
    fontSize: 15,
    fontWeight: '700',
  },
  studentStop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  studentStopText: {
    color: '#6B7FA3',
    fontSize: 11,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  // Action buttons
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pickupButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#22C55E',
  },
  pickupButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  absentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  absentButtonText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 14,
  },
  undoButton: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F7F9FC',
    alignItems: 'center',
  },
  undoText: {
    color: '#6B7FA3',
    fontSize: 12,
  },
  bottomSpacer: {
    height: 24,
  },
});