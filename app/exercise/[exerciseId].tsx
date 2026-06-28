import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useLocalSearchParams } from 'expo-router';
import { useExercise } from '@/hooks/useExercises';
import { getYouTubeId } from '@/lib/utils';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PLAYER_WIDTH = SCREEN_WIDTH - 32; // account for container padding (16 * 2)
const PLAYER_HEIGHT = PLAYER_WIDTH * (9 / 16); // 16:9 aspect ratio

export default function ExerciseScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const { data: exercise, isLoading } = useExercise(exerciseId);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Exercise not found</Text>
      </View>
    );
  }

  const youtubeId = getYouTubeId(exercise.youtube_link);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{exercise.name}</Text>

      {youtubeId && (
        <View style={styles.videoContainer}>
          <YoutubePlayer
            height={PLAYER_HEIGHT}
            width={PLAYER_WIDTH}
            play={false}
            videoId={youtubeId}
            allowFullscreen
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Muscle Groups</Text>
        <View style={styles.musclesContainer}>
          {exercise.muscles_involved.map((muscle: string, index: number) => (
            <View key={muscle} style={styles.muscleCard}>
              <Text style={styles.muscleIcon}>💪</Text>
              <Text style={styles.muscleName}>{muscle}</Text>
              <View style={StyleSheet.flatten([styles.muscleBadge, index === 0 && styles.muscleBadgePrimary])}>
                <Text style={StyleSheet.flatten([styles.muscleBadgeText, index === 0 && styles.muscleBadgeTextPrimary])}>
                  {index === 0 ? 'PRIMARY' : 'SECONDARY'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {exercise.instructions && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercise Instructions</Text>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsIcon}>💡</Text>
            <Text style={styles.instructionsText}>{exercise.instructions}</Text>
          </View>
        </View>
      )}
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e6edf3',
    marginBottom: 20,
  },
  loadingText: {
    color: '#8b949e',
    textAlign: 'center',
    marginTop: 40,
  },
  videoContainer: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
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
    flexWrap: 'wrap',
  },
  muscleCard: {
    flex: 1,
    minWidth: 100,
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
    marginBottom: 8,
  },
  muscleBadge: {
    backgroundColor: '#21262d',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  muscleBadgePrimary: {
    backgroundColor: '#1f6feb',
  },
  muscleBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#8b949e',
  },
  muscleBadgeTextPrimary: {
    color: '#fff',
  },
  instructionsCard: {
    flexDirection: 'row',
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  instructionsIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: '#e6edf3',
    lineHeight: 22,
  },
});
