import { FloatingNavigation } from '@/components/FloatingNavigation';
import {
  ANIMATION_TIMING,
  createFadeInAnimation,
  createSlideInBottomAnimation,
} from '@/services/AnimationService';
import { HapticService } from '@/services/HapticService';
import { theme } from '@/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface RecentDetour {
  id: string;
  name: string;
  startLocation: string;
  endLocation: string;
  distance: string;
  duration: string;
  timestamp: Date;
  imageUrl?: string;
}

interface QuickAction {
  id: string;
  title: string;
  icon: any;
  color: string;
  action: () => void;
}

export default function HomeScreen() {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(400));
  const [recentDetours, setRecentDetours] = useState<RecentDetour[]>([
    {
      id: '1',
      name: 'Golden Gate Bridge Route',
      startLocation: 'Market Street',
      endLocation: 'Marin Headlands',
      distance: '12.4 km',
      duration: '1h 32m',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: '2',
      name: 'Mission District Vibes',
      startLocation: 'BART Station',
      endLocation: 'Dolores Park',
      distance: '8.7 km',
      duration: '1h 15m',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      id: '3',
      name: 'Haight-Ashbury Explorer',
      startLocation: 'Golden Gate Park',
      endLocation: 'Haight & Fillmore',
      distance: '5.2 km',
      duration: '45m',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    },
  ]);

  useEffect(() => {
    // Animate in on mount
    Animated.parallel([
      createFadeInAnimation(fadeAnim, ANIMATION_TIMING.STANDARD),
      createSlideInBottomAnimation(slideAnim, ANIMATION_TIMING.DURATION),
    ]).start();
  }, []);

  const quickActions: QuickAction[] = [
    {
      id: 'explore',
      title: 'Explore Now',
      icon: 'compass',
      color: theme.colors.accentLight,
      action: async () => {
        await HapticService.mediumImpact();
        router.push('/(tabs)');
      },
    },
    {
      id: 'saved',
      title: 'Saved Places',
      icon: 'heart',
      color: theme.colors.creamDarker,
      action: async () => {
        await HapticService.mediumImpact();
        router.navigate('/(tabs)/favorites' as any);
      },
    },
    {
      id: 'detours',
      title: 'My Routes',
      icon: 'map',
      color: theme.colors.accentLight,
      action: async () => {
        await HapticService.mediumImpact();
        router.navigate('/(tabs)/my-detours' as any);
      },
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings',
      color: theme.colors.textSecondary,
      action: async () => {
        await HapticService.mediumImpact();
        router.navigate('/(tabs)/settings' as any);
      },
    },
  ];

  const handleResumeDetour = async (detour: RecentDetour) => {
    // Navigate to explorer with selected detour
    await HapticService.success();
    router.push({
      pathname: '/(tabs)',
      params: {
        resumeDetour: detour.id,
        startLocation: detour.startLocation,
        endLocation: detour.endLocation,
      },
    });
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View>
            <Text style={styles.greeting}>Welcome back! 👋</Text>
            <Text style={styles.subtitle}>Ready to discover your next detour?</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={async () => {
              await HapticService.mediumImpact();
              router.navigate('/(tabs)/settings' as any);
            }}
          >
            <Ionicons name="person-circle" size={36} color={theme.colors.accentLight} />
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Actions Grid */}
        <Animated.View style={[styles.quickActionsContainer, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map(action => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={action.action}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: action.color + '20' }]}>
                  <Ionicons
                    name={action.icon as any}
                    size={24}
                    color={action.color}
                  />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Recent Detours */}
        <Animated.View
          style={[
            styles.recentDetourContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent Detours</Text>
            {recentDetours.length > 0 && (
              <TouchableOpacity onPress={async () => {
                await HapticService.mediumImpact();
                router.push('/(tabs)/my-detours');
              }}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentDetours.length > 0 ? (
            <View style={styles.detoursList}>
              {recentDetours.map(detour => (
                <TouchableOpacity
                  key={detour.id}
                  style={styles.detourCard}
                  onPress={() => handleResumeDetour(detour)}
                  activeOpacity={0.7}
                >
                  {/* Detour Image */}
                  {detour.imageUrl ? (
                    <Image
                      source={{ uri: detour.imageUrl }}
                      style={styles.detourImage}
                    />
                  ) : (
                    <View style={styles.detourImagePlaceholder}>
                      <Ionicons name="map" size={40} color={theme.colors.textTertiary} />
                    </View>
                  )}

                  {/* Detour Info */}
                  <View style={styles.detourInfo}>
                    <Text style={styles.detourName} numberOfLines={1}>
                      {detour.name}
                    </Text>

                    <View style={styles.detourLocations}>
                      <View style={styles.locationRow}>
                        <Ionicons
                          name="navigate"
                          size={14}
                          color={theme.colors.accentLight}
                        />
                        <Text style={styles.locationText} numberOfLines={1}>
                          {detour.startLocation}
                        </Text>
                      </View>
                      <View style={styles.arrowDivider}>
                        <Ionicons
                          name="arrow-down"
                          size={12}
                          color={theme.colors.textTertiary}
                        />
                      </View>
                      <View style={styles.locationRow}>
                        <Ionicons
                          name="pin"
                          size={14}
                          color={theme.colors.creamDarker}
                        />
                        <Text style={styles.locationText} numberOfLines={1}>
                          {detour.endLocation}
                        </Text>
                      </View>
                    </View>

                    {/* Duration and Distance */}
                    <View style={styles.detourMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="speedometer"
                          size={12}
                          color={theme.colors.textSecondary}
                        />
                        <Text style={styles.metaText}>{detour.distance}</Text>
                      </View>
                      <View style={styles.metaDivider} />
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="time"
                          size={12}
                          color={theme.colors.textSecondary}
                        />
                        <Text style={styles.metaText}>{detour.duration}</Text>
                      </View>
                      <View style={styles.metaDivider} />
                      <Text style={styles.timeAgoText}>{formatTimeAgo(detour.timestamp)}</Text>
                    </View>
                  </View>

                  {/* Resume Button */}
                  <View style={styles.resumeButton}>
                    <Ionicons name="play" size={16} color={theme.colors.textWhite} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="compass" size={48} color={theme.colors.textTertiary} />
              <Text style={styles.emptyStateText}>No recent detours</Text>
              <Text style={styles.emptyStateSubtext}>Create your first detour to get started</Text>
              <TouchableOpacity
                style={styles.emptyStateCTA}
                onPress={async () => {
                  await HapticService.mediumImpact();
                  router.push('/(tabs)');
                }}
              >
                <Text style={styles.emptyStateCTAText}>Start Exploring</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        {/* Footer Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{recentDetours.length}</Text>
            <Text style={styles.statLabel}>Detours Created</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {recentDetours.reduce((acc, d) => {
                const km = parseFloat(d.distance);
                return acc + km;
              }, 0).toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>Total KM</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Places Saved</Text>
          </View>
        </View>
      </ScrollView>
      <FloatingNavigation bottomOffset={36} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.darkPrimary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  profileButton: {
    padding: theme.spacing.xs,
  },
  quickActionsContainer: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 80,
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  recentDetourContainer: {
    marginTop: theme.spacing.sm,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.accentLight,
  },
  detoursList: {
    gap: theme.spacing.sm,
  },
  detourCard: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    alignItems: 'center',
    gap: theme.spacing.sm,
    minHeight: 70,
  },
  detourImage: {
    width: 70,
    height: 70,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.darkTertiary,
  },
  detourImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.darkTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detourInfo: {
    flex: 1,
    gap: 3,
  },
  detourName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  detourLocations: {
    gap: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrowDivider: {
    alignItems: 'center',
    marginLeft: theme.spacing.xs,
    marginVertical: 2,
  },
  locationText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  detourMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metaDivider: {
    width: 1,
    height: 10,
    backgroundColor: theme.colors.cardBorder,
    marginHorizontal: 3,
  },
  metaText: {
    fontSize: 9,
    color: theme.colors.textSecondary,
  },
  timeAgoText: {
    fontSize: 9,
    color: theme.colors.textTertiary,
    marginLeft: 'auto',
  },
  resumeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  emptyStateCTA: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.accentLight,
    borderRadius: theme.borderRadius.lg,
  },
  emptyStateCTAText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textWhite,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.accentLight,
  },
  statLabel: {
    fontSize: 9,
    color: theme.colors.textSecondary,
    marginTop: 3,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: theme.colors.cardBorder,
  },
});
