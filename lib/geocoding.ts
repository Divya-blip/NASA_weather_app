// Geocoding utilities for location search and reverse geocoding
// Uses OpenStreetMap Nominatim API for free, reliable geocoding

export interface GeocodingResult {
  display_name: string
  lat: string
  lon: string
  place_id: string
  type: string
  importance: number
}

export interface Location {
  name: string
  lat: number
  lon: number
}

/**
 * Search for locations by query string
 */
export async function searchLocations(query: string, limit = 5): Promise<Location[]> {
  if (!query.trim()) return []

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search")
    url.searchParams.append("format", "json")
    url.searchParams.append("q", query)
    url.searchParams.append("limit", limit.toString())
    url.searchParams.append("addressdetails", "1")

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "WeatherCheck-App/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.statusText}`)
    }

    const results: GeocodingResult[] = await response.json()

    return results.map((result) => ({
      name: result.display_name,
      lat: Number.parseFloat(result.lat),
      lon: Number.parseFloat(result.lon),
    }))
  } catch (error) {
    console.error("Error searching locations:", error)
    return []
  }
}

/**
 * Reverse geocode coordinates to get location name
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse")
    url.searchParams.append("format", "json")
    url.searchParams.append("lat", lat.toString())
    url.searchParams.append("lon", lon.toString())
    url.searchParams.append("zoom", "10")
    url.searchParams.append("addressdetails", "1")

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "WeatherCheck-App/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`Reverse geocoding error: ${response.statusText}`)
    }

    const result = await response.json()
    return result.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`
  } catch (error) {
    console.error("Error reverse geocoding:", error)
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`
  }
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(lat: number, lon: number): boolean {
  return (
    typeof lat === "number" &&
    typeof lon === "number" &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180 &&
    !isNaN(lat) &&
    !isNaN(lon)
  )
}

/**
 * Calculate distance between two points using Haversine formula
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}
