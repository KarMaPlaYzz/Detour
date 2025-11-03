/**
 * MapNavigationScreen - Live turn-by-turn navigation with real-time positioning
 * Uses Google Maps Directions API for live routing and turn-by-turn guidance
 * 
 * Features:
 * - Real-time location tracking with compass bearing
 * - Animated route polyline
 * - Turn-by-turn directions with distance/time
 * - Next maneuver preview
 * - POI proximity alerts
 * - Bottom sheet for POI details
 */

import { theme } from '@/styles/theme';
import { DetourRoute, Location as LocationType, POI, TransportMode, Vibe } from '@/types/detour';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BottomSheet from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MapNavigationScreenProps {
  route: DetourRoute;
  vibe: Vibe;
  currentLocation: LocationType | null;
  onArrived: () => void;
  onCancel?: () => void;
  pois?: POI[];
  selectedPOI?: POI | null;
  transportMode?: TransportMode; // Transport mode for accurate time/distance
}

interface DirectionStep {
  instruction: string;
  distance: number; // in meters
  duration: number; // in seconds
  maneuver?: string;
  coordinates: [number, number];
}

const VIBE_COLORS: Record<Vibe, string> = {
  'Creative': '#A855F7',
  'Foodie': '#F97316',
  'Nature Escape': '#16A34A',
  'History Buff': '#1E40AF',
  'Nightlife': '#D946EF',
  'Hidden Gems': '#D97706',
  'Local Favorites': '#0891B2',
};

