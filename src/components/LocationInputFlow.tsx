/**
 * LocationInputFlow - Clear step in the onboarding journey
 * Positioned after Transport & Vibe selection
 * 
 * User sees:
 * 1. Their selected transport mode and vibe (with visual reinforcement)
 * 2. Clear prompt to enter start/end locations
 * 3. Simple, focused location input interface
 * 
 * Purpose: Bridge between abstract preferences (transport/vibe) and concrete locations
 */

import { reverseGeocodeLocation } from '@/services/DetourService';
import { theme } from '@/styles/theme';
import { Location, TransportMode, Vibe } from '@/types/detour';
import { BlurView } from 'expo-blur';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '../../components/ui/icon-symbol';

interface LocationInputFlowProps {
  selectedTransport: TransportMode;
  selectedVibe: Vibe;
  currentLocation: Location | null;
  onSubmit: (startLocation: string, endLocation: string) => void;
  onBack?: () => void;
  isLoading?: boolean;
}

// Map transport modes to emojis and descriptions
const TRANSPORT_INFO: Record<TransportMode, { emoji: string; label: string; color: string }> = {
  walking: {
    emoji: '🚶',
    label: 'Walking',
    color: theme.colors.primary,
  },
  cycling: {
    emoji: '🚴',
    label: 'Cycling',
    color: theme.colors.secondary,
  },
  driving: {
    emoji: '🚗',
    label: 'Driving',
    color: theme.colors.accent,
  },
};

// Map vibes to emojis for visual reinforcement
const VIBE_INFO: Record<Vibe, { emoji: string; shortDescription: string }> = {
  'Creative': { emoji: '🎨', shortDescription: 'Art & Culture' },
  'Foodie': { emoji: '�️', shortDescription: 'Food & Dining' },
  'Nature Escape': { emoji: '�', shortDescription: 'Parks & Gardens' },
  'History Buff': { emoji: '🏛️', shortDescription: 'History & Heritage' },
  'Nightlife': { emoji: '🎭', shortDescription: 'Bars & Entertainment' },
  'Hidden Gems': { emoji: '�️', shortDescription: 'Shopping & Browse' },
  'Local Favorites': { emoji: '🎢', shortDescription: 'Tourist Attractions' },
};

