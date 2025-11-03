/**
 * RoutePreviewScreen - Shows generated route with POIs
 * Based on UX_BLUEPRINT_2 - SCREEN 3: ROUTE PREVIEW
 * 
 * User Goal: Visualize route, review POIs, commit or reject before navigation
 * Layout: Map (45%) + POI List (45%) + Action Buttons (10%)
 * Emotional Intention: Anticipation and commitment moment
 */

import { theme } from '@/styles/theme';
import { DetourRoute, Vibe } from '@/types/detour';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
    ActivityIndicator,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

interface RoutePreviewScreenProps {
  route: DetourRoute;
  vibe: Vibe;
  isGenerating?: boolean;
  onBeginDetour: () => void;
  onAdjustRoute: () => void;
  onSaveForLater: () => void;
}

export const RoutePreviewScreen: React.FC<RoutePreviewScreenProps> = ({
  route,
  vibe,
  isGenerating = false,
  onBeginDetour,
  onAdjustRoute,
  onSaveForLater,
}) => {
  const mapRef = React.useRef<MapView>(null);

  // Fit map to show entire route
  React.useEffect(() => {
    if (route.coordinates && route.coordinates.length > 0 && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(route.coordinates, {
          edgePadding: { top: 100, right: 50, bottom: 350, left: 50 },
          animated: true,
        });
      }, 500);
    }
  }, [route.coordinates]);

  const handleBegin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onBeginDetour();
  };

  const handleAdjust = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAdjustRoute();
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSaveForLater();
  };

  // Calculate estimated time and distance
  const duration = route.durations?.walk || 0;
  const estimatedMinutes = Math.round(duration / 60);
  const distance = route.coordinates.length > 0 
    ? calculateDistance(route.coordinates) 
    : 0;

  // Vibe color mapping
  const vibeColors: Record<Vibe, string> = {
    'Creative': theme.colors.vibeCreative,
    'Foodie': theme.colors.vibeFoodie,
    'Nature Escape': theme.colors.vibeNature,
    'History Buff': theme.colors.vibeHistory,
    'Nightlife': theme.colors.vibeNightlife,
    'Hidden Gems': theme.colors.vibeHiddenGems,
    'Local Favorites': theme.colors.vibeLocalFavorites,
  };

  const vibeColor = vibeColors[vibe] || theme.colors.primary;

  if (isGenerating) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={vibeColor} />
          <Text style={styles.loadingText}>Discovering your route...</Text>
          <Text style={styles.loadingSubtext}>
            Curating the perfect {vibe.toLowerCase()} experience
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map Section (45%) */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          ref={mapRef}
          style={styles.map}
          showsUserLocation
          showsMyLocationButton={false}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          {/* Route Polyline */}
          {route.coordinates && route.coordinates.length > 0 && (
            <Polyline
              coordinates={route.coordinates}
              strokeColor={vibeColor}
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
            />
          )}

          {/* Start and End Markers */}
          {route.markers && route.markers.length >= 2 && (
            <>
              <Marker
                coordinate={route.markers[0]}
                title="Start"
                pinColor={theme.colors.userLocationPin}
              />
              <Marker
                coordinate={route.markers[1]}
                title="Destination"
                pinColor={theme.colors.destinationPin}
              />
            </>
          )}

          {/* POI Markers */}
          {route.pois?.map((poi, index) => (
            <Marker
              key={`${poi.name}-${index}`}
              coordinate={poi.location}
              pinColor={vibeColor}
            />
          ))}
        </MapView>

        {/* Summary Overlay */}
        <View style={styles.summaryOverlay}>
          <BlurView intensity={80} tint="light" style={styles.summaryBlur}>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>Your Detour</Text>
              <Text style={styles.summaryDetails}>
                {estimatedMinutes} min walk • {distance.toFixed(1)} km
              </Text>
            </View>
          </BlurView>
        </View>
      </View>

      {/* POI List Section (45%) */}
      <View style={styles.poiListContainer}>
        <ScrollView
          style={styles.poiScroll}
          contentContainerStyle={styles.poiScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.poiHeader}>What You'll Find</Text>
          
          {route.pois && route.pois.length > 0 ? (
            route.pois.slice(0, 7).map((poi, index) => (
              <View key={`${poi.name}-${index}`} style={styles.poiCard}>
                <View style={styles.poiNumber}>
                  <Text style={styles.poiNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.poiContent}>
                  <Text style={styles.poiName}>{poi.name}</Text>
                  <Text style={styles.poiDescription} numberOfLines={2}>
                    {poi.description || getVibeDescription(vibe)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noPoiText}>
              Discovering points of interest...
            </Text>
          )}
        </ScrollView>
      </View>

      {/* Action Buttons (10%) */}
      <View style={styles.actionContainer}>
        <BlurView intensity={90} tint="light" style={styles.actionBlur}>
          <View style={styles.actionContent}>
            {/* Primary CTA */}
            <Pressable
              onPress={handleBegin}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: vibeColor },
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Begin Detour</Text>
            </Pressable>

            {/* Secondary Actions */}
            <View style={styles.secondaryActions}>
              <Pressable
                onPress={handleAdjust}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.secondaryButtonText}>Adjust Route</Text>
              </Pressable>

              <Pressable
                onPress={handleSave}
                style={({ pressed }) => [
                  styles.tertiaryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.tertiaryButtonText}>Save for Later</Text>
              </Pressable>
            </View>
          </View>
        </BlurView>
      </View>
    </View>
  );
};

