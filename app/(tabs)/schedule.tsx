import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useWeeklySchedule } from '@/hooks/useWorkoutSessions';
import { getDayName } from '@/lib/utils';

export default function ScheduleScreen() {
  const { data: schedule, isLoading } = useWeeklySchedule();
  const todayDayOfWeek = new Date().getDay();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>This Week's Schedule</Text>

      {schedule?.map((item) => {
        const isToday = item.day_of_week === todayDayOfWeek;
        const isRest = item.is_rest_day;
        const template = item.template;

        return (
          <View key={item.id} style={styles.dayRow}>
            <Text style={StyleSheet.flatten([styles.dayLabel, isToday && styles.dayLabelToday])}>
              {getDayName(item.day_of_week)}
            </Text>

            {isRest ? (
              <View style={StyleSheet.flatten([styles.dayCard, styles.restCard, isToday && styles.cardToday])}>
                <Text style={styles.restIcon}>🧘</Text>
                <Text style={styles.restText}>Rest</Text>
              </View>
            ) : template ? (
              <Link href={`/workout/${template.id}`} asChild>
                <Pressable style={StyleSheet.flatten([styles.dayCard, isToday && styles.cardToday])}>
                  <Text style={styles.workoutIcon}></Text>
                  <View style={styles.dayCardInfo}>
                    <Text style={styles.workoutName}>{template.name}</Text>
                    <Text style={styles.workoutType}>{template.type}</Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </Pressable>
              </Link>
            ) : (
              <View style={StyleSheet.flatten([styles.dayCard, styles.emptyCard, isToday && styles.cardToday])}>
                <Text style={styles.emptyText}>No workout scheduled</Text>
              </View>
            )}
          </View>
        );
      })}
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
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayLabel: {
    width: 50,
    fontSize: 14,
    fontWeight: '600',
    color: '#8b949e',
  },
  dayLabelToday: {
    color: '#58a6ff',
  },
  dayCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  cardToday: {
    borderColor: '#58a6ff',
    borderWidth: 2,
  },
  restCard: {
    justifyContent: 'center',
  },
  restIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  restText: {
    fontSize: 16,
    color: '#8b949e',
  },
  workoutIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  dayCardInfo: {
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
  arrow: {
    fontSize: 24,
    color: '#58a6ff',
  },
  emptyCard: {
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8b949e',
  },
});
