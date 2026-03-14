export const LOCATION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'united states': { lat: 39.8283, lng: -98.5795 },
  'usa': { lat: 39.8283, lng: -98.5795 },
  'us': { lat: 39.8283, lng: -98.5795 },
  'united kingdom': { lat: 55.3781, lng: -3.436 },
  'uk': { lat: 55.3781, lng: -3.436 },
  'great britain': { lat: 55.3781, lng: -3.436 },
  'canada': { lat: 56.1304, lng: -106.3468 },
  'australia': { lat: -25.2744, lng: 133.7751 },
  'germany': { lat: 51.1657, lng: 10.4515 },
  'france': { lat: 46.2276, lng: 2.2137 },
  'spain': { lat: 40.4637, lng: -3.7492 },
  'italy': { lat: 41.8719, lng: 12.5674 },
  'india': { lat: 20.5937, lng: 78.9629 },
  'japan': { lat: 36.2048, lng: 138.2529 },
  'brazil': { lat: -14.235, lng: -51.9253 },
  'mexico': { lat: 23.6345, lng: -102.5528 },
  'china': { lat: 35.8617, lng: 104.1954 },
  'new york': { lat: 40.7128, lng: -74.006 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'paris': { lat: 48.8566, lng: 2.3522 },
  'tokyo': { lat: 35.6762, lng: 139.6503 },
  'sydney': { lat: -33.8688, lng: 151.2093 },
  'berlin': { lat: 52.52, lng: 13.405 },
  'singapore': { lat: 1.3521, lng: 103.8198 },
  'dubai': { lat: 25.2048, lng: 55.2708 },
  'hong kong': { lat: 22.3193, lng: 114.1694 },
  'netherlands': { lat: 52.1326, lng: 5.2913 },
  'beijing': { lat: 39.9042, lng: 116.4074 },
  'sweden': { lat: 60.1282, lng: 18.6435 },
  'belgium': { lat: 50.5039, lng: 4.4699 },
  'austria': { lat: 47.5162, lng: 14.5501 },
  'denmark': { lat: 56.2639, lng: 9.5018 },
  'finland': { lat: 61.9241, lng: 25.7482 },
  'norway': { lat: 60.472, lng: 8.4689 },
  'portugal': { lat: 39.3999, lng: -8.2245 },
  'greece': { lat: 39.0742, lng: 21.8243 },
  'mexico city': { lat: 19.4326, lng: -99.1332 },
  'sao paulo': { lat: -23.5505, lng: -46.6333 },
  'buenos aires': { lat: -34.6037, lng: -58.3816 },
  'bangkok': { lat: 13.7563, lng: 100.5018 },
  'jakarta': { lat: -6.2088, lng: 106.8456 },
  'manila': { lat: 14.5995, lng: 120.9842 },
  'uae': { lat: 23.4241, lng: 53.8478 },
  'vietnam': { lat: 14.0583, lng: 108.2772 },
  'nigeria': { lat: 9.082, lng: 8.6753 },
  'egypt': { lat: 26.8206, lng: 30.8025 },
  'saudi arabia': { lat: 23.8859, lng: 45.0792 },
  'south africa': { lat: -30.5595, lng: 22.9375 },
  'russia': { lat: 61.524, lng: 105.3188 },
  'south korea': { lat: 35.9078, lng: 127.7669 },
  'turkey': { lat: 38.9637, lng: 35.2433 },
  'colombia': { lat: 4.5709, lng: -74.2973 },
  'thailand': { lat: 15.87, lng: 100.9925 },
  'malaysia': { lat: 4.2105, lng: 101.9758 },
  'new zealand': { lat: -40.9006, lng: 174.886 },
  'liverpool': { lat: 53.4084, lng: -2.9916 },
  'manchester': { lat: 53.4808, lng: -2.2426 },
  'birmingham': { lat: 52.4862, lng: -1.8904 },
}

export function findLocationCoordinates(name: string): { lat: number; lng: number } | null {
  const normalizedName = name.toLowerCase().trim()

  if (LOCATION_COORDINATES[normalizedName]) {
    return LOCATION_COORDINATES[normalizedName]
  }

  const commonMaps: Record<string, string> = {
    emirates: 'uae',
    'united arab emirates': 'uae',
    'kingdom of saudi arabia': 'saudi arabia',
    'republic of korea': 'south korea',
    'korea, south': 'south korea',
    british: 'united kingdom',
    england: 'united kingdom',
  }

  const mapped = commonMaps[normalizedName]
  if (mapped && LOCATION_COORDINATES[mapped]) {
    return LOCATION_COORDINATES[mapped]
  }

  for (const [key, coords] of Object.entries(LOCATION_COORDINATES)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return coords
    }
  }

  return null
}
