"use client"

import { useState, useEffect } from "react"
import { useCalendar } from "@/hooks/use-calendar"
import { CalendarHeader } from "@/components/calendar-header"
import { MonthView } from "@/components/month-view"
import { WeekView } from "@/components/week-view"
import { EventModal } from "@/components/event-modal"
import type { CalendarEvent } from "@/lib/types"
import { Card } from "@/components/ui/card"

export default function Home() {
  const calendar = useCalendar()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | undefined>()
  const [focusedDate, setFocusedDate] = useState<Date | undefined>()
  const [hoveredDate, setHoveredDate] = useState<Date | undefined>()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return
      e.preventDefault()

      const mode = calendar.viewMode
      const base = new Date((hoveredDate ?? focusedDate ?? calendar.currentDate))

      if (mode === "month") {
        base.setHours(0, 0, 0, 0)
        if (e.key === "ArrowLeft") base.setDate(base.getDate() - 1)
        if (e.key === "ArrowRight") base.setDate(base.getDate() + 1)
        if (e.key === "ArrowUp") base.setDate(base.getDate() - 7)
        if (e.key === "ArrowDown") base.setDate(base.getDate() + 7)
      } else {
        // week view
        if (!hoveredDate) base.setHours(0, 0, 0, 0)
        if (e.key === "ArrowLeft") base.setDate(base.getDate() - 1)
        if (e.key === "ArrowRight") base.setDate(base.getDate() + 1)
        if (e.key === "ArrowUp") base.setHours(Math.max(0, base.getHours() - 1), 0, 0, 0)
        if (e.key === "ArrowDown") base.setHours(Math.min(23, base.getHours() + 1), 0, 0, 0)
      }

      setHoveredDate(base)
      calendar.setCurrentDate(base)
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [calendar.viewMode, calendar.currentDate, hoveredDate, focusedDate])

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setSelectedEvent(undefined)
    setIsModalOpen(true)
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setSelectedDate(undefined)
    setIsModalOpen(true)
  }

  const handleTimeSlotClick = (date: Date) => {
    setSelectedDate(date)
    setSelectedEvent(undefined)
    setIsModalOpen(true)
  }

  const handleSaveEvent = (event: CalendarEvent) => {
    if (selectedEvent) {
      calendar.updateEvent(event.id, event)
    } else {
      calendar.addEvent(event)
    }
  }

  const handleDeleteEvent = (id: string) => {
    calendar.deleteEvent(id)
  }

  const handlePrevious = () => {
    const newDate = new Date(calendar.currentDate)
    if (calendar.viewMode === "month") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setDate(newDate.getDate() - 7)
    }
    calendar.setCurrentDate(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(calendar.currentDate)
    if (calendar.viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + 1)
    } else {
      newDate.setDate(newDate.getDate() + 7)
    }
    calendar.setCurrentDate(newDate)
  }

  const handleToday = () => {
    calendar.setCurrentDate(new Date())
  }

  const handleEventDragStart = (event: CalendarEvent) => {
    setDraggedEvent(event)
  }

  const handleEventDragEnd = () => {
    setDraggedEvent(undefined)
  }

  const handleDropOnDate = (date: Date) => {
    if (!draggedEvent) return

    const duration = draggedEvent.endDate.getTime() - draggedEvent.startDate.getTime()
    const newEndDate = new Date(date.getTime() + duration)

    calendar.updateEvent(draggedEvent.id, {
      startDate: date,
      endDate: newEndDate,
    })

    setDraggedEvent(undefined)
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Calendar</h1>
          <p className="text-muted-foreground">Manage your events and schedule</p>
        </div>

        <Card className="p-6">
          <CalendarHeader
            currentDate={calendar.currentDate}
            viewMode={calendar.viewMode}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onToday={handleToday}
            onViewChange={calendar.setViewMode}
            onGoToDate={(date) => {
              setFocusedDate(date)
              calendar.setCurrentDate(date)
            }}
          />

          {calendar.viewMode === "month" ? (
            <MonthView
              currentDate={calendar.currentDate}
              events={calendar.events}
              onDayClick={handleDayClick}
              onEventClick={handleEventClick}
              onEventDragStart={handleEventDragStart}
              onEventDragEnd={handleEventDragEnd}
              onDropOnDate={handleDropOnDate}
              draggedEvent={draggedEvent}
              focusedDate={focusedDate}
              hoveredDate={hoveredDate}
              onHoverDate={setHoveredDate}
            />
          ) : (
            <WeekView
              currentDate={calendar.currentDate}
              events={calendar.events}
              onEventClick={handleEventClick}
              onTimeSlotClick={handleTimeSlotClick}
              onEventDragStart={handleEventDragStart}
              onEventDragEnd={handleEventDragEnd}
              onDropOnDate={handleDropOnDate}
              draggedEvent={draggedEvent}
              focusedDate={focusedDate}
              hoveredDate={hoveredDate}
              onHoverDate={setHoveredDate}
            />
          )}
        </Card>

        <EventModal
          isOpen={isModalOpen}
          event={selectedEvent}
          initialDate={selectedDate}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedEvent(undefined)
            setSelectedDate(undefined)
          }}
        />
      </div>
    </main>
  )
}
