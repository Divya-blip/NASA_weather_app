// Google Calendar API integration utilities
// This file provides functions to interact with Google Calendar API

interface CalendarEvent {
  id: string
  summary: string
  start: {
    dateTime: string
    timeZone?: string
  }
  end: {
    dateTime: string
    timeZone?: string
  }
}

export class GoogleCalendarService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Check if Google Calendar API is configured
   */
  static isConfigured(): boolean {
    return !!(process.env.GOOGLE_CALENDAR_API_KEY || process.env.GOOGLE_CLIENT_ID)
  }

  /**
   * Get events for a specific date
   * Note: This requires proper OAuth setup for accessing user calendars
   */
  async getEventsForDate(date: Date, accessToken?: string): Promise<CalendarEvent[]> {
    if (!this.apiKey && !accessToken) {
      throw new Error("Google Calendar API key or access token required")
    }

    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    try {
      const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events")
      url.searchParams.append("timeMin", startOfDay.toISOString())
      url.searchParams.append("timeMax", endOfDay.toISOString())
      url.searchParams.append("singleEvents", "true")
      url.searchParams.append("orderBy", "startTime")

      const headers: HeadersInit = {}

      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`
      } else if (this.apiKey) {
        url.searchParams.append("key", this.apiKey)
      }

      const response = await fetch(url.toString(), { headers })

      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.items || []
    } catch (error) {
      console.error("Error fetching calendar events:", error)
      return []
    }
  }

  /**
   * Create a new calendar event
   */
  async createEvent(event: Partial<CalendarEvent>, accessToken: string): Promise<CalendarEvent | null> {
    if (!accessToken) {
      throw new Error("Access token required for creating events")
    }

    try {
      const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      })

      if (!response.ok) {
        throw new Error(`Failed to create event: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error creating calendar event:", error)
      return null
    }
  }
}

// Export a default instance if API key is available
export const googleCalendar = process.env.GOOGLE_CALENDAR_API_KEY
  ? new GoogleCalendarService(process.env.GOOGLE_CALENDAR_API_KEY)
  : null
