import { theme } from '@/styles/theme';
import { POI } from '@/types/detour';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useMemo } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface POISelectionSheetProps {
  visible: boolean;
  pois: POI[];
  selectedPOIName?: string;
  interest: string;
  onSelectPOI: (poi: POI) => void;
  onClose: () => void;
  isLoading?: boolean;
}

/**
 * Calculates a "score" for ranking POIs
 * Considers: rating, distance to route, review count
 */
function calculatePOIScore(poi: POI): number {
  const ratingWeight = 0.5;
  const distanceWeight = 0.3;
  const reviewWeight = 0.2;

  // Rating component (0-5, scale to 0-50)
  const ratingScore = (poi.rating || 0) * 10;

  // Distance component (closer = higher score)
  // Max 2km, closer is better
  const maxDistance = 2000; // meters
  const distanceScore = Math.max(
    0,
    (1 - (poi.distanceToRoute || maxDistance) / maxDistance) * 30
  );

  // Review component (log scale, more reviews = slightly higher)
  const reviewScore = Math.min(20, Math.log10((poi.user_ratings_total || 1) + 1) * 5);

  return (
    ratingScore * ratingWeight +
    distanceScore * distanceWeight +
    reviewScore * reviewWeight
  );
}

/**
 * Get a reason why this POI is recommended
 */
function getRecommendationReason(poi: POI): string {
  if (!poi.rating) return 'Nearby';
  
  if (poi.rating >= 4.7) return 'Highly rated';
  if (poi.rating >= 4.3) return 'Popular choice';
  if (poi.user_ratings_total && poi.user_ratings_total > 500) return 'Well reviewed';
  
  return 'Recommended';
}

export default function POISelectionSheet({
  visible,
  pois,
  selectedPOIName,
  interest,
  onSelectPOI,
  onClose,
  isLoading = false,
}: POISelectionSheetProps) {
  const insets = useSafeAreaInsets();

  // Rank POIs by score
  const rankedPOIs = useMemo(() => {
    return [...pois]
      .map(poi => ({ poi, score: calculatePOIScore(poi) }))
      .sort((a, b) => b.score - a.score)
      .map(({ poi }) => poi);
  }, [pois]);

  const renderPOIItem = ({ item, index }: { item: POI; index: number }) => {
    const isSelected = selectedPOIName === item.name;
    const reason = getRecommendationReason(item);

    return (
      <Pressable
        style={[
          styles.poiCard,
          isSelected && styles.poiCardSelected,
        ]}
        onPress={() => onSelectPOI(item)}
      >
        {/* Rank Badge */}
        <View
          style={[
            styles.rankBadge,
            isSelected && styles.rankBadgeSelected,
          ]}
        >
          <Text style={[styles.rankText, isSelected && styles.rankTextSelected]}>
            {index + 1}
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.poiContent}>
          {/* Name & Reason */}
          <View style={styles.nameSection}>
            <Text style={styles.poiName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.reason}>{reason}</Text>
          </View>

          {/* Details Row */}
          <View style={styles.detailsRow}>
            {/* Rating */}
            {item.rating && (
              <View style={styles.detailItem}>
                <MaterialCommunityIcons
                  name="star"
                  size={14}
                  color="#FFA500"
                />
                <Text style={styles.detailText}>
                  {item.rating.toFixed(1)}
                </Text>
                {item.user_ratings_total && (
                  <Text style={styles.reviewCount}>
                    ({item.user_ratings_total > 1000
                      ? `${(item.user_ratings_total / 1000).toFixed(1)}k`
                      : item.user_ratings_total})
                  </Text>
                )}
              </View>
            )}

            {/* Distance to Route */}
            {item.distanceToRoute !== undefined && (
              <View style={styles.detailItem}>
                <MaterialCommunityIcons
                  name="road"
                  size={14}
                  color="#0066FF"
                />
                <Text style={styles.detailText}>
                  {item.distanceToRoute < 1000
                    ? `${Math.round(item.distanceToRoute)}m`
                    : `${(item.distanceToRoute / 1000).toFixed(1)}km`}
                </Text>
              </View>
            )}
          </View>

          {/* Address & Hours */}
          <View style={styles.addressSection}>
            {item.formattedAddress && (
              <Text style={styles.address} numberOfLines={1}>
                📍 {item.formattedAddress}
              </Text>
            )}

            {/* Open Status */}
            {item.business_status && (
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      item.business_status === 'OPERATIONAL'
                        ? '#E8F5E9'
                        : '#FFEBEE',
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        item.business_status === 'OPERATIONAL'
                          ? '#00C853'
                          : '#FF6B6B',
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        item.business_status === 'OPERATIONAL'
                          ? '#2E7D32'
                          : '#C62828',
                    },
                  ]}
                >
                  {item.business_status === 'OPERATIONAL'
                    ? 'Open Now'
                    : 'Closed'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Selection Indicator */}
        {isSelected && (
          <View style={styles.checkmark}>
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color={theme.colors.accent}
            />
          </View>
        )}
      </Pressable>
    );
  };

  if (!visible) return null;

  return (
    <BlurView intensity={80} tint="dark" style={[styles.overlay]}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View
        style={[
          styles.sheet,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {interest}
            </Text>
            <Text style={styles.headerSubtitle}>
              {rankedPOIs.length} options nearby
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={theme.colors.textPrimary}
            />
          </Pressable>
        </View>

        {/* POI List */}
        <FlatList
          data={rankedPOIs}
          renderItem={renderPOIItem}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          scrollEnabled={rankedPOIs.length > 4}
          scrollIndicatorInsets={{ right: 1 }}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.listContent}
          bounces={false}
        />

        {/* Footer Info */}
        <View style={styles.footer}>
          <MaterialCommunityIcons
            name="information"
            size={16}
            color={theme.colors.textTertiary}
          />
          <Text style={styles.footerText}>
            Select a location to update your route
          </Text>
        </View>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 200,
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '85%',
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  listContent: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  poiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBgSecondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: theme.colors.cardBorder,
    gap: theme.spacing.md,
  },
  poiCardSelected: {
    backgroundColor: '#E0EAFF',
    borderColor: theme.colors.accent,
    borderWidth: 2,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.card,
    borderWidth: 1.5,
    borderColor: theme.colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  rankBadgeSelected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  rankText: {
    ...theme.typography.button,
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  rankTextSelected: {
    color: theme.colors.card,
  },
  poiContent: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  nameSection: {
    gap: 2,
  },
  poiName: {
    ...theme.typography.bodySemibold,
    color: theme.colors.textPrimary,
    fontSize: 15,
  },
  reason: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    fontSize: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  reviewCount: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    fontSize: 11,
  },
  addressSection: {
    gap: 6,
  },
  address: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    fontSize: 11,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  checkmark: {
    flexShrink: 0,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
    backgroundColor: '#F8F9FB',
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
    marginHorizontal: -theme.spacing.md,
    marginBottom: -theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  footerText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    fontSize: 12,
  },
});
