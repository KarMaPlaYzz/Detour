import { ElevationProfile, formatElevation, getDifficultyDescription, getElevationColor } from '@/services/ElevationService';
import { theme } from '@/styles/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ElevationProfileViewProps {
  profile: ElevationProfile;
  containerHeight?: number;
}

export const ElevationProfileView: React.FC<ElevationProfileViewProps> = ({
  profile,
  containerHeight = 120,
}) => {
  const elevationRange = useMemo(() => {
    const range = profile.maxElevation - profile.minElevation;
    return range === 0 ? 1 : range;
  }, [profile]);

  // Create bars for visualization
  const bars = useMemo(() => {
    const segmentCount = Math.min(60, profile.points.length);
    const segmentSize = Math.floor(profile.points.length / segmentCount);

    const bars = [];
    for (let i = 0; i < segmentCount; i++) {
      const point = profile.points[i * segmentSize] || profile.points[profile.points.length - 1];
      const normalized = (point.elevation - profile.minElevation) / elevationRange;
      const height = Math.max(2, normalized * containerHeight);
      const color = getElevationColor(
        point.elevation,
        profile.minElevation,
        profile.maxElevation
      );

      bars.push({
        height,
        color,
        elevation: point.elevation,
      });
    }
    return bars;
  }, [profile, elevationRange, containerHeight]);

  return (
    <View style={styles.container}>
      {/* Header with Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons
            name="arrow-up"
            size={14}
            color={theme.colors.success}
          />
          <Text style={styles.statLabel}>Gain</Text>
          <Text style={styles.statValue}>{formatElevation(profile.elevationGain)}</Text>
        </View>

        <View style={styles.statItem}>
          <MaterialCommunityIcons
            name="arrow-down"
            size={14}
            color={theme.colors.error}
          />
          <Text style={styles.statLabel}>Loss</Text>
          <Text style={styles.statValue}>{formatElevation(profile.elevationLoss)}</Text>
        </View>

        <View style={styles.statItem}>
          <MaterialCommunityIcons
            name="elevation-rise"
            size={14}
            color={theme.colors.accent}
          />
          <Text style={styles.statLabel}>Difficulty</Text>
          <Text style={styles.statValue}>
            {profile.difficulty === 'easy' && '🟢'}
            {profile.difficulty === 'moderate' && '🟡'}
            {profile.difficulty === 'challenging' && '🔴'}
          </Text>
        </View>
      </View>

      {/* Elevation Graph */}
      <View style={styles.graphContainer}>
        <View style={styles.barsContainer}>
          {bars.map((bar, idx) => (
            <View
              key={idx}
              style={[
                styles.bar,
                {
                  height: bar.height,
                  backgroundColor: bar.color,
                },
              ]}
            />
          ))}
        </View>

        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          <Text style={styles.yAxisLabel}>
            {formatElevation(profile.maxElevation)}
          </Text>
          <Text style={styles.yAxisLabel}>
            {formatElevation((profile.maxElevation + profile.minElevation) / 2)}
          </Text>
          <Text style={styles.yAxisLabel}>
            {formatElevation(profile.minElevation)}
          </Text>
        </View>
      </View>

      {/* Difficulty Description */}
      <View style={styles.difficultyContainer}>
        <Text style={styles.difficultyText}>
          {getDifficultyDescription(profile.difficulty)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  graphContainer: {
    flexDirection: 'row',
    height: 120,
    gap: theme.spacing.sm,
    alignItems: 'flex-end',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  bar: {
    flex: 1,
    borderRadius: 2,
  },
  yAxisLabels: {
    width: 40,
    justifyContent: 'space-between',
    gap: 0,
  },
  yAxisLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    textAlign: 'right',
  },
  difficultyContainer: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    backgroundColor: `${theme.colors.accent}15`,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.accent,
  },
});
