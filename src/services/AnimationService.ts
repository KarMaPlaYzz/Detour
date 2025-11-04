import { Animated, Dimensions, Easing } from 'react-native';

/**
 * Animation System for Detour App
 * Provides reusable animation utilities for consistent, polished interactions
 */

// ============================================================================
// ANIMATION CONFIGURATIONS
// ============================================================================

export const ANIMATION_TIMING = {
  QUICK: 150,      // Micro-interactions (taps, selections)
  STANDARD: 250,   // Standard transitions (fade, slide)
  DURATION: 300,   // Standard duration (cards, modals)
  LONG: 400,       // Extended animations (location swap, bounces)
  EXTENDED: 600,   // Long animations (complex sequences)
} as const;

export const EASING_CURVES = {
  IN_OUT: Easing.inOut(Easing.cubic),
  OUT: Easing.out(Easing.cubic),
  IN: Easing.in(Easing.cubic),
  EASE: Easing.ease,
  BACK_OUT: Easing.out(Easing.back(1.2)),
  SPRING: Easing.elastic(0.8),
  BOUNCE: Easing.bounce,
  SINE_OUT: Easing.out(Easing.sin),
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a spring animation for bouncy, natural motion
 * Perfect for: Pin bounces, card entries, button responses
 */
export const createSpringAnimation = (
  animatedValue: Animated.Value,
  targetValue: number = 1,
  options = {}
): Animated.CompositeAnimation => {
  return Animated.spring(animatedValue, {
    toValue: targetValue,
    useNativeDriver: true,
    tension: 70,
    friction: 10,
    ...options,
  });
};

/**
 * Creates a timing-based animation with configurable easing
 * Perfect for: Linear slides, fades, color transitions
 */
export const createTimingAnimation = (
  animatedValue: Animated.Value,
  targetValue: number = 1,
  duration: number = ANIMATION_TIMING.STANDARD,
  easing = EASING_CURVES.IN_OUT
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: targetValue,
    duration,
    easing,
    useNativeDriver: true,
  });
};

/**
 * Creates a sequence of animations that play one after another
 * Perfect for: Complex entrance animations, choreographed interactions
 */
export const createSequenceAnimation = (
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation => {
  return Animated.sequence(animations);
};

/**
 * Creates parallel animations that play simultaneously
 * Perfect for: Scale + fade, multiple element animations
 */
export const createParallelAnimation = (
  animations: { [key: string]: Animated.CompositeAnimation }
): Animated.CompositeAnimation => {
  return Animated.parallel(Object.values(animations));
};

// ============================================================================
// PREDEFINED ANIMATION SEQUENCES
// ============================================================================

/**
 * FADE IN: Smooth appearance from 0 to full opacity
 * Use: Page transitions, card appearances, modal entries
 */
export const createFadeInAnimation = (
  animatedValue: Animated.Value,
  duration = ANIMATION_TIMING.STANDARD
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    easing: EASING_CURVES.OUT,
    useNativeDriver: true,
  });
};

/**
 * FADE OUT: Smooth disappearance to 0 opacity
 * Use: Page transitions, card dismissals, modal exits
 */
export const createFadeOutAnimation = (
  animatedValue: Animated.Value,
  duration = ANIMATION_TIMING.STANDARD
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: EASING_CURVES.IN,
    useNativeDriver: true,
  });
};

/**
 * SCALE PULSE: Quick scale up then down for emphasis
 * Use: Button taps, selection confirmations, emphasis
 */
export const createScalePulseAnimation = (
  animatedValue: Animated.Value
): Animated.CompositeAnimation => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 1.1,
      duration: ANIMATION_TIMING.QUICK,
      easing: EASING_CURVES.OUT,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: ANIMATION_TIMING.QUICK,
      easing: EASING_CURVES.IN,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * SLIDE IN FROM LEFT: Card/content enters from left edge
 * Use: Page transitions, floating panels
 */
export const createSlideInLeftAnimation = (
  animatedValue: Animated.Value,
  duration = ANIMATION_TIMING.DURATION
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: EASING_CURVES.OUT,
    useNativeDriver: true,
  });
};

/**
 * SLIDE IN FROM RIGHT: Card/content enters from right edge
 * Use: Modal overlays, right-aligned panels
 */
export const createSlideInRightAnimation = (
  animatedValue: Animated.Value,
  duration = ANIMATION_TIMING.DURATION
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: EASING_CURVES.OUT,
    useNativeDriver: true,
  });
};

/**
 * SLIDE IN FROM BOTTOM: Bottom sheet or overlay entry
 * Use: Bottom sheets, floating action buttons, notification toasts
 */
export const createSlideInBottomAnimation = (
  animatedValue: Animated.Value,
  duration = ANIMATION_TIMING.DURATION
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: EASING_CURVES.OUT,
    useNativeDriver: true,
  });
};

/**
 * BOUNCE: Spring animation with overshoot effect
 * Use: POI pin appearances, card entries, highlight effects
 */