// Helper: Calculate distance from coordinates
function calculateDistance(coords: { latitude: number; longitude: number }[]): number {
  let distance = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const lat1 = coords[i].latitude;
    const lon1 = coords[i].longitude;
    const lat2 = coords[i + 1].latitude;
    const lon2 = coords[i + 1].longitude;
    
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distance += R * c;
  }
  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Helper: Get vibe-specific description
function getVibeDescription(vibe: Vibe): string {
  const descriptions: Record<Vibe, string> = {
    'Creative': 'A creative spot worth exploring',
    'Foodie': 'A culinary discovery awaits',
    'Nature Escape': 'A peaceful natural setting',
    'History Buff': 'Rich in history and stories',
    'Nightlife': 'Where the night comes alive',
    'Hidden Gems': 'A local secret worth finding',
    'Local Favorites': 'A neighborhood favorite',
  };
  return descriptions[vibe] || 'An interesting stop along the way';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingContent: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xxl,
  },
  loadingText: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.xl,
    textAlign: 'center',
  },
  loadingSubtext: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  
  // Map Section
  mapContainer: {
    flex: 45,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  summaryOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  summaryBlur: {
    padding: theme.spacing.lg,
  },
  summaryContent: {
    alignItems: 'center',
  },
  summaryTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  summaryDetails: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  
  // POI List Section
  poiListContainer: {
    flex: 45,
    backgroundColor: theme.colors.backgroundElevated,
  },
  poiScroll: {
    flex: 1,
  },
  poiScrollContent: {
    padding: theme.spacing.xxl,
  },
  poiHeader: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  poiCard: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    alignItems: 'flex-start',
  },
  poiNumber: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  poiNumberText: {
    ...theme.typography.bodySemibold,
    color: theme.colors.primary,
  },
  poiContent: {
    flex: 1,
  },
  poiName: {
    ...theme.typography.bodySemibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  poiDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  noPoiText: {
    ...theme.typography.body,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  
  // Action Container
  actionContainer: {
    flex: 10,
  },
  actionBlur: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 32 : theme.spacing.lg,
  },
  actionContent: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  primaryButtonText: {
    ...theme.typography.button,
    color: theme.colors.textInverse,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...theme.typography.buttonSmall,
    color: theme.colors.primary,
  },
  tertiaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
  },
  tertiaryButtonText: {
    ...theme.typography.buttonSmall,
    color: theme.colors.textSecondary,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.8,
  },
});
