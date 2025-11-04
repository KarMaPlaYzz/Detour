import { HapticService } from '@/services/HapticService';
import { theme } from '@/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
    Animated,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface POI {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  distance: number;
  address: string;
  image?: string;
}

interface OptimizedPOICardProps {
  poi: POI;
  onPress: (poi: POI) => void;
  onSave?: (poi: POI) => void;
  isSaved?: boolean;
  animatedValue?: Animated.Value;
}

/**
 * Memoized POI Card Component
 * Optimized with React.memo and useMemo for performance
 * Integrates haptic feedback on interactions
 */
const OptimizedPOICard: React.FC<OptimizedPOICardProps> = React.memo(({
  poi,
  onPress,
  onSave,
  isSaved = false,
  animatedValue,
}) => {
  // Memoize the animation styles
  const animatedStyles = useMemo(() => {
    if (!animatedValue) {
      return {
        opacity: 1,
        transform: [{ scale: 1 }],
      };
    }

    return {
      opacity: animatedValue,
      transform: [
        {
          scale: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.95, 1],
          }),
        },
      ],
    };
  }, [animatedValue]);

  // Memoize the rating calculation
  const ratingDisplay = useMemo(() => {
    return Math.round(poi.rating * 10) / 10;
  }, [poi.rating]);

  // Memoize the distance display
  const distanceDisplay = useMemo(() => {
    return poi.distance < 1
      ? `${Math.round(poi.distance * 1000)}m`
      : `${poi.distance.toFixed(1)}km`;
  }, [poi.distance]);

  // Memoize the category badge color
  const categoryColor = useMemo(() => {
    const colors: { [key: string]: string } = {
      restaurant: theme.colors.accentLight,
      museum: theme.colors.creamDarker,
      landmark: theme.colors.accentLight,
      park: theme.colors.greenLight,
      art: theme.colors.creamDarker,
    };
    return colors[poi.category.toLowerCase()] || theme.colors.accentLight;
  }, [poi.category]);

  const handlePress = () => {
    HapticService.mediumImpact();
    onPress(poi);
  };

  const handleSave = (e: any) => {
    e.stopPropagation();
    HapticService.selection();
    onSave?.(poi);
  };

  return (
    <Animated.View style={[styles.cardContainer, animatedStyles]}>
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {/* Image */}
        {poi.image ? (
          <Image
            source={{ uri: poi.image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image" size={40} color={theme.colors.textTertiary} />
          </View>
        )}

        {/* Overlay gradient background */}
        <View style={styles.overlay} />

        {/* Save button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: isSaved ? theme.colors.accentLight : theme.colors.darkPrimary },
          ]}
          onPress={handleSave}
        >
          <Ionicons
            name={isSaved ? 'heart' : 'heart-outline'}
            size={18}
            color={isSaved ? theme.colors.textWhite : theme.colors.accentLight}
          />
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          {/* Category badge */}
          <View style={[styles.badge, { backgroundColor: categoryColor + '20' }]}>
            <Text style={[styles.badgeText, { color: categoryColor }]}>
              {poi.category}
            </Text>
          </View>

          {/* Name */}
          <Text style={styles.name} numberOfLines={2}>
            {poi.name}
          </Text>

          {/* Address */}
          <Text style={styles.address} numberOfLines={1}>
            {poi.address}
          </Text>

          {/* Bottom row - Rating and Distance */}
          <View style={styles.bottomRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color={theme.colors.creamDarker} />
              <Text style={styles.rating}>{ratingDisplay}</Text>
              <Text style={styles.reviews}>({poi.reviews})</Text>
            </View>
            <Text style={styles.distance}>{distanceDisplay}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

OptimizedPOICard.displayName = 'OptimizedPOICard';

export default OptimizedPOICard;

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: theme.spacing.md,
  },
  card: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.darkTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  saveButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  content: {
    position: 'absolute',
    bottom: theme.spacing.md,
    left: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 5,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textWhite,
    marginBottom: theme.spacing.xs,
  },
  address: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textWhite,
  },
  reviews: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  distance: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.accentLight,
  },
});
