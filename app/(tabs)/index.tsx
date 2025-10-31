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
import SaveDetourModal from '@/components/SaveDetourModal';
import { discoverPOITypes, getBasicRoute, searchPOIsAlongRoute } from '@/services/DetourService';
import { saveDetourLocal } from '@/services/StorageService';
import { theme } from '@/styles/theme';
import { DetourRoute, Interest, Location as LocationType } from '@/types/detour';

export default function ExploreScreen() {
  const [detourRoute, setDetourRoute] = React.useState<DetourRoute | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [saveModalVisible, setSaveModalVisible] = React.useState(false);
  const [currentLocation, setCurrentLocation] = React.useState<LocationType | null>(null);
  const [availablePOITypes, setAvailablePOITypes] = React.useState<{ [key: string]: string }>({});
  const [selectedTransportMode, setSelectedTransportMode] = React.useState<'car' | 'walk' | 'bike' | 'transit'>('car');
  const [lastSearchInputs, setLastSearchInputs] = React.useState<{ start: string; end: string } | null>(null);
  
  // Store inputs for saving
  const [lastInputs, setLastInputs] = React.useState<{
    start: LocationType;
    end: LocationType;
    interest: Interest;
  } | null>(null);

  React.useEffect(() => {
    requestLocationPermission();
  }, []);

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
        id: 'save',
        icon: 'content-save',
        onPress: () => setSaveModalVisible(true),
        bgColor: theme.colors.accent,
        color: theme.colors.card,
      },
      {
        id: 'reset',
        icon: 'refresh',
        onPress: () => {
          setDetourRoute(null);
          setAvailablePOITypes({});
        },
        bgColor: theme.colors.accentLight,
        color: theme.colors.accent,
      },
    ];
  }, [detourRoute, isLoading]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <MapViewComponent
        coordinates={detourRoute?.coordinates}
        markers={detourRoute?.markers}
        pois={detourRoute?.pois}
        initialRegion={initialRegion}
      />

      {/* Floating Search Bar */}
      <SafeAreaView style={styles.floatingContainer} edges={['top']}>
        <InputFormComponent
          onFindDetour={handleFindDetour}
          onSearchPOIs={handleSearchPOIs}
          onTransportModeChange={handleTransportModeChange}
          isLoading={isLoading}
          currentLocation={currentLocation}
          detourRoute={detourRoute}
          availablePOITypes={availablePOITypes}
        />
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

