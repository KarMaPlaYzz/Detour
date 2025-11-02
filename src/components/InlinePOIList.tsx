import { theme } from '@/styles/theme';
import { POI } from '@/types/detour';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';

interface InlinePOIListProps {
  visible: boolean;
  pois: POI[];
  selectedPOIName?: string;
  interest: string;
  onSelectPOI: (poi: POI) => void;
  isLoading?: boolean;
  poiCosts?: { [key: string]: { extraTime: number; extraDistance: number } };
}

function calculatePOIScore(poi: POI): number {
  const ratingWeight = 0.5;
  const distanceWeight = 0.3;
  const reviewWeight = 0.2;

  const ratingScore = (poi.rating || 0) * 10;

  const maxDistance = 2000;
  const distanceScore = Math.max(
    0,
    (1 - (poi.distanceToRoute || maxDistance) / maxDistance) * 30
  );

  const reviewScore = Math.min(20, Math.log10((poi.user_ratings_total || 1) + 1) * 5);

  return (
    ratingScore * ratingWeight +
    distanceScore * distanceWeight +
    reviewScore * reviewWeight
  );
}

function formatDuration(seconds: number | undefined): string {
  if (!seconds || seconds <= 0) return '—';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function formatDistance(meters: number | undefined): string {
  if (!meters || meters <= 0) return '—';
  
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  
  return `${(meters / 1000).toFixed(1)}km`;
}

function getRecommendationReason(poi: POI): string {
  if (!poi.rating) return 'Nearby';
  
  if (poi.rating >= 4.7) return 'Highly rated';
  if (poi.rating >= 4.3) return 'Popular choice';
  if (poi.user_ratings_total && poi.user_ratings_total > 500) return 'Well reviewed';
  
  return 'Recommended';
}

export default function InlinePOIList({
  visible,
  pois,
  selectedPOIName,
  interest,
  onSelectPOI,
  isLoading = false,
  poiCosts = {},
}: InlinePOIListProps) {
  
  const rankedPOIs = useMemo(() => {
    return [...pois]
      .map(poi => ({ poi, score: calculatePOIScore(poi) }))
      .sort((a, b) => b.score - a.score)
      .map(({ poi }) => poi);
  }, [pois]);

  const renderPOIItem = ({ item, index }: { item: POI; index: number }) => {
    const isSelected = selectedPOIName === item.name;
    const reason = getRecommendationReason(item);
    const cost = poiCosts[item.name];

    return (
      <Pressable
        style={[
          styles.poiCard,
          isSelected && styles.poiCardSelected,
        ]}
        onPress={() => onSelectPOI(item)}
      >
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

        <View style={styles.poiContent}>
          <View style={styles.nameSection}>
            <Text style={styles.poiName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.reason}>{reason}</Text>
          </View>

          <View style={styles.detailsRow}>
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

            {item.distanceToRoute !== undefined && (
              <View style={styles.detailItem}>
                <MaterialCommunityIcons
                  name="road"
                  size={14}
                  color="#0066FF"
                />
                <Text style={styles.detailText}>
                  {formatDistance(item.distanceToRoute)}
                </Text>
              </View>
            )}
          </View>

          {cost && (
            <View style={styles.costSection}>
              <View style={styles.costBadge}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={12}
                  color={theme.colors.accent}
                />
                <Text style={styles.costText}>
                  +{formatDuration(cost.extraTime)}
                </Text>
              </View>
              <View style={styles.costBadge}>
                <MaterialCommunityIcons
                  name="map-marker-distance"
                  size={12}
                  color={theme.colors.accent}
                />
                <Text style={styles.costText}>
                  +{formatDistance(cost.extraDistance)}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.addressSection}>
            {item.formattedAddress && (
              <Text style={styles.address} numberOfLines={1}>
                📍 {item.formattedAddress}
              </Text>
            )}

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

        <View style={styles.rightSection}>
          {isLoading && isSelected ? (
            <ActivityIndicator
              size="small"
              color={theme.colors.accent}
            />
          ) : isSelected ? (
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color={theme.colors.accent}
            />
          ) : null}
        </View>
      </Pressable>
    );
  };

  if (!visible || pois.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Choose a {interest.toLowerCase()}
        </Text>
        <Text style={styles.sectionSubtitle}>
          {rankedPOIs.length} option{rankedPOIs.length !== 1 ? 's' : ''} • Shows extra time & distance
        </Text>
      </View>

      <FlatList
        data={rankedPOIs}
        renderItem={renderPOIItem}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        scrollEnabled={true}
        scrollIndicatorInsets={{ right: 1 }}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.listContent}
        bounces={false}
        nestedScrollEnabled={true}
        maxToRenderPerBatch={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    overflow: 'hidden',
    marginTop: theme.spacing.md,
    ...theme.shadows.sm,
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
    backgroundColor: theme.colors.cardBgSecondary,
  },
  sectionTitle: {
    ...theme.typography.bodySemibold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    fontSize: 12,
  },
  listContent: {
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  poiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBgSecondary,
    borderRadius: theme.borderRadius.md,
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
  costSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: 2,
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    backgroundColor: '#E0EAFF',
  },
  costText: {
    ...theme.typography.caption,
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: '600',
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
  rightSection: {
    flexShrink: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
});
