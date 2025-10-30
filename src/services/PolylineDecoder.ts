import { Location } from '@/types/detour';

/**
 * Decode Google Maps encoded polyline to array of coordinates
 * Based on the algorithm: https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
export function decode(encoded: string): Location[] {
  const points: Location[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let shift = 0;
    let result = 0;
    let byte: number;

    // Decode latitude
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    // Decode longitude
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return points;
}

/**
 * Encode array of coordinates to Google Maps polyline format
 * (Optional - not used in v1.0 but included for completeness)
 */
export function encode(locations: Location[]): string {
  let encoded = '';
  let prevLat = 0;
  let prevLng = 0;

  for (const location of locations) {
    const lat = Math.round(location.latitude * 1e5);
    const lng = Math.round(location.longitude * 1e5);

    const dLat = lat - prevLat;
    const dLng = lng - prevLng;

    encoded += encodeValue(dLat);
    encoded += encodeValue(dLng);

    prevLat = lat;
    prevLng = lng;
  }

  return encoded;
}

function encodeValue(value: number): string {
  let encoded = '';
  let num = value < 0 ? ~(value << 1) : value << 1;

  while (num >= 0x20) {
    encoded += String.fromCharCode((0x20 | (num & 0x1f)) + 63);
    num >>= 5;
  }

  encoded += String.fromCharCode(num + 63);
  return encoded;
}
