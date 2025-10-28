"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CalendarHeaderProps {
  currentDate: Date
  viewMode: "month" | "week"
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  onViewChange: (mode: "month" | "week") => void
  onGoToDate: (date: Date) => void
}

export function CalendarHeader({
  currentDate,
  viewMode,
  onPrevious,
  onNext,
  onToday,
  onViewChange,
  onGoToDate,
}: CalendarHeaderProps) {
  const monthYear = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  const [dateText, setDateText] = useState("")
  const [hasError, setHasError] = useState(false)

  const tryGo = () => {
    if (!dateText.trim()) return
    // Support YYYY-MM-DD or free-typed DD/MM/YYYY / MM/DD/YYYY
    const cleaned = dateText.trim().replace(/\./g, "/").replace(/-/g, "/")
    let y = 0, m = 0, d = 0
    if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(cleaned)) {
      const [yy, mm, dd] = cleaned.split("/").map(Number)
      y = yy; m = mm; d = dd
    } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleaned)) {
      const [a, b, yy] = cleaned.split("/").map(Number)
      // Heuristic: if first part > 12, treat as DD/MM/YYYY else MM/DD/YYYY
      if (a > 12) { d = a; m = b; y = yy } else { m = a; d = b; y = yy }
    } else {
      // Fallback to Date.parse
      const parsed = new Date(dateText)
      if (!isNaN(parsed.getTime())) {
        setHasError(false)
        onGoToDate(parsed)
        return
      }
      setHasError(true)
      return
    }

    const candidate = new Date(y, m - 1, d)
    if (!isNaN(candidate.getTime())) {
      setHasError(false)
      onGoToDate(candidate)
    } else {
      setHasError(true)
    }
  }

  return (
    <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPrevious}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onToday}>
          Today
        </Button>
        <Button variant="outline" size="sm" onClick={onNext}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <h1 className="text-2xl font-bold text-center flex-1">{monthYear}</h1>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Go to date (YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY)"
            value={dateText}
            onChange={(e) => setDateText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") tryGo()
            }}
            className={hasError ? "border-destructive" : ""}
          />
          <Button size="sm" variant="outline" onClick={tryGo}>Go</Button>
        </div>
        <div className="flex gap-2">
          <Button variant={viewMode === "month" ? "default" : "outline"} size="sm" onClick={() => onViewChange("month")}>
            Month
          </Button>
          <Button variant={viewMode === "week" ? "default" : "outline"} size="sm" onClick={() => onViewChange("week")}>
            Week
          </Button>
        </div>
      </div>
    </div>
  )
}
