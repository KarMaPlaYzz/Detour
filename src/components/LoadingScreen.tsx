import { theme } from '@/styles/theme';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';

interface LoadingScreenProps {
  visible: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ visible }) => {
  const [stage, setStage] = useState(0);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const stages = [
    '🗺️ Plotting your route...',
    '🔍 Discovering points of interest...',
    '✨ Crafting your detour...',
    '🎉 Almost ready!',
  ];

  useEffect(() => {
    if (!visible) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      return;
    }

    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Cycle through stages
    const interval = setInterval(() => {
      setStage((prev) => (prev + 1) % stages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim },
      ]}
    >
      <View style={styles.content}>
        {/* Animated spinner */}
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={styles.spinner}
        />

        {/* Loading text with stage indicator */}
        <Text style={styles.stageText}>{stages[stage]}</Text>

        {/* Progress dots */}
        <View style={styles.dotsContainer}>
          {stages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === stage
                      ? theme.colors.primary
                      : index < stage
                      ? theme.colors.success
                      : theme.colors.textTertiary,
                },
              ]}
            />
          ))}
        </View>

        {/* Motivational text */}
        <Text style={styles.motivationText}>
          Finding the perfect adventure for you...
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    width: '80%',
  },
  spinner: {
    marginBottom: theme.spacing.xl,
  },
  stageText: {
    ...theme.typography.h2,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
    minHeight: 30,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  motivationText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
