import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  useAllExercises,
  useTemplateExercise,
  useSwapExercise,
} from '@/hooks/useExercises';
import {
  getPrimaryMuscleGroup,
  MAIN_MUSCLE_GROUPS,
} from '@/lib/muscleMap';

const MUSCLE_ICONS: Record<string, string> = {
  Chest: '💪',
  Back: '🔙',
  Shoulders: '🤷',
  Biceps: '💪',
  Triceps: '💪',
  Legs: '🦵',
  Glutes: '🍑',
  Core: '🧱',
  Forearms: '✊',
};

type Tab = 'all' | 'muscle';

export default function SwapScreen() {
  const { templateExerciseId } = useLocalSearchParams<{ templateExerciseId: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [muscleView, setMuscleView] = useState<string | null>(null);

  const { data: templateExercise, isLoading: teLoading } = useTemplateExercise(templateExerciseId);
  const { data: allExercises, isLoading: exLoading } = useAllExercises();
  const swap = useSwapExercise(templateExercise?.template_id ?? '');

  const original = templateExercise?.exercise;

  const ranked = useMemo(() => {
    if (!allExercises || !original) return { recommended: [], other: [] };
    const q = search.toLowerCase().trim();
    const originalPrimary = getPrimaryMuscleGroup(original.muscles_involved);

    const filtered = allExercises
      .filter((e) => e.id !== original.id)
      .filter((e) => !q || e.name.toLowerCase().includes(q));

    const recommended = filtered
      .filter((e) => {
        const p = getPrimaryMuscleGroup(e.muscles_involved);
        return originalPrimary && p === originalPrimary;
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    const other = filtered
      .filter((e) => {
        const p = getPrimaryMuscleGroup(e.muscles_involved);
        return !originalPrimary || p !== originalPrimary;
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return { recommended, other };
  }, [allExercises, original, search]);

  const muscleGroupsWithCount = useMemo(() => {
    if (!allExercises) return [];
    const counts: Record<string, number> = {};
    for (const ex of allExercises) {
      const primary = getPrimaryMuscleGroup(ex.muscles_involved);
      if (primary) counts[primary] = (counts[primary] || 0) + 1;
    }
    return MAIN_MUSCLE_GROUPS.filter((g) => counts[g]).map((g) => ({
      group: g,
      count: counts[g],
    }));
  }, [allExercises]);

  const exercisesInMuscle = useMemo(() => {
    if (!allExercises || !muscleView) return [];
    const q = search.toLowerCase().trim();
    return allExercises
      .filter((e) => getPrimaryMuscleGroup(e.muscles_involved) === muscleView)
      .filter((e) => !q || e.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allExercises, muscleView, search]);

  function handlePickExercise(newExerciseId: string) {
    if (!templateExerciseId) return;
    swap.mutate(
      { templateExerciseId, newExerciseId },
      {
        onSuccess: () => router.back(),
      }
    );
  }

  const isLoading = teLoading || exLoading;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.dragHandle} />
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.title}>Select Exercise</Text>
              <Text style={styles.subtitle}>
                {original ? `Replacing: ${original.name}` : 'Choose the exercise you\u2019d like to add.'}
              </Text>
            </View>
            <Pressable onPress={() => router.back()} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Exercises (e.g. Squats)"
            placeholderTextColor="#8b949e"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.tabBar}>
          <Pressable
            style={[styles.tab, tab === 'all' && styles.tabActive]}
            onPress={() => {
              setTab('all');
              setMuscleView(null);
            }}
          >
            <Text style={[styles.tabText, tab === 'all' && styles.tabTextActive]}>
              👤  All
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, tab === 'muscle' && styles.tabActive]}
            onPress={() => setTab('muscle')}
          >
            <Text style={[styles.tabText, tab === 'muscle' && styles.tabTextActive]}>
              💪  Muscle
            </Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#58a6ff" />
          </View>
        ) : tab === 'all' ? (
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {ranked.recommended.length > 0 && (
              <>
                <Text style={styles.sectionHeader}>Recommended Alternatives</Text>
                {ranked.recommended.map((exercise) => (
                  <ExerciseRow
                    key={exercise.id}
                    exercise={exercise}
                    badge="Same primary muscle"
                    onPress={() => handlePickExercise(exercise.id)}
                  />
                ))}
              </>
            )}

            {ranked.other.length > 0 && (
              <>
                <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Other Alternatives</Text>
                {ranked.other.map(({ exercise }) => (
                  <ExerciseRow
                    key={exercise.id}
                    exercise={exercise}
                    onPress={() => handlePickExercise(exercise.id)}
                  />
                ))}
              </>
            )}

            {ranked.recommended.length === 0 && ranked.other.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>
                  {search
                    ? `No exercises match \u201c${search}\u201d`
                    : 'No exercises available.'}
                </Text>
              </View>
            )}
          </ScrollView>
        ) : muscleView === null ? (
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {muscleGroupsWithCount.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No muscle groups available.</Text>
              </View>
            ) : (
              muscleGroupsWithCount.map(({ group, count }) => (
                <Pressable
                  key={group}
                  style={styles.muscleRow}
                  onPress={() => setMuscleView(group)}
                >
                  <Text style={styles.muscleIcon}>{MUSCLE_ICONS[group] || '💪'}</Text>
                  <Text style={styles.muscleName}>{group}</Text>
                  <View style={styles.muscleSpacer} />
                  <Text style={styles.muscleChevron}>›</Text>
                </Pressable>
              ))
            )}
          </ScrollView>
        ) : (
          <>
            <View style={styles.subheader}>
              <Pressable onPress={() => setMuscleView(null)} style={styles.backButton}>
                <Text style={styles.backChevron}>‹</Text>
                <Text style={styles.subheaderText}>{muscleView}</Text>
              </Pressable>
              <Text style={styles.exerciseCount}>
                {exercisesInMuscle.length} exercises
              </Text>
            </View>
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
              {exercisesInMuscle.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>
                    {search
                      ? `No exercises match \u201c${search}\u201d`
                      : `No exercises in this group yet.`}
                  </Text>
                </View>
              ) : (
                exercisesInMuscle.map((exercise) => (
                  <ExerciseRow
                    key={exercise.id}
                    exercise={exercise}
                    onPress={() => handlePickExercise(exercise.id)}
                  />
                ))
              )}
            </ScrollView>
          </>
        )}

        {swap.isPending && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color="#58a6ff" size="large" />
          </View>
        )}
      </View>
    </>
  );
}

