"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, Search, Maximize2, Minimize2 } from "lucide-react"

interface Location {
  name: string
  lat: number
  lon: number
}

interface InteractiveMapProps {
  onLocationSelect: (location: Location) => void
  selectedLocation: Location | null
}

export function InteractiveMap({ onLocationSelect, selectedLocation }: InteractiveMapProps) {
  const [isMapReady, setIsMapReady] = useState(false)
  const [map, setMap] = useState<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const markerRef = useRef<any>(null)

  useEffect(() => {
    // Load Leaflet via script tags for better compatibility
    const loadLeaflet = async () => {
      if (typeof window === "undefined") return

      // Check if Leaflet is already loaded
      if ((window as any).L) {
        initializeMap()
        return
      }

      // Load Leaflet CSS
      const cssLink = document.createElement("link")
      cssLink.rel = "stylesheet"
      cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(cssLink)

      // Load Leaflet JS
      const script = document.createElement("script")
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      script.onload = () => {
        initializeMap()
      }
      document.head.appendChild(script)
    }

    const initializeMap = () => {
      const L = (window as any).L
      if (!L) return

      // Fix marker icons
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      const mapContainer = document.getElementById("leaflet-map")
      if (!mapContainer || map) return

      const newMap = L.map("leaflet-map").setView([40.7128, -74.006], 10)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(newMap)

      const updateMarker = (lat: number, lon: number) => {
        // Remove existing marker
        if (markerRef.current) {
          newMap.removeLayer(markerRef.current)
        }

        // Add new marker
        const newMarker = L.marker([lat, lon]).addTo(newMap)
        markerRef.current = newMarker
        return newMarker
      }

      newMap.on("click", async (e: any) => {
        const { lat, lng } = e.latlng

        console.log("[v0] Location selected:", { name: "Clicked location", lat, lon: lng })

        try {
          // Reverse geocoding using Nominatim API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
          )
          const data = await response.json()

          const locationName = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`

          const location: Location = {
            name: locationName,
            lat: lat,
            lon: lng,
          }

          updateMarker(lat, lng)
          onLocationSelect(location)
        } catch (error) {
          console.error("Geocoding error:", error)
          // Fallback to coordinates
          const location: Location = {
            name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            lat: lat,
            lon: lng,
          }
          updateMarker(lat, lng)
          onLocationSelect(location)
        }
      })

      setMap(newMap)
      setIsMapReady(true)
    }

    loadLeaflet()

    return () => {
      if (map) {
        map.remove()
        setMap(null)
        markerRef.current = null
      }
    }
  }, []) // Removed all dependencies to prevent infinite loops

  useEffect(() => {
    if (map && selectedLocation && isMapReady) {
      const L = (window as any).L
      if (!L) return

      // Remove existing marker
      if (markerRef.current) {
        map.removeLayer(markerRef.current)
      }

      // Add new marker for selected location
      const newMarker = L.marker([selectedLocation.lat, selectedLocation.lon]).addTo(map)
      markerRef.current = newMarker

      // Pan to the selected location
      map.setView([selectedLocation.lat, selectedLocation.lon], 12)
    }
  }, [map, selectedLocation, isMapReady]) // Safe dependencies that won't cause loops

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim() || !map || isSearching) return

    setIsSearching(true)
    try {
      // Use Nominatim API for geocoding search
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1`,
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const result = data[0]
        const lat = Number.parseFloat(result.lat)
        const lon = Number.parseFloat(result.lon)

        // Pan and zoom to the searched location
        map.setView([lat, lon], 12)

        const location: Location = {
          name: result.display_name,
          lat: lat,
          lon: lon,
        }

        const L = (window as any).L
        if (L) {
          // Remove existing marker
          if (markerRef.current) {
            map.removeLayer(markerRef.current)
          }
          // Add new marker
          const newMarker = L.marker([lat, lon]).addTo(map)
          markerRef.current = newMarker
        }

        onLocationSelect(location)
        setSearchQuery("") // Clear search after successful search
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    // Trigger map resize after fullscreen toggle
    setTimeout(() => {
      if (map) {
        map.invalidateSize()
      }
    }, 100)
  }

  const mapContainerClass = isFullscreen ? "fixed inset-0 z-50 bg-background" : "relative"

  const mapClass = isFullscreen ? "h-screen w-full" : "h-64 w-full rounded-lg border-2 border-border"

  return (
    <Card className={isFullscreen ? "fixed inset-0 z-50 rounded-none border-none" : "p-6"}>
      <div className={isFullscreen ? "p-6 h-full flex flex-col" : ""}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Choose Location
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="flex items-center gap-2 bg-transparent"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-4 w-4" />
                Exit Fullscreen
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4" />
                Fullscreen
              </>
            )}
          </Button>
        </div>

        <form onSubmit={handleSearch} className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for a country, city, or place..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-20"
            disabled={isSearching}
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2"
            disabled={!searchQuery.trim() || isSearching}
          >
            {isSearching ? "..." : "Search"}
          </Button>
        </form>

        {/* Selected location display */}
        {selectedLocation && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium">Selected Location:</p>
            <p className="text-sm text-muted-foreground">{selectedLocation.name}</p>
            <p className="text-xs text-muted-foreground">
              Coordinates: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
            </p>
          </div>
        )}

        {/* Interactive Leaflet Map */}
        <div className={mapContainerClass}>
          <div className={isFullscreen ? "flex-1 relative" : "relative"}>
            <div id="leaflet-map" className={mapClass} style={{ minHeight: isFullscreen ? "100%" : "256px" }} />
            {!isMapReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-secondary/30 rounded-lg">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground">Loading map...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {!isFullscreen && (
          <p className="text-sm text-muted-foreground mt-2">
            Search for a location or click anywhere on the map to select it
          </p>
        )}
      </div>
    </Card>
  )
}
