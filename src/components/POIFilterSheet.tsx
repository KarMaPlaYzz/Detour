import { theme } from '@/styles/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheetModal from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface POIFilterSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

export interface FilterOptions {
  selectedTypes: string[];
  maxDistance: number;
  openOnly: boolean;
  preset?: 'all' | 'culture' | 'foodie' | 'nature';
}

const POI_TYPES = [
  { id: 'cafe', label: '☕ Cafes', icon: 'coffee' },
  { id: 'restaurant', label: '🍽️ Restaurants', icon: 'silverware-fork-knife' },
  { id: 'bar', label: '🍺 Bars', icon: 'glass-cocktail' },
  { id: 'art_gallery', label: '🎨 Art Galleries', icon: 'palette' },
  { id: 'street_art', label: '🎭 Street Art', icon: 'spray-bottle' },
  { id: 'museum', label: '🏛️ Museums', icon: 'building-outline' },
  { id: 'park', label: '🌳 Parks', icon: 'tree' },
  { id: 'landmark', label: '🗽 Landmarks', icon: 'sign-pole' },
  { id: 'monument', label: '⛩️ Monuments', icon: 'pillar' },
  { id: 'church', label: '⛪ Churches', icon: 'cross' },
  { id: 'shopping', label: '🛍️ Shopping', icon: 'shopping' },
];

const PRESETS = [
  {
    id: 'culture',
    label: 'Culture Walk',
    types: ['art_gallery', 'museum', 'landmark', 'monument'],
  },
  {
    id: 'foodie',
    label: 'Foodie Walk',
    types: ['cafe', 'restaurant', 'bar'],
  },
  {
    id: 'nature',
    label: 'Nature Walk',
    types: ['park', 'landmark'],
  },
];

const POIFilterSheetComponent = React.forwardRef<
  BottomSheetModal,
  POIFilterSheetProps
