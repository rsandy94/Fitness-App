import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useWeightLogs } from '@/hooks/useWeightLogs';
import { SimpleLineChart } from '@/components/LineChart';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  const { data: weightLogs, isLoading } = useWeightLogs();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const sortedLogs = [...(weightLogs || [])].sort(
    (a, b) => new Date(a.logged_date).getTime() - new Date(b.logged_date).getTime()
  );

  const labels = sortedLogs.map((log) => {
    const date = new Date(log.logged_date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });

  const weights = sortedLogs.map((log) => log.weight);

  const chartData = {
    labels,
    datasets: [
      {
        data: weights.length > 0 ? weights : [0],
      },
    ],
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Weight Progress</Text>

      {weights.length > 0 ? (
        <View style={styles.chartContainer}>
          <SimpleLineChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#161b22',
              color: (opacity = 1) => `rgba(88, 166, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(139, 148, 158, ${opacity})`,
            }}
          />
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>⚖️</Text>
          <Text style={styles.emptyText}>No weight data yet</Text>
          <Text style={styles.emptySubtext}>Log your weight from the Dashboard</Text>
        </View>
      )}

      {sortedLogs.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Current</Text>
            <Text style={styles.statValue}>{weights[weights.length - 1]} lbs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Change</Text>
            <Text style={StyleSheet.flatten([styles.statValue, weights.length > 1 && (weights[weights.length - 1] >= weights[0] ? styles.statPositive : styles.statNegative)])}>
              {weights.length > 1 ? `${(weights[weights.length - 1] - weights[0]).toFixed(1)} lbs` : '-'}
            </Text>
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
  chartContainer: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#30363d',
    marginBottom: 20,
    overflow: 'hidden',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#161b22',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30363d',
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    color: '#e6edf3',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8b949e',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  statLabel: {
    fontSize: 14,
    color: '#8b949e',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e6edf3',
  },
  statPositive: {
    color: '#3fb950',
  },
  statNegative: {
    color: '#f85149',
  },
});
