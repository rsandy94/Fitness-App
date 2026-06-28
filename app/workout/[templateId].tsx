import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { useTemplateExercises } from '@/hooks/useExercises';
import { useCreateSession } from '@/hooks/useWorkoutSessions';
import { useSessionStore } from '@/store/sessionStore';

export default function WorkoutScreen() {
  const { templateId } = useLocalSearchParams<{ templateId: string }>();
  const router = useRouter();
  const { data: templateExercises, isLoading } = useTemplateExercises(templateId);
  const createSession = useCreateSession();
  const startSession = useSessionStore((s) => s.startSession);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const templateName = templateExercises?.[0]?.exercise?.workout_type || 'Workout';

  async function handleStartWorkout() {
    if (!templateId || !templateExercises) return;

    const session = await createSession.mutateAsync({
      template_id: templateId,
      scheduled_date: new Date().toISOString().split('T')[0],
    });

    const exercises = templateExercises.map((te) => ({
      exercise: te.exercise,
      sets: Array.from({ length: te.sets }, (_, i) => ({
        set_number: i + 1,
        weight: null,
        reps: null,
        effort: 'none' as const,
      })),
      notes: '',
      reps_range: te.reps_range,
      target_sets: te.sets,
    }));

    startSession(templateId, templateName, exercises);
    router.push(`/session/${session.id}`);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{templateName}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Target Muscles</Text>
        <View style={styles.musclesContainer}>
          {['Chest', 'Triceps', 'Shoulders'].map((muscle) => (
            <View key={muscle} style={styles.muscleCard}>
              <Text style={styles.muscleIcon}>💪</Text>
              <Text style={styles.muscleName}>{muscle}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {templateExercises?.length || 0} Exercises
        </Text>

        {templateExercises?.map((te, index) => (
          <Link key={te.id} href={`/exercise/${te.exercise_id}`} asChild>
            <Pressable style={styles.exerciseCard}>
              {te.exercise.thumbnail_url ? (
                <Image
                  source={{ uri: te.exercise.thumbnail_url }}
                  style={styles.exerciseImage}
                />
              ) : (
                <View style={styles.exerciseImagePlaceholder}>
                  <Text style={styles.exerciseImageText}>🏋️</Text>
                </View>
              )}
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{te.exercise.name}</Text>
                <Text style={styles.exerciseSets}>
                  {te.sets} sets • {te.reps_range} reps
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          </Link>
        ))}
      </View>

      <Pressable style={styles.startButton} onPress={handleStartWorkout}>
        <Text style={styles.startButtonText}>Start Workout</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e6edf3',
    marginBottom: 24,
  },
  loadingText: {
    color: '#8b949e',
    textAlign: 'center',
    marginTop: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e6edf3',
    marginBottom: 12,
  },
  musclesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  muscleCard: {
    flex: 1,
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  muscleIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  muscleName: {
    fontSize: 14,
    color: '#e6edf3',
    textAlign: 'center',
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  exerciseImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  exerciseImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#21262d',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exerciseImageText: {
    fontSize: 28,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e6edf3',
    marginBottom: 4,
  },
  exerciseSets: {
    fontSize: 14,
    color: '#8b949e',
  },
  arrow: {
    fontSize: 24,
    color: '#58a6ff',
  },
  startButton: {
    backgroundColor: '#1f6feb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
