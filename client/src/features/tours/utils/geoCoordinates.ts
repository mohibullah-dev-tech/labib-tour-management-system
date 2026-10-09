import type { RouteStop } from '@/features/tours/types';

/**
 * Known geographic coordinates for key transport transit hubs and tour destinations in Bangladesh.
 * Used to power interactive Leaflet route mapping when explicit coordinates are not provided on the stop.
 */
export const BANGLADESH_LOCATIONS_GEO: Record<string, [number, number]> = {
  dhaka: [23.8103, 90.4125],
  sayedabad: [23.7147, 90.4285],
  gabtoli: [23.7788, 90.3477],
  uttara: [23.8759, 90.3795],
  cumilla: [23.4682, 91.1788],
  comilla: [23.4682, 91.1788],
  feni: [23.0159, 91.3976],
  chattogram: [22.3569, 91.7832],
  chittagong: [22.3569, 91.7832],
  khagrachari: [23.1322, 91.949],
  sajek: [23.382, 92.2938],
  'sajek valley': [23.382, 92.2938],
  bandarban: [22.1953, 92.2184],
  chimbuk: [22.0468, 92.2858],
  nilgiri: [21.9167, 92.3333],
  thanchi: [21.7867, 92.4277],
  remakri: [21.6833, 92.5],
  nafakhum: [21.6333, 92.5167],
  "cox's bazar": [21.4272, 92.0058],
  himchari: [21.3541, 92.0305],
  'inani beach': [21.1856, 92.0494],
  teknaf: [20.8653, 92.2974],
  'saint martin': [20.6273, 92.3225],
  'saint martin island': [20.6273, 92.3225],
  sylhet: [24.8949, 91.8687],
  sreemangal: [24.3065, 91.7296],
  sunamganj: [25.0658, 91.4073],
  'tanguar haor': [25.1275, 91.0772],
  tahirpur: [25.0931, 91.1788],
  jaflong: [25.1634, 92.0177],
  ratargul: [25.0069, 91.9317],
  bichanakandi: [25.1764, 91.8845],
  rangamati: [22.6533, 92.1753],
  kaptai: [22.4967, 92.2214],
  kuakata: [21.8167, 90.1167],
  barishal: [22.701, 90.3535],
  khulna: [22.8456, 89.5403],
  mongla: [22.4833, 89.6],
  sundarbans: [21.9497, 89.1833],
  bogura: [24.8465, 89.3777],
  rajshahi: [24.3745, 88.6042],
};

/**
 * Resolves the latitude and longitude for a given RouteStop.
 */
export function resolveStopCoordinates(stop: RouteStop): [number, number] {
  if (typeof stop.lat === 'number' && typeof stop.lng === 'number') {
    return [stop.lat, stop.lng];
  }

  const normalized = stop.location.trim().toLowerCase();
  if (BANGLADESH_LOCATIONS_GEO[normalized]) {
    return BANGLADESH_LOCATIONS_GEO[normalized];
  }

  // Partial match fallback
  for (const [key, coords] of Object.entries(BANGLADESH_LOCATIONS_GEO)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return coords;
    }
  }

  // Default coordinate (Dhaka Central)
  return [23.8103, 90.4125];
}

/**
 * Calculates straight-line distance between two points in km (Haversine formula).
 */
export function haversineDistanceKm(
  [lat1, lon1]: [number, number],
  [lat2, lon2]: [number, number],
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Computes approximate road distance along the route stops (multiplying straight-line by ~1.3 for highway winding factor).
 */
export function calculateEstimatedDistanceKm(stops: RouteStop[]): number {
  if (stops.length < 2) return 0;
  let totalStraight = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    const c1 = resolveStopCoordinates(stops[i]);
    const c2 = resolveStopCoordinates(stops[i + 1]);
    totalStraight += haversineDistanceKm(c1, c2);
  }
  return Math.round(totalStraight * 1.28);
}
