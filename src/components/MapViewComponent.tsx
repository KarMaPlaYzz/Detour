import { Location, Marker as MarkerType } from '@/types/detour';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

// Helper function to format POI type
function formatPoiType(type: string): string {
  const typeMap: { [key: string]: string } = {
    'cafe': 'Café',
    'restaurant': 'Restaurant',
    'bar': 'Bar',
    'museum': 'Museum',
    'art_gallery': 'Art Gallery',
    'park': 'Park',
    'landmark': 'Landmark',
    'tourist_attraction': 'Tourist Attraction',
    'street_art': 'Street Art',
    'monument': 'Monument',
    'church': 'Church',
    'temple': 'Temple',
    'aquarium': 'Aquarium',
    'amusement_park': 'Amusement Park',
    'zoo': 'Zoo',
  };
  
  return typeMap[type] || type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Helper function to get today's hours
function getTodayHours(weekdayText?: string[]): string | null {
  if (!weekdayText || weekdayText.length === 0) return null;
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const todayName = days[today.getDay()];
  
  // Find today's entry in weekdayText
  const todayEntry = weekdayText.find(text => text.startsWith(todayName));
  
  if (!todayEntry) return null;
  
  // Extract just the time part (after the colon)
  const timePart = todayEntry.split(': ')[1];
  return timePart || null;
}

interface MapViewComponentProps {
  coordinates?: Location[];
  markers?: MarkerType[];
  pois?: Array<{
    [key: string]: any;
    name: string;
    location: Location;
  }>;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onMapReady?: () => void;
  showUserLocation?: boolean;
}

// Modern custom marker component
const ModernMarker = ({
  type,
  scale = 1,
}: {
  type: 'start' | 'end' | 'poi';
  scale?: number;
}) => {
  const getMarkerConfig = () => {
    switch (type) {
      case 'start':
        return {
          bgColor: '#0066FF',
          iconColor: '#FFFFFF',
          icon: 'map-marker-check',
          size: 36 * scale,
        };
      case 'end':
        return {
          bgColor: '#FF6B6B',
          iconColor: '#FFFFFF',
          icon: 'flag-checkered',
          size: 36 * scale,
        };
      case 'poi':
        return {
          bgColor: '#00D084',
          iconColor: '#FFFFFF',
          icon: 'star-circle',
          size: 48 * scale,
        };
      default:
        return {
          bgColor: '#0066FF',
          iconColor: '#FFFFFF',
          icon: 'map-marker',
          size: 36 * scale,
        };
    }
  };

  const config = getMarkerConfig();

  return (
    <View
      style={[
        modernMarkerStyles.container,
        {
          width: config.size,
          height: config.size,
          backgroundColor: config.bgColor,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={config.icon as any}
        size={config.size * 0.5}
        color={config.iconColor}
      />
      <View
        style={[
          modernMarkerStyles.pulse,
          { backgroundColor: config.bgColor },
        ]}
      />
    </View>
  );
};

export default function MapViewComponent({
  coordinates = [],
  markers = [],
  pois = [],
  initialRegion = {
    latitude: 34.0522,
    longitude: -118.2437,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  onMapReady,
  showUserLocation = true,
}: MapViewComponentProps) {
  const mapRef = React.useRef<MapView>(null);

  // Update map region when initialRegion changes (e.g., when current location is obtained)
  React.useEffect(() => {
    if (initialRegion && mapRef.current) {
      mapRef.current.animateToRegion(initialRegion, 500);
    }
  }, [initialRegion]);

  // Fit map to show all markers when coordinates change
  React.useEffect(() => {
    if (coordinates.length > 0 && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coordinates, {
          edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
          animated: true,
        });
      }, 100);
    }
  }, [coordinates]);

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.mapPressable}
        onPress={() => Keyboard.dismiss()}
      >
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={initialRegion}
          /* customMapStyle={modernMapStyle}*/
          onMapReady={onMapReady}
          showsUserLocation={showUserLocation}
          showsMyLocationButton={false}
          showsPointsOfInterest={true}
          zoomEnabled={true}
          scrollEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
        >
          {/* Render polyline with modern gradient effect */}
          {coordinates.length > 0 && (
          <>
            {/* Background polyline for depth */}
            <Polyline
              coordinates={coordinates}
              strokeColor="rgba(0, 102, 255, 0.15)"
              strokeWidth={12}
              lineCap="round"
              lineJoin="round"
            />
            {/* Main polyline */}
            <Polyline
              coordinates={coordinates}
              strokeColor="#0066FF"
              strokeWidth={5}
              lineCap="round"
              lineJoin="round"
            />
            {/* Shimmer effect polyline */}
            <Polyline
              coordinates={coordinates}
              strokeColor="rgba(255, 255, 255, 0.4)"
              strokeWidth={2}
              lineCap="round"
              lineJoin="round"
            />
          </>
        )}

        {/* Render route markers with modern design */}
        {markers.map((marker, index) => {
          const isStart = index === 0;
          const isEnd = index === markers.length - 1;

          return (
            <Marker
              key={`marker-${index}`}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={marker.title}
              description={marker.description}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}
            >
              <ModernMarker type={isStart ? 'start' : isEnd ? 'end' : 'poi'} />
              <Callout tooltip>
                <View style={calloutStyles.modernContainer}>
                  <View style={calloutStyles.modernHeader}>
                    <MaterialCommunityIcons
                      name={isStart ? 'map-marker-check' : 'flag-checkered'}
                      size={16}
                      color="#FFFFFF"
                      style={calloutStyles.markerIcon}
                    />
                    <Text
                      style={calloutStyles.modernTitle}
                      numberOfLines={1}
                    >
                      {isStart ? 'Start' : 'End'}
                    </Text>
                  </View>
                  <Text style={calloutStyles.modernDescription}>
                    {marker.title}
                  </Text>
                  {marker.description && (
                    <Text style={calloutStyles.modernSubtext}>
                      {marker.description}
                    </Text>
                  )}
                </View>
              </Callout>
            </Marker>
          );
        })}

        {/* Render POI markers with modern design */}
        {pois.map((poi, index) => {
          // Debug log
          if (index === 0) {
            console.log('POI Data received in MapViewComponent:', {
              name: poi.name,
              hasOpeningHours: !!poi.opening_hours,
              hasOpeningHoursWeekday: !!poi.opening_hours?.weekdayText,
              weekdayText: poi.opening_hours?.weekdayText,
            });
          }
          return (
            <Marker
              key={`poi-marker-${index}`}
              coordinate={{
                latitude: poi.location.latitude,
                longitude: poi.location.longitude,
              }}
              title={poi.name}
              description={poi.vicinity || poi.formatted_address || 'Point of Interest'}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}
            >
            <ModernMarker type="poi" scale={1.1} />
            <Callout tooltip>
              <View style={calloutStyles.modernContainer}>
                <View style={calloutStyles.modernPOIHeader}>
                  <MaterialCommunityIcons
                    name="star"
                    size={16}
                    color="#FFD700"
                    style={calloutStyles.markerIcon}
                  />
                  <Text
                    style={calloutStyles.modernTitle}
                    numberOfLines={1}
                  >
                    {poi.types && poi.types[0] ? formatPoiType(poi.types[0]) : 'Point of Interest'}
                  </Text>
                </View>
                
                {/* Place Name */}
                <Text
                  style={calloutStyles.modernDescription}
                  numberOfLines={2}
                >
                  {poi.name}
                </Text>

                {/* Address */}
                {poi.formattedAddress && (
                  <Text style={calloutStyles.addressText} numberOfLines={2}>
                    📍 {poi.formattedAddress}
                  </Text>
                )}

                {/* Rating & Reviews */}
                {poi.rating && (
                  <View style={calloutStyles.ratingRow}>
                    <MaterialCommunityIcons
                      name="star"
                      size={14}
                      color="#FFA500"
                    />
                    <Text style={calloutStyles.modernRating}>
                      {poi.rating.toFixed(1)}
                    </Text>
                    {poi.user_ratings_total && (
                      <Text style={calloutStyles.ratingCount}>
                        ({poi.user_ratings_total} reviews)
                      </Text>
                    )}
                  </View>
                )}

                {/* Distance to Route */}
                {poi.distanceToRoute !== undefined && (
                  <View style={calloutStyles.distanceRow}>
                    <MaterialCommunityIcons
                      name="road"
                      size={14}
                      color="#0066FF"
                    />
                    <Text style={calloutStyles.distanceText}>
                      {poi.distanceToRoute < 1000
                        ? `${Math.round(poi.distanceToRoute)}m from route`
                        : `${(poi.distanceToRoute / 1000).toFixed(1)}km from route`}
                    </Text>
                  </View>
                )}

                {/* Status - Open/Closed with Today's Hours */}
                {poi.business_status && (
                  <View style={calloutStyles.statusRow}>
                    <View
                      style={[
                        calloutStyles.statusDot,
                        {
                          backgroundColor:
                            poi.business_status === 'OPERATIONAL'
                              ? '#00C853'
                              : '#FF6B6B',
                        },
                      ]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={calloutStyles.statusText}>
                        {poi.business_status === 'OPERATIONAL'
                          ? 'Open'
                          : 'Closed'}
                      </Text>
                      {poi.business_status === 'OPERATIONAL' && (poi.openingHours?.weekdayText || poi.opening_hours?.weekdayText) && (
                        <Text style={calloutStyles.todayHoursText}>
                          {getTodayHours(poi.openingHours?.weekdayText || poi.opening_hours?.weekdayText)}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </View>
            </Callout>
            </Marker>
          );
        })}
      </MapView>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapPressable: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

const modernMarkerStyles = StyleSheet.create({
  container: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  pulse: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 50,
    opacity: 0.2,
  },
});

const calloutStyles = StyleSheet.create({
  modernContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    maxWidth: 300,
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modernHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#0066FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modernPOIHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#00D084',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  markerIcon: {
    marginRight: 8,
  },
  modernTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  modernDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 10,
    lineHeight: 22,
  },
  modernSubtext: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 6,
  },
  modernRating: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFA500',
    marginLeft: 6,
  },
  ratingCount: {
    fontSize: 13,
    color: '#888888',
    marginLeft: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
  },

  todayHoursText: {
    fontSize: 11,
    color: '#666666',
    marginTop: 2,
    fontStyle: 'italic',
  },
  
  addressText: {
    fontSize: 12,
    color: '#555555',
    marginBottom: 8,
    lineHeight: 16,
  },

  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },

  distanceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0066FF',
    marginLeft: 6,
  },

  // Legacy styles for backward compatibility
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
    maxWidth: 200,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  badge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF6B6B',
    backgroundColor: '#FFE8E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFA500',
    marginBottom: 4,
  },
  status: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  poiBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFD700',
    backgroundColor: '#FFFACD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
});

