import { theme } from '@/styles/theme';
import { DetourRoute, POI } from '@/types/detour';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface QuickSummaryBarProps {
  selectedTransportMode: 'car' | 'walk' | 'bike' | 'transit';
  selectedPOI: POI | null;
  detourRoute: DetourRoute | null;
  visible: boolean;
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

function getTransportIcon(mode: 'car' | 'walk' | 'bike' | 'transit'): any {
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

function getTransportLabel(mode: 'car' | 'walk' | 'bike' | 'transit'): string {
  switch (mode) {
    case 'car':
      return 'Driving';
    case 'walk':
      return 'Walking';
    case 'bike':
      return 'Biking';
    case 'transit':
      return 'Transit';
    default:
      return 'Unknown';
  }
}

export default function QuickSummaryBar({
  selectedTransportMode,
  selectedPOI,
  detourRoute,
  visible,
}: QuickSummaryBarProps) {
  if (!visible || !detourRoute) return null;

  const duration = detourRoute.durations?.[selectedTransportMode === 'car' ? 'car' : selectedTransportMode === 'walk' ? 'walk' : selectedTransportMode === 'bike' ? 'bike' : 'transit'];

  return (
    <BlurView intensity={45} tint='dark' style={[styles.container]}>
      {/* Transport Mode Section */}
      <View style={styles.section}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={getTransportIcon(selectedTransportMode)}
            size={18}
            color={theme.colors.accent}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Transport</Text>
          <Text style={styles.value}>
            {getTransportLabel(selectedTransportMode)} • {formatDuration(duration)}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* POI Section */}
      <View style={styles.section}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={selectedPOI ? 'map-marker' : 'star'}
            size={18}
            color={selectedPOI ? theme.colors.accent : theme.colors.textTertiary}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Stop</Text>
          <Text style={[styles.value, !selectedPOI && styles.valueEmpty]}>
            {selectedPOI ? selectedPOI.name : 'Select a location'}
          </Text>
        </View>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.textTertiary,
    overflow: 'hidden',
  },
  section: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E0EAFF',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textSecondaryOnDarkBlur,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    ...theme.typography.bodySemibold,
    color: theme.colors.textOnDarkBlur,
    fontSize: 13,
  },
  valueEmpty: {
    color: theme.colors.textOnDarkBlur,
    fontWeight: '400',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: theme.colors.cardBorder,
    marginHorizontal: theme.spacing.xs,
  },
});
