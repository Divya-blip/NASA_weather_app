"use client"

import { useEffect } from "react"

export function LeafletFix() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Fix for Leaflet marker icons
      const L = require("leaflet")

      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      })
    }
  }, [])

  return null
}
