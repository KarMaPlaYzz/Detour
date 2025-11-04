import { ElevationProfile } from '@/services/ElevationService';
import { theme } from '@/styles/theme';
import { DetourRoute } from '@/types/detour';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheetModal from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ElevationProfileView } from './ElevationProfileView';

interface RouteDetailsSheetProps {
  route: DetourRoute | null;
  isVisible: boolean;
  onClose: () => void;
  elevationProfile?: ElevationProfile;
}

const RouteDetailsSheetComponent = React.forwardRef<
  BottomSheetModal,
  RouteDetailsSheetProps
>(({ route, isVisible, onClose, elevationProfile }, ref) => {
  const snapPoints = useMemo(() => ['50%', '90%'], []);

  useEffect(() => {
    if (isVisible && ref && 'current' in ref) {
      ref.current?.expand?.();
    } else if (!isVisible && ref && 'current' in ref) {
      ref.current?.close?.();
    }
  }, [isVisible, ref]);

  // Calculate total distance in km
  const totalDistance = useMemo(() => {
    if (!route || !route.coordinates || route.coordinates.length < 2) return 0;
    
    let distance = 0;
    for (let i = 1; i < route.coordinates.length; i++) {
      const lat1 = (route.coordinates[i - 1].latitude * Math.PI) / 180;
      const lat2 = (route.coordinates[i].latitude * Math.PI) / 180;
      const deltaLat = ((route.coordinates[i].latitude - route.coordinates[i - 1].latitude) * Math.PI) / 180;
      const deltaLng = ((route.coordinates[i].longitude - route.coordinates[i - 1].longitude) * Math.PI) / 180;

      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance += 6371 * c;
    }
    return distance;
  }, [route?.coordinates]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '—';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Return null if no route (after all hooks have been called)
  if (!route) return null;

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Route Details</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
          >
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStatsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="sign-pole"
              size={20}
              color={theme.colors.accent}
            />
            <Text style={styles.statCardValue}>
              {totalDistance.toFixed(1)} km
            </Text>
            <Text style={styles.statCardLabel}>Distance</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="clock"
              size={20}
              color={theme.colors.accentLight}
            />
            <Text style={styles.statCardValue}>
              {formatDuration(route.durations?.walk)}
            </Text>
            <Text style={styles.statCardLabel}>Walk Time</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="pin"
              size={20}
              color={theme.colors.creamDarker}
            />
            <Text style={styles.statCardValue}>
              {route.pois?.length || 0}
            </Text>
            <Text style={styles.statCardLabel}>POIs</Text>
          </View>
        </View>

        {/* Elevation Profile */}
        {elevationProfile && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Elevation Profile</Text>
            <ElevationProfileView profile={elevationProfile} />
          </View>
        )}

        {/* Route Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route Information</Text>
          
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="information"
              size={16}
              color={theme.colors.accent}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Total Coordinates</Text>
              <Text style={styles.infoValue}>
                {route.coordinates?.length || 0} waypoints
              </Text>
            </View>
          </View>

          {route.durations?.walk && (
            <View style={styles.infoItem}>
              <MaterialCommunityIcons
                name="walk"
                size={16}
                color={theme.colors.accentLight}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Walking Time</Text>
                <Text style={styles.infoValue}>
                  {formatDuration(route.durations.walk)}
                </Text>
              </View>
            </View>
          )}

          {route.interest && (
            <View style={styles.infoItem}>
              <MaterialCommunityIcons
                name="heart"
                size={16}
                color={theme.colors.error}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Interest Category</Text>
                <Text style={styles.infoValue}>{route.interest}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </BottomSheetModal>
  );
});

RouteDetailsSheetComponent.displayName = 'RouteDetailsSheet';

export default RouteDetailsSheetComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  bottomSheetBackground: {
    backgroundColor: theme.colors.darkSecondary,
  },
  handleIndicator: {
    backgroundColor: theme.colors.cardBorderLight,
    width: 48,
    height: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  closeButton: {
    padding: theme.spacing.sm,
    marginRight: -theme.spacing.sm,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statCardValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statCardLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  infoItem: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});
