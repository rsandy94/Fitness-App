import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import {
  useTemplateExercises,
  useUndoSwap,
} from '@/hooks/useExercises';
import { useCreateSession } from '@/hooks/useWorkoutSessions';
import { useSessionStore } from '@/store/sessionStore';

export default function WorkoutScreen() {
  const { templateId } = useLocalSearchParams<{ templateId: string }>();
  const router = useRouter();
  const { data: templateExercises, isLoading } = useTemplateExercises(templateId);
  const createSession = useCreateSession();
  const startSession = useSessionStore((s) => s.startSession);
  const undoSwap = useUndoSwap(templateId);

  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

  const overriddenRows = useMemo(
    () => (templateExercises ?? []).filter((te) => te.overridden),
    [templateExercises]
  );

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

  function handleUndo() {
    const first = overriddenRows[0];
    if (!first) return;
    undoSwap.mutate(first.id);
  }

  function openSwap(teId: string) {
    setMenuOpenFor(null);
    router.push(`/workout/swap/${teId}`);
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{templateName}</Text>

        {overriddenRows.length > 0 && (
          <View style={styles.modifiedBanner}>
            <Text style={styles.modifiedText}>Workout Modified</Text>
            <Pressable onPress={handleUndo} style={styles.undoButton}>
              <Text style={styles.undoIcon}>↺</Text>
              <Text style={styles.undoText}>Undo</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {templateExercises?.length || 0} Exercises
          </Text>

          {templateExercises?.map((te) => {
            const isMenuOpen = menuOpenFor === te.id;
            return (
              <View
                key={te.id}
                style={[styles.exerciseCardWrap, isMenuOpen && styles.exerciseCardWrapActive]}
              >
                <Link href={`/exercise/${te.exercise.id}`} asChild>
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
                      <View style={styles.exerciseNameRow}>
                        <Text style={styles.exerciseName} numberOfLines={2}>
                          {te.exercise.name}
                        </Text>
                        {te.overridden && (
                          <View style={styles.swappedBadge}>
                            <Text style={styles.swappedBadgeText}>SWAPPED</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.exerciseSets}>
                        {te.sets} sets • {te.reps_range} reps
                      </Text>
                    </View>
                    <Text style={styles.arrow}>›</Text>
                  </Pressable>
                </Link>
                <Pressable
                  onPress={() => setMenuOpenFor(isMenuOpen ? null : te.id)}
                  style={styles.moreButton}
                  hitSlop={8}
                >
                  <Text style={styles.moreIcon}>⋮</Text>
                </Pressable>

                {isMenuOpen && (
                  <>
                    <Pressable
                      style={styles.menuBackdrop}
                      onPress={() => setMenuOpenFor(null)}
                    />
                    <View style={styles.menuCard}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.menuItem,
                          pressed && styles.menuItemPressed,
                        ]}
                        onPress={() => openSwap(te.id)}
                      >
                        <Text style={styles.menuItemText}>Swap</Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            );
          })}
        </View>

        <Pressable style={styles.startButton} onPress={handleStartWorkout}>
          <Text style={styles.startButtonText}>Start Workout</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e6edf3',
    marginBottom: 16,
  },
  loadingText: {
    color: '#8b949e',
    textAlign: 'center',
    marginTop: 40,
  },
  modifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1f6feb22',
    borderColor: '#1f6feb',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  modifiedText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#58a6ff',
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  undoIcon: {
    fontSize: 16,
    color: '#58a6ff',
  },
  undoText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#58a6ff',
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
  exerciseCardWrap: {
    position: 'relative',
    marginBottom: 8,
    zIndex: 1,
  },
  exerciseCardWrapActive: {
    zIndex: 100,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 12,
    paddingRight: 44,
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
  exerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e6edf3',
  },
  swappedBadge: {
    backgroundColor: '#1f6feb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  swappedBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  exerciseSets: {
    fontSize: 14,
    color: '#8b949e',
  },
  arrow: {
    fontSize: 24,
    color: '#58a6ff',
    marginLeft: 8,
  },
  moreButton: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  moreIcon: {
    fontSize: 22,
    color: '#8b949e',
    fontWeight: 'bold',
  },
  menuBackdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 9,
  },
  menuCard: {
    position: 'absolute',
    right: 8,
    top: '100%',
    marginTop: 4,
    backgroundColor: '#21262d',
    borderRadius: 8,
    minWidth: 140,
    borderWidth: 1,
    borderColor: '#30363d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    zIndex: 10,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  menuItemPressed: {
    backgroundColor: '#30363d',
  },
  menuItemText: {
    fontSize: 16,
    color: '#e6edf3',
    fontWeight: '500',
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
