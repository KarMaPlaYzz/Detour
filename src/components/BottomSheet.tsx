import { theme } from '@/styles/theme';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Pressable,
    StyleSheet,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[]; // Percentage heights (0-1) where sheet can snap
  maxHeight?: number; // Max height in pixels
  title?: string;
  showHandle?: boolean;
}

export default function BottomSheet({
  visible,
  onClose,
  children,
  snapPoints = [0.5, 0.8],
  maxHeight,
  title,
  showHandle = true,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;
  const sheetHeightRef = useRef(new Animated.Value(screenHeight * snapPoints[0]));
  const opacityRef = useRef(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityRef.current, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(sheetHeightRef.current, {
          toValue: screenHeight * snapPoints[0],
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacityRef.current, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(sheetHeightRef.current, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [visible, snapPoints, screenHeight]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: opacityRef.current,
          pointerEvents: visible ? 'auto' : 'none',
        },
      ]}
    >
      {/* Backdrop */}
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
      />

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            height: sheetHeightRef.current,
            maxHeight: maxHeight || screenHeight * 0.85,
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        {/* Handle */}
        {showHandle && (
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
        )}

        {/* Title */}
        {title && (
          <View style={styles.titleContainer}>
            <Pressable
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.closeButton}
            >
              <View style={styles.closeIcon} />
            </Pressable>
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {children}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 200,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardBorder,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.textTertiary,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },
  closeButton: {
    padding: theme.spacing.md,
    marginRight: -theme.spacing.md,
  },
  closeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    overflow: 'hidden',
  },
});
