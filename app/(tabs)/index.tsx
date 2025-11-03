/**
 * ExploreScreen - Main orchestration of Detour UX flow
 * Implements the complete user journey from UX_BLUEPRINT_1
 * 
 * Flow: Welcome → Transport → Vibe → Route Preview → Navigation → Reflection
 */

// Global error catching for silent crashes
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (args[0]?.includes?.('Non-serializable values')) {
    console.error('[CRASH WARNING] Non-serializable value detected:', args);
  }
  return originalWarn.apply(console, args);
};

if (typeof window !== 'undefined') {
  window.addEventListener?.('error', (event) => {
    console.error('[GLOBAL ERROR]', event.error);
  });
  window.addEventListener?.('unhandledrejection', (event) => {
    console.error('[UNHANDLED REJECTION]', event.reason);
  });
}

import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Alert,
  StyleSheet,
  View
} from 'react-native';

// New UX Blueprint Components
import { ArrivalReflectionScreen } from '@/components/ArrivalReflectionScreen';
import { EnhancedRoutePreviewScreen } from '@/components/EnhancedRoutePreviewScreen';
import { LoadingScreen } from '@/components/LoadingScreen';
import { MapNavigationScreen } from '@/components/MapNavigationScreen';
import { StoreTypesSelector } from '@/components/StoreTypesSelector';
import { TransportModeSelector } from '@/components/TransportModeSelector';
import { VibeSelector } from '@/components/VibeSelector';
import { WelcomeBottomSheet } from '@/components/WelcomeBottomSheet';

// Legacy Components (still useful)
import { FloatingNavigation } from '@/components/FloatingNavigation';
import { LocationInputFlow } from '@/components/LocationInputFlow';
import MapViewComponent from '@/components/MapViewComponent';
import SaveDetourModal from '@/components/SaveDetourModal';

import { discoverPOITypes, generateDetourWithMultiplePOIs, generateDetourWithPOI, getBasicRoute, searchPOIsAlongRoute } from '@/services/DetourService';
import { saveDetourLocal } from '@/services/StorageService';
import { theme } from '@/styles/theme';
import { DetourRoute, Interest, Location as LocationType, POI, TransportMode, Vibe } from '@/types/detour';

// Flow States (UX_BLUEPRINT_1)
type FlowState = 
  | 'welcome'           // Entry screen
  | 'transport'         // Transport mode selection
  | 'vibe'              // Vibe selection
  | 'destination'       // Destination input (legacy)
  | 'generating'        // Route generation loading
  | 'preview'           // Route preview
  | 'navigation'        // Active navigation
  | 'arrived';          // Reflection/completion