export const LocationInputFlow: React.FC<LocationInputFlowProps> = ({
  selectedTransport,
  selectedVibe,
  currentLocation,
  onSubmit,
  onBack,
  isLoading = false,
}) => {
  const insets = useSafeAreaInsets();
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [startSuggestions, setStartSuggestions] = useState<Array<{ mainText: string; fullDescription: string }>>([]);
  const [endSuggestions, setEndSuggestions] = useState<Array<{ mainText: string; fullDescription: string }>>([]);
  const [activeSuggestionsField, setActiveSuggestionsField] = useState<'start' | 'end' | null>(null);
  const [startInputFocused, setStartInputFocused] = useState(false);
  const [endInputFocused, setEndInputFocused] = useState(false);

  const startInputRef = useRef<TextInput>(null);
  const endInputRef = useRef<TextInput>(null);

  // Auto-populate start location from current location
  useEffect(() => {
    if (currentLocation && !startLocation) {
      reverseGeocodeLocation(currentLocation)
        .then((address) => {
          if (address) {
            setStartLocation(address);
          }
        })
        .catch((error) => {
          console.error('Error reverse geocoding:', error);
        });
    }
  }, [currentLocation]);

  // Fetch location suggestions
  const fetchSuggestions = useCallback(async (query: string): Promise<Array<{ mainText: string; fullDescription: string }>> => {
    if (query.trim().length < 2) {
      return [];
    }

    try {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        console.warn('Google Maps API key not configured');
        return [];
      }

      let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}`;

      if (currentLocation) {
        url += `&location=${currentLocation.latitude},${currentLocation.longitude}&radius=50000`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.predictions) {
        return data.predictions.map((p: any) => ({
          mainText: p.structured_formatting?.main_text?.trim() || p.description.split(',')[0],
          fullDescription: p.description,
        }));
      }
      return [];
    } catch (error) {
      console.error('Autocomplete error:', error);
      return [];
    }
  }, [currentLocation]);

  // Handle start location input
  const handleStartLocationChange = useCallback(async (text: string) => {
    setStartLocation(text);
    setActiveSuggestionsField('start');
    const suggestions = await fetchSuggestions(text);
    setStartSuggestions(suggestions);
  }, [fetchSuggestions]);

  // Handle end location input
  const handleEndLocationChange = useCallback(async (text: string) => {
    setEndLocation(text);
    setActiveSuggestionsField('end');
    const suggestions = await fetchSuggestions(text);
    setEndSuggestions(suggestions);
  }, [fetchSuggestions]);

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string, field: 'start' | 'end') => {
    if (field === 'start') {
      setStartLocation(suggestion);
      setStartSuggestions([]);
      setStartInputFocused(false);
      startInputRef.current?.blur();
    } else {
      setEndLocation(suggestion);
      setEndSuggestions([]);
      setEndInputFocused(false);
      endInputRef.current?.blur();
    }
    setActiveSuggestionsField(null);
    Keyboard.dismiss();
  };

  // Handle submit
  const handleSubmit = () => {
    if (startLocation.trim() && endLocation.trim()) {
      onSubmit(startLocation, endLocation);
    }
  };

  const transportInfo = TRANSPORT_INFO[selectedTransport];
  const vibeInfo = VIBE_INFO[selectedVibe];
  const isFormValid = startLocation.trim().length > 0 && endLocation.trim().length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Status Bar - Shows transport & vibe selections */}
      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <Text style={styles.statusEmoji}>{transportInfo.emoji}</Text>
          <Text style={styles.statusLabel}>{transportInfo.label}</Text>
        </View>

        <View style={styles.statusDivider} />

        <View style={styles.statusItem}>
          <Text style={styles.statusEmoji}>{vibeInfo.emoji}</Text>
          <Text style={styles.statusLabel}>{selectedVibe}</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Headline */}
        <View style={styles.header}>
          <Text style={styles.title}>Where are you going?</Text>
          <Text style={styles.subtitle}>Tell us your starting point and destination</Text>
        </View>

        {/* Location Input Cards */}
        <View style={styles.inputsContainer}>
          {/* Start Location */}
          <View style={styles.inputCard}>
            <View style={styles.inputIcon}>
              <Text style={styles.inputIconText}>📍</Text>
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Starting point</Text>
              <TextInput
                ref={startInputRef}
                style={styles.input}
                placeholder="Where are you now?"
                placeholderTextColor={theme.colors.textTertiary}
                value={startLocation}
                onChangeText={handleStartLocationChange}
                onFocus={() => setStartInputFocused(true)}
                onBlur={() => setStartInputFocused(false)}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
            {startLocation.trim() && (
              <Pressable onPress={() => setStartLocation('')}>
                <IconSymbol name="xmark.circle.fill" size={20} color={theme.colors.textTertiary} />
              </Pressable>
            )}
          </View>

          {/* Suggestions for start */}
          {startInputFocused && startSuggestions.length > 0 && (
            <BlurView intensity={80} style={styles.suggestionsBlur}>
              <View style={styles.suggestionsContainer}>
                {startSuggestions.slice(0, 4).map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => handleSuggestionSelect(suggestion.fullDescription, 'start')}
                  >
                    <IconSymbol name="location.fill" size={16} color={theme.colors.primary} />
                    <Text style={styles.suggestionText} numberOfLines={1}>
                      {suggestion.mainText}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </BlurView>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* End Location */}
          <View style={styles.inputCard}>
            <View style={styles.inputIcon}>
              <Text style={styles.inputIconText}>🎯</Text>
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Destination</Text>
              <TextInput
                ref={endInputRef}
                style={styles.input}
                placeholder="Where would you like to go?"
                placeholderTextColor={theme.colors.textTertiary}
                value={endLocation}
                onChangeText={handleEndLocationChange}
                onFocus={() => setEndInputFocused(true)}
                onBlur={() => setEndInputFocused(false)}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
            {endLocation.trim() && (
              <Pressable onPress={() => setEndLocation('')}>
                <IconSymbol name="xmark.circle.fill" size={20} color={theme.colors.textTertiary} />
              </Pressable>
            )}
          </View>

          {/* Suggestions for end */}
          {endInputFocused && endSuggestions.length > 0 && (
            <BlurView intensity={80} style={styles.suggestionsBlur}>
              <View style={styles.suggestionsContainer}>
                {endSuggestions.slice(0, 4).map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => handleSuggestionSelect(suggestion.fullDescription, 'end')}
                  >
                    <IconSymbol name="location.fill" size={16} color={theme.colors.secondary} />
                    <Text style={styles.suggestionText} numberOfLines={1}>
                      {suggestion.mainText}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </BlurView>
          )}
        </View>

        {/* Helper Text */}
        <Text style={styles.helperText}>
          {!isFormValid 
            ? '✨ Fill in both locations to continue' 
            : '✨ Ready to discover! Tap Continue below'}
        </Text>
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Pressable
          style={[
            styles.continueButton,
            !isFormValid && styles.continueButtonDisabled,
            isLoading && styles.continueButtonLoading,
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid || isLoading}
        >
          <Text style={[
            styles.continueButtonText,
            (!isFormValid || isLoading) && styles.continueButtonTextDisabled,
          ]}>
            {isLoading ? 'Finding your detour...' : 'Continue'}
          </Text>
          {!isLoading && <IconSymbol name="arrow.right" size={18} color={theme.colors.textInverse} />}
        </Pressable>

        {/* Back option */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBack}
          disabled={isLoading}
        >
          <Text style={styles.backButtonText}>← Back to vibe</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'space-between',
  },

  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xxl,
    backgroundColor: theme.colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },

  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },

  statusEmoji: {
    fontSize: 24,
  },

  statusLabel: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },

  statusDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.cardBorder,
  },

  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.xxl,
  },

  header: {
    gap: theme.spacing.sm,
  },

  title: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
  },

  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },

  inputsContainer: {
    gap: theme.spacing.md,
  },

  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.sm,
  },

  inputIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  inputIconText: {
    fontSize: 20,
  },

  inputContent: {
    flex: 1,
    gap: theme.spacing.xs,
  },

  inputLabel: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  input: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    padding: 0,
    margin: 0,
    minHeight: 24,
  },

  divider: {
    height: 1,
    backgroundColor: theme.colors.cardBorder,
    marginVertical: theme.spacing.sm,
  },

  suggestionsBlur: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginHorizontal: -theme.spacing.md,
  },

  suggestionsContainer: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.md,
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },

  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.textTertiary,
  },

  suggestionText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    flex: 1,
  },

  helperText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },

  footer: {
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: Platform.OS === 'ios' ? theme.spacing.lg : theme.spacing.xxl,
    gap: theme.spacing.md,
  },

  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },

  continueButtonDisabled: {
    backgroundColor: theme.colors.cardBorder,
    opacity: 0.5,
  },

  continueButtonLoading: {
    opacity: 0.8,
  },

  continueButtonText: {
    ...theme.typography.button,
    color: theme.colors.textInverse,
  },

  continueButtonTextDisabled: {
    opacity: 0.6,
  },

  backButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },

  backButtonText: {
    ...theme.typography.body,
    color: theme.colors.primary,
  },
});
