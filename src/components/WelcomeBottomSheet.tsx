/**
 * WelcomeBottomSheet - Non-dismissible welcome overlay for onboarding
 * Based on UX_BLUEPRINT_2 - SCREEN 1: WELCOME/ENTRY
 * 
 * User Goal: Quick entry into creating a detour
 * Layout: Bottom sheet with headline, subheadline, and CTA buttons
 * Emotional Intention: Warm, inviting, exciting - "Something interesting awaits"
 */

import { theme } from '@/styles/theme';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface WelcomeBottomSheetProps {
  visible: boolean;
  onStartDetour: () => void;
  onBrowseDetours: () => void;
}

export const WelcomeBottomSheet: React.FC<WelcomeBottomSheetProps> = ({
  visible,
  onStartDetour,
  onBrowseDetours,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['40%'], []); // Compact welcome UI

  // Control bottom sheet based on visible prop
  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.3}
        pressBehavior="none" // Non-dismissible
      />
    ),
    []
  );

  const handleStartDetour = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStartDetour();
  };

  const handleBrowseDetours = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBrowseDetours();
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={visible ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose={false} // Non-dismissible
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.contentContainer}>
        {/* Header Content */}
        <View style={styles.header}>
          {/* Headline: "Where to?" - 48px, bold (UX_BLUEPRINT_2) */}
          <Text style={styles.headline}>Where to?</Text>
          
          {/* Subheading - (UX_BLUEPRINT_2) */}
          <Text style={styles.subheadline}>
            Choose a vibe. Find the magic.
          </Text>
        </View>

        {/* Action Buttons (40% viewport in original, compact here) */}
        <View style={styles.actionsContainer}>
          {/* Button 1: "Start a Detour" - Primary CTA */}
          <Pressable
            onPress={handleStartDetour}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Start a Detour</Text>
          </Pressable>

          {/* Button 2: "Browse My Detours" - Secondary CTA */}
          <Pressable
            onPress={handleBrowseDetours}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>Browse My Detours</Text>
          </Pressable>
        </View>

        {/* Optional: Micro-copy for first-time users */}
        <Text style={styles.microcopy}>
          Start your journey with a mood, and we'll guide you to hidden gems.
        </Text>
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
    display: 'none', // Hide handle since it's non-dismissible
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? theme.spacing.xxl : theme.spacing.lg,
    gap: theme.spacing.lg,
  },

  // Header
  header: {
    gap: theme.spacing.xs,
  },
  headline: {
    ...theme.typography.hero, // 48px, bold
    color: theme.colors.textPrimary,
  },
  subheadline: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },

  // Actions
  actionsContainer: {
    gap: theme.spacing.md,
  },

  // Primary Button (Start a Detour)
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  primaryButtonText: {
    ...theme.typography.button,
    color: theme.colors.textInverse,
  },

  // Secondary Button (Browse My Detours)
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.cardBorder,
  },
  secondaryButtonText: {
    ...theme.typography.button,
    color: theme.colors.textPrimary,
  },

  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.8,
  },

  // Microcopy
  microcopy: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
});