export default function ExploreScreen() {
  // Flow State Management
  const [flowState, setFlowState] = React.useState<FlowState>('welcome');
  const [selectedTransport, setSelectedTransport] = React.useState<TransportMode>('walking');
  const [selectedVibe, setSelectedVibe] = React.useState<Vibe | null>(null);
  
  // Route & Location State
  const [detourRoute, setDetourRoute] = React.useState<DetourRoute | null>(null);
  const [directRoute, setDirectRoute] = React.useState<DetourRoute | null>(null); // Store the original direct route for resetting
  const [isLoading, setIsLoading] = React.useState(false);
  const [saveModalVisible, setSaveModalVisible] = React.useState(false);
  const [currentLocation, setCurrentLocation] = React.useState<LocationType | null>(null);
  const [availablePOITypes, setAvailablePOITypes] = React.useState<{ [key: string]: string }>({});
  const [lastSearchInputs, setLastSearchInputs] = React.useState<{ start: string; end: string; startCoords?: LocationType; endCoords?: LocationType } | null>(null);
  const [selectedPOI, setSelectedPOI] = React.useState<POI | null>(null);
  const [selectedPOIs, setSelectedPOIs] = React.useState<POI[]>([]);
  const [poiCosts, setPoiCosts] = React.useState<{ [key: string]: { extraTime: number; extraDistance: number } }>({});
  const [poisVisited, setPoisVisited] = React.useState<POI[]>([]);
  const [journeyStartTime, setJourneyStartTime] = React.useState<Date | null>(null);

  // Store inputs for saving
  const [lastInputs, setLastInputs] = React.useState<{
    start: LocationType;
    end: LocationType;
    interest: Interest;
  } | null>(null);

  // Cache POI searches by route coordinates + interest to avoid duplicate API calls
  const poiCacheRef = React.useRef<Map<string, POI[]>>(new Map());
  
  // Cache detour routes by POI name to avoid regenerating the same route
  const detourRouteCacheRef = React.useRef<Map<string, any>>(new Map());

  React.useEffect(() => {
    requestLocationPermission();
  }, []);

  // ============================================================================
  // FLOW HANDLERS (UX_BLUEPRINT_1)
  // ============================================================================

  // Welcome Screen → Transport Selection
  const handleStartDetour = () => {
    console.log('[Flow] Welcome → Transport');
    setFlowState('transport');
  };

  const handleBrowseDetours = () => {
    // TODO: Navigate to saved detours screen
    Alert.alert('Coming Soon', 'Browse your saved detours');
  };

  // Transport Selection → Vibe Selection
  const handleTransportSelect = (mode: TransportMode) => {
    console.log(`[Flow] Transport → Vibe (selected: ${mode})`);
    setSelectedTransport(mode);
    setFlowState('vibe');
  };

  // Vibe Selection → Destination Input (or skip to generating)
  const handleVibeSelect = (vibe: Vibe) => {
    console.log(`[Flow] Vibe → Destination (selected: ${vibe})`);
    setSelectedVibe(vibe);
    // For now, go to legacy destination input
    // In full implementation, this would trigger destination modal or use current location
    setFlowState('destination');
  };

  const handleStoreTypeSelect = (storeType: string) => {
    console.log(`[Flow] Store Type → Destination (selected: ${storeType})`);
    // Treat store type as a vibe/interest selection
    setSelectedVibe(storeType as Vibe);
    setFlowState('destination');
  };

  const handleVibeSkip = () => {
    // Default to Local Favorites (UX_BLUEPRINT_2)
    console.log(`[Flow] Vibe → Destination (skipped, default: Local Favorites)`);
    setSelectedVibe('Local Favorites');
    setFlowState('destination');
  };

  // Route Preview Actions
  const handleBeginDetour = () => {
    console.log(`[Flow] Preview → Navigation`);
    setJourneyStartTime(new Date());
    setFlowState('navigation');
  };

  const handleAdjustRoute = () => {
    console.log(`[Flow] GO BACK - returning to vibe selection`);
    // Go back to vibe/store type selection
    setFlowState('vibe');
  };

  const handleSaveForLater = () => {
    console.log(`[Flow] SAVE FOR LATER`);
    setSaveModalVisible(true);
  };

  // Navigation → Arrival
  const handleArrival = () => {
    console.log(`[Flow] Navigation → Arrived`);
    setFlowState('arrived');
  };

  // Reflection Actions
  const handleStartAnother = () => {
    console.log(`[Flow] ANOTHER DETOUR - resetting`);
    handleReset();
    setFlowState('welcome');
  };

  const handleReturnToMap = () => {
    console.log(`[Flow] RETURN TO MAP`);
    setFlowState('destination'); // Or welcome
  };

  const handleReset = () => {
    console.log(`[Flow] RESET all state`);
    setDetourRoute(null);
    setDirectRoute(null);
    setAvailablePOITypes({});
    setLastSearchInputs(null);
    setLastInputs(null);
    setSelectedVibe(null);
    setSelectedPOI(null);
    setSelectedPOIs([]);
    setPoisVisited([]);
    setJourneyStartTime(null);
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
    console.log(`[FindDetour] Starting: ${startInput} → ${endInput} (${selectedTransport})`);
    setIsLoading(true);
    setDetourRoute(null);
    setDirectRoute(null);
    setAvailablePOITypes({});
    // Don't set coordinates yet, we'll update this after getting the route
    setLastSearchInputs({ start: startInput, end: endInput });
    setFlowState('generating'); // Update flow state

    try {
      console.log(`[FindDetour] Fetching route...`);
      const route = await getBasicRoute({
        start: startInput,
        end: endInput,
        mode: selectedTransport === 'driving' ? 'driving' : selectedTransport === 'walking' ? 'walking' : 'bicycling',
      });
      setDetourRoute(route as DetourRoute);
      setDirectRoute(route as DetourRoute); // Store the original direct route for resetting
      console.log(`[FindDetour] Route fetched: ${route.coordinates.length} points`);

      // Update lastSearchInputs with the resolved coordinates from the route
      setLastSearchInputs(prev => prev ? {
        ...prev,
        startCoords: {
          latitude: route.markers[0].latitude,
          longitude: route.markers[0].longitude,
        },
        endCoords: {
          latitude: route.markers[route.markers.length - 1].latitude,
          longitude: route.markers[route.markers.length - 1].longitude,
        },
      } : null);

      // Discover available POI types along the route
      console.log(`[FindDetour] Discovering POI types...`);
      const poiTypes = await discoverPOITypes(route.coordinates, 800);
      setAvailablePOITypes(poiTypes);
      console.log(`[FindDetour] Found ${Object.keys(poiTypes).length} POI types`);

      // Store the actual coordinates from the route
      const firstAvailableType = Object.keys(poiTypes)[0] as Interest || 'Street Art';
      setLastInputs({
        start: route.markers[0],
        end: route.markers[1],
        interest: firstAvailableType
      });

      // Automatically search for POIs based on selected vibe
      if (selectedVibe) {
        console.log(`[FindDetour] Searching POIs for vibe: ${selectedVibe}`);
        await searchPOIsForVibe(route, selectedVibe);
      }
      
      console.log(`[FindDetour] COMPLETE - showing preview`);
      // Transition to preview screen
      setFlowState('preview');
    } catch (error) {
      console.error(`[FindDetour] ERROR:`, error);

      let message = 'An unexpected error occurred. Please try again.';
      if (error instanceof Error) {
        message = error.message;
      }

      console.log(`[FindDetour] FAILED: ${message}`);
      Alert.alert('Error', message);
      setFlowState('destination'); // Stay on destination input
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: Search POIs based on vibe or store type
  const searchPOIsForVibe = async (route: DetourRoute, vibeOrType: string) => {
    console.log(`[SearchPOIs] Searching for: ${vibeOrType}`);
    
    // Check if this is a direct store type (from actual API) or a predefined vibe
    // Map vibes to Google Places API types for searching
    const vibeToInterest: Record<string, string> = {
      'Creative': 'art_gallery',
      'Foodie': 'restaurant',
      'Nature Escape': 'park',
      'History Buff': 'museum',
      'Nightlife': 'bar',
      'Hidden Gems': 'shopping_mall',
      'Local Favorites': 'tourist_attraction',
    };

    // Use direct store type if available, otherwise map from vibe
    const interest = vibeToInterest[vibeOrType] || vibeOrType;
    
    try {
      // Create cache key from route and interest
      const cacheKey = `${route.coordinates.length}_${interest}`;
      
      // Check if we've already searched for this interest on this route
      if (poiCacheRef.current.has(cacheKey)) {
        console.log(`[SearchPOIs] ✓ Using cached POIs for: ${interest}`);
        const cachedPOIs = poiCacheRef.current.get(cacheKey)!;
        
        setDetourRoute(prev => prev ? {
          ...prev,
          poi: cachedPOIs[0] || null,
          pois: cachedPOIs,
          allPOIs: cachedPOIs, // Store all discovered POIs
          interest,
        } : null);
        
        setDirectRoute(prev => prev ? {
          ...prev,
          allPOIs: cachedPOIs,
        } : null);
        
        return;
      }
      
      console.log(`[SearchPOIs] Searching for: ${interest}`);
      const result = await searchPOIsAlongRoute({
        coordinates: route.coordinates,
        interest,
      });
      console.log(`[SearchPOIs] Found ${result.pois?.length || 0} POIs`);
      console.log(`[SearchPOIs] POI names:`, result.pois?.map(p => p.name).join(', '));

      // Store in cache
      poiCacheRef.current.set(cacheKey, result.pois || []);

      setDetourRoute(prev => prev ? {
        ...prev,
        poi: result.poi,
        pois: result.pois,
        allPOIs: result.pois, // Store all discovered POIs
        interest,
      } : null);
      
      // Also update directRoute with allPOIs so deselection reuses cached results
      setDirectRoute(prev => prev ? {
        ...prev,
        allPOIs: result.pois,
      } : null);
      
      console.log(`[SearchPOIs] Route updated with POIs`);
    } catch (error) {
      console.log(`[SearchPOIs] ERROR:`, error);
      // Non-critical; continue anyway
    }
  };

  const handleTransportModeChange = async (mode: 'car' | 'walk' | 'bike' | 'transit') => {
    const transportMode: TransportMode = 
      mode === 'car' ? 'driving' : 
      mode === 'bike' ? 'cycling' : 
      'walking';
    setSelectedTransport(transportMode);

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

    // Create cache key from route and interest
    const cacheKey = `${detourRoute.coordinates.length}_${interest}`;
    
    // Check if we've already searched for this interest on this route
    if (poiCacheRef.current.has(cacheKey)) {
      console.log(`[POISearch] ✓ Using cached POIs for: ${interest}`);
      const cachedPOIs = poiCacheRef.current.get(cacheKey)!;
      
      setDetourRoute(prev => prev ? {
        ...prev,
        poi: cachedPOIs[0] || null,
        pois: cachedPOIs,
        allPOIs: cachedPOIs,
        interest: interest as Interest,
      } : null);

      setDirectRoute(prev => prev ? {
        ...prev,
        allPOIs: cachedPOIs,
      } : null);

      // Update last inputs with new interest
      if (lastInputs) {
        setLastInputs({
          ...lastInputs,
          interest: interest as Interest,
        });
      }

      // Pre-calculate costs for all POIs (without detour route)
      calculatePOICosts(cachedPOIs, lastSearchInputs);
      return;
    }

    setIsLoading(true);
    try {
      console.log(`[POISearch] Fetching POIs for: ${interest}`);
      const result = await searchPOIsAlongRoute({
        coordinates: detourRoute.coordinates,
        interest: interest as Interest,
      });

      // Store in cache
      poiCacheRef.current.set(cacheKey, result.pois || []);

      // Update the detour route with POI data for the selected interest
      setDetourRoute(prev => prev ? {
        ...prev,
        poi: result.poi,
        pois: result.pois,
        allPOIs: result.pois, // Store all discovered POIs
        interest,
      } : null);

      // Also update directRoute with allPOIs so deselection reuses cached results
      setDirectRoute(prev => prev ? {
        ...prev,
        allPOIs: result.pois,
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
    console.log(`[POISelect] ▼ START - POI: "${poi.name}"`);
    console.log(`[POISelect] Current selected: [${selectedPOIs.map(p => p.name).join(', ')}]`);
    
    if (!detourRoute || !lastSearchInputs) {
      console.log(`[POISelect] ✗ Missing detourRoute or lastSearchInputs, returning`);
      return;
    }

    setIsLoading(true);

    try {
      // Check if POI is already selected - if so, remove it
      const isPOISelected = selectedPOIs.some(p => p.name === poi.name);
      console.log(`[POISelect] isPOISelected: ${isPOISelected}`);
      
      let updatedPOIs: POI[];
      if (isPOISelected) {
        updatedPOIs = selectedPOIs.filter(p => p.name !== poi.name);
        console.log(`[POISelect] ✗ Removing: ${poi.name}`);
        console.log(`[POISelect] New list (${updatedPOIs.length}): [${updatedPOIs.map(p => p.name).join(', ')}]`);
      } else {
        // Add the POI to the selection
        updatedPOIs = [...selectedPOIs, poi];
        console.log(`[POISelect] ✓ Adding: ${poi.name}`);
        console.log(`[POISelect] New list (${updatedPOIs.length}): [${updatedPOIs.map(p => p.name).join(', ')}]`);
      }
      
      try {
        setSelectedPOIs(updatedPOIs);
      } catch (stateError) {
        console.error(`[POISelect] ✗ Error setting POIs state:`, stateError);
      }
      
      try {
        setSelectedPOI(poi);
      } catch (stateError) {
        console.error(`[POISelect] ✗ Error setting POI state:`, stateError);
      }

      // Generate optimized route with selected POIs
      if (updatedPOIs.length > 0) {
        try {
          const startForRoute = lastSearchInputs.startCoords || lastSearchInputs.start;
          const endForRoute = lastSearchInputs.endCoords || lastSearchInputs.end;
          
          if (!startForRoute || !endForRoute) {
            throw new Error('Start or end route is missing');
          }

          const modeMap = { driving: 'driving', cycling: 'bicycling', walking: 'walking' } as const;
          
          // If multiple POIs, use the optimized multi-POI route
          if (updatedPOIs.length > 1) {
            console.log(`[POISelect] 🎯 MULTI-POI (${updatedPOIs.length}) - generating optimized route...`);
            console.log(`[POISelect] Using start type: ${typeof startForRoute}, end type: ${typeof endForRoute}`);
            
            try {
              const detourWithMultiplePOIs = await generateDetourWithMultiplePOIs({
                start: startForRoute,
                end: endForRoute,
                pois: updatedPOIs.map(p => ({
                  location: p.location,
                  name: p.name,
                })),
                mode: modeMap[selectedTransport],
              });
              console.log(`[POISelect] 🎯 MULTI-POI route generated, visit order: [${detourWithMultiplePOIs.visitOrder.map(p => p.name).join(' → ')}]`);

              // Reconstruct full POI objects from visitOrder (visitOrder only has name + location)
              const orderedPOIs = detourWithMultiplePOIs.visitOrder.map(visitPOI => {
                const originalPOI = updatedPOIs.find(p => p.name === visitPOI.name);
                return originalPOI || visitPOI;
              });

              // Update the route to show the optimized detour with all POIs
              // IMPORTANT: Keep allPOIs (original discovered list) separate from selected POIs
              setDetourRoute(prev => {
                console.log(`[POISelect] Updating route state with multi-POI detour`);
                if (prev) {
                  return {
                    ...prev,
                    coordinates: detourWithMultiplePOIs.coordinates,
                    encodedPolyline: detourWithMultiplePOIs.encodedPolyline,
                    markers: detourWithMultiplePOIs.markers,
                    pois: orderedPOIs as any,
                    poi: orderedPOIs[0] as any,
                    allPOIs: prev.allPOIs, // Preserve discovered POIs list
                  };
                }
                return prev;
              });
            } catch (multiPoiError) {
              console.error(`[POISelect] ✗ Multi-POI generation failed:`, multiPoiError);
              throw multiPoiError;
            }
          } else {
            console.log(`[POISelect] 🔵 SINGLE-POI - generating standard route...`);
            
            // Check cache first
            const cacheKey = `${updatedPOIs[0].name}`;
            let detourWithPOI = detourRouteCacheRef.current.get(cacheKey);
            
            if (detourWithPOI) {
              console.log(`[POISelect] 🔵 Using cached route for ${updatedPOIs[0].name}`);
              // Create a fresh copy of the cached object to avoid stale references
              detourWithPOI = {
                coordinates: [...detourWithPOI.coordinates],
                encodedPolyline: detourWithPOI.encodedPolyline,
                markers: detourWithPOI.markers.map((m: any) => ({ ...m })),
                extraDistance: detourWithPOI.extraDistance,
                extraTime: detourWithPOI.extraTime,
                directDistance: detourWithPOI.directDistance,
                directTime: detourWithPOI.directTime,
              };
              console.log(`[POISelect] 🔵 Cached route copied and ready to use`);
            } else {
              // Not in cache, generate it
              try {
                detourWithPOI = await generateDetourWithPOI({
                  start: startForRoute,
                  end: endForRoute,
                  poi: {
                    location: updatedPOIs[0].location,
                    name: updatedPOIs[0].name,
                  },
                  mode: modeMap[selectedTransport],
                });
                // Store in cache
                detourRouteCacheRef.current.set(cacheKey, detourWithPOI);
                console.log(`[POISelect] 🔵 SINGLE-POI route generated and cached`);
              } catch (generateError) {
                console.error(`[POISelect] ✗ Route generation failed:`, generateError);
                throw generateError;
              }
            }

            // Update the route to show the detour
            setDetourRoute(prev => {
              console.log(`[POISelect] Updating route state with single-POI detour`);
              if (prev) {
                // Ensure allPOIs is preserved (it should come from directRoute reset)
                const currentAllPOIs = prev.allPOIs || [];
                console.log(`[POISelect] Current allPOIs count: ${currentAllPOIs.length}`);
                
                return {
                  ...prev,
                  coordinates: detourWithPOI.coordinates,
                  encodedPolyline: detourWithPOI.encodedPolyline,
                  markers: detourWithPOI.markers,
                  pois: [updatedPOIs[0]],
                  poi: updatedPOIs[0],
                  allPOIs: currentAllPOIs, // Preserve discovered POIs list
                };
              }
              console.warn(`[POISelect] ✗ prev is null, cannot update route state`);
              return prev;
            });
          }
        } catch (error) {
          console.error(`[POISelect] ✗ Error generating route:`, error);
          // Restore previous state on error
          setIsLoading(false);
          Alert.alert('Error', `Failed to generate route: ${error instanceof Error ? error.message : String(error)}`);
          return;
        }
      } else {
        console.log(`[POISelect] ⭕ NO POIS - resetting to direct route`);
        // No POIs selected, reset to direct route
        setDetourRoute(prev => {
          console.log(`[POISelect] Resetting route to direct`);
          
          // Ensure we have a valid directRoute with preserved allPOIs
          if (!directRoute) {
            console.warn(`[POISelect] ✗ directRoute is null, cannot reset`);
            return prev;
          }
          
          // Preserve allPOIs from current route, or use from directRoute
          const preservedPOIs = prev?.allPOIs || directRoute.allPOIs || [];
          console.log(`[POISelect] Preserving ${preservedPOIs.length} POIs through deselection`);
          
          return {
            ...directRoute,
            allPOIs: preservedPOIs, // Preserve the discovered POIs list
            poi: undefined,
            pois: undefined,
          };
        });
        console.log(`[POISelect] Route reset to direct route`);
      }
    } catch (error) {
      console.error(`[POISelect] ✗ Exception:`, error);
      Alert.alert('Error', `An error occurred: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
      console.log(`[POISelect] ▲ END\n`);
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

      {/* ============================================================================ */}
      {/* FLOW STATE RENDERING (UX_BLUEPRINT_1) */}
      {/* ============================================================================ */}

      {/* NAVIGATION STATE - Full-screen live navigation with MapNavigationScreen */}
      {flowState === 'navigation' && detourRoute && selectedVibe && (
        <MapNavigationScreen
          route={detourRoute}
          vibe={selectedVibe}
          currentLocation={currentLocation}
          pois={detourRoute.pois}
          selectedPOI={selectedPOI}
          onArrived={handleArrival}
          onCancel={handleReturnToMap}
          transportMode={selectedTransport}
        />
      )}

      {/* BASE STATES - Map view with floating UI (welcome, transport, vibe, destination) */}
      {(flowState === 'welcome' || flowState === 'transport' || flowState === 'vibe' || flowState === 'destination') && (
        <>
          <MapViewComponent
            coordinates={detourRoute?.coordinates}
            markers={detourRoute?.markers}
            pois={detourRoute?.pois}
            initialRegion={initialRegion}
            centerOffset={{ x: 0, y: 0.6 }}
            isLoading={isLoading}
          />

          {/* Floating UI - Show location input when no route yet (destination state) */}
          {flowState === 'destination' && !detourRoute && (
            <View style={styles.floatingContainer}>
              <LocationInputFlow
                selectedTransport={selectedTransport}
                selectedVibe={selectedVibe || 'Local Favorites'}
                currentLocation={currentLocation}
                onSubmit={handleFindDetour}
                onBack={() => setFlowState('vibe')}
                isLoading={isLoading}
              />
            </View>
          )}

          <FloatingNavigation
            bottomOffset={36}
            dynamicActions={dynamicActions}
          />
        </>
      )}

      {/* 1. Welcome Bottom Sheet - Non-dismissible overlay */}
      <WelcomeBottomSheet
        visible={flowState === 'welcome'}
        onStartDetour={handleStartDetour}
        onBrowseDetours={handleBrowseDetours}
      />

      {/* 1.5. Loading Screen - Route & POI Discovery */}
      <LoadingScreen
        visible={flowState === 'generating'}
      />

      {/* 2. Transport Mode Selection - Bottom Sheet */}
      <TransportModeSelector
        visible={flowState === 'transport'}
        onSelect={handleTransportSelect}
        onClose={() => setFlowState('welcome')}
      />

      {/* 3. Store Types Selection - Bottom Sheet (shows actual found POI types) */}
      {Object.keys(availablePOITypes).length > 0 ? (
        <StoreTypesSelector
          visible={flowState === 'vibe'}
          storeTypes={availablePOITypes}
          onSelect={handleStoreTypeSelect}
          onSkip={handleVibeSkip}
          onClose={() => setFlowState('transport')}
        />
      ) : (
        // Fallback to Vibe Selector if no specific POI types discovered
        <VibeSelector
          visible={flowState === 'vibe'}
          onSelect={handleVibeSelect}
          onSkip={handleVibeSkip}
          onClose={() => setFlowState('transport')}
          availablePOITypes={availablePOITypes}
        />
      )}

      {/* 4. Route Preview - Enhanced with animations */}
      {flowState === 'preview' && detourRoute && selectedVibe && (
        <>
          {console.log(`[RENDER] Preview screen with ${(detourRoute.allPOIs?.length || detourRoute.pois?.length || 0)} POIs`)}
          <EnhancedRoutePreviewScreen
            route={detourRoute}
            vibe={selectedVibe}
            pois={detourRoute.allPOIs || detourRoute.pois}
            selectedPOIs={selectedPOIs}
            isLoading={isLoading}
            onBeginDetour={handleBeginDetour}
            onAdjustRoute={handleAdjustRoute}
            onSaveForLater={handleSaveForLater}
            onSelectPOI={handleSelectPOI}
          />
        </>
      )}

      {/* 5. Arrival & Reflection */}
      {flowState === 'arrived' && detourRoute && selectedVibe && (
        <ArrivalReflectionScreen
          route={detourRoute}
          vibe={selectedVibe}
          poisVisited={poisVisited}
          timeSpent={journeyStartTime ? Math.round((new Date().getTime() - journeyStartTime.getTime()) / 60000) : 0}
          onStartAnother={handleStartAnother}
          onReturnToMap={handleReturnToMap}
          onSaveDetour={() => setSaveModalVisible(true)}
        />
      )}

      {/* Save Detour Modal */}
      <SaveDetourModal
        visible={saveModalVisible}
        onClose={() => setSaveModalVisible(false)}
        onSave={handleSaveDetour}
        poiName={detourRoute?.poi?.name || 'Your Detour'}
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
  navigationActions: {
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.lg,
  },
  arrivalButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  arrivalButtonText: {
    ...theme.typography.button,
    color: theme.colors.textInverse,
  },
});

