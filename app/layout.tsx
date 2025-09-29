import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "WeatherCheck - Interactive Weather Planning",
  description:
    "Plan your outdoor events with interactive maps, real geocoding, and weather insights. Click anywhere on the map to get location-based weather forecasts.",
  keywords: ["weather", "planning", "outdoor events", "interactive map", "geocoding", "calendar"],
  authors: [{ name: "WeatherCheck Team" }],
  creator: "WeatherCheck",
  publisher: "WeatherCheck",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://weathercheck.app",
    title: "WeatherCheck - Interactive Weather Planning",
    description: "Plan your outdoor events with interactive maps and weather insights",
    siteName: "WeatherCheck",
  },
  twitter: {
    card: "summary_large_image",
    title: "WeatherCheck - Interactive Weather Planning",
    description: "Plan your outdoor events with interactive maps and weather insights",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
