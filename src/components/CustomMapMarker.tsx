import { theme } from '@/styles/theme';
import React from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';

export interface CustomMarkerConfig {
  type: 'start' | 'end' | 'poi';
  title?: string;
  imageUrl?: string;
}

interface CustomMapMarkerProps {
  config: CustomMarkerConfig;
  isSelected?: boolean;
  animationValue?: Animated.Value;
}

const CustomMapMarker: React.FC<CustomMapMarkerProps> = ({ config, isSelected, animationValue }) => {
  const getMarkerColor = () => {
    switch (config.type) {
      case 'start':
        return theme.colors.poiMarkerStart;
      case 'end':
        return theme.colors.poiMarkerEnd;
      case 'poi':
        return theme.colors.poiMarkerPoi;
      default:
        return theme.colors.accentLight;
    }
  };

  const getMarkerIcon = () => {
    switch (config.type) {
      case 'start':
        return '📍';
      case 'end':
        return '🎯';
      case 'poi':
        return '✨';
      default:
        return '📍';
    }
  };

  const markerColor = getMarkerColor();
  const scale = animationValue
    ? animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1.1],
      })
    : 1;

  const animatedStyle = animationValue
    ? {
        transform: [{ scale }],
      }
    : {};

  return (
    <Animated.View style={[styles.markerContainer, animatedStyle]}>
      {/* Outer Ring for Selected State */}
      {isSelected && <View style={[styles.markerRing, { borderColor: markerColor }]} />}

      {/* Main Marker */}
      <View style={[styles.marker, { backgroundColor: markerColor }]}>
        {config.imageUrl ? (
          <Image source={{ uri: config.imageUrl }} style={styles.markerImage} />
        ) : (
          <View style={styles.markerIcon}>
            <Text style={styles.iconText}>{getMarkerIcon()}</Text>
          </View>
        )}
      </View>

      {/* Pulse effect for POI markers */}
      {config.type === 'poi' && !isSelected && (
        <>
          <View style={[styles.pulseBg, { backgroundColor: markerColor }]} />
          <View style={[styles.pulseBg2, { backgroundColor: markerColor }]} />
        </>
      )}

      {/* Shadow */}
      <View style={styles.shadow} />
    </Animated.View>
  );
};

export default CustomMapMarker;

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.darkSecondary,
    zIndex: 10,
    elevation: 5,
    shadowColor: theme.colors.darkPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  markerImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  markerIcon: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  markerRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    zIndex: 5,
  },
  pulseBg: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    zIndex: 0,
  },
  pulseBg2: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    zIndex: -1,
    opacity: 0.3,
  },
  shadow: {
    position: 'absolute',
    bottom: -8,
    width: 50,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.darkPrimary,
    opacity: 0.2,
  },
});
