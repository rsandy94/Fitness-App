import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSessionStore } from '@/store/sessionStore';
import { useUpdateSession, useSaveSetEntries } from '@/hooks/useWorkoutSessions';
import { useEffect, useState } from 'react';

export default function SessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const {
    templateName,
    exercises,
    elapsedSeconds,
    startTimer,
    stopTimer,
    updateSet,
    addSet,
    removeSet,
    updateNotes,
    resetSession,
  } = useSessionStore();

  const updateSession = useUpdateSession();
  const saveSetEntries = useSaveSetEntries();
  const [expandedExercises, setExpandedExercises] = useState<Record<number, boolean>>({});

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  async function handleFinish() {
    stopTimer();

    const entries = exercises.flatMap((ex, exIndex) =>
      ex.sets.map((set) => ({
        session_id: sessionId,
        exercise_id: ex.exercise.id,
        set_number: set.set_number,
        weight: set.weight,
        reps: set.reps,
      }))
    );

    await saveSetEntries.mutateAsync(entries);
    await updateSession.mutateAsync({
      id: sessionId,
      status: 'completed',
      completed_at: new Date().toISOString(),
    });

    resetSession();
    router.back();
  }

  function toggleExercise(index: number) {
    setExpandedExercises((prev) => ({ ...prev, [index]: !prev[index] }));
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Active Workout</Text>
        <Text style={styles.headerTitle}>{templateName}</Text>
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timerIcon}>️</Text>
        <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
      </View>

      {exercises.map((ex, exIndex) => (
        <View key={ex.exercise.id} style={styles.exerciseCard}>
          <Pressable style={styles.exerciseHeader} onPress={() => toggleExercise(exIndex)}>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{ex.exercise.name}</Text>
              <Text style={styles.exerciseReps}>{ex.reps_range} reps</Text>
            </View>
            <Text style={styles.expandIcon}>{expandedExercises[exIndex] ? '−' : '+'}</Text>
          </Pressable>

          {expandedExercises[exIndex] !== false && (
            <View style={styles.setsContainer}>
              <View style={styles.setHeader}>
                <Text style={styles.setHeaderText}>SET</Text>
                <Text style={styles.setHeaderText}>LBS</Text>
                <Text style={styles.setHeaderText}>REPS</Text>
              </View>

              {ex.sets.map((set, setIndex) => (
                <View key={setIndex} style={styles.setRow}>
                  <Text style={styles.setNumber}>{set.set_number}</Text>
                  <TextInput
                    style={styles.setInput}
                    value={set.weight?.toString() || ''}
                    onChangeText={(val) => updateSet(exIndex, setIndex, 'weight', val ? parseFloat(val) : null)}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor="#8b949e"
                  />
                  <TextInput
                    style={styles.setInput}
                    value={set.reps?.toString() || ''}
                    onChangeText={(val) => updateSet(exIndex, setIndex, 'reps', val ? parseInt(val) : null)}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="#8b949e"
                  />
                </View>
              ))}

              <Pressable style={styles.addSetButton} onPress={() => addSet(exIndex)}>
                <Text style={styles.addSetText}>+ Add Set</Text>
              </Pressable>

              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>NOTES</Text>
                <TextInput
                  style={styles.notesInput}
                  value={ex.notes}
                  onChangeText={(val) => updateNotes(exIndex, val)}
                  placeholder="Add notes..."
                  placeholderTextColor="#8b949e"
                  multiline
                />
              </View>
            </View>
          )}
        </View>
      ))}

      <Pressable style={styles.finishButton} onPress={handleFinish}>
        <Text style={styles.finishButtonText}>Finish Workout</Text>
      </Pressable>
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
  header: {
    marginBottom: 16,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8b949e',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e6edf3',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  timerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#58a6ff',
  },
  exerciseCard: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#30363d',
    overflow: 'hidden',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#58a6ff',
    marginBottom: 4,
  },
  exerciseReps: {
    fontSize: 14,
    color: '#8b949e',
  },
  expandIcon: {
    fontSize: 24,
    color: '#e6edf3',
  },
  setsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  setHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  setHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8b949e',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  setNumber: {
    width: 40,
    fontSize: 16,
    fontWeight: '600',
    color: '#e6edf3',
  },
  setInput: {
    flex: 1,
    backgroundColor: '#0d1117',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    fontSize: 16,
    color: '#e6edf3',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  addSetButton: {
    backgroundColor: '#21262d',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addSetText: {
    fontSize: 14,
    color: '#58a6ff',
    fontWeight: '600',
  },
  notesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#30363d',
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8b949e',
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: '#0d1117',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#e6edf3',
    borderWidth: 1,
    borderColor: '#30363d',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  finishButton: {
    backgroundColor: '#1f6feb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  finishButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
