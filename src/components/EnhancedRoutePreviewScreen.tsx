/**
 * EnhancedRoutePreviewScreen - Animated route preview with choreographed entrance
 * Based on UX_BLUEPRINT_2 & UX_BLUEPRINT_3
 * 
 * Animations:
 * 1. Map fades in + scales (350ms)
 * 2. Route polyline draws (800-1200ms)
 * 3. POI pins scale in sequentially (150ms each, 100ms stagger)
 * 4. Summary card slides up (300ms)
 * 5. POI list cards fade in + slide up (80ms stagger)
 */

import { theme } from '@/styles/theme';
import { DetourRoute, POI, Vibe } from '@/types/detour';
import BottomSheet from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface EnhancedRoutePreviewScreenProps {
  route: DetourRoute;
  vibe: Vibe;
  pois?: POI[];
  selectedPOIs?: POI[];
  onBeginDetour: () => void;
  onAdjustRoute: () => void;
  onSaveForLater: () => void;
  onSelectPOI?: (poi: POI) => void;
  isLoading?: boolean;
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

const VIBE_EMOJIS: Record<Vibe, string> = {
  'Creative': '🎨',
  'Foodie': '�️',
  'Nature Escape': '�',
  'History Buff': '🏛️',
  'Nightlife': '🎭',
  'Hidden Gems': '�️',
  'Local Favorites': '🎢',
};

export const EnhancedRoutePreviewScreen: React.FC<EnhancedRoutePreviewScreenProps> = ({
  route,
  vibe,
  pois,
  selectedPOIs,
  onBeginDetour,
  onAdjustRoute,
  onSaveForLater,
  onSelectPOI,
  isLoading,
}) => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const VIBE_NAMES: Record<Vibe, string> = {
    'Creative': 'Art & Culture',
    'Foodie': 'Food & Dining',
    'Nature Escape': 'Parks & Gardens',
    'History Buff': 'History & Heritage',
    'Nightlife': 'Bars & Entertainment',
    'Hidden Gems': 'Shopping & Browse',
    'Local Favorites': 'Tourist Attractions',
  };

  React.useEffect(() => {
    console.log(`[RoutePreview] Loaded: ${pois?.length || 0} POIs, ${selectedPOIs?.length || 0} selected`);
    if (!pois || pois.length === 0) {
      console.log('[RoutePreview] ⚠️ WARNING: No POIs provided!', { pois, route: !!route, vibe });
    } else {
      console.log('[RoutePreview] POI names:', pois.map(p => p.name).join(', '));
    }
    
    // Debug route structure
    if (route) {
      console.log('[RoutePreview] 🗺️ Route structure:', {
        hasCoordinates: !!route.coordinates?.length,
        coordinateCount: route.coordinates?.length || 0,
        markerCount: route.markers?.length || 0,
        hasEncodedPolyline: !!route.encodedPolyline,
        markerCoords: route.markers?.map(m => `${m.latitude.toFixed(4)},${m.longitude.toFixed(4)}`),
      });
    }
  }, [pois, selectedPOIs, route]);

  // Animation references
  const mapScaleAnim = useRef(new Animated.Value(0.98)).current;
  const mapOpacityAnim = useRef(new Animated.Value(0)).current;
  const summarySlideAnim = useRef(new Animated.Value(100)).current;
  const poiListOpacityAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonOpacityAnim = useRef(new Animated.Value(0)).current;

  // POI pin animations (map by POI name to handle dynamic selections)
  const poiPinAnimsRef = useRef<Map<string, { scale: Animated.Value; opacity: Animated.Value }>>(new Map());
  
  // Ensure animations exist for all POIs (including selected ones)
  const allPOIsToAnimate = selectedPOIs && selectedPOIs.length > 0 ? selectedPOIs : pois;
  const prevPoiNamesRef = useRef<Set<string>>(new Set());
  
  allPOIsToAnimate?.forEach(poi => {
    if (!poiPinAnimsRef.current.has(poi.name)) {
      console.log(`[RoutePreview] Creating new animation for POI: ${poi.name}`);
      poiPinAnimsRef.current.set(poi.name, {
        scale: new Animated.Value(0),
        opacity: new Animated.Value(0),
      });
      prevPoiNamesRef.current.add(poi.name);
    }
  });
  
  // Clean up animations for removed POIs
  const currentPoiNames = new Set(allPOIsToAnimate?.map(p => p.name) || []);
  prevPoiNamesRef.current.forEach(name => {
    if (!currentPoiNames.has(name)) {
      console.log(`[RoutePreview] Removing animation for POI: ${name}`);
      poiPinAnimsRef.current.delete(name);
    }
  });
  prevPoiNamesRef.current = currentPoiNames;

  // Polyline drawing animation
  const [polylineDashPhase, setPolylineDashPhase] = useState(0);

  // POI Details Bottom Sheet State
  const [selectedPOIForDetails, setSelectedPOIForDetails] = useState<POI | null>(null);
  const [showPOISheet, setShowPOISheet] = useState(false);

  // Choreographed entrance animations
  useEffect(() => {
    // 1. Map entrance (0-350ms)
    Animated.parallel([
      Animated.timing(mapScaleAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(mapOpacityAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Polyline drawing (100-1200ms)
    setTimeout(() => {
      animatePolyline();
    }, 100);

    // 3. POI pins entrance (200ms after polyline starts, staggered)
    setTimeout(() => {
      const animationsToPlay = Array.from(poiPinAnimsRef.current.values());
      console.log(`[RoutePreview] Starting ${animationsToPlay.length} POI animations at 300ms`);
      animationsToPlay.forEach((anim, index) => {
        setTimeout(() => {
          Animated.parallel([
            Animated.spring(anim.scale, {
              toValue: 1,
              useNativeDriver: true,
              speed: 12,
              bounciness: 8,
            }),
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start();
        }, index * 100);
      });
    }, 300);

    // 4. Summary card entrance (500ms)
    setTimeout(() => {
      Animated.timing(summarySlideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 500);

    // 5. POI list entrance (600ms, staggered by 80ms)
    setTimeout(() => {
      Animated.timing(poiListOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 600);

    // 6. Button entrance (800ms)
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(buttonScaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(buttonOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 800);
  }, [route, selectedPOIs]);

  // Animate polyline drawing
  const animatePolyline = () => {
    const coordinates = route.coordinates?.length || 0;
    const steps = coordinates;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setPolylineDashPhase((currentStep / steps) * 100);

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, 1200 / steps);
  };

  const handleBeginDetour = () => {
    console.log(`[RoutePreview] BEGIN DETOUR - ${selectedPOIs.length} POIs selected`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onBeginDetour();
  };

  const handleAdjustRoute = () => {
    console.log(`[RoutePreview] ADJUST ROUTE`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAdjustRoute();
  };

  const handleSaveForLater = () => {
    console.log(`[RoutePreview] SAVE FOR LATER`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSaveForLater();
  };

  const vibeColor = VIBE_COLORS[vibe] || theme.colors.primary;
  const vibeEmoji = VIBE_EMOJIS[vibe];
  
  // Calculate proper map region encompassing ALL markers
  const getMapRegion = () => {
    try {
      if (!route.markers || route.markers.length < 2) {
        console.warn('[RoutePreview] No markers available for region calculation');
        return {
          latitude: 37.7749,
          longitude: -122.4194,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
      }

      // Validate all markers have valid coordinates
      const validMarkers = route.markers.filter(m => 
        m && typeof m.latitude === 'number' && typeof m.longitude === 'number' && 
        !isNaN(m.latitude) && !isNaN(m.longitude)
      );
      
      if (validMarkers.length < 2) {
        console.warn(`[RoutePreview] Only ${validMarkers.length} valid markers, need 2 minimum`);
        return {
          latitude: 37.7749,
          longitude: -122.4194,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
      }

      // Find bounding box for all markers
      const lats = validMarkers.map(m => m.latitude);
      const lons = validMarkers.map(m => m.longitude);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLon = Math.min(...lons);
      const maxLon = Math.max(...lons);

      if (!isFinite(minLat) || !isFinite(maxLat) || !isFinite(minLon) || !isFinite(maxLon)) {
        console.warn('[RoutePreview] Invalid marker coordinates:', { minLat, maxLat, minLon, maxLon });
        return {
          latitude: 37.7749,
          longitude: -122.4194,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
      }

      const centerLat = (minLat + maxLat) / 2;
      const centerLon = (minLon + maxLon) / 2;
      
      // Add padding to ensure all markers are visible
      const latDelta = (maxLat - minLat) * 1.3; // 30% padding
      const lonDelta = (maxLon - minLon) * 1.3;

      const region = {
        latitude: centerLat,
        longitude: centerLon,
        latitudeDelta: Math.max(latDelta, 0.05), // Minimum delta
        longitudeDelta: Math.max(lonDelta, 0.05),
      };

      console.log(`[RoutePreview] Map region calculated:`, { lat: region.latitude, lon: region.longitude, latDelta: region.latitudeDelta, lonDelta: region.longitudeDelta });
      return region;
    } catch (err) {
      console.error('[RoutePreview] Error calculating map region:', err);
      return {
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
  };

  const totalDistance = (() => {
    try {
      if (!route.markers || route.markers.length < 2) {
        console.log(`[RoutePreview] Cannot calculate distance: ${route.markers?.length || 0} markers`);
        return 0;
      }
      
      const start = route.markers[0];
      const end = route.markers[route.markers.length - 1];
      
      if (!start || !end || typeof start.latitude !== 'number' || typeof end.latitude !== 'number') {
        console.warn('[RoutePreview] Invalid marker data for distance calculation');
        return 0;
      }
      
      if (isNaN(start.latitude) || isNaN(end.latitude)) {
        console.warn('[RoutePreview] NaN in marker coordinates for distance');
        return 0;
      }
      
      const distance = Math.round(
        Math.sqrt(
          Math.pow(end.latitude - start.latitude, 2) +
            Math.pow(end.longitude - start.longitude, 2)
        ) * 111
      );
      
      console.log(`[RoutePreview] Calculated total distance: ${distance}km`);
      return isFinite(distance) ? distance : 0;
    } catch (err) {
      console.error('[RoutePreview] Error calculating distance:', err);
      return 0;
    }
  })();

  const renderPOICard = ({ item, index }: { item: POI; index: number }) => {
    const isSelected = selectedPOIs.some(p => p.name === item.name);
    
    return (
      <Animated.View
        style={{
          opacity: poiListOpacityAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
          transform: [
            {
              translateY: poiListOpacityAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        }}
      >
        <Pressable
          style={({ pressed }) => [
            styles.poiCard,
            isSelected && styles.poiCardSelected,
            pressed && styles.poiCardPressed,
          ]}
          onPress={() => {
            try {
              console.log(`POI selected: ${item.name}, is currently selected: ${isSelected}`);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              
              // Create a safe copy of the POI to avoid stale references
              const poiCopy = {
                name: item.name,
                location: { ...item.location },
                rating: item.rating,
                userRatingsTotal: item.userRatingsTotal,
                businessStatus: item.businessStatus,
                formattedAddress: item.formattedAddress,
                openingHours: item.openingHours ? { ...item.openingHours } : undefined,
                vicinity: item.vicinity,
                address: item.address,
              } as POI;
              
              // Show the POI details bottom sheet
              setSelectedPOIForDetails(poiCopy);
              setShowPOISheet(true);
              console.log(`[POIPress] Sheet opened for ${item.name}`);
              
              // Also call the parent handler for selection state
              onSelectPOI?.(item);
              console.log(`[POIPress] Parent handler called for ${item.name}`);
            } catch (error) {
              console.error(`[POIPress] Error handling POI press:`, error);
            }
          }}
        >
          <View style={[styles.poiIcon, { backgroundColor: isSelected ? vibeColor : vibeColor + '20' }]}>
            <Text style={styles.poiIconText}>{isSelected ? '✓' : '📍'}</Text>
          </View>

          <View style={styles.poiContent}>
            <Text style={[styles.poiName, isSelected && styles.poiNameSelected]}>{item.name}</Text>
            <Text style={styles.poiDescription} numberOfLines={2}>
              {item.vicinity || item.address || 'Point of interest along your route'}
            </Text>
            {item.rating && (
              <Text style={styles.poiRating}>★ {item.rating.toFixed(1)}</Text>
            )}
          </View>

          <View style={styles.poiChevron}>
            <Text style={[styles.chevronText, isSelected && styles.chevronSelected]}>
              {isSelected ? '✓' : '›'}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  // Debug logging
  React.useMemo(() => {
    // Logging removed - it was causing 50+ re-renders on every POI selection
  }, [route, pois, selectedPOIs]);

  try {
    console.log(`[RoutePreview] Before main return - rendering with ${route.coordinates?.length || 0} coordinates`);
    console.log(`[RoutePreview] Markers: ${route.markers?.length || 0}, POIs: ${pois?.length || 0}, Selected: ${selectedPOIs?.length || 0}`);
  } catch (err) {
    console.error(`[RoutePreview] Error in pre-render check:`, err);
  }

  try {
    return (
    <View style={styles.container}>
      {/* Map Container */}
      <Animated.View
        style={[
          styles.mapContainer,
          {
            opacity: mapOpacityAnim,
            transform: [
              {
                scale: mapScaleAnim,
              },
            ],
          },
        ]}
      >
        {route.markers && route.markers.length >= 2 && (
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            provider={PROVIDER_GOOGLE}
            initialRegion={getMapRegion()}
            scrollEnabled={true}
            zoomEnabled={true}
          >
            {/* Route polyline with drawing animation */}
            {route.coordinates && (
              <Polyline
                coordinates={route.coordinates}
                strokeColor={vibeColor}
                strokeWidth={5}
                lineDashPattern={[0]} // Full line (could use dash for effect)
                tappable={false}
              />
            )}

            {/* POI markers with staggered animation */}
            {(() => {
              try {
                const poisToShow = selectedPOIs && selectedPOIs.length > 0 ? selectedPOIs : pois;
                console.log(`[RoutePreview] Rendering ${poisToShow?.length || 0} POI markers`);
                
                if (!poisToShow || poisToShow.length === 0) {
                  console.log(`[RoutePreview] No POIs to show`);
                  return null;
                }
                
                return poisToShow.map((poi, index) => {
                  try {
                    if (!poi || !poi.name) {
                      console.warn(`[RoutePreview] Invalid POI at index ${index}:`, poi);
                      return null;
                    }
                    
                    const poiAnim = poiPinAnimsRef.current.get(poi.name);
                    if (!poiAnim) {
                      console.warn(`[RoutePreview] No animation ref for POI ${poi.name}`);
                    }
                    
                    if (!poi.location || typeof poi.location.latitude !== 'number' || typeof poi.location.longitude !== 'number') {
                      console.warn(`[RoutePreview] Invalid location for POI ${poi.name}:`, poi.location);
                      return null;
                    }
                    
                    console.log(`[RoutePreview] Rendering marker ${index + 1}: ${poi.name} at ${poi.location.latitude}, ${poi.location.longitude}`);
                    
                    return (
                      <Marker
                        key={poi.name}
                        coordinate={{
                          latitude: poi.location.latitude,
                          longitude: poi.location.longitude,
                        }}
                        title={poi.name}
                      >
                        <Animated.View
                          style={{
                            opacity: poiAnim?.opacity || new Animated.Value(0),
                            transform: [
                              {
                                scale: poiAnim?.scale || new Animated.Value(0),
                              },
                            ],
                          }}
                        >
                          <View style={[styles.poiPin, { backgroundColor: vibeColor }]}>
                            <Text style={styles.poiPinNumber}>{index + 1}</Text>
                          </View>
                        </Animated.View>
                      </Marker>
                    );
                  } catch (err) {
                    console.error(`[RoutePreview] Error rendering POI marker ${index}:`, err);
                    return null;
                  }
                });
              } catch (err) {
                console.error(`[RoutePreview] Error in POI markers rendering:`, err);
                return null;
              }
            })()}

            {/* Start marker */}
            {route.markers && route.markers[0] && (
              <Marker
                coordinate={{
                  latitude: route.markers[0].latitude,
                  longitude: route.markers[0].longitude,
                }}
                title="Start"
              >
                <View style={styles.startMarker}>
                  <Text style={styles.markerEmoji}>📍</Text>
                </View>
              </Marker>
            )}

            {/* Destination marker */}
            {route.markers && route.markers[route.markers.length - 1] && (
              <Marker
                coordinate={{
                  latitude: route.markers[route.markers.length - 1].latitude,
                  longitude: route.markers[route.markers.length - 1].longitude,
                }}
                title="Destination"
              >
                <View style={styles.destinationMarker}>
                  <Text style={styles.markerEmoji}>🎯</Text>
                </View>
              </Marker>
            )}
          </MapView>
        )}
      </Animated.View>

      {/* Content Section */}
      <ScrollView
        style={[styles.content, { paddingTop: insets.top + theme.spacing.lg }]}
        scrollEnabled={true}
        showsVerticalScrollIndicator={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerEmoji}>{vibeEmoji}</Text>
            <View>
              <Text style={styles.headerTitle}>Your Detour</Text>
              <Text style={styles.headerSubtitle}>{VIBE_NAMES[vibe]}</Text>
            </View>
          </View>
        </View>

        {/* Summary Card - Animated */}
        <Animated.View
          style={[
            styles.summaryCard,
            {
              transform: [{ translateY: summarySlideAnim }],
              opacity: summarySlideAnim.interpolate({
                inputRange: [0, 100],
                outputRange: [1, 0],
              }),
            },
          ]}
        >
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Distance</Text>
              <Text style={styles.summaryValue}>{totalDistance} km</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>POIs</Text>
              <Text style={styles.summaryValue}>{pois?.length || 0}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Time</Text>
              <Text style={styles.summaryValue}>~23 min</Text>
            </View>
          </View>
        </Animated.View>

        {/* POI List */}
        <View style={styles.poiListContainer}>
          <View style={styles.poiListHeader}>
            <Text style={styles.poiListTitle}>Points of Interest</Text>
            {selectedPOIs && selectedPOIs.length > 0 && (
              <Text style={styles.poiSelectionCount}>
                {selectedPOIs.length} selected
              </Text>
            )}
          </View>
          {selectedPOIs && selectedPOIs.length > 1 && (
            <Text style={styles.optimizationHint}>
              🚀 Route optimized for {selectedPOIs.length} stops (no backtracking!)
            </Text>
          )}
          {pois && pois.length > 0 ? (
            <FlatList
              data={pois}
              renderItem={renderPOICard}
              keyExtractor={(item) => item.name}
              scrollEnabled={false}
              style={styles.poiList}
            />
          ) : (
            <View style={styles.emptyPOIContainer}>
              <Text style={styles.emptyPOIText}>No POIs found for this route</Text>
              <Text style={styles.emptyPOISubtext}>Try a different vibe or location</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <Animated.View
          style={[
            styles.buttonsContainer,
            {
              opacity: buttonOpacityAnim,
              transform: [{ scale: buttonScaleAnim }],
            },
          ]}
        >
          {/* Primary Button */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleBeginDetour}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Preparing route...' : 'Begin Detour'}
            </Text>
          </Pressable>

          {/* Secondary Buttons */}
          <View style={styles.secondaryButtonsRow}>
            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
              onPress={handleAdjustRoute}
              disabled={isLoading}
            >
              <Text style={styles.secondaryButtonText}>← Go Back</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
              onPress={handleSaveForLater}
              disabled={isLoading}
            >
              <Text style={styles.secondaryButtonText}>Save for Later</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>

      {/* POI Details Bottom Sheet */}
      <BottomSheet
        snapPoints={[300, 500]}
        index={showPOISheet ? 1 : -1}
        enablePanDownToClose={true}
        onClose={() => {
          setShowPOISheet(false);
          setSelectedPOIForDetails(null);
        }}
        backgroundStyle={{ backgroundColor: theme.colors.backgroundElevated }}
      >
        {selectedPOIForDetails && (
          <ScrollView
            style={styles.poiSheetContent}
            showsVerticalScrollIndicator={false}
          >
            {/* POI Header */}
            <View style={styles.poiSheetHeader}>
              <Text style={styles.poiSheetTitle}>{selectedPOIForDetails.name}</Text>
              {selectedPOIForDetails.rating && (
                <View style={styles.poiSheetMetaRow}>
                  <Text style={styles.poiSheetRating}>⭐ {selectedPOIForDetails.rating.toFixed(1)}</Text>
                  {selectedPOIForDetails.userRatingsTotal && (
                    <Text style={styles.poiSheetReviewCount}>({selectedPOIForDetails.userRatingsTotal} reviews)</Text>
                  )}
                </View>
              )}
            </View>

            {/* Business Status */}
            {selectedPOIForDetails.businessStatus && (
              <View style={styles.poiSheetSection}>
                <View style={[styles.statusBadge, { backgroundColor: selectedPOIForDetails.businessStatus === 'OPERATIONAL' ? theme.colors.successLight : theme.colors.errorLight }]}>
                  <View style={[styles.statusDot, { backgroundColor: selectedPOIForDetails.businessStatus === 'OPERATIONAL' ? theme.colors.success : theme.colors.error }]} />
                  <Text style={styles.statusText}>
                    {selectedPOIForDetails.businessStatus === 'OPERATIONAL' ? 'Open Now' : 'Closed'}
                  </Text>
                </View>
              </View>
            )}

            {/* Address */}
            {selectedPOIForDetails.formattedAddress && (
              <View style={styles.poiSheetSection}>
                <Text style={styles.poiSheetSectionTitle}>📍 Address</Text>
                <Text style={styles.poiSheetAddress}>{selectedPOIForDetails.formattedAddress}</Text>
              </View>
            )}

            {/* Opening Hours */}
            {selectedPOIForDetails.openingHours?.weekday_text && (
              <View style={styles.poiSheetSection}>
                <Text style={styles.poiSheetSectionTitle}>🕐 Hours</Text>
                {selectedPOIForDetails.openingHours.weekday_text.map((day: string, idx: number) => (
                  <Text key={idx} style={styles.poiSheetHours}>{day}</Text>
                ))}
              </View>
            )}

            {/* Close Button */}
            <Pressable
              style={styles.poiSheetCloseButton}
              onPress={() => setShowPOISheet(false)}
            >
              <Text style={styles.poiSheetCloseButtonText}>Close</Text>
            </Pressable>

            <View style={{ height: theme.spacing.xl }} />
          </ScrollView>
        )}
      </BottomSheet>
    </View>
  );
  } catch (err) {
    console.error(`[RoutePreview] CRASH in render:`, err);
    console.error(`[RoutePreview] Stack:`, err instanceof Error ? err.stack : 'No stack');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Route preview failed to render</Text>
      </View>
    );
  }
};

const { height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  mapContainer: {
    height: screenHeight * 0.45,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.md,
  },

  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },

  headerEmoji: {
    fontSize: 32,
  },

  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },

  headerSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },

  summaryCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.sm,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },

  summaryLabel: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
  },

  summaryValue: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },

  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.cardBorder,
  },

  poiListContainer: {
    flex: 1,
    gap: theme.spacing.md,
  },

  poiListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  poiSelectionCount: {
    ...theme.typography.caption,
    backgroundColor: theme.colors.primary,
    color: '#FFFFFF',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    fontWeight: '600',
  },

  optimizationHint: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    fontWeight: '500',
  },

  poiListTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },

  poiList: {
    gap: theme.spacing.md,
  },

  emptyPOIContainer: {
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },

  emptyPOIText: {
    ...theme.typography.bodySemibold,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  emptyPOISubtext: {
    ...theme.typography.bodySmall,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },

  poiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },

  poiCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 2,
  },

  poiCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.8,
  },

  poiIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  poiIconText: {
    fontSize: 24,
  },

  poiContent: {
    flex: 1,
    gap: theme.spacing.xs,
  },

  poiName: {
    ...theme.typography.bodySemibold,
    color: theme.colors.textPrimary,
  },

  poiNameSelected: {
    color: theme.colors.primary,
    fontWeight: '700',
  },

  poiDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },

  poiRating: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },

  poiDistance: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
  },

  poiChevron: {
    paddingLeft: theme.spacing.sm,
  },

  chevronText: {
    fontSize: 24,
    color: theme.colors.textTertiary,
    fontWeight: '300',
  },

  chevronSelected: {
    color: theme.colors.primary,
    fontSize: 28,
    fontWeight: '600',
  },

  poiPin: {
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

  poiPinNumber: {
    ...theme.typography.bodySemibold,
    color: '#FFFFFF',
    fontSize: 14,
  },

  startMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...theme.shadows.md,
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

  markerEmoji: {
    fontSize: 20,
  },

  buttonsContainer: {
    gap: theme.spacing.md,
  },

  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.md,
  },

  primaryButtonText: {
    ...theme.typography.button,
    color: theme.colors.textInverse,
    fontSize: 18,
  },

  secondaryButtonsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.cardBorder,
  },

  secondaryButtonText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },

  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.8,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  // POI Details Bottom Sheet Styles
  poiSheetContent: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
  },

  poiSheetHeader: {
    marginBottom: theme.spacing.lg,
  },

  poiSheetTitle: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },

  poiSheetMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },

  poiSheetRating: {
    ...theme.typography.bodySemibold,
    color: theme.colors.warning,
  },

  poiSheetReviewCount: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },

  poiSheetSection: {
    marginBottom: theme.spacing.lg,
  },

  poiSheetSectionTitle: {
    ...theme.typography.bodySemibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },

  poiSheetAddress: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },

  poiSheetHours: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  statusText: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
  },

  poiSheetCloseButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },

  poiSheetCloseButtonText: {
    ...theme.typography.button,
    color: theme.colors.textInverse,
  },
});
