/**
 * VibeSelector - Bottom Sheet for selecting mood/vibe
 * Based on UX_BLUEPRINT_2 - SCREEN 2: VIBE SELECTION
 * 
 * User Goal: Communicate emotional state or interest for route matching
 * Layout: Scrollable bottom sheet with vibe cards
 * Emotional Intention: Playful and reflective, users feel understood
 */

import { theme } from '@/styles/theme';
import { Vibe, VibeOption } from '@/types/detour';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// 7 Core Vibes (UX_BLUEPRINT_2)
const VIBE_OPTIONS: VibeOption[] = [
  {
    id: 'Creative',
    name: 'Art & Culture',
    description: 'Art galleries, museums, street art & design studios.',
    icon: '🎨',
    color: theme.colors.vibeCreative,
    gradient: ['#8B5CF6', '#A78BFA'],
  },
  {
    id: 'Foodie',
    name: 'Food & Dining',
    description: 'Restaurants, cafes, bakeries & food experiences.',
    icon: '🍽️',
    color: theme.colors.vibeFoodie,
    gradient: ['#F97316', '#FB923C'],
  },
  {
    id: 'Nature Escape',
    name: 'Parks & Gardens',
    description: 'Parks, gardens, nature reserves & outdoor spaces.',
    icon: '🌳',
    color: theme.colors.vibeNature,
    gradient: ['#10B981', '#34D399'],
  },
  {
    id: 'History Buff',
    name: 'History & Heritage',
    description: 'Museums, historic monuments, heritage sites & landmarks.',
    icon: '🏛️',
    color: theme.colors.vibeHistory,
    gradient: ['#92400E', '#B45309'],
  },
  {
    id: 'Nightlife',
    name: 'Bars & Entertainment',
    description: 'Bars, night clubs, movie theaters & entertainment venues.',
    icon: '🎭',
    color: theme.colors.vibeNightlife,
    gradient: ['#EC4899', '#F472B6'],
  },
  {
    id: 'Hidden Gems',
    name: 'Shopping & Browse',
    description: 'Shopping malls, stores, bookstores & unique shops.',
    icon: '🛍️',
    color: theme.colors.vibeHiddenGems,
    gradient: ['#6366F1', '#818CF8'],
  },
  {
    id: 'Local Favorites',
    name: 'Tourist Attractions',
    description: 'Popular attractions, amusement parks, zoos & aquariums.',
    icon: '🎢',
    color: theme.colors.vibeLocalFavorites,
    gradient: ['#0891B2', '#06B6D4'],
  },
];

interface VibeSelectorProps {
  visible: boolean;
  onSelect: (vibe: Vibe) => void;
  onClose: () => void;
  onSkip?: () => void;
  availablePOITypes?: { [key: string]: string };
}

