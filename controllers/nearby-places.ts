const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!;

export interface PlaceResult {
  id: string;
  name: string;
  fullName: string;
  latitude: number;
  longitude: number;
}

/** Category groups to query separately (Mapbox limits to ~10 per call). */
const CATEGORY_GROUPS = [
  'cafe,library,coworking_space,bookstore,college,university',
  'restaurant,community_center,school,museum,student_housing',
];

/**
 * Custom campus locations that Mapbox doesn't know about.
 * Add any places you want always available here.
 */
const CUSTOM_LOCATIONS: PlaceResult[] = [
  // --- UCLA Libraries ---
  { id: 'ucla-powell-library', name: 'Powell Library', fullName: 'Powell Library, UCLA', latitude: 34.071879824505665, longitude: -118.44215514616985 },
  { id: 'ucla-yrl-library', name: 'YRL (Research Library)', fullName: 'Charles E. Young Research Library (YRL), UCLA', latitude: 34.07511126104087, longitude: -118.44141235966411 },
  { id: 'ucla-sel-library', name: 'SEL (Science & Engineering)', fullName: 'Science and Engineering Library (SEL), UCLA', latitude: 34.06960973679298, longitude: -118.44241019656454 },
  { id: 'ucla-biomed-library', name: 'Biomedical Library', fullName: 'Louise M. Darling Biomedical Library, UCLA', latitude: 34.06656134952783, longitude: -118.44175962898275 },
  { id: 'ucla-music-library', name: 'Music Library', fullName: 'Schoenberg Music Library, UCLA', latitude: 34.07125986967872, longitude: -118.43974040028237 },
  { id: 'ucla-law-library', name: 'Law Library', fullName: 'Hugh and Hazel Darling Law Library, UCLA', latitude: 34.072849004558584, longitude: -118.43787518015282 },
  { id: 'ucla-management-library', name: 'Management Library', fullName: 'Eugene and Maxine Rosenfeld Management Library, UCLA', latitude: 34.07440309121177, longitude: -118.44344758403116 },
  { id: 'ucla-arts-library', name: 'Arts Library', fullName: 'Arts Library, UCLA', latitude: 34.07427471634096, longitude: -118.43938822817265 },

  // --- The Hill (Residential & Study Spaces) ---
  { id: 'ucla-study-hedrick', name: 'The Study at Hedrick', fullName: 'The Study at Hedrick, UCLA', latitude: 34.07338779504392, longitude: -118.45212310829436 },
  { id: 'ucla-olympic-hall', name: 'Olympic Hall', fullName: 'Olympic Hall (The Canopy & Understory), UCLA', latitude: 34.07266604539173, longitude: -118.45341871248053 },
  { id: 'ucla-sproul-landing', name: 'Sproul Landing Lounge', fullName: 'Sproul Landing Living Room, UCLA', latitude: 34.07148438022453, longitude: -118.45008795537679 },
  { id: 'ucla-de-neve-center', name: 'De Neve Learning Center', fullName: 'De Neve Learning Center, UCLA', latitude: 34.07051383283459, longitude: -118.45011440538038 },
  { id: 'ucla-sunset-village', name: 'Sunset Village Center', fullName: 'Sunset Village Learning Center, UCLA', latitude: 34.0730354757574, longitude: -118.45072017274573 },
  { id: 'ucla-covel-commons', name: 'Covel Commons (Epicuria)', fullName: 'Covel Commons (Epicuria), UCLA', latitude: 34.07301559954207, longitude: -118.44997238091904 },

  // --- Student Unions & Lounges ---
  { id: 'ucla-kerckhoff-hall', name: 'Kerckhoff Hall', fullName: 'Kerckhoff Hall, UCLA', latitude: 34.07031049590084, longitude: -118.4437424323158 },
  { id: 'ucla-ackerman-union', name: 'Ackerman Union', fullName: 'Ackerman Union, UCLA', latitude: 34.07047402921613, longitude: -118.44415965599609 },
  { id: 'ucla-north-campus-lounge', name: 'North Campus Lounge', fullName: 'North Campus Student Lounge, UCLA', latitude: 34.07445986905383, longitude: -118.44199448250937 },
  { id: 'ucla-sac', name: 'Student Activity Center', fullName: 'Student Activity Center (SAC), UCLA', latitude: 34.071596436539345, longitude: -118.44408636417083 },

  // --- Academic & Outdoor Spaces ---
  { id: 'ucla-pab', name: 'PAB (Physics & Astronomy)', fullName: 'Physics and Astronomy Building (PAB), UCLA', latitude: 34.07093139186506, longitude: -118.44179113467163 },
  { id: 'ucla-luskin-school', name: 'Luskin Public Affairs', fullName: 'Luskin School of Public Affairs, UCLA', latitude: 34.07419843110014, longitude: -118.43890869668519 },
  { id: 'ucla-pritzker-hall', name: 'Pritzker Hall', fullName: 'Pritzker Hall, UCLA', latitude: 34.069646021689394, longitude: -118.44076886493737 },
  { id: 'ucla-anderson-hall', name: 'Anderson Hall', fullName: 'Anderson Hall, UCLA', latitude: 34.074006892765475, longitude: -118.44296509969766 },
  { id: 'ucla-bunche-hall', name: 'Bunche Hall', fullName: 'Bunche Hall, UCLA', latitude: 34.07416884910135, longitude: -118.44007548159679 },
  { id: 'ucla-kaplan-hall', name: 'Kaplan Hall', fullName: 'Kaplan Hall, UCLA', latitude: 34.071105161818494, longitude: -118.44115425463136 },
  { id: 'ucla-botanical-garden', name: 'Botanical Garden', fullName: 'Mildred E. Mathias Botanical Garden, UCLA', latitude: 34.06577625898443, longitude: -118.44110860269073 },
  { id: 'ucla-sculpture-garden', name: 'Sculpture Garden', fullName: 'Franklin D. Murphy Sculpture Garden, UCLA', latitude: 34.075202118950074, longitude: -118.44001739752619 },
  { id: 'ucla-janss-steps', name: 'Janss Steps Lawn', fullName: 'Janss Steps Lawn, UCLA', latitude: 34.075152674189006, longitude: -118.44006623810135 },
  { id: 'ucla-engineering-vi', name: 'Engineering VI Courtyard', fullName: 'Engineering VI Courtyard, UCLA', latitude: 34.06958084965487, longitude: -118.4437162038664 },
  { id: 'ucla-bombshelter', name: 'The Bombshelter', fullName: 'Bombshelter (Court of Sciences), UCLA', latitude: 34.0680714073461, longitude: -118.44215238598382 },
];
/**
 * Search for places near a location.
 * Filters cached results (API + custom) by name match.
 */
