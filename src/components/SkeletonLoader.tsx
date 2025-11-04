import { theme } from '@/styles/theme';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

/**
 * Shimmer skeleton loader for async content
 * Creates loading placeholders with shimmer effect
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.7, 0.3],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
};

/**
 * POI Card skeleton loader
 * Shows loading state for POI cards
 */
export const POICardSkeleton: React.FC = () => {
  return (
    <View style={styles.poiCardSkeleton}>
      <SkeletonLoader width={90} height={90} borderRadius={12} />
      <View style={styles.poiSkeletonContent}>
        <SkeletonLoader width="80%" height={16} borderRadius={8} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="100%" height={12} borderRadius={6} style={{ marginBottom: 6 }} />
        <SkeletonLoader width="70%" height={12} borderRadius={6} />
      </View>
    </View>
  );
};

/**
 * Screen skeleton - full screen loading state
 * Shows loading skeleton for entire screen
 */
export const ScreenSkeleton: React.FC = () => {
  return (
    <View style={styles.screenSkeleton}>
      {/* Header */}
      <View style={styles.headerSkeleton}>
        <View style={styles.headerContent}>
          <SkeletonLoader width="60%" height={28} borderRadius={8} style={{ marginBottom: 8 }} />
          <SkeletonLoader width="80%" height={14} borderRadius={6} />
        </View>
        <SkeletonLoader width={44} height={44} borderRadius={22} />
      </View>

      {/* Grid skeleton */}
      <View style={styles.gridSkeleton}>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={styles.gridItem}>
            <SkeletonLoader width={54} height={54} borderRadius={27} />
            <SkeletonLoader width="80%" height={14} borderRadius={6} style={{ marginTop: 8 }} />
          </View>
        ))}
      </View>

      {/* List skeleton */}
      <View style={styles.listSkeleton}>
        {[1, 2, 3].map(i => (
          <POICardSkeleton key={i} />
        ))}
      </View>
    </View>
  );
};

/**
 * Bottom sheet skeleton
 * Shows loading state for bottom sheet content
 */
export const BottomSheetSkeleton: React.FC = () => {
  return (
    <View style={styles.bottomSheetSkeleton}>
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} style={styles.bottomSheetItem}>
          <SkeletonLoader width={60} height={60} borderRadius={8} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <SkeletonLoader width="70%" height={16} borderRadius={6} style={{ marginBottom: 6 }} />
            <SkeletonLoader width="90%" height={12} borderRadius={6} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.darkTertiary,
  },
  poiCardSkeleton: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  poiSkeletonContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  screenSkeleton: {
    flex: 1,
    backgroundColor: theme.colors.darkPrimary,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  headerSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  headerContent: {
    flex: 1,
  },
  gridSkeleton: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  gridItem: {
    flex: 1,
    minWidth: '48%',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  listSkeleton: {
    gap: theme.spacing.md,
  },
  bottomSheetItem: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
    alignItems: 'center',
  },
  bottomSheetSkeleton: {
    paddingVertical: theme.spacing.md,
  },
});