export const VibeSelector: React.FC<VibeSelectorProps> = ({
  visible,
  onSelect,
  onClose,
  onSkip,
  availablePOITypes = {},
}) => {
  const [selectedVibe, setSelectedVibe] = React.useState<Vibe | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['85%'], []);
  const isSelectingRef = useRef(false);

  // Map vibes to POI types they support (actual Google Places types)
  const vibeToInterestMap: Record<Vibe, string[]> = {
    'Creative': [
      'art_gallery', 'museum', 'street_art', 'mural', 'library', 'book_store',
      'movie_theater', 'theater', 'cultural_center', 'artist_studio', 'design_studio'
    ],
    'Foodie': [
      'cafe', 'restaurant', 'bakery', 'ice_cream_shop', 'coffee', 'bar',
      'food_delivery', 'meal_takeaway', 'fast_food', 'food', 'meal_delivery',
      'bistro', 'pizzeria', 'sushi', 'cafe_coffee'
    ],
    'Nature Escape': [
      'park', 'garden', 'beach', 'mountain', 'natural_feature', 'lake',
      'forest', 'botanical_garden', 'water', 'hiking_trail', 'nature_reserve',
      'waterfall', 'river', 'scenic_area', 'outdoor_recreation'
    ],
    'History Buff': [
      'museum', 'monument', 'historic', 'church', 'temple', 'mosque', 'synagogue',
      'city_hall', 'courthouse', 'castle', 'ruins', 'archaeological_site',
      'war_memorial', 'heritage_site', 'ancient_site'
    ],
    'Nightlife': [
      'bar', 'night_club', 'movie_theater', 'bowling_alley', 'casino',
      'karaoke', 'cocktail_bar', 'nightclub', 'lounge', 'dance_club',
      'pub', 'tavern', 'live_music_venue', 'entertainment_venue'
    ],
    'Hidden Gems': [
      'shopping_mall', 'store', 'book_store', 'clothing_store', 'supermarket',
      'market', 'antique_shop', 'craft_shop', 'vintage_store', 'flea_market',
      'specialty_shop', 'independent_store', 'local_shop', 'gift_shop'
    ],
    'Local Favorites': [
      'tourist_attraction', 'amusement_park', 'zoo', 'aquarium', 'stadium',
      'spa', 'gym', 'sports_complex', 'recreation_center', 'community_center',
      'park', 'plaza', 'marketplace', 'fair_grounds', 'event_venue'
    ],
  };

  // Filter vibes to only show those with available POI types
  const availableVibes = useMemo(() => {
    if (Object.keys(availablePOITypes).length === 0) {
      // If no POI types available, show all vibes
      return VIBE_OPTIONS;
    }

    const availableInterests = Object.values(availablePOITypes);
    
    return VIBE_OPTIONS.filter(vibe => {
      const vibeInterests = vibeToInterestMap[vibe.id as Vibe] || [];
      // Show vibe if at least one of its interests is available
      return vibeInterests.some(interest => availableInterests.includes(interest));
    });
  }, [availablePOITypes]);

  // Control bottom sheet based on visible prop
  useEffect(() => {
    if (visible) {
      isSelectingRef.current = false;
      setSelectedVibe(null); // Reset selection when opening
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
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  const handleSelect = (vibe: Vibe) => {
    // Selection pattern: two light impacts 50ms apart (UX_BLUEPRINT_3)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 50);
    
    setSelectedVibe(vibe);
    
    // Mark that we're selecting (not manually closing)
    isSelectingRef.current = true;
    
    // Delay for visual feedback, then trigger callback (300ms, UX_BLUEPRINT_3)
    setTimeout(() => {
      onSelect(vibe);
    }, 300);
  };

  const handleSkip = () => {
    if (onSkip) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      isSelectingRef.current = true;
      onSkip();
    }
  };

  const handleClose = useCallback(() => {
    // Only call onClose if user manually closed (not selecting an option)
    if (!isSelectingRef.current) {
      onClose();
    }
  }, [onClose]);

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
      <BottomSheetScrollView style={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>What's your vibe?</Text>
            <Text style={styles.subtitle}>Help us tune your detour.</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Vibe Cards */}
        {availableVibes.length > 0 ? (
          availableVibes.map((vibe) => (
            <Pressable
              key={vibe.id}
              onPress={() => handleSelect(vibe.id)}
              style={({ pressed }) => [
                styles.vibeCard,
                selectedVibe === vibe.id && styles.vibeCardSelected,
                pressed && styles.vibeCardPressed,
              ]}
            >
              {/* Icon Section */}
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: vibe.color + '20' }, // 20% opacity
                ]}
              >
                <Text style={styles.vibeIcon}>{vibe.icon}</Text>
              </View>

              {/* Content Section */}
              <View style={styles.vibeContent}>
                <Text style={styles.vibeName}>{vibe.name}</Text>
                <Text style={styles.vibeDescription}>
                  {vibe.description}
                </Text>
              </View>

              {/* Chevron */}
              <View style={styles.chevron}>
                <Text
                  style={[
                    styles.chevronText,
                    selectedVibe === vibe.id && styles.chevronSelected,
                  ]}
                >
                  {selectedVibe === vibe.id ? '✓' : '›'}
                </Text>
              </View>
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No vibes available for the POIs found on this route.
            </Text>
          </View>
        )}

        {/* Skip Option */}
        {onSkip && (
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Surprise me</Text>
            <Text style={styles.skipSubtext}>Or let us pick for you.</Text>
          </TouchableOpacity>
        )}
      </BottomSheetScrollView>
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
  },
  contentContainer: {
    paddingTop: theme.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 32 : theme.spacing.lg,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.xxl,
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  closeButtonText: {
    fontSize: 28,
    color: theme.colors.textTertiary,
    fontWeight: '300',
  },
  
  // Vibe Card
  vibeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.cardBorder,
    marginHorizontal: theme.spacing.xxl,
    marginBottom: theme.spacing.md,
    minHeight: 100,
    ...theme.shadows.sm,
  },
  vibeCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  vibeCardSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 3,
    ...theme.shadows.md,
  },
  
  // Icon
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  vibeIcon: {
    fontSize: 32,
  },
  
  // Content
  vibeContent: {
    flex: 1,
    justifyContent: 'center',
  },
  vibeName: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  vibeDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  
  // Chevron
  chevron: {
    marginLeft: theme.spacing.sm,
  },
  chevronText: {
    fontSize: 28,
    color: theme.colors.textTertiary,
    fontWeight: '300',
  },
  chevronSelected: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: '600',
  },
  
  // Skip Button
  skipButton: {
    marginTop: theme.spacing.lg,
    marginHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  skipText: {
    ...theme.typography.bodySemibold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  skipSubtext: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  
  // Empty State
  emptyState: {
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
