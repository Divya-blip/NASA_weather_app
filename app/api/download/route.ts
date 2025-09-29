import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { weatherData, format } = body

    if (!weatherData || !format) {
      return NextResponse.json({ error: "Missing weatherData or format" }, { status: 400 })
    }

    if (format === "csv") {
      const csv = convertToCSV(weatherData)
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="weather-data-${weatherData.location.replace(/[^a-zA-Z0-9]/g, "-")}-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    } else if (format === "json") {
      const jsonData = JSON.stringify(weatherData, null, 2)
      return new NextResponse(jsonData, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="weather-data-${weatherData.location.replace(/[^a-zA-Z0-9]/g, "-")}-${new Date().toISOString().split("T")[0]}.json"`,
        },
      })
    } else {
      return NextResponse.json({ error: "Invalid format. Use 'csv' or 'json'" }, { status: 400 })
    }
  } catch (error) {
    console.error("Download API error:", error)
    return NextResponse.json({ error: "Failed to generate download" }, { status: 500 })
  }
}

function convertToCSV(weatherData: any): string {
  const headers = [
    "Location",
    "Coordinates",
    "Date",
    "Temperature",
    "Humidity",
    "Wind Speed",
    "Rain Chance",
    "Conditions",
    "Data Source",
    "Source Links",
    "Temperature Unit",
    "Humidity Unit",
    "Wind Speed Unit",
    "Data Retrieved",
  ]

  // Add NASA-specific headers if available
  if (weatherData.nasaData) {
    headers.push(
      "NASA Temperature (°C)",
      "NASA Humidity (%)",
      "NASA Wind Speed (m/s)",
      "NASA Precipitation (mm/day)",
      "NASA Solar Irradiance (kW-h/m²/day)",
      "NASA Surface Pressure (kPa)",
    )
  }

  const values = [
    weatherData.location,
    weatherData.coordinates,
    weatherData.date,
    weatherData.temperature,
    weatherData.humidity,
    weatherData.windSpeed,
    weatherData.rainChance,
    weatherData.conditions,
    weatherData.metadata.source,
    weatherData.metadata.sourceLinks.join("; "),
    weatherData.metadata.units.temperature,
    weatherData.metadata.units.humidity,
    weatherData.metadata.units.windSpeed,
    weatherData.metadata.dataDate,
  ]

  // Add NASA-specific values if available
  if (weatherData.nasaData) {
    values.push(
      weatherData.nasaData.T2M,
      weatherData.nasaData.RH2M,
      weatherData.nasaData.WS10M,
      weatherData.nasaData.PRECTOTCORR,
      weatherData.nasaData.ALLSKY_SFC_SW_DWN,
      weatherData.nasaData.PS,
    )
  }

  return [headers.join(","), values.map((v) => `"${v}"`).join(",")].join("\n")
}
