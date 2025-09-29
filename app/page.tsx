"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Cloud, Sun, CloudRain, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <Cloud className="h-8 w-8 text-primary" />
          <span className="text-xl font-semibold text-foreground">WeatherCheck</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-balance leading-tight">
              Will It Rain on My <span className="text-primary">Parade?</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Plan your outdoor event with NASA Earth data.
            </p>
          </div>

          {/* Weather Icons Animation */}
          <div className="flex items-center justify-center gap-8 py-8">
            <div className="animate-bounce delay-0">
              <Sun className="h-12 w-12 text-accent" />
            </div>
            <div className="animate-bounce delay-150">
              <Cloud className="h-12 w-12 text-primary" />
            </div>
            <div className="animate-bounce delay-300">
              <CloudRain className="h-12 w-12 text-chart-2" />
            </div>
          </div>

          {/* CTA Button */}
          <div className="space-y-4">
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => router.push("/plan")}
            >
              <MapPin className="mr-2 h-5 w-5" />
              Start Planning
            </Button>
            <p className="text-sm text-muted-foreground">Get weather insights for any location and date</p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="p-6 text-center space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Any Location</h3>
              <p className="text-sm text-muted-foreground">Search or pin any location worldwide for weather data</p>
            </Card>

            <Card className="p-6 text-center space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <Cloud className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold">NASA Data</h3>
              <p className="text-sm text-muted-foreground">Powered by reliable NASA Earth observation data</p>
            </Card>

            <Card className="p-6 text-center space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-chart-2/10 rounded-full flex items-center justify-center mx-auto">
                <Sun className="h-6 w-6 text-chart-2" />
              </div>
              <h3 className="font-semibold">Smart Insights</h3>
              <p className="text-sm text-muted-foreground">Get personalized recommendations for your outdoor plans</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
