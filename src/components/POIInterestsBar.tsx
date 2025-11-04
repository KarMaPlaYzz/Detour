import { theme } from '@/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface POIInterestsBarProps {
  visible: boolean;
  dynamicInterests: string[];
  selectedInterest: string;
  poiTypeMap: { [key: string]: string };
  onSelectInterest: (interest: string, rawType: string) => void;
  isLoading?: boolean;
}

// Icon mapping for different interests
const getIconName = (interest: string): any => {
  const iconMap: { [key: string]: any } = {
    'Architecture': 'home',
    'Street Art': 'brush',
    'Street Carts': 'restaurant',
    'Museums': 'library',
    'Specialty Cafes': 'coffee',
    'Mixed Drinks': 'wine',
    'Casual Dining': 'pizza',
    'Bakeries': 'leaf',
  };
  return iconMap[interest] || 'star';
};

export default function POIInterestsBar({
  visible,
  dynamicInterests,
  selectedInterest,
  poiTypeMap,
  onSelectInterest,
  isLoading = false,
}: POIInterestsBarProps) {
  if (!visible || dynamicInterests.length === 0) return null;

  const renderInterestButton = (displayName: string) => {
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
        activeOpacity={0.7}
      >
        <Ionicons
          name={getIconName(displayName)}
          size={14}
          color={isActive ? theme.colors.textWhite : theme.colors.accentLight}
        />
        <Text
          style={[
            styles.buttonLabel,
            isActive && styles.buttonLabelActive,
          ]}
          numberOfLines={1}
        >
          {displayName}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Interests</Text>
      <View style={styles.grid}>
        {dynamicInterests.map((displayName) => renderInterestButton(displayName))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: theme.spacing.sm,
  },
  button: {
    width: 'auto',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    flexDirection: 'row',
    gap: 4,
  },
  buttonActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  buttonContent: {
    marginBottom: 0,
  },
  buttonLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  buttonLabelActive: {
    color: theme.colors.textWhite,
  },
});
