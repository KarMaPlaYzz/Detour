import { theme } from '@/styles/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TransportModeBarProps {
  selectedTransportMode: 'car' | 'walk' | 'bike' | 'transit';
  onSelectTransportMode: (mode: 'car' | 'walk' | 'bike' | 'transit') => void;
  durations: {
    walk?: number;
    car?: number;
    bike?: number;
    transit?: number;
  };
  visible: boolean;
  isLoading?: boolean;
}

function formatDuration(seconds: number | undefined): string {
  if (!seconds || seconds <= 0) return '—';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (seconds < 60) {
    return '1m';
  }

  return `${minutes}m`;
}

function getTransportIcon(mode: 'car' | 'walk' | 'bike' | 'transit'): string {
  switch (mode) {
    case 'car':
      return 'car';
    case 'walk':
      return 'walk';
    case 'bike':
      return 'bicycle';
    case 'transit':
      return 'bus';
    default:
      return 'car';
  }
}

function getMaterialIcon(mode: 'car' | 'walk' | 'bike' | 'transit'): keyof typeof MaterialCommunityIcons.glyphMap {
  switch (mode) {
    case 'car':
      return 'car';
    case 'walk':
      return 'walk';
    case 'bike':
      return 'bike';
    case 'transit':
      return 'bus';
    default:
      return 'car';
  }
}

export default function TransportModeBar({
  selectedTransportMode,
  onSelectTransportMode,
  durations,
  visible,
  isLoading = false,
}: TransportModeBarProps) {
  if (!visible) return null;

  const transportModes = [
    { mode: 'walk' as const, label: 'Walk', duration: durations.walk },
    { mode: 'car' as const, label: 'Drive', duration: durations.car },
    { mode: 'bike' as const, label: 'Bike', duration: durations.bike },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {transportModes.map(({ mode, label, duration }) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.modeButton,
              selectedTransportMode === mode && styles.modeButtonActive,
            ]}
            onPress={() => onSelectTransportMode(mode)}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={getMaterialIcon(mode)}
              size={20}
              color={
                selectedTransportMode === mode
                  ? theme.colors.accent
                  : theme.colors.textSecondary
              }
            />
            <Text
              style={[
                styles.durationText,
                selectedTransportMode === mode && styles.durationTextActive,
              ]}
            >
              {formatDuration(duration)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    backgroundColor: theme.colors.card,
    ...theme.shadows.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  modeButtonActive: {
    backgroundColor: theme.colors.accentLight,
  },
  durationText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    fontSize: 11,
    marginTop: theme.spacing.xs,
  },
  durationTextActive: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
});
