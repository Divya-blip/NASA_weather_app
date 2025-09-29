"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

interface CalendarIntegrationProps {
  selectedDate: Date | undefined
  onDateSelect: (date: Date | undefined) => void
}

export function CalendarIntegration({ selectedDate, onDateSelect }: CalendarIntegrationProps) {
  const [dateInput, setDateInput] = useState("")

  const handleDateInputChange = (value: string) => {
    setDateInput(value)

    // Parse DD/MM/YYYY format
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    const match = value.match(dateRegex)

    if (match) {
      const [, day, month, year] = match
      const parsedDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))

      // Validate the date is valid and not in the past
      if (
        parsedDate instanceof Date &&
        !isNaN(parsedDate.getTime()) &&
        parsedDate >= new Date(new Date().setHours(0, 0, 0, 0))
      ) {
        onDateSelect(parsedDate)
      } else if (parsedDate < new Date(new Date().setHours(0, 0, 0, 0))) {
        // Date is in the past, clear selection
        onDateSelect(undefined)
      }
    } else {
      // Invalid format, clear selection
      onDateSelect(undefined)
    }
  }

  const setQuickDate = (daysFromNow: number) => {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    onDateSelect(date)
    setDateInput(format(date, "dd/MM/yyyy"))
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <CalendarIcon className="h-5 w-5 text-primary" />
        Select Date
      </h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Enter date (DD/MM/YYYY), e.g. 12/12/2025"
            value={dateInput}
            onChange={(e) => handleDateInputChange(e.target.value)}
            className="w-full"
          />
          {dateInput && !selectedDate && (
            <p className="text-xs text-destructive">Please enter a valid future date in DD/MM/YYYY format</p>
          )}
        </div>

        {selectedDate && (
          <div className="p-4 bg-secondary/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Selected Date:</p>
            <p className="font-medium">{format(selectedDate, "EEEE, MMMM do, yyyy")}</p>
          </div>
        )}
      </div>

      {/* Quick Date Options */}
      <div className="mt-6">
        <p className="text-sm font-medium mb-3">Quick Options:</p>
        <div className="grid grid-cols-2 gap-2">
    
          <Button variant="outline" size="sm" onClick={() => setQuickDate(1)}>
            Tomorrow
          </Button>
          <Button variant="outline" size="sm" onClick={() => setQuickDate(7)}>
            Next Week
          </Button>
          <Button variant="outline" size="sm" onClick={() => setQuickDate(30)}>
            Next Month
          </Button>
          <Button variant="outline" size="sm" onClick={() => setQuickDate(90)}>
            Next 3 Months
          </Button>
        </div>
      </div>
    </Card>
  )
}