export async function searchPlacesNear(
  query: string,
  center: { latitude: number; longitude: number },
  limit = 5
): Promise<PlaceResult[]> {
  if (!query.trim()) return [];

  const all = await getNearbyPlaces(center, 25);
  const q = query.toLowerCase();
  const filtered = all.filter(
    (p) => p.name.toLowerCase().includes(q) || p.fullName.toLowerCase().includes(q)
  );
  return filtered.slice(0, limit);
}

/**
 * Get nearby places by category + custom locations, sorted by distance.
 * Fires multiple category queries in parallel for broader coverage.
 */
export async function getNearbyPlaces(
  center: { latitude: number; longitude: number },
  limit = 5
): Promise<PlaceResult[]> {
  // Query each category group in parallel
  const fetches = CATEGORY_GROUPS.map(async (cats) => {
    const url =
      `https://api.mapbox.com/search/searchbox/v1/category/${cats}`
      + `?proximity=${center.longitude},${center.latitude}`
      + `&limit=25`
      + `&access_token=${MAPBOX_TOKEN}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!json.features?.length) return [];
    return json.features.map((f: any) => ({
      id: f.properties?.mapbox_id ?? f.id,
      name: f.properties?.name ?? 'Unknown',
      fullName: f.properties?.full_address ?? f.properties?.place_formatted ?? f.properties?.name ?? '',
      longitude: f.geometry.coordinates[0],
      latitude: f.geometry.coordinates[1],
    }));
  });

  const groups = await Promise.all(fetches);
  const apiResults: PlaceResult[] = groups.flat();

  // Merge with custom locations, deduplicate by id
  const seen = new Set(apiResults.map((p) => p.id));
  const merged = [...apiResults];
  for (const custom of CUSTOM_LOCATIONS) {
    if (!seen.has(custom.id)) {
      merged.push(custom);
      seen.add(custom.id);
    }
  }

  // Sort all by distance from center
  merged.sort(
    (a, b) => getDistanceMiles(center, a) - getDistanceMiles(center, b)
  );

  return merged.slice(0, limit);
}

/** Haversine distance in miles between two lat/lng points. */
export function getDistanceMiles(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const sin2 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(sin2), Math.sqrt(1 - sin2));
}