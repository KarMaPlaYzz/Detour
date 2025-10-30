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
      <Text style={styles.title}>Find a Detour</Text>

      {/* Start Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Start Address</Text>
        
        {currentLocation && (
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={() => {
              setUseCurrentLocation(!useCurrentLocation);
              if (!useCurrentLocation) {
                setStartInput('');
                setErrors({ ...errors, start: undefined });
              }
            }}
            disabled={isLoading}
          >
            <Text style={[
              styles.currentLocationText,
              useCurrentLocation && styles.currentLocationTextActive
            ]}>
              {useCurrentLocation ? '✓ ' : ''}Use Current Location
            </Text>
          </TouchableOpacity>
        )}
        
        {!useCurrentLocation && (
          <TextInput
            style={[styles.input, errors.start && styles.inputError]}
            placeholder="1600 Amphitheatre Parkway, Mountain View, CA"
            placeholderTextColor={theme.colors.textSecondary}
            value={startInput}
            onChangeText={(text) => {
              setStartInput(text);
              if (errors.start) setErrors({ ...errors, start: undefined });
            }}
            autoCapitalize="words"
            editable={!isLoading}
          />
        )}
        {errors.start && <Text style={styles.errorText}>{errors.start}</Text>}
      </View>

      {/* End Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>End Address</Text>
        <TextInput
          style={[styles.input, errors.end && styles.inputError]}
          placeholder="1 Infinite Loop, Cupertino, CA"
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

      {/* Interest Selection */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Interest</Text>
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
          <Text style={styles.findButtonText}>Find Detour</Text>
        )}
      </TouchableOpacity>

      {/* Example hint */}
      <Text style={styles.hint}>
        Enter full street addresses with city and state
      </Text>
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
  title: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    color: theme.colors.textPrimary,
    ...theme.typography.body,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  interestContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  interestButton: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
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
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  findButtonDisabled: {
    opacity: 0.6,
  },
  findButtonText: {
    ...theme.typography.button,
    color: theme.colors.textPrimary,
  },
  hint: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  currentLocationButton: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    alignItems: 'center',
  },
  currentLocationText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  currentLocationTextActive: {
    color: theme.colors.accent,
  },
});
