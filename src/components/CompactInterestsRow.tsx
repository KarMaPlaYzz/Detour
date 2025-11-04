import { HapticService } from '@/services/HapticService';
import { theme } from '@/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface CompactInterestsRowProps {
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
    // Attractions & Entertainment
    'Tourist Attractions': 'location',
    'Amusement Parks': 'sparkles',
    'Aquariums': 'water',
    'Art Galleries': 'palette',
    'Museums': 'library',
    'Movie Theaters': 'film',
    'Zoos': 'paw',
    'Casinos': 'game-controller',
    'Bowling Alleys': 'football',
    'Night Clubs': 'musical-notes',
    'Bars': 'wine',
    'Stadiums': 'flag',
    'Spas': 'leaf',
    
    // Food & Dining
    'Cafés': 'coffee',
    'Restaurants': 'restaurant',
    'Bakeries': 'storefront',
    'Food': 'fast-food',
    'Food Delivery': 'car',
    'Takeaway': 'bag',
    'Ice Cream': 'snow',
    'Coffee Shops': 'coffee',
    'Fast Food': 'fast-food',
    'Bar Supplies': 'wine',
    'Meal Delivery': 'bag',
    
    // Lodging
    'Hotels': 'home',
    'Hostels': 'bed',
    'Campgrounds': 'home',
    
    // Shopping
    'Shopping Malls': 'bag-handle',
    'Stores': 'storefront',
    'Bookstores': 'book',
    'Clothing': 'shirt',
    'Supermarkets': 'cart',
    'Contractors': 'construct',
    
    // Services
    'Gas Stations': 'alert-circle',
    'Parking': 'car',
    'Car Rentals': 'car',
    'Pharmacies': 'medical',
    'Hospitals': 'medical',
    'Doctors': 'medical',
    'Banks': 'cash',
    'ATMs': 'cash',
    'Post Offices': 'mail',
    'Libraries': 'library',
    'Gyms': 'fitness',
    
    // Culture & Architecture
    'Churches': 'home',
    'Mosques': 'home',
    'Synagogues': 'home',
    'Temples': 'home',
    'City Halls': 'home',
    'Courthouses': 'home',
    'Cemeteries': 'flower',
    'Historic Sites': 'information',
    'Architecture': 'home',
    
    // Nature & Outdoors
    'Parks': 'leaf',
    'Hiking': 'trail',
    'Natural Features': 'mountain',
    'Water Features': 'water',
    'Mountains': 'mountain',
    'Lakes': 'water',
    'Beaches': 'water',
    'Forests': 'leaf',
    'Gardens': 'flower',
    'Botanical Gardens': 'leaf',
    
    // Transportation
    'Airports': 'airplane',
    'Bus Stations': 'bus',
    'Train Stations': 'train',
    'Subway Stations': 'subway',
    'Taxi Stands': 'car',
    
    // Arts & Street Art
    'Street Art': 'brush',
    'Murals': 'brush',
    'Graffiti': 'brush',
  };
  return iconMap[interest] || 'star';
};

export default function CompactInterestsRow({
  visible,
  dynamicInterests,
  selectedInterest,
  poiTypeMap,
  onSelectInterest,
  isLoading = false,
}: CompactInterestsRowProps) {
  if (!visible || dynamicInterests.length === 0) return null;

  const handleSelectInterest = async (displayName: string) => {
    await HapticService.lightTap();
    const rawType = Object.keys(poiTypeMap).find(
      key => poiTypeMap[key] === displayName
    );
    if (rawType) {
      onSelectInterest(displayName, rawType);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Filter by Interest</Text>
        {isLoading && (
          <ActivityIndicator
            size="small"
            color={theme.colors.accentLight}
          />
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {dynamicInterests.map((displayName) => {
          const isActive = selectedInterest === displayName;
          return (
            <TouchableOpacity
              key={displayName}
              style={[
                styles.pill,
                isActive && styles.pillActive,
              ]}
              onPress={() => handleSelectInterest(displayName)}
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
                  styles.pillText,
                  isActive && styles.pillTextActive,
                ]}
                numberOfLines={1}
              >
                {displayName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.backgroundSecondary,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollView: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  scrollContent: {
    gap: theme.spacing.xs,
    paddingRight: theme.spacing.md,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 32,
  },
  pillActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    maxWidth: 80,
  },
  pillTextActive: {
    color: theme.colors.textWhite,
  },
});
