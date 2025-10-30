import * as Location from 'expo-location';
import React from 'react';
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FloatingNavigation } from '@/components/FloatingNavigation';
import InputFormComponent from '@/components/InputFormComponent';
import MapViewComponent from '@/components/MapViewComponent';
import SaveDetourModal from '@/components/SaveDetourModal';
import { getDetourRoute } from '@/services/DetourService';
import { saveDetourLocal } from '@/services/StorageService';
import { theme } from '@/styles/theme';
import { DetourRoute, Interest, Location as LocationType } from '@/types/detour';

export default function ExploreScreen() {
  const [detourRoute, setDetourRoute] = React.useState<DetourRoute | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [saveModalVisible, setSaveModalVisible] = React.useState(false);
  const [currentLocation, setCurrentLocation] = React.useState<LocationType | null>(null);
  
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
    endInput: string,
    interest: Interest
  ) => {
    setIsLoading(true);
    setDetourRoute(null);

    try {
      const route = await getDetourRoute({ 
        start: startInput, 
        end: endInput, 
        interest 
      });
      setDetourRoute(route);
      
      // Store the actual coordinates from the route
      setLastInputs({ 
        start: route.markers[0], 
        end: route.markers[2], 
        interest 
      });
    } catch (error) {
      console.error('Detour error:', error);
      
      let message = 'An unexpected error occurred. Please try again.';
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
        poi: detourRoute.poi,
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
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }
    : {
        latitude: 34.0522,
        longitude: -118.2437,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <MapViewComponent
        coordinates={detourRoute?.coordinates}
        markers={detourRoute?.markers}
        initialRegion={initialRegion}
      />

      {!detourRoute && (
        <SafeAreaView style={styles.overlayContainer} edges={['top']}>
          <View style={styles.inputCard}>
            <InputFormComponent
              onFindDetour={handleFindDetour}
              isLoading={isLoading}
              currentLocation={currentLocation}
            />
          </View>
        </SafeAreaView>
      )}

      {detourRoute && !isLoading && (
        <SafeAreaView style={styles.bottomContainer} edges={['bottom']}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => setSaveModalVisible(true)}
          >
            <Text style={styles.saveButtonText}>Save Detour</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => setDetourRoute(null)}
          >
            <Text style={styles.resetButtonText}>New Search</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}

      <SaveDetourModal
        visible={saveModalVisible}
        onClose={() => setSaveModalVisible(false)}
        onSave={handleSaveDetour}
        poiName={detourRoute?.poi.name}
      />

      <FloatingNavigation bottomOffset={36} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  inputCard: {
    margin: theme.spacing.md,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
    paddingBottom: 90, // Add space above tab bar
    gap: theme.spacing.sm,
  },
  saveButton: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  saveButtonText: {
    ...theme.typography.button,
    color: theme.colors.textPrimary,
  },
  resetButton: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  resetButtonText: {
    ...theme.typography.button,
    color: theme.colors.textSecondary,
  },
});

