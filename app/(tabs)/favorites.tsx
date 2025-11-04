import { FloatingNavigation } from '@/components/FloatingNavigation';
import {
    ANIMATION_TIMING
} from '@/services/AnimationService';
import { HapticService } from '@/services/HapticService';
import { PerformanceMonitor } from '@/services/PerformanceMonitor';
import { theme } from '@/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Animated,
    Image,
    SafeAreaView,
    SectionList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface FavoritePOI {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  address: string;
  photoUrl?: string;
  distance?: string;
  isSaved: boolean;
}

interface GroupedFavorites {
  title: string;
  data: FavoritePOI[];
  icon: string;
}

export default function FavoritesScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoritePOI[]>([
    {
      id: '1',
      name: 'Ferry Building Marketplace',
      category: 'Food & Dining',
      rating: 4.6,
      reviewCount: 2543,
      address: 'Ferry Building, San Francisco, CA',
      distance: '2.3 km away',
      isSaved: true,
    },
    {
      id: '2',
      name: 'Painted Ladies',
      category: 'Architecture',
      rating: 4.7,
      reviewCount: 4892,
      address: 'Alamo Square, San Francisco, CA',
      distance: '5.1 km away',
      isSaved: true,
    },
    {
      id: '3',
      name: 'Tartine Bakery',
      category: 'Food & Dining',
      rating: 4.5,
      reviewCount: 1832,
      address: 'Guerrero St, San Francisco, CA',
      distance: '3.8 km away',
      isSaved: true,
    },
    {
      id: '4',
      name: 'Coit Tower',
      category: 'Landmarks',
      rating: 4.4,
      reviewCount: 3120,
      address: 'Telegraph Hill, San Francisco, CA',
      distance: '4.2 km away',
      isSaved: true,
    },
    {
      id: '5',
      name: 'Japanese Tea Garden',
      category: 'Nature & Parks',
      rating: 4.6,
      reviewCount: 2891,
      address: 'Golden Gate Park, San Francisco, CA',
      distance: '6.8 km away',
      isSaved: true,
    },
    {
      id: '6',
      name: 'Street Art Alley',
      category: 'Art & Culture',
      rating: 4.3,
      reviewCount: 1205,
      address: 'Mission District, San Francisco, CA',
      distance: '2.1 km away',
      isSaved: true,
    },
  ]);

  const categories = ['Food & Dining', 'Architecture', 'Landmarks', 'Nature & Parks', 'Art & Culture'];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: ANIMATION_TIMING.STANDARD,
      useNativeDriver: true,
    }).start();
  }, []);

  const groupedFavorites: GroupedFavorites[] = useMemo(() => {
    if (selectedCategory) {
      return [
        {
          title: selectedCategory,
          data: favorites.filter(f => f.category === selectedCategory),
          icon: getCategoryIcon(selectedCategory),
        },
      ];
    }
    return categories.map(cat => ({
      title: cat,
      data: favorites.filter(f => f.category === cat),
      icon: getCategoryIcon(cat),
    }));
  }, [selectedCategory, favorites]);

  function getCategoryIcon(category: string): string {
    switch (category) {
      case 'Food & Dining':
        return 'restaurant';
      case 'Architecture':
        return 'home';
      case 'Landmarks':
        return 'flag';
      case 'Nature & Parks':
        return 'leaf';
      case 'Art & Culture':
        return 'palette';
      default:
        return 'location';
    }
  }

  const handleRemoveFavorite = useCallback((id: string) => {
    HapticService.selection();
    PerformanceMonitor.start('removeFavorite');
    setFavorites(prev => prev.filter(fav => fav.id !== id));
    PerformanceMonitor.end('removeFavorite');
  }, []);

  const handleToggleCategory = useCallback((category: string) => {
    HapticService.lightTap();
    setSelectedCategory(selectedCategory === category ? null : category);
  }, [selectedCategory]);

  const renderPOICard = useCallback(({ item }: { item: FavoritePOI }) => (
    <TouchableOpacity
      style={styles.poiCard}
      activeOpacity={0.7}
      onPress={async () => await HapticService.mediumImpact()}
    >
      {/* POI Image */}
      {item.photoUrl ? (
        <Image source={{ uri: item.photoUrl }} style={styles.poiImage} />
      ) : (
        <View style={styles.poiImagePlaceholder}>
          <Ionicons name="image-outline" size={32} color={theme.colors.textTertiary} />
        </View>
      )}

      {/* POI Info */}
      <View style={styles.poiInfo}>
        <Text style={styles.poiName} numberOfLines={1}>
          {item.name}
        </Text>

        {/* Rating */}
        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name={i < Math.floor(item.rating) ? 'star' : 'star-outline'}
              size={12}
              color={theme.colors.creamDarker}
            />
          ))}
          <Text style={styles.ratingText}>
            {item.rating.toFixed(1)} ({item.reviewCount})
          </Text>
        </View>

        {/* Address and Distance */}
        <Text style={styles.address} numberOfLines={1}>
          {item.address}
        </Text>
        {item.distance && (
          <Text style={styles.distance}>{item.distance}</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.navigateButton]}
          onPress={async () => await HapticService.success()}
        >
          <Ionicons name="navigate" size={18} color={theme.colors.textWhite} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.removeButton]}
          onPress={() => handleRemoveFavorite(item.id)}
        >
          <Ionicons name="trash" size={18} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  ), [handleRemoveFavorite]);

  const renderSectionHeader = useCallback(({ section }: { section: GroupedFavorites }) => {
    const count = section.data.length;
    return (
      <TouchableOpacity
        style={[
          styles.sectionHeader,
          selectedCategory === section.title && styles.sectionHeaderActive,
        ]}
        onPress={() => handleToggleCategory(section.title)}
      >
        <View style={styles.sectionHeaderLeft}>
          <View style={[styles.sectionIconContainer, { backgroundColor: theme.colors.accentLight + '20' }]}>
            <Ionicons
              name={section.icon as any}
              size={20}
              color={theme.colors.accentLight}
            />
          </View>
          <View>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionCount}>{count} {count === 1 ? 'place' : 'places'}</Text>
          </View>
        </View>

        <Ionicons
          name={selectedCategory === section.title ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>
    );
  }, [selectedCategory, handleToggleCategory]);

  const emptyFavorites = favorites.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Saved Places</Text>
          <Text style={styles.subtitle}>
            {favorites.length} {favorites.length === 1 ? 'favorite' : 'favorites'}
          </Text>
        </View>

        {!emptyFavorites && (
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => {}}
          >
            <Ionicons name="download" size={20} color={theme.colors.accentLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Pills */}
      {!emptyFavorites && (
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedCategory === null && styles.filterPillActive,
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedCategory === null && styles.filterPillTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {categories.map(cat => {
            const count = favorites.filter(f => f.category === cat).length;
            return count > 0 ? (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.filterPill,
                  selectedCategory === cat && styles.filterPillActive,
                ]}
                onPress={() => handleToggleCategory(cat)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    selectedCategory === cat && styles.filterPillTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ) : null;
          })}
        </View>
      )}

      {/* POI List or Empty State */}
      {emptyFavorites ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color={theme.colors.textTertiary} />
          <Text style={styles.emptyTitle}>No saved places yet</Text>
          <Text style={styles.emptySubtitle}>
            Explore and save your favorite places to access them later
          </Text>
        </View>
      ) : (
        <Animated.View style={[styles.listContainer, { opacity: fadeAnim }]}>
          <SectionList
            sections={groupedFavorites}
            keyExtractor={(item, index) => item.id + index}
            renderItem={renderPOICard}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={styles.listContent}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
          />
        </Animated.View>
      )}
      <FloatingNavigation bottomOffset={36} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.darkPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  exportButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  filterPill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    backgroundColor: theme.colors.card,
  },
  filterPillActive: {
    borderColor: theme.colors.accentLight,
    backgroundColor: theme.colors.accentLight,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  filterPillTextActive: {
    color: theme.colors.textWhite,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  sectionHeaderActive: {
    borderColor: theme.colors.accentLight,
    backgroundColor: theme.colors.darkLight,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  sectionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  sectionCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  poiCard: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  poiImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
  },
  poiImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.darkTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  poiInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  poiName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  ratingText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  address: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  distance: {
    fontSize: 11,
    color: theme.colors.textTertiary,
  },
  actionButtons: {
    gap: theme.spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigateButton: {
    backgroundColor: theme.colors.accentLight,
  },
  removeButton: {
    backgroundColor: theme.colors.error + '20',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.lg,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});
