/**
 * StoreTypesSelector - Bottom Sheet for selecting actual store types found along the route
 * Displays real POI types from Google Places API instead of predefined vibes
 * 
 * User Goal: See what types of places are available and choose which ones interest them
 * Layout: Scrollable bottom sheet with store type cards showing actual results
 * Emotional Intention: Transparent and empowering - users see real data
 */

import { theme } from '@/styles/theme';
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

interface StoreTypesSelectorProps {
  visible: boolean;
  storeTypes: { [key: string]: string }; // { type: displayName }
  onSelect: (type: string) => void;
  onClose: () => void;
  onSkip?: () => void;
}

// Map store types to emoji icons
const STORE_TYPE_ICONS: Record<string, string> = {
  // Attractions & Entertainment
  'tourist_attraction': '🎫',
  'amusement_park': '🎢',
  'aquarium': '🐠',
  'art_gallery': '🖼️',
  'museum': '🏛️',
  'movie_theater': '🎬',
  'zoo': '🦁',
  'casino': '🎰',
  'bowling_alley': '🎳',
  'night_club': '🎭',
  'bar': '🍸',
  'stadium': '⚽',
  'spa': '💆',
  
  // Food & Dining
  'cafe': '☕',
  'restaurant': '🍽️',
  'bakery': '🥐',
  'food': '🍱',
  'meal_delivery': '🚚',
  'meal_takeaway': '📦',
  'ice_cream_shop': '🍦',
  'coffee': '☕',
  'fast_food': '🍔',
  
  // Lodging
  'lodging': '🏨',
  'hostel': '🏠',
  'campground': '⛺',
  
  // Shopping
  'shopping_mall': '🛍️',
  'store': '🏪',
  'book_store': '📚',
  'clothing_store': '👕',
  'supermarket': '🛒',
  
  // Nature & Parks
  'park': '🌳',
  'garden': '🌹',
  'natural_feature': '🏞️',
  'beach': '🏖️',
  'mountain': '⛰️',
  
  // Religion & Culture
  'church': '⛪',
  'temple': '🕉️',
  'mosque': '🕌',
  'synagogue': '🕍',
  'monument': '🗿',
  'historic': '🏛️',
  
  // Services
  'gym': '💪',
  'bank': '🏦',
  'pharmacy': '💊',
  'hospital': '🏥',
  'post_office': '📮',
  'library': '📖',
  
  // Street Art
  'street_art': '🎨',
  'mural': '🖌️',
  'graffiti': '✏️',
};

// Map store types to descriptive text
const STORE_TYPE_DESCRIPTIONS: Record<string, string> = {
  'tourist_attraction': 'Popular places to visit and explore',
  'amusement_park': 'Fun rides and entertainment venues',
  'aquarium': 'Marine life and underwater exhibits',
  'art_gallery': 'Curated art exhibitions and displays',
  'museum': 'Historical and cultural collections',
  'movie_theater': 'Cinema and film screenings',
  'zoo': 'Wildlife and animal exhibits',
  'cafe': 'Coffee shops and casual dining',
  'restaurant': 'Full-service dining establishments',
  'bakery': 'Fresh baked goods and pastries',
  'ice_cream_shop': 'Frozen treats and desserts',
  'coffee': 'Coffee and specialty beverages',
  'park': 'Green spaces and recreation areas',
  'garden': 'Botanical gardens and landscaped spaces',
  'beach': 'Coastal areas and waterfront',
  'shopping_mall': 'Large shopping centers with multiple stores',
  'lodging': 'Hotels and accommodation',
  'gym': 'Fitness and exercise facilities',
  'bar': 'Bars and nightlife venues',
  'night_club': 'Nightclubs and late-night entertainment',
  'church': 'Christian places of worship',
  'temple': 'Hindu, Buddhist and other temples',
  'mosque': 'Islamic places of worship',
  'book_store': 'Bookshops and literary venues',
  'library': 'Public libraries and learning centers',
  'historic': 'Historic sites and heritage locations',
  'monument': 'Commemorative monuments',
  'street_art': 'Public art and murals',
};

export const StoreTypesSelector: React.FC<StoreTypesSelectorProps> = ({
  visible,
  storeTypes,
  onSelect,
  onClose,
  onSkip,
}) => {
  const [selectedType, setSelectedType] = React.useState<string | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['85%'], []);
  const isSelectingRef = useRef(false);

  // Convert object to array and sort by some default order
  const storeTypesList = useMemo(() => {
    return Object.entries(storeTypes).map(([type, displayName]) => ({
      id: type,
      displayName,
      icon: STORE_TYPE_ICONS[type] || '📍',
      description: STORE_TYPE_DESCRIPTIONS[type] || `Find ${displayName.toLowerCase()} along your route`,
    }));
  }, [storeTypes]);

  // Control bottom sheet based on visible prop
  useEffect(() => {
    if (visible) {
      isSelectingRef.current = false;
      setSelectedType(null);
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

  const handleSelect = (typeId: string) => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 50);
    
    setSelectedType(typeId);
    isSelectingRef.current = true;
    
    setTimeout(() => {
      onSelect(typeId);
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
            <Text style={styles.title}>What'll we explore?</Text>
            <Text style={styles.subtitle}>{storeTypesList.length} types discovered on your route.</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Store Type Cards */}
        {storeTypesList.length > 0 ? (
          storeTypesList.map((store) => (
            <Pressable
              key={store.id}
              onPress={() => handleSelect(store.id)}
              style={({ pressed }) => [
                styles.storeCard,
                selectedType === store.id && styles.storeCardSelected,
                pressed && styles.storeCardPressed,
              ]}
            >
              {/* Icon Section */}
              <View style={styles.iconContainer}>
                <Text style={styles.storeIcon}>{store.icon}</Text>
              </View>

              {/* Content Section */}
              <View style={styles.storeContent}>
                <Text style={styles.storeName}>{store.displayName}</Text>
                <Text style={styles.storeDescription}>
                  {store.description}
                </Text>
              </View>

              {/* Chevron */}
              <View style={styles.chevron}>
                <Text
                  style={[
                    styles.chevronText,
                    selectedType === store.id && styles.chevronSelected,
                  ]}
                >
                  {selectedType === store.id ? '✓' : '›'}
                </Text>
              </View>
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No store types found along this route. Try a different route.
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
            <Text style={styles.skipSubtext}>Pick from all types</Text>
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
  
  // Store Card
  storeCard: {
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
  storeCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  storeCardSelected: {
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
    backgroundColor: theme.colors.primary + '15',
  },
  storeIcon: {
    fontSize: 32,
  },
  
  // Content
  storeContent: {
    flex: 1,
    justifyContent: 'center',
  },
  storeName: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  storeDescription: {
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
