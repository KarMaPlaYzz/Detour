import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Alert,
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FloatingNavigation } from '@/components/FloatingNavigation';
import InputFormComponent from '@/components/InputFormComponent';
import MapViewComponent from '@/components/MapViewComponent';
import POIBottomSheet from '@/components/POIBottomSheet';
import { POICard } from '@/components/POICard';
import POIFilterSheet, { FilterOptions } from '@/components/POIFilterSheet';
import RouteDetailsSheet from '@/components/RouteDetailsSheet';
import { ScreenHeader } from '@/components/ScreenHeader';
import { HapticService } from '@/services/HapticService';
import { PerformanceMonitor } from '@/services/PerformanceMonitor';
import { filterAndRankPOIs } from '@/services/POIRankingService';
// import POISelectionSheet from '@/components/POISelectionSheet';
// import QuickSummaryBar from '@/components/QuickSummaryBar';
import SaveDetourModal from '@/components/SaveDetourModal';
import { discoverPOITypes, generateDetourWithPOI, getBasicRoute, searchPOIsAlongRoute } from '@/services/DetourService';
import { calculateElevationProfile, fetchElevationData } from '@/services/ElevationService';
import { saveDetourLocal } from '@/services/StorageService';
import { theme } from '@/styles/theme';
import { DetourRoute, Interest, Location as LocationType, POI } from '@/types/detour';

