import { theme } from '@/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ScreenHeaderProps {
  onBack?: () => void;
  onViewRouteDetails?: () => void;
  currentLocation?: string;
  destination?: string;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  onBack,
  onViewRouteDetails,
  currentLocation = 'My Home',
  destination = 'Destination',
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={theme.colors.accent} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Detour</Text>
        {onViewRouteDetails && (
          <TouchableOpacity onPress={onViewRouteDetails} style={styles.infoButton}>
            <Ionicons name="information-circle" size={28} color={theme.colors.accent} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: theme.spacing.sm,
  },
  infoButton: {
    position: 'absolute',
    right: 0,
    padding: theme.spacing.sm,
  },
  placeholder: {
    position: 'absolute',
    right: 0,
    width: 44,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  locationCol: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});
