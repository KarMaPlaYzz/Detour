import { theme } from '@/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface POIDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  poi?: {
    id: string;
    name: string;
    category: string;
    rating: number;
    reviewCount: number;
    address: string;
    phone?: string;
    website?: string;
    hours?: string;
    description?: string;
    photoUrls?: string[];
    amenities?: string[];
    reviews?: {
      author: string;
      rating: number;
      text: string;
      time: string;
    }[];
    similarPlaces?: Array<{
      id: string;
      name: string;
      rating: number;
      distance: string;
      photoUrl?: string;
    }>;
  };
  onAddToFavorites?: () => void;
  onGenerateRoute?: () => void;
}

export default function POIDetailsModal({
  visible,
  onClose,
  poi,
  onAddToFavorites,
  onGenerateRoute,
}: POIDetailsModalProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  if (!poi) return null;

  const handleFavoriteToggle = () => {
    setIsFavorited(!isFavorited);
    onAddToFavorites?.();
  };

  const renderPhotoCarousel = () => {
    if (!poi?.photoUrls || poi.photoUrls.length === 0) {
      return (
        <View style={styles.photoPlaceholder}>
          <Ionicons name="image-outline" size={48} color={theme.colors.textTertiary} />
        </View>
      );
    }

    return (
      <View style={styles.photoCarouselContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={e => {
            const index = Math.round(e.nativeEvent.contentOffset.x / 400);
            setSelectedPhotoIndex(index);
          }}
        >
          {poi.photoUrls.map((url, index) => (
            <Image
              key={index}
              source={{ uri: url }}
              style={styles.photo}
            />
          ))}
        </ScrollView>

        {/* Photo Indicators */}
        {poi.photoUrls.length > 1 && (
          <View style={styles.photoIndicators}>
            {poi.photoUrls.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === selectedPhotoIndex && styles.indicatorActive,
                ]}
              />
            ))}
          </View>
        )}

        {/* Photo Count */}
        <View style={styles.photoCount}>
          <Text style={styles.photoCountText}>
            {selectedPhotoIndex + 1} / {poi.photoUrls.length}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={false}
    >
      <SafeAreaView style={styles.container}>
        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Ionicons name="close" size={28} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Photo Carousel */}
          {renderPhotoCarousel()}

          {/* POI Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{poi.name}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{poi.category}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.favoriteButton,
                isFavorited && styles.favoriteButtonActive,
              ]}
              onPress={handleFavoriteToggle}
            >
              <Ionicons
                name={isFavorited ? 'heart' : 'heart-outline'}
                size={28}
                color={isFavorited ? theme.colors.error : theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Rating and Reviews */}
          <View style={styles.ratingSection}>
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < Math.floor(poi.rating) ? 'star' : 'star-outline'}
                    size={18}
                    color={theme.colors.creamDarker}
                  />
                ))}
              </View>
              <Text style={styles.ratingValue}>{poi.rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.reviewCount}>
              {poi.reviewCount} {poi.reviewCount === 1 ? 'review' : 'reviews'}
            </Text>
          </View>

          {/* Contact Info */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Contact</Text>

            {poi.address && (
              <TouchableOpacity style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="location" size={20} color={theme.colors.accentLight} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue} numberOfLines={2}>
                    {poi.address}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {poi.phone && (
              <TouchableOpacity style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="call" size={20} color={theme.colors.accentLight} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{poi.phone}</Text>
                </View>
              </TouchableOpacity>
            )}

            {poi.website && (
              <TouchableOpacity style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="globe" size={20} color={theme.colors.accentLight} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Website</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>
                    {poi.website}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {poi.hours && (
              <TouchableOpacity style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="time" size={20} color={theme.colors.accentLight} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Hours</Text>
                  <Text style={styles.infoValue}>{poi.hours}</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Description */}
          {poi.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{poi.description}</Text>
            </View>
          )}

          {/* Amenities */}
          {poi.amenities && poi.amenities.length > 0 && (
            <View style={styles.amenitiesSection}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {poi.amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityTag}>
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Reviews */}
          {poi.reviews && poi.reviews.length > 0 && (
            <View style={styles.reviewsSection}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              {poi.reviews.map((review, index) => (
                <View key={index} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View>
                      <Text style={styles.reviewAuthor}>{review.author}</Text>
                      <View style={styles.reviewStars}>
                        {[...Array(5)].map((_, i) => (
                          <Ionicons
                            key={i}
                            name={i < review.rating ? 'star' : 'star-outline'}
                            size={12}
                            color={theme.colors.creamDarker}
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewTime}>{review.time}</Text>
                  </View>
                  <Text style={styles.reviewText} numberOfLines={3}>
                    {review.text}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Similar Places */}
          {poi.similarPlaces && poi.similarPlaces.length > 0 && (
            <View style={styles.similarSection}>
              <Text style={styles.sectionTitle}>Similar Places Nearby</Text>
              {poi.similarPlaces.map(place => (
                <TouchableOpacity key={place.id} style={styles.similarCard}>
                  {place.photoUrl && (
                    <Image
                      source={{ uri: place.photoUrl }}
                      style={styles.similarImage}
                    />
                  )}
                  <View style={styles.similarInfo}>
                    <Text style={styles.similarName}>{place.name}</Text>
                    <View style={styles.similarMeta}>
                      <View style={styles.rating}>
                        <Ionicons name="star" size={12} color={theme.colors.creamDarker} />
                        <Text style={styles.ratingText}>{place.rating}</Text>
                      </View>
                      <Text style={styles.distance}>{place.distance}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* CTA Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleFavoriteToggle}
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorited ? theme.colors.error : theme.colors.accentLight}
            />
            <Text style={styles.secondaryButtonText}>
              {isFavorited ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onGenerateRoute}
          >
            <Ionicons name="navigate" size={20} color={theme.colors.textWhite} />
            <Text style={styles.primaryButtonText}>Generate Route</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.darkPrimary,
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  photoCarouselContainer: {
    height: 280,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: 280,
  },
  photoPlaceholder: {
    height: 280,
    backgroundColor: theme.colors.darkTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoIndicators: {
    position: 'absolute',
    bottom: theme.spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.textPrimary,
    opacity: 0.5,
  },
  indicatorActive: {
    opacity: 1,
    width: 24,
  },
  photoCount: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  photoCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textWhite,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  titleContainer: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.accentLight + '20',
    borderRadius: theme.borderRadius.full,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.accentLight,
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: theme.colors.error + '20',
    borderColor: theme.colors.error,
  },
  ratingSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
    marginHorizontal: theme.spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  reviewCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  infoSection: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  descriptionSection: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  amenitiesSection: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  amenityTag: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.borderRadius.full,
  },
  amenityText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  reviewsSection: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },
  reviewCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  reviewTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  reviewText: {
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
  similarSection: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  similarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: theme.spacing.md,
  },
  similarImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.darkTertiary,
  },
  similarInfo: {
    flex: 1,
  },
  similarName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  similarMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: 4,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  distance: {
    fontSize: 11,
    color: theme.colors.textTertiary,
  },
  bottomSpacer: {
    height: theme.spacing.md,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.darkPrimary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.accentLight,
    borderRadius: theme.borderRadius.lg,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textWhite,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: theme.borderRadius.lg,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});
