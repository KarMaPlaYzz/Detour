import { reverseGeocodeLocation } from '@/services/DetourService';
import { theme } from '@/styles/theme';
import { Interest, Location } from '@/types/detour';
import { BlurView } from 'expo-blur';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '../../components/ui/icon-symbol';
import BottomSheet from './BottomSheet';
import InlinePOIList from './InlinePOIList';
import TransportModeBar from './TransportModeBar';

/**
 * Format duration in seconds to a human-readable string
 * Returns hours and minutes for longer durations, or just minutes for shorter ones
 */
function formatDuration(seconds: number | undefined): string {
  if (!seconds || seconds <= 0) return '—';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (seconds < 60) {
    return `1m`;
  }

  return `${minutes} m`;
}

/**
 * Get color based on traffic delay percentage
 * Returns white when no delay, or traffic severity color with granular thresholds
 */
function getTrafficColor(normalDuration: number | undefined, trafficDuration: number | undefined): string {
  if (!normalDuration || !trafficDuration) return '#FFFFFF'; // White: no traffic data
  
  const delayPercentage = ((trafficDuration - normalDuration) / normalDuration) * 100;
  
  if (delayPercentage <= 0) return theme.colors.textTertiary; // White: no delay
  if (delayPercentage <= 5) return '#66BB6A'; // Light green: minimal delay (0-5%)
  if (delayPercentage <= 10) return '#FDD835'; // Yellow: light traffic (5-10%)
  if (delayPercentage <= 15) return '#FFB74D'; // Light orange: moderate traffic (10-15%)
  if (delayPercentage <= 25) return '#FF9800'; // Orange: moderate-heavy traffic (15-25%)
  if (delayPercentage <= 35) return '#F4511E'; // Deep orange: heavy traffic (25-35%)
  return '#E53935'; // Red: severe traffic (>35%)
}

interface InputFormComponentProps {
  onFindDetour: (start: string, end: string) => void;
  onSearchPOIs?: (interest: string) => void;
  onTransportModeChange?: (mode: 'car' | 'walk' | 'bike' | 'transit') => void;
  onReset?: () => void;
  onSaveDetour?: () => void;
  onSelectPOI?: (poi: any) => void;
  isLoading?: boolean;
  currentLocation?: Location | null;
  detourRoute?: any | null;
  availablePOITypes?: { [key: string]: string };
  selectedPOI?: any | null;
  poiCosts?: { [key: string]: { extraTime: number; extraDistance: number } };
}

const INTERESTS: Interest[] = ['Street Art', 'Architecture', 'Cafes'];

// Map POI categories to interests
const POI_CATEGORY_MAP: { [key: string]: Interest } = {
  'street art': 'Street Art',
  'art': 'Street Art',
  'mural': 'Street Art',
  'graffiti': 'Street Art',
  'architecture': 'Architecture',
  'building': 'Architecture',
  'monument': 'Architecture',
  'historic': 'Architecture',
  'cafe': 'Cafes',
  'coffee': 'Cafes',
  'restaurant': 'Cafes',
  'bar': 'Cafes',
};

