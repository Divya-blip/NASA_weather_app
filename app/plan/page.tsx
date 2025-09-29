"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Cloud, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { InteractiveMap } from "@/components/interactive-map"
import { CalendarIntegration } from "@/components/calendar-integration"

interface Location {
  name: string
  lat: number
  lon: number
}

export default function PlanPage() {
  const router = useRouter()
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    console.log("[v0] Location selected:", location)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      console.log("[v0] Date selected:", date.toISOString())
    }
  }

  const handleCheckConditions = () => {
    if (selectedLocation && selectedDate) {
      console.log("[v0] Checking conditions for:", {
        location: selectedLocation,
        date: selectedDate.toISOString(),
      })

      // Store the data and navigate to results
      const params = new URLSearchParams({
        location: selectedLocation.name,
        lat: selectedLocation.lat.toString(),
        lon: selectedLocation.lon.toString(),
        date: selectedDate.toISOString(),
      })
      router.push(`/results?${params.toString()}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="flex items-center gap-2">
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
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-balance mb-4">Plan Your Perfect Day</h1>
            <p className="text-lg text-muted-foreground">Click on the map to select a location and choose your date</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Interactive Map Section */}
            <InteractiveMap onLocationSelect={handleLocationSelect} selectedLocation={selectedLocation} />

            {/* Calendar Integration Section */}
            <CalendarIntegration selectedDate={selectedDate} onDateSelect={handleDateSelect} />
          </div>

          {/* Check Conditions Button */}
          <div className="text-center mt-8">
            <Button
              size="lg"
              onClick={handleCheckConditions}
              disabled={!selectedLocation || !selectedDate}
              className="text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:hover:shadow-lg"
            >
              <Cloud className="mr-2 h-5 w-5" />
              Check Conditions
            </Button>
            {(!selectedLocation || !selectedDate) && (
              <p className="text-sm text-muted-foreground mt-2">
                Please select a location on the map and choose a date
              </p>
            )}
            {selectedLocation && selectedDate && (
              <p className="text-sm text-primary mt-2">
                Ready to check weather for {selectedLocation.name} on {selectedDate.toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