>(({ isVisible, onClose, onApplyFilters, initialFilters }, ref) => {
  const snapPoints = useMemo(() => ['90%'], []);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    initialFilters?.selectedTypes || []
  );
  const [maxDistance, setMaxDistance] = useState(initialFilters?.maxDistance || 500);
  const [openOnly, setOpenOnly] = useState(initialFilters?.openOnly || false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible && ref && 'current' in ref) {
      ref.current?.expand?.();
    } else if (!isVisible && ref && 'current' in ref) {
      ref.current?.close?.();
    }
  }, [isVisible, ref]);

  const handlePresetSelect = (preset: (typeof PRESETS)[0]) => {
    setSelectedPreset(preset.id);
    setSelectedTypes(preset.types);
  };

  const handleTypeToggle = (typeId: string) => {
    setSelectedPreset(null); // Clear preset when manually selecting
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
  };

  const handleApply = () => {
    onApplyFilters({
      selectedTypes,
      maxDistance,
      openOnly,
      preset: selectedPreset as any,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedTypes([]);
    setMaxDistance(500);
    setOpenOnly(false);
    setSelectedPreset(null);
  };

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Customize Your Walk</Text>
          <Text style={styles.headerSubtitle}>
            Choose what you want to discover
          </Text>
        </View>

        {/* Quick Presets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Presets</Text>
          <View style={styles.presetsRow}>
            {PRESETS.map(preset => (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.presetButton,
                  selectedPreset === preset.id && styles.presetButtonActive,
                ]}
                onPress={() => handlePresetSelect(preset)}
              >
                <Text
                  style={[
                    styles.presetButtonText,
                    selectedPreset === preset.id && styles.presetButtonTextActive,
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* POI Types */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>What to See</Text>
            <Text style={styles.selectedCount}>
              {selectedTypes.length} selected
            </Text>
          </View>

          <View style={styles.typesGrid}>
            {POI_TYPES.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  selectedTypes.includes(type.id) && styles.typeButtonActive,
                ]}
                onPress={() => handleTypeToggle(type.id)}
              >
                <MaterialCommunityIcons
                  name={type.icon as any}
                  size={20}
                  color={
                    selectedTypes.includes(type.id)
                      ? theme.colors.accentCream
                      : theme.colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    selectedTypes.includes(type.id) &&
                      styles.typeButtonTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Distance Slider */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distance from Route</Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.distanceOption}
              onPress={() => setMaxDistance(100)}
            >
              <View
                style={[
                  styles.distanceRadio,
                  maxDistance === 100 && styles.distanceRadioActive,
                ]}
              />
              <Text
                style={[
                  styles.distanceLabel,
                  maxDistance === 100 && styles.distanceLabelActive,
                ]}
              >
                Very Close (100m)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.distanceOption}
              onPress={() => setMaxDistance(300)}
            >
              <View
                style={[
                  styles.distanceRadio,
                  maxDistance === 300 && styles.distanceRadioActive,
                ]}
              />
              <Text
                style={[
                  styles.distanceLabel,
                  maxDistance === 300 && styles.distanceLabelActive,
                ]}
              >
                Close (300m)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.distanceOption}
              onPress={() => setMaxDistance(500)}
            >
              <View
                style={[
                  styles.distanceRadio,
                  maxDistance === 500 && styles.distanceRadioActive,
                ]}
              />
              <Text
                style={[
                  styles.distanceLabel,
                  maxDistance === 500 && styles.distanceLabelActive,
                ]}
              >
                Moderate (500m)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Open Now Filter */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.toggleOption}
            onPress={() => setOpenOnly(!openOnly)}
          >
            <View style={styles.toggleLeft}>
              <MaterialCommunityIcons
                name={openOnly ? 'clock-check' : 'clock-outline'}
                size={20}
                color={
                  openOnly ? theme.colors.accentCream : theme.colors.textSecondary
                }
              />
              <Text style={styles.toggleLabel}>Open Now Only</Text>
            </View>
            <View
              style={[
                styles.toggleSwitch,
                openOnly && styles.toggleSwitchActive,
              ]}
            >
              <View style={styles.toggleThumb} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApply}
          >
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color={theme.colors.textWhite}
              style={{ marginRight: theme.spacing.xs }}
            />
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>

        {/* Spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </BottomSheetModal>
  );
});

POIFilterSheetComponent.displayName = 'POIFilterSheet';

export default POIFilterSheetComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  bottomSheetBackground: {
    backgroundColor: theme.colors.darkSecondary,
  },
  handleIndicator: {
    backgroundColor: theme.colors.cardBorderLight,
    width: 48,
    height: 4,
  },
  header: {
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  selectedCount: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.accentLight,
    backgroundColor: `${theme.colors.accentLight}20`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },

  // Presets
  presetsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  presetButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    backgroundColor: theme.colors.card,
  },
  presetButtonActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  presetButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  presetButtonTextActive: {
    color: theme.colors.textWhite,
  },

  // Types Grid
  typesGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  typeButton: {
    width: '48%',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  typeButtonActive: {
    backgroundColor: theme.colors.darkLight,
    borderColor: theme.colors.accentLight,
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  typeButtonTextActive: {
    color: theme.colors.accentCream,
  },

  // Distance Slider
  sliderContainer: {
    gap: theme.spacing.sm,
  },
  distanceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    backgroundColor: theme.colors.card,
    gap: theme.spacing.md,
  },
  distanceRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.colors.cardBorder,
  },
  distanceRadioActive: {
    borderColor: theme.colors.accentLight,
    backgroundColor: theme.colors.accentLight,
  },
  distanceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    flex: 1,
  },
  distanceLabelActive: {
    color: theme.colors.textPrimary,
  },

  // Toggle
  toggleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    backgroundColor: theme.colors.card,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.darkLight,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: theme.colors.accent,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.textWhite,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  resetButton: {
    flex: 0.4,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  applyButton: {
    flex: 0.6,
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textWhite,
  },
});
