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
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAllExercises } from '@/hooks/useExercises';
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

type Tab = 'all' | 'muscle' | 'health';

export default function LibraryScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [muscleView, setMuscleView] = useState<string | null>(null);

  const { data: allExercises, isLoading } = useAllExercises();

  const allFiltered = useMemo(() => {
    if (!allExercises) return [];
    const q = search.toLowerCase().trim();
    return allExercises
      .filter((e) => !q || e.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allExercises, search]);

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

  function openExercise(id: string) {
    router.push(`/exercise/${id}`);
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Exercise Library',
        }}
      />
      <View style={styles.container}>
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
          <Pressable
            style={[styles.tab, tab === 'health' && styles.tabActive]}
            onPress={() => {
              setTab('health');
              setMuscleView(null);
            }}
          >
            <Text style={[styles.tabText, tab === 'health' && styles.tabTextActive]}>
              ❤️  Health
            </Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#58a6ff" />
          </View>
        ) : tab === 'all' ? (
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            <Text style={styles.sectionHeader}>
              {allFiltered.length} {allFiltered.length === 1 ? 'Exercise' : 'Exercises'}
            </Text>
            {allFiltered.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>
                  {search
                    ? `No exercises match “${search}”`
                    : 'No exercises available.'}
                </Text>
              </View>
            ) : (
              allFiltered.map((exercise) => (
                <ExerciseRow
                  key={exercise.id}
                  exercise={exercise}
                  onPress={() => openExercise(exercise.id)}
                />
              ))
            )}
          </ScrollView>
        ) : tab === 'muscle' ? (
          muscleView === null ? (
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
                    <Text style={styles.muscleCount}>{count}</Text>
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
                        ? `No exercises match “${search}”`
                        : 'No exercises in this group yet.'}
                    </Text>
                  </View>
                ) : (
                  exercisesInMuscle.map((exercise) => (
                    <ExerciseRow
                      key={exercise.id}
                      exercise={exercise}
                      onPress={() => openExercise(exercise.id)}
                    />
                  ))
                )}
              </ScrollView>
            </>
          )
        ) : (
          <View style={styles.healthContainer}>
            <Text style={styles.healthIcon}>❤️</Text>
            <Text style={styles.healthTitle}>Health Tracking</Text>
            <Text style={styles.healthSubtitle}>Coming soon</Text>
            <Text style={styles.healthDescription}>
              Track cardio, mobility, and recovery exercises here.
            </Text>
          </View>
        )}
      </View>
    </>
  );
}

function ExerciseRow({
  exercise,
  onPress,
}: {
  exercise: any;
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
        <Text style={styles.exerciseMuscles} numberOfLines={1}>
          {exercise.muscles_involved.join(' · ')}
        </Text>
      </View>
      <Text style={styles.exerciseChevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161b22',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#8b949e',
    marginTop: 8,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  exerciseMuscles: {
    fontSize: 12,
    color: '#8b949e',
    marginTop: 4,
  },
  exerciseChevron: {
    fontSize: 24,
    color: '#8b949e',
    marginLeft: 8,
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
  muscleCount: {
    fontSize: 14,
    color: '#8b949e',
    marginRight: 8,
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
  healthContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  healthIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  healthTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e6edf3',
    marginBottom: 8,
  },
  healthSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#58a6ff',
    marginBottom: 12,
  },
  healthDescription: {
    fontSize: 14,
    color: '#8b949e',
    textAlign: 'center',
    lineHeight: 20,
  },
});