export default function InputFormComponent({
  onFindDetour,
  onSearchPOIs,
  onTransportModeChange,
  onReset,
  onSaveDetour,
  onSelectPOI,
  isLoading = false,
  currentLocation,
  detourRoute,
  availablePOITypes = {},
  selectedPOI,
  poiCosts = {},
}: InputFormComponentProps) {
  const insets = useSafeAreaInsets();
  const [endInput, setEndInput] = useState('');
  const [startInput, setStartInput] = useState('');
  const [selectedInterest, setSelectedInterest] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasRoute, setHasRoute] = useState(false);
  const [dynamicInterests, setDynamicInterests] = useState<string[]>([]);
  const [poiTypeMap, setPoiTypeMap] = useState<{ [key: string]: string }>({});
  const prevPoiTypesRef = useRef<string>('');
  const [suggestions, setSuggestions] = useState<Array<{mainText: string, secondaryText: string, fullDescription: string}>>([]);
  const [activeSuggestionsField, setActiveSuggestionsField] = useState<'from' | 'to' | null>(null);
  const endInputRef = useRef<TextInput>(null);
  const startInputRef = useRef<TextInput>(null);
  const clearButtonAnimRef = useRef(new Animated.Value(0));
  const suggestionsAnimRef = useRef(new Animated.Value(0));
  const headerAnimRef = useRef(new Animated.Value(0));
  const collapseAnimRef = useRef(new Animated.Value(0));
  const summaryVisibilityRef = useRef(new Animated.Value(1));
  const prevHasRouteRef = useRef(false);
  const isUpdatingRouteRef = useRef(false);
  const [wasEmpty, setWasEmpty] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [endInputFocused, setEndInputFocused] = useState(false);
  const [startInputFocused, setStartInputFocused] = useState(false);
  const [selectedTransportMode, setSelectedTransportMode] = useState<'car' | 'walk' | 'bike' | 'transit'>('walk');
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [showPOIBottomSheet, setShowPOIBottomSheet] = useState(false);
  const isFormExpandedRef = useRef(false);
  const [focusOnExpand, setFocusOnExpand] = useState<'start' | 'end' | null>(null);
  const hasPopulatedStartLocationRef = useRef(false);
  const userEditedStartLocationRef = useRef(false);

  // Log component mount
  useEffect(() => {
    console.log('[InputFormComponent] Mounted');
    return () => {
      console.log('[InputFormComponent] Unmounted');
    };
  }, []);

  // Log state changes for debugging
  useEffect(() => {
    console.log('[State] startInput:', startInput, 'endInput:', endInput, 'hasRoute:', hasRoute, 'isFormExpanded:', isFormExpanded);
  }, [startInput, endInput, hasRoute, isFormExpanded]);

  // Update interests when available POI types change
  useEffect(() => {
    if (detourRoute && Object.keys(availablePOITypes).length > 0) {
      const poiTypesKey = JSON.stringify(availablePOITypes);
      
      // Only reset if the POI types have actually changed
      if (poiTypesKey !== prevPoiTypesRef.current) {
        prevPoiTypesRef.current = poiTypesKey;
        // Store the raw type -> formatted name mapping
        setPoiTypeMap(availablePOITypes);
        
        // Get formatted names for display
        const interestNames = Object.values(availablePOITypes);
        setDynamicInterests(interestNames);
        // Don't auto-select any interest - let user choose
        setSelectedInterest('');
      }
    } else {
      setDynamicInterests([]);
      setPoiTypeMap({});
      setSelectedInterest('');
      prevPoiTypesRef.current = '';
    }
  }, [availablePOITypes, detourRoute]);

  // Animate clear button in/out - only when visibility state changes
  useEffect(() => {
    const isEmpty = endInput.length === 0;
    
    if (isEmpty !== wasEmpty) {
      setWasEmpty(isEmpty);
      
      if (isEmpty) {
        // When input becomes empty, trigger clearing animation
        clearButtonAnimRef.current.setValue(1);
        setIsClearing(true);
        Animated.timing(clearButtonAnimRef.current, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start(() => {
          setIsClearing(false);
        });
      } else {
        // When input becomes non-empty, roll in animation
        clearButtonAnimRef.current.setValue(0);
        Animated.timing(clearButtonAnimRef.current, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    }
  }, [endInput.length, wasEmpty]);

  const handleClearInput = () => {
    setIsClearing(true);
    setEndInput('');
    setSuggestions([]);
    setActiveSuggestionsField(null);
  };

  // Hide suggestions when keyboard hides AND input is not focused
  useEffect(() => {
    const keyboardDidHide = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        if (!endInputFocused && !startInputFocused) {
          setSuggestions([]);
          setActiveSuggestionsField(null);
        }
      }
    );

    return () => {
      keyboardDidHide.remove();
    };
  }, [endInputFocused, startInputFocused]);

  // Animate suggestions appearing/disappearing
  useEffect(() => {
    if (suggestions.length > 0) {
      suggestionsAnimRef.current.setValue(0);
      Animated.timing(suggestionsAnimRef.current, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(suggestionsAnimRef.current, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  }, [suggestions.length]);

  // Helper function to check if a string is coordinates (lat,lng format)
  const isCoordinateString = (str: string): boolean => {
    const coordPattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
    return coordPattern.test(str.trim());
  };

  // Detect route changes
  useEffect(() => {
    if (detourRoute) {
      console.log('[Route Detection] Route detected');
      setHasRoute(true);
      setIsFormExpanded(false); // Collapse form when route is first found
      Animated.timing(headerAnimRef.current, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
      
      // Populate start location from current location only on first route calculation
      // and only if user hasn't manually edited the start location
      // Also replace coordinates-only strings with reverse-geocoded addresses
      const startIsCoordinates = isCoordinateString(startInput);
      const shouldPopulate = !hasPopulatedStartLocationRef.current && !userEditedStartLocationRef.current && currentLocation;
      const shouldReplaceCoordinates = startIsCoordinates && !userEditedStartLocationRef.current && !hasPopulatedStartLocationRef.current;
      
      if ((shouldPopulate && !startInput.trim()) || shouldReplaceCoordinates) {
        console.log('[Route Detection] Auto-populating start location from current location');
        console.log('[Route Detection] hasPopulatedStartLocationRef:', hasPopulatedStartLocationRef.current);
        console.log('[Route Detection] userEditedStartLocationRef:', userEditedStartLocationRef.current);
        console.log('[Route Detection] startInput:', startInput);
        console.log('[Route Detection] startIsCoordinates:', startIsCoordinates);
        
        if (currentLocation) {
          reverseGeocodeLocation(currentLocation).then((address) => {
            if (address) {
              console.log('[Route Detection] Reverse geocoded address:', address);
              setStartInput(address);
              hasPopulatedStartLocationRef.current = true;
            }
          }).catch((error) => {
            console.error('Error reverse geocoding current location:', error);
          });
        }
      } else {
        console.log('[Route Detection] NOT auto-populating start location');
        console.log('[Route Detection] Reasons: hasPopulated=', hasPopulatedStartLocationRef.current, 'userEdited=', userEditedStartLocationRef.current, 'startInput=', startInput, 'hasCurrentLocation=', !!currentLocation);
      }
    } else {
      console.log('[Route Detection] No route detected - resetting flags');
      setHasRoute(false);
      Animated.timing(headerAnimRef.current, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      // Reset the flags when no route is found
      hasPopulatedStartLocationRef.current = false;
      userEditedStartLocationRef.current = false;
    }
  }, [detourRoute, currentLocation]);

  // Animate form expand/collapse
  useEffect(() => {
    // Collapse form when loading starts
    const shouldCollapse = isLoading || !isFormExpanded;
    const targetExpanded = isFormExpanded && !isLoading;
    
    isFormExpandedRef.current = targetExpanded;
    
    // Stop any ongoing animation first
    collapseAnimRef.current.stopAnimation(() => {
      // Then start the new animation
      Animated.timing(collapseAnimRef.current, {
        toValue: targetExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });

    // Focus the appropriate input after expansion
    if (targetExpanded && focusOnExpand) {
      setTimeout(() => {
        if (focusOnExpand === 'start') {
          startInputRef.current?.focus();
        } else if (focusOnExpand === 'end') {
          endInputRef.current?.focus();
        }
        setFocusOnExpand(null);
      }, 350);
    }
  }, [isFormExpanded, focusOnExpand, isLoading]);

  // Auto-focus end input when expanded
  useEffect(() => {
    if (isExpanded && endInputRef.current && !hasRoute) {
      setTimeout(() => {
        endInputRef.current?.focus();
      }, 100);
    }
  }, [isExpanded, hasRoute]);

  // Focus start input when it's focused state changes
  useEffect(() => {
    if (startInputFocused && hasRoute) {
      console.log('[Focus] Start input focused');
      setTimeout(() => {
        startInputRef.current?.focus();
      }, 50);
    }
  }, [startInputFocused, hasRoute]);

  // Focus end input when it's focused state changes
  useEffect(() => {
    if (endInputFocused && hasRoute) {
      console.log('[Focus] End input focused');
      setTimeout(() => {
        endInputRef.current?.focus();
      }, 50);
    }
  }, [endInputFocused, hasRoute]);

  // Handle explicit reset from parent
  useEffect(() => {
    if (onReset) {
      // This effect doesn't depend on detourRoute, just ensures we have the callback
      // The actual reset logic is handled by the hasRoute effect below
    }
  }, [onReset]);

  // Handle reset from parent - only clear when transitioning from route found to no route
  // BUT NOT if we're in the middle of searching for a new route
  useEffect(() => {
    if (prevHasRouteRef.current && !hasRoute && !isLoading) {
      // We had a route but now we don't - AND we're not loading a new route
      // This means the user cleared the route intentionally
      console.log('[Route State] Clearing inputs because route was cleared and not loading');
      setEndInput('');
      setStartInput('');
      setSuggestions([]);
      setActiveSuggestionsField(null);
      isUpdatingRouteRef.current = false;
    } else if (prevHasRouteRef.current && !hasRoute && isLoading) {
      console.log('[Route State] Route cleared but isLoading=true, preserving inputs for new search');
    }
    prevHasRouteRef.current = hasRoute;
  }, [hasRoute, isLoading]);

  // Animate summary visibility based on loading state
  useEffect(() => {
    // Stop any ongoing animation first
    summaryVisibilityRef.current.stopAnimation(() => {
      // Then start the new animation
      Animated.timing(summaryVisibilityRef.current, {
        toValue: isLoading ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }, [isLoading]);

  // Fetch place suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        console.warn('Google Maps API key not configured in EXPO_PUBLIC_GOOGLE_MAPS_API_KEY');
        return;
      }

      // Build URL with location biasing if we have current location
      let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}`;
      
      if (currentLocation) {
        // Add location bias to prioritize results near user
        // radius in meters (50km = 5000m)
        url += `&location=${currentLocation.latitude},${currentLocation.longitude}&radius=50000`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.predictions) {
        setSuggestions(data.predictions.map((p: any) => {
          // Use structured formatting if available (most reliable)
          if (p.structured_formatting?.main_text) {
            return {
              mainText: p.structured_formatting.main_text.trim(),
              secondaryText: p.structured_formatting.secondary_text?.trim() || '',
              fullDescription: p.description,
            };
          }
          
          // Fallback: manually parse description if no structured formatting
          // Split by comma and separate primary from secondary location
          const parts = p.description.split(',').map((part: string) => part.trim());
          if (parts.length > 1) {
            // First part is usually the place name, rest is location hierarchy
            return {
              mainText: parts[0],
              secondaryText: parts.slice(1).join(', '),
              fullDescription: p.description,
            };
          }
          
          // Single-part description (shouldn't happen often)
          return {
            mainText: p.description,
            secondaryText: '',
            fullDescription: p.description,
          };
        }));
      } else if (data.error_message) {
        console.error('API Error:', data.error_message);
      }
    } catch (error) {
      console.error('Autocomplete error:', error);
    }
  }, [currentLocation]);

  // Handle end input change with suggestions
  const handleEndInputChange = useCallback((text: string) => {
    console.log('[handleEndInputChange] End input changed to:', text);
    setEndInput(text);
    setActiveSuggestionsField('to');
    fetchSuggestions(text);
  }, [fetchSuggestions]);

  // Handle start input change with suggestions
  const handleStartInputChange = useCallback((text: string) => {
    console.log('[handleStartInputChange] Start input changed to:', text);
    setStartInput(text);
    // Mark that user has manually edited the start location
    if (text.trim()) {
      console.log('[handleStartInputChange] Marking start location as user-edited');
      userEditedStartLocationRef.current = true;
    }
    setActiveSuggestionsField('from');
    fetchSuggestions(text);
  }, [fetchSuggestions]);

  // Handle end or start input focus to expand form
  useEffect(() => {
    if ((endInputFocused || startInputFocused) && hasRoute) {
      setIsFormExpanded(true);
    }
  }, [endInputFocused, startInputFocused, hasRoute]);

  const handleSuggestionSelect = (suggestion: string) => {
    console.log('[handleSuggestionSelect] Called with suggestion:', suggestion);
    console.log('[handleSuggestionSelect] activeSuggestionsField:', activeSuggestionsField);
    console.log('[handleSuggestionSelect] Current startInput:', startInput);
    console.log('[handleSuggestionSelect] Current endInput:', endInput);
    
    if (activeSuggestionsField === 'to') {
      console.log('[handleSuggestionSelect] Processing END destination selection');
      const newEndInput = suggestion;
      const currentStartInput = startInput.trim();
      
      console.log('[handleSuggestionSelect] Before setState - newEndInput:', newEndInput);
      console.log('[handleSuggestionSelect] Before setState - currentStartInput:', currentStartInput);
      
      // Update state first
      setEndInput(newEndInput);
      setStartInput(currentStartInput);
      setEndInputFocused(false);
      endInputRef.current?.blur();
      setSuggestions([]);
      setActiveSuggestionsField(null);
      
      // Trigger search with calculated values
      let startValue = currentStartInput;
      if (!startValue && currentLocation) {
        startValue = `${currentLocation.latitude},${currentLocation.longitude}`;
        console.log('[handleSuggestionSelect] Using current location as start:', startValue);
        setStartInput(startValue);
      }
      
      // Only call onFindDetour if BOTH start and end are filled
      if (startValue && newEndInput.trim()) {
        console.log('[handleSuggestionSelect] Calling onFindDetour with:', { startValue, newEndInput });
        isUpdatingRouteRef.current = true;
        onFindDetour(startValue, newEndInput);
      } else {
        console.log('[handleSuggestionSelect] Skipping search - missing start or end location');
      }
      
      // Collapse form after a brief delay to allow state to settle
      setTimeout(() => {
        console.log('[handleSuggestionSelect] Collapsing form after 100ms delay');
        setIsFormExpanded(false);
      }, 100);
    } else if (activeSuggestionsField === 'from') {
      console.log('[handleSuggestionSelect] Processing START location selection');
      const newStartInput = suggestion;
      const currentEndInput = endInput.trim();
      
      console.log('[handleSuggestionSelect] Before setState - newStartInput:', newStartInput);
      console.log('[handleSuggestionSelect] Before setState - currentEndInput:', currentEndInput);
      
      // Update state first
      setStartInput(newStartInput);
      setEndInput(currentEndInput);
      setStartInputFocused(false);
      startInputRef.current?.blur();
      userEditedStartLocationRef.current = true;
      setSuggestions([]);
      setActiveSuggestionsField(null);
      
      console.log('[handleSuggestionSelect] userEditedStartLocationRef set to true');
      
      // Only call onFindDetour if BOTH start and end are filled
      if (newStartInput.trim() && currentEndInput) {
        console.log('[handleSuggestionSelect] End input exists, calling onFindDetour');
        isUpdatingRouteRef.current = true;
        onFindDetour(newStartInput, currentEndInput);
      } else {
        console.log('[handleSuggestionSelect] Skipping search - missing start or end location');
      }
      
      // Collapse form after a brief delay to allow state to settle
      setTimeout(() => {
        console.log('[handleSuggestionSelect] Collapsing form after 100ms delay');
        setIsFormExpanded(false);
      }, 100);
    }
  };

  const handleSwap = () => {
    const temp = startInput;
    setStartInput(endInput);
    setEndInput(temp);
  };

  const handleManualSearch = () => {
    if (startInput.trim() && endInput.trim()) {
      onFindDetour(startInput, endInput);
    }
  };

  return (
    <View style={styles.container}>
      {/* Animated Header - Contains both search and form */}
      <Animated.View 
        style={[
          styles.searchHeader, 
          { 
            paddingTop: insets.top, 
            marginTop: -insets.top,
            backgroundColor: headerAnimRef.current.interpolate({
              inputRange: [0, 1],
              outputRange: ['transparent', theme.colors.card],
            }),
            opacity: summaryVisibilityRef.current,
            pointerEvents: isLoading ? 'none' : 'auto',
          }
        ]}
      >
        {/* Search Bar - Shows when no route */}
        {!hasRoute && (
          <BlurView style={styles.suggestionsBlur} tint="dark" intensity={80}> 
            <Animated.View
              style={{
                opacity: headerAnimRef.current.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
              }}
            >
              <TouchableOpacity 
                style={styles.searchField}
                activeOpacity={0.7}
              >
                <IconSymbol name="magnifyingglass" size={18} color={theme.colors.textSecondary} />
                <TextInput
                  ref={endInputRef}
                  style={styles.destinationInput}
                  placeholder="Search destination"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={endInput}
                  onChangeText={handleEndInputChange}
                  onFocus={() => setEndInputFocused(true)}
                  onBlur={() => setEndInputFocused(false)}
                  autoCapitalize="words"
                />
                {(endInput.length > 0 || isClearing) && (
                  <Animated.View
                    style={[
                      {
                        opacity: clearButtonAnimRef.current,
                        transform: [
                          {
                            rotateZ: clearButtonAnimRef.current.interpolate({
                              inputRange: [0, 1],
                              outputRange: [isClearing ? '90deg' : '-90deg', '0deg'],
                            }),
                          },
                          {
                            scale: clearButtonAnimRef.current.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.6, 1],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <TouchableOpacity 
                      onPress={handleClearInput}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <IconSymbol name="xmark" size={18} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </TouchableOpacity>

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                
                <Animated.View style={{
                    opacity: suggestionsAnimRef.current,
                    maxHeight: suggestionsAnimRef.current.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 500],
                    }),
                    transform: [{
                      translateY: suggestionsAnimRef.current.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-10, 0],
                      }),
                    }],
                  }}>
                      <View style={styles.suggestionsContainer}>
                        {suggestions.slice(0, 5).map((item, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.suggestionItem}
                            onPress={() => handleSuggestionSelect(item.fullDescription)}
                          >
                            <IconSymbol name="location" size={16} color={theme.colors.textTertiaryOnDarkBlur} />
                            <View style={styles.suggestionContent}>
                              <Text style={styles.suggestionText} numberOfLines={1}>{item.mainText}</Text>
                              {item.secondaryText && (
                                <Text style={styles.suggestionSecondaryText} numberOfLines={1}>{item.secondaryText}</Text>
                              )}
                            </View>
                            <IconSymbol name="arrow.up.left" size={14} color={theme.colors.textTertiaryOnDarkBlur} />
                          </TouchableOpacity>
                        ))}
                      </View>
                </Animated.View>
              )}
            </Animated.View>
          </BlurView>
        )}

        {/* Form Content - Shows when route found */}
        {hasRoute && (
          <Animated.View
            style={{
              opacity: headerAnimRef.current.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
              transform: [{
                translateY: headerAnimRef.current.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              }],
            }}
          >
            {/* Route Summary - Always Visible Header with Editable Inputs */}
            <Animated.View 
              style={[
                styles.routeSummary,
                {
                  opacity: summaryVisibilityRef.current,
                  overflow: 'hidden',
                  pointerEvents: isLoading ? 'none' : 'auto',
                }
              ]}
            >
              <Animated.View 
                style={[
                  styles.summaryContent,
                  {
                    opacity: collapseAnimRef.current.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 0.5, 1],
                    }),
                  }
                ]}
              >
                <View style={styles.routePoint}>
                  <IconSymbol name="location.fill" size={20} color={theme.colors.accent} />
                  <Pressable
                    style={styles.locationDisplayContainer}
                    onPress={() => {
                      setStartInputFocused(true);
                      startInputRef.current?.focus();
                    }}
                    disabled={isLoading}
                  >
                    {startInputFocused ? (
                      <TextInput
                        ref={startInputRef}
                        style={styles.locationStartEditInput}
                        placeholder="Start of your journey"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={startInput.split(',')[0]}
                        onChangeText={(text) => handleStartInputChange(text)}
                        onFocus={() => setStartInputFocused(true)}
                        onBlur={() => setStartInputFocused(false)}
                        autoCapitalize="words"
                        editable={!isLoading}
                        selectTextOnFocus={true}
                      />
                    ) : (
                      <>
                        {startInput.trim() ? (
                          <>
                            <Text style={styles.locationMainText} numberOfLines={1}>{startInput.split(',')[0]}</Text>
                            <Text style={styles.locationSecondaryText} numberOfLines={1}>
                              {startInput.includes(',') ? startInput.substring(startInput.indexOf(',') + 1).trim() : ''}
                            </Text>
                          </>
                        ) : (
                          <Text style={styles.locationPlaceholder}>Start of your journey</Text>
                        )}
                      </>
                    )}
                  </Pressable>
                </View>

                <Animated.View 
                  style={[
                    styles.routeConnector,
                    {
                      opacity: 1,
                    }
                  ]}
                />

                <View style={styles.routePoint}>
                  <IconSymbol name="flag.checkered" size={20} color={theme.colors.secondary} />
                  <Pressable
                    style={styles.locationDisplayContainer}
                    onPress={() => {
                      setEndInputFocused(true);
                      endInputRef.current?.focus();
                    }}
                    disabled={isLoading}
                  >
                    {endInputFocused ? (
                      <TextInput
                        ref={endInputRef}
                        style={styles.locationEndEditInput}
                        placeholder="End of your journey"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={endInput.split(',')[0]}
                        onChangeText={(text) => handleEndInputChange(text)}
                        onFocus={() => setEndInputFocused(true)}
                        onBlur={() => setEndInputFocused(false)}
                        autoCapitalize="words"
                        editable={!isLoading}
                        selectTextOnFocus={true}
                      />
                    ) : (
                      <>
                        {endInput.trim() ? (
                          <>
                            <Text style={styles.locationMainText} numberOfLines={1}>{endInput.split(',')[0]}</Text>
                            <Text style={styles.locationSecondaryText} numberOfLines={1}>
                              {endInput.includes(',') ? endInput.substring(endInput.indexOf(',') + 1).trim() : ''}
                            </Text>
                          </>
                        ) : (
                          <Text style={styles.locationPlaceholder}>End of your journey</Text>
                        )}
                      </>
                    )}
                  </Pressable>
                </View>
              </Animated.View>

              {/* Toggle Icon Button - Always rendered, always available when route exists */}
              <Animated.View
                style={{
                  opacity: 1,
                  pointerEvents: 'auto',
                }}
              >
                <TouchableOpacity 
                  style={styles.toggleButton}
                  onPress={() => {
                    setIsFormExpanded(!isFormExpanded);
                    // Blur inputs when collapsing
                    if (isFormExpanded) {
                      startInputRef.current?.blur();
                      endInputRef.current?.blur();
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Animated.View
                    style={{
                      transform: [{
                        rotate: collapseAnimRef.current.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '180deg'],
                        }),
                      }],
                    }}
                  >
                    <IconSymbol name="chevron.down" size={20} color={theme.colors.textSecondary} />
                  </Animated.View>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>

            {/* Start/End Location Suggestions Dropdown */}
            {suggestions.length > 0 && activeSuggestionsField && (activeSuggestionsField === 'from' || activeSuggestionsField === 'to') && (
              <Animated.View style={{
                opacity: suggestionsAnimRef.current,
                maxHeight: suggestionsAnimRef.current.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 320],
                }),
                transform: [{
                  translateY: suggestionsAnimRef.current.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                }],
                position: 'absolute',
                top: activeSuggestionsField === 'from' ? 60 : 140,
                left: 0,
                right: 0,
                zIndex: 1000,
                overflow: 'hidden',
              }}>
                <BlurView intensity={80} style={{ flex: 1, width: '100%' }} tint="dark">
                  <View style={styles.suggestionsContainer}>
                    {suggestions.slice(0, 5).map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => handleSuggestionSelect(item.fullDescription)}
                      >
                        <IconSymbol name="location" size={16} color={theme.colors.textTertiary} />
                        <View style={styles.suggestionContent}>
                          <Text style={styles.suggestionText} numberOfLines={1}>{item.mainText}</Text>
                          {item.secondaryText && (
                            <Text style={styles.suggestionSecondaryText} numberOfLines={1}>{item.secondaryText}</Text>
                          )}
                        </View>
                        <IconSymbol name="arrow.up.left" size={14} color={theme.colors.textTertiary} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </BlurView>
              </Animated.View>
            )}

            {/* Suggestions Dropdown - Only show for search field, not for start/end fields */}
            {suggestions.length > 0 && (!activeSuggestionsField || (activeSuggestionsField !== 'from' && activeSuggestionsField !== 'to')) && (
              <Animated.View style={{
                opacity: suggestionsAnimRef.current,
                maxHeight: suggestionsAnimRef.current.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 500],
                }),
                transform: [{
                  translateY: suggestionsAnimRef.current.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                }],
                position: 'absolute',
                top: 180,
                left: 0,
                right: 0,
                zIndex: 1000,
              }}>
                <View style={styles.suggestionsContainer}>
                  {suggestions.slice(0, 5).map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => handleSuggestionSelect(item.fullDescription)}
                    >
                      <IconSymbol name="location" size={16} color={theme.colors.textTertiary} />
                      <View style={styles.suggestionContent}>
                        <Text style={styles.suggestionText} numberOfLines={1}>{item.mainText}</Text>
                        {item.secondaryText && (
                          <Text style={styles.suggestionSecondaryText} numberOfLines={1}>{item.secondaryText}</Text>
                        )}
                      </View>
                      <IconSymbol name="arrow.up.left" size={14} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Expanded Content - Transport, POI, Actions */}
            {isFormExpanded && (
              <Animated.View
                style={{
                  opacity: collapseAnimRef.current,
                  maxHeight: collapseAnimRef.current.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1000],
                  }),
                  transform: [{
                    translateY: collapseAnimRef.current.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0],
                    }),
                  }],
                  overflow: 'hidden',
                  marginTop: theme.spacing.md,
                  gap: theme.spacing.md,
                  flexDirection: 'column',
                }}
              >

                {/* Transport Mode Bar */}
                {detourRoute && (
                  <TransportModeBar
                    selectedTransportMode={selectedTransportMode}
                    onSelectTransportMode={(mode) => {
                      setSelectedTransportMode(mode);
                      onTransportModeChange?.(mode);
                    }}
                    durations={detourRoute.durations || { walk: 0, car: 0, bike: 0, transit: 0 }}
                    visible={true}
                    isLoading={isLoading}
                  />
                )}

                {/* Action Buttons
                {detourRoute && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={onReset}
                      disabled={isLoading}
                    >
                      <IconSymbol name="arrow.counterclockwise" size={18} color={theme.colors.accent} />
                      <Text style={styles.secondaryButtonText}>Reset</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                      onPress={onSaveDetour}
                      disabled={isLoading}
                    >
                      <IconSymbol name="checkmark" size={18} color={theme.colors.card} />
                      <Text style={styles.primaryButtonText}>
                        {selectedPOI ? 'Save with POI' : 'Save Detour'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )} */}

              </Animated.View>
            )}
          </Animated.View>
        )}
      </Animated.View>

      {/* POI Selection Bottom Sheet */}
      <BottomSheet
        visible={showPOIBottomSheet}
        onClose={() => setShowPOIBottomSheet(false)}
        snapPoints={[0.6, 0.85]}
        maxHeight={undefined}
      >
        {selectedInterest && detourRoute?.pois && detourRoute.pois.length > 0 ? (
          <InlinePOIList
            visible={true}
            pois={detourRoute.pois}
            selectedPOIName={selectedPOI?.name}
            interest={selectedInterest}
            onSelectPOI={(poi: any) => {
              if (onSelectPOI) {
                onSelectPOI(poi);
                setShowPOIBottomSheet(false);
              }
            }}
            isLoading={isLoading}
            poiCosts={poiCosts}
          />
        ) : (
          <Text style={styles.emptyStateText}>Loading POIs...</Text>
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  /* Main Container */
  container: {
    width: '100%',
    zIndex: 100,
  },

  /* STATE 1: Initial Search */
  initialSearchContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },

  searchHeader: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.md,
    zIndex: 101,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.lg,
  },

  searchSection: {
    gap: theme.spacing.xs,
    opacity: 1.0,
  },

  sectionLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: theme.spacing.sm,
  },

  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.accentLight,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },

  currentLocationText: {
    ...theme.typography.bodySemibold,
    color: theme.colors.accent,
  },

  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    height: 52,
    ...theme.shadows.sm,
  },

  destinationInput: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    padding: 0,
    margin: 0,
    height: 52,
    textAlignVertical: 'center',
    lineHeight: 20,
  },

  routeInput: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },

  suggestionsContainer: {
    borderRadius: theme.borderRadius.md,
    borderWidth: 0,
    borderColor: 'transparent',
    overflow: 'hidden',
    paddingVertical: theme.spacing.xs,
  },

  suggestionsBlur: {
    borderRadius: theme.borderRadius.xxxl,
    overflow: 'hidden',
    marginHorizontal: theme.spacing.sm,
  },

  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: .5,
    borderBottomColor: theme.colors.textTertiary,
    borderBottomRightRadius: theme.borderRadius.xxl,
    borderBottomLeftRadius: theme.borderRadius.xxl,
  },

  suggestionContent: {
    flex: 1,
  },

  suggestionText: {
    ...theme.typography.body,
    color: theme.colors.textOnDarkBlur,
    fontSize: 15,
  },

  suggestionSecondaryText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiaryOnDarkBlur,
    fontSize: 12,
    marginTop: 2,
  },

  /* STATE 2: Route Found */
  routeFoundContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },

  routeInputsContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },

  routeSummary: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: theme.spacing.sm,
    ...theme.shadows.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },

  routeSummaryBlur: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
  },

  summaryContent: {
    flex: 1,
    gap: 0,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },

  summaryContentTouchable: {
    flex: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start',
  },

  summaryContentExpanded: {
    flex: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start',
  },

  summaryInput: {
    height: 'auto',
    paddingVertical: theme.spacing.sm,
  },

  toggleButton: {
    padding: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  toggleButtonPlaceholder: {
    padding: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  routePointCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },

  routeLocations: {
    flex: 1,
    gap: theme.spacing.sm,
  },

  routeLocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },

  routeLocationText: {
    ...theme.typography.bodySemibold,
    color: theme.colors.textPrimary,
    flex: 1,
  },

  routeConnectorCompact: {
    width: 2,
    height: 12,
    backgroundColor: theme.colors.cardBorder,
    marginLeft: 0,
  },

  editableRouteInputs: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },

  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    height: 44,
  },

  pointText: {
    flex: 1,
    ...theme.typography.bodySemibold,
    color: theme.colors.textPrimary,
  },

  routeConnector: {
    width: 3,
    height: 16,
    backgroundColor: theme.colors.cardBorder,
    marginLeft: 8,
    marginVertical: 0,
    justifyContent: 'center',
  },

  poiSection: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },

  emptyStateText: {
    ...theme.typography.body,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },

  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.card,
    ...theme.shadows.sm,
  },

  secondaryButtonText: {
    ...theme.typography.button,
    color: theme.colors.accent,
  },

  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.accent,
    ...theme.shadows.md,
  },

  primaryButtonDisabled: {
    opacity: 0.6,
  },

  primaryButtonText: {
    ...theme.typography.button,
    color: theme.colors.card,
  },

  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    flexShrink: 0,
  },

  dotStart: {
    backgroundColor: theme.colors.accent,
  },

  dotEnd: {
    backgroundColor: theme.colors.secondary,
  },

  collapsedSummaryContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: 0,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },

  collapsedLocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },

  collapsedLocationText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    flex: 1,
  },

  collapsedDivider: {
    height: 1,
    backgroundColor: theme.colors.cardBorder,
    marginHorizontal: 0,
  },

  collapsedText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    flex: 1,
  },

  collapsedPlaceholder: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    flex: 1,
  },

  locationDisplayContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.xs,
    height: 44,
  },

  locationTextContainer: {
    flex: 1,
  },

  locationMainText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    fontSize: 15,
    lineHeight: 18,
  },

  locationSecondaryText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    fontSize: 12,
    marginTop: 0,
    lineHeight: 14,
  },

  locationPlaceholder: {
    ...theme.typography.body,
    color: theme.colors.textTertiary,
    fontSize: 15,
    lineHeight: 18,
  },
  locationStartEditInput: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    fontSize: 15,
    padding: 0,
    margin: 0,
    flex: 1,
    lineHeight: 0,
  },
  locationEndEditInput: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    fontSize: 15,
    padding: 0,
    margin: 0,
    flex: 1,
    lineHeight: 0,
  },
});
