import { HapticService } from '@/services/HapticService';
import { theme } from '@/styles/theme';
import BlurView from 'expo-blur/build/BlurView';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '../../components/ui/icon-symbol';

interface FloatingNavigationProps {
  bottomOffset?: number;
  dynamicActions?: Array<{
    id: string;
    icon: string;
    onPress: () => void;
    color?: string;
    bgColor?: string;
  }>;
}

interface CoreButton {
  id: string;
  selectedIcon: string;
  unselectedIcon: string;
  route: string;
  label: string;
}

export const FloatingNavigation: React.FC<FloatingNavigationProps> = ({
  bottomOffset = 36,
  dynamicActions = [],
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const heightAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const [displayedActions, setDisplayedActions] = React.useState(dynamicActions);
  const prevLengthRef = React.useRef(dynamicActions.length);
  const animationCallbackRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    const isClosing = dynamicActions.length === 0 && prevLengthRef.current > 0;
    const animateTo = dynamicActions.length > 0 ? 1 : 0;
    
    // Always update displayed actions with new actions
    setDisplayedActions(dynamicActions);
    
    // Cancel previous callback if it exists
    if (animationCallbackRef.current) {
      animationCallbackRef.current = null;
    }
    
    // Create new callback for this animation
    const onAnimationComplete = () => {
      // Only clear if we were closing and animation is done
      if (isClosing) {
        setDisplayedActions([]);
      }
    };
    
    animationCallbackRef.current = onAnimationComplete;
    
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: animateTo,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: animateTo,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start(() => {
      if (animationCallbackRef.current === onAnimationComplete) {
        onAnimationComplete();
      }
    });
    
    prevLengthRef.current = dynamicActions.length;
  }, [dynamicActions.length]);

  const isExplore = !pathname.includes('my-detours') && !pathname.includes('favorites') && !pathname.includes('settings') && !pathname.includes('home');
  const isMyDetours = pathname.includes('my-detours');
  const isFavorites = pathname.includes('favorites');
  const isHome = pathname.includes('home');
  const isSettings = pathname.includes('settings');

  const coreButtons: CoreButton[] = [
    {
      id: 'home',
      selectedIcon: 'house.fill',
      unselectedIcon: 'house',
      route: '/(tabs)/home',
      label: 'Home',
    },
    {
      id: 'favorites',
      selectedIcon: 'heart.fill',
      unselectedIcon: 'heart',
      route: '/(tabs)/favorites',
      label: 'Favorites',
    },
    {
      id: 'explore',
      selectedIcon: 'map.fill',
      unselectedIcon: 'map',
      route: '/(tabs)',
      label: 'Explore',
    },
    {
      id: 'my-detours',
      selectedIcon: 'mappin.and.ellipse',
      unselectedIcon: 'mappin',
      route: '/(tabs)/my-detours',
      label: 'Detours',
    },
    {
      id: 'settings',
      selectedIcon: 'gearshape.fill',
      unselectedIcon: 'gearshape',
      route: '/(tabs)/settings',
      label: 'Settings',
    },
  ];

  return (
    <BlurView intensity={45} tint="dark" style={[styles.blurContainer, { bottom: bottomOffset }]}>
      <View style={styles.contentContainer}>
        {/* Dynamic Actions Section */}
        <Animated.View
          style={[
            styles.dynamicSection,
            {
              width: heightAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, displayedActions.length > 0 ? displayedActions.length * 56 + Math.max(0, displayedActions.length - 1) * 28 : 0],
              }),
              opacity: opacityAnim,
            },
          ]}
        >
          {displayedActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[
                styles.fab,
                {
                  backgroundColor: action.bgColor || theme.colors.accentLight,
                },
              ]}
              onPress={async () => {
                await HapticService.mediumImpact();
                action.onPress();
              }}
              activeOpacity={0.7}
            >
              <IconSymbol
                name={action.icon as any}
                size={28}
                color={action.color || theme.colors.accent}
              />
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Divider when dynamic actions exist */}
        {displayedActions.length > 0 && (
          <View style={styles.divider} />
        )}

        {/* Core Navigation (always visible) */}
        <View style={styles.coreSection}>
          {coreButtons.map((button) => {
            const isSelected =
              (button.id === 'explore' && isExplore) ||
              (button.id === 'my-detours' && isMyDetours) ||
              (button.id === 'favorites' && isFavorites) ||
              (button.id === 'home' && isHome) ||
              (button.id === 'settings' && isSettings);

            return (
              <TouchableOpacity
                key={button.id}
                style={[styles.fab, isSelected && styles.fabActive]}
                onPress={async () => {
                  await HapticService.mediumImpact();
                  router.push(button.route as any);
                }}
                activeOpacity={0.7}
              >
                <IconSymbol
                  size={28}
                  name={
                    (isSelected
                      ? button.selectedIcon
                      : button.unselectedIcon) as any
                  }
                  color={
                    isSelected
                      ? theme.colors.accent
                      : theme.colors.textSecondary
                  }
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    left: 16,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.textTertiary,
    ...theme.shadows.lg,
  },
  contentContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  container: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    left: 16,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.lg,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  dynamicSection: {
    overflow: 'hidden',
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.cardBorder,
    marginHorizontal: 4,
  },
  coreSection: {
    gap: 4,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-around',
  },
  fab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.full,
    minWidth: 48,
    minHeight: 48,
  },
  fabActive: {
    backgroundColor: theme.colors.accentLight,
  },
});
