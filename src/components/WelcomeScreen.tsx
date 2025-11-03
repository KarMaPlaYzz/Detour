/**
 * WelcomeScreen - Entry Point
 * Based on UX_BLUEPRINT_2 - SCREEN 1: ENTRY / WELCOME
 * 
 * User Goal: Understand app purpose and choose between starting a new detour or reviewing past ones.
 * 
 * Layout: Map (40%) + Primary Actions (40%) + Header (20%)
 * Emotional Intention: Open and inviting, sense of possibility
 */

import { theme } from '@/styles/theme';
import { Location } from '@/types/detour';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

interface WelcomeScreenProps {
  currentLocation: Location | null;
  onStartDetour: () => void;
  onBrowseDetours: () => void;
  onShowHelp?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  currentLocation,
  onStartDetour,
  onBrowseDetours,
  onShowHelp,
}) => {
  
  const handleStartPress = () => {
    // Light haptic feedback (UX_BLUEPRINT_3)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onStartDetour();
  };

  const handleBrowsePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBrowseDetours();
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

  return (
    <View style={styles.container}>
      {/* Map Section (40% viewport) - UX_BLUEPRINT_2 */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          pitchEnabled={false}
          rotateEnabled={false}
          scrollEnabled={false}
          zoomEnabled={false}
          userInterfaceStyle="light"
        >
          {/* User location marker with pulse animation would go here */}
        </MapView>
        
        {/* Subtle overlay to indicate interactivity */}
        <View style={styles.mapOverlay} pointerEvents="none" />
      </View>

      {/* Header Section (20% viewport) */}
      <View style={styles.headerContainer}>
        <BlurView intensity={80} tint="light" style={styles.headerBlur}>
          <View style={styles.headerContent}>
            {/* Headline: "Where to?" - 48-52px, bold (UX_BLUEPRINT_2) */}
            <Text style={styles.headline}>Where to?</Text>
            
            {/* Subheading: Optional, fades in - (UX_BLUEPRINT_2) */}
            <Text style={styles.subheadline}>Choose a vibe. Find the magic.</Text>
          </View>
        </BlurView>
      </View>

      {/* Primary Action Container (40% viewport) */}
      <View style={styles.actionContainer}>
        <BlurView intensity={80} tint="light" style={styles.actionBlur}>
          <View style={styles.actionContent}>
            {/* Button 1: "Start a Detour" - Primary CTA */}
            <Pressable
              onPress={handleStartPress}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Start a Detour</Text>
            </Pressable>

            {/* Button 2: "Browse My Detours" - Secondary CTA */}
            <Pressable
              onPress={handleBrowsePress}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Browse My Detours</Text>
            </Pressable>

            {/* Help link - optional */}
            {onShowHelp && (
              <TouchableOpacity
                onPress={onShowHelp}
                style={styles.helpLink}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.helpLinkText}>First time here?</Text>
              </TouchableOpacity>
            )}
          </View>
        </BlurView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Map Section (40% viewport)
  mapContainer: {
    flex: 4, // 40% of viewport
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.primary,
    opacity: 0.05, // Subtle blue tint
  },
  
  // Header Section (20% viewport)
  headerContainer: {
    flex: 2, // 20% of viewport
    justifyContent: 'flex-end',
  },
  headerBlur: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  headerContent: {
    paddingHorizontal: theme.spacing.xxl,
    alignItems: 'center',
  },
  headline: {
    ...theme.typography.hero,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subheadline: {
    ...theme.typography.bodyLarge,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontWeight: '400',
  },
  
  // Action Container (40% viewport)
  actionContainer: {
    flex: 4, // 40% of viewport
  },
  actionBlur: {
    flex: 1,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
  },
  actionContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.xxl,
    justifyContent: 'flex-start',
    paddingBottom: Platform.OS === 'ios' ? 32 : theme.spacing.lg, // Safe area
  },
  
  // Primary Button (Start a Detour)
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    // iOS-style shadow (UX_BLUEPRINT_4)
    ...theme.shadows.md,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.95 }], // Scale on press (UX_BLUEPRINT_3)
    opacity: 0.9,
  },
  primaryButtonText: {
    ...theme.typography.button,
    color: theme.colors.textInverse,
  },
  
  // Secondary Button (Browse My Detours)
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  secondaryButtonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.7,
  },
  secondaryButtonText: {
    ...theme.typography.button,
    fontSize: 16,
    color: theme.colors.primary,
  },
  
  // Help Link
  helpLink: {
    alignSelf: 'center',
    paddingVertical: theme.spacing.sm,
  },
  helpLinkText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textTertiary,
    textDecorationLine: 'underline',
  },
});
