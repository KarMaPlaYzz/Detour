import React, { useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface VirtualScrollProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  maxHeight: number;
  scrollOffset?: number;
  containerStyle?: ViewStyle;
  keyExtractor?: (item: T, index: number) => string;
}

/**
 * Virtual Scroller Component
 * Optimizes rendering of long lists by only rendering visible items
 * Reduces memory usage and improves performance
 */
export const VirtualScroller = React.memo(
  React.forwardRef<View, VirtualScrollProps<any>>(
    (
      {
        data,
        renderItem,
        itemHeight,
        maxHeight,
        scrollOffset = 0,
        containerStyle,
        keyExtractor,
      },
      ref
    ) => {
      // Calculate visible range based on scroll offset
      const visibleRange = useMemo(() => {
        const startIndex = Math.max(0, Math.floor(scrollOffset / itemHeight) - 2);
        const endIndex = Math.min(
          data.length,
          Math.ceil((scrollOffset + maxHeight) / itemHeight) + 2
        );
        return { startIndex, endIndex };
      }, [scrollOffset, itemHeight, maxHeight, data.length]);

      // Memoize visible items
      const visibleItems = useMemo(() => {
        return data.slice(visibleRange.startIndex, visibleRange.endIndex);
      }, [data, visibleRange.startIndex, visibleRange.endIndex]);

      // Memoize offset spacer
      const offsetY = useMemo(() => {
        return visibleRange.startIndex * itemHeight;
      }, [visibleRange.startIndex, itemHeight]);

      return (
        <View ref={ref} style={[styles.container, containerStyle]}>
          {/* Top spacer */}
          <View style={{ height: offsetY }} />

          {/* Visible items */}
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.startIndex + index;
            const key = keyExtractor
              ? keyExtractor(item, actualIndex)
              : `virtual-${actualIndex}`;

            return (
              <View
                key={key}
                style={{ height: itemHeight, overflow: 'hidden' }}
              >
                {renderItem(item, actualIndex)}
              </View>
            );
          })}

          {/* Bottom spacer */}
          <View
            style={{
              height: Math.max(
                0,
                (data.length - visibleRange.endIndex) * itemHeight
              ),
            }}
          />
        </View>
      );
    }
  )
);

VirtualScroller.displayName = 'VirtualScroller';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