export default function ExploreScreen() {
  const [detourRoute, setDetourRoute] = React.useState<DetourRoute | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [saveModalVisible, setSaveModalVisible] = React.useState(false);
  const [currentLocation, setCurrentLocation] = React.useState<LocationType | null>(null);
  const [availablePOITypes, setAvailablePOITypes] = React.useState<{ [key: string]: string }>({});
  const [selectedTransportMode, setSelectedTransportMode] = React.useState<'car' | 'walk' | 'bike' | 'transit'>('walk');
  const [lastSearchInputs, setLastSearchInputs] = React.useState<{ start: string; end: string } | null>(null);
  const [selectedPOI, setSelectedPOI] = React.useState<POI | null>(null);
  const [selectedInterest, setSelectedInterest] = React.useState<string>('');
  const [poiCosts, setPoiCosts] = React.useState<{ [key: string]: { extraTime: number; extraDistance: number } }>({});
  const [favoritePOIs, setFavoritePOIs] = React.useState<string[]>([]);
  const [bottomSheetVisible, setBottomSheetVisible] = React.useState(false);
  const [bottomSheetPOIs, setBottomSheetPOIs] = React.useState<POI[]>([]);
  const [filterSheetVisible, setFilterSheetVisible] = React.useState(false);
  const [activeFilters, setActiveFilters] = React.useState<FilterOptions>({
    selectedTypes: [],
    maxDistance: 500,
    openOnly: false,
  });
  const [routeDetailsVisible, setRouteDetailsVisible] = React.useState(false);
  const [elevationProfile, setElevationProfile] = React.useState<any | null>(null);
  const bottomSheetRef = React.useRef<any>(null);
  const filterSheetRef = React.useRef<any>(null);
  const routeDetailsRef = React.useRef<any>(null);

  // Animation values
  const poiCardAnimation = React.useRef(new Animated.Value(0)).current;

  // Store inputs for saving
  const [lastInputs, setLastInputs] = React.useState<{
    start: LocationType;
    end: LocationType;
    interest: Interest;
  } | null>(null);

  // Centralized UI reset function
  const resetAllUIState = () => {
    console.log('[ExploreScreen] Resetting all UI state');
    setBottomSheetVisible(false);
    setBottomSheetPOIs([]);
    setSelectedPOI(null);
    setSelectedInterest('');
    setFilterSheetVisible(false);
    setRouteDetailsVisible(false);
    setSaveModalVisible(false);
    setElevationProfile(null);
    setIsLoading(false);
    // Reset animations
    poiCardAnimation.setValue(0);
  };

  // Enhanced logging for debugging
  const logUIState = () => {
    console.log('[ExploreScreen] Current UI State:', {
      bottomSheetVisible,
      bottomSheetPOIsCount: bottomSheetPOIs.length,
      selectedPOI: selectedPOI?.name || 'none',
      filterSheetVisible,
      routeDetailsVisible,
      saveModalVisible,
      elevationProfile: !!elevationProfile,
      isLoading,
    });
  };

  // Helper functions for better UX
  const handleOpenFilterSheet = () => {
    console.log('[ExploreScreen] Opening filter sheet');
    setFilterSheetVisible(true);
    logUIState();
  };

  const handleOpenRouteDetails = () => {
    console.log('[ExploreScreen] Opening route details');
    setRouteDetailsVisible(true);
    logUIState();
  };

  const dismissAllSheets = () => {
    console.log('[ExploreScreen] Dismissing all sheets');
    setBottomSheetVisible(false);
    setFilterSheetVisible(false);
    setRouteDetailsVisible(false);
    setSaveModalVisible(false);
    logUIState();
  };

  // Dismiss POI card
  const dismissPOICard = () => {
    console.log('[ExploreScreen] Dismissing POI card');
    setSelectedPOI(null);
    logUIState();
  };

  React.useEffect(() => {
    requestLocationPermission();
  }, []);

  // Animate POI card when selectedPOI changes
  React.useEffect(() => {
    if (selectedPOI) {
      // Animate in
      Animated.spring(poiCardAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      // Animate out
      Animated.timing(poiCardAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedPOI]);

  const handleReset = () => {
    console.log('[ExploreScreen] Resetting all state');
    setDetourRoute(null);
    setAvailablePOITypes({});
    setLastSearchInputs(null);
    setLastInputs(null);
    // Reset all UI state
    resetAllUIState();
    logUIState();
  };

  // TIER 1 POLISH: Fetch elevation data for route
  const handleFetchElevation = async (route: DetourRoute) => {
    try {
      PerformanceMonitor.start('fetchElevation');
      const elevPoints = await fetchElevationData(route.coordinates);
      if (elevPoints.length > 0) {
        const profile = calculateElevationProfile(elevPoints);
        setElevationProfile(profile);
      }
      PerformanceMonitor.end('fetchElevation');
    } catch (error) {
      console.error('Error fetching elevation data:', error);
      // Don't fail the whole flow if elevation fails
      setElevationProfile(null);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.log('Location permission error:', error);
    }
  };

  const handleFindDetour = async (
    startInput: string,
    endInput: string
  ) => {
    setIsLoading(true);
    setDetourRoute(null);
    setAvailablePOITypes({});
    setLastSearchInputs({ start: startInput, end: endInput });
    PerformanceMonitor.start('findDetour');

    try {
      // WALKING MODE POLISH: Always use walking mode
      const route = await getBasicRoute({
        start: startInput,
        end: endInput,
        mode: 'walking', // Always walking in this version
        // Commented out: selectedTransportMode === 'car' ? 'driving' : selectedTransportMode === 'walk' ? 'walking' : selectedTransportMode === 'bike' ? 'bicycling' : 'transit'
      });
      setDetourRoute(route as DetourRoute);
      await HapticService.success();

      // TIER 1 POLISH: Fetch elevation data for route visualization
      handleFetchElevation(route as DetourRoute);

      // Discover available POI types along the route
      const poiTypes = await discoverPOITypes(route.coordinates, 800);
      setAvailablePOITypes(poiTypes);

      // Store the actual coordinates from the route
      const firstAvailableType = Object.keys(poiTypes)[0] as Interest || 'Street Art';
      setLastInputs({
        start: route.markers[0],
        end: route.markers[1],
        interest: firstAvailableType
      });
      PerformanceMonitor.end('findDetour');
    } catch (error) {
      console.error('Route error:', error);
      await HapticService.error();

      let message = 'An unexpected error occurred. Please try again.';
      if (error instanceof Error) {
        message = error.message;
      }

      Alert.alert('Error', message);
      PerformanceMonitor.end('findDetour');
    } finally {
      setIsLoading(false);
    }
  };

  // WALKING MODE POLISH: Transport mode change disabled - only walking is available
  // const handleTransportModeChange = async (mode: 'car' | 'walk' | 'bike' | 'transit') => {
  //   setSelectedTransportMode(mode);
  //
  //   // If we have a previous search, update the route with the new mode
  //   if (lastSearchInputs) {
  //     setIsLoading(true);
  //     try {
  //       const modeMap = { car: 'driving', walk: 'walking', bike: 'bicycling', transit: 'transit' } as const;
  //       const route = await getBasicRoute({
  //         start: lastSearchInputs.start,
  //         end: lastSearchInputs.end,
  //         mode: modeMap[mode],
  //       });
  //       setDetourRoute(route as DetourRoute);
  //     } catch (error) {
  //       console.error('Route update error:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   }
  // };

  // WALKING MODE POLISH: Stub function to prevent errors
  const handleTransportModeChange = async (mode: 'car' | 'walk' | 'bike' | 'transit') => {
    // No-op: walking is the only mode available
  };

  const handleSelectInterest = async (interest: string, rawType: string) => {
    console.log('[handleSelectInterest] Called with interest:', interest, 'rawType:', rawType);
    setSelectedInterest(interest);
    // Trigger POI search with the selected interest
    await handleSearchPOIs(interest);
  };

  const handleSearchPOIs = async (interest: string) => {
    console.log('[handleSearchPOIs] Called with interest:', interest);
    if (!detourRoute?.coordinates) {
      console.warn('[handleSearchPOIs] No route coordinates');
      return;
    }

    setIsLoading(true);
    PerformanceMonitor.start('searchPOIs');
    try {
      const result = await searchPOIsAlongRoute({
        coordinates: detourRoute.coordinates,
        interest: interest as Interest,
      });

      // Apply filters and ranking
      const centerPoint = detourRoute.coordinates[Math.floor(detourRoute.coordinates.length / 2)];
      const rankedPOIs = filterAndRankPOIs(result.pois, centerPoint, {
        maxDistance: activeFilters.maxDistance,
        allowedTypes: activeFilters.selectedTypes.length > 0 ? activeFilters.selectedTypes : undefined,
        openOnly: activeFilters.openOnly,
      });

      // Update the detour route with POI data for the selected interest
      setDetourRoute(prev => prev ? {
        ...prev,
        poi: rankedPOIs[0],
        pois: rankedPOIs,
        interest,
      } : null);

      // Update last inputs with new interest
      if (lastInputs) {
        setLastInputs({
          ...lastInputs,
          interest: interest as Interest,
        });
      }

      // Show bottom sheet with POI results
      setBottomSheetPOIs(rankedPOIs);
      console.log('[handleSearchPOIs] Setting POIs:', rankedPOIs.length, 'and showing bottom sheet');
      setBottomSheetVisible(true);
      await HapticService.mediumImpact();
      
      // Pre-calculate costs for all POIs (without detour route)
      calculatePOICosts(rankedPOIs, lastSearchInputs);
      PerformanceMonitor.end('searchPOIs');
    } catch (error) {
      console.error('POI search error:', error);
      await HapticService.error();
      let message = 'Could not find POIs for this interest. Try another category.';
      if (error instanceof Error) {
        message = error.message;
      }
      Alert.alert('Error', message);
      PerformanceMonitor.end('searchPOIs');
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePOICosts = async (pois: POI[], searchInputs: { start: string; end: string } | null) => {
    if (!pois || !searchInputs) return;

    const costs: { [key: string]: { extraTime: number; extraDistance: number } } = {};

    // For each POI, calculate the detour cost (extra time and distance)
    for (const poi of pois) {
      try {
        const detourWithPOI = await generateDetourWithPOI({
          start: searchInputs.start,
          end: searchInputs.end,
          poi: {
            location: poi.location,
            name: poi.name,
          },
          mode: 'walking',
        });

        if (detourRoute) {
          // Calculate difference from original route
          const extraTime = (detourWithPOI.extraTime || 0);
          const extraDistance = (detourWithPOI.extraDistance || 0);
          
          costs[poi.name] = {
            extraTime,
            extraDistance,
          };
        }
      } catch (error) {
        console.log(`Could not calculate cost for ${poi.name}:`, error);
      }
    }

    setPoiCosts(costs);
  };

  const handleSaveDetour = async (name: string) => {
    if (!detourRoute || !lastInputs) return;

    try {
      PerformanceMonitor.start('saveDetour');
      const savedDetour = {
        id: Date.now().toString(),
        name,
        createdAt: new Date().toISOString(),
        status: 'planned' as const,
        interest: lastInputs.interest,
        startLocation: lastInputs.start,
        endLocation: lastInputs.end,
        poi: detourRoute.poi || { name: 'Not selected', location: lastInputs.end },
        encodedPolyline: detourRoute.encodedPolyline,
      };

      await saveDetourLocal(savedDetour);
      await HapticService.success();
      Alert.alert('Success', 'Detour saved successfully!');
      
      // Close save modal and reset all UI
      setSaveModalVisible(false);
      handleReset();
      
      PerformanceMonitor.end('saveDetour');
    } catch (error) {
      await HapticService.error();
      throw new Error('Failed to save detour');
    }
  };

  const handleSelectPOI = async (poi: POI) => {
    if (!detourRoute || !lastSearchInputs) return;

    // Immediately close bottom sheet for better UX
    console.log('[ExploreScreen] POI selected:', poi.name);
    setBottomSheetVisible(false);
    setIsLoading(true);
    
    // Add haptic feedback
    await HapticService.mediumImpact();
    
    PerformanceMonitor.start('selectPOI');

    try {
      // Generate detour route with POI as waypoint
      // Always use walking mode for detours to encourage exploration
      const detourWithPOI = await generateDetourWithPOI({
        start: lastSearchInputs.start,
        end: lastSearchInputs.end,
        poi: {
          location: poi.location,
          name: poi.name,
        },
        mode: 'walking',
      });

      // Update the route to show the detour
      setDetourRoute(prev => prev ? {
        ...prev,
        coordinates: detourWithPOI.coordinates,
        encodedPolyline: detourWithPOI.encodedPolyline,
        markers: detourWithPOI.markers,
        poi: poi,
      } : null);

      // Set selected POI - animation will handle the reveal
      setSelectedPOI(poi);
      
      await HapticService.success();
      console.log('[ExploreScreen] Route updated with POI:', poi.name);
      logUIState();
      
      PerformanceMonitor.end('selectPOI');
    } catch (error) {
      console.error('Error selecting POI:', error);
      await HapticService.error();
      Alert.alert('Error', 'Could not update route with this POI');
      PerformanceMonitor.end('selectPOI');
    } finally {
      setIsLoading(false);
    }
  };

  // TIER 1 POLISH: Continue Walking - Add POI without regenerating route
  const handleContinueWalking = async (poi: POI) => {
    if (!detourRoute || !lastSearchInputs) return;

    setIsLoading(true);
    PerformanceMonitor.start('continueWalking');

    try {
      // Add POI as waypoint without full route regeneration
      // This creates a quick chain of POIs
      
      // Update bottom sheet POIs to show next suggestions
      // For now, just add current POI and keep the sheet visible but move to next
      setSelectedPOI(poi);
      
      // Minimal route update - just add marker
      setDetourRoute(prev => prev ? {
        ...prev,
        pois: [...(prev.pois || []), poi],
        poi: poi,
      } : null);

      await HapticService.mediumImpact();
      PerformanceMonitor.end('continueWalking');
    } catch (error) {
      console.error('Error continuing walk:', error);
      await HapticService.error();
      PerformanceMonitor.end('continueWalking');
    } finally {
      setIsLoading(false);
    }
  };

  // TIER 1 POLISH: Handle filter application
  const handleApplyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters);
    // Re-search with new filters if we have POIs showing
    if (bottomSheetPOIs.length > 0 && detourRoute) {
      const centerPoint = detourRoute.coordinates[Math.floor(detourRoute.coordinates.length / 2)];
      const rankedPOIs = filterAndRankPOIs(bottomSheetPOIs, centerPoint, {
        maxDistance: filters.maxDistance,
        allowedTypes: filters.selectedTypes.length > 0 ? filters.selectedTypes : undefined,
        openOnly: filters.openOnly,
      });
      setBottomSheetPOIs(rankedPOIs);
    }
  };

  const handleToggleFavorite = (isFavorite: boolean) => {
    if (!selectedPOI) return;
    if (isFavorite) {
      setFavoritePOIs([...favoritePOIs, selectedPOI.name]);
    } else {
      setFavoritePOIs(favoritePOIs.filter(name => name !== selectedPOI.name));
    }
  };

  const handleViewPhotos = () => {
    Alert.alert('Photos', 'Photo gallery view would show here');
  };

  const initialRegion = currentLocation
    ? {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }
    : {
      latitude: 34.0522,
      longitude: -118.2437,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };

  // Prepare dynamic action buttons for floating navigation
  const dynamicActions = React.useMemo(() => {
    if (!detourRoute || isLoading) {
      return [];
    }

    return [
      {
        id: 'reset',
        icon: 'arrow.counterclockwise',
        onPress: handleReset,
        bgColor: theme.colors.accentLight,
        color: theme.colors.accent,
      },
    ];
  }, [detourRoute, isLoading]);

  return (
    <View style={styles.container}>
      <StatusBar style='light' />

      <MapViewComponent
        coordinates={detourRoute?.coordinates}
        markers={detourRoute?.markers}
        pois={detourRoute?.pois}
        initialRegion={initialRegion}
        centerOffset={{ x: 0, y: 0.6 }}
        isLoading={isLoading}
      />

      {/* Header */}
      <SafeAreaView style={styles.headerContainer} edges={['top']} pointerEvents="box-none">
        <View pointerEvents="box-none" style={{ zIndex: 5 }}>
          <ScreenHeader
            onBack={handleReset}
            onViewRouteDetails={detourRoute ? handleOpenRouteDetails : undefined}
            currentLocation={lastSearchInputs?.start || 'My Location'}
            destination={lastSearchInputs?.end || 'Destination'}
          />
        </View>
      </SafeAreaView>

      {/* Floating Search Bar */}
      <SafeAreaView style={styles.floatingContainer} edges={['top']} pointerEvents="box-none">
        <View pointerEvents="box-none" style={{ zIndex: 10 }}>
          <View pointerEvents="auto">
            <InputFormComponent
              onFindDetour={handleFindDetour}
              onSearchPOIs={handleSearchPOIs}
              onSelectInterest={handleSelectInterest}
              onTransportModeChange={handleTransportModeChange}
              onReset={handleReset}
              onSaveDetour={() => setSaveModalVisible(true)}
              onSelectPOI={handleSelectPOI}
              onOpenFilter={handleOpenFilterSheet}
              isLoading={isLoading}
              currentLocation={currentLocation}
              detourRoute={detourRoute}
              availablePOITypes={availablePOITypes}
              selectedInterest={selectedInterest}
              selectedPOI={selectedPOI}
              poiCosts={poiCosts}
            />
          </View>
        </View>
      </SafeAreaView>

      <SaveDetourModal
        visible={saveModalVisible}
        onClose={() => setSaveModalVisible(false)}
        onSave={handleSaveDetour}
        poiName={detourRoute?.poi?.name || 'Your Detour'}
      />

      {/* POI Card - Bottom section with animation */}
      {selectedPOI && (
        <Animated.View 
          style={[
            styles.poiCardContainer,
            {
              transform: [
                {
                  translateY: poiCardAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [200, 0], // Slide up from bottom
                  }),
                },
                {
                  scale: poiCardAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1], // Slight scale effect
                  }),
                },
              ],
              opacity: poiCardAnimation,
            },
          ]}
        >
          {/* Dismiss area - tap above card to dismiss */}
          <TouchableOpacity 
            style={styles.dismissArea}
            activeOpacity={1}
            onPress={dismissPOICard}
          />
          
          <POICard
            poi={selectedPOI}
            onViewPhotos={handleViewPhotos}
            onToggleFavorite={handleToggleFavorite}
            onGenerateRoute={() => handleSelectPOI(selectedPOI)}
            isFavorite={favoritePOIs.includes(selectedPOI.name)}
            isLoading={isLoading}
          />
        </Animated.View>
      )}

      {/* POI Bottom Sheet */}
      <POIBottomSheet
        ref={bottomSheetRef}
        poi_list={bottomSheetPOIs}
        isVisible={bottomSheetVisible}
        onSelectPOI={handleSelectPOI}
        onContinueWalking={handleContinueWalking}
        onClose={() => {
          console.log('[ExploreScreen] POI bottom sheet closed');
          setBottomSheetVisible(false);
          logUIState();
        }}
        isLoading={isLoading}
        selectedPOI={selectedPOI}
        detourRoute={detourRoute}
      />

      {/* POI Filter Sheet - TIER 1 POLISH */}
      <POIFilterSheet
        ref={filterSheetRef}
        isVisible={filterSheetVisible}
        onClose={() => {
          console.log('[ExploreScreen] Filter sheet closed');
          setFilterSheetVisible(false);
          logUIState();
        }}
        onApplyFilters={handleApplyFilters}
        initialFilters={activeFilters}
      />

      {/* Route Details Sheet - TIER 1 POLISH */}
      <RouteDetailsSheet
        ref={routeDetailsRef}
        route={detourRoute}
        isVisible={routeDetailsVisible}
        onClose={() => {
          console.log('[ExploreScreen] Route details sheet closed');
          setRouteDetailsVisible(false);
          logUIState();
        }}
        elevationProfile={elevationProfile}
      />

      {/* Hide floating navigation when bottom sheet is visible */}
      {!bottomSheetVisible && (
        <FloatingNavigation
          bottomOffset={36}
          dynamicActions={dynamicActions}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    pointerEvents: 'box-none',
  },
  floatingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    pointerEvents: 'box-none',
  },
  poiCardContainer: {
    position: 'absolute',
    bottom: 120, // More space from bottom to see route clearly
    left: 0,
    right: 0,
    top: 200, // Allow tap area above card
    zIndex: 15,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

