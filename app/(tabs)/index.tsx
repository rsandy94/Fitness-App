import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput, Alert } from 'react-native';
import { Link } from 'expo-router';
import { useTodayWeight, useLogWeight } from '@/hooks/useWeightLogs';
import { useWeeklySchedule } from '@/hooks/useWorkoutSessions';
import { getGreeting, todayStr } from '@/lib/utils';
import { useState } from 'react';

export default function DashboardScreen() {
  const { data: todayWeight, isLoading: weightLoading } = useTodayWeight();
  const { data: schedule, isLoading: scheduleLoading } = useWeeklySchedule();
  const logWeight = useLogWeight();
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [greeting] = useState(getGreeting());

  const today = new Date().getDay();
  const todaySchedule = schedule?.find((s) => s.day_of_week === today);

  async function handleSaveWeight() {
    const weight = parseFloat(weightInput);
    if (isNaN(weight) || weight <= 0) {
      Alert.alert('Invalid weight', 'Please enter a valid weight.');
      return;
    }
    await logWeight.mutateAsync({ logged_date: todayStr(), weight });
    setWeightInput('');
    setShowWeightModal(false);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>
        {greeting}, Sandeep!
      </Text>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Checklist</Text>
          <Text style={styles.sectionSubtitle}>
            {todayWeight ? '1/1 completed' : '0/1 completed'}
          </Text>
        </View>

        <Pressable style={styles.checklistItem} onPress={() => setShowWeightModal(true)}>
          <View style={styles.checklistIcon}>
            <Text style={styles.checklistIconText}>⚖️</Text>
          </View>
          <View style={styles.checklistTextContainer}>
            <Text style={styles.checklistText}>Weigh in</Text>
            {todayWeight && (
              <Text style={styles.checklistSubtext}>{todayWeight.weight} lbs</Text>
            )}
          </View>
          <Text style={styles.checklistArrow}>›</Text>
        </Pressable>
      </View>

      {todaySchedule && !todaySchedule.is_rest_day && todaySchedule.template && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Workout</Text>
          <Link href={`/workout/${todaySchedule.template_id}`} asChild>
            <Pressable style={styles.workoutCard}>
              <View style={styles.workoutIcon}>
                <Text style={styles.workoutIconText}>💪</Text>
              </View>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutName}>{todaySchedule.template.name}</Text>
                <Text style={styles.workoutType}>{todaySchedule.template.type}</Text>
              </View>
              <Text style={styles.checklistArrow}>›</Text>
            </Pressable>
          </Link>
        </View>
      )}

      {todaySchedule?.is_rest_day && (
        <View style={styles.section}>
          <View style={styles.restCard}>
            <Text style={styles.restIcon}>🧘</Text>
            <Text style={styles.restText}>Rest Day</Text>
          </View>
        </View>
      )}

      <Modal
        visible={showWeightModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWeightModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Weight</Text>
            <Text style={styles.modalSubtitle}>Enter your weight for today</Text>

            <TextInput
              style={styles.weightInput}
              value={weightInput}
              onChangeText={setWeightInput}
              keyboardType="decimal-pad"
              placeholder="e.g. 180"
              placeholderTextColor="#8b949e"
              autoFocus
            />

            <Text style={styles.weightUnit}>lbs</Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  setWeightInput('');
                  setShowWeightModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.saveButton}
                onPress={handleSaveWeight}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  content: {
    padding: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e6edf3',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e6edf3',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8b949e',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  checklistIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1f6feb22',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checklistIconText: {
    fontSize: 24,
  },
  checklistTextContainer: {
    flex: 1,
  },
  checklistText: {
    fontSize: 16,
    color: '#e6edf3',
  },
  checklistSubtext: {
    fontSize: 14,
    color: '#3fb950',
    marginTop: 2,
  },
  checklistArrow: {
    fontSize: 24,
    color: '#58a6ff',
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3fb95022',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workoutIconText: {
    fontSize: 24,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e6edf3',
  },
  workoutType: {
    fontSize: 14,
    color: '#8b949e',
    marginTop: 2,
  },
  restCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#30363d',
    justifyContent: 'center',
  },
  restIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  restText: {
    fontSize: 18,
    color: '#8b949e',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#161b22',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e6edf3',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#8b949e',
    marginBottom: 24,
  },
  weightInput: {
    backgroundColor: '#0d1117',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    color: '#e6edf3',
    borderWidth: 1,
    borderColor: '#30363d',
    marginBottom: 8,
  },
  weightUnit: {
    fontSize: 14,
    color: '#8b949e',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#21262d',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e6edf3',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#1f6feb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
