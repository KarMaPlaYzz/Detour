import { theme } from '@/styles/theme';
import { POI } from '@/types/detour';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface POICardProps {
  poi: POI | null;
  onViewPhotos?: () => void;
  onToggleFavorite?: (isFavorite: boolean) => void;
  onGenerateRoute?: () => void;
  isFavorite?: boolean;
  isLoading?: boolean;
}

export const POICard: React.FC<POICardProps> = ({
  poi,
  onViewPhotos,
  onToggleFavorite,
  onGenerateRoute,
  isFavorite = false,
  isLoading = false,
}) => {
  if (!poi) return null;

  // Mock photos - in real app, these would come from Google Places API
  const photos = [
    poi.photoUrl || 'https://via.placeholder.com/300x300?text=Photo1',
    'https://via.placeholder.com/300x300?text=Photo2',
    'https://via.placeholder.com/300x300?text=Photo3',
  ];

  return (
    <View style={styles.container}>
      {/* Photos carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        style={styles.photosScroll}
      >
        {photos.map((photo, index) => (
          <Image
            key={index}
            source={{ uri: photo }}
            style={styles.photo}
          />
        ))}
      </ScrollView>

      {/* POI Info */}
      <View style={styles.content}>
        <Text style={styles.name}>{poi.name}</Text>
        <Text style={styles.category}>{poi.category || 'Place'}</Text>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <View style={styles.rating}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < Math.floor(poi.rating || 0) ? 'star' : 'star-outline'}
                size={14}
                color={theme.colors.tertiary}
              />
            ))}
          </View>
          <Text style={styles.ratingText}>
            {poi.rating?.toFixed(1) || 'N/A'} ({poi.reviewCount || 0} reviews)
          </Text>
        </View>

        {/* Description/Quote */}
        {poi.formattedAddress && (
          <Text style={styles.description} numberOfLines={2}>
            {poi.formattedAddress}
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onViewPhotos}
          disabled={isLoading}
        >
          <Ionicons name="image-outline" size={18} color={theme.colors.textPrimary} />
          <Text style={styles.secondaryButtonText}>View Photos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => onToggleFavorite?.(!isFavorite)}
          disabled={isLoading}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? theme.colors.error : theme.colors.textPrimary}
          />
          <Text style={styles.secondaryButtonText}>
            {isFavorite ? 'Favorited' : 'Favorites'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Generate Route Button */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={onGenerateRoute}
        disabled={isLoading}
      >
        <Text style={styles.primaryButtonText}>
          {isLoading ? 'Generating...' : 'Generate Detour Route'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  photosScroll: {
    maxHeight: 180,
  },
  photo: {
    width: 200,
    height: 180,
    marginRight: theme.spacing.sm,
  },
  content: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  category: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  rating: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  description: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: theme.spacing.sm,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  primaryButton: {
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textWhite,
  },
});
