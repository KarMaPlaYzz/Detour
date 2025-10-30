import { theme } from '@/styles/theme';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { IconSymbol } from '../../components/ui/icon-symbol';

interface FloatingNavigationProps {
  bottomOffset?: number;
}

export const FloatingNavigation: React.FC<FloatingNavigationProps> = ({
  bottomOffset = 36,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  
  // Debug logging
  React.useEffect(() => {
    console.log('Current pathname:', pathname);
  }, [pathname]);
  
  const isExplore = !pathname.includes('my-detours');
  const isMyDetours = pathname.includes('my-detours');

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.fab,
          isExplore && styles.fabActive,
        ]}
        onPress={() => router.push('/(tabs)')}
        activeOpacity={0.7}>
        <IconSymbol
          size={28}
          name="map.fill"
          color={isExplore ? theme.colors.accent : theme.colors.textSecondary}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.fab,
          isMyDetours && styles.fabActive,
        ]}
        onPress={() => router.push('/(tabs)/my-detours')}
        activeOpacity={0.7}>
        <IconSymbol
          size={28}
          name="list.bullet"
          color={isMyDetours ? theme.colors.accent : theme.colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    backgroundColor: theme.colors.cardLight,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexDirection: 'row',
    gap: 8,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    minWidth: 60,
  },
  fabActive: {
    backgroundColor: theme.colors.accent + '20',
  },
});
