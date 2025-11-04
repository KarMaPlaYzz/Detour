import { Animated, Easing } from 'react-native';

/**
 * Screen Transition Manager
 * Handles sophisticated screen and navigation animations for smooth user experience
 */
export class ScreenTransitionManager {
  /**
   * Create fade + slide transition for screen entry
   * @param initialValue Starting animated value (0)
   * @param duration Animation duration in milliseconds
   * @returns Animated value node
   */
  static createFadeSlideIn(
    initialValue: Animated.Value,
    duration: number = 300
  ): Animated.CompositeAnimation {
    return Animated.timing(initialValue, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
  }

  /**
   * Create scale + fade for modal presentation
   */
  static createScaleFadeIn(
    initialValue: Animated.Value,
    duration: number = 250
  ): Animated.CompositeAnimation {
    return Animated.timing(initialValue, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: false,
    });
  }

  /**
   * Create bounce entrance for attention-grabbing elements
   */
  static createBounceIn(
    initialValue: Animated.Value,
    duration: number = 600
  ): Animated.CompositeAnimation {
    return Animated.timing(initialValue, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.elastic(1.2)),
      useNativeDriver: false,
    });
  }

  /**
   * Create staggered animation sequence for list items
   * @param values Array of animated values for each item
   * @param baseDelay Initial delay in ms
   * @param itemDelay Delay between each item in ms
   * @param duration Duration of each animation in ms
   */
  static createStaggerSequence(
    values: Animated.Value[],
    baseDelay: number = 50,
    itemDelay: number = 80,
    duration: number = 400
  ): Promise<void> {
    return new Promise((resolve) => {
      const animations = values.map((value, index) => {
        return Animated.timing(value, {
          toValue: 1,
          delay: baseDelay + index * itemDelay,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        });
      });

      Animated.sequence(animations).start(() => resolve());
    });
  }

  /**
   * Create parallax effect for scrollview
   * Maps scroll position to visual offset
   */
  static createParallaxInterpolation(
    scrollY: Animated.Value,
    inputRange: [number, number],
    outputRange: [number, number]
  ): Animated.AnimatedInterpolation<number> {
    return scrollY.interpolate({
      inputRange,
      outputRange,
      extrapolate: 'clamp',
    });
  }

  /**
   * Create color transition animation
   */
  static createColorAnimation(
    animatedValue: Animated.Value,
    color1: string,
    color2: string
  ): Animated.AnimatedInterpolation<string> {
    return animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [color1, color2],
    });
  }

  /**
   * Create scale animation with spring physics
   */
  static createSpringScale(
    animatedValue: Animated.Value,
    minScale: number = 0.95,
    maxScale: number = 1
  ): Animated.AnimatedInterpolation<number> {
    return animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [minScale, maxScale],
    });
  }

  /**
   * Create rotation animation for loading spinners
   */
  static createContinuousRotation(
    animatedValue: Animated.Value
  ): Animated.AnimatedInterpolation<string> {
    return animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
  }

  /**
   * Create shimmer effect for skeleton loaders
   */
  static createShimmerAnimation(
    animatedValue: Animated.Value
  ): Animated.AnimatedInterpolation<number> {
    return animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
  }

  /**
   * Animate multiple values in parallel
   */
  static createParallel(
    animations: Animated.CompositeAnimation[]
  ): Promise<void> {
    return new Promise((resolve) => {
      Animated.parallel(animations).start(() => resolve());
    });
  }

  /**
   * Create spring animation
   */
  static createSpring(
    animatedValue: Animated.Value,
    toValue: number = 1,
    tension: number = 40,
    friction: number = 7
  ): Animated.CompositeAnimation {
    return Animated.spring(animatedValue, {
      toValue,
      tension,
      friction,
      useNativeDriver: false,
    });
  }

  /**
   * Interpolate between positions for slide animations
   */
  static createSlideInterpolation(
    animatedValue: Animated.Value,
    startPosition: number,
    endPosition: number
  ): Animated.AnimatedInterpolation<number> {
    return animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [startPosition, endPosition],
    });
  }
}