export const createBounceAnimation = (
  animatedValue: Animated.Value,
  targetValue: number = 1
): Animated.CompositeAnimation => {
  return createSpringAnimation(animatedValue, targetValue, {
    tension: 60,
    friction: 8,
  });
};

/**
 * LOCATION SWAP FLIP: Rotate and swap animation
 * Use: Swapping start/end locations
 */
export const createLocationSwapAnimation = (
  animatedValue: Animated.Value
): Animated.CompositeAnimation => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 0.5,
      duration: ANIMATION_TIMING.LONG / 2,
      easing: EASING_CURVES.OUT,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: ANIMATION_TIMING.LONG / 2,
      easing: EASING_CURVES.IN,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * INTEREST BUTTON SELECTION: Scale + color fade effect
 * Use: Circular interest button taps
 */
export const createInterestSelectAnimation = (
  scaleValue: Animated.Value,
  opacityValue: Animated.Value
): Animated.CompositeAnimation => {
  return Animated.parallel([
    Animated.timing(scaleValue, {
      toValue: 1.15,
      duration: ANIMATION_TIMING.QUICK,
      easing: EASING_CURVES.BACK_OUT,
      useNativeDriver: true,
    }),
    Animated.timing(opacityValue, {
      toValue: 1,
      duration: ANIMATION_TIMING.QUICK,
      easing: EASING_CURVES.OUT,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * POI CARD ENTRY: Fade + slide up combination
 * Use: POI card appearances at bottom sheet
 */
export const createPOICardEntryAnimation = (
  fadeValue: Animated.Value,
  translateYValue: Animated.Value
): Animated.CompositeAnimation => {
  return Animated.parallel([
    createFadeInAnimation(fadeValue, ANIMATION_TIMING.DURATION as any),
    Animated.timing(translateYValue, {
      toValue: 0,
      duration: ANIMATION_TIMING.DURATION,
      easing: EASING_CURVES.OUT,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * HEADER TITLE FADE: Fade in header title on scroll
 * Use: Dynamic header opacity based on scroll position
 */
export const createHeaderTitleAnimation = (
  animatedValue: Animated.Value,
  scrollY: Animated.Value,
  threshold: number = 50
): void => {
  Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false,
    listener: () => {
      // This is handled through interpolation, not direct animation
    },
  });
};

// ============================================================================
// INTERPOLATION UTILITIES
// ============================================================================

/**
 * Creates color interpolation (common for theme transitions)
 */
export const createColorInterpolation = (
  animatedValue: Animated.Value,
  colors: { start: string; end: string },
  range: number[] = [0, 1]
) => {
  return animatedValue.interpolate({
    inputRange: range,
    outputRange: [colors.start, colors.end],
  });
};

/**
 * Creates position interpolation (for slide animations)
 */
export const createPositionInterpolation = (
  animatedValue: Animated.Value,
  distance: number,
  range: number[] = [0, 1]
) => {
  return animatedValue.interpolate({
    inputRange: range,
    outputRange: [distance, 0],
  });
};

/**
 * Creates scale interpolation (for zoom animations)
 */
export const createScaleInterpolation = (
  animatedValue: Animated.Value,
  minScale: number,
  maxScale: number,
  range: number[] = [0, 1]
) => {
  return animatedValue.interpolate({
    inputRange: range,
    outputRange: [minScale, maxScale],
  });
};

// ============================================================================
// STAGGER ANIMATION HELPER
// ============================================================================

/**
 * Creates staggered animations for lists (each item with delay)
 * Perfect for: List entries, multi-element animations
 */
export const createStaggerAnimation = (
  animationCreator: (index: number) => Animated.CompositeAnimation,
  itemCount: number,
  staggerDelay: number = 50
): Animated.CompositeAnimation => {
  const animations: Animated.CompositeAnimation[] = [];
  let currentDelay = 0;

  for (let i = 0; i < itemCount; i++) {
    currentDelay += staggerDelay;
    animations.push(
      Animated.sequence([
        Animated.delay(currentDelay),
        animationCreator(i),
      ])
    );
  }

  return Animated.parallel(animations);
};

/**
 * Creates a loop animation (for loading states, continuous effects)
 */
export const createLoopAnimation = (
  animatedValue: Animated.Value,
  duration: number = 1000,
  easing = EASING_CURVES.IN_OUT
): void => {
  Animated.loop(
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      easing,
      useNativeDriver: true,
    })
  ).start();
};

// ============================================================================
// CONSTANTS FOR SCREEN DIMENSIONS
// ============================================================================

export const SCREEN = {
  WIDTH: Dimensions.get('window').width,
  HEIGHT: Dimensions.get('window').height,
} as const;

// ============================================================================
// PRESET ANIMATION VALUES
// ============================================================================

export const createAnimationValues = {
  opacity: () => new Animated.Value(0),
  scale: () => new Animated.Value(0.8),
  translateX: () => new Animated.Value(SCREEN.WIDTH),
  translateY: () => new Animated.Value(SCREEN.HEIGHT),
  rotation: () => new Animated.Value(0),
} as const;
