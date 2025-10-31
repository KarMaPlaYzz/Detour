import { theme } from '@/styles/theme';
import { Interest, Location } from '@/types/detour';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '../../components/ui/icon-symbol';

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

interface InputFormComponentProps {
  onFindDetour: (start: string, end: string) => void;
  onSearchPOIs?: (interest: string) => void;
  onTransportModeChange?: (mode: 'car' | 'walk' | 'bike' | 'transit') => void;
  onReset?: () => void;
  isLoading?: boolean;
  currentLocation?: Location | null;
  detourRoute?: any | null;
  availablePOITypes?: { [key: string]: string };
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
  isLoading = false,
  currentLocation,
  detourRoute,
  availablePOITypes = {},
}: InputFormComponentProps) {
  const insets = useSafeAreaInsets();
  const [endInput, setEndInput] = useState('');
  const [startInput, setStartInput] = useState('');
  const [selectedInterest, setSelectedInterest] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasRoute, setHasRoute] = useState(false);
  const [dynamicInterests, setDynamicInterests] = useState<string[]>([]);
  const [poiTypeMap, setPoiTypeMap] = useState<{ [key: string]: string }>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestionsField, setActiveSuggestionsField] = useState<'from' | 'to' | null>(null);
  const endInputRef = useRef<TextInput>(null);
  const startInputRef = useRef<TextInput>(null);
  const clearButtonAnimRef = useRef(new Animated.Value(0));
  const suggestionsAnimRef = useRef(new Animated.Value(0));
  const headerAnimRef = useRef(new Animated.Value(0));
  const collapseAnimRef = useRef(new Animated.Value(0));
  const prevHasRouteRef = useRef(false);
  const isUpdatingRouteRef = useRef(false);
  const [wasEmpty, setWasEmpty] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [endInputFocused, setEndInputFocused] = useState(false);
  const [startInputFocused, setStartInputFocused] = useState(false);
  const [selectedTransportMode, setSelectedTransportMode] = useState<'car' | 'walk' | 'bike' | 'transit'>('car');
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const isFormExpandedRef = useRef(false);
  const [focusOnExpand, setFocusOnExpand] = useState<'start' | 'end' | null>(null);

  // Update interests when available POI types change
  useEffect(() => {
    if (detourRoute && Object.keys(availablePOITypes).length > 0) {
      // Store the raw type -> formatted name mapping
      setPoiTypeMap(availablePOITypes);
      
      // Get formatted names for display
      const interestNames = Object.values(availablePOITypes);
      setDynamicInterests(interestNames);
      if (!selectedInterest || !interestNames.includes(selectedInterest)) {
        setSelectedInterest(interestNames[0]);
      }
    } else {
      setDynamicInterests([]);
      setPoiTypeMap({});
      setSelectedInterest('');
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

  // Detect route changes
  useEffect(() => {
    if (detourRoute) {
      setHasRoute(true);
      setIsFormExpanded(false); // Collapse form when route is first found
      Animated.timing(headerAnimRef.current, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      setHasRoute(false);
      Animated.timing(headerAnimRef.current, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [detourRoute]);

  // Animate form expand/collapse
  useEffect(() => {
    isFormExpandedRef.current = isFormExpanded;
    
    // Stop any ongoing animation first
    collapseAnimRef.current.stopAnimation(() => {
      // Then start the new animation
      Animated.timing(collapseAnimRef.current, {
        toValue: isFormExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });

    // Focus the appropriate input after expansion
    if (isFormExpanded && focusOnExpand) {
      setTimeout(() => {
        if (focusOnExpand === 'start') {
          startInputRef.current?.focus();
        } else if (focusOnExpand === 'end') {
          endInputRef.current?.focus();
        }
        setFocusOnExpand(null);
      }, 350);
    }
  }, [isFormExpanded, focusOnExpand]);

  // Auto-focus end input when expanded
  useEffect(() => {
    if (isExpanded && endInputRef.current && !hasRoute) {
      setTimeout(() => {
        endInputRef.current?.focus();
      }, 100);
    }
  }, [isExpanded, hasRoute]);

  // Handle reset from parent - only clear when transitioning from route found to no route
  useEffect(() => {
    if (prevHasRouteRef.current && !hasRoute) {
      // We had a route but now we don't - check if this is a real reset or just a route update
      if (!isUpdatingRouteRef.current) {
        // User clicked reset button, clear the inputs
        setEndInput('');
        setStartInput('');
        setSuggestions([]);
        setActiveSuggestionsField(null);
      }
      isUpdatingRouteRef.current = false;
    }
    prevHasRouteRef.current = hasRoute;
  }, [hasRoute]);

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
        setSuggestions(data.predictions.map((p: any) => p.description));
      } else if (data.error_message) {
        console.error('API Error:', data.error_message);
      }
    } catch (error) {
      console.error('Autocomplete error:', error);
    }
  }, [currentLocation]);

  // Handle end input change with suggestions
  const handleEndInputChange = useCallback((text: string) => {
    setEndInput(text);
    setActiveSuggestionsField('to');
    fetchSuggestions(text);
  }, [fetchSuggestions]);

  // Handle start input change with suggestions
  const handleStartInputChange = useCallback((text: string) => {
    setStartInput(text);
    setActiveSuggestionsField('from');
    fetchSuggestions(text);
  }, [fetchSuggestions]);

  // Handle end input focus to expand form
  useEffect(() => {
    if ((endInputFocused || startInputFocused) && hasRoute) {
      setIsFormExpanded(true);
    }
  }, [endInputFocused, startInputFocused, hasRoute]);

  const handleSuggestionSelect = (suggestion: string) => {
    if (activeSuggestionsField === 'to') {
      setEndInput(suggestion);
      setSuggestions([]);
      setActiveSuggestionsField(null);
      setIsFormExpanded(false); // Collapse after selecting suggestion
      // Trigger search immediately after selecting destination
      if (currentLocation) {
        const startValue = `${currentLocation.latitude},${currentLocation.longitude}`;
        // Use setTimeout to allow state update first
        isUpdatingRouteRef.current = true;
        setTimeout(() => {
          onFindDetour(startValue, suggestion);
        }, 0);
      }
    } else if (activeSuggestionsField === 'from') {
      setStartInput(suggestion);
      setSuggestions([]);
      setActiveSuggestionsField(null);
      setIsFormExpanded(false); // Collapse after selecting suggestion
      // If end is already filled, search with new start location
      if (endInput.trim()) {
        isUpdatingRouteRef.current = true;
        setTimeout(() => {
          onFindDetour(suggestion, endInput);
        }, 0);
      }
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
            borderBottomColor: headerAnimRef.current.interpolate({
              inputRange: [0, 1],
              outputRange: ['transparent', theme.colors.cardBorder],
            }),
            borderBottomWidth: 1,
          }
        ]}
      >
        {/* Search Bar - Shows when no route */}
        {!hasRoute && (
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
                      onPress={() => handleSuggestionSelect(item)}
                    >
                      <IconSymbol name="location" size={16} color={theme.colors.textTertiary} />
                      <View style={styles.suggestionContent}>
                        <Text style={styles.suggestionText} numberOfLines={1}>{item}</Text>
                      </View>
                      <IconSymbol name="arrow.up.left" size={14} color={theme.colors.textTertiary} />
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            )}
          </Animated.View>
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
                  maxHeight: collapseAnimRef.current.interpolate({
                    inputRange: [0, 1],
                    outputRange: [120, 400],
                  }),
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
                  <TextInput
                    ref={startInputRef}
                    style={[styles.searchField, styles.routeInput, styles.summaryInput]}
                    placeholder="Your Location"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={startInput}
                    onChangeText={handleStartInputChange}
                    onFocus={() => setStartInputFocused(true)}
                    onBlur={() => setStartInputFocused(false)}
                    autoCapitalize="words"
                    editable={true}
                  />
                </View>

                <Animated.View 
                  style={[
                    styles.routeConnector,
                    {
                      opacity: collapseAnimRef.current.interpolate({
                        inputRange: [0, 0.3, 1],
                        outputRange: [0, 0.3, 1],
                      }),
                    }
                  ]}
                />

                <View style={styles.routePoint}>
                  <IconSymbol name="flag.checkered" size={20} color={theme.colors.secondary} />
                  <TextInput
                    ref={endInputRef}
                    style={[styles.searchField, styles.routeInput, styles.summaryInput]}
                    placeholder="To location"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={endInput}
                    onChangeText={handleEndInputChange}
                    onFocus={() => setEndInputFocused(true)}
                    onBlur={() => setEndInputFocused(false)}
                    autoCapitalize="words"
                    editable={true}
                  />
                </View>
              </Animated.View>

              {/* Toggle Icon Button - Always rendered, animated opacity */}
              <Animated.View
                style={{
                  opacity: collapseAnimRef.current,
                  pointerEvents: isFormExpanded ? 'auto' : 'none',
                }}
              >
                <TouchableOpacity 
                  style={styles.toggleButton}
                  onPress={() => {
                    setIsFormExpanded(false);
                    // Blur inputs when collapsing
                    startInputRef.current?.blur();
                    endInputRef.current?.blur();
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
                      onPress={() => handleSuggestionSelect(item)}
                    >
                      <IconSymbol name="location" size={16} color={theme.colors.textTertiary} />
                      <View style={styles.suggestionContent}>
                        <Text style={styles.suggestionText} numberOfLines={1}>{item}</Text>
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
                }}
              >
                {/* Transportation Mode Selection */}
                <View style={styles.transportSection}>
                  <View style={styles.transportHeader}>
                    <IconSymbol name="car.fill" size={18} color={theme.colors.accent} />
                    <Text style={styles.transportTitle}>How will you travel?</Text>
                  </View>
                  
                  <View style={styles.transportButtons}>
                    <TouchableOpacity
                      style={[
                        styles.transportButton,
                        selectedTransportMode === 'car' && styles.transportButtonActive,
                      ]}
                      onPress={() => {
                        setSelectedTransportMode('car');
                        onTransportModeChange?.('car');
                      }}
                      disabled={isLoading}
                    >
                      <IconSymbol
                        name="car.fill"
                        size={20}
                        color={selectedTransportMode === 'car' ? theme.colors.card : theme.colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.transportDuration,
                          selectedTransportMode === 'car' && styles.transportDurationActive,
                        ]}
                      >
                        {formatDuration(detourRoute?.durations?.car)}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.transportButton,
                        selectedTransportMode === 'walk' && styles.transportButtonActive,
                      ]}
                      onPress={() => {
                        setSelectedTransportMode('walk');
                        onTransportModeChange?.('walk');
                      }}
                      disabled={isLoading}
                    >
                      <IconSymbol
                        name="figure.walk"
                        size={20}
                        color={selectedTransportMode === 'walk' ? theme.colors.card : theme.colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.transportDuration,
                          selectedTransportMode === 'walk' && styles.transportDurationActive,
                        ]}
                      >
                        {formatDuration(detourRoute?.durations?.walk)}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.transportButton,
                        selectedTransportMode === 'bike' && styles.transportButtonActive,
                      ]}
                      onPress={() => {
                        setSelectedTransportMode('bike');
                        onTransportModeChange?.('bike');
                      }}
                      disabled={isLoading}
                    >
                      <IconSymbol
                        name="bicycle"
                        size={20}
                        color={selectedTransportMode === 'bike' ? theme.colors.card : theme.colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.transportDuration,
                          selectedTransportMode === 'bike' && styles.transportDurationActive,
                        ]}
                      >
                        {formatDuration(detourRoute?.durations?.bike)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* POI Selection */}
                <View style={styles.poiSection}>
                  <View style={styles.poiHeader}>
                    <IconSymbol name="sparkles" size={18} color={theme.colors.accent} />
                    <Text style={styles.poiTitle}>What interests you?</Text>
                  </View>
                  
                  <ScrollView 
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={dynamicInterests.length > 3}
                    style={styles.poiScroll}
                  >
                    <View style={styles.poiButtons}>
                      {dynamicInterests.length > 0 ? (
                        dynamicInterests.map((displayName) => {
                          const rawType = Object.keys(poiTypeMap).find(
                            key => poiTypeMap[key] === displayName
                          );
                          const isActive = selectedInterest === displayName;
                          
                          return (
                            <TouchableOpacity
                              key={displayName}
                              style={[
                                styles.poiButton,
                                isActive && styles.poiButtonActive,
                              ]}
                              onPress={() => {
                                setSelectedInterest(displayName);
                                if (onSearchPOIs && rawType) {
                                  onSearchPOIs(rawType);
                                }
                              }}
                              disabled={isLoading}
                            >
                              <Text
                                style={[
                                  styles.poiButtonText,
                                  isActive && styles.poiButtonTextActive,
                                ]}
                              >
                                {displayName}
                              </Text>
                            </TouchableOpacity>
                          );
                        })
                      ) : (
                        <Text style={styles.loadingText}>Loading options...</Text>
                      )}
                    </View>
                  </ScrollView>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                    onPress={handleManualSearch}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <IconSymbol name="checkmark.circle.fill" size={18} color="#FFFFFF" />
                        <Text style={styles.primaryButtonText}>Confirm</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </Animated.View>
        )}
      </Animated.View>
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
    borderRadius: theme.borderRadius.md,
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
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    overflow: 'hidden',
    ...theme.shadows.md,
  },

  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },

  suggestionContent: {
    flex: 1,
  },

  suggestionText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    fontSize: 15,
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
    padding: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: theme.spacing.md,
    ...theme.shadows.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  summaryContent: {
    flex: 1,
    gap: theme.spacing.md,
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
  },

  pointText: {
    flex: 1,
    ...theme.typography.bodySemibold,
    color: theme.colors.textPrimary,
  },

  routeConnector: {
    width: 2,
    height: 16,
    backgroundColor: theme.colors.cardBorder,
    marginLeft: 4,
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

  poiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },

  poiTitle: {
    ...theme.typography.bodySemibold,
    color: theme.colors.textPrimary,
  },

  poiScroll: {
    flexGrow: 0,
    marginHorizontal: -theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },

  poiButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },

  poiButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.cardBorder,
    backgroundColor: theme.colors.card,
    ...theme.shadows.xs,
  },

  poiButtonActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },

  poiButtonText: {
    ...theme.typography.buttonSmall,
    color: theme.colors.textSecondary,
  },

  poiButtonTextActive: {
    color: theme.colors.card,
  },

  loadingText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
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

  /* Transportation Mode Selection */
  transportSection: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: theme.spacing.sm,
    ...theme.shadows.sm,
  },

  transportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },

  transportTitle: {
    ...theme.typography.bodySemibold,
    color: theme.colors.textPrimary,
  },

  transportButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },

  transportButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.cardBorder,
    backgroundColor: theme.colors.card,
    minHeight: 40,
    ...theme.shadows.xs,
  },

  transportButtonActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },

  transportDuration: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    fontSize: 14,
    flexShrink: 1,
  },

  transportDurationActive: {
    color: theme.colors.card,
    opacity: 0.9,
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
});
