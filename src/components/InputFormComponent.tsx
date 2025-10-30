import { theme } from '@/styles/theme';
import { Interest, Location } from '@/types/detour';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { IconSymbol } from '../../components/ui/icon-symbol';

interface InputFormComponentProps {
  onFindDetour: (start: string, end: string, interest: Interest) => void;
  isLoading?: boolean;
  currentLocation?: Location | null;
}

const INTERESTS: Interest[] = ['Street Art', 'Architecture', 'Cafes'];

export default function InputFormComponent({
  onFindDetour,
  isLoading = false,
  currentLocation,
}: InputFormComponentProps) {
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');
  const [selectedInterest, setSelectedInterest] = useState<Interest>('Street Art');
  const [errors, setErrors] = useState<{ start?: string; end?: string }>({});
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  // Auto-fill start with "Current Location" if available
  useEffect(() => {
    if (currentLocation && !startInput) {
      setUseCurrentLocation(true);
    }
  }, [currentLocation, startInput]);

  const validateInputs = (): boolean => {
    const newErrors: { start?: string; end?: string } = {};

    if (!useCurrentLocation && !startInput.trim()) {
      newErrors.start = 'Start address required';
    }

    if (!endInput.trim()) {
      newErrors.end = 'End address required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFindDetour = () => {
    if (validateInputs()) {
      const startValue = useCurrentLocation && currentLocation 
        ? `${currentLocation.latitude},${currentLocation.longitude}`
        : startInput;
      onFindDetour(startValue, endInput, selectedInterest);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Find a Detour</Text>
        <Text style={styles.subtitle}>Plan a scenic route with stops you'll love</Text>
      </View>

      {/* Location Inputs - Google Maps Style */}
      <View style={styles.locationCard}>
        {/* Start Location */}
        <View style={styles.inputRow}>
          <View style={styles.iconContainer}>
            <View style={[styles.dot, styles.dotStart]} />
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>From</Text>
            {currentLocation && !useCurrentLocation ? (
              <TextInput
                style={[styles.input, errors.start && styles.inputError]}
                placeholder="Starting point"
                placeholderTextColor={theme.colors.textSecondary}
                value={startInput}
                onChangeText={(text) => {
                  setStartInput(text);
                  if (errors.start) setErrors({ ...errors, start: undefined });
                }}
                autoCapitalize="words"
                editable={!isLoading}
              />
            ) : (
              <TouchableOpacity
                style={styles.currentLocationField}
                onPress={() => {
                  setUseCurrentLocation(!useCurrentLocation);
                  if (!useCurrentLocation) {
                    setStartInput('');
                    setErrors({ ...errors, start: undefined });
                  }
                }}
                disabled={isLoading}
              >
                <Text style={styles.currentLocationValue}>
                  📍 Your location
                </Text>
              </TouchableOpacity>
            )}
            {errors.start && <Text style={styles.errorText}>{errors.start}</Text>}
          </View>
          {currentLocation && (
            <TouchableOpacity
              style={styles.locationToggle}
              onPress={() => {
                setUseCurrentLocation(!useCurrentLocation);
                if (!useCurrentLocation) {
                  setStartInput('');
                  setErrors({ ...errors, start: undefined });
                }
              }}
              disabled={isLoading}
            >
              <IconSymbol
                name={useCurrentLocation ? 'location.fill' : 'location'}
                size={20}
                color={useCurrentLocation ? theme.colors.accent : theme.colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* End Location */}
        <View style={styles.inputRow}>
          <View style={styles.iconContainer}>
            <View style={[styles.dot, styles.dotEnd]} />
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>To</Text>
            <TextInput
              style={[styles.input, errors.end && styles.inputError]}
              placeholder="Destination"
              placeholderTextColor={theme.colors.textSecondary}
              value={endInput}
              onChangeText={(text) => {
                setEndInput(text);
                if (errors.end) setErrors({ ...errors, end: undefined });
              }}
              autoCapitalize="words"
              editable={!isLoading}
            />
            {errors.end && <Text style={styles.errorText}>{errors.end}</Text>}
          </View>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setEndInput('')}
            disabled={!endInput || isLoading}
          >
            {endInput && (
              <IconSymbol
                name="xmark.circle.fill"
                size={20}
                color={theme.colors.textSecondary}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Swap Button */}
        <TouchableOpacity
          style={styles.swapButton}
          onPress={() => {
            const temp = startInput;
            setStartInput(endInput);
            setEndInput(temp);
          }}
          disabled={isLoading || (!startInput && !useCurrentLocation)}
        >
          <IconSymbol
            name="arrow.up.arrow.down"
            size={18}
            color={theme.colors.accent}
          />
        </TouchableOpacity>
      </View>

      {/* Interest Selection */}
      <View style={styles.inputGroup}>
        <Text style={styles.sectionLabel}>Stop Type</Text>
        <View style={styles.interestContainer}>
          {INTERESTS.map((interest) => (
            <TouchableOpacity
              key={interest}
              style={[
                styles.interestButton,
                selectedInterest === interest && styles.interestButtonActive,
              ]}
              onPress={() => setSelectedInterest(interest)}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.interestButtonText,
                  selectedInterest === interest && styles.interestButtonTextActive,
                ]}
              >
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Find Button */}
      <TouchableOpacity
        style={[styles.findButton, isLoading && styles.findButtonDisabled]}
        onPress={handleFindDetour}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={theme.colors.textPrimary} />
        ) : (
          <>
            <IconSymbol
              name="location.magnifyingglass"
              size={18}
              color={theme.colors.textPrimary}
            />
            <Text style={styles.findButtonText}>Find Detour</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  locationCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotStart: {
    backgroundColor: theme.colors.accent,
  },
  dotEnd: {
    backgroundColor: theme.colors.error,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
  },
  input: {
    color: theme.colors.textPrimary,
    ...theme.typography.body,
    padding: 0,
    paddingVertical: 4,
  },
  currentLocationField: {
    paddingVertical: 4,
  },
  currentLocationValue: {
    ...theme.typography.body,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  locationToggle: {
    padding: theme.spacing.sm,
  },
  clearButton: {
    padding: theme.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.cardBorder,
  },
  swapButton: {
    position: 'absolute',
    right: theme.spacing.md,
    top: '50%',
    marginTop: -24,
    backgroundColor: theme.colors.card,
    borderRadius: 50,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.sm,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  sectionLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
  },
  interestContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  interestButton: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  interestButtonActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  interestButtonText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  interestButtonTextActive: {
    color: theme.colors.textPrimary,
  },
  findButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  findButtonDisabled: {
    opacity: 0.6,
  },
  findButtonText: {
    ...theme.typography.button,
    color: theme.colors.textPrimary,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});
