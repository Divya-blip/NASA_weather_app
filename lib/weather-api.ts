// Weather API utilities for real weather data integration
// Server-side only utilities to protect API keys

export interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  rainChance: number
  conditions: "sunny" | "cloudy" | "rainy"
  location: string
  coordinates: string
  date: string
  // NASA API specific data
  nasaData?: {
    T2M: number // Temperature at 2 Meters (°C)
    RH2M: number // Relative Humidity at 2 Meters (%)
    WS10M: number // Wind Speed at 10 Meters (m/s)
    PRECTOTCORR: number // Precipitation Corrected (mm/day)
    ALLSKY_SFC_SW_DWN: number // All Sky Surface Shortwave Downward Irradiance (kW-h/m^2/day)
    PS: number // Surface Pressure (kPa)
  }
  metadata: {
    source: "NASA_POWER" | "OpenWeather" | "Mock"
    apiVersion?: string
    dataDate: string
    units: {
      temperature: string
      humidity: string
      windSpeed: string
      precipitation: string
      pressure: string
      solarIrradiance: string
    }
    sourceLinks: string[]
  }
}

export interface WeatherForecast {
  current: WeatherData
  hourly: Array<{
    time: string
    temperature: number
    rainChance: number
    conditions: string
  }>
  daily: Array<{
    date: string
    high: number
    low: number
    rainChance: number
    conditions: string
  }>
}

export async function downloadWeatherData(weatherData: WeatherData, format: "csv" | "json"): Promise<void> {
  try {
    const response = await fetch("/api/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ weatherData, format }),
    })

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`)
    }

    // Create download link
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url

    // Get filename from response headers
    const contentDisposition = response.headers.get("Content-Disposition")
    const filename =
      contentDisposition?.match(/filename="(.+)"/)?.[1] ||
      `weather-data-${format}-${new Date().toISOString().split("T")[0]}.${format}`

    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Download error:", error)
    throw error
  }
}

/**
 * Generate realistic mock weather data based on coordinates and season
 * This is used as fallback when real API is not available
 */
export function generateMockWeatherData(lat: number, lon: number, date: Date, location: string): WeatherData {
  // Use coordinates to create realistic weather variations
  const latFactor = Math.abs(lat) / 90 // 0-1 based on distance from equator
  const seasonFactor = Math.cos(((date.getMonth() - 6) * Math.PI) / 6) // Seasonal variation

  // Temperature based on latitude and season
  const baseTemp = 80 - latFactor * 40 + seasonFactor * 20
  const temp = Math.floor(baseTemp + Math.random() * 20 - 10) // ±10°F variation

  const humidity = Math.floor(Math.random() * 40) + 40 // 40-80%
  const windSpeed = Math.floor(Math.random() * 15) + 5 // 5-20 mph
  const rainChance = Math.floor(Math.random() * 100)

  const conditions = rainChance > 70 ? "rainy" : rainChance > 40 ? "cloudy" : "sunny"

  return {
    temperature: Math.max(20, Math.min(100, temp)), // Keep within reasonable bounds
    humidity,
    windSpeed,
    rainChance,
    conditions,
    location,
    coordinates: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
    date: date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    metadata: {
      source: "Mock",
      dataDate: new Date().toISOString(),
      units: {
        temperature: "°F",
        humidity: "%",
        windSpeed: "mph",
        precipitation: "mm",
        pressure: "hPa",
        solarIrradiance: "kW-h/m²/day",
      },
      sourceLinks: ["Generated mock data for demonstration"],
    },
  }
}

/**
 * Generate rainfall trend data for charts
 */
export function generateRainfallTrend(days = 7): Array<{
  day: string
  rainfall: number
}> {
  return Array.from({ length: days }, (_, i) => ({
    day: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    rainfall: Math.random() * 2,
  }))
}
