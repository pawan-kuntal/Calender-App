"use client"
import type { CalendarEvent } from "@/lib/types"
import type React from "react"
import { useEffect, useRef } from "react"

import { getMonthGrid, getEventsForDay } from "@/lib/calendar-utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onDayClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
  onEventDragStart: (event: CalendarEvent) => void
  onEventDragEnd: () => void
  onDropOnDate: (date: Date) => void
  draggedEvent?: CalendarEvent
  focusedDate?: Date
  hoveredDate?: Date
  onHoverDate?: (date?: Date) => void
}

export function MonthView({
  currentDate,
  events,
  onDayClick,
  onEventClick,
  onEventDragStart,
  onEventDragEnd,
  onDropOnDate,
  draggedEvent,
  focusedDate,
  hoveredDate,
  onHoverDate,
}: MonthViewProps) {
  const grid = getMonthGrid(currentDate)
  const today = new Date()
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const focusRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (focusRef.current) {
      focusRef.current.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
      focusRef.current.focus({ preventScroll: true })
    }
  }, [focusedDate, hoveredDate, currentDate])

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDays.map((day) => (
          <div key={day} className="text-center font-semibold text-sm py-2 text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map((week, weekIdx) =>
          week.map((day, dayIdx) => {
            const isCurrentMonth = day !== null
            const date = isCurrentMonth ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null
            const isToday = date?.toDateString() === today.toDateString()
            const dayEvents = date ? getEventsForDay(events, date) : []
            const hasMoreEvents = dayEvents.length > 3
            const dateLabel = date?.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "long", day: "numeric" })
            const isFocused = date && focusedDate && date.toDateString() === focusedDate.toDateString()
            const isHovered = date && hoveredDate && date.toDateString() === hoveredDate.toDateString()

            const cell = (
              <button
                key={`${weekIdx}-${dayIdx}`}
                onClick={() => date && onDayClick(date)}
                onDragOver={handleDragOver}
                onDrop={() => date && onDropOnDate(date)}
                onMouseEnter={() => onHoverDate && date && onHoverDate(date)}
                onMouseLeave={() => onHoverDate && onHoverDate(undefined)}
                onFocus={() => onHoverDate && date && onHoverDate(date)}
                onBlur={() => onHoverDate && onHoverDate(undefined)}
                ref={isFocused || isHovered ? focusRef : undefined}
                tabIndex={isFocused ? 0 : -1}
                className={`min-h-24 p-2 border rounded-lg transition-colors focus:outline-none ${
                  isCurrentMonth
                    ? isToday
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card hover:bg-muted border-border"
                    : "bg-muted text-muted-foreground border-border"
                } ${isFocused ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""} ${isHovered ? "outline outline-2 outline-accent outline-offset-2" : ""} ${draggedEvent ? "cursor-move" : ""}`}
              >
                <div className="text-sm font-semibold mb-1">{day}</div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(event)
                      }}
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation()
                        onEventDragStart(event)
                      }}
                      onDragEnd={onEventDragEnd}
                      className={`w-full text-xs px-1 py-0.5 rounded truncate text-white cursor-grab active:cursor-grabbing ${
                        draggedEvent?.id === event.id ? "opacity-50" : ""
                      }`}
                      style={{ backgroundColor: event.color }}
                      title={event.title}
                    >
                      {event.title}
                    </button>
                  ))}
                  {hasMoreEvents && (
                    <div className="text-xs text-muted-foreground px-1">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </button>
            )

            return date ? (
              <Tooltip key={`${weekIdx}-${dayIdx}`}>
                <TooltipTrigger asChild>
                  {cell}
                </TooltipTrigger>
                <TooltipContent>{dateLabel}</TooltipContent>
              </Tooltip>
            ) : (
              cell
            )
          }),
        )}
      </div>
    </div>
  )
}
