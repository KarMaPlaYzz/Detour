import { theme } from '@/styles/theme';
import { POI } from '@/types/detour';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheetModal, { BottomSheetFlatList, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface POIBottomSheetProps {
  poi_list: POI[];
  isVisible: boolean;
  onSelectPOI: (poi: POI) => void;
  onClose: () => void;
  isLoading?: boolean;
  selectedPOI?: POI | null;
  onContinueWalking?: (poi: POI) => void;
  detourRoute?: any;
}

const POIBottomSheetComponent = React.forwardRef<
  BottomSheetModal,
  POIBottomSheetProps
>(({ poi_list, isVisible, onSelectPOI, onClose, isLoading, selectedPOI, onContinueWalking, detourRoute }, ref: React.ForwardedRef<BottomSheetModal>) => {
  const snapPoints = useMemo(() => ['25%', '50%', '95%'], []);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [currentDetailPOI, setCurrentDetailPOI] = useState<POI | null>(null);

  React.useEffect(() => {
    console.log('[POIBottomSheet] Mounted with snapPoints:', snapPoints);
  }, []);

  // Handle visibility changes
  useEffect(() => {
    console.log('[POIBottomSheet] Visibility changed:', { isVisible, poiCount: poi_list.length, refType: typeof ref });
    if (!isVisible) {
      console.log('[POIBottomSheet] Closing sheet...');
      if (typeof ref !== 'function' && ref?.current) {
        try {
          ref.current?.close?.();
        } catch (e) {
          console.error('[POIBottomSheet] Error calling close:', e);
        }
      }
      return;
    }

    if (isVisible && poi_list.length > 0) {
      // Add small delay to ensure ref is ready
      const timer = setTimeout(() => {
        if (typeof ref !== 'function' && ref?.current) {
          console.log('[POIBottomSheet] Attempting to expand sheet. ref.current:', !!ref.current);
          try {
            ref.current?.expand?.();
            console.log('[POIBottomSheet] Expand called successfully');
          } catch (e) {
            console.error('[POIBottomSheet] Error calling expand:', e);
          }
        }
        setViewMode('list');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible, ref, poi_list.length]);

  // Format hours nicely
  const getTodayHours = (weekdayText?: string[]): string | null => {
    if (!weekdayText || weekdayText.length === 0) return null;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const todayName = days[today.getDay()];
    
    const todayEntry = weekdayText.find(text => text.startsWith(todayName));
    if (!todayEntry) return null;
    
    const timePart = todayEntry.split(': ')[1];
    return timePart || null;
  };

  // Calculate distance to POI from route
  const calculateDistanceToPOI = (poi: POI): number => {
    if (!detourRoute?.coordinates || detourRoute.coordinates.length === 0) return 0;
    
    // Find closest point on route to POI
    let minDistance = Infinity;
    for (const coord of detourRoute.coordinates) {
      const distance = Math.sqrt(
        Math.pow(coord.latitude - poi.location.latitude, 2) +
        Math.pow(coord.longitude - poi.location.longitude, 2)
      ) * 111000; // Convert to meters (approximate)
      minDistance = Math.min(minDistance, distance);
    }
    
    return minDistance;
  };

  const renderDetailView = (poi: POI) => {
    const todayHours = getTodayHours(poi.openingHours?.weekdayText || poi.opening_hours?.weekdayText);
    const isOpen = poi.business_status === 'OPERATIONAL';
    const photos = poi.photos || (poi.photoUrl ? [{ photo_reference: poi.photoUrl }] : []);
    const distanceToRoute = calculateDistanceToPOI(poi);
    
    return (
      <ScrollView style={styles.detailContainer} showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <Pressable
          style={styles.backButton}
          onPress={() => {
            setViewMode('list');
            setCurrentDetailPOI(null);
          }}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={theme.colors.textPrimary} />
          <Text style={styles.backButtonText}>Back to List</Text>
        </Pressable>

        {/* Photo Gallery */}
        <View style={styles.photoGalleryContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            style={styles.photoScroll}
          >
            {photos.length > 0 ? (
              photos.map((photo: any, idx: number) => (
                <Image
                  key={idx}
                  source={{ uri: photo.photo_reference || poi.photoUrl }}
                  style={styles.heroImage}
                />
              ))
            ) : (
              <View style={[styles.heroImage, styles.placeholderHero]}>
                <MaterialCommunityIcons name="image-off" size={48} color={theme.colors.textTertiary} />
              </View>
            )}
          </ScrollView>
          
          {/* Photo Counter */}
          {photos.length > 0 && (
            <View style={styles.photoCounter}>
              <Text style={styles.photoCountText}>{photos.length} photos</Text>
            </View>
          )}
        </View>

        {/* POI Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.detailName}>{poi.name}</Text>
          
          {/* Quick Stats Row */}
          <View style={styles.quickStatsContainer}>
            {/* Rating */}
            <View style={styles.statBadge}>
              <MaterialCommunityIcons name="star" size={14} color={theme.colors.creamDarker} />
              <Text style={styles.statText}>
                {poi.rating?.toFixed(1) || 'N/A'}
              </Text>
              <Text style={styles.statSubtext}>
                ({poi.user_ratings_total || 0})
              </Text>
            </View>

            {/* Distance to Route */}
            {detourRoute && (
              <View style={styles.statBadge}>
                <MaterialCommunityIcons name="road" size={14} color={theme.colors.accent} />
                <Text style={styles.statText}>
                  {distanceToRoute < 1000 
                    ? `${Math.round(distanceToRoute)}m` 
                    : `${(distanceToRoute / 1000).toFixed(1)}km`}
                </Text>
                <Text style={styles.statSubtext}>from route</Text>
              </View>
            )}

            {/* Status */}
            <View style={[styles.statBadge, { borderColor: isOpen ? theme.colors.success : theme.colors.error }]}>
              <View style={[styles.statusDot, { backgroundColor: isOpen ? theme.colors.success : theme.colors.error }]} />
              <Text style={styles.statText}>
                {isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
          </View>

          {/* Hours */}
          {todayHours && (
            <View style={styles.hoursContainer}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.hoursText}>{todayHours}</Text>
            </View>
          )}

          {/* Address */}
          {poi.formattedAddress && (
            <View style={styles.addressContainer}>
              <MaterialCommunityIcons name="map-marker" size={16} color={theme.colors.accent} />
              <Text style={styles.addressText}>{poi.formattedAddress}</Text>
            </View>
          )}

          {/* Top Review */}
          {poi.reviews && poi.reviews.length > 0 && (
            <View style={styles.reviewContainer}>
              <View style={styles.reviewHeader}>
                <MaterialCommunityIcons name="format-quote-open" size={14} color={theme.colors.accentLight} />
                <Text style={styles.reviewLabel}>Top Review</Text>
              </View>
              <Text style={styles.reviewText} numberOfLines={3}>
                "{poi.reviews[0].text}"
              </Text>
              <Text style={styles.reviewAuthor}>— {poi.reviews[0].author_name}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            {/* Call Button */}
            {poi.formatted_phone_number && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  const phoneNumber = poi.formatted_phone_number.replace(/\s/g, '');
                  Linking.openURL(`tel:${phoneNumber}`).catch(() => {
                    Alert.alert('Error', 'Could not open phone');
                  });
                }}
              >
                <MaterialCommunityIcons name="phone" size={18} color={theme.colors.accentCream} />
                <Text style={styles.actionButtonText}>Call</Text>
              </TouchableOpacity>
            )}

            {/* Website Button */}
            {poi.website && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  Linking.openURL(poi.website).catch(() => {
                    Alert.alert('Error', 'Could not open website');
                  });
                }}
              >
                <MaterialCommunityIcons name="web" size={18} color={theme.colors.accentCream} />
                <Text style={styles.actionButtonText}>Website</Text>
              </TouchableOpacity>
            )}

            {/* Directions Button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                const location = poi.location;
                const url = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
                Linking.openURL(url).catch(() => {
                  Alert.alert('Error', 'Could not open directions');
                });
              }}
            >
              <MaterialCommunityIcons name="directions" size={18} color={theme.colors.accentCream} />
              <Text style={styles.actionButtonText}>Directions</Text>
            </TouchableOpacity>
          </View>

          {/* Main Action Buttons */}
          <View style={styles.mainActionsContainer}>
            {/* Add to Route */}
            <TouchableOpacity
              style={[styles.mainButton, styles.addButton]}
              onPress={() => onSelectPOI(poi)}
            >
              <MaterialCommunityIcons name="plus-circle" size={20} color={theme.colors.textWhite} />
              <Text style={styles.mainButtonText}>Add to Route</Text>
            </TouchableOpacity>

            {/* Continue Walking */}
            {onContinueWalking && (
              <TouchableOpacity
                style={[styles.mainButton, styles.continueButton]}
                onPress={() => {
                  onContinueWalking(poi);
                  setViewMode('list');
                  setCurrentDetailPOI(null);
                }}
              >
                <MaterialCommunityIcons name="walk" size={20} color={theme.colors.accent} />
                <Text style={[styles.mainButtonText, { color: theme.colors.accent }]}>Continue Walking</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderPOIItem = ({ item, index }: { item: POI; index: number }) => {
    const isSelected = selectedPOI?.name === item.name;

    return (
      <TouchableOpacity
        style={[
          styles.poiCard,
          isSelected && styles.poiCardSelected,
        ]}
        onPress={() => {
          setCurrentDetailPOI(item);
          setViewMode('detail');
        }}
        activeOpacity={0.7}
      >
        {/* Rank Badge */}
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{index + 1}</Text>
        </View>

        {/* POI Image */}
        {item.photoUrl ? (
          <Image
            source={{ uri: item.photoUrl }}
            style={styles.poiImage}
          />
        ) : (
          <View style={[styles.poiImage, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={40} color={theme.colors.textTertiary} />
          </View>
        )}

        {/* POI Info */}
        <View style={styles.poiInfo}>
          <Text style={styles.poiName} numberOfLines={1}>
            {item.name}
          </Text>

          {/* Quick Badges */}
          <View style={styles.badgesRow}>
            {/* Rating Badge */}
            <View style={styles.badge}>
              <MaterialCommunityIcons name="star" size={11} color={theme.colors.creamDarker} />
              <Text style={styles.badgeText}>{item.rating?.toFixed(1) || 'N/A'}</Text>
            </View>

            {/* Hours Badge */}
            {item.business_status && (
              <View style={[
                styles.badge,
                { backgroundColor: item.business_status === 'OPERATIONAL' ? 'rgba(0, 200, 83, 0.15)' : 'rgba(255, 107, 107, 0.15)' }
              ]}>
                <View style={[
                  styles.statusDotSmall,
                  { backgroundColor: item.business_status === 'OPERATIONAL' ? theme.colors.success : theme.colors.error }
                ]} />
                <Text style={styles.badgeText}>
                  {item.business_status === 'OPERATIONAL' ? 'Open' : 'Closed'}
                </Text>
              </View>
            )}

            {/* Distance Badge */}
            {detourRoute && (
              <View style={styles.badge}>
                <MaterialCommunityIcons name="road" size={11} color={theme.colors.accent} />
                <Text style={styles.badgeText}>
                  {calculateDistanceToPOI(item) < 1000
                    ? `${Math.round(calculateDistanceToPOI(item))}m`
                    : `${(calculateDistanceToPOI(item) / 1000).toFixed(1)}km`}
                </Text>
              </View>
            )}
          </View>

          {/* Distance or Description */}
          {item.formattedAddress && (
            <Text style={styles.poiAddress} numberOfLines={1}>
              {item.formattedAddress}
            </Text>
          )}
        </View>

        {/* Selection Indicator */}
        {isSelected && (
          <View style={styles.selectionIndicator}>
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.accentCream} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Handle bottom sheet dismiss
  const handleBottomSheetChange = (index: number) => {
    console.log('[POIBottomSheet] Position changed to index:', index);
    if (index === -1) {
      console.log('[POIBottomSheet] Sheet dismissed');
      onClose();
    }
  };

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      onChange={handleBottomSheetChange}
      animateOnMount={true}
      animationConfigs={{
        duration: 300,
      }}
    >
      <BottomSheetView style={{ flex: 1 }}>
        {viewMode === 'detail' && currentDetailPOI ? (
          renderDetailView(currentDetailPOI)
        ) : poi_list.length > 0 ? (
          <BottomSheetFlatList
            data={poi_list}
            renderItem={renderPOIItem}
            keyExtractor={(item: POI, index: number) => `${item.name}-${index}`}
            scrollEnabled={true}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={true}
            ListHeaderComponent={
              <View style={styles.header}>
                <Text style={styles.headerTitle}>
                  {poi_list.length} {poi_list.length === 1 ? 'Place' : 'Places'} Found
                </Text>
                <Text style={styles.headerSubtitle}>
                  Tap any place to add it to your route
                </Text>
              </View>
            }
          />
        ) : (
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {poi_list.length} {poi_list.length === 1 ? 'Place' : 'Places'} Found
              </Text>
              <Text style={styles.headerSubtitle}>
                {detourRoute?.coordinates && detourRoute.coordinates.length > 0 ? 
                  'Try a different category or search area' : 
                  'Search for a walking route to discover places'
                }
              </Text>
            </View>
            <View style={styles.emptyState}>
              {detourRoute?.coordinates && detourRoute.coordinates.length > 0 ? (
                <>
                  <Ionicons name="search-outline" size={48} color={theme.colors.textTertiary} />
                  <Text style={styles.emptyStateText}>No places found</Text>
                  <Text style={styles.emptyStateSubtext}>Try a different interest category or expand your search area</Text>
                </>
              ) : (
                <>
                  <Ionicons name="map-outline" size={48} color={theme.colors.textTertiary} />
                  <Text style={styles.emptyStateText}>Route needed</Text>
                  <Text style={styles.emptyStateSubtext}>Search for a walking route first, then explore interesting places along the way</Text>
                </>
              )}
            </View>
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

POIBottomSheetComponent.displayName = 'POIBottomSheet';

export default POIBottomSheetComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  bottomSheetBackground: {
    backgroundColor: theme.colors.darkSecondary,
  },
  handleIndicator: {
    backgroundColor: theme.colors.cardBorderLight,
    width: 48,
    height: 4,
  },
  header: {
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  listContent: {
    paddingVertical: theme.spacing.md,
  },
  
  // List Item Styles
  poiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: theme.spacing.md,
  },
  poiCardSelected: {
    borderColor: theme.colors.accentCream,
    backgroundColor: theme.colors.darkLight,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textWhite,
  },
  poiImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.darkTertiary,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  poiInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  poiName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: `${theme.colors.accentLight}20`,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  statusDotSmall: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  poiAddress: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  selectionIndicator: {
    position: 'absolute',
    right: theme.spacing.md,
    top: '50%',
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.cardBorder,
    marginVertical: theme.spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },

  // Detail View Styles
  detailContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    marginLeft: -theme.spacing.sm,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  photoGalleryContainer: {
    marginBottom: theme.spacing.lg,
  },
  photoScroll: {
    height: 220,
  },
  heroImage: {
    width: 280,
    height: 220,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.darkTertiary,
    marginRight: theme.spacing.md,
  },
  placeholderHero: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoCounter: {
    position: 'absolute',
    bottom: theme.spacing.md,
    right: theme.spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  photoCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textWhite,
  },
  infoSection: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  detailName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  statSubtext: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
  },
  hoursText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  addressContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  addressText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  reviewContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accentLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  reviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  reviewText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  reviewAuthor: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.darkLight,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.accentCream,
  },
  mainActionsContainer: {
    gap: theme.spacing.sm,
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  addButton: {
    backgroundColor: theme.colors.accent,
  },
  continueButton: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  mainButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textWhite,
  },
});
