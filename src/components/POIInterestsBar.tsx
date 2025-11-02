import { theme } from '@/styles/theme';
import { BlurView } from 'expo-blur';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { IconSymbol } from '../../components/ui/icon-symbol';

interface POIInterestsBarProps {
  visible: boolean;
  dynamicInterests: string[];
  selectedInterest: string;
  poiTypeMap: { [key: string]: string };
  onSelectInterest: (interest: string, rawType: string) => void;
  isLoading?: boolean;
}

export default function POIInterestsBar({
  visible,
  dynamicInterests,
  selectedInterest,
  poiTypeMap,
  onSelectInterest,
  isLoading = false,
}: POIInterestsBarProps) {
  if (!visible || dynamicInterests.length === 0) return null;

  return (
    <View style={styles.container}>
      <BlurView intensity={45} tint="dark">
        <View style={styles.blurView}>
          {/* Header with "Pick your detour" text */}
          <View style={styles.header}>
            <IconSymbol name="sparkles" size={16} color={theme.colors.accent} />
            <Text style={styles.headerText}>Pick your detour</Text>
          </View>

          {/* Horizontal scrollable POI interest buttons */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={dynamicInterests.length > 3}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
          >
            {dynamicInterests.map((displayName) => {
              const rawType = Object.keys(poiTypeMap).find(
                key => poiTypeMap[key] === displayName
              );
              const isActive = selectedInterest === displayName;

              return (
                <TouchableOpacity
                  key={displayName}
                  style={[
                    styles.button,
                    isActive && styles.buttonActive,
                  ]}
                  onPress={() => {
                    if (rawType) {
                      onSelectInterest(displayName, rawType);
                    }
                  }}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isActive && styles.buttonTextActive,
                    ]}
                  >
                    {displayName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.textTertiary,
    overflow: 'hidden',
  },
  blurView: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  headerText: {
    ...theme.typography.bodySemibold,
    color: theme.colors.textOnDarkBlur,
    fontSize: 14,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.md,
  },
  button: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.textTertiary,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  buttonActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  buttonText: {
    ...theme.typography.buttonSmall,
    color: theme.colors.textSecondaryOnDarkBlur,
    fontSize: 13,
  },
  buttonTextActive: {
    color: theme.colors.card,
  },
});
