import { type NextRequest, NextResponse } from "next/server"

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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")
  const date = searchParams.get("date")
  const location = searchParams.get("location")

  if (!lat || !lon || !date || !location) {
    return NextResponse.json({ error: "Missing required parameters: lat, lon, date, location" }, { status: 400 })
  }

  const latitude = Number.parseFloat(lat)
  const longitude = Number.parseFloat(lon)
  const requestDate = new Date(date)

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 })
  }

  try {
    const nasaData = await fetchNASAWeatherData(latitude, longitude, requestDate)
    if (nasaData) {
      const weatherData = convertNASAToWeatherData(nasaData, location, latitude, longitude, requestDate)
      return NextResponse.json(weatherData)
    }

    // Fallback to OpenWeather API if available
    const apiKey = process.env.OPENWEATHER_API_KEY
    if (apiKey) {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`,
          { next: { revalidate: 300 } },
        )

        if (response.ok) {
          const data = await response.json()
          const weatherData: WeatherData = {
            temperature: Math.round(data.main.temp),
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed),
            rainChance: data.rain ? Math.min(100, (data.rain["1h"] || 0) * 100) : 0,
            conditions: mapOpenWeatherCondition(data.weather[0].main),
            location,
            coordinates: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            date: requestDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            metadata: {
              source: "OpenWeather",
              dataDate: new Date().toISOString(),
              units: {
                temperature: "°F",
                humidity: "%",
                windSpeed: "mph",
                precipitation: "mm",
                pressure: "hPa",
                solarIrradiance: "kW-h/m²/day",
              },
              sourceLinks: ["https://openweathermap.org/api"],
            },
          }
          return NextResponse.json(weatherData)
        }
      } catch (error) {
        console.error("Error fetching OpenWeather data:", error)
      }
    }

    // Final fallback to mock data
    const mockData = generateMockWeatherData(latitude, longitude, requestDate, location)
    return NextResponse.json(mockData)
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}

async function fetchNASAWeatherData(lat: number, lon: number, date: Date): Promise<any | null> {
  try {
    // Format date for NASA API (YYYYMMDD)
    const startDate = formatDateForNASA(date)
    const endDate = startDate // Single day request

    // NASA POWER API parameters for weather prediction
    const parameters = [
      "T2M", // Temperature at 2 Meters
      "RH2M", // Relative Humidity at 2 Meters
      "WS10M", // Wind Speed at 10 Meters
      "PRECTOTCORR", // Precipitation Corrected
      "ALLSKY_SFC_SW_DWN", // Solar Irradiance
      "PS", // Surface Pressure
    ].join(",")

    const nasaUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${parameters}&community=AG&longitude=${lon}&latitude=${lat}&start=${startDate}&end=${endDate}&format=JSON`

    console.log("[v0] Fetching NASA POWER data from:", nasaUrl)

    const response = await fetch(nasaUrl, {
      headers: {
        "User-Agent": "WeatherCheck-App/1.0",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      console.error("[v0] NASA API response not ok:", response.status, response.statusText)
      return null
    }

    const data = await response.json()
    console.log("[v0] NASA API response received:", Object.keys(data))

    return data
  } catch (error) {
    console.error("[v0] Error fetching NASA POWER data:", error)
    return null
  }
}

function convertNASAToWeatherData(nasaData: any, location: string, lat: number, lon: number, date: Date): WeatherData {
  const properties = nasaData.properties
  const parameter = properties.parameter

  // Get the date key (should be the requested date)
  const dateKey = formatDateForNASA(date)

  // Extract NASA parameters for the specific date
  const t2m = parameter.T2M?.[dateKey] || 20 // Temperature in Celsius
  const rh2m = parameter.RH2M?.[dateKey] || 50 // Relative Humidity %
  const ws10m = parameter.WS10M?.[dateKey] || 5 // Wind Speed m/s
  const prectot = parameter.PRECTOTCORR?.[dateKey] || 0 // Precipitation mm/day
  const solar = parameter.ALLSKY_SFC_SW_DWN?.[dateKey] || 5 // Solar irradiance
  const pressure = parameter.PS?.[dateKey] || 101.3 // Surface pressure kPa

  // Convert to our standard units
  const temperature = Math.round((t2m * 9) / 5 + 32) // Convert C to F
  const windSpeedMph = Math.round(ws10m * 2.237) // Convert m/s to mph
  const rainChance = Math.min(100, Math.max(0, prectot * 10)) // Rough conversion from mm to %

  // Determine conditions based on precipitation and solar irradiance
  let conditions: "sunny" | "cloudy" | "rainy"
  if (prectot > 2) {
    conditions = "rainy"
  } else if (solar < 3) {
    conditions = "cloudy"
  } else {
    conditions = "sunny"
  }

  return {
    temperature,
    humidity: Math.round(rh2m),
    windSpeed: windSpeedMph,
    rainChance: Math.round(rainChance),
    conditions,
    location,
    coordinates: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
    date: date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    nasaData: {
      T2M: t2m,
      RH2M: rh2m,
      WS10M: ws10m,
      PRECTOTCORR: prectot,
      ALLSKY_SFC_SW_DWN: solar,
      PS: pressure,
    },
    metadata: {
      source: "NASA_POWER",
      apiVersion: "v1",
      dataDate: new Date().toISOString(),
      units: {
        temperature: "°F (converted from °C)",
        humidity: "%",
        windSpeed: "mph (converted from m/s)",
        precipitation: "mm/day",
        pressure: "kPa",
        solarIrradiance: "kW-h/m²/day",
      },
      sourceLinks: [
        "https://power.larc.nasa.gov/",
        "https://power.larc.nasa.gov/docs/services/api/temporal/daily/",
        `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,RH2M,WS10M,PRECTOTCORR,ALLSKY_SFC_SW_DWN,PS&community=AG&longitude=${lon}&latitude=${lat}&start=${dateKey}&end=${dateKey}&format=JSON`,
      ],
    },
  }
}

function formatDateForNASA(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}${month}${day}`
}

function generateMockWeatherData(lat: number, lon: number, date: Date, location: string): WeatherData {
  const latFactor = Math.abs(lat) / 90
  const seasonFactor = Math.cos(((date.getMonth() - 6) * Math.PI) / 6)

  const baseTemp = 80 - latFactor * 40 + seasonFactor * 20
  const temp = Math.floor(baseTemp + Math.random() * 20 - 10)

  const humidity = Math.floor(Math.random() * 40) + 40
  const windSpeed = Math.floor(Math.random() * 15) + 5
  const rainChance = Math.floor(Math.random() * 100)

  const conditions = rainChance > 70 ? "rainy" : rainChance > 40 ? "cloudy" : "sunny"

  return {
    temperature: Math.max(20, Math.min(100, temp)),
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

function mapOpenWeatherCondition(condition: string): "sunny" | "cloudy" | "rainy" {
  switch (condition.toLowerCase()) {
    case "clear":
      return "sunny"
    case "clouds":
      return "cloudy"
    case "rain":
    case "drizzle":
    case "thunderstorm":
      return "rainy"
    default:
      return "cloudy"
  }
}
