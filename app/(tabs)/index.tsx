import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Alert,
  StyleSheet,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FloatingNavigation } from '@/components/FloatingNavigation';
import InputFormComponent from '@/components/InputFormComponent';
import MapViewComponent from '@/components/MapViewComponent';
import POIInterestsBar from '@/components/POIInterestsBar';
// import POISelectionSheet from '@/components/POISelectionSheet';
// import QuickSummaryBar from '@/components/QuickSummaryBar';
import SaveDetourModal from '@/components/SaveDetourModal';
import { discoverPOITypes, generateDetourWithPOI, getBasicRoute, searchPOIsAlongRoute } from '@/services/DetourService';
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
  const [poiCosts, setPoiCosts] = React.useState<{ [key: string]: { extraTime: number; extraDistance: number } }>({});

  // Store inputs for saving
  const [lastInputs, setLastInputs] = React.useState<{
    start: LocationType;
    end: LocationType;
    interest: Interest;
  } | null>(null);

  React.useEffect(() => {
    requestLocationPermission();
  }, []);

  const handleReset = () => {
    setDetourRoute(null);
    setAvailablePOITypes({});
    setLastSearchInputs(null);
    setLastInputs(null);
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

    try {
      const route = await getBasicRoute({
        start: startInput,
        end: endInput,
        mode: selectedTransportMode === 'car' ? 'driving' : selectedTransportMode === 'walk' ? 'walking' : selectedTransportMode === 'bike' ? 'bicycling' : 'transit',
      });
      setDetourRoute(route as DetourRoute);

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
    } catch (error) {
      console.error('Route error:', error);

      let message = 'An unexpected error occurred. Please try again.';
      if (error instanceof Error) {
        message = error.message;
      }

      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransportModeChange = async (mode: 'car' | 'walk' | 'bike' | 'transit') => {
    setSelectedTransportMode(mode);

    // If we have a previous search, update the route with the new mode
    if (lastSearchInputs) {
      setIsLoading(true);
      try {
        const modeMap = { car: 'driving', walk: 'walking', bike: 'bicycling', transit: 'transit' } as const;
        const route = await getBasicRoute({
          start: lastSearchInputs.start,
          end: lastSearchInputs.end,
          mode: modeMap[mode],
        });
        setDetourRoute(route as DetourRoute);
      } catch (error) {
        console.error('Route update error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSearchPOIs = async (interest: string) => {
    if (!detourRoute?.coordinates) return;

    setIsLoading(true);
    try {
      const result = await searchPOIsAlongRoute({
        coordinates: detourRoute.coordinates,
        interest: interest as Interest,
      });

      // Update the detour route with POI data for the selected interest
      setDetourRoute(prev => prev ? {
        ...prev,
        poi: result.poi,
        pois: result.pois,
        interest,
      } : null);

      // Update last inputs with new interest
      if (lastInputs) {
        setLastInputs({
          ...lastInputs,
          interest: interest as Interest,
        });
      }

      // Pre-calculate costs for all POIs (without detour route)
      calculatePOICosts(result.pois, lastSearchInputs);
    } catch (error) {
      console.error('POI search error:', error);
      let message = 'Could not find POIs for this interest. Try another category.';
      if (error instanceof Error) {
        message = error.message;
      }
      Alert.alert('Error', message);
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
      Alert.alert('Success', 'Detour saved successfully!');
    } catch (error) {
      throw new Error('Failed to save detour');
    }
  };

  const handleSelectPOI = async (poi: POI) => {
    if (!detourRoute || !lastSearchInputs) return;

    setIsLoading(true);

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

      setSelectedPOI(poi);
    } catch (error) {
      console.error('Error selecting POI:', error);
      Alert.alert('Error', 'Could not update route with this POI');
    } finally {
      setIsLoading(false);
    }
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
      <StatusBar style='dark' />

      <MapViewComponent
        coordinates={detourRoute?.coordinates}
        markers={detourRoute?.markers}
        pois={detourRoute?.pois}
        initialRegion={initialRegion}
        centerOffset={{ x: 0, y: 0.6 }}
        isLoading={isLoading}
      />

      {/* Floating Search Bar */}
      <SafeAreaView style={styles.floatingContainer} edges={['top']}>
        <InputFormComponent
          onFindDetour={handleFindDetour}
          onSearchPOIs={handleSearchPOIs}
          onTransportModeChange={handleTransportModeChange}
          onReset={handleReset}
          onSaveDetour={() => setSaveModalVisible(true)}
          onSelectPOI={handleSelectPOI}
          isLoading={isLoading}
          currentLocation={currentLocation}
          detourRoute={detourRoute}
          availablePOITypes={availablePOITypes}
          selectedPOI={selectedPOI}
          poiCosts={poiCosts}
        />

        {/* POI Interests Bar - Show when route is available and POI types are discovered */}
        {detourRoute && Object.keys(availablePOITypes).length > 0 && (
          <POIInterestsBar
            visible={true}
            dynamicInterests={Object.values(availablePOITypes)}
            selectedInterest={''}
            poiTypeMap={availablePOITypes}
            onSelectInterest={handleSearchPOIs}
            isLoading={isLoading}
          />
        )}
      </SafeAreaView>

      <SaveDetourModal
        visible={saveModalVisible}
        onClose={() => setSaveModalVisible(false)}
        onSave={handleSaveDetour}
        poiName={detourRoute?.poi?.name || 'Your Detour'}
      />

      <FloatingNavigation
        bottomOffset={36}
        dynamicActions={dynamicActions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  floatingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
});