function ExerciseRow({
  exercise,
  badge,
  onPress,
}: {
  exercise: any;
  badge?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.exerciseRow, pressed && { opacity: 0.7 }]}
      onPress={onPress}
    >
      {exercise.thumbnail_url ? (
        <Image source={{ uri: exercise.thumbnail_url }} style={styles.exerciseThumb} />
      ) : (
        <View style={styles.exerciseThumbPlaceholder}>
          <Text style={styles.exerciseThumbIcon}>🏋️</Text>
        </View>
      )}
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName} numberOfLines={2}>
          {exercise.name}
        </Text>
        {badge && <Text style={styles.exerciseBadge}>{badge}</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#161b22',
  },
  dragHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#30363d',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e6edf3',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8b949e',
    maxWidth: 280,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: '#8b949e',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161b22',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#e6edf3',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#161b22',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#21262d',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8b949e',
  },
  tabTextActive: {
    color: '#e6edf3',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e6edf3',
    marginTop: 12,
    marginBottom: 8,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  exerciseThumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
  },
  exerciseThumbPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#21262d',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exerciseThumbIcon: {
    fontSize: 24,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#e6edf3',
  },
  exerciseBadge: {
    fontSize: 11,
    color: '#58a6ff',
    marginTop: 4,
    fontWeight: '600',
  },
  muscleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  muscleIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  muscleName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e6edf3',
  },
  muscleSpacer: {
    flex: 1,
  },
  muscleChevron: {
    fontSize: 28,
    color: '#8b949e',
  },
  subheader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backChevron: {
    fontSize: 28,
    color: '#e6edf3',
    marginRight: 4,
  },
  subheaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e6edf3',
  },
  exerciseCount: {
    fontSize: 14,
    color: '#8b949e',
  },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8b949e',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(13, 17, 23, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
