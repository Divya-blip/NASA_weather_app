"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Thermometer,
  Droplets,
  ArrowLeft,
  MapPin,
  CalendarIcon,
  Umbrella,
  CheckCircle,
  AlertTriangle,
  Download,
  FileText,
  Database,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { generateRainfallTrend, downloadWeatherData } from "@/lib/weather-api"
import type { WeatherData } from "@/lib/weather-api"

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [rainfallData, setRainfallData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    const location = searchParams.get("location")
    const lat = searchParams.get("lat")
    const lon = searchParams.get("lon")
    const dateStr = searchParams.get("date")

    if (location && lat && lon && dateStr) {
      fetchWeatherData(location, lat, lon, dateStr)
    } else {
      setError("Missing required parameters")
      setLoading(false)
    }
  }, [searchParams.get("location"), searchParams.get("lat"), searchParams.get("lon"), searchParams.get("date")])

  const fetchWeatherData = async (location: string, lat: string, lon: string, dateStr: string) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        location,
        lat,
        lon,
        date: dateStr,
      })

      const response = await fetch(`/api/weather?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setWeatherData(data)
      setRainfallData(generateRainfallTrend())

      console.log("[v0] Weather data loaded:", data)
    } catch (error) {
      console.error("Error fetching weather data:", error)
      setError(error instanceof Error ? error.message : "Failed to load weather data")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (format: "csv" | "json") => {
    if (!weatherData) return

    try {
      setDownloading(format)
      await downloadWeatherData(weatherData, format)
    } catch (error) {
      console.error(`Failed to download ${format}:`, error)
      alert(`Failed to download ${format} file. Please try again.`)
    } finally {
      setDownloading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <Cloud className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading weather data...</p>
        </div>
      </div>
    )
  }

  if (error || !weatherData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg text-muted-foreground mb-4">{error || "Failed to load weather data"}</p>
          <Button onClick={() => router.push("/plan")}>Try Again</Button>
        </div>
      </div>
    )
  }

  const getWeatherIcon = (conditions: string) => {
    switch (conditions) {
      case "sunny":
        return <Sun className="h-8 w-8 text-yellow-500" />
      case "cloudy":
        return <Cloud className="h-8 w-8 text-gray-500" />
      case "rainy":
        return <CloudRain className="h-8 w-8 text-blue-500" />
      default:
        return <Sun className="h-8 w-8 text-yellow-500" />
    }
  }

  const getRecommendation = (data: WeatherData) => {
    if (data.rainChance > 70) {
      return {
        icon: <Umbrella className="h-5 w-5 text-blue-500" />,
        title: "Bring an Umbrella",
        message: "High chance of rain. Consider indoor alternatives or waterproof gear.",
        type: "warning",
      }
    } else if (data.temperature > 75 && data.humidity > 70) {
      return {
        icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
        title: "Hot and Humid",
        message: "Too hot and humid for extended outdoor activities. Plan for shade and hydration.",
        type: "caution",
      }
    } else {
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        title: "Great Day for Outdoor Activities",
        message: "Perfect weather conditions for your outdoor event!",
        type: "success",
      }
    }
  }

  const recommendation = getRecommendation(weatherData)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/plan")} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Cloud className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold text-foreground">WeatherCheck</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Location and Date Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-balance mb-4">Weather Forecast</h1>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="text-sm sm:text-base">{weatherData.location}</span>
              </div>
              <div className="flex items-center gap-1 text-xs sm:text-sm">
                <span className="opacity-75">({weatherData.coordinates})</span>
              </div>
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span className="text-sm sm:text-base">{weatherData.date}</span>
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="text-xs">
                <Database className="h-3 w-3 mr-1" />
                Data Source: {weatherData.metadata.source}
              </Badge>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Weather Summary Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getWeatherIcon(weatherData.conditions)}
                  Weather Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-5 w-5 text-red-500" />
                        <span className="font-medium">Temperature</span>
                      </div>
                      <span className="text-2xl font-bold">{weatherData.temperature}°F</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CloudRain className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">Rain Chance</span>
                      </div>
                      <span className="text-2xl font-bold">{weatherData.rainChance}%</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-5 w-5 text-blue-400" />
                        <span className="font-medium">Humidity</span>
                      </div>
                      <span className="text-2xl font-bold">{weatherData.humidity}%</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Wind className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">Wind Speed</span>
                      </div>
                      <span className="text-2xl font-bold">{weatherData.windSpeed} mph</span>
                    </div>
                  </div>
                </div>

                {weatherData.nasaData && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      NASA POWER Data Details
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-secondary/20 p-3 rounded">
                        <div className="font-medium">Temperature</div>
                        <div className="text-muted-foreground">{weatherData.nasaData.T2M.toFixed(1)}°C</div>
                      </div>
                      <div className="bg-secondary/20 p-3 rounded">
                        <div className="font-medium">Precipitation</div>
                        <div className="text-muted-foreground">
                          {weatherData.nasaData.PRECTOTCORR.toFixed(2)} mm/day
                        </div>
                      </div>
                      <div className="bg-secondary/20 p-3 rounded">
                        <div className="font-medium">Solar Irradiance</div>
                        <div className="text-muted-foreground">
                          {weatherData.nasaData.ALLSKY_SFC_SW_DWN.toFixed(2)} kW-h/m²/day
                        </div>
                      </div>
                      <div className="bg-secondary/20 p-3 rounded">
                        <div className="font-medium">Surface Pressure</div>
                        <div className="text-muted-foreground">{weatherData.nasaData.PS.toFixed(1)} kPa</div>
                      </div>
                      <div className="bg-secondary/20 p-3 rounded">
                        <div className="font-medium">Wind Speed</div>
                        <div className="text-muted-foreground">{weatherData.nasaData.WS10M.toFixed(1)} m/s</div>
                      </div>
                      <div className="bg-secondary/20 p-3 rounded">
                        <div className="font-medium">Humidity</div>
                        <div className="text-muted-foreground">{weatherData.nasaData.RH2M.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendation Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {recommendation.icon}
                  Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Badge
                    variant={
                      recommendation.type === "success"
                        ? "default"
                        : recommendation.type === "warning"
                          ? "destructive"
                          : "secondary"
                    }
                    className="w-fit"
                  >
                    {recommendation.title}
                  </Badge>
                  <p className="text-sm text-muted-foreground leading-relaxed">{recommendation.message}</p>

                  {/* Additional Tips */}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Tips:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {weatherData.rainChance > 50 && <li>• Check hourly forecast for rain timing</li>}
                      {weatherData.temperature > 75 && <li>• Stay hydrated and seek shade</li>}
                      {weatherData.windSpeed > 15 && <li>• Secure loose items and decorations</li>}
                      <li>• Have a backup indoor plan ready</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Download Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Weather Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Download the complete weather data including metadata, units, and source links for external use.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="outline"
                    onClick={() => handleDownload("csv")}
                    disabled={downloading === "csv"}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    {downloading === "csv" ? "Downloading..." : "Download CSV"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDownload("json")}
                    disabled={downloading === "json"}
                    className="flex items-center gap-2"
                  >
                    <Database className="h-4 w-4" />
                    {downloading === "json" ? "Downloading..." : "Download JSON"}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• CSV format: Spreadsheet-compatible with all data fields</p>
                  <p>• JSON format: Complete structured data with metadata</p>
                  <p>• Includes source links and unit information</p>
                  {weatherData.metadata.source === "NASA_POWER" && (
                    <p>• Contains raw NASA POWER API data for research use</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rainfall Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>7-Day Rainfall Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rainfallData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis label={{ value: "Rainfall (inches)", angle: -90, position: "insideLeft" }} />
                    <Tooltip
                      formatter={(value: any) => [`${value.toFixed(2)} inches`, "Rainfall"]}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rainfall"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button variant="outline" onClick={() => router.push("/plan")}>
              Check Another Location
            </Button>
            <Button onClick={() => router.push("/")}>Start Over</Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center">
          <div className="text-center">
            <Cloud className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-lg text-muted-foreground">Loading weather data...</p>
          </div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  )
}
