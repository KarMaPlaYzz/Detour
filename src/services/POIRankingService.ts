/**
 * POI Ranking Service
 * Smart algorithm to rank POIs based on multiple factors
 */

import { Location, POI } from '@/types/detour';

export interface RankingFactors {
  distance: number;           // 0-1 (closer = higher score)
  rating: number;             // 0-1 (higher rating = higher score)
  popularity: number;         // 0-1 (more reviews = higher score)
  timeOpen: number;           // 0-1 (currently open = 1, closed = 0)
  diversification: number;    // 0-1 (different type from others = higher)
  newness: number;            // 0-1 (newer places get slight boost)
}

export interface RankingWeights {
  distance: number;           // 40%
  rating: number;             // 25%
  popularity: number;         // 20%
  timeOpen: number;           // 10%
  diversification: number;    // 5%
}

const DEFAULT_WEIGHTS: RankingWeights = {
  distance: 0.40,
  rating: 0.25,
  popularity: 0.20,
  timeOpen: 0.10,
  diversification: 0.05,
};

/**
 * Calculate distance between two points in meters
 */
function calculateDistance(from: Location, to: Location): number {
  const R = 6371000; // Earth's radius in meters
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;
  const deltaLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const deltaLng = ((to.longitude - from.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate normalized distance score (0-1)
 * Closer POIs get higher scores, with a max useful distance of 1km
 */
function getDistanceScore(distanceMeters: number): number {
  const maxDistance = 1000; // 1km is considered far
  return Math.max(0, 1 - distanceMeters / maxDistance);
}

/**
 * Calculate normalized rating score (0-1)
 */
function getRatingScore(rating?: number): number {
  if (!rating) return 0.3; // Default for unrated POIs
  return (rating / 5) * 0.9 + 0.1; // 0.1-1.0 range
}

/**
 * Calculate normalized popularity score based on review count
 */
function getPopularityScore(reviewCount?: number): number {
  if (!reviewCount) return 0.3; // Default for no reviews
  const maxUseful = 500; // After 500 reviews, diminishing returns
  return Math.min(1, (reviewCount / maxUseful) * 0.8 + 0.2); // 0.2-1.0 range
}

/**
 * Calculate time open score
 */
function getTimeOpenScore(isOpen?: boolean): number {
  return isOpen ? 1 : 0.5; // Slightly penalize closed places but don't exclude
}

/**
 * Calculate diversification score based on POI types
 */
function getDiversificationScore(
  poi: POI,
  otherPOIs: POI[],
  selectedPOITypes: string[]
): number {
  const poiType = poi.types?.[0] || 'unknown';

  // Count how many already selected POIs have the same type
  const sameTypeCount = selectedPOITypes.filter(type => type === poiType).length;

  // If already have this type, penalize
  if (sameTypeCount > 0) {
    return Math.max(0.3, 1 - sameTypeCount * 0.4);
  }

  return 1; // New type = full score
}

/**
 * Main ranking function
 */
export function rankPOIs(
  pois: POI[],
  routeCenter: Location,
  selectedPOITypes: string[] = [],
  weights: RankingWeights = DEFAULT_WEIGHTS
): POI[] {
  // Calculate scores for each POI
  const scoredPOIs = pois.map(poi => {
    const distance = calculateDistance(routeCenter, poi.location);

    const factors: RankingFactors = {
      distance: getDistanceScore(distance),
      rating: getRatingScore(poi.rating),
      popularity: getPopularityScore(poi.user_ratings_total),
      timeOpen: getTimeOpenScore(poi.business_status === 'OPERATIONAL'),
      diversification: getDiversificationScore(poi, pois, selectedPOITypes),
      newness: 0.5, // Placeholder for now
    };

    // Calculate weighted score
    const score =
      factors.distance * weights.distance +
      factors.rating * weights.rating +
      factors.popularity * weights.popularity +
      factors.timeOpen * weights.timeOpen +
      factors.diversification * weights.diversification;

    return {
      poi,
      score,
      factors,
    };
  });

  // Sort by score (descending)
  return scoredPOIs
    .sort((a, b) => b.score - a.score)
    .map(item => item.poi);
}

/**
 * Filter POIs by distance from route center
 */
export function filterPOIsByDistance(
  pois: POI[],
  center: Location,
  maxDistanceMeters: number = 500
): POI[] {
  return pois.filter(poi => {
    const distance = calculateDistance(center, poi.location);
    return distance <= maxDistanceMeters;
  });
}

/**
 * Filter POIs by rating threshold
 */
export function filterPOIsByRating(pois: POI[], minRating: number = 3.5): POI[] {
  return pois.filter(poi => (poi.rating || 0) >= minRating);
}

/**
 * Filter POIs by type
 */
export function filterPOIsByType(
  pois: POI[],
  allowedTypes: string[]
): POI[] {
  if (allowedTypes.length === 0) return pois;

  return pois.filter(poi => {
    const poiTypes = poi.types || [];
    return allowedTypes.some(type => poiTypes.includes(type));
  });
}

/**
 * Filter POIs by open status
 */
export function filterPOIsByOpenStatus(
  pois: POI[],
  openOnly: boolean = false
): POI[] {
  if (!openOnly) return pois;

  return pois.filter(poi => poi.business_status === 'OPERATIONAL');
}

/**
 * Combined filter function
 */
export function filterAndRankPOIs(
  pois: POI[],
  routeCenter: Location,
  options: {
    maxDistance?: number;
    minRating?: number;
    allowedTypes?: string[];
    openOnly?: boolean;
    weights?: RankingWeights;
  } = {}
): POI[] {
  let filtered = pois;

  // Apply filters
  if (options.maxDistance) {
    filtered = filterPOIsByDistance(filtered, routeCenter, options.maxDistance);
  }

  if (options.minRating) {
    filtered = filterPOIsByRating(filtered, options.minRating);
  }

  if (options.allowedTypes && options.allowedTypes.length > 0) {
    filtered = filterPOIsByType(filtered, options.allowedTypes);
  }

  if (options.openOnly) {
    filtered = filterPOIsByOpenStatus(filtered, true);
  }

  // Rank remaining POIs
  const selectedTypes = pois
    .slice(0, 3)
    .flatMap(p => p.types || []);

  return rankPOIs(filtered, routeCenter, selectedTypes, options.weights);
}
