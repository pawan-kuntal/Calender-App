"use client"

import type React from "react"

import type { CalendarEvent } from "@/lib/types"
import { getWeekDays, getEventsForDateRange, formatTime, getEventDuration } from "@/lib/calendar-utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useEffect, useRef } from "react"

interface WeekViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onTimeSlotClick: (date: Date) => void
  onEventDragStart: (event: CalendarEvent) => void
  onEventDragEnd: () => void
  onDropOnDate: (date: Date) => void
  draggedEvent?: CalendarEvent
  focusedDate?: Date
  hoveredDate?: Date
  onHoverDate?: (date?: Date) => void
}

export function WeekView({
  currentDate,
  events,
  onEventClick,
  onTimeSlotClick,
  onEventDragStart,
  onEventDragEnd,
  onDropOnDate,
  draggedEvent,
  focusedDate,
  hoveredDate,
  onHoverDate,
}: WeekViewProps) {
  const weekDays = getWeekDays(currentDate)
  const weekEvents = getEventsForDateRange(events, weekDays[0], weekDays[6])

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const getEventsForTimeSlot = (dayIndex: number, hour: number) => {
    const dayStart = new Date(weekDays[dayIndex])
    dayStart.setHours(hour, 0, 0, 0)
    const dayEnd = new Date(dayStart)
    dayEnd.setHours(hour + 1, 0, 0, 0)

    return weekEvents.filter((event) => {
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)
      return eventStart < dayEnd && eventEnd > dayStart
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const focusRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (focusRef.current) {
      focusRef.current.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
    }
  }, [focusedDate, hoveredDate, currentDate])

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-max">
        {/* Header with day labels */}
        <div className="flex border-b border-border">
          <div className="w-20 flex-shrink-0"></div>
          {weekDays.map((day, idx) => (
            <div key={idx} className="flex-1 min-w-32 p-4 text-center border-r border-border">
              <div className="font-semibold">{dayLabels[idx]}</div>
              <div className="text-sm text-muted-foreground">{day.getDate()}</div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        {hours.map((hour) => (
          <div key={hour} className="flex border-b border-border">
            <div className="w-20 flex-shrink-0 p-2 text-xs text-muted-foreground border-r border-border">
              {String(hour).padStart(2, "0")}:00
            </div>
            {weekDays.map((day, dayIdx) => {
              const slotDate = new Date(day)
              slotDate.setHours(hour, 0, 0, 0)
              const label = `${slotDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })} ${String(hour).padStart(2, "0")}:00`
              const isFocused = !!focusedDate &&
                slotDate.toDateString() === new Date(focusedDate).toDateString() &&
                slotDate.getHours() === new Date(focusedDate).getHours()
              const isHovered = !!hoveredDate &&
                slotDate.toDateString() === new Date(hoveredDate).toDateString() &&
                slotDate.getHours() === new Date(hoveredDate).getHours()

              const slot = (
                <div
                  key={`${hour}-${dayIdx}`}
                  onClick={() => {
                    const clickDate = new Date(day)
                    clickDate.setHours(hour, 0, 0, 0)
                    onTimeSlotClick(clickDate)
                    onHoverDate && onHoverDate(clickDate)
                  }}
                  onMouseEnter={() => {
                    const hoverDate = new Date(day)
                    hoverDate.setHours(hour, 0, 0, 0)
                    onHoverDate && onHoverDate(hoverDate)
                  }}
                  onMouseLeave={() => onHoverDate && onHoverDate(undefined)}
                  onDragOver={handleDragOver}
                  onDrop={() => {
                    const dropDate = new Date(day)
                    dropDate.setHours(hour, 0, 0, 0)
                    onDropOnDate(dropDate)
                  }}
                  ref={isFocused || isHovered ? focusRef : undefined}
                  className={`flex-1 min-w-32 h-16 border-r border-border hover:bg-muted/50 cursor-pointer relative ${isFocused ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""} ${isHovered ? "outline outline-2 outline-accent outline-offset-2" : ""}`}
                >
                  {getEventsForTimeSlot(dayIdx, hour).map((event) => (
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
                      className={`absolute left-1 right-1 top-1 px-2 py-1 rounded text-xs text-white font-semibold truncate hover:opacity-90 cursor-grab active:cursor-grabbing ${
                        draggedEvent?.id === event.id ? "opacity-50" : ""
                      }`}
                      style={{
                        backgroundColor: event.color,
                        height: `${Math.max(getEventDuration(event.startDate, event.endDate) * 16, 24)}px`,
                      }}
                      title={`${event.title} - ${formatTime(event.startDate)} to ${formatTime(event.endDate)}`}
                    >
                      {event.title}
                    </button>
                  ))}
                </div>
              )

              return (
                <Tooltip key={`${hour}-${dayIdx}`}>
                  <TooltipTrigger asChild>{slot}</TooltipTrigger>
                  <TooltipContent>{label}</TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
