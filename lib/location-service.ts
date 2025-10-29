// Location services using Nominatim (free OpenStreetMap geocoding)
export interface LocationCoordinates {
  lat: number
  lng: number
  address: string
}

export interface GeocodingResult {
  lat: string
  lon: string
  display_name: string
}

export async function geocodeAddress(address: string): Promise<LocationCoordinates | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + ", Mumbai, India")}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'NoRide/1.0'
        }
      }
    )

    if (!response.ok) {
      console.error("Geocoding API error:", response.status)
      return null
    }

    const data: GeocodingResult[] = await response.json()

    if (data.length === 0) {
      return null
    }

    const result = data[0]
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name
    }
  } catch (error) {
    console.error("Error geocoding address:", error)
    return null
  }
}

export async function searchLocations(query: string): Promise<LocationCoordinates[]> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ", Mumbai, India")}&format=json&limit=5&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'NoRide/1.0'
        }
      }
    )

    if (!response.ok) {
      console.error("Location search API error:", response.status)
      return []
    }

    const data: GeocodingResult[] = await response.json()

    return data.map(result => ({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name
    }))
  } catch (error) {
    console.error("Error searching locations:", error)
    return []
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          'User-Agent': 'NoRide/1.0'
        }
      }
    )

    if (!response.ok) {
      console.error("Reverse geocoding API error:", response.status)
      return null
    }

    const data = await response.json()
    return data.display_name || null
  } catch (error) {
    console.error("Error reverse geocoding:", error)
    return null
  }
}

export function validateVehicleNumber(vehicleNumber: string): boolean {
  const cleaned = vehicleNumber.replace(/\s/g, "").toUpperCase()
  const pattern = /^MH\d{2}[A-Z]{2}\d{4}$/
  return pattern.test(cleaned)
}

export function extractRTOCode(vehicleNumber: string): string {
  const cleaned = vehicleNumber.replace(/\s/g, "").toUpperCase()
  return cleaned.substring(0, 5)
}

// IP-based geolocation using ipapi.co (free tier: 30k req/month)
export interface IPGeolocationResult {
  ip: string
  city: string
  region: string
  country: string
  country_code: string
  latitude: number
  longitude: number
  timezone: string
  isp: string
}

export async function getIPGeolocation(): Promise<IPGeolocationResult | null> {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NoRide/1.0'
      }
    })

    if (!response.ok) {
      console.error("IP geolocation API error:", response.status)
      return null
    }

    const data: IPGeolocationResult = await response.json()

    // Check if we got valid coordinates
    if (data.latitude && data.longitude) {
      return data
    }

    return null
  } catch (error) {
    console.error("Error getting IP geolocation:", error)
    return null
  }
}

// Get current location with fallback to IP geolocation
export async function getCurrentLocation(): Promise<LocationCoordinates | null> {
  // First try browser geolocation
  if (navigator.geolocation) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        })
      })

      const address = await reverseGeocode(position.coords.latitude, position.coords.longitude)
      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        address: address || `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
      }
    } catch (error) {
      console.log("Browser geolocation failed, falling back to IP geolocation:", error)
    }
  }

  // Fallback to IP geolocation
  const ipLocation = await getIPGeolocation()
  if (ipLocation) {
    return {
      lat: ipLocation.latitude,
      lng: ipLocation.longitude,
      address: `${ipLocation.city}, ${ipLocation.region}, ${ipLocation.country}`
    }
  }

  return null
}