// Modern map style - Clean, minimal, AirBnB inspired with cohesive styling
const modernMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    elementType: 'geometry.fill',
    stylers: [{ color: '#ffffff' }],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'on' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#424242' }, { weight: '400' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }, { weight: '3' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ visibility: 'on' }, { color: '#f5f5f5' }],
  },
  {
    featureType: 'administrative',
    elementType: 'labels',
    stylers: [{ visibility: 'on' }, { color: '#9e9e9e' }, { weight: '500' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e0e0e0' }, { weight: '1.5' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'labels.text',
    stylers: [{ color: '#757575' }, { weight: '600' }],
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#eeeeee' }, { weight: '0.8' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#666666' }, { weight: '500' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry',
    stylers: [{ color: '#f9f9f9' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#f0f8f0' }],
  },
  {
    featureType: 'landscape.natural.terrain',
    elementType: 'geometry',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#fafafa' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.attraction',
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }],
  },
  {
    featureType: 'poi.business',
    elementType: 'geometry',
    stylers: [{ color: '#fafafa' }],
  },
  {
    featureType: 'poi.government',
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }],
  },
  {
    featureType: 'poi.medical',
    elementType: 'geometry',
    stylers: [{ color: '#fce4ec' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#f1f8e9' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#689f38' }],
  },
  {
    featureType: 'poi.place_of_worship',
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }],
  },
  {
    featureType: 'poi.school',
    elementType: 'geometry',
    stylers: [{ color: '#fffde7' }],
  },
  {
    featureType: 'poi.sports_complex',
    elementType: 'geometry',
    stylers: [{ color: '#e0f2f1' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    elementType: 'geometry.fill',
    featureType: 'road',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#f0f0f0' }, { weight: '0.8' }],
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#757575' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }, { weight: '3' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e8e8e8' }, { weight: '1.2' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#666666' }, { weight: '600' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#fffef5' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#ffd54f' }, { weight: '2.2' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f9a825' }, { weight: '700' }],
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry',
    stylers: [{ color: '#fffef9' }],
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#ffca28' }, { weight: '2.5' }],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#f5f5f5' }, { weight: '0.6' }],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#808080' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#fff8e1' }],
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [{ color: '#ffb74d' }, { weight: '2' }],
  },
  {
    featureType: 'transit.line',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ff8a00' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [{ color: '#fff9e6' }],
  },
  {
    featureType: 'transit.station.airport',
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }],
  },
  {
    featureType: 'transit.station.bus',
    elementType: 'geometry',
    stylers: [{ color: '#fff9c4' }],
  },
  {
    featureType: 'transit.station.rail',
    elementType: 'geometry',
    stylers: [{ color: '#fff8e1' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#e1f5ff' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#e3f2fd' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#0277bd' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }, { weight: '2' }],
  },
];
