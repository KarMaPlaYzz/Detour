import { theme } from '@/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface GooglePlacesPrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text?: string;
  structured_formatting: {
    main_text: string;
    secondary_text?: string;
  };
}

interface LocationInputProps {
  placeholder?: string;
  onLocationSelect: (location: { address: string; lat?: number; lng?: number }) => void;
  value?: string;
  isDestination?: boolean;
  recentLocations?: string[];
  favorites?: string[];
}

const SmartLocationInput: React.FC<LocationInputProps> = ({
  placeholder = 'Enter location',
  onLocationSelect,
  value: initialValue,
  isDestination = false,
  recentLocations = [],
  favorites = [],
}) => {
  const [value, setValue] = useState(initialValue || '');
  const [predictions, setPredictions] = useState<GooglePlacesPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredRecent, setFilteredRecent] = useState<string[]>(recentLocations);
  const [filteredFavorites, setFilteredFavorites] = useState<string[]>(favorites);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch Google Places predictions
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!value.trim()) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        // Replace with your actual Google Places API call
        const mockPredictions: GooglePlacesPrediction[] = [
          {
            place_id: '1',
            description: `${value} - San Francisco, CA`,
            main_text: value,
            structured_formatting: { main_text: value, secondary_text: 'San Francisco, CA' },
          },
          {
            place_id: '2',
            description: `${value} Park - San Francisco, CA`,
            main_text: `${value} Park`,
            structured_formatting: { main_text: `${value} Park`, secondary_text: 'San Francisco, CA' },
          },
        ];
        setPredictions(mockPredictions);
        setShowDropdown(true);
      } catch (error: any) {
        console.error('Error fetching predictions:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300) as unknown as NodeJS.Timeout;

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [value]);

  // Filter recents and favorites based on input
  useEffect(() => {
    if (!value.trim()) {
      setFilteredRecent(recentLocations);
      setFilteredFavorites(favorites);
    } else {
      const lowerValue = value.toLowerCase();
      setFilteredRecent(recentLocations.filter(loc => loc.toLowerCase().includes(lowerValue)));
      setFilteredFavorites(favorites.filter(loc => loc.toLowerCase().includes(lowerValue)));
    }
  }, [value, recentLocations, favorites]);

  const handleSelectLocation = (address: string) => {
    setValue(address);
    setShowDropdown(false);
    onLocationSelect({ address });
  };

  const handleClear = () => {
    setValue('');
    setPredictions([]);
    setShowDropdown(false);
  };

  const handleSwap = () => {
    // This would typically swap start/end locations
  };

  return (
    <View style={styles.container}>
      {/* Input Field */}
      <View style={styles.inputContainer}>
        <Ionicons
          name={isDestination ? 'location' : 'navigate'}
          size={18}
          color={theme.colors.accentLight}
          style={styles.prefixIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          value={value}
          onChangeText={setValue}
          onFocus={() => {
            if (value.trim() || filteredRecent.length > 0 || filteredFavorites.length > 0) {
              setShowDropdown(true);
            }
          }}
          editable={true}
        />

        {value.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}

        {isLoading && (
          <ActivityIndicator size="small" color={theme.colors.accentLight} style={styles.loader} />
        )}
      </View>

      {/* Dropdown Suggestions */}
      {showDropdown && (
        <View style={styles.dropdown}>
          {/* Google Places Predictions */}
          {predictions.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Suggestions</Text>
              {predictions.map(pred => (
                <TouchableOpacity
                  key={pred.place_id}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectLocation(pred.main_text)}
                >
                  <Ionicons name="location" size={16} color={theme.colors.accentLight} />
                  <View style={styles.suggestionText}>
                    <Text style={styles.suggestionMain}>{pred.structured_formatting.main_text}</Text>
                    {pred.structured_formatting.secondary_text && (
                      <Text style={styles.suggestionSub}>{pred.structured_formatting.secondary_text}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
              <View style={styles.divider} />
            </View>
          )}

          {/* Favorite Locations */}
          {filteredFavorites.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>Favorites</Text>
              {filteredFavorites.map((fav, idx) => (
                <TouchableOpacity
                  key={`fav-${idx}`}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectLocation(fav)}
                >
                  <Ionicons name="star" size={16} color={theme.colors.creamDarker} />
                  <View style={styles.suggestionText}>
                    <Text style={styles.suggestionMain}>{fav}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              <View style={styles.divider} />
            </View>
          )}

          {/* Recent Searches */}
          {filteredRecent.length > 0 && predictions.length === 0 && (
            <View>
              <Text style={styles.sectionTitle}>Recent</Text>
              {filteredRecent.map((recent, idx) => (
                <TouchableOpacity
                  key={`recent-${idx}`}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectLocation(recent)}
                >
                  <Ionicons name="time" size={16} color={theme.colors.textSecondary} />
                  <View style={styles.suggestionText}>
                    <Text style={styles.suggestionMain}>{recent}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Empty State */}
          {predictions.length === 0 && filteredRecent.length === 0 && filteredFavorites.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={32} color={theme.colors.textTertiary} />
              <Text style={styles.emptyText}>No suggestions available</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default SmartLocationInput;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: theme.spacing.sm,
  },
  prefixIcon: {
    marginRight: theme.spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  loader: {
    marginLeft: theme.spacing.xs,
  },
  dropdown: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    maxHeight: 320,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.cardBorder,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionMain: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  suggestionSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.cardBorder,
    marginVertical: theme.spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
});
