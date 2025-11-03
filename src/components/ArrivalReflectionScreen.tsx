/**
 * ArrivalReflectionScreen - Post-detour reflection and sharing
 * Based on UX_BLUEPRINT_2 - SCREEN 5: ARRIVAL & REFLECTION
 * 
 * User Goal: Reflect on experience, capture memories, share or save
 * Layout: Route summary map + Highlights + Emoji reactions + Share options
 * Emotional Intention: Reflective and celebratory, "You did something cool today"
 */

import { theme } from '@/styles/theme';
import { DetourRoute, POI, Vibe } from '@/types/detour';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

type EmojiReaction = 'happy' | 'amazed' | 'thoughtful' | 'peaceful' | 'energized';

interface ArrivalReflectionScreenProps {
  route: DetourRoute;
  vibe: Vibe;
  poisVisited: POI[];
  timeSpent: number; // minutes
  onStartAnother: () => void;
  onReturnToMap: () => void;
  onSaveDetour: () => void;
}

const EMOJI_REACTIONS: { id: EmojiReaction; emoji: string; label: string }[] = [
  { id: 'happy', emoji: '😊', label: 'Happy' },
  { id: 'amazed', emoji: '🤩', label: 'Amazed' },
  { id: 'thoughtful', emoji: '🤔', label: 'Thoughtful' },
  { id: 'peaceful', emoji: '😌', label: 'Peaceful' },
  { id: 'energized', emoji: '⚡', label: 'Energized' },
];

export const ArrivalReflectionScreen: React.FC<ArrivalReflectionScreenProps> = ({
  route,
  vibe,
  poisVisited,
  timeSpent,
  onStartAnother,
  onReturnToMap,
  onSaveDetour,
}) => {
  const [selectedReaction, setSelectedReaction] = React.useState<EmojiReaction | null>(null);
  const mapRef = React.useRef<MapView>(null);

  // Fit map to show route
  React.useEffect(() => {
    if (route.coordinates && route.coordinates.length > 0 && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(route.coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }, 300);
    }
  }, [route.coordinates]);

  const handleReactionSelect = (reaction: EmojiReaction) => {
    // Spring animation with haptic (UX_BLUEPRINT_3)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedReaction(reaction);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await Share.share({
        message: `Just finished an amazing ${vibe} detour! Visited ${poisVisited.length} spots in ${timeSpent} minutes. 🗺️✨`,
        title: 'My Detour Experience',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSaveDetour();
  };

  const handleStartAnother = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStartAnother();
  };

  const handleReturn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReturnToMap();
  };

  const vibeColors: Record<Vibe, string> = {
    'Creative': theme.colors.vibeCreative,
    'Foodie': theme.colors.vibeFoodie,
    'Nature Escape': theme.colors.vibeNature,
    'History Buff': theme.colors.vibeHistory,
    'Nightlife': theme.colors.vibeNightlife,
    'Hidden Gems': theme.colors.vibeHiddenGems,
    'Local Favorites': theme.colors.vibeLocalFavorites,
  };

  const vibeColor = vibeColors[vibe] || theme.colors.primary;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>You've arrived! 🎉</Text>
          <Text style={styles.subtitle}>
            {timeSpent} minutes of discovery
          </Text>
        </View>

        {/* Route Summary Map */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            {route.coordinates && route.coordinates.length > 0 && (
              <Polyline
                coordinates={route.coordinates}
                strokeColor={vibeColor}
                strokeWidth={4}
                lineCap="round"
              />
            )}
            
            {route.markers && route.markers.length >= 2 && (
              <>
                <Marker coordinate={route.markers[0]} pinColor={theme.colors.userLocationPin} />
                <Marker coordinate={route.markers[1]} pinColor={theme.colors.destinationPin} />
              </>
            )}

            {poisVisited.map((poi, index) => (
              <Marker
                key={`${poi.name}-${index}`}
                coordinate={poi.location}
                pinColor={vibeColor}
              />
            ))}
          </MapView>
        </View>

        {/* Journey Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{poisVisited.length}</Text>
            <Text style={styles.statLabel}>Spots Visited</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{timeSpent}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{vibe}</Text>
            <Text style={styles.statLabel}>Vibe</Text>
          </View>
        </View>

        {/* POI Highlights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Highlights</Text>
          {poisVisited.map((poi, index) => (
            <View key={`${poi.name}-${index}`} style={styles.highlightCard}>
              <View style={[styles.highlightIcon, { backgroundColor: vibeColor + '20' }]}>
                <Text style={styles.highlightEmoji}>📍</Text>
              </View>
              <View style={styles.highlightContent}>
                <Text style={styles.highlightName}>{poi.name}</Text>
                <Text style={styles.highlightDescription} numberOfLines={1}>
                  {poi.description || 'An interesting stop'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Reflection Prompt */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How did this detour make you feel?</Text>
          <View style={styles.emojiContainer}>
            {EMOJI_REACTIONS.map((reaction) => (
              <Pressable
                key={reaction.id}
                onPress={() => handleReactionSelect(reaction.id)}
                style={({ pressed }) => [
                  styles.emojiButton,
                  selectedReaction === reaction.id && styles.emojiButtonSelected,
                  pressed && styles.emojiButtonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.emojiIcon,
                    selectedReaction === reaction.id && styles.emojiIconSelected,
                  ]}
                >
                  {reaction.emoji}
                </Text>
                <Text
                  style={[
                    styles.emojiLabel,
                    selectedReaction === reaction.id && styles.emojiLabelSelected,
                  ]}
                >
                  {reaction.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: vibeColor },
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Share This Detour</Text>
          </Pressable>

          <View style={styles.secondaryActions}>
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Save</Text>
            </Pressable>

            <Pressable
              onPress={handleStartAnother}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Start Another</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={handleReturn}
            style={({ pressed }) => [
              styles.tertiaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.tertiaryButtonText}>Return to Map</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 32 : theme.spacing.xxl,
  },
  
  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.bodyLarge,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  
  // Map
  mapContainer: {
    height: 220,
    marginHorizontal: theme.spacing.xxl,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  map: {
    flex: 1,
  },
  
  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.xxl,
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.backgroundElevated,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  statValue: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  
  // Section
  section: {
    paddingHorizontal: theme.spacing.xxl,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  
  // Highlights
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundElevated,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  highlightIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  highlightEmoji: {
    fontSize: 24,
  },
  highlightContent: {
    flex: 1,
  },
  highlightName: {
    ...theme.typography.bodySemibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  highlightDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  
  // Emoji Reactions
  emojiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  emojiButton: {
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.cardBorder,
    backgroundColor: theme.colors.backgroundElevated,
    minWidth: 90,
  },
  emojiButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
    transform: [{ scale: 1.05 }],
  },
  emojiButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  emojiIcon: {
    fontSize: 40,
    marginBottom: theme.spacing.xs,
  },
  emojiIconSelected: {
    transform: [{ scale: 1.15 }],
  },
  emojiLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  emojiLabelSelected: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  
  // Actions
  actionsContainer: {
    paddingHorizontal: theme.spacing.xxl,
    marginTop: theme.spacing.lg,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  primaryButtonText: {
    ...theme.typography.button,
    color: theme.colors.textInverse,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...theme.typography.buttonSmall,
    color: theme.colors.primary,
  },
  tertiaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  tertiaryButtonText: {
    ...theme.typography.buttonSmall,
    color: theme.colors.textTertiary,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.8,
  },
});