export const MapNavigationScreen: React.FC<MapNavigationScreenProps> = ({
  route,
  vibe,
  currentLocation,
  onArrived,
  onCancel,
  pois = [],
  selectedPOI: initialSelectedPOI = null,
  transportMode = 'walking',
}) => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<LocationType | null>(currentLocation);
  const [heading, setHeading] = useState(0);
  const [directions, setDirections] = useState<DirectionStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [distance, setDistance] = useState<{ remaining: number; total: number }>({ remaining: 0, total: 0 });
  const [time, setTime] = useState<{ remaining: number; total: number }>({ remaining: 0, total: 0 });
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(initialSelectedPOI);
  const [showPOISheet, setShowPOISheet] = useState(false);
  const [arrivedAtPOI, setArrivedAtPOI] = useState(false);
  const [currentPOIIndex, setCurrentPOIIndex] = useState(0); // Track which POI user is walking towards
  const [visitedPOIs, setVisitedPOIs] = useState<Set<string>>(new Set()); // Track visited POI names
  const [nextApproachingPOI, setNextApproachingPOI] = useState<POI | null>(null);
  const [distanceToNextPOI, setDistanceToNextPOI] = useState<number | null>(null);
  const bottomSheetRef = useRef(null);
  const snapPoints = [120, 300, '100%'];
  const distanceOpacityAnim = useRef(new Animated.Value(1)).current;
  
  // Final destination is ALWAYS the end of the route, not POIs along the way
  const finalDestination = {
    latitude: route.coordinates[route.coordinates.length - 1]?.latitude || 0,
    longitude: route.coordinates[route.coordinates.length - 1]?.longitude || 0,
  };

  // Track user location in real-time
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const trackLocation = async () => {
      try {
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 1000, // Update every 1 second
            distanceInterval: 5, // Update every 5 meters
          },
          (newLocation) => {
            const newCoords: LocationType = {
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
            };
            setUserLocation(newCoords);

            // Get heading
            if (newLocation.coords.heading !== null) {
              setHeading(newLocation.coords.heading);
            }

            // Animate map to follow user
            if (mapRef.current) {
              mapRef.current.animateToRegion(
                {
                  latitude: newCoords.latitude,
                  longitude: newCoords.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                },
                500
              );
            }

            // Check if arrived at destination
            checkArrival(newCoords);
          }
        );
      } catch (error) {
        console.error('Location tracking error:', error);
      }
    };

    trackLocation();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Check if user has arrived at destination and track POI progression
  const checkArrival = (location: LocationType) => {
    // Only trigger final arrival at the final destination, not at intermediate POIs
    const distanceToFinal = calculateDistance(location, finalDestination);

    // Within 50 meters of the FINAL destination
    if (distanceToFinal < 0.05 && !arrivedAtPOI) {
      setArrivedAtPOI(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onArrived();
    }

    // Check if user reached current POI (100m threshold)
    if (pois && pois.length > 0 && currentPOIIndex < pois.length) {
      const currentPOI = pois[currentPOIIndex];
      const distanceToPOI = calculateDistance(location, currentPOI.location);

      if (distanceToPOI < 0.1) { // 100 meters
        // Mark as visited
        setVisitedPOIs(prev => new Set([...prev, currentPOI.name]));
        
        // Haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        
        // Progress to next POI
        if (currentPOIIndex + 1 < pois.length) {
          setCurrentPOIIndex(currentPOIIndex + 1);
          console.log(`✅ Reached ${currentPOI.name}, moving to POI #${currentPOIIndex + 2}`);
        } else {
          console.log(`✅ Reached final POI: ${currentPOI.name}`);
        }
      }
    }

    // Track approaching POI for header display (current POI user is walking towards)
    if (pois && pois.length > 0 && currentPOIIndex < pois.length) {
      const targetPOI = pois[currentPOIIndex];
      const distance = calculateDistance(location, targetPOI.location);
      setNextApproachingPOI(targetPOI);
      setDistanceToNextPOI(distance);
    }
  };

  // Calculate distance between two points (in km)
  const calculateDistance = (from: LocationType, to: LocationType): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
    const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((from.latitude * Math.PI) / 180) *
        Math.cos((to.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Find the nearest unvisited POI
  const findNearestPOI = (location: LocationType): { poi: POI; distance: number } | null => {
    if (!pois || pois.length === 0) return null;

    let nearest: { poi: POI; distance: number } | null = null;

    for (const poi of pois) {
      const distance = calculateDistance(location, poi.location);
      if (!nearest || distance < nearest.distance) {
        nearest = { poi, distance };
      }
    }

    return nearest;
  };

  // Fetch directions from Google Directions API
  const fetchDirections = async () => {
    if (!userLocation || !finalDestination) return;

    const start = userLocation;
    const end = finalDestination;
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.warn('Google Maps API key not configured');
      return;
    }

    try {
      // Map transport mode to Google Directions API mode
      const modeMap: Record<TransportMode, string> = {
        'walking': 'walking',
        'cycling': 'bicycling',
        'driving': 'driving',
      };
      const mode = modeMap[transportMode] || 'walking';
      
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&mode=${mode}&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const routeData = data.routes[0];
        const steps: DirectionStep[] = [];
        let totalDistance = 0;
        let totalDuration = 0;

        routeData.legs.forEach((leg: any) => {
          leg.steps.forEach((step: any) => {
            totalDistance += step.distance.value;
            totalDuration += step.duration.value;

            steps.push({
              instruction: stripHtmlTags(step.html_instructions),
              distance: step.distance.value,
              duration: step.duration.value,
              maneuver: step.maneuver,
              coordinates: [
                step.start_location.lat,
                step.start_location.lng,
              ],
            });
          });
        });

        setDirections(steps);
        setDistance({ remaining: totalDistance, total: totalDistance });
        setTime({ remaining: totalDuration, total: totalDuration });
        console.log(`📍 Directions fetched for mode: ${transportMode} (${mode})`);
      }
    } catch (error) {
      console.error('Directions API error:', error);
    }
  };

  // Strip HTML tags from instruction text
  const stripHtmlTags = (html: string): string => {
    return html.replace(/<[^>]*>/g, '');
  };

  // Update remaining distance/time based on current location
  useEffect(() => {
    if (!userLocation || !directions.length || !route.markers) return;

    const destination = route.markers[route.markers.length - 1];
    const remainingDistance = calculateDistance(userLocation, destination);

    // Estimate remaining time based on walking speed (1.4 m/s average)
    const walkingSpeed = 1.4;
    const remainingTime = (remainingDistance * 1000) / walkingSpeed;

    setDistance((prev) => ({ ...prev, remaining: remainingDistance * 1000 }));
    setTime((prev) => ({ ...prev, remaining: remainingTime }));
  }, [userLocation, directions]);

  // Fetch directions on mount
  useEffect(() => {
    fetchDirections();
  }, []);

  if (!userLocation) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  const currentStep = directions[currentStepIndex];
  const vibeColor = VIBE_COLORS[vibe] || theme.colors.primary;
  const totalDistanceKm = distance.total / 1000;
  const remainingDistanceM = Math.round(distance.remaining);
  const remainingTimeMin = Math.ceil(time.remaining / 60);

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        followsUserLocation
        zoomEnabled
        scrollEnabled
        pitchEnabled
      >
        {/* Route polyline */}
        {route.coordinates && (
          <Polyline
            coordinates={route.coordinates}
            strokeColor={vibeColor}
            strokeWidth={5}
            lineDashPattern={[0]}
            tappable
          />
        )}

        {/* POI markers */}
        {pois?.map((poi, index) => (
          <Marker
            key={poi.name}
            coordinate={{
              latitude: poi.location.latitude,
              longitude: poi.location.longitude,
            }}
            title={poi.name}
            description={`POI ${index + 1}`}
            onPress={() => {
              setSelectedPOI(poi);
              setShowPOISheet(true);
            }}
          >
            <View style={[styles.poiMarker, { backgroundColor: vibeColor }]}>
              <Text style={styles.poiMarkerText}>{index + 1}</Text>
            </View>
          </Marker>
        ))}

        {/* Destination marker */}
        {route.markers && route.markers.length > 0 && (
          <Marker
            coordinate={{
              latitude: route.markers[route.markers.length - 1].latitude,
              longitude: route.markers[route.markers.length - 1].longitude,
            }}
            title="Destination"
          >
            <View style={styles.destinationMarker}>
              <Text style={styles.destinationMarkerEmoji}>🎯</Text>
            </View>
          </Marker>
        )}
      </MapView>

      {/* Navigation Bar - Floating header with engaging info */}
      <Pressable
        style={[styles.navBar, { top: insets.top + 12, left: 12, right: 12 }]}
        onPress={() => {
          // If navigating to a POI, open its bottom sheet
          if (nextApproachingPOI) {
            setSelectedPOI(nextApproachingPOI);
            setShowPOISheet(true);
          }
        }}
      >
        {pois && pois.length > 0 && nextApproachingPOI ? (
          <>
            {/* Current POI name as main header */}
            <View style={styles.navBarHeader}>
              <Text style={styles.navBarVibe} numberOfLines={1}>
                {nextApproachingPOI.name}
              </Text>
            </View>

            {/* Progress tracking */}
            <View style={styles.navBarInfo}>
              {/* Stop number and distance */}
              <Text style={styles.navBarProgress}>
                Stop {currentPOIIndex + 1} of {pois.length}
              </Text>
              {/* Distance to current POI */}
              {distanceToNextPOI !== null && (
                <Text style={styles.navBarApproachingDist}>
                  {Math.round(distanceToNextPOI * 1000)}m away • {visitedPOIs.size} visited
                </Text>
              )}
            </View>
          </>
        ) : (
          <>
            <View style={styles.navBarHeader}>
              <Text style={styles.navBarVibe}>
                {vibe === 'Creative' && '🎨'} 
                {vibe === 'Foodie' && '🍜'} 
                {vibe === 'Nature Escape' && '🌿'} 
                {vibe === 'History Buff' && '🏛️'} 
                {vibe === 'Nightlife' && '🎭'} 
                {vibe === 'Hidden Gems' && '💎'} 
                {vibe === 'Local Favorites' && '⭐'} 
                {' '}{vibe}
              </Text>
            </View>

            <View style={styles.navBarInfo}>
              <Text style={styles.navBarProgress}>
                📍 Heading to destination
              </Text>
              {distance.total > 0 && (
                <Text style={styles.navBarTimeSaved}>
                  ~{remainingTimeMin}min to go • Keep exploring!
                </Text>
              )}
            </View>
          </>
        )}
      </Pressable>

      {/* Center Button */}
      <Pressable
        style={styles.centerButton}
        onPress={() => {
          if (mapRef.current && userLocation) {
            mapRef.current.animateToRegion(
              {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              },
              500
            );
          }
        }}
      >
        <MaterialIcons name="my-location" size={24} color={theme.colors.primary} />
      </Pressable>

      {/* Current Instruction Bar */}
      {currentStep && (
        <View style={[styles.instructionBar, { backgroundColor: vibeColor }]}>
          <Text style={styles.instructionText}>{currentStep.instruction}</Text>
          <Text style={styles.instructionDistance}>{currentStep.distance}m ahead</Text>
        </View>
      )}

      {/* Bottom sheet - POI Details */}
      {selectedPOI && (
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose
          onClose={() => setShowPOISheet(false)}
        >
          <View style={styles.poiSheetContent}>
            <View style={styles.poiSheetHandle} />
            
            {/* POI Name */}
            <Text style={styles.poiSheetName}>{selectedPOI.name}</Text>
            
            {/* Rating and Type */}
            <View style={styles.poiSheetMetaRow}>
              {selectedPOI.rating && (
                <View style={styles.poiSheetMeta}>
                  <Text style={styles.poiSheetRating}>⭐ {selectedPOI.rating.toFixed(1)}</Text>
                  {selectedPOI.user_ratings_total && (
                    <Text style={styles.poiSheetReviewCount}>({selectedPOI.user_ratings_total} reviews)</Text>
                  )}
                </View>
              )}
              <Text style={styles.poiSheetType}>{selectedPOI.type || 'Point of Interest'}</Text>
            </View>

            {/* Address */}
            {selectedPOI.formattedAddress && (
              <View style={styles.poiSheetSection}>
                <Text style={styles.poiSheetSectionTitle}>📍 Location</Text>
                <Text style={styles.poiSheetAddress}>{selectedPOI.formattedAddress}</Text>
              </View>
            )}

            {/* Status */}
            {selectedPOI.business_status && (
              <View style={styles.poiSheetSection}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        selectedPOI.business_status === 'OPERATIONAL' ? '#E8F5E9' : '#FFEBEE',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          selectedPOI.business_status === 'OPERATIONAL' ? '#00C853' : '#FF6B6B',
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          selectedPOI.business_status === 'OPERATIONAL' ? '#2E7D32' : '#C62828',
                      },
                    ]}
                  >
                    {selectedPOI.business_status === 'OPERATIONAL' ? 'Open Now' : 'Closed'}
                  </Text>
                </View>
              </View>
            )}

            {/* Distance to current location */}
            {userLocation && (
              <View style={styles.poiSheetSection}>
                <Text style={styles.poiSheetSectionTitle}>📏 Distance</Text>
                <Text style={styles.poiSheetDistance}>
                  {Math.round(calculateDistance(userLocation, selectedPOI.location) * 1000)}m away
                </Text>
              </View>
            )}
            
            <View style={styles.poiSheetActions}>
              <Pressable style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Learn More</Text>
              </Pressable>
              <Pressable
                style={[styles.actionButton, styles.actionButtonSecondary]}
                onPress={() => setShowPOISheet(false)}
              >
                <Text style={styles.actionButtonTextSecondary}>Close</Text>
              </Pressable>
            </View>
          </View>
        </BottomSheet>
      )}

      {/* Bottom Action Bar - Modern floating design */}
      <View style={[styles.bottomActionBar, { bottom: insets.bottom + 12, left: 12, right: 12 }]}>
        {/* Cancel Button */}
        <Pressable 
          style={styles.cancelButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onCancel?.();
          }}
        >
          <Text style={styles.cancelButtonText}>✕</Text>
        </Pressable>

        {/* Navigation Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>{remainingDistanceM < 1000 ? `${remainingDistanceM}m` : `${(remainingDistanceM / 1000).toFixed(1)}km`}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Time</Text>
            <Text style={styles.statValue}>{remainingTimeMin}min</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  map: {
    flex: 1,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
  navBar: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    ...theme.shadows.md,
  },
  navBarHeader: {
    width: '100%',
  },
  navBarVibe: {
    ...theme.typography.bodySemibold,
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  navBarInfo: {
    width: '100%',
    gap: theme.spacing.xs,
  },
  navBarProgress: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  navBarTimeSaved: {
    ...theme.typography.bodySmall,
    color: theme.colors.textTertiary,
    fontSize: 11,
    fontStyle: 'italic',
  },
  navBarApproaching: {
    ...theme.typography.bodySemibold,
    color: '#10B981',
    fontWeight: '700',
    fontSize: 13,
  },
  navBarApproachingDist: {
    ...theme.typography.bodySmall,
    color: '#10B981',
    fontSize: 11,
    fontWeight: '500',
  },
  navBarPOIs: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontSize: 11,
  },
  centerButton: {
    position: 'absolute',
    bottom: 250,
    right: 12,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  instructionBar: {
    position: 'absolute',
    bottom: 100,
    left: theme.spacing.xxl,
    right: theme.spacing.xxl,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  instructionText: {
    ...theme.typography.bodySemibold,
    color: '#FFFFFF',
    marginBottom: theme.spacing.xs,
  },
  instructionDistance: {
    ...theme.typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  poiMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...theme.shadows.md,
  },
  poiMarkerText: {
    ...theme.typography.bodySemibold,
    color: '#FFFFFF',
    fontSize: 14,
  },
  destinationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...theme.shadows.md,
  },
  destinationMarkerEmoji: {
    fontSize: 20,
  },
  poiSheetContent: {
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.lg,
  },
  poiSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.cardBorder,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  poiSheetName: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  poiSheetType: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  poiSheetMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  poiSheetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  poiSheetRating: {
    ...theme.typography.bodySemibold,
    color: '#FFA500',
    fontSize: 14,
  },
  poiSheetReviewCount: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontSize: 11,
  },
  poiSheetSection: {
    marginBottom: theme.spacing.lg,
  },
  poiSheetSectionTitle: {
    ...theme.typography.bodySemibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    fontSize: 13,
  },
  poiSheetAddress: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  poiSheetDistance: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    fontSize: 13,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...theme.typography.bodySemibold,
    fontSize: 12,
  },
  poiSheetActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  actionButtonText: {
    ...theme.typography.button,
    color: theme.colors.textInverse,
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  actionButtonTextSecondary: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  bottomActionBar: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.lg,
  },
  cancelButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    ...theme.typography.bodySemibold,
    color: '#EF4444',
    fontSize: 12,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  statLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginBottom: 2,
  },
  statValue: {
    ...theme.typography.bodySemibold,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.cardBorder,
  },
});
