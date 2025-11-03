/**
 * TransportModeSelector - Bottom Sheet for selecting travel method
 * Based on UX_BLUEPRINT_2 - Transport Mode Selection
 * 
 * User Goal: Choose transport method (Walking, Cycling, Driving)
 * Layout: Bottom sheet with 3 options, each with icon + description
 * Emotional Intention: Quick, clear choice that affects the experience
 */

import { theme } from '@/styles/theme';
import { TransportMode } from '@/types/detour';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface TransportOption {
  mode: TransportMode;
  label: string;
  icon: string;
  description: string;
}

const TRANSPORT_OPTIONS: TransportOption[] = [
  {
    mode: 'walking',
    label: 'Walking',
    icon: '🚶',
    description: 'Discover every detail. Slower pace, more POIs.',
  },
  {
    mode: 'cycling',
    label: 'Cycling',
    icon: '🚴',
    description: 'Balance speed and discovery. Medium-distance POIs.',
  },
  {
    mode: 'driving',
    label: 'Driving',
    icon: '🚗',
    description: 'Cover more ground. Fewer, farther-apart POIs.',
  },
];

interface TransportModeSelectorProps {
  visible: boolean;
  onSelect: (mode: TransportMode) => void;
  onClose: () => void;
}

export const TransportModeSelector: React.FC<TransportModeSelectorProps> = ({
  visible,
  onSelect,
  onClose,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['60%'], []);
  const isSelectingRef = useRef(false);

  // Open/close bottom sheet based on visible prop
  useEffect(() => {
    if (visible) {
      isSelectingRef.current = false;
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const handleSelect = (mode: TransportMode) => {
    // Medium haptic for confirmation (UX_BLUEPRINT_3)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Mark that we're selecting (not manually closing)
    isSelectingRef.current = true;
    
    // Trigger callback immediately
    onSelect(mode);
  };

  const handleClose = useCallback(() => {
    // Only call onClose if user manually closed (not selecting an option)
    if (!isSelectingRef.current) {
      onClose();
    }
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={visible ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={handleClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>How are you traveling?</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Transport Options */}
        <View style={styles.optionsContainer}>
          {TRANSPORT_OPTIONS.map((option) => (
            <Pressable
              key={option.mode}
              onPress={() => handleSelect(option.mode)}
              style={({ pressed }) => [
                styles.optionCard,
                pressed && styles.optionCardPressed,
              ]}
            >
              <View style={styles.optionIcon}>
                <Text style={styles.iconEmoji}>{option.icon}</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionDescription}>
                  {option.description}
                </Text>
              </View>
              <View style={styles.chevron}>
                <Text style={styles.chevronText}>›</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: theme.colors.backgroundElevated,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
  handleIndicator: {
    backgroundColor: theme.colors.textTertiary,
    width: 40,
    height: 4,
  },
  contentContainer: {
    paddingBottom: Platform.OS === 'ios' ? 32 : theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xxl,
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  closeButtonText: {
    ...theme.typography.h2,
    color: theme.colors.textTertiary,
  },
  
  // Options
  optionsContainer: {
    paddingHorizontal: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.sm,
  },
  optionCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.8,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  iconEmoji: {
    fontSize: 32,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  optionDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  chevron: {
    marginLeft: theme.spacing.sm,
  },
  chevronText: {
    fontSize: 28,
    color: theme.colors.textTertiary,
    fontWeight: '300',
  },
});
